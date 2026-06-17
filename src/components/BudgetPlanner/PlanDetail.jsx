import React, { useEffect, useMemo, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where, writeBatch } from "firebase/firestore";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CalendarDays, Link as LinkIcon, MapPinned, MessageSquare, PlusCircle, Trash2, Users, WalletCards } from "lucide-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { auth, db } from "../../firebase";
import { budgetCategories, categoryStyles, formatDate, inputClass, labelClass, makeShareToken, money, primaryButton, secondaryButton, statusStyles } from "./budgetUtils";

export default function PlanDetail() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [items, setItems] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shareSaving, setShareSaving] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [form, setForm] = useState({ category: "Travel", title: "", amount: "", date: new Date().toISOString().split("T")[0], notes: "" });

  const fetchItems = async () => {
    const snapshot = await getDocs(query(collection(db, "budgetItems"), where("planId", "==", planId)));
    const rows = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    rows.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    setItems(rows);
  };

  const fetchComments = async (shareToken = plan?.shareToken) => {
    const privateSnapshot = await getDocs(query(collection(db, "budgetComments"), where("planId", "==", planId)));
    const rows = privateSnapshot.docs.map((item) => ({ id: item.id, source: "private", ...item.data() }));
    if (shareToken) {
      const sharedSnapshot = await getDocs(query(collection(db, "sharedBudgetComments"), where("shareToken", "==", shareToken)));
      sharedSnapshot.docs.forEach((item) => rows.push({ id: item.id, source: "shared", ...item.data() }));
    }
    rows.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    setComments(rows);
  };

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDoc(doc(db, "budgetPlans", planId));
      const data = snap.data();
      const collaboratorEmails = data?.collaboratorEmails || [];
      if (!snap.exists() || (data.userId !== user.uid && !collaboratorEmails.includes(user.email?.toLowerCase()))) {
        toast.error("Plan not found!");
        navigate("/dashboard/budget-plans");
        return;
      }
      const planData = { id: snap.id, ...data };
      setPlan(planData);
      fetchItems().catch((error) => {
        console.error("Error loading budget items:", error);
        toast.error("Failed to load budget items!");
      });
      fetchComments(planData.shareToken).catch((error) => {
        console.error("Error loading comments:", error);
        toast.error("Failed to load comments!");
      });
    } catch (error) {
      console.error("Error loading plan:", error);
      toast.error("Failed to load plan!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  const spent = useMemo(() => items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0), [items]);
  const progress = plan?.totalBudget ? Math.min((spent / plan.totalBudget) * 100, 100) : 0;
  const currentUser = auth.currentUser;
  const isOwner = currentUser?.uid === plan?.userId;
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
      const itemData = {
        userId: user.uid,
        planId,
        category: form.category,
        title: form.title.trim(),
        amount: Number(form.amount),
        date: form.date || "",
        notes: form.notes.trim(),
        createdAt: serverTimestamp(),
      };
      const itemRef = await addDoc(collection(db, "budgetItems"), itemData);
      if (plan.shareEnabled && plan.shareToken) {
        await setDoc(doc(db, "sharedBudgetItems", itemRef.id), {
          shareToken: plan.shareToken,
          planId,
          category: itemData.category,
          title: itemData.title,
          amount: itemData.amount,
          date: itemData.date,
          notes: itemData.notes,
          createdAt: serverTimestamp(),
        });
      }
      toast.success("Budget item added!");
      setForm({ category: "Travel", title: "", amount: "", date: new Date().toISOString().split("T")[0], notes: "" });
      fetchItems();
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
    if (plan.shareEnabled) await deleteDoc(doc(db, "sharedBudgetItems", itemId));
    toast.success("Item deleted!");
    fetchItems();
  };

  const handleAddCollaborator = async (event) => {
    event.preventDefault();
    if (!isOwner) return toast.error("Only the owner can manage collaborators!");
    const email = collaboratorEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) return toast.error("Enter a valid email!");
    if (email === auth.currentUser?.email?.toLowerCase()) return toast.error("Owner is already included!");

    const nextEmails = Array.from(new Set([...(plan.collaboratorEmails || []), email]));
    await updateDoc(doc(db, "budgetPlans", planId), {
      collaboratorEmails: nextEmails,
      updatedAt: serverTimestamp(),
    });
    setPlan((current) => ({ ...current, collaboratorEmails: nextEmails }));
    setCollaboratorEmail("");
    toast.success("Collaborator added!");
  };

  const handleRemoveCollaborator = async (email) => {
    if (!isOwner) return;
    const nextEmails = (plan.collaboratorEmails || []).filter((item) => item !== email);
    await updateDoc(doc(db, "budgetPlans", planId), {
      collaboratorEmails: nextEmails,
      updatedAt: serverTimestamp(),
    });
    setPlan((current) => ({ ...current, collaboratorEmails: nextEmails }));
    toast.success("Collaborator removed!");
  };

  const shareUrl = plan?.shareToken ? `${window.location.origin}/shared/plan/${plan.shareToken}` : "";

  const publishSharedPlan = async (token) => {
    await setDoc(doc(db, "sharedBudgetPlans", token), {
      shareToken: token,
      planId,
      title: plan.title,
      origin: plan.origin || "",
      destination: plan.destination || "",
      startDate: plan.startDate || "",
      endDate: plan.endDate || "",
      totalBudget: Number(plan.totalBudget) || 0,
      currency: plan.currency || "INR",
      status: plan.status || "Planning",
      notes: plan.notes || "",
      shareEnabled: true,
      updatedAt: serverTimestamp(),
    });

    const batch = writeBatch(db);
    items.forEach((item) => {
      batch.set(doc(db, "sharedBudgetItems", item.id), {
        shareToken: token,
        planId,
        category: item.category,
        title: item.title,
        amount: Number(item.amount) || 0,
        date: item.date || "",
        notes: item.notes || "",
        createdAt: serverTimestamp(),
      });
    });
    comments.filter((comment) => comment.source === "private").forEach((comment) => {
      batch.set(doc(db, "sharedBudgetComments", `private-${comment.id}`), {
        shareToken: token,
        planId,
        authorName: comment.authorName || "User",
        text: comment.text || "",
        createdAt: serverTimestamp(),
      });
    });
    await batch.commit();
  };

  const handleToggleShare = async () => {
    setShareSaving(true);
    try {
      const token = plan.shareToken || makeShareToken();
      const nextEnabled = !plan.shareEnabled;
      await updateDoc(doc(db, "budgetPlans", planId), {
        shareToken: token,
        shareEnabled: nextEnabled,
        updatedAt: serverTimestamp(),
      });
      if (nextEnabled) {
        await publishSharedPlan(token);
      } else {
        await setDoc(doc(db, "sharedBudgetPlans", token), { shareEnabled: false, updatedAt: serverTimestamp() }, { merge: true });
      }
      setPlan((current) => ({ ...current, shareToken: token, shareEnabled: nextEnabled }));
      toast.success(nextEnabled ? "Share link enabled!" : "Sharing disabled!");
    } catch (error) {
      console.error("Error updating share link:", error);
      toast.error("Failed to update share link!");
    } finally {
      setShareSaving(false);
    }
  };

  const handleCopyShareLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied!");
    } catch (error) {
      toast.error("Could not copy link. Please copy it manually.");
    }
  };

  const handleAddComment = async (event) => {
    event.preventDefault();
    if (!commentText.trim()) return toast.error("Write a comment first!");
    const user = auth.currentUser;
    const comment = {
      planId,
      authorName: user?.displayName || user?.email || "User",
      authorEmail: user?.email || "",
      text: commentText.trim(),
      createdAt: serverTimestamp(),
    };
    await addDoc(collection(db, "budgetComments"), comment);
    if (plan.shareEnabled && plan.shareToken) {
      await addDoc(collection(db, "sharedBudgetComments"), {
        shareToken: plan.shareToken,
        planId,
        authorName: comment.authorName,
        text: comment.text,
        createdAt: serverTimestamp(),
      });
    }
    setCommentText("");
    fetchComments();
    toast.success("Comment added!");
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
            <p className="mt-2 flex items-center gap-2 text-[13px] text-[#475569]"><MapPinned size={15} />{plan.origin || "Start"} to {plan.destination}</p>
            <p className="mt-1 flex items-center gap-2 text-[13px] text-[#475569]"><CalendarDays size={15} />{formatDate(plan.startDate)} - {formatDate(plan.endDate)}</p>
            {plan.notes && <p className="mt-4 max-w-3xl text-[13px] leading-6 text-[#94a3b8]">{plan.notes}</p>}
          </div>
          <Link to="/dashboard/budget-plans" className={`${secondaryButton} text-center no-underline`}>Back to Plans</Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-white/[0.07] bg-surface p-5"><p className="text-[12px] font-semibold uppercase tracking-wide text-[#475569]">Total Budget</p><p className="mt-2 text-[24px] font-bold text-[#e2e8f0]">{money(plan.totalBudget, plan.currency)}</p></div>
          <div className="rounded-xl border border-white/[0.07] bg-surface p-5"><p className="text-[12px] font-semibold uppercase tracking-wide text-[#475569]">Spent</p><p className="mt-2 text-[24px] font-bold text-purple">{money(spent, plan.currency)}</p></div>
          <div className="rounded-xl border border-white/[0.07] bg-surface p-5"><p className="text-[12px] font-semibold uppercase tracking-wide text-[#475569]">Remaining</p><p className={`mt-2 text-[24px] font-bold ${plan.totalBudget - spent >= 0 ? "text-green" : "text-red"}`}>{money(plan.totalBudget - spent, plan.currency)}</p></div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex justify-between text-[12px] text-[#94a3b8]"><span>Budget progress</span><span>{progress.toFixed(0)}%</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full rounded-full bg-purple transition-all" style={{ width: `${progress}%` }} /></div>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple/10 text-purple"><PlusCircle size={21} /></div>
          <div><h2 className="text-[18px] font-bold text-[#e2e8f0]">Add Budget Item</h2><p className="mt-1 text-[13px] text-[#475569]">Add travel, stay, food, activity, shopping, or misc costs.</p></div>
        </div>

        <form onSubmit={handleAddItem} className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-2"><label className={labelClass}>Category</label><select value={form.category} onChange={(event) => update("category", event.target.value)} className={inputClass}>{budgetCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select></div>
          <div className="lg:col-span-3"><label className={labelClass}>Item</label><input value={form.title} onChange={(event) => update("title", event.target.value)} className={inputClass} placeholder="Hotel advance" /></div>
          <div className="lg:col-span-2"><label className={labelClass}>Amount</label><input type="number" min="1" step="1" value={form.amount} onChange={(event) => update("amount", event.target.value)} className={inputClass} placeholder="4500" /></div>
          <div className="lg:col-span-2"><label className={labelClass}>Date</label><input type="date" value={form.date} onChange={(event) => update("date", event.target.value)} className={inputClass} /></div>
          <div className="lg:col-span-3"><label className={labelClass}>Notes</label><input value={form.notes} onChange={(event) => update("notes", event.target.value)} className={inputClass} placeholder="Optional" /></div>
          <div className="lg:col-span-12"><button type="submit" disabled={saving} className={`${primaryButton} w-full sm:w-auto`}>{saving ? "Adding..." : "Add Item"}</button></div>
        </form>
      </div>

      <div className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div><h2 className="text-[18px] font-bold text-[#e2e8f0]">Share Link</h2><p className="mt-1 text-[13px] text-[#475569]">Enable a public read-only link for this plan.</p></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button onClick={handleToggleShare} disabled={shareSaving} className={`${plan.shareEnabled ? secondaryButton : primaryButton} inline-flex items-center justify-center gap-2`}><LinkIcon size={16} />{shareSaving ? "Saving..." : plan.shareEnabled ? "Disable Sharing" : "Generate Share Link"}</button>
            {plan.shareEnabled && <button onClick={handleCopyShareLink} className={`${secondaryButton} inline-flex items-center justify-center gap-2`}>Copy Link</button>}
          </div>
        </div>
        <div className="mt-4 overflow-x-auto rounded-lg border border-dashed border-white/[0.07] bg-surface px-3.5 py-3 text-[13px] text-[#94a3b8]">{plan.shareEnabled ? shareUrl : "Sharing is disabled. Generate a link when you are ready to share."}</div>
      </div>

      <div className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue/10 text-blue">
            <Users size={20} />
          </div>
          <div>
            <h2 className="text-[18px] font-bold text-[#e2e8f0]">Collaborators</h2>
            <p className="mt-1 text-[13px] text-[#475569]">Owner can add logged-in users by email so they can edit this plan.</p>
          </div>
        </div>

        {isOwner ? (
          <form onSubmit={handleAddCollaborator} className="mb-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={collaboratorEmail}
              onChange={(event) => setCollaboratorEmail(event.target.value)}
              className={inputClass}
              placeholder="friend@example.com"
            />
            <button className={`${primaryButton} whitespace-nowrap`}>Add User</button>
          </form>
        ) : (
          <p className="mb-4 rounded-lg border border-white/[0.07] bg-surface p-4 text-[13px] text-[#94a3b8]">
            You are a collaborator on this plan.
          </p>
        )}

        <div className="space-y-2">
          {(plan.collaboratorEmails || []).length ? (
            plan.collaboratorEmails.map((email) => (
              <div key={email} className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.07] bg-surface px-3.5 py-3 text-[13px] text-[#94a3b8]">
                <span className="truncate">{email}</span>
                {isOwner && (
                  <button onClick={() => handleRemoveCollaborator(email)} className="text-[#475569] transition-colors hover:text-red">
                    Remove
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="rounded-lg border border-white/[0.07] bg-surface p-4 text-[13px] text-[#475569]">No collaborators yet.</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2"><WalletCards size={20} className="text-purple" /><h2 className="text-[18px] font-bold text-[#e2e8f0]">Budget Items</h2></div>
        {!items.length ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.04] py-16 text-center"><WalletCards size={40} color="#475569" /><p className="mt-3 text-[14px] text-[#475569]">No budget items yet.</p></div>
        ) : (
          groupedItems.map((group) => (
            <div key={group.category} className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.04]">
              <div className="flex items-center justify-between border-b border-white/[0.07] bg-surface px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${categoryStyles[group.category]}`}>{group.category}</span><span className="text-[13px] font-semibold text-[#e2e8f0]">{money(group.total, plan.currency)}</span></div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                  <thead className="bg-surface"><tr>{["Date", "Item", "Notes", "Amount", "Action"].map((head) => <th key={head} className="border-b border-white/[0.07] px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#475569]">{head}</th>)}</tr></thead>
                  <tbody>{group.items.map((item) => <tr key={item.id} className="hover:bg-white/[0.04]"><td className="border-b border-white/[0.07] px-4 py-3 text-[#e2e8f0]">{formatDate(item.date)}</td><td className="border-b border-white/[0.07] px-4 py-3 font-medium text-[#e2e8f0]">{item.title}</td><td className="border-b border-white/[0.07] px-4 py-3 text-[#94a3b8]">{item.notes || <span className="text-[#475569]">No notes</span>}</td><td className="border-b border-white/[0.07] px-4 py-3 font-semibold text-[#e2e8f0]">{money(item.amount, plan.currency)}</td><td className="border-b border-white/[0.07] px-4 py-3"><button onClick={() => handleDeleteItem(item.id)} className="rounded-md p-1.5 text-[#475569] transition-colors hover:bg-red/10 hover:text-red"><Trash2 size={16} /></button></td></tr>)}</tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber/10 text-amber"><MessageSquare size={20} /></div>
          <div><h2 className="text-[18px] font-bold text-[#e2e8f0]">Comments</h2><p className="mt-1 text-[13px] text-[#475569]">Phase 1: comments for owner and shared viewers.</p></div>
        </div>

        <form onSubmit={handleAddComment} className="mb-5 flex flex-col gap-3 sm:flex-row">
          <input value={commentText} onChange={(event) => setCommentText(event.target.value)} className={inputClass} placeholder="Add a comment" />
          <button className={`${primaryButton} inline-flex items-center justify-center gap-2`}><MessageSquare size={16} />Comment</button>
        </form>

        <div className="space-y-3">
          {comments.length ? comments.map((comment) => (
            <div key={`${comment.source}-${comment.id}`} className="rounded-lg border border-white/[0.07] bg-surface p-4">
              <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-[13px] font-semibold text-[#e2e8f0]">{comment.authorName || "Guest"}</span><span className="text-[11px] text-[#475569]">{comment.createdAt?.toDate?.().toLocaleString("en-GB") || "Just now"}</span></div>
              <p className="mt-2 text-[13px] leading-6 text-[#94a3b8]">{comment.text}</p>
            </div>
          )) : <p className="rounded-lg border border-white/[0.07] bg-surface p-4 text-[13px] text-[#475569]">No comments yet.</p>}
        </div>
      </div>
    </div>
  );
}
