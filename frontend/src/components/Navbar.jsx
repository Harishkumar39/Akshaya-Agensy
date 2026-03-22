import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { 
  ShoppingCart, Search, Menu, X, ChevronRight, 
  Mail, Shield, Package, FolderArchive, Folders, 
  Copy, BookText, BookOpen, Library, BookCheck, 
  PenTool, StickyNote, Receipt, ClipboardList, Presentation, User, LogOut,
  MapPin, CheckCircle2, AlertCircle, ChevronDown // Added for Pincode Checker
} from "lucide-react";

const iconMap = {
  "Office Envelopes": <Mail size={16} />,
  "Cloth Cover": <Shield size={16} />,
  "Bubble Cover": <Package size={16} />,
  "Office Files": <FolderArchive size={16} />,
  "Folder Files": <Folders size={16} />,
  "Copier Papers": <Copy size={16} />,
  "Classmate Binded": <BookText size={16} />,
  "Normal Accounts Register": <BookOpen size={16} />,
  "Leather Binding Register": <Library size={16} />,
  "Oswal Accounts Register": <BookCheck size={16} />,
  "General Stationeries": <PenTool size={16} />,
  "NotePad": <StickyNote size={16} />,
  "Billing Paper/Roll": <Receipt size={16} />,
  "Exam Pad": <ClipboardList size={16} />,
  "White & Black Board": <Presentation size={16} />,
};

const Navbar = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { user, logout } = useAuth();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [isMobileCatsOpen, setIsMobileCatsOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  // Pincode Logic
  const [pin, setPin] = useState(localStorage.getItem('userPincode') || "");
  const [isPinOpen, setIsPinOpen] = useState(false);
  const [pinStatus, setPinStatus] = useState(null);

  const deliverablePincodes = [
    "600119", "600097", "600100", "600130", "600041", 
    "600096", "600115", "603103", "600020", "600042", 
    "600113", "600091"
  ];

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/categories`);
        setCategories(data);
      } catch (error) {
        console.error("Category fetch error:", error.message);
      }
    };
    fetchCategories();

    // Check initial pin status
    if (pin && deliverablePincodes.includes(pin)) setPinStatus('valid');
  }, [API_URL]);

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPin(value);
    if (value.length === 6) {
      if (deliverablePincodes.includes(value)) {
        setPinStatus('valid');
        localStorage.setItem('userPincode', value);
        setTimeout(() => setIsPinOpen(false), 1000);
      } else {
        setPinStatus('invalid');
      }
    } else {
      setPinStatus(null);
    }
  };

  const handleLogoutClick = () => {
    logout();
    clearCart();
    setIsMenuOpen(false);
    navigate("/login");
  };

  return (
    <>
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-[#1a1a1a] text-white text-[10px] md:text-xs py-2 px-6 flex justify-between items-center relative">
        <div className="flex items-center gap-4">
          <span className="font-medium tracking-wide hidden sm:inline text-slate-400">Akshaya Agensy</span>
          
          {/* Pincode Selector */}
          <div className="relative">
            <button 
              onClick={() => setIsPinOpen(!isPinOpen)}
              className="flex items-center gap-1.5 hover:text-amber-400 transition-colors group"
            >
              <MapPin size={12} className={pinStatus === 'valid' ? "text-emerald-400" : "text-amber-500"} />
              <span className="font-bold">
                {pinStatus === 'valid' ? `Deliver to ${pin}` : "Check Delivery"}
              </span>
              <ChevronDown size={10} className={`transition-transform ${isPinOpen ? 'rotate-180' : ''}`} />
            </button>

            {isPinOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white text-slate-900 rounded-xl shadow-2xl p-4 z-[110] border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Delivery Availability</p>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Enter 6-digit Pincode"
                    value={pin}
                    onChange={handlePinChange}
                    className={`w-full p-2.5 rounded-lg border-2 text-xs font-bold outline-none transition-all ${
                      pinStatus === 'valid' ? "border-emerald-100 bg-emerald-50" : 
                      pinStatus === 'invalid' ? "border-red-100 bg-red-50" : "border-slate-100 focus:border-amber-500"
                    }`}
                  />
                  {pinStatus === 'valid' && <CheckCircle2 size={14} className="absolute right-3 top-3 text-emerald-500" />}
                  {pinStatus === 'invalid' && <AlertCircle size={14} className="absolute right-3 top-3 text-red-500" />}
                </div>
                {pinStatus === 'invalid' && (
                  <p className="mt-2 text-[9px] font-bold text-red-500 leading-tight">
                    Currently serving within 15km of Sholinganallur only.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-6 items-center">
          <Link to="/account/orders" className="hover:text-amber-400 transition hidden sm:inline">Track Order</Link>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="font-bold text-amber-400">Hi, {user.name}</span>
              <button 
                onClick={handleLogoutClick} 
                className="text-[10px] bg-white/10 hover:bg-red-500/20 text-white px-3 py-1 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="hover:text-amber-400 transition">Login / Register</Link>
          )}
        </div>
      </div>

      {/* MAIN NAV */}
      <nav className="bg-white border-b sticky top-0 z-50 px-6 md:px-12 py-4 flex justify-between items-center shadow-sm">
        <button className="md:hidden text-slate-800" onClick={() => setIsMenuOpen(true)}>
          <Menu size={24} />
        </button>

        <Link to="/" className="flex items-center gap-2 group">
          <div className="text-xl md:text-2xl font-black tracking-tighter flex items-center">
            <span className="text-amber-500">Akshaya</span>
            <span className="text-slate-900 ml-1">Agensy</span>
          </div>
        </Link>
        
        <div className="hidden md:flex gap-8 font-bold text-[11px] uppercase tracking-[0.15em] items-center">
          <Link to="/" className="hover:text-amber-500 transition">Home</Link>
          
          <div 
            className="relative py-2"
            onMouseEnter={() => setShowCategories(true)}
            onMouseLeave={() => setShowCategories(false)}
          >
            <Link to="/products" className="flex items-center gap-1 hover:text-amber-500 transition">
              Products <ChevronRight size={14} className={`transition-transform duration-300 ${showCategories ? 'rotate-90' : ''}`} />
            </Link>

            {showCategories && (
              <div className="absolute top-full -left-10 pt-2 w-72 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="bg-white shadow-2xl rounded-2xl border border-slate-100 overflow-hidden">
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {categories.map((cat) => (
                      <Link 
                        key={cat._id}
                        to={`/category/${cat.slug}`}
                        className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors group/item"
                      >
                        <div className="flex items-center gap-3 text-slate-600 group-hover/item:text-amber-600">
                          <span className="text-amber-500/50 group-hover/item:text-amber-500">
                            {iconMap[cat.name] || <PenTool size={16} />}
                          </span>
                          <span className="text-[12px]">{cat.name}</span>
                        </div>
                        <ChevronRight size={12} className="text-slate-300 group-hover/item:text-amber-500 transition-transform group-hover/item:translate-x-1" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link to="/about" className="hover:text-amber-500 transition">About</Link>
          <Link to="/contact" className="hover:text-amber-500 transition">Contact</Link>
        </div>

        <div className="flex gap-5 items-center">
          <div className="relative group">
            <Link to="/cart" className="text-slate-800 hover:text-amber-500 transition">
              <ShoppingCart size={22} />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {cartItems.length}
                </span>
              )}
            </Link>
          </div>
          {user && (
            <Link to="/profile" className="text-slate-800 hover:text-amber-500 transition">
              <User size={22} />
            </Link>
          )}
          {user?.role === "admin" && (
          <Link 
            to="/admin/dashboard" 
            className="bg-amber-500 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-tighter hover:bg-amber-600 transition-all ml-4"
          >
            Admin Panel
          </Link>
        )}
        </div>
        
      </nav>

      {/* MOBILE SIDEBAR */}
      <div className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`fixed left-0 top-0 h-full w-80 bg-white shadow-2xl transition-transform duration-300 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 border-b flex justify-between items-center bg-slate-50">
            <span className="font-black tracking-tighter text-xl text-slate-900">Akshaya <span className="text-amber-500">Agency</span></span>
            <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-col p-4 font-bold text-sm uppercase tracking-widest text-slate-600">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="py-4 border-b hover:text-amber-500 transition-colors">Home</Link>
            
            {/* MOBILE CATEGORY ACCORDION */}
            <div className="border-b">
              <button 
                onClick={() => setIsMobileCatsOpen(!isMobileCatsOpen)}
                className="w-full py-4 flex justify-between items-center hover:text-amber-500 transition-colors"
              >
                <span>PRODUCTS</span>
                <ChevronRight size={18} className={`transition-transform duration-300 ${isMobileCatsOpen ? 'rotate-90' : ''}`} />
              </button>
              
              {isMobileCatsOpen && (
                <div className="bg-slate-50 rounded-xl mb-4 max-h-[300px] overflow-y-auto">
                  {categories.map((cat) => (
                    <Link 
                      key={cat._id}
                      to={`/category/${cat.slug}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-6 py-3 text-[11px] hover:text-amber-500 border-b border-white last:border-0"
                    >
                      <span className="text-amber-500/60">{iconMap[cat.name] || <PenTool size={14} />}</span>
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="py-4 border-b hover:text-amber-500 transition-colors">About</Link>
            <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="py-4 border-b hover:text-amber-500 transition-colors">Contact</Link>
          </div>

          {/* Logout Button in Mobile View */}
          {user && (
            <div className="mt-auto p-6 border-t">
              <button 
                onClick={handleLogoutClick}
                className="w-full bg-red-50 text-red-600 py-4 rounded-xl font-black flex items-center justify-center gap-2"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          )}
        </div>
</div>
    </>
  );
};

export default Navbar;