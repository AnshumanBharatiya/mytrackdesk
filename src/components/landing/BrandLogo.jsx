import { BarChart3 } from "lucide-react";

export default function BrandLogo({ light = false }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-600 text-white shadow-sm">
        <BarChart3 size={22} />
      </span>
      <span className={`text-xl font-bold ${light ? "text-white" : "text-slate-950"}`}>
        MyTrackDesk
      </span>
    </div>
  );
}
