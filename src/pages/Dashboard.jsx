// pages/Dashboard.jsx - Fixed Version
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { signOut, onAuthStateChanged, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { useNavigate, Routes, Route, Link, useLocation } from "react-router-dom";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Menu, X, ChevronDown, Weight, BarChart3, ChevronRight, Home, TrendingDown, TrendingUp, DollarSign, Table } from "lucide-react";
import EnterWeight from "../components/WeightTracker/EnterWeight";
import TrackWeight from "../components/WeightTracker/TrackWeight";
import EnterTransaction from "../components/ExpenseTracker/EnterTransaction";
import TrackExpense from "../components/ExpenseTracker/TrackExpense";
import TransactionHistory from "../components/ExpenseTracker/TransactionHistory";

export default function Dashboard() {
  const [userName, setUserName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [weightMenuOpen, setWeightMenuOpen] = useState(true);
  const [expenseMenuOpen, setExpenseMenuOpen] = useState(true);
  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastWeight, setLastWeight] = useState(null);
  const [weightLoading, setWeightLoading] = useState(true);
  const [expenseData, setExpenseData] = useState({ totalIncome: 0, totalExpense: 0, totalInvestment: 0, balance: 0 });
  const [expenseLoading, setExpenseLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || user.email);
        fetchLastWeight(user.uid);
        fetchExpenseData(user.uid);
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchLastWeight = async (userId) => {
    setWeightLoading(true);
    try {
      const q = query(
        collection(db, "weights"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(2)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const weights = [];
        querySnapshot.forEach((doc) => {
          weights.push(doc.data());
        });
        
        const current = weights[0];
        const previous = weights[1];
        const trend = previous ? current.weight - previous.weight : 0;
        
        setLastWeight({
          weight: current.weight || 0,
          unit: current.unit || 'kg',
          date: current.createdAt?.toDate().toLocaleDateString('en-GB') || "N/A",
          trend: trend
        });
      }
    } catch (error) {
      console.log("Error fetching weight:", error);
    } finally {
      setWeightLoading(false);
    }
  };

  const fetchExpenseData = async (userId) => {
    setExpenseLoading(true);
    try {
      const q = query(
        collection(db, "transactions"),
        where("userId", "==", userId)
      );

      const querySnapshot = await getDocs(q);
      let income = 0, expense = 0, investment = 0;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.type === "income") {
          income += data.amount || 0;
        } else if (data.type === "expense") {
          expense += data.amount || 0;
        } else if (data.type === "investment") {
          investment += data.amount || 0;
        }
      });

      setExpenseData({
        totalIncome: income,
        totalExpense: expense,
        totalInvestment: investment,
        balance: income - expense - investment
      });
    } catch (error) {
      console.log("Error fetching expense data:", error);
    } finally {
      setExpenseLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
      toast.success("Logout Successful!");
    } catch (err) {
      toast.error("Logout Failed!");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      return toast.error("Please fill all fields!");
    }
    if (newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters!");
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      
      toast.success("Password changed successfully!");
      setChangePasswordModal(false);
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      if (err.code === "auth/wrong-password") {
        toast.error("Old password is incorrect!");
      } else {
        toast.error("Failed to change password!");
      }
    } finally {
      setLoading(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-purple-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-blue-900 via-purple-900 to-indigo-900 shadow-2xl transform transition-transform duration-300 z-40 overflow-y-auto
        ${sidebarOpen ? "translate-x-0" : "-translate-x-72"} md:translate-x-0`}
      >
        <div className="p-6 border-b border-blue-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold text-white">TrackDesk</span>
          </div>
          <button className="md:hidden text-white" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          <Link
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 ${
              isActive("/dashboard")
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                : "text-white hover:bg-white/10"
            }`}
          >
            <Home size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>

          {/* Weight Tracker Dropdown */}
          <div>
            <button
              onClick={() => setWeightMenuOpen(!weightMenuOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-white hover:bg-white/10 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <Weight size={20} />
                <span className="font-medium">Weight Tracker</span>
              </div>
              <ChevronRight
                size={18}
                className={`transform transition-transform duration-200 ${
                  weightMenuOpen ? "rotate-90" : ""
                }`}
              />
            </button>
            
            {weightMenuOpen && (
              <div className="ml-4 mt-2 space-y-1 border-l-2 border-blue-700 pl-4">
                <Link
                  to="/dashboard/enter-weight"
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                    isActive("/dashboard/enter-weight")
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <Weight size={18} />
                  <span className="text-sm font-medium">Enter Weight</span>
                </Link>
                <Link
                  to="/dashboard/track-weight"
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                    isActive("/dashboard/track-weight")
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <BarChart3 size={18} />
                  <span className="text-sm font-medium">Track Weight</span>
                </Link>
              </div>
            )}
          </div>

          {/* Expense Tracker Dropdown */}
          <div>
            <button
              onClick={() => setExpenseMenuOpen(!expenseMenuOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-white hover:bg-white/10 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <DollarSign size={20} />
                <span className="font-medium">Expense Tracker</span>
              </div>
              <ChevronRight
                size={18}
                className={`transform transition-transform duration-200 ${
                  expenseMenuOpen ? "rotate-90" : ""
                }`}
              />
            </button>
            
            {expenseMenuOpen && (
              <div className="ml-4 mt-2 space-y-1 border-l-2 border-blue-700 pl-4">
                <Link
                  to="/dashboard/add-transaction"
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                    isActive("/dashboard/add-transaction")
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <DollarSign size={18} />
                  <span className="text-sm font-medium">Add Transaction</span>
                </Link>
                <Link
                  to="/dashboard/expense-analytics"
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                    isActive("/dashboard/expense-analytics")
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <BarChart3 size={18} />
                  <span className="text-sm font-medium">Analytics</span>
                </Link>
                <Link
                  to="/dashboard/transaction-history"
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                    isActive("/dashboard/transaction-history")
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <Table size={18} />
                  <span className="text-sm font-medium">History</span>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 ml-0 md:ml-72">
        {/* Top Navbar */}
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-md shadow-lg p-4 sticky top-0 z-20 border-b border-blue-100">
          <button
            className="md:hidden text-blue-900 hover:scale-110 transition-transform"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={24} />
          </button>

          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden md:block">
            My TrackDesk
          </div>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
                {userName?.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium hidden sm:block">{userName || "User"}</span>
              <ChevronDown size={18} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white shadow-2xl rounded-xl border border-blue-100 z-50 overflow-hidden">
                <button
                  onClick={() => {
                    setChangePasswordModal(true);
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 flex items-center space-x-2"
                >
                  <span>🔒 Change Password</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 text-red-600 transition-all duration-200 flex items-center space-x-2"
                >
                  <span>🚪 Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          <Routes>
            <Route
              path="/"
              element={
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2 text-pink-800">
                    <span className="text-2xl text-gray-600">Welcome back,</span> {userName}! <span className="no-color">👋</span>
                  </h1>
                  <p className="text-gray-600 mb-8 text-lg">
                    Track your progress and achieve your goals!
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Weight Tracker Card */}
                    <Link
                      to="/dashboard/track-weight"
                      className="weight-tracker-card bg-white border-3 border-blue-400 p-8 rounded-2xl shadow-lg cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <Weight size={40} className="text-blue-600 group-hover:scale-110 transition-transform" />
                        {lastWeight && lastWeight.trend !== 0 && (
                          <div className={`flex items-center space-x-1 ${lastWeight.trend < 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {lastWeight.trend < 0 ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
                            <span className="text-sm font-semibold">{Math.abs(lastWeight.trend).toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      
                      <h3 className="font-bold text-2xl mb-2 text-gray-800 group-hover:text-blue-600 transition-colors">
                        Weight Tracker
                      </h3>
                      
                      {weightLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                          <span className="text-gray-500 text-sm">Loading...</span>
                        </div>
                      ) : lastWeight ? (
                        <div className="space-y-2">
                          <div className="flex items-baseline space-x-2">
                            <span className="text-4xl font-bold text-blue-600">{lastWeight.weight}</span>
                            <span className="text-xl text-gray-600">{lastWeight.unit}</span>
                          </div>
                          <p className="text-sm text-gray-500">Last updated: {lastWeight.date}</p>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No data yet. Start tracking your weight!</p>
                      )}
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors flex items-center space-x-2">
                          <span>View details</span>
                          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </p>
                      </div>
                    </Link>

                    {/* Expense Tracker Card */}
                    <Link
                      to="/dashboard/expense-analytics"
                      className="weight-tracker-card bg-white border-3 border-green-400 p-8 rounded-2xl shadow-lg cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <DollarSign size={40} className="text-green-600 group-hover:scale-110 transition-transform" />
                        {expenseData.balance !== 0 && (
                          <div className={`flex items-center space-x-1 ${expenseData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {expenseData.balance >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                            <span className="text-sm font-semibold">₹{Math.abs(expenseData.balance).toFixed(0)}</span>
                          </div>
                        )}
                      </div>
                      
                      <h3 className="font-bold text-2xl mb-2 text-gray-800 group-hover:text-green-600 transition-colors">
                        Expense Tracker
                      </h3>
                      
                      {expenseLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-600 border-t-transparent"></div>
                          <span className="text-gray-500 text-sm">Loading...</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Income:</span>
                            <span className="text-lg font-bold text-green-600">₹{expenseData.totalIncome.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Expense:</span>
                            <span className="text-lg font-bold text-red-600">₹{expenseData.totalExpense.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Investment:</span>
                            <span className="text-lg font-bold text-blue-600">₹{expenseData.totalInvestment.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="text-sm font-semibold text-gray-700">Balance:</span>
                            <span className={`text-xl font-bold ${expenseData.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                              ₹{expenseData.balance.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600 group-hover:text-green-600 transition-colors flex items-center space-x-2">
                          <span>View details</span>
                          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </p>
                      </div>
                    </Link>
                    
                    {/* Budget Planner - Coming Soon */}
                    <div className="coming-soon-card bg-white border-3 border-gray-300 p-8 rounded-2xl shadow-lg opacity-60">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">📊</span>
                        </div>
                      </div>
                      <h3 className="font-bold text-xl mb-2 text-gray-600">Budget Planner</h3>
                      <p className="text-gray-500 text-sm">Coming Soon</p>
                    </div>
                  </div>
                </div>
              }
            />
            <Route path="/enter-weight" element={<EnterWeight />} />
            <Route path="/track-weight" element={<TrackWeight />} />
            <Route path="/add-transaction" element={<EnterTransaction />} />
            <Route path="/expense-analytics" element={<TrackExpense />} />
            <Route path="/transaction-history" element={<TransactionHistory />} />
          </Routes>
        </div>
      </div>

      {/* Change Password Modal */}
      {changePasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl transform scale-100 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Change Password
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Old Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter old password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter new password"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 font-medium"
                >
                  {loading ? "Changing..." : "Change Password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChangePasswordModal(false);
                    setOldPassword("");
                    setNewPassword("");
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