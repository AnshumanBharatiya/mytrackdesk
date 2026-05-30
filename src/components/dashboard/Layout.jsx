import React, { useState } from "react";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-base font-sans text-[#e2e8f0]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-w-0 flex-1 flex flex-col md:ml-[220px]">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="min-w-0 flex-1 overflow-x-hidden p-3 md:p-7 bg-base">{children}</main>
      </div>
    </div>
  );
}
