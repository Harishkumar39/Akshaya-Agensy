import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import CategoryGrid from "../components/CategoryGrid";
// Added MapPin and CheckCircle for the new delivery section
import { ArrowRight, ShoppingCart, Loader2, Image as ImageIcon, LayoutGrid, MapPin, CheckCircle, Globe } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";

const HomePage = () => {
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const getOptimizedUrl = (url) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    return url.replace("/upload/", "/upload/f_auto,q_auto/");
  };

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/products?featured=true&limit=10`);
        setFeaturedProducts(data.products || []);
      } catch (err) {
        console.error("Failed to fetch featured products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <main className="max-w-[1600px] mx-auto py-6 md:py-10 px-4 md:px-12">

      {/* 1. HERO SECTION */}
      <section className="relative h-[500px] md:h-[700px] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden bg-[#FEF6E4] flex items-center mb-12 md:mb-20 shadow-sm border border-amber-100/50">
        <div className="z-10 pl-8 md:pl-24 space-y-4 md:space-y-8 max-w-2xl">
          <div className="flex items-center gap-2 bg-amber-500/10 w-fit px-4 py-1.5 rounded-full border border-amber-500/20">
            <MapPin size={14} className="text-amber-600" />
            <span className="text-amber-600 font-black uppercase tracking-widest text-[9px] md:text-[10px]">
              Now Delivering to South Chennai
            </span>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black leading-[1.1] text-slate-900 tracking-tighter">
            Precision in <br /> Every <span className="italic font-serif text-amber-500">Stroke.</span>
          </h1>
          <p className="text-slate-600 text-sm md:text-xl font-medium max-w-md leading-relaxed">
            Premium office registers and stationery delivered within 24–48 hours to Sholinganallur and surrounding areas.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link to="/products" className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 md:px-12 py-3 md:py-5 rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-[0.2em] hover:bg-amber-500 transition-all duration-300 transform hover:-translate-y-1 shadow-2xl">
              Explore Shop <ArrowRight size={18} />
            </Link>
            
            {/* Quick trust badge for local delivery */}
            <div className="flex items-center gap-3 px-5 py-2 bg-white/70 backdrop-blur-md rounded-2xl border border-white shadow-sm">
               <CheckCircle size={20} className="text-emerald-500" />
               <div className="text-left">
                  <p className="text-[10px] font-black text-slate-900 leading-none uppercase">15KM Radius</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Express Local Shipping</p>
               </div>
            </div>
          </div>
        </div>
        
        <img 
          src="https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&q=80&w=1000" 
          className="absolute right-0 top-0 h-full w-1/2 object-cover object-center rounded-l-[100px] md:rounded-l-[160px] hidden lg:block" 
          alt="Premium Stationery"
        />
      </section>

      {/* 2. CATEGORIES SECTION */}
      <div className="mb-20">
        <div className="flex flex-col mb-10 px-2">
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">Browse Categories</h2>
          <div className="h-1.5 w-20 bg-amber-500 mt-3 rounded-full"></div>
        </div>
        <CategoryGrid />
      </div>

      {/* 3. BEST SELLERS / PRODUCT GRID */}
      <section id="featured" className="mb-20">
        <div className="flex flex-col md:flex-row justify-between md:items-start mb-12 gap-6 px-2">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">Featured Collection</h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Handpicked premium supplies for Akshaya Agensy</p>
          </div>
          <Link to="/products" className="group flex items-center gap-2 text-amber-600 font-black text-xs md:text-sm uppercase tracking-widest">
            View All Products 
            <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-amber-500" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8">
            {featuredProducts.map((product) => (
              <div key={product._id} className="group bg-white rounded-[2rem] p-4 border border-slate-100 transition-all hover:shadow-2xl hover:shadow-slate-200">
                <div className="aspect-square bg-slate-50 rounded-[1.5rem] overflow-hidden relative mb-4 flex items-center justify-center p-6">
                  {product.images?.[0] ? (
                    <img 
                      src={getOptimizedUrl(product.images[0])} 
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" 
                      alt={product.name}
                    />
                  ) : (
                    <ImageIcon className="text-slate-200" size={48} />
                  )}
                  
                  {product.hasVariants ? (
                    <Link 
                      to={`/product/${product._id}`}
                      className="absolute bottom-4 left-4 right-4 bg-amber-500 text-white py-3 rounded-xl font-bold text-[10px] flex items-center justify-center gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all active:scale-95 shadow-lg"
                    >
                      <LayoutGrid size={14} /> SELECT OPTIONS
                    </Link>
                  ) : (
                    <button 
                      onClick={() => addToCart(product)}
                      className="absolute bottom-4 left-4 right-4 bg-slate-900 text-white py-3 rounded-xl font-bold text-[10px] flex items-center justify-center gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all active:scale-95 shadow-lg"
                    >
                      <ShoppingCart size={14} /> ADD TO CART
                    </button>
                  )}
                </div>

                <div className="px-2">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mb-1">
                    {product.category?.name || "Stationery"}
                  </p>
                  <Link to={`/product/${product._id}`}>
                    <h3 className="font-bold text-slate-800 line-clamp-1 group-hover:text-amber-500 transition-colors mb-2">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-slate-900">₹{product.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!loading && featuredProducts.length === 0 && (
          <p className="text-center text-slate-400 py-10 font-bold">No featured products at the moment.</p>
        )}
      </section>

      {/* 4. CUSTOM REQUEST SECTION */}
      <section className="bg-slate-900 rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-20 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl">
        <div className="max-w-xl text-center md:text-left space-y-4">
          <div className="flex items-center justify-center md:justify-start gap-2 text-amber-500">
             <Globe size={20} />
             <span className="font-black uppercase tracking-widest text-xs">Service Expansion</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight">
            Outside our <br /><span className="text-amber-500">Standard Range?</span>
          </h2>
          <p className="text-slate-400 font-medium leading-relaxed">
            We primarily serve a 15km radius from Sholinganallur. However, for <em>bulk orders, office setups, or specific long-distance requests</em>, please let us know. We will do our maximum to accommodate your needs.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Link to="/contact" className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-center hover:bg-amber-500 hover:text-white transition-all shadow-xl">
            Make A Request
          </Link>
          <Link to="/about" className="border-2 border-white/10 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-center hover:bg-white/5 transition-all">
            Delivery Areas
          </Link>
        </div>
      </section>

    </main>
  );
};

export default HomePage;