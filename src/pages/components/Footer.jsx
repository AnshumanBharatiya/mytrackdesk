import React from "react";
import { Link } from "react-router-dom";

const Y = "#FFE600";
const BLK = "#0A0A0A";
const M = "#444";

function Logo() {
  return (
    <Link to="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
      <svg width="132" height="32" viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" x="2" y="2" fill="#FFE600"/>
        <rect x="10" y="9" width="20" height="4" fill="#0A0A0A"/>
        <rect x="17" y="13" width="6" height="14" fill="#0A0A0A"/>
        <rect x="10" y="24" width="3" height="3" fill="#0A0A0A" opacity="0.4"/>
        <rect x="14.5" y="21" width="3" height="6" fill="#0A0A0A" opacity="0.4"/>
        <rect x="19" y="22.5" width="3" height="4.5" fill="#0A0A0A" opacity="0.4"/>
        <rect x="23.5" y="20" width="3" height="7" fill="#0A0A0A" opacity="0.4"/>
        <text x="46" y="27" fontFamily="'Bebas Neue', Impact, sans-serif" fontSize="22" letterSpacing="2" fill="#FFFFFF">TRACK</text>
        <text x="107" y="27" fontFamily="'Bebas Neue', Impact, sans-serif" fontSize="22" letterSpacing="2" fill="#FFE600">DESK</text>
      </svg>
    </Link>
  );
}

export default function Footer() {
  return (
    <footer style={{ background: BLK, borderTop: "1px solid #141414", padding: "56px clamp(20px,5vw,60px) 28px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 40, marginBottom: 48 }}>
        <div>
          <Logo />
          <p style={{ fontSize: 13, color: M, lineHeight: 1.7, maxWidth: 210, marginTop: 14 }}>
            Personal dashboard for weight, expenses & loans. Track everything, one place.
          </p>
        </div>

        <div>
          <div style={{ fontSize: 10, color: Y, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 16 }}>Product</div>
          {[{ l: "Features", h: "/#features" },{ l: "Trackers", h: "/#trackers" },{ l: "How it works", h: "/#how-it-works" },{ l: "Android App", h: "/#app" }].map(x => (
            <a key={x.l} href={x.h} style={{ display: "block", color: M, fontSize: 13, textDecoration: "none", marginBottom: 9, transition: "color .2s" }}
              onMouseEnter={e => e.target.style.color = "#fff"}
              onMouseLeave={e => e.target.style.color = M}>{x.l}</a>
          ))}
        </div>

        <div>
          <div style={{ fontSize: 10, color: Y, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 16 }}>Account</div>
          {[{ l: "Login", to: "/login" },{ l: "Register", to: "/register" },{ l: "Forgot Password", to: "/forgot-password" }].map(x => (
            <Link key={x.l} to={x.to} style={{ display: "block", color: M, fontSize: 13, textDecoration: "none", marginBottom: 9, transition: "color .2s" }}
              onMouseEnter={e => e.target.style.color = "#fff"}
              onMouseLeave={e => e.target.style.color = M}>{x.l}</Link>
          ))}
        </div>

        <div>
          <div style={{ fontSize: 10, color: Y, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 16 }}>Mobile App</div>
          <p style={{ fontSize: 13, color: M, marginBottom: 16, lineHeight: 1.6 }}>TrackDesk is also on Android.</p>
          <a href="#app" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#111", border: "1px solid #1e1e1e", color: "#fff", fontSize: 12, fontWeight: 700, padding: "10px 16px", textDecoration: "none", transition: "border-color .2s" }}
            onMouseEnter={e => e.target.style.borderColor = Y}
            onMouseLeave={e => e.target.style.borderColor = "#1e1e1e"}>
            📱 Download APK
          </a>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #141414", paddingTop: 22, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <span style={{ fontSize: 12, color: "#2a2a2a" }}>© {new Date().getFullYear()} TrackDesk · Made with ♥ by Anshuman Bharatiya</span>
        <span style={{ fontSize: 12, color: "#2a2a2a" }}>Free · No ads · Firebase Auth</span>
      </div>
    </footer>
  );
}