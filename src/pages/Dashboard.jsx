import React, { useEffect, useState } from "react";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { BarChart3, ChevronRight, DollarSign, HandCoins, Scale } from "lucide-react";
import { auth, db } from "../firebase";
import Layout from "../components/dashboard/Layout";
import EnterWeight from "../components/WeightTracker/EnterWeight";
import TrackWeight from "../components/WeightTracker/TrackWeight";
import EnterTransaction from "../components/ExpenseTracker/EnterTransaction";
import TrackExpense from "../components/ExpenseTracker/TrackExpense";
import TransactionHistory from "../components/ExpenseTracker/TransactionHistory";
import DailyExpenseTracker from "../components/ExpenseTracker/DailyExpenseTracker";
import EnterLoan from "../components/LoanTracker/EnterLoan";
import LoanSummary from "../components/LoanTracker/LoanSummary";
import LoanHistory from "../components/LoanTracker/LoanHistory";

const cardClass =
  "bg-white/[0.04] border border-white/[0.07] rounded-xl p-5 transition-all duration-200 hover:border-purple/40 hover:-translate-y-1 cursor-pointer no-underline block";
const muted = "text-[12px] text-[#475569] flex justify-between mt-1";

function LoadingMini() {
  return <div className="w-8 h-8 rounded-full border-[3px] border-white/[0.07] border-t-purple animate-spin" />;
}

function TrendBadge({ positive, children }) {
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full ${positive ? "bg-green/10 text-green" : "bg-red/10 text-red"}`}>
      {children}
    </span>
  );
}

function Overview({ userName, lastWeight, weightLoading, expenseData, expenseLoading, loanData, loanLoading }) {
  return (
    <div>
      <h1 className="text-[22px] font-bold text-[#e2e8f0]">Welcome back, {userName || "User"}</h1>
      <p className="text-[13px] text-[#475569] mt-1">Track your weight, money, and loans from one focused dashboard.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
        <Link to="/dashboard/track-weight" className={cardClass}>
          <div className="flex items-center justify-between">
            <Scale size={24} className="text-blue" />
            {lastWeight?.trend !== 0 && lastWeight && (
              <TrendBadge positive={lastWeight.trend < 0}>{Math.abs(lastWeight.trend).toFixed(1)} {lastWeight.unit}</TrendBadge>
            )}
          </div>
          <h2 className="text-[13px] font-semibold text-[#94a3b8] mt-3">Weight Tracker</h2>
          {weightLoading ? (
            <div className="mt-4"><LoadingMini /></div>
          ) : lastWeight ? (
            <>
              <div className="text-[26px] font-bold text-[#e2e8f0] mt-1">{lastWeight.weight} {lastWeight.unit}</div>
              <div className={muted}><span>Last updated</span><span>{lastWeight.date}</span></div>
            </>
          ) : (
            <p className="text-[12px] text-[#475569] mt-3">No entries yet.</p>
          )}
          <div className="text-[12px] text-purple mt-3 hover:opacity-80 flex items-center gap-1">View details <ChevronRight size={14} /></div>
        </Link>

        <Link to="/dashboard/monthly-analytics" className={cardClass}>
          <div className="flex items-center justify-between">
            <DollarSign size={24} className="text-purple" />
            {expenseData.balance !== 0 && (
              <TrendBadge positive={expenseData.balance >= 0}>Rs {Math.abs(expenseData.balance).toFixed(0)}</TrendBadge>
            )}
          </div>
          <h2 className="text-[13px] font-semibold text-[#94a3b8] mt-3">Expense Tracker</h2>
          {expenseLoading ? (
            <div className="mt-4"><LoadingMini /></div>
          ) : (
            <>
              <div className="text-[26px] font-bold text-[#e2e8f0] mt-1">Rs {expenseData.balance.toFixed(0)}</div>
              <div className={muted}><span>Income</span><span className="text-green">Rs {expenseData.totalIncome.toFixed(0)}</span></div>
              <div className={muted}><span>Expense</span><span className="text-red">Rs {expenseData.totalExpense.toFixed(0)}</span></div>
            </>
          )}
          <div className="text-[12px] text-purple mt-3 hover:opacity-80 flex items-center gap-1">View details <ChevronRight size={14} /></div>
        </Link>

        <Link to="/dashboard/loan-summary" className={cardClass}>
          <div className="flex items-center justify-between">
            <HandCoins size={24} className="text-amber" />
            {loanData.netBalance !== 0 && (
              <TrendBadge positive={loanData.netBalance < 0}>Rs {Math.abs(loanData.netBalance).toFixed(0)}</TrendBadge>
            )}
          </div>
          <h2 className="text-[13px] font-semibold text-[#94a3b8] mt-3">Loan Tracker</h2>
          {loanLoading ? (
            <div className="mt-4"><LoadingMini /></div>
          ) : (
            <>
              <div className="text-[26px] font-bold text-[#e2e8f0] mt-1">Rs {Math.abs(loanData.netBalance).toFixed(0)}</div>
              <div className={muted}><span>Borrowed</span><span className="text-red">Rs {loanData.totalBorrowed.toFixed(0)}</span></div>
              <div className={muted}><span>Lent</span><span className="text-blue">Rs {loanData.totalLent.toFixed(0)}</span></div>
            </>
          )}
          <div className="text-[12px] text-purple mt-3 hover:opacity-80 flex items-center gap-1">View details <ChevronRight size={14} /></div>
        </Link>

        <div className={`${cardClass} opacity-40 pointer-events-none`}>
          <div className="flex items-center justify-between">
            <BarChart3 size={24} className="text-[#475569]" />
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.04] text-[#94a3b8]">Soon</span>
          </div>
          <h2 className="text-[13px] font-semibold text-[#94a3b8] mt-3">Budget Planner</h2>
          <div className="text-[26px] font-bold text-[#e2e8f0] mt-1">Coming Soon</div>
          <div className={muted}><span>Planned monthly limits</span></div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [userName, setUserName] = useState("");
  const [lastWeight, setLastWeight] = useState(null);
  const [weightLoading, setWeightLoading] = useState(true);
  const [expenseData, setExpenseData] = useState({ totalIncome: 0, totalExpense: 0, totalInvestment: 0, balance: 0 });
  const [expenseLoading, setExpenseLoading] = useState(true);
  const [loanData, setLoanData] = useState({ totalBorrowed: 0, totalLent: 0, netBalance: 0 });
  const [loanLoading, setLoanLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
        return;
      }
      setUserName(user.displayName || user.email);
      fetchLastWeight(user.uid);
      fetchExpenseData(user.uid);
      fetchLoanData(user.uid);
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchLastWeight = async (userId) => {
    setWeightLoading(true);
    try {
      const q = query(collection(db, "weights"), where("userId", "==", userId), orderBy("createdAt", "desc"), limit(2));
      const snapshot = await getDocs(q);
      const weights = [];
      snapshot.forEach((doc) => weights.push(doc.data()));
      if (weights.length) {
        const current = weights[0];
        const previous = weights[1];
        setLastWeight({
          weight: current.weight || 0,
          unit: current.unit || "kg",
          date: current.createdAt?.toDate().toLocaleDateString("en-GB") || "N/A",
          trend: previous ? current.weight - previous.weight : 0,
        });
      }
    } finally {
      setWeightLoading(false);
    }
  };

  const fetchExpenseData = async (userId) => {
    setExpenseLoading(true);
    try {
      const q = query(collection(db, "transactions"), where("userId", "==", userId));
      const snapshot = await getDocs(q);
      let totalIncome = 0;
      let totalExpense = 0;
      let totalInvestment = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.type === "income") totalIncome += data.amount || 0;
        if (data.type === "expense") totalExpense += data.amount || 0;
        if (data.type === "investment") totalInvestment += data.amount || 0;
      });
      setExpenseData({ totalIncome, totalExpense, totalInvestment, balance: totalIncome - totalExpense - totalInvestment });
    } finally {
      setExpenseLoading(false);
    }
  };

  const fetchLoanData = async (userId) => {
    setLoanLoading(true);
    try {
      const q = query(collection(db, "loans"), where("userId", "==", userId));
      const snapshot = await getDocs(q);
      let totalBorrowed = 0;
      let totalLent = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.type === "borrowed") totalBorrowed += data.amount || 0;
        if (data.type === "lent") totalLent += data.amount || 0;
      });
      setLoanData({ totalBorrowed, totalLent, netBalance: totalBorrowed - totalLent });
    } finally {
      setLoanLoading(false);
    }
  };

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={
            <Overview
              userName={userName}
              lastWeight={lastWeight}
              weightLoading={weightLoading}
              expenseData={expenseData}
              expenseLoading={expenseLoading}
              loanData={loanData}
              loanLoading={loanLoading}
            />
          }
        />
        <Route path="/enter-weight" element={<EnterWeight />} />
        <Route path="/track-weight" element={<TrackWeight />} />
        <Route path="/add-transaction" element={<EnterTransaction />} />
        <Route path="/monthly-analytics" element={<TrackExpense />} />
        <Route path="/daily-analytics" element={<DailyExpenseTracker />} />
        <Route path="/transaction-history" element={<TransactionHistory />} />
        <Route path="/add-loan" element={<EnterLoan />} />
        <Route path="/loan-summary" element={<LoanSummary />} />
        <Route path="/loan-history" element={<LoanHistory />} />
      </Routes>
    </Layout>
  );
}
