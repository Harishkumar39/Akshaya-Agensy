import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { 
  ShieldCheck, Truck, CreditCard, MapPin, 
  ChevronLeft, Lock, Edit2, CheckCircle2, 
  Loader2, AlertCircle, User, Phone 
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const CheckoutPage = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); 

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [orderTotals, setOrderTotals] = useState({
    shippingFee: null,
    grandTotal: totalPrice,
  });
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    pincode: "",
  });
  
  const [processing, setProcessing] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
        pincode: user.pincode || "",
      });
      if (!user.address || !user.phone) setIsEditing(true);
    }
  }, [user]);

  const getOptimizedUrl = (url) => {
    if (!url) return "/placeholder.png";
    if (typeof url !== "string") return "/placeholder.png";
    if (!url.includes("cloudinary.com")) return url;
    return url.replace("/upload/", "/upload/f_auto,q_auto,w_800/");
  };

  const handleToggleEdit = async () => {

    if (totalPrice < 500) {
      setErrorMessage("Minimum order value is ₹500. Please add more items to your cart.");
      return;
    }
    
    if (isEditing) {
      if (!formData.name.trim()) return alert("Please enter a name.");
      if (!/^\d{10}$/.test(formData.phone)) return alert("Please enter a valid 10-digit phone number.");
      if (!/^\d{6}$/.test(formData.pincode)) return alert("Please enter a valid 6-digit Pincode.");

      setIsCalculating(true);
      setErrorMessage(""); 

      try {
        const { data } = await axios.post(`${API_URL}/api/payment/shipping-preview`, {
          subtotal: totalPrice,
          shippingAddress: { ...formData, city: "Chennai" }
        });
        
        setOrderTotals({
          shippingFee: data.shippingFee,
          grandTotal: data.grandTotal
        });

        setIsEditing(false); 
      } catch (error) {
          const message = error.response?.data?.message || "Error calculating shipping";
          setErrorMessage(message);
          setOrderTotals({ shippingFee: null, grandTotal: totalPrice });
      } finally {
        setIsCalculating(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "pincode" || name === "phone") {
      const onlyNums = value.replace(/[^0-9]/g, "");
      const limit = name === "pincode" ? 6 : 10;
      if (onlyNums.length <= limit) setFormData({ ...formData, [name]: onlyNums });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handlePayment = async () => {
    if (processing || isEditing || orderTotals.shippingFee === null || !!errorMessage) return;
    setProcessing(true);
    
    try {
      const { data } = await axios.post(`${API_URL}/api/payment/order`, {
        subtotal: totalPrice,
        shippingAddress: { ...formData, email: user.email, city: "Chennai" }
      });

      const options = {
        key: data.keyId,
        amount: data.order.amount,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            await axios.post(`${API_URL}/api/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: cartItems,
              shippingAddress: formData,
              subtotal: totalPrice,
              shippingFee: orderTotals.shippingFee 
            });
            
            clearCart();
            navigate("/account/orders", { state: { orderSuccess: true } });
          } catch (error) {
            console.error(error.response?.data);
            alert("Verification failed. Please check your orders.");
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
          }
        },
        prefill: { name: formData.name, email: user.email, contact: formData.phone },
        theme: { color: "#f59e0b" },
      };
      new window.Razorpay(options).open();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Payment initialization failed.";
      alert(errorMsg);
      setProcessing(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 overflow-x-hidden">
      <div className="bg-white border-b border-slate-100 py-6 mb-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link to="/cart" className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-slate-900">
            <ChevronLeft size={18} /> BACK TO CART
          </Link>
          <div className="flex items-center gap-2 text-emerald-500">
            <Lock size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Secure Checkout</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-8 lg:gap-12">
          
          {/* Left Column */}
          <div className="lg:col-span-6 space-y-6">
            <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white">
                    <MapPin size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Shipping Details</h2>
                </div>
                
                <button 
                  onClick={handleToggleEdit}
                  disabled={isCalculating}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                    isEditing ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {isCalculating ? <Loader2 size={16} className="animate-spin" /> : 
                   isEditing ? <><CheckCircle2 size={16}/> CONFIRM DETAILS</> : <><Edit2 size={16}/> EDIT INFO</>}
                </button>
              </div>

              {errorMessage && (
                <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-2xl flex items-start gap-4">
                  <AlertCircle className="text-red-500 mt-1" size={20} />
                  <p className="text-sm font-bold text-red-600">{errorMessage}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Recipient Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full rounded-xl p-4 font-bold transition-all ${
                      isEditing ? "bg-slate-50 border-2 border-amber-100 focus:ring-2 focus:ring-amber-500" : "bg-transparent border-none p-0 text-slate-900"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Mobile Number</label>
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full rounded-xl p-4 font-bold transition-all ${
                      isEditing ? "bg-slate-50 border-2 border-amber-100 focus:ring-2 focus:ring-amber-500" : "bg-transparent border-none p-0 text-slate-900"
                    }`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                    className={`w-full rounded-xl p-4 font-bold transition-all min-h-[80px] ${
                      isEditing ? "bg-slate-50 border-2 border-amber-100 focus:ring-2 focus:ring-amber-500" : "bg-transparent border-none p-0 text-slate-900 resize-none"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Pincode</label>
                  <input
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full rounded-xl p-4 font-bold transition-all ${
                      isEditing ? "bg-slate-50 border-2 border-amber-100 focus:ring-2 focus:ring-amber-500" : "bg-transparent border-none p-0 text-slate-900"
                    }`}
                  />
                </div>
              </div>
            </section>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 flex items-center gap-4">
                <ShieldCheck className="text-emerald-500" size={32} />
                <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest leading-tight">Authentic <br/>Quality</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex items-center gap-4">
                <Truck className="text-amber-500" size={32} />
                <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest leading-tight">Express <br/>Dispatch</p>
              </div>
            </div>
          </div>

          {/* Right Column: Corrected Structure */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900 text-white rounded-[3rem] p-8 md:p-10 lg:sticky lg:top-10 shadow-2xl">
              <h2 className="text-2xl font-black mb-8 tracking-tighter flex items-center justify-between">
                Order Summary
                <span className="text-[10px] bg-amber-500 text-white px-3 py-1 rounded-full tracking-widest uppercase">
                  {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
                </span>
              </h2>
              
              <div className="max-h-[350px] overflow-y-auto space-y-4 mb-8 pr-3 custom-scrollbar">
                {cartItems.map((item, index) => (
                  <div key={`${item._id}-${index}`} className="flex items-center gap-4 bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 p-4 rounded-2xl transition-all duration-300">
                    <div className="w-14 h-14 rounded-xl bg-white p-1.5 flex-shrink-0 flex items-center justify-center">
                      <img 
                        src={getOptimizedUrl(item.imageUrl)} 
                        className="w-full h-full object-contain mix-blend-multiply" 
                        alt={item.name} 
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black truncate text-slate-100">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {item.variant && (
                          <span className="text-[9px] text-amber-500 font-black uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-md">
                            {item.variant.name}
                          </span>
                        )}
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">
                          Qty: {item.qty}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-black text-base text-white tracking-tighter">
                        ₹{(item.price * item.qty).toLocaleString('en-IN')}
                      </p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase">
                        ₹{Number(item.price).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* These sections are now correctly inside the dark div */}
              <div className="space-y-4 pt-6 border-t border-white/10 mb-8">
                <div className="flex justify-between text-slate-400 font-bold text-sm uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400 font-bold text-sm uppercase tracking-widest">
                  <span>Shipping</span>
                  <span className={orderTotals.shippingFee === 0 ? "text-emerald-400" : ""}>
                    {isCalculating ? "Calculating..." :  
                     orderTotals.shippingFee === 0 ? "FREE" : `₹${orderTotals.shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between items-end pt-4">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Total Payable</p>
                  <p className="text-4xl font-black text-white">₹{(orderTotals.shippingFee === null ? totalPrice : orderTotals.grandTotal).toLocaleString('en-IN')}</p>
                </div>
              </div>

              <button 
                onClick={handlePayment}
                disabled={processing || isEditing || isCalculating || orderTotals.shippingFee === null}
                className={`w-full py-6 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-2xl ${
                  isEditing || orderTotals.shippingFee === null
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50" 
                    : "bg-amber-500 hover:bg-white hover:text-slate-900 text-white shadow-amber-500/20 active:scale-[0.98]"
                }`}
              >
                {processing ? <Loader2 className="animate-spin" /> : 
                 isEditing ? "CONFIRM TO UNLOCK" : 
                 errorMessage ? errorMessage : <><CreditCard size={22} /> PAY NOW</>}
              </button>

              {(isEditing || errorMessage || orderTotals.shippingFee === null) && (
                <p className={`text-center mt-4 text-[10px] font-bold uppercase tracking-widest ${errorMessage ? "text-red-500 animate-bounce" : "text-amber-500 animate-pulse"}`}>
                  {errorMessage ? errorMessage : "Confirm details to unlock payment"}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;