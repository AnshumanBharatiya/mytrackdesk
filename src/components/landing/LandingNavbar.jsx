import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import BrandLogo from "./BrandLogo";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" },
  { label: "Feedback", href: "#feedback" },
];

export default function LandingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <BrandLogo />

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-slate-700 hover:text-cyan-700">
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700"
          >
            Login
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-800 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-lg md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-slate-800 hover:bg-slate-100"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/login"
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-cyan-700 px-5 py-3 font-semibold text-white"
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
