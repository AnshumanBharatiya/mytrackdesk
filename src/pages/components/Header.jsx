import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const Y = "#FFE600";
const BLK = "#0A0A0A";

function Logo() {
  return (
    <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 0 }}>
      <svg width="148" height="36" viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg">
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

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/";

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  const navLinks = isLanding ? [
    { label: "Features", href: "#features" },
    { label: "Trackers", href: "#trackers" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Download App", href: "#app" },
  ] : [];

  return (
    <>
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 clamp(20px,5vw,56px)",
        background: scrolled || menuOpen ? "rgba(10,10,10,0.97)" : "transparent",
        borderBottom: scrolled || menuOpen ? "1px solid #1e1e1e" : "none",
        backdropFilter: scrolled || menuOpen ? "blur(12px)" : "none",
        transition: "background 0.3s, border 0.3s",
      }}>
        <Logo />

        {/* Desktop nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: 32 }} className="td-desktop-nav">
          {navLinks.map(l => (
            <a key={l.label} href={l.href}
              style={{ color: "#777", fontSize: 13, fontWeight: 600, textDecoration: "none", letterSpacing: ".04em", transition: "color .2s" }}
              onMouseEnter={e => e.target.style.color = Y}
              onMouseLeave={e => e.target.style.color = "#777"}>
              {l.label}
            </a>
          ))}
          <Link to="/login"
            style={{ color: "#bbb", fontSize: 13, fontWeight: 600, textDecoration: "none", letterSpacing: ".04em", transition: "color .2s" }}
            onMouseEnter={e => e.target.style.color = Y}
            onMouseLeave={e => e.target.style.color = "#bbb"}>
            Login
          </Link>
          <Link to="/register"
            style={{ background: Y, color: BLK, fontSize: 12, fontWeight: 800, padding: "9px 20px", textDecoration: "none", letterSpacing: ".08em", textTransform: "uppercase", transition: "opacity .2s" }}
            onMouseEnter={e => e.target.style.opacity = ".82"}
            onMouseLeave={e => e.target.style.opacity = "1"}>
            Get Started →
          </Link>
        </nav>

        {/* Hamburger */}
        <button onClick={() => setMenuOpen(o => !o)} className="td-hamburger"
          style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 8, flexDirection: "column", gap: 5 }}
          aria-label="Toggle menu">
          {[0,1,2].map(i => (
            <span key={i} style={{
              display: "block", width: 24, height: 2,
              background: menuOpen ? Y : "#fff",
              transition: "transform .3s, opacity .3s",
              transform: menuOpen
                ? i === 0 ? "translateY(7px) rotate(45deg)" : i === 2 ? "translateY(-7px) rotate(-45deg)" : "scaleX(0)"
                : "none",
              opacity: menuOpen && i === 1 ? 0 : 1,
            }}/>
          ))}
        </button>
      </header>

      {/* Mobile menu */}
      <div className="td-mobile-menu" style={{
        position: "fixed", top: 64, left: 0, right: 0, zIndex: 199,
        background: "rgba(10,10,10,0.98)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid #1e1e1e",
        padding: menuOpen ? "24px clamp(20px,5vw,40px) 32px" : "0 clamp(20px,5vw,40px)",
        maxHeight: menuOpen ? 400 : 0,
        overflow: "hidden",
        transition: "max-height .35s cubic-bezier(.23,1,.32,1), padding .35s",
        display: "none",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {navLinks.map(l => (
            <a key={l.label} href={l.href}
              style={{ color: "#777", fontSize: 14, fontWeight: 600, textDecoration: "none", padding: "13px 0", borderBottom: "1px solid #161616" }}
              onClick={() => setMenuOpen(false)}>{l.label}</a>
          ))}
          <Link to="/login"
            style={{ color: "#bbb", fontSize: 14, fontWeight: 600, textDecoration: "none", padding: "13px 0", borderBottom: "1px solid #161616" }}>
            Login
          </Link>
          <Link to="/register"
            style={{ background: Y, color: BLK, fontSize: 13, fontWeight: 800, padding: "14px 24px", textDecoration: "none", letterSpacing: ".08em", textTransform: "uppercase", textAlign: "center", marginTop: 14 }}>
            Get Started →
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .td-desktop-nav { display: none !important; }
          .td-hamburger { display: flex !important; }
          .td-mobile-menu { display: block !important; }
        }
      `}</style>
    </>
  );
}