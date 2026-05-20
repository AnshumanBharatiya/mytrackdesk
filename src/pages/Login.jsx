import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { ArrowLeft, BarChart3, Lock, LogIn, Mail } from "lucide-react";
import { toast } from "react-toastify";
import { auth } from "../firebase";
import { getFirebaseAuthErrorMessage } from "../utils/firebaseError";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) navigate("/dashboard");
    });
    return () => unsubscribe();
  }, [navigate]);

  const isValidEmail = (value) =>
    /^[a-zA-Z0-9]+([._%+-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);

  const handleLogin = async (e) => {
    e.preventDefault();
    toast.dismiss();

    if (!email.trim()) return toast.error("Email is required!");
    if (!isValidEmail(email)) return toast.error("Enter a valid email!");
    if (!password.trim()) return toast.error("Password is required!");
    if (password.length < 6) return toast.error("Password must be at least 6 characters!");

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(getFirebaseAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[0.95fr_1.05fr]">
      <section className="hidden bg-slate-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="inline-flex items-center gap-3 text-sm font-semibold text-slate-200 hover:text-white">
          <ArrowLeft size={18} />
          Back to home
        </Link>
        <div>
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-cyan-500 text-slate-950">
            <BarChart3 size={28} />
          </div>
          <h1 className="max-w-md text-4xl font-bold leading-tight">Welcome back to MyTrackDesk.</h1>
          <p className="mt-5 max-w-md text-lg leading-8 text-slate-300">
            Continue tracking health, expenses, loans, and the daily records that matter.
          </p>
        </div>
        <p className="text-sm text-slate-400">Secure access powered by Firebase Authentication.</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-cyan-700 lg:hidden">
            <ArrowLeft size={18} />
            Back to home
          </Link>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-600 text-white">
                <BarChart3 size={24} />
              </div>
              <h2 className="text-3xl font-bold text-slate-950">Login</h2>
              <p className="mt-2 text-slate-600">Enter your details to open your dashboard.</p>
            </div>

            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-700" size={20} />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-12 pr-4 text-slate-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-700" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-12 pr-4 text-slate-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 py-3.5 font-semibold text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogIn size={20} />
                <span>{loading ? "Logging in..." : "Login"}</span>
              </button>

              <div className="text-center">
                <Link to="/forgot-password" className="text-sm font-medium text-cyan-700 hover:underline">
                  Forgot Password?
                </Link>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-slate-500">or</span>
                </div>
              </div>

              <p className="text-center text-sm text-slate-600">
                Don't have an account?{" "}
                <Link to="/register" className="font-semibold text-cyan-700 hover:underline">
                  Register Now
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
