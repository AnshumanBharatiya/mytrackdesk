import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, onAuthStateChanged, updateProfile } from "firebase/auth";
import { ArrowLeft, BarChart3, CheckCircle2, Lock, Mail, User, UserPlus } from "lucide-react";
import { toast } from "react-toastify";
import { auth } from "../firebase";
import { getFirebaseAuthErrorMessage } from "../utils/firebaseError";
import "react-toastify/dist/ReactToastify.css";

export default function Register() {
  const [name, setName] = useState("");
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

  const handleRegister = async (e) => {
    e.preventDefault();
    toast.dismiss();

    if (!name.trim()) return toast.error("Name is required!");
    if (!email.trim()) return toast.error("Email is required!");
    if (!isValidEmail(email)) return toast.error("Enter a valid email!");
    if (!password.trim()) return toast.error("Password is required!");
    if (password.length < 6) return toast.error("Password must be at least 6 characters!");

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      toast.success("Registration successful!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(getFirebaseAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-cyan-700">
            <ArrowLeft size={18} />
            Back to home
          </Link>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-600 text-white">
                <BarChart3 size={24} />
              </div>
              <h2 className="text-3xl font-bold text-slate-950">Create account</h2>
              <p className="mt-2 text-slate-600">Start your personal tracking dashboard.</p>
            </div>

            <form className="space-y-5" onSubmit={handleRegister} noValidate>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-700" size={20} />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-12 pr-4 text-slate-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-700" size={20} />
                  <input
                    type="text"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-12 pr-4 text-slate-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 py-3.5 font-semibold text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UserPlus size={20} />
                <span>{loading ? "Registering..." : "Register"}</span>
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-slate-500">or</span>
                </div>
              </div>

              <p className="text-center text-sm text-slate-600">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-cyan-700 hover:underline">
                  Login Now
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>

      <section className="hidden bg-slate-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-center">
        <div className="max-w-md">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-cyan-300">Create your workspace</p>
          <h1 className="text-4xl font-bold leading-tight">Track your daily records with less effort.</h1>
          <div className="mt-8 space-y-4">
            {["Private user account", "Responsive dashboard", "Charts and history views"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-slate-200">
                <CheckCircle2 className="text-cyan-300" size={20} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
