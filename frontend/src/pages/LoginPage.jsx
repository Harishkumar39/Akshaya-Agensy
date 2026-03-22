import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, Mail, Lock, Loader2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";


const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { setCartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const redirectPath = new URLSearchParams(location.search).get("redirect") || "/";

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Attempt the login
      const { data } = await axios.post(`${API_URL}/api/auth/login`, 
        formData,
        {withCredentials: true}
      );
      
      // 2. If successful, use the context login function
      login(data);

      // 3. Handle Cart Merging
      const localCart = JSON.parse(localStorage.getItem("myStationeryCart")) || [];
      if (localCart.length > 0) {
        try {
          // Send the local items to the server
          const response = await axios.post(
            `${API_URL}/api/cart/sync`, 
            { items: localCart }, 
            { withCredentials: true }
          );
  
          if (response.data && response.data.items) {
            const freshItems = response.data.items.map(item => ({
              _id: item.productId._id || item.productId,
              name: item.productId.name,
              price: item.variant ? item.variant.price : item.productId.price,
              imageUrl: item.variant?.imageUrl || item.productId.images?.[0] || "/placeholder.png",
              variant: item.variant,
              qty: item.quantity
            }));
            
            setCartItems(freshItems); // Update state IMMEDIATELY
          }
  
          localStorage.removeItem("myStationeryCart");
        } catch (mergeErr) {
          console.warn("Merge failed", mergeErr);
        }
      }

      if (data.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate(redirectPath);
      }
      
    } catch (err) {
      // --- GRACEFUL ERROR HANDLING ---
      if (err.response) {
        const { status, data } = err.response;

        if (status === 401) {
          // This handles the "401 Unauthorized" you see in the console
          alert(data.message || "Incorrect email or password. Please try again.");
        } else if (data.notVerified) {
          alert("Your email is not verified yet. Redirecting to verification...");
          navigate("/register", { 
            state: { email: formData.email, forceOTP: true } 
          });
        } else {
          alert(data.message || "An error occurred during login.");
        }
      } else {
        alert("Server is currently unreachable. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        <div className="hidden md:flex md:w-1/2 bg-slate-900 p-12 flex-col justify-center text-white">
          <h1 className="text-4xl font-black mb-4 text-amber-400">Welcome Back</h1>
          <p className="opacity-70 leading-relaxed">
            Log in to manage your orders, track your stationery supplies, and access exclusive member discounts.
          </p>
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h2 className="text-3xl font-black text-slate-800 mb-2">Login</h2>
          <p className="text-slate-500 mb-8">Please enter your credentials.</p>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="email" placeholder="Email" required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="password" placeholder="Password" required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="text-right">
              <button type="button" className="text-xs font-bold text-amber-600 hover:underline">
                Forgot Password?
              </button>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-200"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Sign In <ArrowRight size={20} /></>}
            </button>
          </form>

          <p className="mt-10 text-center text-slate-500 text-sm">
            New here? <Link to="/register" className="text-amber-600 font-bold hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;