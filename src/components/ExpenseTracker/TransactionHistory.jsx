/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { toast } from "react-toastify";
import { Calendar, DollarSign, Edit, Filter, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import Swal from "sweetalert2";
import Pagination from "../common/Pagination";
import { auth, db } from "../../firebase";

const input = "w-full bg-surface border border-white/[0.07] rounded-lg px-3.5 py-2.5 text-[14px] text-[#e2e8f0] outline-none focus:border-purple/60 transition-colors";
const label = "block text-[11px] font-semibold tracking-wide uppercase text-[#475569] mb-2";
const card = "bg-white/[0.04] border border-white/[0.07] rounded-xl p-5";
const th = "px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#475569] border-b border-white/[0.07]";
const td = "px-4 py-3 text-[#e2e8f0] border-b border-white/[0.07]";

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, totalInvestment: 0, balance: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editForm, setEditForm] = useState({ type: "", amount: "", category: "", date: "", description: "" });

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    applyFilters();
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, startDate, endDate, filterType, filterCategory]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const snapshot = await getDocs(query(collection(db, "transactions"), where("userId", "==", user.uid)));
      const data = [];
      const categorySet = new Set();
      snapshot.forEach((item) => {
        const transaction = { id: item.id, ...item.data() };
        data.push(transaction);
        categorySet.add(transaction.category);
      });
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(data);
      setCategories(Array.from(categorySet));
      calculateStats(data);
    } catch (error) {
      console.log("Error fetching transactions:", error);
      toast.error("Failed to load transactions!");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];
    if (filterType !== "all") filtered = filtered.filter((t) => t.type === filterType);
    if (filterCategory !== "all") filtered = filtered.filter((t) => t.category === filterCategory);
    if (startDate) filtered = filtered.filter((t) => t.date >= startDate);
    if (endDate) filtered = filtered.filter((t) => t.date <= endDate);
    setFilteredTransactions(filtered);
    calculateStats(filtered);
  };

  const calculateStats = (data) => {
    const totalIncome = data.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = data.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    const totalInvestment = data.filter((t) => t.type === "investment").reduce((sum, t) => sum + t.amount, 0);
    setStats({ totalIncome, totalExpense, totalInvestment, balance: totalIncome - totalExpense - totalInvestment });
  };

  const clearFilters = () => { setStartDate(""); setEndDate(""); setFilterType("all"); setFilterCategory("all"); };

  const handleDelete = async (id) => {
    const result = await Swal.fire({ title: "Are you sure?", text: "Are you sure you want to delete this transaction?", icon: "warning", showCancelButton: true, confirmButtonColor: "#f87171", cancelButtonColor: "#475569", confirmButtonText: "Yes, delete it!" });
    if (result.isConfirmed) {
      await deleteDoc(doc(db, "transactions", id));
      fetchTransactions();
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setEditForm({ type: transaction.type, amount: transaction.amount, category: transaction.category, date: transaction.date, description: transaction.description || "" });
    setEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.amount || !editForm.category || !editForm.date) return toast.error("Please fill all required fields!");
    await updateDoc(doc(db, "transactions", editingTransaction.id), { ...editForm, amount: parseFloat(editForm.amount) });
    toast.success("Transaction updated successfully!");
    setEditModal(false);
    setEditingTransaction(null);
    fetchTransactions();
  };

  const currentTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-[3px] border-white/[0.07] border-t-purple animate-spin mx-auto" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div><h1 className="text-[22px] font-bold text-[#e2e8f0]">Transaction History</h1><p className="text-[13px] text-[#475569] mt-1">Review and edit saved transactions.</p></div>
        <button onClick={() => setShowFilters(!showFilters)} className="bg-white/[0.04] border border-white/[0.07] text-[#94a3b8] font-medium text-[14px] py-2.5 px-5 rounded-lg hover:bg-white/[0.07] flex items-center gap-2"><Filter size={16} /> Filters</button>
      </div>

      {showFilters && <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-6"><div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div><label className={label}>Type</label><select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={input}><option value="all">All Types</option><option value="income">Income</option><option value="expense">Expense</option><option value="investment">Investment</option></select></div>
        <div><label className={label}>Category</label><select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={input}><option value="all">All Categories</option>{categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}</select></div>
        <div><label className={label}>Start Date</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={input} /></div>
        <div><label className={label}>End Date</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={input} /></div>
      </div><button onClick={clearFilters} className="mt-4 bg-white/[0.04] border border-white/[0.07] text-[#94a3b8] font-medium text-[14px] py-2.5 px-5 rounded-lg hover:bg-white/[0.07]">Clear Filters</button></div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[["Total Income", stats.totalIncome, "text-green", TrendingUp], ["Total Expense", stats.totalExpense, "text-red", TrendingDown], ["Total Investment", stats.totalInvestment, "text-blue", DollarSign], ["Balance", stats.balance, stats.balance >= 0 ? "text-purple" : "text-amber", DollarSign]].map(([title, value, color, Icon]) => <div key={title} className={card}><div className="flex items-center justify-between"><div><p className="text-[13px] font-semibold text-[#94a3b8]">{title}</p><p className={`text-[24px] font-bold mt-1 ${color}`}>Rs {Number(value).toFixed(2)}</p></div><Icon size={26} className={color} /></div></div>)}
      </div>

      {!filteredTransactions.length ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white/[0.04] border border-white/[0.07] rounded-xl"><DollarSign size={40} color="#475569" /><p className="text-[14px] text-[#475569] mt-3">No transactions yet.</p></div>
      ) : (
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="px-4 py-3 text-[15px] font-semibold text-[#e2e8f0] border-b border-white/[0.07]">All Transactions</div>
          <div className="overflow-x-auto"><table className="w-full text-[13px] border-collapse"><thead className="bg-surface"><tr>{["Date", "Type", "Category", "Amount", "Description", "Action"].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead><tbody>
            {currentTransactions.map((transaction) => <tr key={transaction.id} className="hover:bg-white/[0.04]">
              <td className={td}><span className="flex items-center gap-2"><Calendar size={15} className="text-blue" />{new Date(transaction.date).toLocaleDateString("en-GB")}</span></td>
              <td className={td}><span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${transaction.type === "income" ? "bg-green/10 text-green" : transaction.type === "expense" ? "bg-amber/10 text-amber" : "bg-blue/10 text-blue"}`}>{transaction.type}</span></td>
              <td className={td}>{transaction.category}</td>
              <td className={td}><span className={transaction.type === "income" ? "text-green" : "text-red"}>{transaction.type === "income" ? "+" : "-"}Rs {transaction.amount.toFixed(2)}</span></td>
              <td className={`${td} max-w-xs truncate`}>{transaction.description || <span className="text-[#475569]">No description</span>}</td>
              <td className={td}><div className="flex gap-2"><button onClick={() => handleEdit(transaction)} className="p-1.5 rounded-md text-[#475569] hover:bg-white/[0.07] hover:text-blue transition-colors"><Edit size={15} /></button><button onClick={() => handleDelete(transaction.id)} className="p-1.5 rounded-md text-[#475569] hover:bg-red/10 hover:text-red transition-colors"><Trash2 size={15} /></button></div></td>
            </tr>)}
          </tbody></table></div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={itemsPerPage} totalItems={filteredTransactions.length} maxVisiblePages={7} />
        </div>
      )}

      {editModal && <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"><div className="bg-elevated border border-white/[0.07] rounded-xl p-6 w-full max-w-md"><h2 className="text-[18px] font-bold mb-5 text-[#e2e8f0]">Edit Transaction</h2><form onSubmit={handleEditSubmit} className="space-y-4">
        <div><label className={label}>Type</label><select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })} className={input}><option value="income">Income</option><option value="expense">Expense</option><option value="investment">Investment</option></select></div>
        <div><label className={label}>Amount</label><input type="number" step="0.01" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} className={input} /></div>
        <div><label className={label}>Category</label><input value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className={input} /></div>
        <div><label className={label}>Date</label><input type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} className={input} /></div>
        <div><label className={label}>Description</label><textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows="3" className={input} /></div>
        <div className="flex gap-3 pt-2"><button type="submit" className="flex-1 bg-purple text-white font-semibold text-[14px] py-2.5 rounded-lg hover:opacity-85">Update</button><button type="button" onClick={() => setEditModal(false)} className="flex-1 bg-white/[0.04] border border-white/[0.07] text-[#94a3b8] font-medium text-[14px] py-2.5 rounded-lg hover:bg-white/[0.07]">Cancel</button></div>
      </form></div></div>}
    </div>
  );
}
