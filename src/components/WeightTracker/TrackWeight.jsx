// components/WeightTracker/TrackWeight.jsx - CORRECTED VERSION
import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingDown, TrendingUp, Trash2, Filter, Calendar, Weight as WeightIcon } from "lucide-react";
import Pagination from '../common/Pagination';
import Swal from 'sweetalert2';

export default function TrackWeight() {
  const [weights, setWeights] = useState([]);
  const [filteredWeights, setFilteredWeights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ current: 0, highest: 0, lowest: 0, trend: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minWeight, setMinWeight] = useState("");
  const [maxWeight, setMaxWeight] = useState("");

  useEffect(() => {
    fetchWeights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
    setCurrentPage(1); // Reset to page 1 when filters change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weights, startDate, endDate, minWeight, maxWeight]);

  const fetchWeights = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "weights"),
        where("userId", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);
      const weightData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const createdDate = data.createdAt?.toDate();
        weightData.push({
          id: doc.id,
          ...data,
          dateObj: createdDate,
          date: createdDate?.toLocaleDateString('en-GB') || "N/A",
          fullDate: createdDate?.toISOString().split('T')[0] || "",
        });
      });

      // Sort by date descending
      weightData.sort((a, b) => (b.dateObj?.getTime() || 0) - (a.dateObj?.getTime() || 0));

      setWeights(weightData);
      setFilteredWeights(weightData);
      calculateStats(weightData);
    } catch (error) {
      console.log("Error fetching weights:", error);
      toast.error("Failed to load weight data!");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...weights];

    if (startDate) {
      filtered = filtered.filter(w => w.fullDate >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(w => w.fullDate <= endDate);
    }

    if (minWeight) {
      filtered = filtered.filter(w => w.weight >= parseFloat(minWeight));
    }
    if (maxWeight) {
      filtered = filtered.filter(w => w.weight <= parseFloat(maxWeight));
    }

    setFilteredWeights(filtered);
    calculateStats(filtered);
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setMinWeight("");
    setMaxWeight("");
    setFilteredWeights(weights);
    calculateStats(weights);
  };

  const calculateStats = (data) => {
    if (data.length === 0) {
      setStats({ current: 0, highest: 0, lowest: 0, trend: 0 });
      return;
    }

    const weightValues = data.map((d) => d.weight);
    const current = weightValues[0];
    const highest = Math.max(...weightValues);
    const lowest = Math.min(...weightValues);
    const trend = data.length > 1 ? current - weightValues[weightValues.length - 1] : 0;

    setStats({ current, highest, lowest, trend });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Are you sure you want to delete this entry?!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "weights", id));
        toast.success("Weight entry deleted! 🗑️");
        fetchWeights();
      } catch (error) {
        console.error("Error deleting weight:", error);
        toast.error("Failed to delete entry!");
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const chartData = filteredWeights
    .slice()
    .reverse()
    .map((w) => ({
      date: w.date,
      weight: w.weight,
    }));

  // Calculate Y-axis domain for better visualization
  const getYAxisDomain = () => {
    if (filteredWeights.length === 0) return [0, 100];
    
    const weights = filteredWeights.map(w => w.weight);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const range = maxWeight - minWeight;
    
    if (range < 5) {
      const avg = (minWeight + maxWeight) / 2;
      return [Math.floor(avg - 5), Math.ceil(avg + 5)];
    }
    
    const padding = range * 0.1 || 5;
    return [
      Math.floor(minWeight - padding),
      Math.ceil(maxWeight + padding)
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (weights.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center border border-blue-100">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <WeightIcon className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            No Data Yet
          </h1>
          <p className="text-gray-600 text-lg">Start your journey by entering your first weight!</p>
        </div>
      </div>
    );
  }

  // Calculate pagination AFTER all the early returns
  const totalPages = Math.ceil(filteredWeights.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentWeights = filteredWeights.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header with Filter Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Track Weight
        </h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${
            showFilters
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
              : "bg-white text-blue-600 border-2 border-blue-200"
          }`}
        >
          <Filter size={20} />
          <span>Filters</span>
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100 animate-fadeIn">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Filter Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border-2 border-blue-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border-2 border-blue-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Min Weight</label>
              <input
                type="number"
                step="0.1"
                value={minWeight}
                onChange={(e) => setMinWeight(e.target.value)}
                placeholder="e.g., 60"
                className="w-full border-2 border-blue-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Max Weight</label>
              <input
                type="number"
                step="0.1"
                value={maxWeight}
                onChange={(e) => setMaxWeight(e.target.value)}
                placeholder="e.g., 80"
                className="w-full border-2 border-blue-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all transform hover:scale-105 font-medium"
            >
              Clear Filters
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Showing <span className="font-bold text-blue-600">{filteredWeights.length}</span> of{" "}
            <span className="font-bold">{weights.length}</span> entries
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all">
          <p className="text-sm opacity-90 mb-1">Current Weight</p>
          <p className="text-3xl font-bold">
            {stats.current} <span className="text-xl">{filteredWeights[0]?.unit}</span>
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all">
          <p className="text-sm opacity-90 mb-1">Highest</p>
          <p className="text-3xl font-bold">
            {stats.highest} <span className="text-xl">{filteredWeights[0]?.unit}</span>
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all">
          <p className="text-sm opacity-90 mb-1">Lowest</p>
          <p className="text-3xl font-bold">
            {stats.lowest} <span className="text-xl">{filteredWeights[0]?.unit}</span>
          </p>
        </div>
        <div className={`bg-gradient-to-br ${stats.trend < 0 ? 'from-green-500 to-emerald-600' : 'from-orange-500 to-red-600'} rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all`}>
          <p className="text-sm opacity-90 mb-1">Trend</p>
          <p className="text-3xl font-bold flex items-center">
            {stats.trend < 0 ? <TrendingDown size={28} className="mr-2" /> : <TrendingUp size={28} className="mr-2" />}
            {Math.abs(stats.trend).toFixed(1)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-blue-100">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Weight Progress Chart
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <defs>
              <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12, fill: '#6b7280' }} 
              stroke="#9ca3af"
            />
            <YAxis 
              domain={getYAxisDomain()}
              tick={{ fontSize: 12, fill: '#6b7280' }} 
              stroke="#9ca3af"
              label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff',
                border: '2px solid #8b5cf6',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
              formatter={(value) => [value.toFixed(1), 'Weight']}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Line 
              type="monotone" 
              dataKey="weight" 
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, fill: '#7c3aed' }}
              fill="url(#colorWeight)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-blue-100">
        <h2 className="text-2xl font-bold p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Weight History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Weight</th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Notes</th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100">
              {currentWeights.map((entry, index) => (
                <tr 
                  key={entry.id} 
                  className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} className="text-blue-500" />
                      <span>{entry.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-blue-600">
                    {entry.weight} {entry.unit}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {entry.notes || <span className="text-gray-400 italic">No notes</span>}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-500 hover:text-red-700 hover:scale-110 transition-all transform"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Component - INSIDE the table container */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={filteredWeights.length}
        />
      </div>
    </div>
  );
}