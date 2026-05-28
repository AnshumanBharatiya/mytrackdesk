import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { Lock, LogIn, Mail, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { auth } from "../firebase";
import { getFirebaseAuthErrorMessage } from "../utils/firebaseError";
import Header from "./components/Header";
import Footer from "./components/Footer";

const Y = "#FFE600";
const BLK = "#0A0A0A";

/* ── Geometric left panel ── */
function AuthPanel({ title, sub, points }) {
  return (
    <div style={{
      position: "relative", overflow: "hidden",
      background: "#0d0d0d",
      borderRight: "1px solid #1a1a1a",
      padding: "60px 48px",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      minHeight: "100%",
    }}>
      {/* SVG geometric shapes */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} viewBox="0 0 500 700" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        {/* Large triangle top-right */}
        <polygon points="500,0 500,280 220,0" fill="#FFE600" opacity="0.07"/>
        {/* Medium triangle bottom-left */}
        <polygon points="0,700 280,700 0,420" fill="#FFE600" opacity="0.05"/>
        {/* Diagonal lines */}
        <line x1="0" y1="120" x2="500" y2="420" stroke="#FFE600" strokeWidth="1" opacity="0.06"/>
        <line x1="0" y1="200" x2="500" y2="500" stroke="#FFE600" strokeWidth="1" opacity="0.04"/>
        {/* Small accent square */}
        <rect x="380" y="580" width="80" height="80" fill="none" stroke="#FFE600" strokeWidth="1.5" opacity="0.12"/>
        <rect x="400" y="600" width="40" height="40" fill="#FFE600" opacity="0.06"/>
        {/* Corner bracket top-left */}
        <polyline points="30,30 30,70 70,70" fill="none" stroke="#FFE600" strokeWidth="2" opacity="0.3"/>
        {/* Corner bracket bottom-right */}
        <polyline points="470,670 470,630 430,630" fill="none" stroke="#FFE600" strokeWidth="2" opacity="0.3"/>
        {/* Dot grid */}
        {[0,1,2,3,4].map(row =>
          [0,1,2,3].map(col => (
            <circle key={`${row}-${col}`} cx={60 + col*60} cy={320 + row*50} r="1.5" fill="#FFE600" opacity="0.12"/>
          ))
        )}
      </svg>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#444", fontSize: 12, fontWeight: 600, textDecoration: "none", marginBottom: 48, transition: "color .2s" }}
          onMouseEnter={e => e.target.style.color = Y}
          onMouseLeave={e => e.target.style.color = "#444"}>
          <ArrowLeft size={14}/> Back to home
        </Link>
        <div style={{ fontSize: 10, color: Y, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 14 }}>TrackDesk</div>
        <h2 style={{ fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: "clamp(32px,3.5vw,52px)", color: "#fff", lineHeight: .95, letterSpacing: 1, marginBottom: 20 }}>{title}</h2>
        <p style={{ fontSize: 14, color: "#555", lineHeight: 1.75, maxWidth: 320 }}>{sub}</p>
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {points.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: i < points.length-1 ? 18 : 0 }}>
            <div style={{ width: 24, height: 24, background: Y, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
              <span style={{ fontSize: 11, color: BLK, fontWeight: 900 }}>✓</span>
            </div>
            <span style={{ color: "#555", fontSize: 13, lineHeight: 1.6 }}>{p}</span>
          </div>
        ))}
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid #1a1a1a", fontSize: 11, color: "#2a2a2a" }}>
          Powered by Firebase Authentication
        </div>
      </div>
    </div>
  );
}

const inputBase = {
  width: "100%", background: "#080808", border: "1px solid #1e1e1e",
  padding: "13px 14px 13px 44px", color: "#fff", fontSize: 14,
  outline: "none", boxSizing: "border-box", transition: "border-color .2s",
  fontFamily: "inherit", borderRadius: 0,
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.background = BLK;
    const unsub = onAuthStateChanged(auth, u => { if (u) navigate("/dashboard"); });
    return unsub;
  }, [navigate]);

  const isValidEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleLogin = async e => {
    e.preventDefault(); toast.dismiss();
    if (!email.trim()) return toast.error("Email is required!");
    if (!isValidEmail(email)) return toast.error("Enter a valid email!");
    if (!password.trim()) return toast.error("Password is required!");
    if (password.length < 6) return toast.error("Min 6 characters!");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful!"); navigate("/dashboard");
    } catch (err) { toast.error(getFirebaseAuthErrorMessage(err.code)); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ background: BLK, minHeight: "100vh", fontFamily: "'DM Sans',sans-serif" }}>
      <Header />
      <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", paddingTop: 64 }} className="td-auth-grid">

        {/* LEFT — design panel */}
        <AuthPanel
          title={"WELCOME\nBACK."}
          sub="Continue tracking health, expenses, loans, and the daily records that matter."
          points={["Your data is completely private", "Real-time charts & progress", "Access from web or Android app"]}
        />

        {/* RIGHT — form */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 40px" }}>
          <div style={{ width: "100%", maxWidth: 400 }}>
            <h2 style={{ color: "#fff", fontSize: 26, fontWeight: 800, marginBottom: 6, letterSpacing: -.3 }}>Login</h2>
            <p style={{ color: "#444", fontSize: 13, marginBottom: 32 }}>Enter your credentials to access your dashboard.</p>

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", color: "#666", fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>Email</label>
                <div style={{ position: "relative" }}>
                  <Mail size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: Y }} />
                  <input type="text" placeholder="you@example.com" value={email}
                    onChange={e => setEmail(e.target.value)} style={inputBase}
                    onFocus={e => e.target.style.borderColor = Y}
                    onBlur={e => e.target.style.borderColor = "#1e1e1e"} />
                </div>
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ display: "block", color: "#666", fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>Password</label>
                <div style={{ position: "relative" }}>
                  <Lock size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: Y }} />
                  <input type="password" placeholder="••••••••" value={password}
                    onChange={e => setPassword(e.target.value)} style={inputBase}
                    onFocus={e => e.target.style.borderColor = Y}
                    onBlur={e => e.target.style.borderColor = "#1e1e1e"} />
                </div>
              </div>

              <div style={{ textAlign: "right", marginBottom: 28 }}>
                <Link to="/forgot-password" style={{ color: Y, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>Forgot password?</Link>
              </div>

              <button type="submit" disabled={loading}
                style={{ width: "100%", background: Y, color: BLK, border: "none", padding: "14px", fontSize: 13, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? .7 : 1, transition: "opacity .2s" }}>
                <LogIn size={16}/> {loading ? "Logging in…" : "Login"}
              </button>
            </form>

            <div style={{ margin: "24px 0", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: "#161616" }} />
              <span style={{ color: "#2a2a2a", fontSize: 12 }}>or</span>
              <div style={{ flex: 1, height: 1, background: "#161616" }} />
            </div>

            <p style={{ textAlign: "center", color: "#444", fontSize: 13 }}>
              Don't have an account?{" "}
              <Link to="/register" style={{ color: Y, fontWeight: 700, textDecoration: "none" }}>Register now</Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .td-auth-grid { grid-template-columns: 1fr !important; }
          .td-auth-grid > div:first-child { display: none !important; }
        }
      `}</style>
      <Footer />
    </div>
  );
}