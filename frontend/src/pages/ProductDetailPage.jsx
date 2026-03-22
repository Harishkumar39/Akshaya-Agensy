import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, ChevronRight } from "lucide-react";
import { useCart } from "../context/CartContext";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  
  // Carousel States
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/products/${id}`);
        setProduct(data);
        if (data.variants?.length) setSelectedVariant(data.variants[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0,0)
  }, [id]);

  const getOptimizedUrl = (url) => {
    if (!url) return "/placeholder.png";
    if (typeof url !== "string") return "/placeholder.png";
    if (!url.includes("cloudinary.com")) return url;
    return url.replace("/upload/", "/upload/f_auto,q_auto,w_800/");
  };

  const handleQtyChange = (variantName, value) => {
    setQuantities(prev => ({
      ...prev,
      [variantName]: Math.max(0, value)
    }));
  };

  const handleBulkAdd = () => {
    const itemsToAdd = product.variants.filter(v => quantities[v.name] > 0);
    if (itemsToAdd.length === 0) {
      alert("Please select quantity for at least one item.");
      return;
    }
    itemsToAdd.forEach(variant => {
      addToCart(product, variant, quantities[variant.name]);
    });
    setQuantities({});
  };

  // Helper to get current display image
  const displayImage = previewImage || (product?.images && product.images[activeImageIndex]) || product?.imageUrl;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500"></div>
    </div>
  );

  if (!product) return <div className="text-center py-20 font-bold">Product not found.</div>;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[1600px] mx-auto px-4 md:px-12 py-6 md:py-10">
        
        <nav className="flex items-center gap-2 text-[10px] md:text-xs capitalize tracking-[0.2em] font-black text-slate-400 mb-8 md:mb-12">
          <Link to="/" className="hover:text-amber-500 transition-colors">Home</Link>
          <span className="text-slate-200">/</span>
          <Link to="/products" className="hover:text-amber-500 transition-colors">Products</Link>
          <span className="text-slate-200">/</span>
          <Link to={`/category/${product.category?.slug}`} className="hover:text-amber-500 transition-colors">
            {product.category?.name || "Category"}
          </Link>
          <span className="text-slate-200">/</span>
          <span className="text-slate-900 truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24 items-start">
          
          {/* LEFT SECTION: CAROUSEL */}
          <div className="w-full lg:sticky lg:top-24 space-y-6">
            <div className="bg-slate-50 rounded-[3rem] md:rounded-[4rem] overflow-hidden border border-slate-100 p-8 md:p-20 flex items-center justify-center relative group">
              <img 
                src={getOptimizedUrl(displayImage)} 
                alt={product.name} 
                className="w-full h-auto max-h-[600px] aspect-square object-contain mix-blend-multiply transition-all duration-700 hover:scale-110"
              />
            </div>

            {/* THUMBNAILS */}
            {product.images?.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide touch-pan-xr">
                {product.images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => { setActiveImageIndex(idx); setPreviewImage(null); }}
                    className={`flex-shrink-0 w-20 h-20 rounded-2xl border-2 transition-all ${activeImageIndex === idx && !previewImage ? 'border-amber-500 scale-95' : 'border-slate-100'}`}
                  >
                    <img 
                    src={getOptimizedUrl(img)} 
                    key={displayImage}
                    className="w-full h-auto object-contain mix-blend-multiply transition-opacity duration-500 animate-in fade-in" alt="Images" />
                  </button>
                ))}
              </div>
            )}
            
            <div className="hidden md:flex justify-around mt-10 px-4">
               <div className="flex items-center gap-3">
                 <Truck size={20} className="text-amber-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fast Delivery</span>
               </div>
               <div className="flex items-center gap-3">
                 <ShieldCheck size={20} className="text-amber-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Quality</span>
               </div>
            </div>
          </div>

          {/* RIGHT SECTION: DETAILS */}
          <div className="flex flex-col pt-2">
            <div className="mb-8">
              <span className="text-amber-500 font-black text-[10px] uppercase tracking-[0.3em] mb-4 block">
                {product.category?.name}
              </span>
              <h1 className="text-3xl md:text-4xl xl:text-5xl font-black text-slate-900 tracking-tighter mb-6 leading-[1.1]">
                {product.name}
              </h1>
              
              <div className="flex items-baseline gap-4">
                <p className="text-4xl md:text-5xl font-black text-slate-900">
                  From ₹{selectedVariant?.price || product.price}
                </p>
              </div>
            </div>

            {product.variants?.length > 0 && (
              <div className="mb-10 bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-100">
                <div className="overflow-x-auto w-full">
                  <table className="min-w-[500px] md:min-w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type / Size</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {product.variants.map((variant) => (
                        <tr 
                          key={variant._id} 
                          onMouseEnter={() => variant.imageUrl && setPreviewImage(variant.imageUrl)}
                          onMouseLeave={() => setPreviewImage(null)}
                          className="hover:bg-slate-50/30 transition-colors group"
                        >
                          <td className="px-8 py-6 font-black text-slate-800 text-sm group-hover:text-amber-600 transition-colors">
                            {variant.name}
                          </td>
                          <td className="px-8 py-6 font-black text-slate-900 text-lg">
                            ₹{variant.price}
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center justify-center gap-4 bg-slate-50 p-2 rounded-2xl w-fit mx-auto">
                              <button onClick={() => handleQtyChange(variant.name, (quantities[variant.name] || 0) - 1)} className="w-8 h-8 rounded-xl bg-white flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all font-black shadow-sm">-</button>
                              <input type="number" value={quantities[variant.name] || 0} onChange={(e) => handleQtyChange(variant.name, parseInt(e.target.value) || 0)} className="w-8 text-center font-black text-sm bg-transparent outline-none" />
                              <button onClick={() => handleQtyChange(variant.name, (quantities[variant.name] || 0) + 1)} className="w-8 h-8 rounded-xl bg-white flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all font-black shadow-sm">+</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="space-y-8 mb-12">
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Product Overview</h3>
                <p className="text-slate-600 leading-relaxed text-sm md:text-lg font-medium">{product.description}</p>
              </div>

              <button
                onClick={() => product.variants?.length > 0 ? handleBulkAdd() : addToCart(product, null, 1)}
                className="w-full bg-slate-900 hover:bg-amber-500 text-white py-6 rounded-[2rem] font-black text-sm tracking-[0.2em] transition-all shadow-2xl shadow-slate-200 active:scale-[0.98] flex items-center justify-center gap-4 group"
              >
                <ShoppingCart size={20} className="group-hover:rotate-12 transition-transform" />
                ADD SELECTIONS TO CART
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;