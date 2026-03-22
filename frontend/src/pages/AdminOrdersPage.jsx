import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { 
  ShoppingBag, ChevronRight, Home, Eye, Loader2, 
  Filter, ChevronLeft, Search 
} from "lucide-react";

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New Confirmation States
  const [confirming, setConfirming] = useState(null); // Stores { id, status }
  const [isUpdating, setIsUpdating] = useState(false);

  // Pagination & Filter State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/api/admin/orders?page=${currentPage}&limit=10`;
      if (statusFilter) url += `&status=${statusFilter.toLowerCase()}`;
      if (searchTerm) url += `&userEmail=${searchTerm}`;

      const { data } = await axios.get(url);
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Orders fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC: CONFIRM STATUS CHANGE ---
  const handleConfirmUpdate = async () => {
    if (!confirming) return;
    try {
      setIsUpdating(true);
      await axios.put(`${API_URL}/api/admin/orders/${confirming.id}/status`, { 
        status: confirming.status 
      });
      
      setOrders(prev => prev.map(order => 
        order._id === confirming.id ? { ...order, status: confirming.status } : order
      ));
      setConfirming(null);
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders();
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-600';
      case 'paid': return 'bg-green-100 text-green-600';
      case 'processing': return 'bg-blue-100 text-blue-600';
      case 'shipped': return 'bg-amber-100 text-amber-600';
      case 'delivered': return 'bg-green-100 text-green-600';
      case 'cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm font-bold text-slate-500 mb-2">
        <Link to="/admin" className="hover:text-amber-500 transition-colors flex items-center gap-1"><Home size={16} /></Link>
        <ChevronRight size={14} className="text-slate-300" />
        <span className="text-slate-900 bg-amber-100 px-2 py-1 rounded-md">Orders</span>
      </nav>

      {/* Header & Filters */}
      <div className="space-y-4">
        <div className="lg:flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order Logs</h1>
            <p className="text-slate-500 font-medium">Akshaya Agensy fulfillment tracking</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <form onSubmit={handleSearch} className="md:col-span-8 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Search by customer email..."
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-amber-500 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
          <div className="md:col-span-4 relative">
            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
            <select 
              className="w-full pl-14 pr-10 py-4 bg-white border border-slate-200 rounded-2xl outline-none appearance-none font-bold text-slate-700 shadow-sm"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option> 
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="overflow-hidden">
        {loading ? (
          <div className="p-24 text-center"><Loader2 className="animate-spin mx-auto text-amber-500" size={40} /></div>
        ) : orders.length === 0 ? (
          <div className="p-24 text-center space-y-4">
            <ShoppingBag size={48} className="mx-auto text-slate-200" />
            <p className="text-slate-800 font-black text-xl">No orders matching your criteria</p>
          </div>
        ) : (
          <>
            <div className="block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr className="text-slate-400 text-[11px] uppercase font-black tracking-widest">
                    <th className="p-8">Order ID</th>
                    <th className="p-8">Customer</th>
                    <th className="p-8">Total</th>
                    <th className="p-8">Status Update</th>
                    <th className="p-8 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-bold">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-8 whitespace-nowrap">
                        <div className="text-slate-900 font-black uppercase">#{order._id.slice(-6)}</div>
                        <div className="text-slate-400 text-[10px] mt-1">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="p-8 text-slate-600">{order.user?.name || "Guest"}</td>
                      <td className="p-8 text-lg font-black text-slate-900">₹{order.total}</td>
                      <td className="p-8">
                        <select 
                          value={order.status}
                          // CHANGED: Trigger confirmation instead of immediate update
                          onChange={(e) => setConfirming({ id: order._id, status: e.target.value })}
                          className={`px-4 py-2 rounded-xl border-none outline-none font-black text-[10px] capitalize cursor-pointer ${getStatusStyle(order.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option> 
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-8 text-right">
                        <Link to={`/admin/orders/${order._id}`} className="p-3 inline-block hover:bg-slate-100 text-slate-600 rounded-xl"><Eye size={18}/></Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-100 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-100 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* --- ADDED: CONFIRMATION MODAL OVERLAY --- */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-black text-slate-900 mb-2">Update Status?</h3>
            <p className="text-slate-500 font-medium mb-8">
              Are you sure you want to change this order to <span className="text-amber-600 font-bold uppercase">{confirming.status}</span>?
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirming(null)}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmUpdate}
                disabled={isUpdating}
                className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-amber-500 transition-all flex items-center justify-center gap-2"
              >
                {isUpdating && <Loader2 size={16} className="animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;