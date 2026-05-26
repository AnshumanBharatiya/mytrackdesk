import { useState, useEffect, useRef } from "react";

const Y = "#FFE600";
const BLK = "#0A0A0A";
const WHITE = "#FFFFFF";
const GRAY = "#1A1A1A";
const MUTED = "#888";

const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
};

const Reveal = ({ children, delay = 0, style = {} }) => {
  const [ref, v] = useInView();
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(40px)", transition: `opacity .7s ${delay}s cubic-bezier(.23,1,.32,1), transform .7s ${delay}s cubic-bezier(.23,1,.32,1)`, ...style }}>
      {children}
    </div>
  );
};

// ── MARQUEE ─────────────────────────────────────────────────────
const items = ["Weight Tracking", "Expense Control", "Loan Records", "Visual Charts", "Firebase Auth", "Mobile Ready", "Daily Records", "Smart Filters"];
function Marquee() {
  return (
    <div style={{ overflow: "hidden", background: Y, padding: "14px 0", borderTop: `2px solid ${BLK}`, borderBottom: `2px solid ${BLK}` }}>
      <div style={{ display: "flex", gap: 0, animation: "marquee 18s linear infinite", width: "max-content" }}>
        {[...items, ...items].map((t, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 20, fontSize: 13, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: BLK, whiteSpace: "nowrap", paddingRight: 40 }}>
            {t} <span style={{ fontSize: 18, fontWeight: 900 }}>✦</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
    </div>
  );
}

// ── NAV ──────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 48px", height: 64, background: scrolled ? BLK : "transparent", borderBottom: scrolled ? `1px solid #222` : "none", transition: "background .3s, border .3s" }}>
      <div style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", fontSize: 26, color: WHITE, letterSpacing: 2 }}>
        MY<span style={{ color: Y }}>TRACK</span>DESK
      </div>
      <div style={{ display: "flex", gap: 36, alignItems: "center" }}>
        {["About", "Features", "Trackers", "How it works"].map(l => (
          <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} style={{ color: MUTED, fontSize: 13, fontWeight: 500, textDecoration: "none", letterSpacing: ".04em", transition: "color .2s" }}
            onMouseEnter={e => e.target.style.color = Y} onMouseLeave={e => e.target.style.color = MUTED}>{l}</a>
        ))}
        <a href="#trackers" style={{ background: Y, color: BLK, fontSize: 13, fontWeight: 800, padding: "10px 22px", textDecoration: "none", letterSpacing: ".06em", textTransform: "uppercase", transition: "transform .2s" }}
          onMouseEnter={e => e.target.style.transform = "scale(1.04)"} onMouseLeave={e => e.target.style.transform = "scale(1)"}>
          Get Started →
        </a>
      </div>
    </nav>
  );
}

// ── HERO ─────────────────────────────────────────────────────────
function SparkBar({ h, color = Y }) {
  return <div style={{ width: 7, borderRadius: 3, background: color, height: h, transition: "height .5s" }} />;
}

function HeroCard({ icon, label, value, sub, children, tint = Y }) {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: hover ? GRAY : "#111", border: `1px solid #222`, padding: "22px 24px", transition: "background .2s, transform .2s", transform: hover ? "translateY(-4px)" : "none" }}>
      <div style={{ fontSize: 22, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 11, color: MUTED, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 38, color: WHITE, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: MUTED, marginTop: 4, marginBottom: 14 }}>{sub}</div>
      {children}
    </div>
  );
}

function Hero() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick(t => t + 1), 2600); return () => clearInterval(id); }, []);
  const wVals = ["72.4", "72.1", "71.9", "72.4"];
  return (
    <section style={{ minHeight: "100vh", background: BLK, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, alignItems: "stretch", paddingTop: 64, position: "relative", overflow: "hidden" }}>
      {/* grid texture */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,230,0,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,230,0,.03) 1px,transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

      {/* left */}
      <div style={{ padding: "80px 60px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 1 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#111", border: `1px solid #2a2a2a`, padding: "6px 16px", marginBottom: 32, width: "fit-content" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: Y, display: "inline-block", animation: "blink 1.4s infinite" }} />
          <span style={{ fontSize: 11, color: MUTED, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase" }}>3 trackers live now</span>
        </div>
        <h1 style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: "clamp(64px,8vw,110px)", color: WHITE, lineHeight: .95, letterSpacing: 1, marginBottom: 28 }}>
          TRACK<br /><span style={{ color: Y }}>EVERY</span><br />THING.
        </h1>
        <p style={{ fontSize: 17, color: MUTED, lineHeight: 1.75, maxWidth: 420, marginBottom: 44 }}>
          Weight · Expenses · Loans — one clean desk to see your entire life's progress, no spreadsheets needed.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <a href="#trackers" style={{ background: Y, color: BLK, fontWeight: 800, fontSize: 14, padding: "16px 36px", textDecoration: "none", letterSpacing: ".08em", textTransform: "uppercase", display: "inline-block", transition: "transform .2s" }}
            onMouseEnter={e => e.target.style.transform = "translateY(-2px)"} onMouseLeave={e => e.target.style.transform = "none"}>
            Start Free →
          </a>
          <a href="#features" style={{ border: `1px solid #333`, color: WHITE, fontWeight: 600, fontSize: 14, padding: "16px 36px", textDecoration: "none", letterSpacing: ".06em", display: "inline-block", transition: "border-color .2s, color .2s" }}
            onMouseEnter={e => { e.target.style.borderColor = Y; e.target.style.color = Y; }} onMouseLeave={e => { e.target.style.borderColor = "#333"; e.target.style.color = WHITE; }}>
            See Features
          </a>
        </div>
        <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
      </div>

      {/* right — cards */}
      <div style={{ background: "#0d0d0d", borderLeft: `1px solid #1a1a1a`, padding: "80px 40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignContent: "center", position: "relative", zIndex: 1 }}>
        <HeroCard icon="⚖️" label="Weight" value={wVals[tick % wVals.length]} sub="kg · trending down">
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 36 }}>
            {[20, 28, 22, 35, 18, 30, 14].map((h, i) => <SparkBar key={i} h={h} />)}
          </div>
        </HeroCard>
        <HeroCard icon="💸" label="Expenses" value="₹4,280" sub="18 entries this month">
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 36 }}>
            {[30, 18, 38, 16, 42, 28, 22].map((h, i) => <SparkBar key={i} h={h} color="#fff" />)}
          </div>
        </HeroCard>
        <HeroCard icon="🤝" label="Loans" value="4" sub="active records">
          <div style={{ height: 4, background: "#222", borderRadius: 2, marginTop: 4 }}>
            <div style={{ width: "62%", height: "100%", background: Y, borderRadius: 2 }} />
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 6 }}>62% recovered</div>
        </HeroCard>
        <HeroCard icon="📊" label="Insights" value="9" sub="charts generated">
          <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 36 }}>
            {[60, 85, 45, 70, 55].map((h, i) => (
              <div key={i} style={{ flex: 1, height: "100%", background: "#222", borderRadius: 2, display: "flex", alignItems: "flex-end" }}>
                <div style={{ width: "100%", height: `${h}%`, background: Y, borderRadius: 2 }} />
              </div>
            ))}
          </div>
        </HeroCard>
      </div>
    </section>
  );
}

// ── STATS BAND ───────────────────────────────────────────────────
function Stats() {
  const data = [
    { num: "3+", label: "Live Trackers" },
    { num: "100%", label: "Data Privacy" },
    { num: "∞", label: "Records" },
    { num: "Real-time", label: "Charts" },
    { num: "10+", label: "Modules Soon" },
  ];
  return (
    <div style={{ background: "#0d0d0d", borderTop: `1px solid #1a1a1a`, borderBottom: `1px solid #1a1a1a`, display: "grid", gridTemplateColumns: `repeat(${data.length}, 1fr)` }}>
      {data.map((d, i) => (
        <div key={i} style={{ padding: "40px 20px", textAlign: "center", borderRight: i < data.length - 1 ? `1px solid #1a1a1a` : "none" }}>
          <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 42, color: Y, lineHeight: 1 }}>{d.num}</div>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 6, letterSpacing: ".08em", textTransform: "uppercase" }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── ABOUT ────────────────────────────────────────────────────────
function AboutChart() {
  const [ref, v] = useInView(0.3);
  const bars = [
    { label: "W1", h: 70 }, { label: "W2", h: 68 }, { label: "W3", h: 65 },
    { label: "W4", h: 72 }, { label: "W5", h: 60 }, { label: "W6", h: 55 },
    { label: "W7", h: 50 }, { label: "W8", h: 44 },
  ];
  return (
    <div ref={ref} style={{ background: "#111", border: `1px solid #222`, padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <span style={{ color: WHITE, fontWeight: 700, fontSize: 15, letterSpacing: ".04em" }}>Weight · 8 Weeks</span>
        <span style={{ color: Y, fontWeight: 700, fontSize: 14 }}>↓ 3.2 kg</span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
        {bars.map((b, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%" }}>
            <div style={{ width: "100%", height: v ? b.h : 0, background: Y, borderRadius: "2px 2px 0 0", marginTop: "auto", transition: `height .8s ${i * .08}s cubic-bezier(.34,1.1,.64,1)` }} />
            <div style={{ fontSize: 10, color: MUTED, letterSpacing: ".04em" }}>{b.label}</div>
          </div>
        ))}
      </div>
      {/* progress bars */}
      <div style={{ marginTop: 28, paddingTop: 24, borderTop: `1px solid #222` }}>
        {[{ label: "Monthly expenses", val: "₹4,280", w: "72%", c: WHITE }, { label: "Loan recovery", val: "62%", w: "62%", c: Y }].map((p, i) => (
          <div key={i} style={{ marginBottom: i === 0 ? 16 : 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: MUTED }}>
              <span>{p.label}</span><span style={{ color: p.c, fontWeight: 700 }}>{p.val}</span>
            </div>
            <div style={{ height: 4, background: "#222", borderRadius: 2 }}>
              <div style={{ width: v ? p.w : 0, height: "100%", background: p.c, borderRadius: 2, transition: `width 1.2s ${i * .2 + .3}s cubic-bezier(.34,1.1,.64,1)` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function About() {
  const points = [
    { icon: "🏠", title: "All-in-one dashboard", body: "Health, money, and loans in one workspace — no app switching, no lost data." },
    { icon: "📈", title: "Visual progress", body: "Interactive charts update the moment you log new data. Trends become obvious instantly." },
    { icon: "🔒", title: "Private by default", body: "Firebase Auth keeps every user's data completely isolated and secure." },
    { icon: "🚀", title: "Built to grow", body: "10+ modules planned — tasks, travel, blood sugar, movies, and skills coming soon." },
  ];
  return (
    <section id="about" style={{ background: BLK, padding: "120px 60px" }}>
      <Reveal>
        <div style={{ fontSize: 11, color: Y, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 16 }}>About the app</div>
        <h2 style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: "clamp(40px,5vw,72px)", color: WHITE, lineHeight: .95, letterSpacing: 1, marginBottom: 20 }}>
          ONE DESK.<br />ALL YOUR DATA.
        </h2>
        <p style={{ fontSize: 17, color: MUTED, lineHeight: 1.75, maxWidth: 520, marginBottom: 72 }}>
          Stop juggling notes, spreadsheets, and apps. MyTrackDesk gives you a clean, unified view of what matters most.
        </p>
      </Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "start" }}>
        <Reveal delay={0.1}><AboutChart /></Reveal>
        <div>
          {points.map((p, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div style={{ display: "flex", gap: 20, marginBottom: 36, paddingBottom: 36, borderBottom: i < points.length - 1 ? `1px solid #1a1a1a` : "none" }}>
                <div style={{ width: 44, height: 44, background: "#111", border: `1px solid #222`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{p.icon}</div>
                <div>
                  <div style={{ color: WHITE, fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{p.title}</div>
                  <div style={{ color: MUTED, fontSize: 14, lineHeight: 1.7 }}>{p.body}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FEATURES ─────────────────────────────────────────────────────
const feats = [
  { icon: "⚖️", title: "Weight Tracking", body: "Log entries with notes, view trends, filter by date or range. Smart Y-axis scaling makes small changes visible.", tag: "Live" },
  { icon: "💸", title: "Expense Control", body: "Record daily spending by category. Understand where your money goes with instant visual breakdowns.", tag: "Live" },
  { icon: "🤝", title: "Loan Records", body: "Track money lent or borrowed, monitor repayment progress. Never lose track of who owes what.", tag: "Live" },
  { icon: "📊", title: "Visual Charts", body: "Recharts-powered interactive graphs. Data trends become obvious without any manual effort.", tag: null },
  { icon: "🔐", title: "Secure Login", body: "Firebase Auth keeps every user's data completely isolated. Register, login, reset — all handled.", tag: null },
  { icon: "✨", title: "10+ Modules Soon", body: "Blood sugar, movie watchlists, task manager, budget planner, travel journal. The desk keeps growing.", tag: "Soon" },
];

function FeatCard({ icon, title, body, tag, delay }) {
  const [hover, setHover] = useState(false);
  return (
    <Reveal delay={delay}>
      <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{ background: hover ? "#111" : BLK, border: `1px solid ${hover ? "#333" : "#1a1a1a"}`, padding: 36, position: "relative", transition: "background .2s, border-color .2s, transform .2s", transform: hover ? "translateY(-6px)" : "none", cursor: "default" }}>
        {tag && (
          <div style={{ position: "absolute", top: 20, right: 20, fontSize: 10, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", background: tag === "Live" ? Y : tag === "Soon" ? "#1a1a1a" : Y, color: tag === "Live" ? BLK : MUTED, padding: "3px 10px" }}>
            {tag}
          </div>
        )}
        <div style={{ fontSize: 28, marginBottom: 20 }}>{icon}</div>
        <div style={{ color: WHITE, fontWeight: 700, fontSize: 18, marginBottom: 12, fontFamily: "'Bebas Neue','Impact',sans-serif", letterSpacing: .5 }}>{title}</div>
        <div style={{ color: MUTED, fontSize: 14, lineHeight: 1.75 }}>{body}</div>
        <div style={{ marginTop: 28, width: hover ? "100%" : 0, height: 2, background: Y, transition: "width .35s cubic-bezier(.23,1,.32,1)" }} />
      </div>
    </Reveal>
  );
}

function Features() {
  return (
    <section id="features" style={{ background: "#050505", padding: "120px 60px", borderTop: `1px solid #1a1a1a` }}>
      <Reveal>
        <div style={{ fontSize: 11, color: Y, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 16 }}>What you get</div>
        <h2 style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: "clamp(40px,5vw,72px)", color: WHITE, lineHeight: .95, letterSpacing: 1, marginBottom: 80 }}>
          PACKED WITH<br />SMART FEATURES.
        </h2>
      </Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "#1a1a1a" }}>
        {feats.map((f, i) => <div key={i} style={{ background: BLK }}><FeatCard {...f} delay={i * 0.07} /></div>)}
      </div>
    </section>
  );
}

// ── TRACKER DEMO ─────────────────────────────────────────────────
const TABS = ["⚖️ Weight", "💸 Expenses", "🤝 Loans"];
const demoData = {
  "⚖️ Weight": {
    cards: [
      { label: "Current", value: "72.4 kg", trend: "↓ 3.2 kg since start", trendColor: Y },
      { label: "Goal", value: "68 kg", trend: "4.4 kg to go", trendColor: MUTED },
    ],
    rows: [
      { col1: "May 25", col2: "72.4 kg", col3: "Morning, post-run", col4: "↓ 0.3", pos: true },
      { col1: "May 23", col2: "72.7 kg", col3: "Rest day", col4: "↓ 0.5", pos: true },
      { col1: "May 21", col2: "73.2 kg", col3: "Gym session", col4: "↑ 0.2", pos: false },
    ],
    heads: ["Date", "Weight", "Note", "Δ"],
  },
  "💸 Expenses": {
    cards: [
      { label: "May Total", value: "₹4,280", trend: "18 transactions", trendColor: Y },
      { label: "Daily avg", value: "₹171", trend: "vs ₹220 last month", trendColor: Y },
    ],
    rows: [
      { col1: "May 25", col2: "Food", col3: "Lunch + coffee", col4: "₹340", pos: null },
      { col1: "May 24", col2: "Transport", col3: "Auto + metro", col4: "₹120", pos: null },
      { col1: "May 23", col2: "Shopping", col3: "Grocery haul", col4: "₹980", pos: null },
    ],
    heads: ["Date", "Category", "Note", "Amount"],
  },
  "🤝 Loans": {
    cards: [
      { label: "Total Given", value: "₹12,500", trend: "4 records", trendColor: MUTED },
      { label: "Recovered", value: "₹7,750", trend: "62% returned ✓", trendColor: Y },
    ],
    rows: [
      { col1: "Rahul K.", col2: "₹5,000", col3: "Apr 10", col4: "Returned", pos: true },
      { col1: "Priya M.", col2: "₹3,500", col3: "May 2", col4: "Partial", pos: null },
      { col1: "Anil S.", col2: "₹4,000", col3: "May 18", col4: "Pending", pos: false },
    ],
    heads: ["Person", "Amount", "Date", "Status"],
  },
};

function TrackerDemo() {
  const [active, setActive] = useState(TABS[0]);
  const d = demoData[active];
  return (
    <section id="trackers" style={{ background: "#070707", padding: "120px 60px", borderTop: `1px solid #1a1a1a` }}>
      <Reveal>
        <div style={{ fontSize: 11, color: Y, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 16 }}>Live preview</div>
        <h2 style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: "clamp(40px,5vw,72px)", color: WHITE, lineHeight: .95, letterSpacing: 1, marginBottom: 48 }}>
          YOUR TRACKERS<br />IN ACTION.
        </h2>
      </Reveal>

      {/* tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 32, borderBottom: `1px solid #1a1a1a` }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActive(t)}
            style={{ background: "transparent", border: "none", borderBottom: `3px solid ${active === t ? Y : "transparent"}`, color: active === t ? Y : MUTED, fontWeight: 700, fontSize: 14, padding: "14px 28px", cursor: "pointer", letterSpacing: ".04em", transition: "color .2s, border-color .2s" }}>
            {t}
          </button>
        ))}
      </div>

      {/* content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {d.cards.map((c, i) => (
          <div key={i} style={{ background: "#111", border: `1px solid #222`, padding: 28 }}>
            <div style={{ fontSize: 11, color: MUTED, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>{c.label}</div>
            <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 42, color: WHITE, lineHeight: 1 }}>{c.value}</div>
            <div style={{ fontSize: 13, color: c.trendColor, marginTop: 8 }}>{c.trend}</div>
          </div>
        ))}
      </div>

      {/* table */}
      <div style={{ background: "#111", border: `1px solid #222`, padding: "0 28px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr>
              {d.heads.map(h => <th key={h} style={{ textAlign: "left", padding: "16px 0", fontSize: 11, color: MUTED, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", borderBottom: `1px solid #1a1a1a` }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {d.rows.map((r, i) => (
              <tr key={i} style={{ borderTop: i > 0 ? `1px solid #1a1a1a` : "none" }}>
                <td style={{ padding: "14px 0", color: MUTED }}>{r.col1}</td>
                <td style={{ color: WHITE }}>{r.col2}</td>
                <td style={{ color: MUTED }}>{r.col3}</td>
                <td style={{ color: r.pos === true ? Y : r.pos === false ? "#ef4444" : WHITE, fontWeight: 600 }}>{r.col4}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ── HOW IT WORKS ─────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: "01", title: "Create account", body: "Register with your email in seconds. Firebase Auth keeps your data completely private." },
    { n: "02", title: "Pick a tracker", body: "Open Weight, Expenses, or Loans from the sidebar. Clean entry forms, ready to go." },
    { n: "03", title: "Watch progress", body: "Charts update instantly. Filter by date, zoom into ranges, read the story your data tells." },
  ];
  return (
    <section id="how-it-works" style={{ background: BLK, padding: "120px 60px", borderTop: `1px solid #1a1a1a` }}>
      <Reveal>
        <div style={{ fontSize: 11, color: Y, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 16 }}>Getting started</div>
        <h2 style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: "clamp(40px,5vw,72px)", color: WHITE, lineHeight: .95, letterSpacing: 1, marginBottom: 80 }}>
          UP IN<br />3 STEPS.
        </h2>
      </Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, borderTop: `1px solid #1a1a1a`, borderLeft: `1px solid #1a1a1a` }}>
        {steps.map((s, i) => (
          <Reveal key={i} delay={i * 0.12}>
            <div style={{ padding: "52px 40px", borderRight: `1px solid #1a1a1a`, borderBottom: `1px solid #1a1a1a` }}>
              <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 80, color: "#1a1a1a", lineHeight: 1, marginBottom: 28 }}>{s.n}</div>
              <div style={{ color: Y, fontWeight: 800, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 12 }}>Step {s.n}</div>
              <div style={{ color: WHITE, fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 28, letterSpacing: .5, marginBottom: 16 }}>{s.title.toUpperCase()}</div>
              <div style={{ color: MUTED, fontSize: 14, lineHeight: 1.75 }}>{s.body}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ── TESTIMONIALS ─────────────────────────────────────────────────
const testiData = [
  { init: "RS", name: "Riya Sharma", role: "Fitness learner", text: "The dashboard makes my weight progress so easy to follow every week. I finally feel in control of my health journey." },
  { init: "KM", name: "Karan Mehta", role: "Freelancer", text: "Having health and expense records in the same clean place is exactly what I needed. No more switching between five apps." },
  { init: "NG", name: "Neha Gupta", role: "Student", text: "Simple enough to use daily but still feels organized and powerful. The loan tracker alone saved me from awkward conversations." },
];

function Testimonials() {
  return (
    <section id="feedback" style={{ background: "#050505", padding: "120px 60px", borderTop: `1px solid #1a1a1a` }}>
      <Reveal>
        <div style={{ fontSize: 11, color: Y, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 16 }}>User feedback</div>
        <h2 style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: "clamp(40px,5vw,72px)", color: WHITE, lineHeight: .95, letterSpacing: 1, marginBottom: 80 }}>
          PEOPLE LOVE<br />KEEPING TRACK.
        </h2>
      </Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {testiData.map((t, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <div style={{ background: "#0d0d0d", border: `1px solid #1a1a1a`, padding: 36, display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 64, color: Y, lineHeight: .8, marginBottom: 16, opacity: .3 }}>"</div>
              <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.8, flex: 1, marginBottom: 32 }}>{t.text}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 14, paddingTop: 24, borderTop: `1px solid #1a1a1a` }}>
                <div style={{ width: 44, height: 44, background: Y, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: BLK, flexShrink: 0 }}>{t.init}</div>
                <div>
                  <div style={{ color: WHITE, fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                  <div style={{ color: MUTED, fontSize: 12 }}>{t.role}</div>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ── CTA ──────────────────────────────────────────────────────────
function CTA() {
  return (
    <section style={{ background: Y, padding: "120px 60px", position: "relative", overflow: "hidden" }}>
      {/* big decorative number */}
      <div style={{ position: "absolute", right: -20, top: "50%", transform: "translateY(-50%)", fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 280, color: "rgba(0,0,0,.06)", lineHeight: 1, userSelect: "none", pointerEvents: "none" }}>3</div>
      <Reveal>
        <div style={{ fontSize: 11, color: BLK, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 20, opacity: .5 }}>Start now — it's free</div>
        <h2 style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: "clamp(48px,7vw,96px)", color: BLK, lineHeight: .9, letterSpacing: 1, maxWidth: 700, marginBottom: 36 }}>
          START TRACKING YOUR LIFE TODAY.
        </h2>
        <p style={{ fontSize: 18, color: "rgba(0,0,0,.6)", lineHeight: 1.7, maxWidth: 480, marginBottom: 48 }}>
          Free to use. No credit card. Weight, expenses, and loans — all in one desk waiting for you.
        </p>
        <a href="#trackers" style={{ background: BLK, color: Y, fontWeight: 800, fontSize: 15, padding: "18px 48px", textDecoration: "none", letterSpacing: ".1em", textTransform: "uppercase", display: "inline-block", transition: "transform .2s" }}
          onMouseEnter={e => e.target.style.transform = "translateY(-3px)"} onMouseLeave={e => e.target.style.transform = "none"}>
          Create Free Account →
        </a>
      </Reveal>
    </section>
  );
}

// ── FOOTER ───────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: BLK, borderTop: `1px solid #1a1a1a`, padding: "40px 60px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
      <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 22, color: WHITE, letterSpacing: 2 }}>MY<span style={{ color: Y }}>TRACK</span>DESK</div>
      <div style={{ display: "flex", gap: 32 }}>
        {["About", "Features", "Trackers", "How it works", "Login"].map(l => (
          <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} style={{ color: MUTED, fontSize: 13, textDecoration: "none", transition: "color .2s" }}
            onMouseEnter={e => e.target.style.color = Y} onMouseLeave={e => e.target.style.color = MUTED}>{l}</a>
        ))}
      </div>
      <div style={{ fontSize: 12, color: "#333" }}>Made with ♥ by Anshuman Bharatiya</div>
    </footer>
  );
}

// ── ROOT ─────────────────────────────────────────────────────────
export default function App() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;700&display=swap";
    document.head.appendChild(link);
    document.body.style.margin = "0";
    document.body.style.background = BLK;
    document.body.style.fontFamily = "'DM Sans', sans-serif";
    return () => { document.head.removeChild(link); };
  }, []);

  return (
    <div style={{ background: BLK, minWidth: 320 }}>
      <Nav />
      <Hero />
      <Marquee />
      <Stats />
      <About />
      <Features />
      <TrackerDemo />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}