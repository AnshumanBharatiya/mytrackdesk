import React, { useEffect, useState } from "react";
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { DollarSign, Save, TrendingDown, TrendingUp } from "lucide-react";
import { auth, db } from "../../firebase";

const label = "block text-[11px] font-semibold tracking-wide uppercase text-[#475569] mb-2";
const input =
  "w-full bg-surface border border-white/[0.07] rounded-lg px-3.5 py-2.5 text-[14px] text-[#e2e8f0] outline-none focus:border-purple/60 transition-colors";
const secondary = "bg-white/[0.04] border border-white/[0.07] text-[#94a3b8] font-medium text-[14px] py-2.5 px-5 rounded-lg hover:bg-white/[0.07]";

export default function EnterTransaction() {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [userCategories, setUserCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const defaultCategories = { income: "Salary", expense: "Rent", investment: "SIP" };

  useEffect(() => {
    fetchUserCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const fetchUserCategories = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const q = query(collection(db, "transactions"), where("userId", "==", user.uid), where("type", "==", type));
      const snapshot = await getDocs(q);
      const categories = new Set([defaultCategories[type]]);
      snapshot.forEach((item) => categories.add(item.data().category));
      setUserCategories(Array.from(categories).sort());
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const resetForm = () => {
    setAmount("");
    setCategory("");
    setNewCategory("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setShowNewCategory(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return toast.error("Please enter a valid amount!");
    const finalCategory = showNewCategory ? newCategory.trim() : category;
    if (!finalCategory) return toast.error("Please select or enter a category!");
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return toast.error("You must be logged in!");
      const transactionData = {
        userId: user.uid,
        type,
        amount: parseFloat(amount),
        category: finalCategory,
        description: description.trim(),
        date,
        createdAt: serverTimestamp(),
      };
      if (editingId) {
        await updateDoc(doc(db, "transactions", editingId), transactionData);
        toast.success("Transaction updated successfully!");
      } else {
        await addDoc(collection(db, "transactions"), transactionData);
        toast.success("Transaction added successfully!");
      }
      resetForm();
      fetchUserCategories();
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast.error("Failed to save transaction!");
    } finally {
      setLoading(false);
    }
  };

  window.editTransaction = (transaction) => {
    setType(transaction.type);
    setAmount(transaction.amount.toString());
    setCategory(transaction.category);
    setDescription(transaction.description || "");
    setDate(transaction.date);
    setEditingId(transaction.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const typeButton = (value, Icon, text) => (
    <button
      type="button"
      onClick={() => {
        setType(value);
        setCategory("");
      }}
      disabled={editingId}
      className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold transition-colors ${
        type === value ? "bg-purple text-white" : "bg-white/[0.04] text-[#94a3b8] hover:bg-white/[0.07]"
      } ${editingId ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <Icon size={16} />
      {text}
    </button>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-purple/10 text-purple flex items-center justify-center">
            <DollarSign size={22} />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-[#e2e8f0]">{editingId ? "Edit Transaction" : "Add Transaction"}</h1>
            <p className="text-[13px] text-[#475569] mt-1">Track income, expenses, and investments.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={label}>Transaction Type</label>
            <div className="grid grid-cols-3 gap-3">
              {typeButton("expense", TrendingDown, "Expense")}
              {typeButton("income", TrendingUp, "Income")}
              {typeButton("investment", Save, "Investment")}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={label}>Amount</label>
              <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className={input} />
            </div>
            <div>
              <label className={label}>Date</label>
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
            <label className={label}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add notes about this transaction" rows="4" className={`${input} resize-none`} />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="flex-1 bg-purple text-white font-semibold text-[14px] py-2.5 rounded-lg hover:opacity-85 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50">
              <Save size={18} />
              <span>{loading ? "Saving..." : editingId ? "Update Transaction" : "Save Transaction"}</span>
            </button>
            {editingId && <button type="button" onClick={resetForm} className={secondary}>Cancel</button>}
          </div>
        </form>
      </div>
    </div>
  );
}
