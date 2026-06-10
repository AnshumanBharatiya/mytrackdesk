import React, { useEffect, useMemo, useState } from "react";
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, MapPinned, MessageSquare, ShieldOff, WalletCards } from "lucide-react";
import { db } from "../../firebase";
import { budgetCategories, categoryStyles, formatDate, inputClass, money, primaryButton, statusStyles } from "./budgetUtils";

export default function SharedPlanView() {
  const { shareToken } = useParams();
  const [plan, setPlan] = useState(null);
  const [items, setItems] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    const fetchSharedPlan = async () => {
      setLoading(true);
      try {
        const planSnapshot = await getDoc(doc(db, "sharedBudgetPlans", shareToken));
        if (!planSnapshot.exists() || !planSnapshot.data().shareEnabled) {
          setNotFound(true);
          return;
        }

        const planData = { id: planSnapshot.id, ...planSnapshot.data() };
        setPlan(planData);

        const itemSnapshot = await getDocs(query(collection(db, "sharedBudgetItems"), where("shareToken", "==", shareToken)));
        const rows = itemSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        rows.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        setItems(rows);

        const commentSnapshot = await getDocs(query(collection(db, "sharedBudgetComments"), where("shareToken", "==", shareToken)));
        const commentRows = commentSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        commentRows.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        setComments(commentRows);
      } catch (error) {
        console.error("Error loading shared plan:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedPlan();
  }, [shareToken]);

  const spent = useMemo(() => items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0), [items]);
  const progress = plan?.totalBudget ? Math.min((spent / plan.totalBudget) * 100, 100) : 0;
  const groupedItems = useMemo(() => {
    return budgetCategories.map((category) => ({
      category,
      items: items.filter((item) => item.category === category),
      total: items.filter((item) => item.category === category).reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    })).filter((group) => group.items.length);
  }, [items]);

  const handleAddComment = async (event) => {
    event.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;
    await addDoc(collection(db, "sharedBudgetComments"), {
      shareToken,
      planId: plan.planId,
      authorName: commentName.trim(),
      text: commentText.trim(),
      createdAt: serverTimestamp(),
    });
    setComments((current) => [{ id: Date.now().toString(), authorName: commentName.trim(), text: commentText.trim() }, ...current]);
    setCommentName("");
    setCommentText("");
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-base"><div className="h-8 w-8 animate-spin rounded-full border-[3px] border-white/[0.07] border-t-purple" /></div>;
  }

  if (notFound || !plan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base p-4 font-sans text-[#e2e8f0]">
        <div className="w-full max-w-md rounded-xl border border-white/[0.07] bg-white/[0.04] p-6 text-center">
          <ShieldOff size={42} className="mx-auto text-[#475569]" />
          <h1 className="mt-4 text-[22px] font-bold">Plan unavailable</h1>
          <p className="mt-2 text-[13px] text-[#475569]">This share link is disabled or does not exist.</p>
          <Link to="/register" className={`${primaryButton} mt-6 inline-block no-underline`}>Create your own account</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base font-sans text-[#e2e8f0]">
      <header className="border-b border-white/[0.07] bg-surface px-4 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-purple text-sm font-bold text-white">T</div>
            <div className="text-[15px] font-bold tracking-wide">
              <span className="text-white">TRACK</span><span className="text-purple">DESK</span>
            </div>
          </div>
          <Link to="/register" className={`${primaryButton} no-underline`}>Create Account</Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-4 md:p-7">
        <section className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[24px] font-bold">{plan.title}</h1>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusStyles[plan.status] || statusStyles.Planning}`}>{plan.status}</span>
              </div>
              <p className="mt-2 flex items-center gap-2 text-[13px] text-[#475569]"><MapPinned size={15} />{plan.origin || "Start"} to {plan.destination}</p>
              <p className="mt-1 flex items-center gap-2 text-[13px] text-[#475569]"><CalendarDays size={15} />{formatDate(plan.startDate)} - {formatDate(plan.endDate)}</p>
              {plan.notes && <p className="mt-4 max-w-3xl text-[13px] leading-6 text-[#94a3b8]">{plan.notes}</p>}
            </div>
            <div className="rounded-lg border border-white/[0.07] bg-surface px-4 py-3 text-[12px] text-[#94a3b8]">Read-only shared plan</div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-white/[0.07] bg-surface p-5"><p className="text-[12px] font-semibold uppercase tracking-wide text-[#475569]">Total Budget</p><p className="mt-2 text-[24px] font-bold">{money(plan.totalBudget, plan.currency)}</p></div>
            <div className="rounded-xl border border-white/[0.07] bg-surface p-5"><p className="text-[12px] font-semibold uppercase tracking-wide text-[#475569]">Spent</p><p className="mt-2 text-[24px] font-bold text-purple">{money(spent, plan.currency)}</p></div>
            <div className="rounded-xl border border-white/[0.07] bg-surface p-5"><p className="text-[12px] font-semibold uppercase tracking-wide text-[#475569]">Remaining</p><p className={`mt-2 text-[24px] font-bold ${plan.totalBudget - spent >= 0 ? "text-green" : "text-red"}`}>{money(plan.totalBudget - spent, plan.currency)}</p></div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex justify-between text-[12px] text-[#94a3b8]"><span>Budget progress</span><span>{progress.toFixed(0)}%</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full rounded-full bg-purple" style={{ width: `${progress}%` }} /></div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2"><WalletCards size={20} className="text-purple" /><h2 className="text-[18px] font-bold">Budget Items</h2></div>
          {!items.length ? (
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.04] py-16 text-center text-[14px] text-[#475569]">No budget items added yet.</div>
          ) : (
            groupedItems.map((group) => (
              <div key={group.category} className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.04]">
                <div className="flex items-center justify-between border-b border-white/[0.07] bg-surface px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${categoryStyles[group.category]}`}>{group.category}</span>
                    {Number(plan.categoryLimits?.[group.category]) > 0 && (
                      <span className={`text-[11px] ${group.total > Number(plan.categoryLimits[group.category]) ? "text-red" : "text-[#475569]"}`}>Limit {money(plan.categoryLimits[group.category], plan.currency)}</span>
                    )}
                  </div>
                  <span className="text-[13px] font-semibold">{money(group.total, plan.currency)}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[13px]">
                    <thead className="bg-surface"><tr>{["Date", "Item", "Notes", "Amount"].map((head) => <th key={head} className="border-b border-white/[0.07] px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#475569]">{head}</th>)}</tr></thead>
                    <tbody>{group.items.map((item) => <tr key={item.id} className="hover:bg-white/[0.04]"><td className="border-b border-white/[0.07] px-4 py-3">{formatDate(item.date)}</td><td className="border-b border-white/[0.07] px-4 py-3 font-medium">{item.title}</td><td className="border-b border-white/[0.07] px-4 py-3 text-[#94a3b8]">{item.notes || <span className="text-[#475569]">No notes</span>}</td><td className="border-b border-white/[0.07] px-4 py-3 font-semibold">{money(item.amount, plan.currency)}</td></tr>)}</tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </section>

        <section className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-6">
          <div className="mb-5 flex items-center gap-2"><MessageSquare size={20} className="text-amber" /><h2 className="text-[18px] font-bold">Comments</h2></div>
          <form onSubmit={handleAddComment} className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-12">
            <input value={commentName} onChange={(event) => setCommentName(event.target.value)} className={`${inputClass} md:col-span-3`} placeholder="Your name" />
            <input value={commentText} onChange={(event) => setCommentText(event.target.value)} className={`${inputClass} md:col-span-7`} placeholder="Add a comment" />
            <button className={`${primaryButton} md:col-span-2`}>Comment</button>
          </form>
          <div className="space-y-3">
            {comments.length ? comments.map((comment) => (
              <div key={comment.id} className="rounded-lg border border-white/[0.07] bg-surface p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold">{comment.authorName || "Guest"}</span>
                  <span className="text-[11px] text-[#475569]">{comment.createdAt?.toDate?.().toLocaleString("en-GB") || "Just now"}</span>
                </div>
                <p className="mt-2 text-[13px] leading-6 text-[#94a3b8]">{comment.text}</p>
              </div>
            )) : <p className="rounded-lg border border-white/[0.07] bg-surface p-4 text-[13px] text-[#475569]">No comments yet.</p>}
          </div>
        </section>

        <section className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-6 text-center">
          <h2 className="text-[18px] font-bold">Plan your own budget with TrackDesk</h2>
          <p className="mx-auto mt-2 max-w-xl text-[13px] text-[#475569]">Create trip plans, add budget items, and share read-only views with friends.</p>
          <Link to="/register" className={`${primaryButton} mt-5 inline-block no-underline`}>Create your own account</Link>
        </section>
      </main>
    </div>
  );
}
