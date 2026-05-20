import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Landing = lazy(() => import("./pages/Landing/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700">
      <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-cyan-600 animate-spin" />
    </div>
  );
}

function App() {
  return (
    <>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </Router>
      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
}

export default App;
