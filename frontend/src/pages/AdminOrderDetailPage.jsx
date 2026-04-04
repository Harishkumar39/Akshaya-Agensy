import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Package, User, MapPin, CreditCard, Clock, Loader2 } from "lucide-react";

const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/admin/orders/${id}`);
        setOrder(data);
      } catch (err) {
        console.error("Failed to fetch order details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const getOptimizedUrl = (url) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    return url.replace("/upload/", "/upload/f_auto,q_auto/");
  };

  const updateStatus = async (newStatus) => {
    try {
      const { data } = await axios.put(`${API_URL}/api/admin/orders/${id}/status`, { status: newStatus });
      setOrder(data);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin text-amber-500" size={40} />
    </div>
  );

  if (!order) return <div className="p-10 text-center">Order not found.</div>;

  console.log(order)
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
        <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition-colors">
            <ArrowLeft size={20} /> Back to Orders
            </button>
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Order #{order._id.slice(-8) || "..."}</span>
        </div>
        <select 
            value={order.status}
            onChange={(e) => updateStatus(e.target.value)}
            className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-xl font-black uppercase text-xs outline-none"
            >
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
        </select>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Items List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <Package className="text-amber-500" size={24} />
              <h2 className="text-xl font-black text-slate-900">Order Items</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {order.items.map((item, index) => (
                <div key={index} className="p-6 flex items-center gap-4">
                  <img src={getOptimizedUrl(item.imageUrl)} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-slate-50" />
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 line-clamp-1">{item.name}</h3>
                    {/* ADD THIS: Show variant name if it exists */}
                    {item.variant && (
                      <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-tighter">
                        Variant : {item.variant.name}
                      </span>
                    )}
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{item.qty} x ₹{item.price}</p>
                  </div>
                  <div className="text-right font-black text-slate-900">
                    ₹{item.qty * item.price}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-slate-50 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-500">
                <span>Subtotal</span>
                <span>₹{order.subtotal || (order.total - (order.shippingFee || 0))}</span>
              </div>
              
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-500">
                <span>Shipping Fee</span>
                <span className="text-amber-600">+ ₹{order.shippingFee || 0}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <span className="font-black text-slate-900 uppercase text-sm tracking-widest">Grand Total</span>
                <span className="text-2xl font-black text-slate-900">₹{order.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Shipping */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-slate-900 font-black uppercase text-xs tracking-widest border-b border-slate-100 pb-4">
              <User size={18} className="text-amber-500" /> Customer Details
            </div>
            <div>
              <p className="font-bold text-slate-800">{order.user?.name || "Guest"}</p>
              <p className="text-sm text-slate-500">{order.user?.email}</p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-slate-900 font-black uppercase text-xs tracking-widest border-b border-slate-100 pb-4">
              <MapPin size={18} className="text-amber-500" /> Shipping To
            </div>
            <div className="text-sm text-slate-600 font-medium leading-relaxed">
              {order.shippingAddress.address}<br />
              {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
              {order.shippingAddress.country}
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-slate-900 font-black uppercase text-xs tracking-widest border-b border-slate-100 pb-4">
              <CreditCard size={18} className="text-amber-500" /> Payment
            </div>
            <div className="flex justify-between items-center">
               <span className="text-xs font-bold text-slate-400 uppercase">Payment Id : </span>
               <span className="text-xs font-black text-slate-800 uppercase">{order.razorpayPaymentId}</span>
            </div>
            <div className={`p-3 rounded-xl text-center text-xs font-black uppercase tracking-widest ${order.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {order.status ? `Paid on ${new Date(order.createdAt).toLocaleDateString()}` : "Not Paid"}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminOrderDetailPage;