// components/LoanTracker/LoanSummary.jsx
import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";
import { Users, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function LoanSummary() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overallStats, setOverallStats] = useState({
    totalBorrowed: 0,
    totalLent: 0,
    netBalance: 0
  });

  useEffect(() => {
    fetchLoanSummary();
  }, []);

  const fetchLoanSummary = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "loans"),
        where("userId", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);
      const personMap = new Map();
      let totalBorrowed = 0;
      let totalLent = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const person = data.personName;

        if (!personMap.has(person)) {
          personMap.set(person, {
            personName: person,
            borrowed: 0,
            lent: 0,
            netBalance: 0,
            transactions: 0
          });
        }

        const personData = personMap.get(person);
        personData.transactions++;

        if (data.type === "borrowed") {
          personData.borrowed += data.amount;
          totalBorrowed += data.amount;
        } else if (data.type === "lent") {
          personData.lent += data.amount;
          totalLent += data.amount;
        }

        // Net balance: positive means I owe them, negative means they owe me
        personData.netBalance = personData.borrowed - personData.lent;
        personMap.set(person, personData);
      });

      const summaryArray = Array.from(personMap.values()).sort((a, b) => 
        Math.abs(b.netBalance) - Math.abs(a.netBalance)
      );

      setSummary(summaryArray);
      setOverallStats({
        totalBorrowed,
        totalLent,
        netBalance: totalBorrowed - totalLent
      });
    } catch (error) {
      console.log("Error fetching loan summary:", error);
      toast.error("Failed to load summary!");
    } finally {
      setLoading(false);
    }
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
          Loan Summary
        </h1>
        <Link
          to="/dashboard/loan-history"
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 font-medium"
        >
          <span>View All Transactions</span>
        </Link>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Borrowed</p>
              <p className="text-3xl font-bold">₹{overallStats.totalBorrowed.toFixed(2)}</p>
            </div>
            <TrendingDown size={40} className="opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Lent</p>
              <p className="text-3xl font-bold">₹{overallStats.totalLent.toFixed(2)}</p>
            </div>
            <TrendingUp size={40} className="opacity-80" />
          </div>
        </div>
        <div className={`bg-gradient-to-br ${overallStats.netBalance > 0 ? 'from-red-500 to-pink-600' : 'from-blue-500 to-indigo-600'} rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Net Balance</p>
              <p className="text-3xl font-bold">₹{Math.abs(overallStats.netBalance).toFixed(2)}</p>
              <p className="text-xs opacity-80 mt-1">
                {overallStats.netBalance > 0 ? "You owe" : overallStats.netBalance < 0 ? "Others owe you" : "Settled"}
              </p>
            </div>
            {overallStats.netBalance === 0 ? <CheckCircle size={40} className="opacity-80" /> : <AlertCircle size={40} className="opacity-80" />}
          </div>
        </div>
      </div>

      {/* Person-wise Summary Table */}
      {summary.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center border border-blue-100">
          <Users className="mx-auto text-gray-400 mb-4" size={60} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Loan Transactions Yet</h2>
          <p className="text-gray-600">Start by adding your first loan transaction!</p>
          <Link
            to="/dashboard/add-loan"
            className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 font-medium"
          >
            Add Loan Transaction
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-blue-100">
          <h2 className="text-2xl font-bold p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Person-wise Summary
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Person Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Borrowed (I took)</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Lent (I gave)</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Net Balance</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Transactions</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {summary.map((person, index) => (
                  <tr 
                    key={index} 
                    className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {person.personName.charAt(0).toUpperCase()}
                        </div>
                        <span>{person.personName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="font-bold text-orange-600">
                        ₹{person.borrowed.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="font-bold text-green-600">
                        ₹{person.lent.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold text-lg ${
                          person.netBalance > 0 ? 'text-red-600' : person.netBalance < 0 ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                          ₹{Math.abs(person.netBalance).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {person.netBalance > 0 
                          ? "You owe them" 
                          : person.netBalance < 0 
                          ? "They owe you" 
                          : "Settled"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {person.transactions} transactions
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {person.netBalance === 0 ? (
                        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          <CheckCircle size={14} />
                          <span>Settled</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                          <AlertCircle size={14} />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}