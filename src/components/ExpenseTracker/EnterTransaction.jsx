// components/ExpenseTracker/EnterTransaction.jsx
import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { DollarSign, Plus, TrendingUp, TrendingDown, Save } from "lucide-react";

export default function EnterTransaction() {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [userCategories, setUserCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Default categories - only one per type
  const defaultCategories = {
    income: "Salary",
    expense: "Rent",
    investment: "SIP"
  };

  useEffect(() => {
    fetchUserCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const fetchUserCategories = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "transactions"),
        where("userId", "==", user.uid),
        where("type", "==", type)
      );

      const querySnapshot = await getDocs(q);
      const categories = new Set();
      
      // Add default category
      categories.add(defaultCategories[type]);
      
      // Add user's categories
      querySnapshot.forEach((doc) => {
        categories.add(doc.data().category);
      });

      setUserCategories(Array.from(categories).sort());
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      return toast.error("Please enter a valid amount!");
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

      const transactionData = {
        userId: user.uid,
        type: type,
        amount: parseFloat(amount),
        category: finalCategory,
        description: description.trim(),
        date: date,
        createdAt: serverTimestamp(),
      };

      if (editingId) {
        // Update existing transaction
        await updateDoc(doc(db, "transactions", editingId), transactionData);
        toast.success("Transaction updated successfully! ✅");
        setEditingId(null);
      } else {
        // Add new transaction
        await addDoc(collection(db, "transactions"), transactionData);
        toast.success(`${type === 'expense' ? 'Expense' : type === 'income' ? 'Income' : 'Investment'} added successfully! 🎉`);
      }
      
      // Reset form
      resetForm();
      
      // Refresh categories
      fetchUserCategories();
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast.error("Failed to save transaction!");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount("");
    setCategory("");
    setNewCategory("");
    setDescription("");
    setDate(new Date().toISOString().split('T')[0]);
    setShowNewCategory(false);
    setEditingId(null);
  };

  // Function to load transaction for editing
  window.editTransaction = (transaction) => {
    setType(transaction.type);
    setAmount(transaction.amount.toString());
    setCategory(transaction.category);
    setDescription(transaction.description || "");
    setDate(transaction.date);
    setEditingId(transaction.id);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info("Editing transaction - Update the fields and save");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 border border-blue-100">
        <div className="flex items-center space-x-4 mb-8">
          <div className={`w-16 h-16 ${
            type === 'expense' ? 'bg-gradient-to-br from-red-500 to-pink-600' : 
            type === 'income' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
            'bg-gradient-to-br from-blue-500 to-indigo-600'
          } rounded-2xl flex items-center justify-center shadow-lg`}>
            <DollarSign className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {editingId ? "Edit Transaction" : "Add Transaction"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">Track your income, expenses & investments</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selection - 3 Options */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-700">Transaction Type</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setType("expense");
                  setCategory("");
                  fetchUserCategories();
                }}
                disabled={editingId}
                className={`flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold transition-all ${
                  type === "expense"
                    ? "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                } ${editingId ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <TrendingDown size={18} />
                <span className="text-sm">Expense</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setType("income");
                  setCategory("");
                  fetchUserCategories();
                }}
                disabled={editingId}
                className={`flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold transition-all ${
                  type === "income"
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                } ${editingId ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <TrendingUp size={18} />
                <span className="text-sm">Income</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setType("investment");
                  setCategory("");
                  fetchUserCategories();
                }}
                disabled={editingId}
                className={`flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold transition-all ${
                  type === "investment"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                } ${editingId ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Save size={18} />
                <span className="text-sm">Investment</span>
              </button>
            </div>
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
              <label className="block text-sm font-semibold mb-2 text-gray-700">Date</label>
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
                <p className="text-xs text-gray-500">💡 Only your categories are shown</p>
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
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-4 rounded-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 font-semibold text-lg flex items-center justify-center space-x-2 ${
                type === "expense"
                  ? "bg-gradient-to-r from-red-500 to-pink-600 text-white"
                  : type === "income"
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
              }`}
            >
              <Save size={20} />
              <span>{loading ? "Saving..." : editingId ? "Update Transaction" : `Add ${type === 'expense' ? 'Expense' : type === 'income' ? 'Income' : 'Investment'}`}</span>
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all transform hover:scale-105 font-semibold"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}