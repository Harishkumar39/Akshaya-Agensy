import React, { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Save, Edit2, ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
axios.defaults.withCredentials = true;

const ProfilePage = () => {
    const { user, setUser } = useAuth(); // Use context instead of local state
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    
    const [formData, setFormData] = useState({ name: "", phone: "", address: "" });
  
    useEffect(() => {
      const fetchUserData = async () => {
        try {
          const { data } = await axios.get(`${API_URL}/api/auth/profile`);
          setFormData({
            name: data.name,
            phone: data.phone || "",
            address: data.address || "",
            email: data.email || ""
          });
        } catch (err) {
          console.error("Failed to fetch profile", err);
        } finally {
          setLoading(false);
        }
      };
      fetchUserData();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
          // .put(protect, updateProfile) matches your backend route
          const { data } = await axios.put(`${API_URL}/api/auth/profile`, formData);
          
          setUser(data); // Update global context
          localStorage.setItem("userInfo", JSON.stringify(data));
          setIsEditing(false);
          alert("Profile updated successfully!");
        } catch (err) {
          alert(err.response?.data?.message || "Update failed");
        } finally {
          setUpdating(false);
        }
    };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-amber-500" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-slate-900 p-8 text-white flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-amber-500 rounded-2xl flex items-center justify-center text-white text-3xl font-black">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              <p className="text-slate-400 flex items-center gap-1">
                <ShieldCheck size={14} className="text-amber-400" /> Verified Account
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl transition font-bold"
          >
            {isEditing ? "Cancel" : <><Edit2 size={16} /> Edit Profile</>}
          </button>
        </div>

        {/* Content Section */}
        <form onSubmit={handleUpdate} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Name Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all ${isEditing ? 'bg-white border-2 border-amber-500' : 'bg-slate-100 border-2 border-transparent cursor-not-allowed'}`}
                />
              </div>
            </div>

            {/* Email Field (Usually non-editable for security) */}
            <div className="space-y-2 opacity-60">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="email" 
                  disabled 
                  value={user?.email}
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 border-2 border-transparent rounded-xl cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all ${isEditing ? 'bg-white border-2 border-amber-500' : 'bg-slate-100 border-2 border-transparent cursor-not-allowed'}`}
                />
              </div>
            </div>

            {/* Address Field */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Shipping Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                <textarea 
                  disabled={!isEditing}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows="3"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all resize-none ${isEditing ? 'bg-white border-2 border-amber-500' : 'bg-slate-100 border-2 border-transparent cursor-not-allowed'}`}
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button 
                type="submit" 
                disabled={updating}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-10 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-200 transition-all active:scale-95"
              >
                {updating ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;