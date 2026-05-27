// pages/ForgotPassword.jsx
import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getFirebaseAuthErrorMessage } from "../utils/firebaseError";
import { Mail, ArrowLeft, Send, BarChart3 } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) =>
    /^[a-zA-Z0-9]+([._%+-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    toast.dismiss();

    if (!email.trim()) return toast.error("Email is required!");
    if (!isValidEmail(email)) return toast.error("Enter a valid email!");

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent! Check your inbox. 📧");
      setEmail("");
    } catch (err) {
      toast.error(getFirebaseAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-yellow-400">
          <ArrowLeft size={18} />
          Back to home
        </Link>

        <div className="rounded-xl border border-gray-800 bg-gray-950 p-6 shadow-lg sm:p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-400 text-black rounded-lg mb-4">
              <BarChart3 size={24} />
            </div>
            <h2 className="text-3xl font-bold text-white">Reset Password</h2>
            <p className="text-gray-400 mt-2">We'll send you a reset link to your email</p>
          </div>

          <form className="space-y-6" onSubmit={handleForgotPassword}>
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-400" size={20} />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full border border-gray-700 rounded-lg pl-12 pr-4 py-3 bg-gray-900 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 text-black py-3.5 rounded-lg hover:bg-yellow-300 transition-colors font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
              <span>{loading ? "Sending..." : "Send Reset Link"}</span>
            </button>

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-yellow-400 hover:text-yellow-300 font-medium transition-colors group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Login</span>
            </Link>
          </form>

          <div className="mt-6 p-4 bg-gray-900 border border-gray-800 rounded-lg">
            <p className="text-sm text-gray-300 text-center">
              <strong>📧 Note:</strong> Check your spam folder if you don't receive the email within a few minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}