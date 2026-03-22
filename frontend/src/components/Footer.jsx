import React, {useState} from 'react';
import axios from 'axios';
import {Phone, Clock, Mail } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      await axios.post(`${API_URL}/api/subscribe`, { email });
      setStatus("success");
      setEmail("");
      alert("Thank you for subscribing! Check your inbox.");
    } catch (err) {
      console.error(err);
      setStatus("error");
      alert("Something went wrong. Please try again.");
    } finally {
      setStatus("");
    }
  };
  return (
    <footer className="bg-[#001D35] text-white pt-20 pb-10 px-6 md:px-20 font-sans">
      
      {/* 1. NEWSLETTER SECTION */}
      <div className="max-w-4xl mx-auto text-center mb-24">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">
          Subscribe And Get 10% Off Your <br className="hidden md:block" /> First Purchase.
        </h2>
        <form onSubmit={handleSubscribe} className="relative max-w-2xl mx-auto">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter Your Email Address"
            className="w-full py-4 px-8 rounded-full bg-white text-slate-800 outline-none pr-32"
          />
          <button 
            type="submit"
            disabled={status === "loading"}
            className="absolute right-2 top-2 bottom-2 bg-transparent text-[#001D35] font-bold px-6 rounded-full hover:text-amber-500 transition-colors disabled:opacity-50"
          >
            {status === "loading" ? "..." : "Subscribe"}
          </button>
        </form>
      </div>

      {/* 2. MAIN FOOTER CONTENT */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20 border-b border-white/10 pb-16">
        
        {/* Brand Info */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
          <img src="/LOGO Akshaya Agensy.png" alt="Akshaya Agensy Logo" className="h-8 w-8 object-contain" />
            <span className="text-2xl font-bold tracking-tighter">Akshaya Agensy</span>
          </div>
          <span className="text-2md tracking-tighter">An innovate step from Suresh Stationerys (Adyar)</span>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            We Promise We'll Get Back To You Promptly- Your Gifting Needs Are Always On Our Minds!
          </p>
        </div>

        {/* Useful Links */}
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest mb-8">Useful Links</h3>
          <ul className="space-y-4 text-slate-400 text-sm">
            <li><a href="/about" className="hover:text-amber-400 transition">About Us</a></li>
            <li><a href="/contact" className="hover:text-amber-400 transition">Contact Us</a></li>
            <li><a href="/delivery-policy" className="hover:text-amber-400 transition">Delivery Policy</a></li>
            <li><a href="/terms" className="hover:text-amber-400 transition">Terms & Conditions</a></li>
            <li><a href="/privacy-policy" className="hover:text-amber-400 transition">Privacy Policy</a></li>
            <li><a href="/refund-policy" className="hover:text-amber-400 transition">Refund Policy</a></li>
          </ul>
        </div>

        {/* Shop Links */}
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest mb-8">Shop</h3>
          <ul className="space-y-4 text-slate-400 text-sm">
            <li><a href="/products" className="hover:text-amber-400 transition">Shop</a></li>
            <li><a href="#" className="hover:text-amber-400 transition">Best Selling Products</a></li>
          </ul>
        </div>

        {/* Need Help Section */}
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest mb-8">Need Help</h3>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Phone size={20} className="text-pink-500" />
              <span className="text-xl font-bold text-pink-500 hover:text-pink-400 cursor-pointer">
                (+91) 99414 67717
              </span>
            </div>
            <div className="flex items-start gap-3 text-slate-400 text-sm">
              <Clock size={20} className="shrink-0 mt-1" />
              <div>
                <p>Monday – Saturday: 9:00-20:00</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-400 text-sm hover:text-white cursor-pointer transition">
              <Mail size={20} />
              <span>sureshstationerysadyar@gmail.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. COPYRIGHT & LANGUAGE */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-[11px] font-bold uppercase tracking-widest text-slate-500">
        <p>Copyright © 2026 Akshaya Agensy. All rights reserved.</p>
      </div>

    </footer>
  );
};

export default Footer;