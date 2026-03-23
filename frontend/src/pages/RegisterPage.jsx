import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, User, Mail, Lock, Phone, ShieldCheck, Loader2, RefreshCw } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const RegisterPage = () => {
  const { login } = useAuth();
  const [step, setStep] = useState("register");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  
  const [formData, setFormData] = useState({
    name: "", 
    email: "",
    password: "", 
    confirmPassword: "", 
    phone: "",
  });

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/; 
  
    if (!formData.name.trim()) return "Name is required";
    if (!phoneRegex.test(formData.phone)) return "Enter a valid 10-digit mobile number";
    if (!emailRegex.test(formData.email)) return "Invalid email format";
    
    // Refined Password Check
    if (formData.password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
      return "Password must contain at least one letter and one number";
    }
  
    if (formData.password !== formData.confirmPassword) return "Passwords do not match";
    if (!agreed) return "Please agree to the terms & conditions";
    
    return null;
  };

  useEffect(() => {
    if (location.state?.forceOTP && location.state?.email) {
      setFormData((prev) => ({ ...prev, email: location.state.email }));
      setStep("otp");
      startTimer();
    }
  }, [location.state]);

  // --- TIMER LOGIC ---
  const startTimer = () => setTimer(60);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (step === "otp" && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  // --- HANDLERS ---
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) return toast.error(error); // 3. Use Sonner instead of alert

    setLoading(true);
    try {
      
      await axios.post(`${API_URL}/api/auth/register`, formData);
      toast.success("OTP sent to your email!");
      setStep("otp");
      startTimer();
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setResending(true);
    try {
      await axios.post(`${API_URL}/api/auth/resend-otp`, { email: formData.email });
      alert("New OTP sent to your email!");
      setOtp(new Array(6).fill(""));
      startTimer();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.join("").length < 6) return toast.warning("Enter the full 6-digit OTP");
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        email: formData.email,
        otp: otp.join(""),
      });

      login(data);
      toast.success("Account verified! Welcome to Akshaya Agency.");
      navigate("/"); 
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  // OTP Input Logic
  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move focus forward
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move focus back on backspace if current field is empty
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Toaster position="top-center" richColors />
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* LEFT SIDE VISUAL */}
        <div className="hidden md:flex md:w-1/2 bg-amber-400 p-12 flex-col justify-center text-white">
          <h1 className="text-4xl font-black mb-4">Akshaya Agensy</h1>
          <p className="opacity-90">Premium Office Supplies & Stationery.</p>
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          {step === "register" ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <h2 className="text-3xl font-black text-slate-800">Create Account</h2>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-400" size={18} />
                <input type="text" 
                placeholder="Full Name" 
                value={formData.name}
                required className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-xl outline-none" onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="text" placeholder="Phone Number" 
                  value={formData.phone}
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-xl outline-none" 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                <input type="email" placeholder="Email" required className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-xl outline-none" onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="password" placeholder="Password" required 
                  value={formData.password}
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-xl outline-none" 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="password" 
                  placeholder="Confirm Password" required 
                  value={formData.confirmPassword}
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-xl outline-none" 
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
                />
              </div>
              <div className="flex items-start gap-3 py-2">
                <input 
                  type="checkbox" 
                  id="terms"
                  required
                  className="mt-1 w-4 h-4 accent-amber-500 cursor-pointer" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <label htmlFor="terms" className="text-xs text-slate-500 leading-tight cursor-pointer">
                  I agree to the 
                  <Link to="/terms" className="text-amber-600 font-bold hover:underline mx-1">Terms & Conditions</Link>, 
                  <Link to="/privacy-policy" className="text-amber-600 font-bold hover:underline mx-1">Privacy Policy</Link>, 
                  and acknowledge the 
                  <Link to="/refund-policy" className="text-amber-600 font-bold hover:underline mx-1">Refund Policy</Link>.
                </label>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : "Continue"}
              </button>
            </form>
          ) : (
            <div className="space-y-6 text-center">
              <div className="bg-amber-50 w-16 h-16 rounded-2xl flex items-center justify-center text-amber-500 mx-auto">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-3xl font-black text-slate-800">Verify OTP</h2>
              <p className="text-slate-500">Sent to <b>{formData.email}</b></p>
              
              <div className="flex gap-2 justify-center">
                {otp.map((digit, idx) => (
                  <input 
                  key={idx} 
                  type="text" 
                  maxLength="1" 
                  ref={(el) => (inputRefs.current[idx] = el)} 
                  value={digit} 
                  onChange={(e) => handleOtpChange(e.target.value, idx)} 
                  onKeyDown={(e) => handleKeyDown(e.key, idx)}
                  className="w-12 h-14 text-center text-2xl font-bold bg-slate-100 border-2 border-transparent focus:border-amber-500 rounded-xl outline-none" />
                ))}
              </div>

              <button onClick={handleVerifyOtp} disabled={loading} className="w-full bg-amber-500 text-white font-bold py-4 rounded-xl shadow-lg">
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Verify & Complete"}
              </button>

              <div className="mt-4">
                <button 
                  onClick={handleResendOtp} 
                  disabled={timer > 0 || resending}
                  className={`flex items-center justify-center gap-2 mx-auto font-bold ${timer > 0 ? "text-slate-300" : "text-amber-600 hover:text-amber-700"}`}
                >
                  <RefreshCw size={16} className={resending ? "animate-spin" : ""} />
                  {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
                </button>
              </div>
            </div>
          )}
          <p className="mt-8 text-center text-sm text-slate-400">
            Already have an account? <Link to="/login" className="text-amber-500 font-bold">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;