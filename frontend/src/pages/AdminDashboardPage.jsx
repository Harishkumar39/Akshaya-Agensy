import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { DollarSign, ShoppingCart, Users, Package, Loader2, ChevronRight, AlertTriangle, IndianRupee } from "lucide-react";

const AdminDashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/admin/summary`);
        setSummary(data);
      } catch (err) {
        console.error("Summary fetch failed");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-amber-500" size={40} /></div>;

  const stats = [
    { label: "Total Revenue", value: `₹${summary?.revenue}`, icon: <IndianRupee />, color: "text-green-600", bg: "bg-green-100" },
    { label: "Total Orders", value: summary?.orders, icon: <ShoppingCart />, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Low Stock Items", value: summary?.lowStockCount || 0, icon: <Package />, color: "text-amber-600", bg: "bg-amber-100" },
  ];


  return (
    <div className="p-4 md:p-6 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Akshaya Agensy Overview</h1>
        <p className="text-slate-500 font-medium">Real-time business performance</p>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>{stat.icon}</div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Low Stock Alerts Section */}
      {summary?.lowStockItems?.length > 0 && (
        <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 bg-red-50/50 border-b border-red-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-500" size={20} />
              <h2 className="font-black text-slate-900 uppercase text-xs tracking-widest">Inventory Alerts</h2>
            </div>
            <Link to="/admin/products" className="text-[10px] font-black text-red-600 uppercase hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {summary.lowStockItems.slice(0, 5).map((item) => (
              <div key={item._id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div>
                  <p className="font-bold text-slate-800">{item.name}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase">ID: {item._id.slice(-6)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${item.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                    {item.stock} Remaining
                  </span>
                  <Link to={`/admin/products?edit=${item._id}`} className="text-slate-300 hover:text-slate-600">
                    <ChevronRight size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Order Status Breakdown */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
         <h2 className="font-black text-slate-900 uppercase text-xs tracking-widest border-b border-slate-100 pb-4">Order Status Logistics</h2>
         <div className="flex gap-4 flex-wrap">
            {Object.entries(summary?.statusCounts || {}).map(([status, count]) => (
              <div key={status} className="px-5 py-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{status}:</span>
                <span className="font-black text-slate-900">{count}</span>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;