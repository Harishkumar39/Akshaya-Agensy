import React, { useEffect, useState, useCallback } from "react";
import { useLocation, Link } from "react-router-dom"; // Added Link for the empty state
import { 
  CheckCircle2, Package, Clock, Truck, Calendar, 
  Loader2, ChevronLeft, ChevronRight, Info 
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
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
      {showSuccess && (
        <div className="mb-6 md:mb-10 bg-emerald-50 border border-emerald-100 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center gap-4 md:gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-emerald-500 text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 shrink-0">
            <CheckCircle2 size={32} />
          </div>
          <div>
            <h2 className="text-lg md:text-2xl font-black text-emerald-900 tracking-tight leading-tight">Order Placed Successfully!</h2>
            <p className="text-emerald-700 font-bold uppercase text-[9px] md:text-[10px] tracking-widest mt-1">
              Your office supplies are now being processed for dispatch
            </p>
          </div>
        </div>
      )}

      

      <section className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-12 shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-900 rounded-xl md:rounded-2xl flex items-center justify-center text-white shrink-0">
              <Package size={24} />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase">My Orders</h1>
          </div>
          <div className="flex justify-between md:block md:text-right border-t md:border-t-0 pt-4 md:pt-0 border-slate-50">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Account Ledger</p>
             <p className="text-[9px] font-bold text-amber-600 uppercase">Page {currentPage} of {totalPages}</p>
          </div>
        </div>

        <div className="mb-8 bg-amber-50/50 border border-amber-100/50 rounded-2xl p-4 flex items-start gap-3">
          <Info size={16} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-[11px] md:text-xs font-bold text-amber-800 leading-relaxed uppercase tracking-wide">
            Cancellation Policy: <span className="font-medium normal-case text-slate-600">Orders can only be cancelled within 2 hours of placement while in the "Paid" status.</span>
          </p>
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
                <div key={order._id} className="group border border-slate-100 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden hover:border-amber-200 transition-all duration-300"> 
                {/* Order Header */}
                  <div className="bg-slate-50 px-5 md:px-8 py-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-slate-100">
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-6 w-full lg:w-auto">
                      <div>
                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Order Ref No.</p>
                        <p className="text-xs md:text-sm font-black text-slate-900 tracking-tighter uppercase">
                          #{order._id.toString().slice(-6)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                        <div className="flex items-center gap-2 text-slate-900 font-bold text-xs md:text-sm">
                          <Calendar size={12} className="text-amber-500" />
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                        <div className={`flex items-center gap-1.5 font-black text-[9px] uppercase tracking-tighter px-2.5 py-1 rounded-full w-fit ${getStatusStyles(order.status)}`}>
                          <Clock size={10} /> {order.status}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between lg:justify-end w-full lg:w-auto gap-8 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-200 lg:border-transparent">
                      <div className="lg:text-right">
                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                        <p className="text-lg md:text-xl font-black text-slate-900">₹{order.total.toLocaleString('en-IN')}</p>
                      </div>
                    
                      <div className="flex items-center">
                        {order.status?.toLowerCase() === 'paid' && isCancellable(order.createdAt) ? (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            disabled={cancelling === order._id}
                            className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-white hover:bg-red-500 border border-red-200 px-3 md:px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2"
                          >
                            {cancelling === order._id ? <Loader2 size={10} className="animate-spin" /> : "Cancel"}
                          </button>
                        ) : order.status?.toLowerCase() === 'paid' && !isCancellable(order.createdAt) ? (
                          <p className="text-[9px] font-bold text-slate-300 uppercase italic">Window closed</p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-5 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            <img 
                              src={getOptimizedUrl(item.imageUrl)} 
                              alt={item.name} 
                              className="w-12 h-12 rounded-xl object-contain bg-slate-50 border border-slate-100 p-1 shrink-0" 
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-black text-slate-900 leading-tight truncate">{item.name}</p>
                              <div className="flex flex-wrap gap-2 items-center mt-1">
                                {item.variant && (
                                  <span className="text-[8px] text-amber-600 font-black uppercase tracking-widest bg-amber-50 px-1.5 py-0.5 rounded">
                                    {typeof item.variant === 'object' ? item.variant.name : item.variant}
                                  </span>
                                )}
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest shrink-0">Qty: {item.qty} × ₹{item.price}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-slate-50/50 rounded-2xl p-5 border border-dashed border-slate-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Truck size={14} className="text-slate-400" />
                          <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Shipping To</p>
                        </div>
                        <p className="text-xs md:text-sm font-bold text-slate-800 uppercase leading-relaxed">
                          {order.shippingAddress.name} <br />
                          <span className="text-slate-500 normal-case font-medium">{order.shippingAddress.address}</span> <br />
                          <span className="text-slate-900 tracking-widest">{order.shippingAddress.pincode}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* PAGINATION BUTTONS */}
              <div className="mt-12 flex items-center justify-center gap-2 md:gap-3">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 md:p-3 rounded-lg md:rounded-xl border border-slate-200 text-slate-600 disabled:opacity-20 transition-all"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex gap-1 md:gap-2">
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx + 1}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl font-black text-[10px] md:text-xs transition-all ${
                        currentPage === idx + 1 
                        ? "bg-slate-900 text-white shadow-lg" 
                        : "text-slate-400 border border-transparent"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 md:p-3 rounded-lg md:rounded-xl border border-slate-200 text-slate-600 disabled:opacity-20 transition-all"
                >
                  <ChevronRight size={18} />
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