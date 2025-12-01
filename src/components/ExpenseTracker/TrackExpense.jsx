// components/ExpenseTracker/TrackExpense.jsx - Fixed with Clean Pie Charts
import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Filter, TrendingDown, TrendingUp, DollarSign } from "lucide-react";

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#6366f1', '#f97316', '#14b8a6'];

export default function TrackExpense() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ 
    totalIncome: 0, 
    totalExpense: 0, 
    totalInvestment: 0,
    balance: 0,
    expensePercent: 0,
    investmentPercent: 0,
    cashPercent: 0
  });
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, startDate, endDate, filterType, selectedMonth, selectedYear]);

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
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });

      setTransactions(data);
      setFilteredTransactions(data);
      calculateStats(data);
    } catch (error) {
      console.log("Error fetching transactions:", error);
      toast.error("Failed to load data!");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    if (filterType !== "all") {
      filtered = filtered.filter(t => t.type === filterType);
    }

    if (startDate) {
      filtered = filtered.filter(t => t.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(t => t.date <= endDate);
    }

    if (selectedMonth) {
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === parseInt(selectedMonth);
      });
    }

    if (selectedYear) {
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getFullYear() === parseInt(selectedYear);
      });
    }

    setFilteredTransactions(filtered);
    calculateStats(filtered);
  };

  const calculateStats = (data) => {
    const income = data.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const expense = data.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    const investment = data.filter(t => t.type === "investment").reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expense - investment;
    
    const expensePercent = income > 0 ? (expense / income * 100) : 0;
    const investmentPercent = income > 0 ? (investment / income * 100) : 0;
    const cashPercent = income > 0 ? (balance / income * 100) : 0;
    
    setStats({
      totalIncome: income,
      totalExpense: expense,
      totalInvestment: investment,
      balance: balance,
      expensePercent: expensePercent,
      investmentPercent: investmentPercent,
      cashPercent: cashPercent
    });
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setFilterType("all");
    setSelectedMonth(new Date().getMonth().toString());
    setSelectedYear(new Date().getFullYear().toString());
  };

  // Pie Chart 1: Expenses by category
  const expenseByCategory = filteredTransactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const expensePieData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2))
  }));

  // Pie Chart 2: All transaction types
  const allTransactionsPieData = [
    { name: 'Income', value: stats.totalIncome },
    { name: 'Expense', value: stats.totalExpense },
    { name: 'Investment', value: stats.totalInvestment }
  ].filter(item => item.value > 0);

  // Bar Chart data
  const monthlyData = filteredTransactions.reduce((acc, t) => {
    const date = new Date(t.date);
    const month = date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    if (!acc[month]) {
      acc[month] = { month, income: 0, expense: 0, investment: 0 };
    }
    if (t.type === "income") {
      acc[month].income += t.amount;
    } else if (t.type === "expense") {
      acc[month].expense += t.amount;
    } else if (t.type === "investment") {
      acc[month].investment += t.amount;
    }
    return acc;
  }, {});

  const barData = Object.values(monthlyData).slice(-6);

  // Custom label renderer for expense pie chart - NO LABELS ON CHART
  const renderNoLabel = () => null;

  // Custom label for transaction distribution - percentage only
  const renderPercentageLabel = (entry) => {
    const total = stats.totalIncome + stats.totalExpense + stats.totalInvestment;
    const percent = ((entry.value / total) * 100).toFixed(0);
    return `${percent}%`;
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
          Monthly Expense Analytics
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full border-2 border-blue-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="investment">Investment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full border-2 border-blue-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Months</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i}>{new Date(2000, i).toLocaleDateString('en-US', { month: 'long' })}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full border-2 border-blue-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[...Array(5)].map((_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <option key={year} value={year}>{year}</option>;
                })}
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

      {/* Stats Cards - 4 Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Income</p>
              <p className="text-3xl font-bold">₹{stats.totalIncome.toFixed(0)}</p>
            </div>
            <TrendingUp size={40} className="opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Expense</p>
              <p className="text-3xl font-bold">₹{stats.totalExpense.toFixed(0)}</p>
              <p className="text-xs opacity-80 mt-1">{stats.expensePercent.toFixed(1)}%</p>
            </div>
            <TrendingDown size={40} className="opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Investment</p>
              <p className="text-3xl font-bold">₹{stats.totalInvestment.toFixed(0)}</p>
              <p className="text-xs opacity-80 mt-1">{stats.investmentPercent.toFixed(1)}%</p>
            </div>
            <DollarSign size={40} className="opacity-80" />
          </div>
        </div>
        <div className={`bg-gradient-to-br ${stats.balance >= 0 ? 'from-purple-500 to-pink-600' : 'from-orange-500 to-red-600'} rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Remaining Cash</p>
              <p className="text-3xl font-bold">₹{stats.balance.toFixed(0)}</p>
              <p className="text-xs opacity-80 mt-1">{stats.cashPercent.toFixed(1)}%</p>
            </div>
            <DollarSign size={40} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Row 1: Bar Chart (Full Width) */}
      <div className="bg-white rounded-2xl shadow-2xl p-6 border border-blue-100">
        <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Monthly Breakdown
        </h2>
        {barData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
              <Tooltip formatter={(value) => `₹${value.toFixed(0)}`} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="investment" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-20 text-sm">No data</p>
        )}
      </div>

      {/* Row 2: Two Pie Charts Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart 1: Expenses by Category - WITH LEGEND */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 border border-blue-100">
          <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Expenses by Category
          </h2>
          {expensePieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={expensePieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderNoLabel}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expensePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toFixed(0)}`} />
                </PieChart>
              </ResponsiveContainer>
              {/* Custom Legend Below Chart */}
              <div className="mt-4 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {expensePieData.map((entry, index) => (
                  <div key={index} className="flex items-center space-x-2 text-xs">
                    <div 
                      className="w-3 h-3 rounded-sm flex-shrink-0" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="truncate" title={entry.name}>{entry.name}</span>
                    <span className="text-gray-500 ml-auto">₹{entry.value.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center py-20 text-sm">No expense data</p>
          )}
        </div>

        {/* Pie Chart 2: All Transaction Types - CLEAN WITH PERCENTAGE */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 border border-blue-100">
          <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Transaction Distribution
          </h2>
          {allTransactionsPieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={allTransactionsPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={renderPercentageLabel}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                    <Cell fill="#3b82f6" />
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toFixed(0)}`} />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend Below Chart */}
              <div className="mt-4 flex justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-sm bg-green-500"></div>
                  <span className="text-sm font-medium">Income</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-sm bg-red-500"></div>
                  <span className="text-sm font-medium">Expense</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-sm bg-blue-500"></div>
                  <span className="text-sm font-medium">Investment</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center py-20 text-sm">No data</p>
          )}
        </div>
      </div>

      {/* Distribution Percentage Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Distribution Analysis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border-2 border-red-200">
            <p className="text-sm font-medium text-gray-600 mb-2">Expense</p>
            <p className="text-5xl font-bold text-red-600 mb-2">{stats.expensePercent.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mb-2">of Total Income</p>
            <p className="text-2xl font-semibold text-red-700">₹{stats.totalExpense.toFixed(0)}</p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-red-500 to-pink-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(stats.expensePercent, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
            <p className="text-sm font-medium text-gray-600 mb-2">Investment</p>
            <p className="text-5xl font-bold text-blue-600 mb-2">{stats.investmentPercent.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mb-2">of Total Income (Target: 25%)</p>
            <p className="text-2xl font-semibold text-blue-700">₹{stats.totalInvestment.toFixed(0)}</p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(stats.investmentPercent, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
            <p className="text-sm font-medium text-gray-600 mb-2">Remaining Cash</p>
            <p className={`text-5xl font-bold mb-2 ${stats.cashPercent >= 0 ? 'text-purple-600' : 'text-orange-600'}`}>
              {stats.cashPercent.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mb-2">of Total Income</p>
            <p className={`text-2xl font-semibold ${stats.balance >= 0 ? 'text-purple-700' : 'text-orange-700'}`}>₹{stats.balance.toFixed(0)}</p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${stats.cashPercent >= 0 ? 'bg-gradient-to-r from-purple-500 to-pink-600' : 'bg-gradient-to-r from-orange-500 to-red-600'}`}
                style={{ width: `${Math.min(Math.abs(stats.cashPercent), 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}