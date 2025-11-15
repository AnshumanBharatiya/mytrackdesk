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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-white/10 rounded-full -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-white/10 rounded-full -bottom-48 -right-48 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 bg-white/95 backdrop-blur-md shadow-2xl rounded-3xl p-10 w-full max-w-md border border-white/20 transform hover:scale-105 transition-all duration-300">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <BarChart3 className="text-white" size={32} />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Reset Password
          </h2>
          <p className="text-gray-600 mt-2">We'll send you a reset link</p>
        </div>

        <form className="space-y-6" onSubmit={handleForgotPassword}>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500" size={20} />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                className="w-full border-2 border-blue-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 font-semibold text-lg flex items-center justify-center space-x-2"
          >
            <Send size={20} />
            <span>{loading ? "Sending..." : "Send Reset Link"}</span>
          </button>

          <Link
            to="/login"
            className="flex items-center justify-center space-x-2 text-blue-600 hover:text-indigo-600 font-medium transition-all group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Login</span>
          </Link>
        </form>

        <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <p className="text-sm text-gray-700 text-center">
            <strong>📧 Note:</strong> Check your spam folder if you don't receive the email within a few minutes.
          </p>
        </div>
      </div>
    </div>
  );
}