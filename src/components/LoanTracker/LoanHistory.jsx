/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { toast } from "react-toastify";
import { Calendar, Edit, Filter, HandCoins, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import Pagination from "../common/Pagination";
import { auth, db } from "../../firebase";

const input = "w-full bg-surface border border-white/[0.07] rounded-lg px-3.5 py-2.5 text-[14px] text-[#e2e8f0] outline-none focus:border-purple/60 transition-colors";
const label = "block text-[11px] font-semibold tracking-wide uppercase text-[#475569] mb-2";
const th = "px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#475569] border-b border-white/[0.07]";
const td = "px-4 py-3 text-[#e2e8f0] border-b border-white/[0.07]";

export default function LoanHistory() {
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterPerson, setFilterPerson] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [persons, setPersons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [editForm, setEditForm] = useState({ type: "", amount: "", personName: "", category: "", date: "", dueDate: "", description: "" });

  useEffect(() => {
    fetchLoans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    applyFilters();
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loans, startDate, endDate, filterType, filterPerson, filterCategory]);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const snapshot = await getDocs(query(collection(db, "loans"), where("userId", "==", user.uid)));
      const data = [];
      const personSet = new Set();
      const categorySet = new Set();
      snapshot.forEach((item) => {
        const loan = { id: item.id, ...item.data() };
        data.push(loan);
        personSet.add(loan.personName);
        categorySet.add(loan.category);
      });
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setLoans(data);
      setPersons(Array.from(personSet));
      setCategories(Array.from(categorySet));
    } catch (error) {
      console.log("Error fetching loans:", error);
      toast.error("Failed to load transactions!");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...loans];
    if (filterType !== "all") filtered = filtered.filter((l) => l.type === filterType);
    if (filterPerson !== "all") filtered = filtered.filter((l) => l.personName === filterPerson);
    if (filterCategory !== "all") filtered = filtered.filter((l) => l.category === filterCategory);
    if (startDate) filtered = filtered.filter((l) => l.date >= startDate);
    if (endDate) filtered = filtered.filter((l) => l.date <= endDate);
    setFilteredLoans(filtered);
  };

  const clearFilters = () => { setStartDate(""); setEndDate(""); setFilterType("all"); setFilterPerson("all"); setFilterCategory("all"); };

  const handleDelete = async (id) => {
    const result = await Swal.fire({ title: "Are you sure?", text: "Do you want to delete this loan transaction?", icon: "warning", showCancelButton: true, confirmButtonColor: "#f87171", cancelButtonColor: "#475569", confirmButtonText: "Yes, delete it!" });
    if (result.isConfirmed) {
      await deleteDoc(doc(db, "loans", id));
      fetchLoans();
    }
  };

  const handleEdit = (loan) => {
    setEditingLoan(loan);
    setEditForm({ type: loan.type, amount: loan.amount, personName: loan.personName, category: loan.category, date: loan.date, dueDate: loan.dueDate || "", description: loan.description || "" });
    setEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.amount || !editForm.personName || !editForm.category || !editForm.date) return toast.error("Please fill all required fields!");
    await updateDoc(doc(db, "loans", editingLoan.id), { ...editForm, amount: parseFloat(editForm.amount), dueDate: editForm.dueDate || null });
    toast.success("Transaction updated successfully!");
    setEditModal(false);
    setEditingLoan(null);
    fetchLoans();
  };

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString("en-GB") : "N/A";
  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
  const currentLoans = filteredLoans.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-[3px] border-white/[0.07] border-t-purple animate-spin mx-auto" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div><h1 className="text-[22px] font-bold text-[#e2e8f0]">Loan Transaction History</h1><p className="text-[13px] text-[#475569] mt-1">Review and edit borrowed or lent records.</p></div>
        <button onClick={() => setShowFilters(!showFilters)} className="bg-white/[0.04] border border-white/[0.07] text-[#94a3b8] font-medium text-[14px] py-2.5 px-5 rounded-lg hover:bg-white/[0.07] flex items-center gap-2"><Filter size={16} /> Filters</button>
      </div>

      {showFilters && <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-6"><div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div><label className={label}>Type</label><select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={input}><option value="all">All Types</option><option value="borrowed">Borrowed</option><option value="lent">Lent</option></select></div>
        <div><label className={label}>Person</label><select value={filterPerson} onChange={(e) => setFilterPerson(e.target.value)} className={input}><option value="all">All Persons</option>{persons.map((p) => <option key={p} value={p}>{p}</option>)}</select></div>
        <div><label className={label}>Category</label><select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={input}><option value="all">All Categories</option>{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
        <div><label className={label}>Start Date</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={input} /></div>
        <div><label className={label}>End Date</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={input} /></div>
      </div><button onClick={clearFilters} className="mt-4 bg-white/[0.04] border border-white/[0.07] text-[#94a3b8] font-medium text-[14px] py-2.5 px-5 rounded-lg hover:bg-white/[0.07]">Clear Filters</button></div>}

      {!filteredLoans.length ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white/[0.04] border border-white/[0.07] rounded-xl"><HandCoins size={40} color="#475569" /><p className="text-[14px] text-[#475569] mt-3">No loan transactions yet.</p></div>
      ) : (
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="px-4 py-3 text-[15px] font-semibold text-[#e2e8f0] border-b border-white/[0.07]">All Transactions</div>
          <div className="overflow-x-auto"><table className="w-full text-[13px] border-collapse"><thead className="bg-surface"><tr>{["Date", "Type", "Person", "Category", "Amount", "Due Date", "Description", "Action"].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead><tbody>
            {currentLoans.map((loan) => <tr key={loan.id} className="hover:bg-white/[0.04]">
              <td className={td}><span className="flex items-center gap-2"><Calendar size={15} className="text-blue" />{formatDate(loan.date)}</span></td>
              <td className={td}><span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${loan.type === "borrowed" ? "bg-red/10 text-red" : "bg-blue/10 text-blue"}`}>{loan.type === "borrowed" ? "Borrowed" : "Lent"}</span></td>
              <td className={td}>{loan.personName}</td>
              <td className={td}>{loan.category}</td>
              <td className={td}><span className={loan.type === "borrowed" ? "text-red" : "text-blue"}>Rs {loan.amount.toFixed(2)}</span></td>
              <td className={td}>{loan.dueDate ? formatDate(loan.dueDate) : <span className="text-[#475569]">No due date</span>}</td>
              <td className={`${td} max-w-xs truncate`}>{loan.description || <span className="text-[#475569]">No description</span>}</td>
              <td className={td}><div className="flex gap-2"><button onClick={() => handleEdit(loan)} className="p-1.5 rounded-md text-[#475569] hover:bg-white/[0.07] hover:text-blue transition-colors"><Edit size={16} /></button><button onClick={() => handleDelete(loan.id)} className="p-1.5 rounded-md text-[#475569] hover:bg-red/10 hover:text-red transition-colors"><Trash2 size={16} /></button></div></td>
            </tr>)}
          </tbody></table></div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={itemsPerPage} totalItems={filteredLoans.length} maxVisiblePages={7} />
        </div>
      )}

      {editModal && <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"><div className="bg-elevated border border-white/[0.07] rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"><h2 className="text-[18px] font-bold mb-5 text-[#e2e8f0]">Edit Loan Transaction</h2><form onSubmit={handleEditSubmit} className="space-y-4">
        <div><label className={label}>Type</label><select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })} className={input}><option value="borrowed">Borrowed</option><option value="lent">Lent</option></select></div>
        <div><label className={label}>Person Name</label><input value={editForm.personName} onChange={(e) => setEditForm({ ...editForm, personName: e.target.value })} className={input} /></div>
        <div><label className={label}>Amount</label><input type="number" step="0.01" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} className={input} /></div>
        <div><label className={label}>Category</label><input value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className={input} /></div>
        <div><label className={label}>Date</label><input type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} className={input} /></div>
        <div><label className={label}>Due Date</label><input type="date" value={editForm.dueDate} onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })} className={input} /></div>
        <div><label className={label}>Description</label><textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows="3" className={input} /></div>
        <div className="flex gap-3 pt-2"><button type="submit" className="flex-1 bg-purple text-white font-semibold text-[14px] py-2.5 rounded-lg hover:opacity-85">Update</button><button type="button" onClick={() => setEditModal(false)} className="flex-1 bg-white/[0.04] border border-white/[0.07] text-[#94a3b8] font-medium text-[14px] py-2.5 rounded-lg hover:bg-white/[0.07]">Cancel</button></div>
      </form></div></div>}
    </div>
  );
}
