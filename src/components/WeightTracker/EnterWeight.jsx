// components/WeightTracker/EnterWeight.jsx
import React, { useState } from "react";
import { db, auth } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import { Scale, Save, TrendingDown } from "lucide-react";

export default function EnterWeight() {
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState("kg");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!weight || isNaN(weight) || parseFloat(weight) <= 0) {
      return toast.error("Please enter a valid weight!");
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("You must be logged in!");
        return;
      }

      await addDoc(collection(db, "weights"), {
        userId: user.uid,
        weight: parseFloat(weight),
        unit: unit,
        notes: notes.trim(),
        createdAt: serverTimestamp(),
      });

      toast.success("Weight recorded successfully! 🎉");
      setWeight("");
      setNotes("");
    } catch (error) {
      console.error("Error adding weight:", error);
      toast.error("Failed to record weight!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 border border-blue-100">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Scale className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Enter Weight
            </h1>
            <p className="text-gray-500 text-sm mt-1">Track your daily weight progress</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Weight <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Enter your weight"
                  className="w-full border-2 border-blue-200 rounded-xl px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full border-2 border-blue-200 rounded-xl px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="lbs">Pounds (lbs)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Notes <span className="text-gray-400">(Optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about your progress, diet, exercise..."
              rows="5"
              className="w-full border-2 border-blue-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 font-semibold text-lg flex items-center justify-center space-x-2"
          >
            <Save size={20} />
            <span>{loading ? "Saving..." : "Save Weight"}</span>
          </button>
        </form>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <div className="flex items-start space-x-3">
              <TrendingDown className="text-blue-600 mt-1" size={24} />
              <div>
                <p className="font-semibold text-gray-800 mb-1">💡 Pro Tip</p>
                <p className="text-sm text-gray-600">
                  Weigh yourself at the same time each day, preferably in the morning before eating for consistent results.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-start space-x-3">
              <Scale className="text-blue-600 mt-1" size={24} />
              <div>
                <p className="font-semibold text-gray-800 mb-1">📊 Consistency</p>
                <p className="text-sm text-gray-600">
                  Regular tracking helps you identify patterns and stay motivated on your journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}