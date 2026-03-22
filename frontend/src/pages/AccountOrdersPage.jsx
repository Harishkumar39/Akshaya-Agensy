import React, { useEffect, useState, useCallback } from "react";
import { useLocation, Link } from "react-router-dom"; // Added Link for the empty state
import { 
  CheckCircle2, Package, Clock, Truck, Calendar, 
  Loader2, ChevronLeft, ChevronRight 
} from "lucide-react";
import axios from "axios";

const AccountOrdersPage = () => {
  const location = useLocation();
  const showSuccess = location.state?.orderSuccess;
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  
  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 5;

  // Memoized fetch function
  const fetchOrders = useCallback(async (page) => {
    setLoading(true);
    try {
      // Ensure your axios instance includes the Authorization header
      const { data } = await axios.get(`${API_URL}/api/orders/my?page=${page}&limit=${LIMIT}`);
      setOrders(data.orders);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(currentPage);
  
    const interval = setInterval(() => {
      // Only fetch if the user is actually looking at the page
      if (document.visibilityState === 'visible') {
        fetchOrders(currentPage);
      }
    }, 30000); 
  
    return () => clearInterval(interval);
  }, [currentPage, fetchOrders]);

  const isCancellable = (createdAt) => {
    const orderTime = new Date(createdAt).getTime();
    const currentTime = new Date().getTime();
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    return currentTime - orderTime < twoHoursInMs;
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order? This cannot be undone.")) return;
    
    setCancelling(orderId);
    try {
      await axios.put(`${API_URL}/api/orders/${orderId}/cancel`);
      alert("Order cancelled successfully.");
      fetchOrders(currentPage);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel order.");
    } finally {
      setCancelling(null);
    }
  };

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'text-emerald-600 bg-emerald-100';
      case 'shipped': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'delivered': return 'text-slate-600 bg-slate-200';
      case 'processing': return 'text-amber-600 bg-amber-100';
      default: return 'text-slate-500 bg-slate-100'; 
    }
  };

  const getOptimizedUrl = (url) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    return url.replace("/upload/", "/upload/f_auto,q_auto/");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {showSuccess && (
        <div className="mb-10 bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem] flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
            <CheckCircle2 size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-emerald-900 tracking-tight">Order Placed Successfully!</h2>
            <p className="text-emerald-700 font-bold uppercase text-[10px] tracking-widest mt-1">
              Your office supplies are now being processed for dispatch
            </p>
          </div>
        </div>
      )}

      <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
              <Package size={24} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">My Orders</h1>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Account Ledger</p>
             <p className="text-[9px] font-bold text-amber-600 uppercase">Page {currentPage} of {totalPages}</p>
          </div>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="py-20 text-center animate-pulse">
              <Loader2 className="mx-auto mb-4 text-slate-300 animate-spin" size={32} />
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Loading Ledger...</p>
            </div>
          ) : orders.length > 0 ? (
            <>
              {orders.map((order) => (
                <div key={order._id} className="group border border-slate-100 rounded-[2rem] overflow-hidden hover:border-amber-200 transition-all duration-300">
                  {/* Order Header */}
                  <div className="bg-slate-50 px-8 py-4 flex flex-wrap justify-between items-center gap-4 border-b border-slate-100">
                    <div className="flex gap-6">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Order Ref No.</p>
                        <p className="text-sm font-black text-slate-900 tracking-tighter uppercase">
                          #{order._id.toString().slice(-6)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Order Date</p>
                        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                          <Calendar size={14} className="text-amber-500" />
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                        <div className={`flex items-center gap-2 font-black text-[10px] uppercase tracking-tighter px-3 py-1 rounded-full ${getStatusStyles(order.status)}`}>
                          <Clock size={12} /> {order.status}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                      <p className="text-xl font-black text-slate-900">₹{order.total.toLocaleString('en-IN')}</p>
                    </div>
                    
                    {/* UPDATED CANCEL LOGIC: Strict match with Backend 'paid' status */}
                    <div className="flex items-center">
                      {order.status?.toLowerCase() === 'paid' && isCancellable(order.createdAt) ? (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          disabled={cancelling === order._id}
                          className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-white hover:bg-red-500 border border-red-200 px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2"
                        >
                          {cancelling === order._id ? <Loader2 size={12} className="animate-spin" /> : "Cancel Order"}
                        </button>
                      ) : order.status?.toLowerCase() === 'paid' && !isCancellable(order.createdAt) ? (
                        <p className="text-[9px] font-bold text-slate-400 uppercase italic">
                          Cancellation window closed
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            <img src={getOptimizedUrl(item.imageUrl)} alt={item.name} className="w-12 h-12 rounded-xl object-contain bg-slate-50 border border-slate-100 p-1" />
                            <div>
                              <p className="text-sm font-black text-slate-900 leading-tight">{item.name}</p>
                              {item.variant && (
                                <p className="text-[9px] text-amber-600 font-black uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded mt-0.5 inline-block">
                                  {typeof item.variant === 'object' ? item.variant.name : item.variant}
                                </p>
                              )}
                              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Qty: {item.qty} x ₹{item.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="bg-slate-50/50 rounded-2xl p-6 border border-dashed border-slate-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Truck size={16} className="text-slate-400" />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Address</p>
                        </div>
                        <p className="text-sm font-bold text-slate-800 uppercase leading-relaxed">
                          {order.shippingAddress.name} <br />
                          <span className="text-slate-500 normal-case">{order.shippingAddress.address}</span> <br />
                          {order.shippingAddress.pincode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* PAGINATION BUTTONS */}
              <div className="mt-12 flex items-center justify-center gap-3">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-20 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx + 1}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${
                        currentPage === idx + 1 
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                        : "text-slate-400 hover:bg-slate-50 border border-transparent hover:border-slate-100"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-20 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="py-20 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center gap-4">
              <Package size={48} className="text-slate-200" />
              <span className="text-slate-300 font-black tracking-widest uppercase text-xs">No orders found yet</span>
              <Link to="/products" className="text-xs font-black text-amber-600 uppercase underline tracking-widest">
                Browse Products
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AccountOrdersPage;