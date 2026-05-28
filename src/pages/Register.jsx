import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { toast } from "react-toastify";
import { auth } from "../firebase";
import { getFirebaseAuthErrorMessage } from "../utils/firebaseError";
import Header from "./components/Header";
import Footer from "./components/Footer";

const Y = "#FFE600";
const BLK = "#0A0A0A";

function AuthPanel({ title, sub, points }) {
  return (
    <div style={{
      position: "relative", overflow: "hidden",
      background: "#0d0d0d", borderRight: "1px solid #1a1a1a",
      padding: "60px 48px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "100%",
    }}>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} viewBox="0 0 500 700" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        {/* Large diamond shape */}
        <polygon points="250,40 460,280 250,520 40,280" fill="none" stroke="#FFE600" strokeWidth="1" opacity="0.07"/>
        <polygon points="250,100 400,280 250,460 100,280" fill="#FFE600" opacity="0.03"/>
        {/* Corner accents */}
        <polyline points="30,30 30,70 70,70" fill="none" stroke="#FFE600" strokeWidth="2" opacity="0.3"/>
        <polyline points="470,670 470,630 430,630" fill="none" stroke="#FFE600" strokeWidth="2" opacity="0.3"/>
        {/* Horizontal lines */}
        <line x1="30" y1="580" x2="180" y2="580" stroke="#FFE600" strokeWidth="1" opacity="0.12"/>
        <line x1="30" y1="596" x2="120" y2="596" stroke="#FFE600" strokeWidth="1" opacity="0.08"/>
        {/* Dot grid */}
        {[0,1,2].map(row =>
          [0,1,2,3,4].map(col => (
            <circle key={`${row}-${col}`} cx={60 + col*70} cy={560 + row*28} r="1.5" fill="#FFE600" opacity="0.1"/>
          ))
        )}
      </svg>
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

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.background = BLK;
  }, []);

  const isValidEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleReset = async e => {
    e.preventDefault(); toast.dismiss();
    if (!email.trim()) return toast.error("Email is required!");
    if (!isValidEmail(email)) return toast.error("Enter a valid email!");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true); toast.success("Reset link sent!");
    } catch (err) { toast.error(getFirebaseAuthErrorMessage(err.code)); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ background: BLK, minHeight: "100vh", fontFamily: "'DM Sans',sans-serif" }}>
      <Header />
      <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", paddingTop: 64 }} className="td-auth-grid">

        {/* LEFT — design panel */}
        <AuthPanel
          title={"RESET\nPASSWORD."}
          sub="No worries — we'll send a secure reset link straight to your inbox."
          points={["Secure email-based reset", "Link expires after 1 hour", "Your data stays safe always"]}
        />

        {/* RIGHT — form */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 40px" }}>
          <div style={{ width: "100%", maxWidth: 400 }}>
            {sent ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 52, marginBottom: 20 }}>📧</div>
                <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 800, marginBottom: 10 }}>Check your inbox</h2>
                <p style={{ color: "#444", fontSize: 13, lineHeight: 1.75, marginBottom: 32 }}>
                  We sent a reset link to{" "}
                  <span style={{ color: Y, fontWeight: 600 }}>{email}</span>.
                  Check spam if it doesn't arrive soon.
                </p>
                <Link to="/login"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, background: Y, color: BLK, fontWeight: 800, fontSize: 13, padding: "13px 28px", textDecoration: "none", letterSpacing: ".08em", textTransform: "uppercase" }}>
                  <ArrowLeft size={15}/> Back to Login
                </Link>
              </div>
            ) : (
              <>
                <h2 style={{ color: "#fff", fontSize: 26, fontWeight: 800, marginBottom: 6, letterSpacing: -.3 }}>Reset password</h2>
                <p style={{ color: "#444", fontSize: 13, marginBottom: 32 }}>Enter your email and we'll send a reset link.</p>

                <form onSubmit={handleReset}>
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: "block", color: "#666", fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>Email Address</label>
                    <div style={{ position: "relative" }}>
                      <Mail size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: Y }} />
                      <input type="text" placeholder="you@example.com" value={email}
                        onChange={e => setEmail(e.target.value)} style={inputBase}
                        onFocus={e => e.target.style.borderColor = Y}
                        onBlur={e => e.target.style.borderColor = "#1e1e1e"} />
                    </div>
                  </div>

                  <button type="submit" disabled={loading}
                    style={{ width: "100%", background: Y, color: BLK, border: "none", padding: "14px", fontSize: 13, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? .7 : 1, transition: "opacity .2s" }}>
                    <Send size={16}/> {loading ? "Sending…" : "Send Reset Link"}
                  </button>
                </form>

                <div style={{ marginTop: 20, background: "#0d0d0d", border: "1px solid #1a1a1a", padding: "12px 14px" }}>
                  <p style={{ color: "#444", fontSize: 12, lineHeight: 1.6, margin: 0 }}>
                    <span style={{ color: Y, fontWeight: 700 }}>Tip:</span> Check spam if the email doesn't arrive in a few minutes.
                  </p>
                </div>

                <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, height: 1, background: "#161616" }} />
                  <span style={{ color: "#2a2a2a", fontSize: 12 }}>or</span>
                  <div style={{ flex: 1, height: 1, background: "#161616" }} />
                </div>

                <p style={{ textAlign: "center", color: "#444", fontSize: 13, marginTop: 20 }}>
                  Remembered it?{" "}
                  <Link to="/login" style={{ color: Y, fontWeight: 700, textDecoration: "none" }}>Login now</Link>
                </p>
              </>
            )}
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