import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { MapPinned, Save } from "lucide-react";
import { toast } from "react-toastify";
import { auth, db } from "../../firebase";
import { currencies, emptyCategoryLimits, inputClass, labelClass, makeShareToken, planStatuses, primaryButton, secondaryButton } from "./budgetUtils";

export default function CreatePlan() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    origin: "",
    destination: "",
    startDate: "",
    endDate: "",
    totalBudget: "",
    currency: "INR",
    status: "Planning",
    notes: "",
  });

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.destination.trim() || !form.totalBudget || Number(form.totalBudget) <= 0) {
      return toast.error("Please add title, destination, and a valid budget!");
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return toast.error("You must be logged in!");
      const docRef = await addDoc(collection(db, "budgetPlans"), {
        userId: user.uid,
        title: form.title.trim(),
        origin: form.origin.trim(),
        destination: form.destination.trim(),
        startDate: form.startDate || "",
        endDate: form.endDate || "",
        totalBudget: Number(form.totalBudget),
        currency: form.currency,
        status: form.status,
        notes: form.notes.trim(),
        collaboratorEmails: [],
        categoryLimits: emptyCategoryLimits(),
        shareToken: makeShareToken(),
        shareEnabled: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success("Budget plan created!");
      navigate(`/dashboard/budget-plans/${docRef.id}`);
    } catch (error) {
      console.error("Error creating budget plan:", error);
      toast.error("Failed to create budget plan!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple/10 text-purple">
            <MapPinned size={24} />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-[#e2e8f0]">Create Budget Plan</h1>
            <p className="mt-1 text-[13px] text-[#475569]">Plan a trip budget with dates, route, and notes.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>Trip Title</label>
            <input value={form.title} onChange={(event) => update("title", event.target.value)} className={inputClass} placeholder="Goa winter trip" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Origin</label>
              <input value={form.origin} onChange={(event) => update("origin", event.target.value)} className={inputClass} placeholder="Kolkata" />
            </div>
            <div>
              <label className={labelClass}>Destination</label>
              <input value={form.destination} onChange={(event) => update("destination", event.target.value)} className={inputClass} placeholder="Goa" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Start Date</label>
              <input type="date" value={form.startDate} onChange={(event) => update("startDate", event.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>End Date</label>
              <input type="date" value={form.endDate} onChange={(event) => update("endDate", event.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className={labelClass}>Budget</label>
              <input type="number" min="1" step="1" value={form.totalBudget} onChange={(event) => update("totalBudget", event.target.value)} className={inputClass} placeholder="25000" />
            </div>
            <div>
              <label className={labelClass}>Currency</label>
              <select value={form.currency} onChange={(event) => update("currency", event.target.value)} className={inputClass}>
                {currencies.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select value={form.status} onChange={(event) => update("status", event.target.value)} className={inputClass}>
                {planStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} rows="4" className={`${inputClass} resize-none`} placeholder="Add hotel ideas, route notes, or reminders" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" disabled={loading} className={`${primaryButton} flex flex-1 items-center justify-center gap-2`}>
              <Save size={18} />
              {loading ? "Creating..." : "Create Plan"}
            </button>
            <button type="button" onClick={() => navigate("/dashboard/budget-plans")} className={secondaryButton}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
