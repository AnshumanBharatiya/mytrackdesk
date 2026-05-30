import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import { Save, Scale } from "lucide-react";
import { auth, db } from "../../firebase";

const label = "block text-[11px] font-semibold tracking-wide uppercase text-[#475569] mb-2";
const input =
  "w-full bg-surface border border-white/[0.07] rounded-lg px-3.5 py-2.5 text-[14px] text-[#e2e8f0] outline-none focus:border-purple/60 transition-colors";

export default function EnterWeight() {
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState("kg");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!weight || isNaN(weight) || parseFloat(weight) <= 0) return toast.error("Please enter a valid weight!");
    setLoading(true);
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
    } catch (error) {
      console.error("Error adding weight:", error);
      toast.error("Failed to record weight!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue/10 text-blue flex items-center justify-center">
            <Scale size={22} />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-[#e2e8f0]">Enter Weight</h1>
            <p className="text-[13px] text-[#475569] mt-1">Track your daily weight progress.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className={label}>Weight</label>
              <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Enter your weight" className={input} />
            </div>
            <div>
              <label className={label}>Unit</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value)} className={input}>
                <option value="kg">Kilograms (kg)</option>
                <option value="lbs">Pounds (lbs)</option>
              </select>
            </div>
          </div>

          <div>
            <label className={label}>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes about diet, exercise, or progress" rows="5" className={`${input} resize-none`} />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-purple text-white font-semibold text-[14px] py-2.5 rounded-lg hover:opacity-85 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50">
            <Save size={18} />
            <span>{loading ? "Saving..." : "Save Weight"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
