import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

const Y = "#FFE600";
const BLK = "#0A0A0A";
const MUTED = "#666";

/* ── tiny hook for scroll reveals ── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setV(true); obs.disconnect(); }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, v];
}

function Reveal({ children, delay = 0 }) {
  const [ref, v] = useInView();
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(32px)", transition: `opacity .7s ${delay}s ease, transform .7s ${delay}s ease` }}>
      {children}
    </div>
  );
}

/* ── Marquee ── */
const MARQUEE_ITEMS = ["Weight Tracking", "Expense Control", "Loan Records", "Visual Charts", "Firebase Auth", "Android App", "Daily Records", "Smart Filters"];
function Marquee() {
  return (
    <div style={{ overflow: "hidden", background: Y, padding: "12px 0", borderTop: `2px solid ${BLK}`, borderBottom: `2px solid ${BLK}` }}>
      <div style={{ display: "flex", width: "max-content", animation: "marquee 20s linear infinite" }}>
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((t, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 16, fontSize: 12, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: BLK, whiteSpace: "nowrap", paddingRight: 36 }}>
            {t} <span style={{ fontSize: 16 }}>✦</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee{to{transform:translateX(-50%)}}`}</style>
    </div>
  );
}

/* ── Hero ── */
function Hero() {
  return (
    <section style={{ minHeight: "100vh", background: BLK, display: "flex", alignItems: "center", paddingTop: 64, position: "relative", overflow: "hidden" }}>
      {/* grid texture */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,230,0,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,230,0,.025) 1px,transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 1200, margin: "0 auto", padding: "60px clamp(20px,5vw,60px)", display: "grid", gridTemplateColumns: "1fr", gap: 60 }} className="td-hero-grid">
        {/* Text */}
        <div style={{ maxWidth: 680 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#111", border: "1px solid #222", padding: "5px 14px", marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: Y, display: "inline-block", animation: "blink 1.4s infinite" }} />
            <span style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}>3 trackers live · Android app available</span>
          </div>

          <h1 style={{ fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: "clamp(56px,8vw,100px)", color: "#fff", lineHeight: .92, letterSpacing: 1, marginBottom: 24 }}>
            TRACK<br /><span style={{ color: Y }}>EVERY</span><br />THING.
          </h1>

          <p style={{ fontSize: "clamp(15px,2vw,18px)", color: MUTED, lineHeight: 1.75, maxWidth: 460, marginBottom: 40 }}>
            Weight · Expenses · Loans — one clean dashboard to see your life's progress. No spreadsheets, no confusion.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/register"
              style={{ background: Y, color: BLK, fontWeight: 800, fontSize: 13, padding: "15px 32px", textDecoration: "none", letterSpacing: ".08em", textTransform: "uppercase", transition: "opacity .2s" }}
              onMouseEnter={e => e.target.style.opacity = ".85"}
              onMouseLeave={e => e.target.style.opacity = "1"}>
              Start Free →
            </Link>
            <a href="#features"
              style={{ border: "1px solid #2a2a2a", color: "#ccc", fontWeight: 600, fontSize: 13, padding: "15px 32px", textDecoration: "none", letterSpacing: ".06em", transition: "border-color .2s, color .2s" }}
              onMouseEnter={e => { e.target.style.borderColor = Y; e.target.style.color = Y; }}
              onMouseLeave={e => { e.target.style.borderColor = "#2a2a2a"; e.target.style.color = "#ccc"; }}>
              See Features
            </a>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {[
            { icon: "⚖️", label: "Weight", value: "72.4 kg", sub: "↓ 3.2 kg in 8 weeks" },
            { icon: "💸", label: "Expenses", value: "₹4,280", sub: "18 entries this month" },
            { icon: "🤝", label: "Loans", value: "62%", sub: "recovered so far" },
            { icon: "📊", label: "Charts", value: "Live", sub: "updates instantly" },
          ].map((c, i) => (
            <div key={i} style={{ background: "#111", border: "1px solid #1e1e1e", padding: "24px 20px", transition: "border-color .2s, transform .2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = Y; e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1e"; e.currentTarget.style.transform = "none"; }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>{c.icon}</div>
              <div style={{ fontSize: 10, color: MUTED, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: 32, color: "#fff", lineHeight: 1 }}>{c.value}</div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{c.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
        @media (min-width: 900px) {
          .td-hero-grid { grid-template-columns: 1.1fr 0.9fr !important; align-items: center; }
        }
      `}</style>
    </section>
  );
}

/* ── Features ── */
const FEATURES = [
  { icon: "⚖️", title: "Weight Tracking", body: "Log entries with notes, view trends, filter by date. Smart scaling makes small changes visible.", tag: "Live" },
  { icon: "💸", title: "Expense Control", body: "Record daily spending by category. Visual breakdowns show where your money actually goes.", tag: "Live" },
  { icon: "🤝", title: "Loan Records", body: "Track money lent or borrowed. Monitor repayment progress and never lose track again.", tag: "Live" },
  { icon: "📱", title: "Android App", body: "Native Android APK available. Same clean experience on your phone, synced to the same account.", tag: "New" },
  { icon: "📊", title: "Visual Charts", body: "Recharts-powered interactive graphs update instantly as you log new data.", tag: null },
  { icon: "✨", title: "10+ Modules Soon", body: "Blood sugar, movies, tasks, travel, skills — the desk keeps growing.", tag: "Soon" },
];

function Features() {
  return (
    <section id="features" style={{ background: "#050505", padding: "100px clamp(20px,5vw,60px)", borderTop: "1px solid #161616" }}>
      <Reveal>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ fontSize: 11, color: Y, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 12 }}>What you get</div>
          <h2 style={{ fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: "clamp(36px,5vw,64px)", color: "#fff", lineHeight: .95, marginBottom: 56 }}>
            PACKED WITH<br />SMART FEATURES.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 1, background: "#1a1a1a" }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ background: BLK }}>
                <Reveal delay={i * 0.06}>
                  <div style={{ padding: "32px 28px", position: "relative", transition: "background .2s, transform .2s", cursor: "default" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#111"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = BLK; e.currentTarget.style.transform = "none"; }}>
                    {f.tag && (
                      <div style={{ position: "absolute", top: 16, right: 16, fontSize: 9, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", background: f.tag === "Live" ? Y : f.tag === "New" ? "#00FF87" : "#1a1a1a", color: f.tag === "Soon" ? MUTED : BLK, padding: "3px 8px" }}>
                        {f.tag}
                      </div>
                    )}
                    <div style={{ fontSize: 26, marginBottom: 16 }}>{f.icon}</div>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 16, marginBottom: 10, fontFamily: "'Bebas Neue',Impact,sans-serif", letterSpacing: .5 }}>{f.title}</div>
                    <div style={{ color: MUTED, fontSize: 13, lineHeight: 1.75 }}>{f.body}</div>
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ── Tracker Demo ── */
const TABS = ["⚖️ Weight", "💸 Expenses", "🤝 Loans"];
const DEMO = {
  "⚖️ Weight": {
    cards: [{ label: "Current", value: "72.4 kg", trend: "↓ 3.2 kg since start" }, { label: "Goal", value: "68 kg", trend: "4.4 kg to go" }],
    heads: ["Date", "Weight", "Note", "Δ"],
    rows: [
      { a: "May 25", b: "72.4 kg", c: "Post-run", d: "↓ 0.3", pos: true },
      { a: "May 23", b: "72.7 kg", c: "Rest day", d: "↓ 0.5", pos: true },
      { a: "May 21", b: "73.2 kg", c: "Gym", d: "↑ 0.2", pos: false },
    ],
  },
  "💸 Expenses": {
    cards: [{ label: "May Total", value: "₹4,280", trend: "18 transactions" }, { label: "Daily avg", value: "₹171", trend: "vs ₹220 last month" }],
    heads: ["Date", "Category", "Note", "Amount"],
    rows: [
      { a: "May 25", b: "Food", c: "Lunch + coffee", d: "₹340", pos: null },
      { a: "May 24", b: "Transport", c: "Auto + metro", d: "₹120", pos: null },
      { a: "May 23", b: "Shopping", c: "Grocery haul", d: "₹980", pos: null },
    ],
  },
  "🤝 Loans": {
    cards: [{ label: "Total Given", value: "₹12,500", trend: "4 records" }, { label: "Recovered", value: "₹7,750", trend: "62% returned ✓" }],
    heads: ["Person", "Amount", "Date", "Status"],
    rows: [
      { a: "Rahul K.", b: "₹5,000", c: "Apr 10", d: "Returned", pos: true },
      { a: "Priya M.", b: "₹3,500", c: "May 2", d: "Partial", pos: null },
      { a: "Anil S.", b: "₹4,000", c: "May 18", d: "Pending", pos: false },
    ],
  },
};

function TrackerDemo() {
  const [active, setActive] = useState(TABS[0]);
  const d = DEMO[active];
  return (
    <section id="trackers" style={{ background: BLK, padding: "100px clamp(20px,5vw,60px)", borderTop: "1px solid #161616" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Reveal>
          <div style={{ fontSize: 11, color: Y, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 12 }}>Live preview</div>
          <h2 style={{ fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: "clamp(36px,5vw,64px)", color: "#fff", lineHeight: .95, marginBottom: 40 }}>YOUR TRACKERS<br />IN ACTION.</h2>
        </Reveal>
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #1a1a1a", marginBottom: 24, overflowX: "auto" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setActive(t)}
              style={{ background: "none", border: "none", borderBottom: `2px solid ${active === t ? Y : "transparent"}`, color: active === t ? Y : MUTED, fontWeight: 700, fontSize: 13, padding: "12px 24px", cursor: "pointer", whiteSpace: "nowrap", transition: "color .2s" }}>
              {t}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }} className="td-stat-grid">
          {d.cards.map((c, i) => (
            <div key={i} style={{ background: "#111", border: "1px solid #1e1e1e", padding: "24px 20px" }}>
              <div style={{ fontSize: 10, color: MUTED, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 6 }}>{c.label}</div>
              <div style={{ fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: 38, color: "#fff", lineHeight: 1 }}>{c.value}</div>
              <div style={{ fontSize: 12, color: Y, marginTop: 6 }}>{c.trend}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "#111", border: "1px solid #1e1e1e", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 400 }}>
            <thead>
              <tr>{d.heads.map(h => <th key={h} style={{ textAlign: "left", padding: "14px 20px", fontSize: 10, color: MUTED, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", borderBottom: "1px solid #1a1a1a" }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {d.rows.map((r, i) => (
                <tr key={i} style={{ borderTop: i > 0 ? "1px solid #1a1a1a" : "none" }}>
                  <td style={{ padding: "12px 20px", color: MUTED }}>{r.a}</td>
                  <td style={{ padding: "12px 20px", color: "#fff" }}>{r.b}</td>
                  <td style={{ padding: "12px 20px", color: MUTED }}>{r.c}</td>
                  <td style={{ padding: "12px 20px", color: r.pos === true ? Y : r.pos === false ? "#ef4444" : "#fff", fontWeight: 600 }}>{r.d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`@media(max-width:600px){.td-stat-grid{grid-template-columns:1fr !important;}}`}</style>
    </section>
  );
}

/* ── How It Works ── */
function HowItWorks() {
  const steps = [
    { n: "01", title: "Create Account", body: "Register with your email. Firebase Auth keeps your data completely private and secure." },
    { n: "02", title: "Pick a Tracker", body: "Open Weight, Expenses, or Loans from the sidebar. Clean forms, ready to go." },
    { n: "03", title: "Watch Progress", body: "Charts update instantly. Filter by date, zoom into ranges, read the story your data tells." },
  ];
  return (
    <section id="how-it-works" style={{ background: "#050505", padding: "100px clamp(20px,5vw,60px)", borderTop: "1px solid #161616" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Reveal>
          <div style={{ fontSize: 11, color: Y, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 12 }}>Getting started</div>
          <h2 style={{ fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: "clamp(36px,5vw,64px)", color: "#fff", lineHeight: .95, marginBottom: 56 }}>UP IN 3 STEPS.</h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 0, border: "1px solid #1a1a1a" }}>
          {steps.map((s, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div style={{ padding: "44px 36px", borderRight: i < steps.length - 1 ? "1px solid #1a1a1a" : "none" }} className="td-step-border">
                <div style={{ fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: 72, color: "#161616", lineHeight: 1, marginBottom: 20 }}>{s.n}</div>
                <div style={{ color: Y, fontWeight: 800, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 8 }}>Step {s.n}</div>
                <div style={{ color: "#fff", fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: 24, letterSpacing: .5, marginBottom: 12 }}>{s.title.toUpperCase()}</div>
                <div style={{ color: MUTED, fontSize: 13, lineHeight: 1.75 }}>{s.body}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:700px){.td-step-border{border-right:none !important; border-bottom:1px solid #1a1a1a;}}`}</style>
    </section>
  );
}

/* ── App Download ── */
function AppDownload() {
  return (
    <section id="app" style={{ background: BLK, padding: "100px clamp(20px,5vw,60px)", borderTop: "1px solid #161616" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 48, alignItems: "center" }}>
        <Reveal>
          <div style={{ fontSize: 11, color: Y, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 12 }}>Mobile App</div>
          <h2 style={{ fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: "clamp(36px,5vw,64px)", color: "#fff", lineHeight: .95, marginBottom: 20 }}>TRACK ON<br />THE GO.</h2>
          <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.75, maxWidth: 400, marginBottom: 36 }}>
            TrackDesk is available as a native Android app. Same account, same data — always in sync.
          </p>
          <a href="#app"
            style={{ display: "inline-flex", alignItems: "center", gap: 10, background: Y, color: BLK, fontWeight: 800, fontSize: 13, padding: "14px 28px", textDecoration: "none", letterSpacing: ".08em", textTransform: "uppercase", transition: "opacity .2s" }}
            onMouseEnter={e => e.target.style.opacity = ".85"}
            onMouseLeave={e => e.target.style.opacity = "1"}>
            📱 Download Android APK →
          </a>
        </Reveal>
        <Reveal delay={0.15}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { icon: "🔒", label: "Secure Login" },
              { icon: "⚡", label: "Fast & Lightweight" },
              { icon: "📴", label: "Offline Ready" },
              { icon: "🔄", label: "Auto Sync" },
            ].map((f, i) => (
              <div key={i} style={{ background: "#111", border: "1px solid #1e1e1e", padding: "20px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{f.icon}</div>
                <div style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{f.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── CTA ── */
function CTA() {
  return (
    <section style={{ background: Y, padding: "80px clamp(20px,5vw,60px)", overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", right: -10, top: "50%", transform: "translateY(-50%)", fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: "clamp(100px,18vw,240px)", color: "rgba(0,0,0,.06)", lineHeight: 1, pointerEvents: "none", userSelect: "none" }}>FREE</div>
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
        <Reveal>
          <div style={{ fontSize: 11, color: BLK, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 16, opacity: .5 }}>Start now · it's free</div>
          <h2 style={{ fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: "clamp(40px,7vw,80px)", color: BLK, lineHeight: .9, letterSpacing: 1, maxWidth: 680, marginBottom: 28 }}>
            START TRACKING YOUR LIFE TODAY.
          </h2>
          <p style={{ fontSize: "clamp(14px,2vw,17px)", color: "rgba(0,0,0,.6)", lineHeight: 1.7, maxWidth: 440, marginBottom: 40 }}>
            Free to use. No credit card. Weight, expenses, and loans — all in one desk waiting for you.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/register"
              style={{ background: BLK, color: Y, fontWeight: 800, fontSize: 13, padding: "16px 40px", textDecoration: "none", letterSpacing: ".1em", textTransform: "uppercase", transition: "opacity .2s" }}
              onMouseEnter={e => e.target.style.opacity = ".8"}
              onMouseLeave={e => e.target.style.opacity = "1"}>
              Create Free Account →
            </Link>
            <a href="#app"
              style={{ background: "rgba(0,0,0,.12)", color: BLK, fontWeight: 700, fontSize: 13, padding: "16px 32px", textDecoration: "none", letterSpacing: ".08em", textTransform: "uppercase", transition: "background .2s" }}
              onMouseEnter={e => e.target.style.background = "rgba(0,0,0,.2)"}
              onMouseLeave={e => e.target.style.background = "rgba(0,0,0,.12)"}>
              📱 Get Android App
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Root ── */
export default function Landing() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;700&display=swap";
    document.head.appendChild(link);
    document.body.style.margin = "0";
    document.body.style.background = BLK;
    document.body.style.fontFamily = "'DM Sans', sans-serif";
    return () => { try { document.head.removeChild(link); } catch (_) {} };
  }, []);

  return (
    <div style={{ background: BLK }}>
      <Header />
      <Hero />
      <Marquee />
      <Features />
      <TrackerDemo />
      <HowItWorks />
      <AppDownload />
      <CTA />
      <Footer />
    </div>
  );
}