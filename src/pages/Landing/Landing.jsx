import { Link } from "react-router-dom";
import { Activity, ClipboardList, LineChart, ShieldCheck, Star, WalletCards } from "lucide-react";
import LandingNavbar from "../../components/landing/LandingNavbar";

const features = [
  { icon: Activity, title: "Health Tracking", text: "Record weight entries, notes, and progress in one simple workspace." },
  { icon: WalletCards, title: "Expense Control", text: "Organize daily spending and understand where your money goes." },
  { icon: LineChart, title: "Visual Progress", text: "Charts make trends easier to read without digging through rows." },
  { icon: ShieldCheck, title: "Private Login", text: "Firebase authentication keeps every user's data separate." },
  { icon: ClipboardList, title: "Daily Records", text: "Build a useful history for health, money, and personal goals." },
  { icon: Star, title: "More Modules", text: "Designed to grow into tasks, loans, travel, skills, and more." },
];

const feedback = [
  { name: "Riya Sharma", role: "Fitness learner", text: "The dashboard makes my weight progress easy to follow every week." },
  { name: "Karan Mehta", role: "Freelancer", text: "I like having health and expense records in the same clean place." },
  { name: "Neha Gupta", role: "Student", text: "Simple enough to use daily, but still feels organized and useful." },
];

export default function Landing() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <LandingNavbar />

      <section className="relative bg-slate-950 text-white">
        <div className="absolute inset-0">
          <img src="/img/BGI.png" alt="MyTrackDesk dashboard workspace" className="h-full w-full object-cover opacity-35" />
          <div className="absolute inset-0 bg-slate-950/65" />
        </div>
        <div className="relative mx-auto grid min-h-[560px] max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-cyan-300">Personal tracking, simplified</p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">MyTrackDesk</h1>
            <p className="mt-5 text-lg leading-8 text-slate-200">
              A clean all-in-one tracker for weight, expenses, loans, and everyday records that help you understand your progress.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/login" className="inline-flex justify-center rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-300">
                Login
              </Link>
              <a href="#features" className="inline-flex justify-center rounded-lg border border-white/40 px-6 py-3 font-semibold text-white hover:bg-white/10">
                Explore Features
              </a>
            </div>
          </div>

          <div className="rounded-lg border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              {["Weight", "Expenses", "Loans", "Insights"].map((item, index) => (
                <div key={item} className="rounded-lg bg-white p-4 text-slate-950 shadow-sm">
                  <p className="text-sm font-semibold text-slate-500">{item}</p>
                  <p className="mt-3 text-3xl font-bold">{index === 0 ? "72.4" : index === 1 ? "18" : index === 2 ? "4" : "9"}</p>
                  <p className="mt-1 text-sm text-slate-500">{index === 0 ? "kg tracked" : index === 1 ? "entries" : index === 2 ? "active records" : "charts"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold text-slate-950">About The App</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            MyTrackDesk helps you keep personal data organized without jumping between different notes, sheets, and apps. It focuses on useful tracking, clear views, and a dashboard that works well on desktop and mobile.
          </p>
        </div>
      </section>

      <section id="features" className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-950">Features</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-950">{title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="feedback" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-950">User Feedback</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {feedback.map((item) => (
            <article key={item.name} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <p className="leading-7 text-slate-700">"{item.text}"</p>
              <div className="mt-5 border-t border-slate-200 pt-4">
                <p className="font-bold text-slate-950">{item.name}</p>
                <p className="text-sm text-slate-500">{item.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
