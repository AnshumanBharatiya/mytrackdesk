/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Calendar as CalendarIcon, DollarSign, Filter, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "react-toastify";
import { auth, db } from "../../firebase";

const input = "w-full bg-surface border border-white/[0.07] rounded-lg px-3.5 py-2.5 text-[14px] text-[#e2e8f0] outline-none focus:border-purple/60 transition-colors";
const label = "block text-[11px] font-semibold tracking-wide uppercase text-[#475569] mb-2";
const card = "bg-white/[0.04] border border-white/[0.07] rounded-xl p-5";
const tooltip = { background: "#0d1428", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", fontSize: "12px", color: "#e2e8f0" };

export default function DailyExpenseTracker() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, totalInvestment: 0, balance: 0, avgDailyExpense: 0, avgDailyIncome: 0, highestDay: { date: "", amount: 0 }, lowestDay: { date: "", amount: 0 } });
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
      const snapshot = await getDocs(query(collection(db, "transactions"), where("userId", "==", user.uid)));
      const data = [];
      snapshot.forEach((item) => data.push({ id: item.id, ...item.data() }));
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
    if (selectedMonth !== "" || selectedYear !== "") {
      filtered = filtered.filter((t) => {
        const date = new Date(t.date);
        return (selectedMonth === "" || date.getMonth() === parseInt(selectedMonth)) && (selectedYear === "" || date.getFullYear() === parseInt(selectedYear));
      });
    }
    if (filterType !== "all") filtered = filtered.filter((t) => t.type === filterType);
    setFilteredTransactions(filtered);
    calculateStats(filtered);
  };

  const calculateStats = (data) => {
    const totalIncome = data.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = data.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    const totalInvestment = data.filter((t) => t.type === "investment").reduce((sum, t) => sum + t.amount, 0);
    const dailyExpenses = data.filter((t) => t.type === "expense").reduce((acc, t) => ({ ...acc, [t.date]: (acc[t.date] || 0) + t.amount }), {});
    const dailyIncome = data.filter((t) => t.type === "income").reduce((acc, t) => ({ ...acc, [t.date]: (acc[t.date] || 0) + t.amount }), {});
    const expenseValues = Object.values(dailyExpenses);
    const incomeValues = Object.values(dailyIncome);
    const highest = Object.entries(dailyExpenses).sort((a, b) => b[1] - a[1])[0] || ["", 0];
    const lowest = Object.entries(dailyExpenses).sort((a, b) => a[1] - b[1])[0] || ["", 0];
    setStats({
      totalIncome,
      totalExpense,
      totalInvestment,
      balance: totalIncome - totalExpense - totalInvestment,
      avgDailyExpense: expenseValues.length ? expenseValues.reduce((a, b) => a + b, 0) / expenseValues.length : 0,
      avgDailyIncome: incomeValues.length ? incomeValues.reduce((a, b) => a + b, 0) / incomeValues.length : 0,
      highestDay: { date: highest[0], amount: highest[1] },
      lowestDay: { date: lowest[0], amount: lowest[1] },
    });
  };

  const clearFilters = () => {
    setSelectedMonth(new Date().getMonth().toString());
    setSelectedYear(new Date().getFullYear().toString());
    setFilterType("all");
  };

  const dailyData = Object.values(filteredTransactions.reduce((acc, t) => {
    const date = new Date(t.date).toLocaleDateString("en-GB");
    acc[date] ||= { date, income: 0, expense: 0, investment: 0 };
    acc[date][t.type] += t.amount;
    return acc;
  }, {}));
  const last15DaysData = dailyData.slice(-15);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-[3px] border-white/[0.07] border-t-purple animate-spin mx-auto" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div><h1 className="text-[22px] font-bold text-[#e2e8f0]">Daily Expense Analytics</h1><p className="text-[13px] text-[#475569] mt-1">Track day-to-day spending patterns.</p></div>
        <button onClick={() => setShowFilters(!showFilters)} className="bg-white/[0.04] border border-white/[0.07] text-[#94a3b8] font-medium text-[14px] py-2.5 px-5 rounded-lg hover:bg-white/[0.07] flex items-center gap-2"><Filter size={16} /> Filters</button>
      </div>

      {showFilters && (
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={label}>Month</label><select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className={input}><option value="">All Months</option>{[...Array(12)].map((_, i) => <option key={i} value={i}>{new Date(2000, i).toLocaleDateString("en-US", { month: "long" })}</option>)}</select></div>
            <div><label className={label}>Year</label><select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className={input}>{[...Array(5)].map((_, i) => { const year = new Date().getFullYear() - i; return <option key={year} value={year}>{year}</option>; })}</select></div>
            <div><label className={label}>Type</label><select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={input}><option value="all">All</option><option value="income">Income</option><option value="expense">Expense</option><option value="investment">Investment</option></select></div>
          </div>
          <button onClick={clearFilters} className="mt-4 bg-white/[0.04] border border-white/[0.07] text-[#94a3b8] font-medium text-[14px] py-2.5 px-5 rounded-lg hover:bg-white/[0.07]">Clear Filters</button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ["Avg Daily Expense", stats.avgDailyExpense, "text-red", TrendingDown],
          ["Avg Daily Income", stats.avgDailyIncome, "text-green", TrendingUp],
          ["Highest Expense Day", stats.highestDay.amount, "text-amber", CalendarIcon],
          ["Lowest Expense Day", stats.lowestDay.amount, "text-blue", CalendarIcon],
        ].map(([title, value, color, Icon]) => <div key={title} className={card}><div className="flex items-center justify-between"><div><p className="text-[13px] font-semibold text-[#94a3b8]">{title}</p><p className={`text-[26px] font-bold mt-1 ${color}`}>Rs {Number(value).toFixed(0)}</p></div><Icon size={28} className={color} /></div></div>)}
      </div>

      <div className={card}>
        <h2 className="text-[15px] font-semibold text-[#e2e8f0] mb-4">Daily Trend Analysis</h2>
        {dailyData.length ? <ResponsiveContainer width="100%" height={380}><LineChart data={dailyData}><CartesianGrid stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" /><XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltip} labelStyle={{ color: "#94a3b8" }} formatter={(value) => `Rs ${value.toFixed(0)}`} /><Line type="monotone" dataKey="income" stroke="#34d399" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="expense" stroke="#f87171" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="investment" stroke="#a78bfa" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer> : <p className="text-[14px] text-[#475569] py-16 text-center">No daily data available</p>}
      </div>

      <div className={card}>
        <h2 className="text-[15px] font-semibold text-[#e2e8f0] mb-4">Last 15 Days Breakdown</h2>
        {last15DaysData.length ? <ResponsiveContainer width="100%" height={350}><BarChart data={last15DaysData}><CartesianGrid stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" /><XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltip} labelStyle={{ color: "#94a3b8" }} formatter={(value) => `Rs ${value.toFixed(0)}`} /><Bar dataKey="income" fill="#34d399" radius={[4, 4, 0, 0]} /><Bar dataKey="expense" fill="#f87171" radius={[4, 4, 0, 0]} /><Bar dataKey="investment" fill="#a78bfa" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer> : <p className="text-[14px] text-[#475569] py-16 text-center">No data for last 15 days</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[["Total Income", stats.totalIncome, "text-green", DollarSign], ["Total Expense", stats.totalExpense, "text-red", TrendingDown], ["Net Balance", stats.balance, stats.balance >= 0 ? "text-blue" : "text-amber", TrendingUp]].map(([title, value, color, Icon]) => <div key={title} className={card}><Icon size={28} className={color} /><p className="text-[13px] font-semibold text-[#94a3b8] mt-3">{title}</p><p className={`text-[26px] font-bold mt-1 ${color}`}>Rs {Number(value).toFixed(0)}</p></div>)}
      </div>
    </div>
  );
}
