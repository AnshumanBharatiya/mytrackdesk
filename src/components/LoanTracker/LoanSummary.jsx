import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { toast } from "react-toastify";
import { AlertCircle, CheckCircle, TrendingDown, TrendingUp, Users } from "lucide-react";
import { auth, db } from "../../firebase";

const card = "bg-white/[0.04] border border-white/[0.07] rounded-xl p-5";
const th = "px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#475569] border-b border-white/[0.07]";
const td = "px-4 py-3 text-[#e2e8f0] border-b border-white/[0.07]";

export default function LoanSummary() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overallStats, setOverallStats] = useState({ totalBorrowed: 0, totalLent: 0, netBalance: 0 });

  useEffect(() => { fetchLoanSummary(); }, []);

  const fetchLoanSummary = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const snapshot = await getDocs(query(collection(db, "loans"), where("userId", "==", user.uid)));
      const personMap = new Map();
      let totalBorrowed = 0;
      let totalLent = 0;
      snapshot.forEach((item) => {
        const data = item.data();
        const personName = data.personName;
        if (!personMap.has(personName)) personMap.set(personName, { personName, borrowed: 0, lent: 0, netBalance: 0, transactions: 0 });
        const row = personMap.get(personName);
        row.transactions += 1;
        if (data.type === "borrowed") { row.borrowed += data.amount; totalBorrowed += data.amount; }
        if (data.type === "lent") { row.lent += data.amount; totalLent += data.amount; }
        row.netBalance = row.borrowed - row.lent;
      });
      setSummary(Array.from(personMap.values()).sort((a, b) => Math.abs(b.netBalance) - Math.abs(a.netBalance)));
      setOverallStats({ totalBorrowed, totalLent, netBalance: totalBorrowed - totalLent });
    } catch (error) {
      console.log("Error fetching loan summary:", error);
      toast.error("Failed to load summary!");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-[3px] border-white/[0.07] border-t-purple animate-spin mx-auto" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div><h1 className="text-[22px] font-bold text-[#e2e8f0]">Loan Summary</h1><p className="text-[13px] text-[#475569] mt-1">Person-wise borrowed and lent balances.</p></div>
        <Link to="/dashboard/loan-history" className="bg-purple text-white font-semibold text-[14px] py-2.5 px-5 rounded-lg hover:opacity-85 no-underline">View All Transactions</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[["Total Borrowed", overallStats.totalBorrowed, "text-red", TrendingDown], ["Total Lent", overallStats.totalLent, "text-blue", TrendingUp], ["Net Balance", Math.abs(overallStats.netBalance), overallStats.netBalance > 0 ? "text-red" : "text-green", overallStats.netBalance === 0 ? CheckCircle : AlertCircle]].map(([title, value, color, Icon]) => <div key={title} className={card}><div className="flex items-center justify-between"><div><p className="text-[13px] font-semibold text-[#94a3b8]">{title}</p><p className={`text-[24px] font-bold mt-1 ${color}`}>Rs {Number(value).toFixed(2)}</p></div><Icon size={28} className={color} /></div></div>)}
      </div>

      {!summary.length ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white/[0.04] border border-white/[0.07] rounded-xl"><Users size={40} color="#475569" /><p className="text-[14px] text-[#475569] mt-3">No loan transactions yet.</p><Link to="/dashboard/add-loan" className="mt-5 bg-purple text-white font-semibold text-[14px] py-2.5 px-5 rounded-lg hover:opacity-85 no-underline">Add Loan Transaction</Link></div>
      ) : (
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="px-4 py-3 text-[15px] font-semibold text-[#e2e8f0] border-b border-white/[0.07]">Person-wise Summary</div>
          <div className="overflow-x-auto"><table className="w-full text-[13px] border-collapse"><thead className="bg-surface"><tr>{["Person Name", "Borrowed", "Lent", "Net Balance", "Transactions", "Status"].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead><tbody>
            {summary.map((person) => <tr key={person.personName} className="hover:bg-white/[0.04]">
              <td className={td}><span className="flex items-center gap-2"><span className="w-8 h-8 rounded-full bg-purple/15 text-purple text-[12px] font-bold flex items-center justify-center">{person.personName.charAt(0).toUpperCase()}</span>{person.personName}</span></td>
              <td className={td}><span className="text-red">Rs {person.borrowed.toFixed(2)}</span></td>
              <td className={td}><span className="text-blue">Rs {person.lent.toFixed(2)}</span></td>
              <td className={td}>Rs {Math.abs(person.netBalance).toFixed(2)}</td>
              <td className={td}><span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-blue/10 text-blue">{person.transactions} transactions</span></td>
              <td className={td}>{person.netBalance === 0 ? <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-green/10 text-green">Settled</span> : <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-amber/10 text-amber">Pending</span>}</td>
            </tr>)}
          </tbody></table></div>
        </div>
      )}
    </div>
  );
}
