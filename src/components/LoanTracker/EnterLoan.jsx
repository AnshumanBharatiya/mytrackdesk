// components/LoanTracker/EnterLoan.jsx
import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";
import { HandCoins, TrendingUp, TrendingDown, Save } from "lucide-react";

export default function EnterLoan() {
  const [type, setType] = useState("borrowed"); // borrowed (I took) or lent (I gave)
  const [amount, setAmount] = useState("");
  const [personName, setPersonName] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [userCategories, setUserCategories] = useState([]);
  const [personSuggestions, setPersonSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Default categories
  const defaultCategories = {
    borrowed: "Personal Loan",
    lent: "Personal Loan"
  };

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "loans"),
        where("userId", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);
      const categories = new Set();
      const persons = new Set();
      
      // Add default category
      categories.add(defaultCategories[type]);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.type === type) {
          categories.add(data.category);
        }
        persons.add(data.personName);
      });

      setUserCategories(Array.from(categories).sort());
      setPersonSuggestions(Array.from(persons).sort());
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handlePersonNameChange = (value) => {
    setPersonName(value);
    setShowSuggestions(value.length > 0);
  };

  const selectPerson = (name) => {
    setPersonName(name);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      return toast.error("Please enter a valid amount!");
    }

    if (!personName.trim()) {
      return toast.error("Please enter a person's name!");
    }

    const finalCategory = showNewCategory ? newCategory.trim() : category;
    if (!finalCategory) {
      return toast.error("Please select or enter a category!");
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("You must be logged in!");
        return;
      }

      const loanData = {
        userId: user.uid,
        type: type, // borrowed or lent
        amount: parseFloat(amount),
        personName: personName.trim(),
        category: finalCategory,
        description: description.trim(),
        date: date,
        dueDate: dueDate || null,
        status: "pending", // pending or settled
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "loans"), loanData);
      toast.success(`${type === 'borrowed' ? 'Borrowed amount' : 'Lent amount'} added successfully! 🎉`);
      
      // Reset form
      resetForm();
      
      // Refresh data
      fetchUserData();
    } catch (error) {
      console.error("Error saving loan:", error);
      toast.error("Failed to save transaction!");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount("");
    setPersonName("");
    setCategory("");
    setNewCategory("");
    setDescription("");
    setDueDate("");
    setDate(new Date().toISOString().split('T')[0]);
    setShowNewCategory(false);
    setShowSuggestions(false);
  };

  const filteredSuggestions = personSuggestions.filter(person =>
    person.toLowerCase().includes(personName.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 border border-blue-100">
        <div className="flex items-center space-x-4 mb-8">
          <div className={`w-16 h-16 ${
            type === 'borrowed' ? 'bg-gradient-to-br from-orange-500 to-red-600' : 
            'bg-gradient-to-br from-green-500 to-emerald-600'
          } rounded-2xl flex items-center justify-center shadow-lg`}>
            <HandCoins className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Add Loan Transaction
            </h1>
            <p className="text-gray-500 text-sm mt-1">Track borrowed & lent money</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-700">Transaction Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setType("borrowed");
                  setCategory("");
                  fetchUserData();
                }}
                className={`flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold transition-all ${
                  type === "borrowed"
                    ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <TrendingDown size={18} />
                <span className="text-sm">I Borrowed</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setType("lent");
                  setCategory("");
                  fetchUserData();
                }}
                className={`flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold transition-all ${
                  type === "lent"
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <TrendingUp size={18} />
                <span className="text-sm">I Lent</span>
              </button>
            </div>
          </div>

          {/* Person Name with Autocomplete */}
          <div className="relative">
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Person Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={personName}
              onChange={(e) => handlePersonNameChange(e.target.value)}
              onFocus={() => setShowSuggestions(personName.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Enter person's name"
              className="w-full border-2 border-blue-200 rounded-xl px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white border-2 border-blue-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                {filteredSuggestions.map((person, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectPerson(person)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-all border-b border-gray-100 last:border-b-0"
                  >
                    {person}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full border-2 border-blue-200 rounded-xl px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Transaction Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border-2 border-blue-200 rounded-xl px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            {!showNewCategory ? (
              <div className="space-y-3">
                <select
                  value={category}
                  onChange={(e) => {
                    if (e.target.value === "new") {
                      setShowNewCategory(true);
                      setCategory("");
                    } else {
                      setCategory(e.target.value);
                    }
                  }}
                  className="w-full border-2 border-blue-200 rounded-xl px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">Select a category</option>
                  {userCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="new">+ Create New Category</option>
                </select>
                <p className="text-xs text-gray-500">💡 Examples: Bank Loan, Personal Loan, Credit, Gift, Repayment</p>
              </div>
            ) : (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter new category name"
                  className="flex-1 border-2 border-blue-200 rounded-xl px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategory(false);
                    setNewCategory("");
                  }}
                  className="px-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Due Date <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border-2 border-blue-200 rounded-xl px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Description <span className="text-gray-400">(Optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes about this transaction..."
              rows="4"
              className="w-full border-2 border-blue-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 font-semibold text-lg flex items-center justify-center space-x-2 ${
              type === "borrowed"
                ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                : "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
            }`}
          >
            <Save size={20} />
            <span>{loading ? "Saving..." : `Add ${type === 'borrowed' ? 'Borrowed' : 'Lent'} Amount`}</span>
          </button>
        </form>
      </div>
    </div>
  );
}