import React, { useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { toast } from "react-toastify";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Calendar, Filter, PlusCircle, Save, Trash2, Weight as WeightIcon, X } from "lucide-react";
import Swal from "sweetalert2";
import Pagination from "../common/Pagination";
import { auth, db } from "../../firebase";

const input = "w-full bg-surface border border-white/[0.07] rounded-lg px-3.5 py-2.5 text-[14px] text-[#e2e8f0] outline-none focus:border-purple/60 transition-colors";
const label = "block text-[11px] font-semibold tracking-wide uppercase text-[#475569] mb-2";
const chartTooltip = {
  background: "#0d1428",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "#e2e8f0",
};

export default function TrackWeight() {
  const [weights, setWeights] = useState([]);
  const [filteredWeights, setFilteredWeights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ current: 0, highest: 0, lowest: 0, trend: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minWeight, setMinWeight] = useState("");
  const [maxWeight, setMaxWeight] = useState("");
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState("kg");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWeights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weights, startDate, endDate, minWeight, maxWeight]);

  const fetchWeights = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const q = query(collection(db, "weights"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const data = [];
      snapshot.forEach((item) => {
        const row = item.data();
        const createdDate = row.createdAt?.toDate();
        data.push({
          id: item.id,
          ...row,
          dateObj: createdDate,
          date: createdDate?.toLocaleDateString("en-GB") || "N/A",
          fullDate: createdDate?.toISOString().split("T")[0] || "",
        });
      });
      data.sort((a, b) => (b.dateObj?.getTime() || 0) - (a.dateObj?.getTime() || 0));
      setWeights(data);
      setFilteredWeights(data);
      calculateStats(data);
    } catch (error) {
      console.log("Error fetching weights:", error);
      toast.error("Failed to load weight data!");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...weights];
    if (startDate) filtered = filtered.filter((w) => w.fullDate >= startDate);
    if (endDate) filtered = filtered.filter((w) => w.fullDate <= endDate);
    if (minWeight) filtered = filtered.filter((w) => w.weight >= parseFloat(minWeight));
    if (maxWeight) filtered = filtered.filter((w) => w.weight <= parseFloat(maxWeight));
    setFilteredWeights(filtered);
    calculateStats(filtered);
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setMinWeight("");
    setMaxWeight("");
  };

  const calculateStats = (data) => {
    if (!data.length) return setStats({ current: 0, highest: 0, lowest: 0, trend: 0 });
    const values = data.map((row) => row.weight);
    setStats({
      current: values[0],
      highest: Math.max(...values),
      lowest: Math.min(...values),
      trend: data.length > 1 ? values[0] - values[values.length - 1] : 0,
    });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Are you sure you want to delete this entry?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f87171",
      cancelButtonColor: "#475569",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      await deleteDoc(doc(db, "weights", id));
      toast.success("Weight entry deleted!");
      fetchWeights();
    }
  };

  const handleAddWeight = async (event) => {
    event.preventDefault();
    if (!weight || isNaN(weight) || parseFloat(weight) <= 0) return toast.error("Please enter a valid weight!");

    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) return toast.error("You must be logged in!");
      await addDoc(collection(db, "weights"), {
        userId: user.uid,
        weight: parseFloat(weight),
        unit,
        notes: notes.trim(),
        createdAt: serverTimestamp(),
      });
      toast.success("Weight recorded successfully!");
      setWeight("");
      setNotes("");
      setEntryModalOpen(false);
      await fetchWeights();
    } catch (error) {
      console.error("Error adding weight:", error);
      toast.error("Failed to record weight!");
    } finally {
      setSaving(false);
    }
  };

  const entryModal = entryModalOpen && (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-white/[0.07] bg-elevated p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-[#e2e8f0]">Enter Weight</h2>
            <p className="text-[13px] text-[#475569] mt-1">Add a new weight entry and refresh the chart.</p>
          </div>
          <button
            type="button"
            onClick={() => setEntryModalOpen(false)}
            className="rounded-md p-1.5 text-[#475569] hover:bg-white/[0.07] hover:text-[#94a3b8]"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleAddWeight} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className={label}>Weight</label>
              <input type="number" step="0.1" value={weight} onChange={(event) => setWeight(event.target.value)} placeholder="Enter your weight" className={input} />
            </div>
            <div>
              <label className={label}>Unit</label>
              <select value={unit} onChange={(event) => setUnit(event.target.value)} className={input}>
                <option value="kg">Kilograms (kg)</option>
                <option value="lbs">Pounds (lbs)</option>
              </select>
            </div>
          </div>

          <div>
            <label className={label}>Notes</label>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add notes about diet, exercise, or progress" rows="4" className={`${input} resize-none`} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" disabled={saving} className="flex-1 bg-purple text-white font-semibold text-[14px] py-2.5 rounded-lg hover:opacity-85 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50">
              <Save size={18} />
              <span>{saving ? "Saving..." : "Save Weight"}</span>
            </button>
            <button type="button" onClick={() => setEntryModalOpen(false)} className="bg-white/[0.04] border border-white/[0.07] text-[#94a3b8] font-medium text-[14px] py-2.5 px-5 rounded-lg hover:bg-white/[0.07]">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const chartData = filteredWeights.slice().reverse().map((w) => ({ date: w.date, weight: w.weight }));
  const totalPages = Math.ceil(filteredWeights.length / itemsPerPage);
  const currentWeights = filteredWeights.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const displayUnit = filteredWeights[0]?.unit || "kg";

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-[3px] border-white/[0.07] border-t-purple animate-spin mx-auto" /></div>;

  if (!weights.length) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white/[0.04] border border-white/[0.07] rounded-xl">
          <WeightIcon size={40} color="#475569" />
          <p className="text-[14px] text-[#475569] mt-3">No weight data yet.</p>
          <button onClick={() => setEntryModalOpen(true)} className="mt-5 bg-purple text-white font-semibold text-[14px] py-2.5 px-5 rounded-lg hover:opacity-85 transition-opacity flex items-center gap-2">
            <PlusCircle size={16} /> Enter Weight
          </button>
        </div>
        {entryModal}
      </>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-[#e2e8f0]">Track Weight</h1>
          <p className="text-[13px] text-[#475569] mt-1">Review trends and history.</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button onClick={() => setEntryModalOpen(true)} className="bg-purple text-white font-semibold text-[14px] py-2.5 px-5 rounded-lg hover:opacity-85 transition-opacity flex items-center gap-2">
            <PlusCircle size={16} /> Enter Weight
          </button>
          <button onClick={() => setShowFilters(!showFilters)} className="bg-white/[0.04] border border-white/[0.07] text-[#94a3b8] font-medium text-[14px] py-2.5 px-5 rounded-lg hover:bg-white/[0.07] flex items-center gap-2">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div><label className={label}>Start Date</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={input} /></div>
            <div><label className={label}>End Date</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={input} /></div>
            <div><label className={label}>Min Weight</label><input type="number" step="0.1" value={minWeight} onChange={(e) => setMinWeight(e.target.value)} className={input} /></div>
            <div><label className={label}>Max Weight</label><input type="number" step="0.1" value={maxWeight} onChange={(e) => setMaxWeight(e.target.value)} className={input} /></div>
          </div>
          <button onClick={clearFilters} className="mt-4 bg-white/[0.04] border border-white/[0.07] text-[#94a3b8] font-medium text-[14px] py-2.5 px-5 rounded-lg hover:bg-white/[0.07]">Clear Filters</button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ["Current", stats.current],
          ["Highest", stats.highest],
          ["Lowest", stats.lowest],
          ["Trend", Math.abs(stats.trend).toFixed(1)],
        ].map(([title, value]) => (
          <div key={title} className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-5">
            <p className="text-[13px] font-semibold text-[#94a3b8]">{title}</p>
            <p className="text-[26px] font-bold text-[#e2e8f0] mt-1">{value} <span className="text-[14px] text-[#475569]">{displayUnit}</span></p>
          </div>
        ))}
      </div>

      <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-5">
        <h2 className="text-[15px] font-semibold text-[#e2e8f0] mb-4">Weight Progress Chart</h2>
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={chartData}>
            <defs>
              <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={chartTooltip} labelStyle={{ color: "#94a3b8" }} formatter={(value) => [value.toFixed(1), "Weight"]} />
            <Line type="monotone" dataKey="weight" stroke="#a78bfa" strokeWidth={3} dot={{ fill: "#a78bfa", r: 4 }} activeDot={{ r: 6, fill: "#c4b5fd" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="px-4 py-3 text-[15px] font-semibold text-[#e2e8f0] border-b border-white/[0.07]">Weight History</div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead className="bg-surface">
              <tr>
                {["Date", "Weight", "Notes", "Action"].map((head) => <th key={head} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#475569] border-b border-white/[0.07]">{head}</th>)}
              </tr>
            </thead>
            <tbody>
              {currentWeights.map((entry) => (
                <tr key={entry.id} className="hover:bg-white/[0.04]">
                  <td className="px-4 py-3 text-[#e2e8f0] border-b border-white/[0.07]"><span className="flex items-center gap-2"><Calendar size={15} className="text-blue" />{entry.date}</span></td>
                  <td className="px-4 py-3 text-[#e2e8f0] border-b border-white/[0.07]">{entry.weight} {entry.unit}</td>
                  <td className="px-4 py-3 text-[#e2e8f0] border-b border-white/[0.07]">{entry.notes || <span className="text-[#475569]">No notes</span>}</td>
                  <td className="px-4 py-3 border-b border-white/[0.07]"><button onClick={() => handleDelete(entry.id)} className="p-1.5 rounded-md text-[#475569] hover:bg-red/10 hover:text-red transition-colors"><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={itemsPerPage} totalItems={filteredWeights.length} />
      </div>
      {entryModal}
    </div>
  );
}
