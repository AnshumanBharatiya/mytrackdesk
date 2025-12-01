// components/LoanTracker/LoanHistory.jsx
import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase";
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { Filter, Calendar, Trash2, Edit, HandCoins, TrendingUp, TrendingDown } from "lucide-react";
import Swal from 'sweetalert2';
import Pagination from '../common/Pagination';

export default function LoanHistory() {
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterPerson, setFilterPerson] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [persons, setPersons] = useState([]);
  const [categories, setCategories] = useState([]);

  // Edit Modal
  const [editModal, setEditModal] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [editForm, setEditForm] = useState({
    type: "",
    amount: "",
    personName: "",
    category: "",
    date: "",
    dueDate: "",
    description: ""
  });

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

      const q = query(
        collection(db, "loans"),
        where("userId", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);
      const data = [];
      const personSet = new Set();
      const categorySet = new Set();
      
      querySnapshot.forEach((doc) => {
        const loan = { id: doc.id, ...doc.data() };
        data.push(loan);
        personSet.add(loan.personName);
        categorySet.add(loan.category);
      });

      data.sort((a, b) => new Date(b.date) - new Date(a.date));

      setLoans(data);
      setFilteredLoans(data);
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

    if (filterType !== "all") {
      filtered = filtered.filter(l => l.type === filterType);
    }

    if (filterPerson !== "all") {
      filtered = filtered.filter(l => l.personName === filterPerson);
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter(l => l.category === filterCategory);
    }

    if (startDate) {
      filtered = filtered.filter(l => l.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(l => l.date <= endDate);
    }

    setFilteredLoans(filtered);
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setFilterType("all");
    setFilterPerson("all");
    setFilterCategory("all");
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to delete this loan transaction?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "loans", id));
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Loan transaction has been deleted.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      
        fetchLoans();
      } catch (error) {
        console.error("Error deleting loan:", error);
        
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete transaction.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  const handleEdit = (loan) => {
    setEditingLoan(loan);
    setEditForm({
      type: loan.type,
      amount: loan.amount,
      personName: loan.personName,
      category: loan.category,
      date: loan.date,
      dueDate: loan.dueDate || "",
      description: loan.description || ""
    });
    setEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editForm.amount || !editForm.personName || !editForm.category || !editForm.date) {
      toast.error("Please fill all required fields!");
      return;
    }

    try {
      await updateDoc(doc(db, "loans", editingLoan.id), {
        type: editForm.type,
        amount: parseFloat(editForm.amount),
        personName: editForm.personName.trim(),
        category: editForm.category,
        date: editForm.date,
        dueDate: editForm.dueDate || null,
        description: editForm.description
      });

      toast.success("Transaction updated successfully! ✅");
      setEditModal(false);
      setEditingLoan(null);
      fetchLoans();
    } catch (error) {
      console.error("Error updating loan:", error);
      toast.error("Failed to update transaction!");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  // Pagination
  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLoans = filteredLoans.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Loan Transaction History
        </h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${
            showFilters
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
              : "bg-white text-blue-600 border-2 border-blue-200"
          }`}
        >
          <Filter size={18} />
          <span>Filters</span>
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100 animate-fadeIn">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Filter Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full border-2 border-blue-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="borrowed">Borrowed</option>
                <option value="lent">Lent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Person</label>
              <select
                value={filterPerson}
                onChange={(e) => setFilterPerson(e.target.value)}
                className="w-full border-2 border-blue-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Persons</option>
                {persons.map(person => (
                  <option key={person} value={person}>{person}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full border-2 border-blue-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border-2 border-blue-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border-2 border-blue-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              Showing <span className="font-bold text-blue-600">{filteredLoans.length}</span> of{" "}
              <span className="font-bold">{loans.length}</span> transactions
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all transform hover:scale-105 font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {filteredLoans.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center border border-blue-100">
          <HandCoins className="mx-auto text-gray-400 mb-4" size={60} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Loan Transactions Yet</h2>
          <p className="text-gray-600">Start by adding your first loan transaction!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-blue-100">
          <h2 className="text-2xl font-bold p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            All Transactions
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Person</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {currentLoans.map((loan, index) => (
                  <tr 
                    key={loan.id} 
                    className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-blue-500" />
                        <span>{formatDate(loan.date)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        loan.type === 'borrowed' 
                          ? 'bg-orange-100 text-orange-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {loan.type === 'borrowed' ? <TrendingDown size={14} className="mr-1" /> : <TrendingUp size={14} className="mr-1" />}
                        {loan.type === 'borrowed' ? 'Borrowed' : 'Lent'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {loan.personName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {loan.category}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">
                      <span className={loan.type === 'borrowed' ? 'text-orange-600' : 'text-green-600'}>
                        ₹{loan.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {loan.dueDate ? formatDate(loan.dueDate) : <span className="text-gray-400 italic">No due date</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {loan.description || <span className="text-gray-400 italic">No description</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(loan)}
                          className="text-blue-500 hover:text-blue-700 hover:scale-110 transition-all transform"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(loan.id)}
                          className="text-red-500 hover:text-red-700 hover:scale-110 transition-all transform"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={filteredLoans.length}
            maxVisiblePages={7}
          />
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl transform scale-100 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Edit Loan Transaction
            </h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Type</label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                  className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="borrowed">Borrowed</option>
                  <option value="lent">Lent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Person Name</label>
                <input
                  type="text"
                  value={editForm.personName}
                  onChange={(e) => setEditForm({...editForm, personName: e.target.value})}
                  className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter person's name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                  className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Category</label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                  className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Date</label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                  className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Due Date</label>
                <input
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm({...editForm, dueDate: e.target.value})}
                  className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Enter description (optional)"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-medium"
                >
                  Update Transaction
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditModal(false);
                    setEditingLoan(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition-all duration-200 transform hover:scale-105 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}