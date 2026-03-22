import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ContactPage = () => {

    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    useEffect(()=>{
        window.scrollTo(0,0)
    },[])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/contact/inquiry`, formData);
            setSent(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setSent(false), 5000);
        } catch (err) {
            alert("Failed to send message. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="bg-slate-50 min-h-screen py-20 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-12 gap-12 items-start">
                
                {/* Info Side */}
                <div className="lg:col-span-5 space-y-8">
                    <div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">Get in Touch</h1>
                    <p className="text-slate-500 font-medium">Have a bulk order or specific requirement for your office? Reach out to us directly.</p>
                    </div>

                    <div className="space-y-4">
                    <div className="flex items-center gap-6 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <div className="p-4 bg-slate-900 text-white rounded-2xl"><Phone size={20}/></div>
                        <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Call Us</p>
                        <p className="text-slate-900 font-bold">+91 99414 67717</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <div className="p-4 bg-slate-900 text-white rounded-2xl"><Mail size={20}/></div>
                        <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Us</p>
                        <p className="text-slate-900 font-bold">sureshstationerysadyar@gmail.com</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <div className="p-4 bg-slate-900 text-white rounded-2xl"><MapPin size={20}/></div>
                        <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Visit Us</p>
                        <p className="text-slate-900 font-bold">No. 282/A, Village High Road, Sholinganallur, Chennai - 600 119.</p>
                        <p className="text-xs font-black text-slate-400 uppercase">Landmark: Opposite to Tulip Play School</p>
                        </div>
                    </div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="lg:col-span-7 bg-white rounded-[3rem] p-8 md:p-12 shadow-xl shadow-slate-200/60 border border-slate-200">
                    {sent && (
                        <div className="absolute inset-0 bg-white/90 z-10 flex flex-col items-center justify-center animate-in fade-in">
                            <CheckCircle2 size={64} className="text-green-500 mb-4" />
                            <h3 className="text-2xl font-black text-slate-900">Message Sent!</h3>
                        </div>
                        )}
                    <form onSubmit ={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 ml-1">Full Name</label>
                        <input name = "name" type="text" value={formData.name} onChange={handleChange} placeholder="John Doe" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-amber-500 outline-none transition-all font-bold text-slate-700" />
                        </div>
                        <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 ml-1">Email Address</label>
                        <input name = "email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter a valid email address" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-amber-500 outline-none transition-all font-bold text-slate-700" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 ml-1">Subject</label>
                        <input name = "subject" type="text" value={formData.subject} onChange={handleChange} placeholder="Bulk order inquiry" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-amber-500 outline-none transition-all font-bold text-slate-700" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 ml-1">Message</label>
                        <textarea name = "message" value={formData.message} onChange={handleChange} rows="4" placeholder="How can we help you?" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-amber-500 outline-none transition-all font-bold text-slate-700 resize-none"></textarea>
                    </div>

                    <button disabled={loading} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-amber-500 disabled:bg-slate-400 transition-all">
                        {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                        {loading ? "Sending..." : "Send Message"}
                    </button>
                    </form>
                </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;