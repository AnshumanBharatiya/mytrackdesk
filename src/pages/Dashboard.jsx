// pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { signOut, onAuthStateChanged, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { useNavigate, Routes, Route, Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Menu, X, ChevronDown, Weight, BarChart3, ChevronRight, Home } from "lucide-react";
import EnterWeight from "../components/WeightTracker/EnterWeight";
import TrackWeight from "../components/WeightTracker/TrackWeight";

export default function Dashboard() {
  const [userName, setUserName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [weightMenuOpen, setWeightMenuOpen] = useState(true);
  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || user.email);
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

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
        className={`fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-blue-900 via-purple-900 to-indigo-900 shadow-2xl transform transition-transform duration-300 z-40
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
                : "text-blue-200 hover:bg-white/10"
            }`}
          >
            <Home size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>

          {/* Weight Tracker Dropdown */}
          <div>
            <button
              onClick={() => setWeightMenuOpen(!weightMenuOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition-all duration-200"
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
                      : "text-blue-200 hover:bg-white/10"
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
                      : "text-blue-200 hover:bg-white/10"
                  }`}
                >
                  <BarChart3 size={18} />
                  <span className="text-sm font-medium">Track Weight</span>
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
                  <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Welcome back, {userName}! <span className="no-color">👋</span>
                  </h1>
                  <p className="text-gray-600 mb-8 text-lg">
                    Track your progress and achieve your goals!
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-200 text-white">
                      <Weight size={40} className="mb-4" />
                      <h3 className="font-bold text-2xl mb-2">Weight Tracker</h3>
                      <p className="text-blue-100 text-sm">Monitor your weight journey and track progress</p>
                    </div>
                  </div>
                </div>
              }
            />
            <Route path="/enter-weight" element={<EnterWeight />} />
            <Route path="/track-weight" element={<TrackWeight />} />
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