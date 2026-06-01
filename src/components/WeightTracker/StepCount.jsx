import React from "react";
import { Footprints } from "lucide-react";

export default function StepCount() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue/10 text-blue flex items-center justify-center">
            <Footprints size={22} />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-[#e2e8f0]">Step Count</h1>
            <p className="text-[13px] text-[#475569] mt-1">Step tracking will live here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
