/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DollarSign, Filter, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "react-toastify";
import { auth, db } from "../../firebase";

const input = "w-full bg-surface border border-white/[0.07] rounded-lg px-3.5 py-2.5 text-[14px] text-[#e2e8f0] outline-none focus:border-purple/60 transition-colors";
const label = "block text-[11px] font-semibold tracking-wide uppercase text-[#475569] mb-2";
const card = "bg-white/[0.04] border border-white/[0.07] rounded-xl p-5";
const tooltip = { background: "#0d1428", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", fontSize: "12px", color: "#e2e8f0" };
const colors = ["#a78bfa", "#34d399", "#f59e0b", "#f87171", "#60a5fa", "#c4b5fd", "#fb7185", "#22d3ee"];

export default function TrackExpense() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, totalInvestment: 0, balance: 0 });
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
    if (filterType !== "all") filtered = filtered.filter((t) => t.type === filterType);
    if (startDate) filtered = filtered.filter((t) => t.date >= startDate);
    if (endDate) filtered = filtered.filter((t) => t.date <= endDate);
    if (selectedMonth) filtered = filtered.filter((t) => new Date(t.date).getMonth() === parseInt(selectedMonth));
    if (selectedYear) filtered = filtered.filter((t) => new Date(t.date).getFullYear() === parseInt(selectedYear));
    setFilteredTransactions(filtered);
    calculateStats(filtered);
  };

  const calculateStats = (data) => {
    const totalIncome = data.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = data.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    const totalInvestment = data.filter((t) => t.type === "investment").reduce((sum, t) => sum + t.amount, 0);
    setStats({ totalIncome, totalExpense, totalInvestment, balance: totalIncome - totalExpense - totalInvestment });
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setFilterType("all");
    setSelectedMonth(new Date().getMonth().toString());
    setSelectedYear(new Date().getFullYear().toString());
  };

  const byCategory = filteredTransactions.filter((t) => t.type === "expense").reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});
  const expensePieData = Object.entries(byCategory).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }));
  const distribution = [
    { name: "Income", value: stats.totalIncome },
    { name: "Expense", value: stats.totalExpense },
    { name: "Investment", value: stats.totalInvestment },
  ].filter((item) => item.value > 0);
  const barData = Object.values(filteredTransactions.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
    acc[month] ||= { month, income: 0, expense: 0, investment: 0 };
    acc[month][t.type] += t.amount;
    return acc;
  }, {})).slice(-6);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-[3px] border-white/[0.07] border-t-purple animate-spin mx-auto" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div><h1 className="text-[22px] font-bold text-[#e2e8f0]">Monthly Expense Analytics</h1><p className="text-[13px] text-[#475569] mt-1">Understand income, expense, and investment patterns.</p></div>
        <button onClick={() => setShowFilters(!showFilters)} className="bg-white/[0.04] border border-white/[0.07] text-[#94a3b8] font-medium text-[14px] py-2.5 px-5 rounded-lg hover:bg-white/[0.07] flex items-center gap-2"><Filter size={16} /> Filters</button>
      </div>

      {showFilters && (
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div><label className={label}>Type</label><select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={input}><option value="all">All</option><option value="income">Income</option><option value="expense">Expense</option><option value="investment">Investment</option></select></div>
            <div><label className={label}>Month</label><select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className={input}><option value="">All Months</option>{[...Array(12)].map((_, i) => <option key={i} value={i}>{new Date(2000, i).toLocaleDateString("en-US", { month: "long" })}</option>)}</select></div>
            <div><label className={label}>Year</label><select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className={input}>{[...Array(5)].map((_, i) => { const year = new Date().getFullYear() - i; return <option key={year} value={year}>{year}</option>; })}</select></div>
            <div><label className={label}>Start Date</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={input} /></div>
            <div><label className={label}>End Date</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={input} /></div>
          </div>
          <button onClick={clearFilters} className="mt-4 bg-white/[0.04] border border-white/[0.07] text-[#94a3b8] font-medium text-[14px] py-2.5 px-5 rounded-lg hover:bg-white/[0.07]">Clear Filters</button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ["Total Income", stats.totalIncome, "text-green", TrendingUp],
          ["Total Expense", stats.totalExpense, "text-red", TrendingDown],
          ["Total Investment", stats.totalInvestment, "text-blue", DollarSign],
          ["Remaining Cash", stats.balance, stats.balance >= 0 ? "text-purple" : "text-amber", DollarSign],
        ].map(([title, value, color, Icon]) => (
          <div key={title} className={card}><div className="flex items-center justify-between"><div><p className="text-[13px] font-semibold text-[#94a3b8]">{title}</p><p className={`text-[26px] font-bold mt-1 ${color}`}>Rs {Number(value).toFixed(0)}</p></div><Icon size={28} className={color} /></div></div>
        ))}
      </div>

      <div className={card}>
        <h2 className="text-[15px] font-semibold text-[#e2e8f0] mb-4">Monthly Breakdown</h2>
        {barData.length ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={barData}>
              <CartesianGrid stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltip} labelStyle={{ color: "#94a3b8" }} formatter={(value) => `Rs ${value.toFixed(0)}`} />
              <Bar dataKey="income" fill="#34d399" radius={[4, 4, 0, 0]} activeBar={{ fill: "#6ee7b7" }} />
              <Bar dataKey="expense" fill="#f87171" radius={[4, 4, 0, 0]} activeBar={{ fill: "#fca5a5" }} />
              <Bar dataKey="investment" fill="#a78bfa" radius={[4, 4, 0, 0]} activeBar={{ fill: "#c4b5fd" }} />
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-[14px] text-[#475569] py-16 text-center">No data</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[["Expenses by Category", expensePieData], ["Transaction Distribution", distribution]].map(([title, data]) => (
          <div key={title} className={card}>
            <h2 className="text-[15px] font-semibold text-[#e2e8f0] mb-4">{title}</h2>
            {data.length ? (
              <>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} labelLine={false}>
                      {data.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltip} formatter={(value) => `Rs ${value.toFixed(0)}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {data.map((item, index) => <div key={item.name} className="flex items-center gap-2 text-[12px] text-[#94a3b8]"><span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colors[index % colors.length] }} />{item.name}<span className="ml-auto text-[#475569]">Rs {item.value.toFixed(0)}</span></div>)}
                </div>
              </>
            ) : <p className="text-[14px] text-[#475569] py-16 text-center">No data</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
