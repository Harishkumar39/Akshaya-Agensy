import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, CreditCard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const CartPage = () => {
  const {
    cartItems,
    removeFromCart,
    increaseQty,
    decreaseQty,
    totalPrice,
  } = useCart();
  const {user, loading} = useAuth();

  const navigate = useNavigate();

  const getOptimizedUrl = (url) => {
    if (!url) return "/placeholder.png";
    if (typeof url !== "string") return "/placeholder.png";
    if (!url.includes("cloudinary.com")) return url;
    return url.replace("/upload/", "/upload/f_auto,q_auto,w_800/");
  };

  const handleCheckout = () => {
    if (!user) {
      alert("Please login to proceed with your order.");
      navigate("/login?redirect=/checkout");
    } else {
      navigate("/checkout");
    }
  };

  useEffect(()=>{
    window.scrollTo({top: 0 , behavior: "smooth"})
  },[])

  // 1. EMPTY STATE
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">Your cart is empty</h2>
        <p className="text-slate-500 mb-8 text-center max-w-sm">
          Looks like you haven't added anything to your cart yet. Explore our categories to find what you need.
        </p>
        <Link 
          to="/products" 
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-amber-500 transition-all shadow-lg shadow-slate-200 active:scale-95"
        >
          START SHOPPING
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">
            Shopping Cart <span className="text-amber-500 text-xl ml-2">({cartItems.length})</span>
          </h1>
          <Link to="/products" className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-amber-500 transition-colors">
            <ArrowLeft size={16} /> CONTINUE SHOPPING
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* 2. LEFT: CART ITEMS LIST */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => {
              const itemKey = item.variant ? `${item._id}-${item.variant.name}` : item._id;
              
              return (
                <div
                  key={itemKey}
                  className="group flex flex-col sm:flex-row items-center gap-6 p-6 bg-white border border-slate-100 rounded-[2rem] hover:shadow-xl hover:shadow-slate-100 transition-all"
                >
                  {/* Product Image */}
                  <div className="w-full sm:w-32 h-40 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 p-4">
                    <img
                      src={getOptimizedUrl(item.imageUrl) || "/api/placeholder/100/100"}
                      alt={item.name}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-black text-slate-900 mb-1">{item.name}</h3>
                    
                    {item.variant && (
                      <div className="inline-block bg-slate-100 px-3 py-1 rounded-lg mb-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          Type: <span className="text-slate-900">{item.variant.name}</span>
                        </p>
                      </div>
                    )}
                    
                    <p className="text-xl font-black text-amber-500">
                      ₹{(Number(item.price) || 0).toLocaleString('en-IN')}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl">
                    <button
                      onClick={() => decreaseQty(item._id, item.variant?.name)}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-amber-500 hover:text-white transition-all text-slate-400"
                    >
                      <Minus size={16} />
                    </button>

                    <span className="font-black text-slate-900 w-6 text-center">{item.qty}</span>

                    <button
                      onClick={() => increaseQty(item._id, item.variant?.name)}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-amber-500 hover:text-white transition-all text-slate-400"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item._id, item.variant?.name || null)}
                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* 3. RIGHT: ORDER SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 sticky top-28 shadow-2xl shadow-slate-200">
              <h2 className="text-xl font-black mb-8 border-b border-white/10 pb-4">Order Summary</h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-400 font-bold">
                  <span>Subtotal</span>
                  <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400 font-bold">
                  <span>Shipping</span>
                  <span className="text-emerald-400">Calculated at checkout</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                  <div>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Total Amount</p>
                    {/* FIXED: Removed 't' and 'item.price' reference which was crashing the summary */}
                    <p className="text-3xl font-black text-white">₹{totalPrice.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-5 rounded-2xl font-black text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-amber-500/20">
                  <CreditCard size={20} />
                  CHECKOUT NOW
              </button>

              <div className="mt-6 flex items-center justify-center gap-4">
                 <div className="h-px bg-white/10 flex-1"></div>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secure Payment</span>
                 <div className="h-px bg-white/10 flex-1"></div>
              </div>
            </div>
            
            <p className="mt-6 text-center text-xs text-slate-400 font-bold uppercase tracking-tighter">
              Free returns on all stationery items within 7 days
            </p>
          </div>

        </div>
      </section>
    </div>
  );
};

export default CartPage;