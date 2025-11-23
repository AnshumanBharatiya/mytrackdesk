// components/ExpenseTracker/TransactionHistory.jsx - Fixed with Edit Modal and Date Format
import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase";
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { Filter, Calendar, Trash2, TrendingUp, TrendingDown, DollarSign, Edit } from "lucide-react";
import Swal from 'sweetalert2';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, totalInvestment: 0, balance: 0 });
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [categories, setCategories] = useState([]);

  // Edit Modal States
  const [editModal, setEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editForm, setEditForm] = useState({
    type: "",
    amount: "",
    category: "",
    date: "",
    description: ""
  });

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, startDate, endDate, filterType, filterCategory]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "transactions"),
        where("userId", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);
      const data = [];
      const categorySet = new Set();
      
      querySnapshot.forEach((doc) => {
        const transaction = { id: doc.id, ...doc.data() };
        data.push(transaction);
        categorySet.add(transaction.category);
      });

      // Sort by date descending
      data.sort((a, b) => new Date(b.date) - new Date(a.date));

      setTransactions(data);
      setFilteredTransactions(data);
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

    if (filterType !== "all") {
      filtered = filtered.filter(t => t.type === filterType);
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

    if (startDate) {
      filtered = filtered.filter(t => t.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(t => t.date <= endDate);
    }

    setFilteredTransactions(filtered);
    calculateStats(filtered);
  };

  const calculateStats = (data) => {
    const income = data.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const expense = data.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    const investment = data.filter(t => t.type === "investment").reduce((sum, t) => sum + t.amount, 0);
    setStats({
      totalIncome: income,
      totalExpense: expense,
      totalInvestment: investment,
      balance: income - expense - investment
    });
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setFilterType("all");
    setFilterCategory("all");
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Are you sure you want to delete this transaction?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "transactions", id));
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Transaction has been deleted.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      
        fetchTransactions();
      } catch (error) {
        console.error("Error deleting transaction:", error);
        
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete transaction.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setEditForm({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      date: transaction.date,
      description: transaction.description || ""
    });
    setEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editForm.amount || !editForm.category || !editForm.date) {
      toast.error("Please fill all required fields!");
      return;
    }

    try {
      await updateDoc(doc(db, "transactions", editingTransaction.id), {
        type: editForm.type,
        amount: parseFloat(editForm.amount),
        category: editForm.category,
        date: editForm.date,
        description: editForm.description
      });

      toast.success("Transaction updated successfully! ✅");
      setEditModal(false);
      setEditingTransaction(null);
      fetchTransactions();
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Failed to update transaction!");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
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
          Transaction History
        </h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${
            showFilters
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
              : "bg-white text-blue-600 border-2 border-blue-200"
          }`}
        >
          <Filter size={20} />
          <span>Filters</span>
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100 animate-fadeIn">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Filter Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full border-2 border-blue-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="investment">Investment</option>
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
              Showing <span className="font-bold text-blue-600">{filteredTransactions.length}</span> of{" "}
              <span className="font-bold">{transactions.length}</span> transactions
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Income</p>
              <p className="text-3xl font-bold">₹{stats.totalIncome.toFixed(2)}</p>
            </div>
            <TrendingUp size={40} className="opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Expense</p>
              <p className="text-3xl font-bold">₹{stats.totalExpense.toFixed(2)}</p>
            </div>
            <TrendingDown size={40} className="opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Investment</p>
              <p className="text-3xl font-bold">₹{stats.totalInvestment.toFixed(2)}</p>
            </div>
            <DollarSign size={40} className="opacity-80" />
          </div>
        </div>
        <div className={`bg-gradient-to-br ${stats.balance >= 0 ? 'from-purple-500 to-pink-600' : 'from-orange-500 to-red-600'} rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Balance</p>
              <p className="text-3xl font-bold">₹{stats.balance.toFixed(2)}</p>
            </div>
            <DollarSign size={40} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Table */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center border border-blue-100">
          <DollarSign className="mx-auto text-gray-400 mb-4" size={60} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Transactions Yet</h2>
          <p className="text-gray-600">Start by adding your first income or expense!</p>
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
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {filteredTransactions.map((transaction, index) => (
                  <tr 
                    key={transaction.id} 
                    className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-blue-500" />
                        <span>{formatDate(transaction.date)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 text-green-800' 
                          : transaction.type === 'expense'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {transaction.type === 'income' ? <TrendingUp size={14} className="mr-1" /> : 
                         transaction.type === 'investment' ? <DollarSign size={14} className="mr-1" /> :
                         <TrendingDown size={14} className="mr-1" />}
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      {transaction.category}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">
                      <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {transaction.description || <span className="text-gray-400 italic">No description</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="text-blue-500 hover:text-blue-700 hover:scale-110 transition-all transform"
                          title="Edit"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="text-red-500 hover:text-red-700 hover:scale-110 transition-all transform"
                          title="Delete"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl transform scale-100 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Edit Transaction
            </h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Type</label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                  className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="investment">Investment</option>
                </select>
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
                    setEditingTransaction(null);
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