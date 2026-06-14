import React, { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import { Link } from "react-router-dom";
import { CalendarDays, MapPinned, PlusCircle, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { auth, db } from "../../firebase";
import { formatDate, money, primaryButton, statusStyles } from "./budgetUtils";

export default function PlanList() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharedLoadWarning, setSharedLoadWarning] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    setSharedLoadWarning(false);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const ownedSnapshot = await getDocs(query(collection(db, "budgetPlans"), where("userId", "==", user.uid)));
      const planMap = new Map();
      ownedSnapshot.docs.forEach((item) => {
        planMap.set(item.id, { id: item.id, ...item.data() });
      });

      if (user.email) {
        try {
          const sharedSnapshot = await getDocs(query(collection(db, "budgetPlans"), where("collaboratorEmails", "array-contains", user.email.toLowerCase())));
          sharedSnapshot.docs.forEach((item) => {
            planMap.set(item.id, { id: item.id, ...item.data() });
          });
        } catch (error) {
          console.error("Error loading shared budget plans:", error);
          setSharedLoadWarning(true);
        }
      }

      const rows = Array.from(planMap.values());
      rows.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setPlans(rows);
    } catch (error) {
      console.error("Error loading budget plans:", error);
      toast.error("Failed to load budget plans!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDelete = async (event, planId) => {
    event.preventDefault();
    event.stopPropagation();
    const result = await Swal.fire({
      title: "Delete this plan?",
      text: "Budget items inside this plan will stay in Firestore unless removed by rules or cleanup later.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f87171",
      cancelButtonColor: "#475569",
      confirmButtonText: "Yes, delete it",
    });
    if (!result.isConfirmed) return;
    await deleteDoc(doc(db, "budgetPlans", planId));
    toast.success("Plan deleted!");
    fetchPlans();
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-[3px] border-white/[0.07] border-t-purple" /></div>;
  }

  const user = auth.currentUser;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[22px] font-bold text-[#e2e8f0]">My Budget Plans</h1>
          <p className="mt-1 text-[13px] text-[#475569]">All trip budgets for your account.</p>
        </div>
        <Link to="/dashboard/budget-plans/create" className={`${primaryButton} inline-flex items-center justify-center gap-2 no-underline`}>
          <PlusCircle size={16} />
          Create Plan
        </Link>
      </div>

      {sharedLoadWarning && (
        <div className="rounded-xl border border-amber/20 bg-amber/10 px-4 py-3 text-[13px] text-amber">
          Your own plans loaded, but shared collaborator plans need updated Firestore rules.
        </div>
      )}

      {!plans.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.04] py-16 text-center">
          <MapPinned size={40} color="#475569" />
          <p className="mt-3 text-[14px] text-[#475569]">No budget plans yet.</p>
          <Link to="/dashboard/budget-plans/create" className={`${primaryButton} mt-5 no-underline`}>Create your first plan</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <Link key={plan.id} to={`/dashboard/budget-plans/${plan.id}`} className="block rounded-xl border border-white/[0.07] bg-white/[0.04] p-5 no-underline transition-all duration-200 hover:-translate-y-1 hover:border-purple/40">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-[17px] font-bold text-[#e2e8f0]">{plan.title}</h2>
                  <p className="mt-1 flex items-center gap-2 text-[13px] text-[#475569]">
                    <MapPinned size={14} />
                    <span className="truncate">{plan.origin || "Start"} to {plan.destination}</span>
                  </p>
                </div>
                {plan.userId === user?.uid && (
                  <button onClick={(event) => handleDelete(event, plan.id)} className="rounded-md p-1.5 text-[#475569] transition-colors hover:bg-red/10 hover:text-red" title="Delete plan">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between">
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusStyles[plan.status] || statusStyles.Planning}`}>{plan.status}</span>
                {plan.userId !== user?.uid && <span className="rounded-full bg-purple/10 px-2.5 py-0.5 text-[11px] font-medium text-purple">Shared</span>}
                <span className="text-[18px] font-bold text-[#e2e8f0]">{money(plan.totalBudget, plan.currency)}</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-[12px] text-[#475569]">
                <CalendarDays size={14} />
                <span>{formatDate(plan.startDate)} - {formatDate(plan.endDate)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
