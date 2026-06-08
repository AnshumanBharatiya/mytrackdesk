import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { EmailAuthProvider, reauthenticateWithCredential, signOut, updatePassword } from "firebase/auth";
import { Bell, ChevronDown, KeyRound, LogOut, Menu } from "lucide-react";
import { toast } from "react-toastify";
import { auth } from "../../firebase";

const titles = {
  "/dashboard": "Dashboard",
  "/dashboard/enter-weight": "Track Weight",
  "/dashboard/track-weight": "Track Weight",
  "/dashboard/step-count": "Step Count",
  "/dashboard/add-transaction": "Add Transaction",
  "/dashboard/monthly-analytics": "Monthly Analytics",
  "/dashboard/daily-analytics": "Daily Analytics",
  "/dashboard/transaction-history": "Transaction History",
  "/dashboard/add-loan": "Add Loan",
  "/dashboard/loan-summary": "Loan Summary",
  "/dashboard/loan-history": "Loan History",
  "/dashboard/budget-plans": "Budget Planner",
  "/dashboard/budget-plans/create": "Create Budget Plan",
};

const initials = (value) =>
  (value || "User")
    .split(/[ @]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

export default function DashboardHeader({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (!oldPassword || !newPassword) return toast.error("Please fill all fields!");
    if (newPassword.length < 6) return toast.error("New password must be at least 6 characters!");

    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      const credential = EmailAuthProvider.credential(currentUser.email, oldPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      toast.success("Password changed successfully!");
      setPasswordModalOpen(false);
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      toast.error(error.code === "auth/wrong-password" ? "Old password is incorrect!" : "Failed to change password!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 h-14 bg-surface border-b border-white/[0.07] flex items-center justify-between gap-3 px-3 md:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={onMenuClick} className="md:hidden text-[#94a3b8] hover:text-purple" title="Open menu">
            <Menu size={20} />
          </button>
          <h1 className="truncate text-[15px] font-semibold text-[#e2e8f0]">{titles[location.pathname] || (location.pathname.includes("/dashboard/budget-plans/") ? "Plan Detail" : "Dashboard")}</h1>
        </div>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <div className="hidden min-[390px]:block bg-white/[0.04] border border-white/[0.07] rounded-full px-3 py-1 text-[11px] text-[#94a3b8]">
            {today}
          </div>
          <Bell size={18} color="#475569" className="hidden min-[360px]:block" />
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((value) => !value)}
              className="flex items-center gap-2 rounded-full bg-purple/10 p-1 pr-2 text-purple hover:bg-purple/15"
            >
              <span className="w-8 h-8 rounded-full bg-purple/15 text-purple text-[12px] font-bold flex items-center justify-center">
                {initials(user?.displayName || user?.email)}
              </span>
              <ChevronDown size={15} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-white/[0.07] bg-elevated shadow-2xl">
                <div className="border-b border-white/[0.07] px-4 py-3">
                  <div className="truncate text-[13px] font-semibold text-[#e2e8f0]">{user?.displayName || "User"}</div>
                  <div className="truncate text-[11px] text-[#475569]">{user?.email}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPasswordModalOpen(true);
                    setDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-[13px] font-medium text-[#94a3b8] hover:bg-white/[0.04] hover:text-purple"
                >
                  <KeyRound size={15} />
                  Change Password
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-[13px] font-medium text-[#94a3b8] hover:bg-red/10 hover:text-red"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {passwordModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-white/[0.07] bg-elevated p-6 shadow-2xl">
            <h2 className="text-[18px] font-bold text-[#e2e8f0]">Change Password</h2>
            <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-[#475569]">Old Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(event) => setOldPassword(event.target.value)}
                  className="w-full rounded-lg border border-white/[0.07] bg-surface px-3.5 py-2.5 text-[14px] text-[#e2e8f0] outline-none transition-colors focus:border-purple/60"
                  placeholder="Enter old password"
                />
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-[#475569]">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="w-full rounded-lg border border-white/[0.07] bg-surface px-3.5 py-2.5 text-[14px] text-[#e2e8f0] outline-none transition-colors focus:border-purple/60"
                  placeholder="Enter new password"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="flex-1 rounded-lg bg-purple py-2.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-50">
                  {loading ? "Changing..." : "Change Password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPasswordModalOpen(false);
                    setOldPassword("");
                    setNewPassword("");
                  }}
                  className="flex-1 rounded-lg border border-white/[0.07] bg-white/[0.04] py-2.5 text-[14px] font-medium text-[#94a3b8] hover:bg-white/[0.07]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
