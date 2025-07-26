import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Menu, ChevronDown } from "lucide-react"; // For icons

export default function Dashboard() {
  const [userName, setUserName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* ✅ Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 z-40
        ${sidebarOpen ? "translate-x-0" : "-translate-x-64"} md:translate-x-0`}
      >
        <div className="p-4 text-xl font-bold text-blue-600 border-b">MyTrackDesk</div>
        <nav className="p-4 space-y-2">
          <button className="w-full text-left px-4 py-2 rounded hover:bg-blue-100">🏠 Dashboard</button>
          <button className="w-full text-left px-4 py-2 rounded hover:bg-blue-100">📊 Track Result</button>
        </nav>
      </div>

      {/* ✅ Main Content */}
      <div className="flex flex-col flex-1 ml-0 md:ml-64">
        {/* Top Navbar */}
        <div className="flex items-center justify-between bg-white shadow p-4">
          <button
            className="md:hidden text-gray-600"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={24} />
          </button>

          <div className="text-xl font-bold text-blue-600 hidden md:block">MyTrackDesk</div>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded hover:bg-gray-200"
            >
              <span>{userName || "User"}</span>
              <ChevronDown size={18} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md border z-50">
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
                  Change Password
                </button>
      <button
        onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
      >
        Logout
      </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          <h1 className="text-2xl font-bold mb-4">Welcome, {userName} 👋</h1>
          <p className="text-gray-700">
            This is your main dashboard area. You can show charts, stats, or track results here.
          </p>
        </div>
      </div>
    </div>
  );
}
