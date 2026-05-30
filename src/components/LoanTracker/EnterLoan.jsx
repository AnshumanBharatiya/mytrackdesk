import React, { useEffect, useState } from "react";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";
import { HandCoins, Save, TrendingDown, TrendingUp } from "lucide-react";
import { auth, db } from "../../firebase";

const label = "block text-[11px] font-semibold tracking-wide uppercase text-[#475569] mb-2";
const input =
  "w-full bg-surface border border-white/[0.07] rounded-lg px-3.5 py-2.5 text-[14px] text-[#e2e8f0] outline-none focus:border-purple/60 transition-colors";
const secondary = "bg-white/[0.04] border border-white/[0.07] text-[#94a3b8] font-medium text-[14px] py-2.5 px-5 rounded-lg hover:bg-white/[0.07]";

export default function EnterLoan() {
  const [type, setType] = useState("borrowed");
  const [amount, setAmount] = useState("");
  const [personName, setPersonName] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [userCategories, setUserCategories] = useState([]);
  const [personSuggestions, setPersonSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const q = query(collection(db, "loans"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const categories = new Set(["Personal Loan"]);
      const persons = new Set();
      snapshot.forEach((item) => {
        const data = item.data();
        if (data.type === type) categories.add(data.category);
        if (data.personName) persons.add(data.personName);
      });
      setUserCategories(Array.from(categories).sort());
      setPersonSuggestions(Array.from(persons).sort());
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const resetForm = () => {
    setAmount("");
    setPersonName("");
    setCategory("");
    setNewCategory("");
    setDescription("");
    setDueDate("");
    setDate(new Date().toISOString().split("T")[0]);
    setShowNewCategory(false);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return toast.error("Please enter a valid amount!");
    if (!personName.trim()) return toast.error("Please enter a person's name!");
    const finalCategory = showNewCategory ? newCategory.trim() : category;
    if (!finalCategory) return toast.error("Please select or enter a category!");
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return toast.error("You must be logged in!");
      await addDoc(collection(db, "loans"), {
        userId: user.uid,
        type,
        amount: parseFloat(amount),
        personName: personName.trim(),
        category: finalCategory,
        description: description.trim(),
        date,
        dueDate: dueDate || null,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      toast.success("Loan transaction added successfully!");
      resetForm();
      fetchUserData();
    } catch (error) {
      console.error("Error saving loan:", error);
      toast.error("Failed to save transaction!");
    } finally {
      setLoading(false);
    }
  };

  const filteredSuggestions = personSuggestions.filter((person) => person.toLowerCase().includes(personName.toLowerCase()));

  const typeButton = (value, Icon, text) => (
    <button
      type="button"
      onClick={() => {
        setType(value);
        setCategory("");
      }}
      className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold transition-colors ${
        type === value ? "bg-purple text-white" : "bg-white/[0.04] text-[#94a3b8] hover:bg-white/[0.07]"
      }`}
    >
      <Icon size={16} />
      {text}
    </button>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-amber/10 text-amber flex items-center justify-center">
            <HandCoins size={22} />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-[#e2e8f0]">Add Loan Transaction</h1>
            <p className="text-[13px] text-[#475569] mt-1">Track borrowed and lent money.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={label}>Transaction Type</label>
            <div className="grid grid-cols-2 gap-3">
              {typeButton("borrowed", TrendingDown, "I Borrowed")}
              {typeButton("lent", TrendingUp, "I Lent")}
            </div>
          </div>

          <div className="relative">
            <label className={label}>Person Name</label>
            <input
              value={personName}
              onChange={(e) => {
                setPersonName(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onFocus={() => setShowSuggestions(personName.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Enter person's name"
              className={input}
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-surface border border-white/[0.07] rounded-lg max-h-48 overflow-y-auto">
                {filteredSuggestions.map((person) => (
                  <button key={person} type="button" onClick={() => setPersonName(person)} className="w-full text-left px-3.5 py-2.5 text-[14px] text-[#e2e8f0] hover:bg-white/[0.04]">
                    {person}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={label}>Amount</label>
              <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className={input} />
            </div>
            <div>
              <label className={label}>Transaction Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={input} />
            </div>
          </div>

          <div>
            <label className={label}>Category</label>
            {!showNewCategory ? (
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
                className={input}
              >
                <option value="">Select a category</option>
                {userCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                <option value="new">+ Create New Category</option>
              </select>
            ) : (
              <div className="flex gap-2">
                <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Enter new category" className={input} />
                <button type="button" onClick={() => setShowNewCategory(false)} className={secondary}>Cancel</button>
              </div>
            )}
          </div>

          <div>
            <label className={label}>Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className={input} />
          </div>

          <div>
            <label className={label}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add notes about this transaction" rows="4" className={`${input} resize-none`} />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-purple text-white font-semibold text-[14px] py-2.5 rounded-lg hover:opacity-85 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50">
            <Save size={18} />
            <span>{loading ? "Saving..." : `Add ${type === "borrowed" ? "Borrowed" : "Lent"} Amount`}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
