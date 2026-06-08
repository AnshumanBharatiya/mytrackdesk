import React, { useEffect, useMemo, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CalendarDays, Link as LinkIcon, MapPinned, PlusCircle, Trash2, WalletCards } from "lucide-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { auth, db } from "../../firebase";
import { budgetCategories, categoryStyles, formatDate, inputClass, labelClass, money, primaryButton, secondaryButton, statusStyles } from "./budgetUtils";

export default function PlanDetail() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ category: "Travel", title: "", amount: "", date: new Date().toISOString().split("T")[0], notes: "" });

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDoc(doc(db, "budgetPlans", planId));
      if (!snap.exists() || snap.data().userId !== user.uid) {
        toast.error("Plan not found!");
        navigate("/dashboard/budget-plans");
        return;
      }
      setPlan({ id: snap.id, ...snap.data() });
      await fetchItems(user.uid);
    } catch (error) {
      console.error("Error loading plan:", error);
      toast.error("Failed to load plan!");
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async (userId = auth.currentUser?.uid) => {
    if (!userId) return;
    const snapshot = await getDocs(query(collection(db, "budgetItems"), where("userId", "==", userId), where("planId", "==", planId)));
    const rows = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    rows.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    setItems(rows);
  };

  useEffect(() => {
    fetchPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  const spent = useMemo(() => items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0), [items]);
  const progress = plan?.totalBudget ? Math.min((spent / plan.totalBudget) * 100, 100) : 0;
  const groupedItems = useMemo(() => {
    return budgetCategories.map((category) => ({
      category,
      items: items.filter((item) => item.category === category),
      total: items.filter((item) => item.category === category).reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    })).filter((group) => group.items.length);
  }, [items]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleAddItem = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.amount || Number(form.amount) <= 0) return toast.error("Please add item name and valid amount!");

    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) return toast.error("You must be logged in!");
      await addDoc(collection(db, "budgetItems"), {
        userId: user.uid,
        planId,
        category: form.category,
        title: form.title.trim(),
        amount: Number(form.amount),
        date: form.date || "",
        notes: form.notes.trim(),
        createdAt: serverTimestamp(),
      });
      toast.success("Budget item added!");
      setForm({ category: "Travel", title: "", amount: "", date: new Date().toISOString().split("T")[0], notes: "" });
      fetchItems(user.uid);
    } catch (error) {
      console.error("Error adding budget item:", error);
      toast.error("Failed to add budget item!");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    const result = await Swal.fire({
      title: "Delete this item?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f87171",
      cancelButtonColor: "#475569",
      confirmButtonText: "Yes, delete it",
    });
    if (!result.isConfirmed) return;
    await deleteDoc(doc(db, "budgetItems", itemId));
    toast.success("Item deleted!");
    fetchItems();
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-[3px] border-white/[0.07] border-t-purple" /></div>;
  }

  if (!plan) return null;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[22px] font-bold text-[#e2e8f0]">{plan.title}</h1>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusStyles[plan.status] || statusStyles.Planning}`}>{plan.status}</span>
            </div>
            <p className="mt-2 flex items-center gap-2 text-[13px] text-[#475569]">
              <MapPinned size={15} />
              {plan.origin || "Start"} to {plan.destination}
            </p>
            <p className="mt-1 flex items-center gap-2 text-[13px] text-[#475569]">
              <CalendarDays size={15} />
              {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
            </p>
            {plan.notes && <p className="mt-4 max-w-3xl text-[13px] leading-6 text-[#94a3b8]">{plan.notes}</p>}
          </div>
          <Link to="/dashboard/budget-plans" className={`${secondaryButton} text-center no-underline`}>Back to Plans</Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-white/[0.07] bg-surface p-5">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-[#475569]">Total Budget</p>
            <p className="mt-2 text-[24px] font-bold text-[#e2e8f0]">{money(plan.totalBudget, plan.currency)}</p>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-surface p-5">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-[#475569]">Spent</p>
            <p className="mt-2 text-[24px] font-bold text-purple">{money(spent, plan.currency)}</p>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-surface p-5">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-[#475569]">Remaining</p>
            <p className={`mt-2 text-[24px] font-bold ${plan.totalBudget - spent >= 0 ? "text-green" : "text-red"}`}>{money(plan.totalBudget - spent, plan.currency)}</p>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex justify-between text-[12px] text-[#94a3b8]">
            <span>Budget progress</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
            <div className="h-full rounded-full bg-purple transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple/10 text-purple">
            <PlusCircle size={21} />
          </div>
          <div>
            <h2 className="text-[18px] font-bold text-[#e2e8f0]">Add Budget Item</h2>
            <p className="mt-1 text-[13px] text-[#475569]">Add travel, stay, food, activity, shopping, or misc costs.</p>
          </div>
        </div>

        <form onSubmit={handleAddItem} className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-2">
            <label className={labelClass}>Category</label>
            <select value={form.category} onChange={(event) => update("category", event.target.value)} className={inputClass}>
              {budgetCategories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </div>
          <div className="lg:col-span-3">
            <label className={labelClass}>Item</label>
            <input value={form.title} onChange={(event) => update("title", event.target.value)} className={inputClass} placeholder="Hotel advance" />
          </div>
          <div className="lg:col-span-2">
            <label className={labelClass}>Amount</label>
            <input type="number" min="1" step="1" value={form.amount} onChange={(event) => update("amount", event.target.value)} className={inputClass} placeholder="4500" />
          </div>
          <div className="lg:col-span-2">
            <label className={labelClass}>Date</label>
            <input type="date" value={form.date} onChange={(event) => update("date", event.target.value)} className={inputClass} />
          </div>
          <div className="lg:col-span-3">
            <label className={labelClass}>Notes</label>
            <input value={form.notes} onChange={(event) => update("notes", event.target.value)} className={inputClass} placeholder="Optional" />
          </div>
          <div className="lg:col-span-12">
            <button type="submit" disabled={saving} className={`${primaryButton} w-full sm:w-auto`}>
              {saving ? "Adding..." : "Add Item"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-bold text-[#e2e8f0]">Share Link</h2>
            <p className="mt-1 text-[13px] text-[#475569]">Phase 2: enable public read-only sharing from here.</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.04] text-[#475569]">
            <LinkIcon size={19} />
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-dashed border-white/[0.07] bg-surface px-3.5 py-3 text-[13px] text-[#475569]">
          Sharing is disabled for v1 phase 1. Token reserved: {plan.shareToken || "not created"}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <WalletCards size={20} className="text-purple" />
          <h2 className="text-[18px] font-bold text-[#e2e8f0]">Budget Items</h2>
        </div>

        {!items.length ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.04] py-16 text-center">
            <WalletCards size={40} color="#475569" />
            <p className="mt-3 text-[14px] text-[#475569]">No budget items yet.</p>
          </div>
        ) : (
          groupedItems.map((group) => (
            <div key={group.category} className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.04]">
              <div className="flex items-center justify-between border-b border-white/[0.07] bg-surface px-4 py-3">
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${categoryStyles[group.category]}`}>{group.category}</span>
                <span className="text-[13px] font-semibold text-[#e2e8f0]">{money(group.total, plan.currency)}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                  <thead className="bg-surface">
                    <tr>
                      {["Date", "Item", "Notes", "Amount", "Action"].map((head) => (
                        <th key={head} className="border-b border-white/[0.07] px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#475569]">{head}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.04]">
                        <td className="border-b border-white/[0.07] px-4 py-3 text-[#e2e8f0]">{formatDate(item.date)}</td>
                        <td className="border-b border-white/[0.07] px-4 py-3 font-medium text-[#e2e8f0]">{item.title}</td>
                        <td className="border-b border-white/[0.07] px-4 py-3 text-[#94a3b8]">{item.notes || <span className="text-[#475569]">No notes</span>}</td>
                        <td className="border-b border-white/[0.07] px-4 py-3 font-semibold text-[#e2e8f0]">{money(item.amount, plan.currency)}</td>
                        <td className="border-b border-white/[0.07] px-4 py-3">
                          <button onClick={() => handleDeleteItem(item.id)} className="rounded-md p-1.5 text-[#475569] transition-colors hover:bg-red/10 hover:text-red">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
