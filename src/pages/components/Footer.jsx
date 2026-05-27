import React from "react";
import { Link } from "react-router-dom";

const Y = "#FFE600";
const BLK = "#0A0A0A";
const MUTED = "#555";

export default function Footer() {
  return (
    <footer style={{ background: BLK, borderTop: "1px solid #161616", padding: "56px clamp(20px,5vw,60px) 32px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, marginBottom: 48 }}>
        {/* Brand */}
        <div>
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 30, height: 30, background: Y, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: 16, color: BLK, fontWeight: 900 }}>T</div>
            <span style={{ fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: 20, color: "#fff", letterSpacing: 2 }}>TRACK<span style={{ color: Y }}>DESK</span></span>
          </Link>
          <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7, maxWidth: 220 }}>
            Your personal dashboard for weight, expenses, and loans. Track everything in one place.
          </p>
        </div>

        {/* Product */}
        <div>
          <div style={{ fontSize: 11, color: Y, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 16 }}>Product</div>
          {[
            { label: "Features", href: "/#features" },
            { label: "Trackers", href: "/#trackers" },
            { label: "How it works", href: "/#how-it-works" },
            { label: "Download App", href: "/#app" },
          ].map(l => (
            <a key={l.label} href={l.href}
              style={{ display: "block", color: MUTED, fontSize: 13, textDecoration: "none", marginBottom: 10, transition: "color .2s" }}
              onMouseEnter={e => e.target.style.color = "#fff"}
              onMouseLeave={e => e.target.style.color = MUTED}>
              {l.label}
            </a>
          ))}
        </div>

        {/* Account */}
        <div>
          <div style={{ fontSize: 11, color: Y, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 16 }}>Account</div>
          {[
            { label: "Login", to: "/login" },
            { label: "Register", to: "/register" },
            { label: "Forgot Password", to: "/forgot-password" },
          ].map(l => (
            <Link key={l.label} to={l.to}
              style={{ display: "block", color: MUTED, fontSize: 13, textDecoration: "none", marginBottom: 10, transition: "color .2s" }}
              onMouseEnter={e => e.target.style.color = "#fff"}
              onMouseLeave={e => e.target.style.color = MUTED}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Download */}
        <div>
          <div style={{ fontSize: 11, color: Y, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 16 }}>Mobile App</div>
          <p style={{ fontSize: 13, color: MUTED, marginBottom: 16, lineHeight: 1.6 }}>TrackDesk is also available on Android.</p>
          <a href="#app"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#111", border: "1px solid #222", color: "#fff", fontSize: 12, fontWeight: 700, padding: "10px 18px", textDecoration: "none", transition: "border-color .2s" }}
            onMouseEnter={e => e.target.style.borderColor = Y}
            onMouseLeave={e => e.target.style.borderColor = "#222"}>
            📱 Download APK
          </a>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #161616", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontSize: 12, color: "#333" }}>© {new Date().getFullYear()} TrackDesk. Made with ♥ by Anshuman Bharatiya</span>
        <span style={{ fontSize: 12, color: "#333" }}>Free to use · No ads · Firebase Auth</span>
      </div>
    </footer>
  );
}