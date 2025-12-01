// components/ExpenseTracker/DailyExpenseTracker.jsx - Daily Expense View
import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Filter, TrendingDown, TrendingUp, DollarSign, Calendar as CalendarIcon } from "lucide-react";

export default function DailyExpenseTracker() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ 
    totalIncome: 0, 
    totalExpense: 0, 
    totalInvestment: 0,
    balance: 0,
    avgDailyExpense: 0,
    avgDailyIncome: 0,
    highestDay: { date: '', amount: 0 },
    lowestDay: { date: '', amount: 0 }
  });
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, selectedMonth, selectedYear, filterType]);

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

    // Filter by month and year
    if (selectedMonth !== "" || selectedYear !== "") {
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        const matchMonth = selectedMonth === "" || transactionDate.getMonth() === parseInt(selectedMonth);
        const matchYear = selectedYear === "" || transactionDate.getFullYear() === parseInt(selectedYear);
        return matchMonth && matchYear;
      });
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(t => t.type === filterType);
    }

    setFilteredTransactions(filtered);
    calculateStats(filtered);
  };

  const calculateStats = (data) => {
    const income = data.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const expense = data.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    const investment = data.filter(t => t.type === "investment").reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate daily expenses
    const expenseData = data.filter(t => t.type === "expense");
    const dailyExpenses = expenseData.reduce((acc, t) => {
      const date = t.date;
      acc[date] = (acc[date] || 0) + t.amount;
      return acc;
    }, {});

    const expenseValues = Object.values(dailyExpenses);
    const avgDailyExpense = expenseValues.length > 0 ? expenseValues.reduce((a, b) => a + b, 0) / expenseValues.length : 0;
    
    // Calculate daily income
    const incomeData = data.filter(t => t.type === "income");
    const dailyIncome = incomeData.reduce((acc, t) => {
      const date = t.date;
      acc[date] = (acc[date] || 0) + t.amount;
      return acc;
    }, {});

    const incomeValues = Object.values(dailyIncome);
    const avgDailyIncome = incomeValues.length > 0 ? incomeValues.reduce((a, b) => a + b, 0) / incomeValues.length : 0;

    // Find highest and lowest expense days
    let highestDay = { date: '', amount: 0 };
    let lowestDay = { date: '', amount: Infinity };

    Object.entries(dailyExpenses).forEach(([date, amount]) => {
      if (amount > highestDay.amount) {
        highestDay = { date, amount };
      }
      if (amount < lowestDay.amount) {
        lowestDay = { date, amount };
      }
    });

    if (lowestDay.amount === Infinity) {
      lowestDay = { date: '', amount: 0 };
    }

    setStats({
      totalIncome: income,
      totalExpense: expense,
      totalInvestment: investment,
      balance: income - expense - investment,
      avgDailyExpense,
      avgDailyIncome,
      highestDay,
      lowestDay
    });
  };

  const clearFilters = () => {
    setSelectedMonth(new Date().getMonth().toString());
    setSelectedYear(new Date().getFullYear().toString());
    setFilterType("all");
  };

  // Prepare daily data for line chart
  const getDailyData = () => {
    const dailyMap = {};

    filteredTransactions.forEach(t => {
      const date = new Date(t.date);
      const dateStr = date.toLocaleDateString('en-GB');
      
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = { date: dateStr, income: 0, expense: 0, investment: 0 };
      }

      if (t.type === "income") {
        dailyMap[dateStr].income += t.amount;
      } else if (t.type === "expense") {
        dailyMap[dateStr].expense += t.amount;
      } else if (t.type === "investment") {
        dailyMap[dateStr].investment += t.amount;
      }
    });

    // Sort by date
    return Object.values(dailyMap).sort((a, b) => {
      const dateA = a.date.split('/').reverse().join('-');
      const dateB = b.date.split('/').reverse().join('-');
      return new Date(dateA) - new Date(dateB);
    });
  };

  const dailyData = getDailyData();

  // Prepare data for bar chart (last 15 days)
  const last15DaysData = dailyData.slice(-15);

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
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Daily Expense Analytics
          </h1>
          <p className="text-gray-500 text-sm mt-1">Track your day-to-day spending patterns</p>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              Showing <span className="font-bold text-blue-600">{dailyData.length}</span> days of data
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
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Avg Daily Expense</p>
              <p className="text-3xl font-bold">₹{stats.avgDailyExpense.toFixed(0)}</p>
            </div>
            <TrendingDown size={40} className="opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Avg Daily Income</p>
              <p className="text-3xl font-bold">₹{stats.avgDailyIncome.toFixed(0)}</p>
            </div>
            <TrendingUp size={40} className="opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Highest Expense Day</p>
              <p className="text-2xl font-bold">₹{stats.highestDay.amount.toFixed(0)}</p>
              <p className="text-xs opacity-80 mt-1">{stats.highestDay.date ? new Date(stats.highestDay.date).toLocaleDateString('en-GB') : 'N/A'}</p>
            </div>
            <CalendarIcon size={40} className="opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Lowest Expense Day</p>
              <p className="text-2xl font-bold">₹{stats.lowestDay.amount.toFixed(0)}</p>
              <p className="text-xs opacity-80 mt-1">{stats.lowestDay.date ? new Date(stats.lowestDay.date).toLocaleDateString('en-GB') : 'N/A'}</p>
            </div>
            <CalendarIcon size={40} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Line Chart - Daily Trend */}
      <div className="bg-white rounded-2xl shadow-2xl p-6 border border-blue-100">
        <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Daily Trend Analysis
        </h2>
        {dailyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10, fill: '#6b7280' }} 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
              <Tooltip formatter={(value) => `₹${value.toFixed(0)}`} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Income" />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="Expense" />
              <Line type="monotone" dataKey="investment" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Investment" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-20 text-sm">No daily data available</p>
        )}
      </div>

      {/* Bar Chart - Last 15 Days */}
      <div className="bg-white rounded-2xl shadow-2xl p-6 border border-blue-100">
        <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Last 15 Days Breakdown
        </h2>
        {last15DaysData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={last15DaysData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10, fill: '#6b7280' }} 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
              <Tooltip formatter={(value) => `₹${value.toFixed(0)}`} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expense" />
              <Bar dataKey="investment" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Investment" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-20 text-sm">No data for last 15 days</p>
        )}
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Daily Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
            <DollarSign size={40} className="mx-auto text-green-600 mb-3" />
            <p className="text-sm font-medium text-gray-600 mb-2">Total Income</p>
            <p className="text-4xl font-bold text-green-600">₹{stats.totalIncome.toFixed(0)}</p>
            <p className="text-xs text-gray-500 mt-2">{dailyData.length} days tracked</p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border-2 border-red-200">
            <TrendingDown size={40} className="mx-auto text-red-600 mb-3" />
            <p className="text-sm font-medium text-gray-600 mb-2">Total Expense</p>
            <p className="text-4xl font-bold text-red-600">₹{stats.totalExpense.toFixed(0)}</p>
            <p className="text-xs text-gray-500 mt-2">₹{stats.avgDailyExpense.toFixed(0)}/day average</p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
            <TrendingUp size={40} className="mx-auto text-blue-600 mb-3" />
            <p className="text-sm font-medium text-gray-600 mb-2">Net Balance</p>
            <p className={`text-4xl font-bold ${stats.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              ₹{stats.balance.toFixed(0)}
            </p>
            <p className="text-xs text-gray-500 mt-2">After all transactions</p>
          </div>
        </div>
      </div>
    </div>
  );
}