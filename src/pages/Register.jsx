// pages/Register.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile, onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";
import { getFirebaseAuthErrorMessage } from "../utils/firebaseError";
import { UserPlus, Mail, Lock, User, BarChart3 } from "lucide-react";
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

  const isValidEmail = (email) =>
    /^[a-zA-Z0-9]+([._%+-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

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
      toast.success("Registration Successful! 🎉");
      navigate("/dashboard");
    } catch (err) {
      toast.error(getFirebaseAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-white/10 rounded-full -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-white/10 rounded-full -bottom-48 -right-48 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 bg-white/95 backdrop-blur-md shadow-2xl rounded-3xl p-10 w-full max-w-md border border-white/20 transform hover:scale-105 transition-all duration-300">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <BarChart3 className="text-white" size={32} />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="text-gray-600 mt-2">Start tracking your progress today</p>
        </div>

        <form className="space-y-5" onSubmit={handleRegister} noValidate>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-500" size={20} />
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-2 border-purple-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-500" size={20} />
              <input
                type="text"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-purple-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-500" size={20} />
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-purple-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 font-semibold text-lg flex items-center justify-center space-x-2"
          >
            <UserPlus size={20} />
            <span>{loading ? "Registering..." : "Register"}</span>
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or</span>
            </div>
          </div>

          <p className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link 
              to="/login" 
              className="text-purple-600 hover:text-indigo-600 font-semibold hover:underline transition-all"
            >
              Login Now
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}