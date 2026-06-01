import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import {
  BarChart3,
  Calendar,
  ChevronRight,
  DollarSign,
  Footprints,
  HandCoins,
  Home,
  LogOut,
  PlusCircle,
  Scale,
  Table,
  X,
} from "lucide-react";

const navBase =
  "flex items-center gap-2.5 px-4 py-2 mx-2 my-0.5 rounded-lg text-[13px] font-medium text-[#475569] no-underline transition-all duration-150 hover:bg-white/[0.04] hover:text-[#94a3b8]";
const navActive = "bg-purple/15 text-purple border-l-2 border-purple pl-[14px]";
const subBase =
  "flex items-center gap-2 pl-10 pr-4 py-1.5 mx-2 text-[12px] font-medium text-[#475569] no-underline rounded-lg hover:bg-white/[0.04] hover:text-[#94a3b8] transition-all";
const subActive = "text-purple bg-purple/10";

const initials = (user) =>
  (user?.displayName || user?.email || "User")
    .split(/[ @]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

function SectionLabel({ children }) {
  return (
    <div className="px-5 pt-4 pb-1 text-[10px] font-semibold tracking-widest text-[#475569] uppercase">
      {children}
    </div>
  );
}

function MainLink({ to, icon: Icon, children, onClick }) {
  return (
    <NavLink to={to} end onClick={onClick} className={({ isActive }) => `${navBase} ${isActive ? navActive : ""}`}>
      <Icon size={16} />
      <span>{children}</span>
    </NavLink>
  );
}

function SubLink({ to, icon: Icon, children, onClick }) {
  return (
    <NavLink to={to} onClick={onClick} className={({ isActive }) => `${subBase} ${isActive ? subActive : ""}`}>
      <Icon size={14} />
      <span>{children}</span>
    </NavLink>
  );
}

export default function Sidebar({ open = false, onClose = () => {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = auth.currentUser;
  const [weightOpen, setWeightOpen] = useState(location.pathname.includes("weight") || location.pathname.includes("step-count"));
  const [expenseOpen, setExpenseOpen] = useState(location.pathname.includes("transaction") || location.pathname.includes("analytics"));
  const [loanOpen, setLoanOpen] = useState(location.pathname.includes("loan"));

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const groupButton = (active, Icon, label, expanded, onClick) => (
    <button
      type="button"
      onClick={onClick}
      className={`${navBase} w-[calc(100%-16px)] justify-between text-left ${active ? "bg-purple/15 text-purple border-l-2 border-purple pl-[14px]" : ""}`}
    >
      <span className="flex items-center gap-2.5">
        <Icon size={16} />
        <span>{label}</span>
      </span>
      <ChevronRight size={15} className={`transition-transform ${expanded ? "rotate-90" : ""}`} />
    </button>
  );

  return (
    <>
      <aside
        className={`fixed top-0 left-0 h-screen w-[220px] bg-surface border-r border-white/[0.07] flex flex-col z-50 overflow-y-auto transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-purple flex items-center justify-center text-white font-bold text-sm">
            T
          </div>
          <div className="font-bold text-[15px] tracking-wide">
            <span className="text-white">TRACK</span>
            <span className="text-purple">DESK</span>
          </div>
          <button onClick={onClose} className="ml-auto text-[#475569] hover:text-[#94a3b8] md:hidden" title="Close menu">
            <X size={18} />
          </button>
        </div>

        <SectionLabel>Trackers</SectionLabel>
        <nav className="space-y-0.5">
          <MainLink to="/dashboard" icon={Home} onClick={onClose}>Dashboard</MainLink>
          {groupButton(location.pathname.includes("weight") || location.pathname.includes("step-count"), Scale, "Weight Tracker", weightOpen, () => setWeightOpen((value) => !value))}
          {weightOpen && (
            <>
              <SubLink to="/dashboard/track-weight" icon={BarChart3} onClick={onClose}>Track Weight</SubLink>
              <SubLink to="/dashboard/step-count" icon={Footprints} onClick={onClose}>Step Count</SubLink>
            </>
          )}
          {groupButton(location.pathname.includes("transaction") || location.pathname.includes("analytics"), DollarSign, "Expense Tracker", expenseOpen, () => setExpenseOpen((value) => !value))}
          {expenseOpen && (
            <>
              <SubLink to="/dashboard/add-transaction" icon={PlusCircle} onClick={onClose}>Add Transaction</SubLink>
              <SubLink to="/dashboard/monthly-analytics" icon={BarChart3} onClick={onClose}>Monthly Analytics</SubLink>
              <SubLink to="/dashboard/daily-analytics" icon={Calendar} onClick={onClose}>Daily Analytics</SubLink>
              <SubLink to="/dashboard/transaction-history" icon={Table} onClick={onClose}>History</SubLink>
            </>
          )}
          {groupButton(location.pathname.includes("loan"), HandCoins, "Loan Tracker", loanOpen, () => setLoanOpen((value) => !value))}
          {loanOpen && (
            <>
              <SubLink to="/dashboard/add-loan" icon={PlusCircle} onClick={onClose}>Add Loan</SubLink>
              <SubLink to="/dashboard/loan-summary" icon={BarChart3} onClick={onClose}>Summary</SubLink>
              <SubLink to="/dashboard/loan-history" icon={Table} onClick={onClose}>History</SubLink>
            </>
          )}
        </nav>

        <SectionLabel>Account</SectionLabel>
        <div className="mt-auto border-t border-white/[0.07] p-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-purple/15 text-purple text-[12px] font-bold flex items-center justify-center">
              {initials(user)}
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-medium text-[#e2e8f0] truncate">{user?.displayName || "User"}</div>
              <div className="text-[11px] text-[#475569] truncate">{user?.email}</div>
            </div>
            <button onClick={handleLogout} className="ml-auto text-[#475569] hover:text-red transition-colors" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {open && <button type="button" aria-label="Close sidebar" onClick={onClose} className="fixed inset-0 bg-black/60 z-40 md:hidden" />}
    </>
  );
}
