import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const Y = "#FFE600";
const BLK = "#0A0A0A";

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

  // Close menu on route change
  useEffect(() => setMenuOpen(false), [location]);

  const navLinks = isLanding
    ? [
        { label: "Features", href: "#features" },
        { label: "Trackers", href: "#trackers" },
        { label: "How it works", href: "#how-it-works" },
        { label: "Download App", href: "#app" },
      ]
    : [];

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 clamp(20px, 5vw, 56px)",
          background: scrolled || menuOpen ? "rgba(10,10,10,0.97)" : "transparent",
          borderBottom: scrolled || menuOpen ? "1px solid #1e1e1e" : "none",
          backdropFilter: scrolled || menuOpen ? "blur(12px)" : "none",
          transition: "background 0.3s, border 0.3s",
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 32, height: 32, background: Y,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 18, color: BLK, fontWeight: 900,
          }}>T</div>
          <span style={{
            fontFamily: "'Bebas Neue', Impact, sans-serif",
            fontSize: 22, color: "#fff", letterSpacing: 2,
          }}>TRACK<span style={{ color: Y }}>DESK</span></span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: 32 }} className="td-desktop-nav">
          {navLinks.map(l => (
            <a key={l.label} href={l.href}
              style={{ color: "#888", fontSize: 13, fontWeight: 600, textDecoration: "none", letterSpacing: ".04em", transition: "color .2s" }}
              onMouseEnter={e => e.target.style.color = Y}
              onMouseLeave={e => e.target.style.color = "#888"}>
              {l.label}
            </a>
          ))}
          <Link to="/login"
            style={{ color: "#ccc", fontSize: 13, fontWeight: 600, textDecoration: "none", letterSpacing: ".04em", transition: "color .2s" }}
            onMouseEnter={e => e.target.style.color = Y}
            onMouseLeave={e => e.target.style.color = "#ccc"}>
            Login
          </Link>
          <Link to="/register"
            style={{ background: Y, color: BLK, fontSize: 12, fontWeight: 800, padding: "9px 20px", textDecoration: "none", letterSpacing: ".08em", textTransform: "uppercase", transition: "opacity .2s" }}
            onMouseEnter={e => e.target.style.opacity = "0.85"}
            onMouseLeave={e => e.target.style.opacity = "1"}>
            Get Started →
          </Link>
        </nav>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="td-hamburger"
          style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 8, flexDirection: "column", gap: 5 }}
          aria-label="Toggle menu">
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              display: "block", width: 24, height: 2, background: menuOpen ? Y : "#fff",
              transition: "transform .3s, opacity .3s",
              transform: menuOpen
                ? i === 0 ? "translateY(7px) rotate(45deg)"
                : i === 2 ? "translateY(-7px) rotate(-45deg)"
                : "scaleX(0)"
                : "none",
              opacity: menuOpen && i === 1 ? 0 : 1,
            }} />
          ))}
        </button>
      </header>

      {/* Mobile menu */}
      <div className="td-mobile-menu" style={{
        position: "fixed", top: 64, left: 0, right: 0, zIndex: 199,
        background: "rgba(10,10,10,0.98)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid #1e1e1e",
        padding: menuOpen ? "24px clamp(20px,5vw,56px) 32px" : "0 clamp(20px,5vw,56px)",
        maxHeight: menuOpen ? 400 : 0,
        overflow: "hidden",
        transition: "max-height .35s cubic-bezier(.23,1,.32,1), padding .35s",
        display: "none",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {navLinks.map(l => (
            <a key={l.label} href={l.href}
              style={{ color: "#888", fontSize: 15, fontWeight: 600, textDecoration: "none", padding: "12px 0", borderBottom: "1px solid #1a1a1a" }}
              onClick={() => setMenuOpen(false)}>
              {l.label}
            </a>
          ))}
          <Link to="/login"
            style={{ color: "#ccc", fontSize: 15, fontWeight: 600, textDecoration: "none", padding: "12px 0", borderBottom: "1px solid #1a1a1a" }}>
            Login
          </Link>
          <Link to="/register"
            style={{ background: Y, color: BLK, fontSize: 13, fontWeight: 800, padding: "14px 24px", textDecoration: "none", letterSpacing: ".08em", textTransform: "uppercase", textAlign: "center", marginTop: 12 }}>
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