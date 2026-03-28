import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  LayoutGrid, ChevronDown, Filter, X, 
  ShoppingCart, Search, ArrowRight, Package 
} from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import axios from "axios";

const ProductListPage = () => {
  const { categorySlug } = useParams();
  const [priceRange, setPriceRange] = useState(1000);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("default");
  const { addToCart } = useCart();
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tempPrice, setTempPrice] = useState(priceRange);
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearch, setTempSearch] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/categories`);
        setCategories(data);
        window.scrollTo(0, 0);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [categorySlug, searchQuery]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(tempSearch);
    }, 500);
  
    return () => clearTimeout(delayDebounceFn);
  }, [tempSearch]);

  const getOptimizedUrl = (url) => {
    if (!url || typeof url !== "string") return "/placeholder.png"; 
    if (!url.includes("cloudinary.com")) return url;
    return url.replace("/upload/", "/upload/f_auto,q_auto,w_800/");
  };

  useEffect(() => {
    const fetchProducts = async () => {
      if (!categorySlug && !searchQuery) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (categorySlug) params.append("category", categorySlug);
        if (searchQuery) params.append("search", searchQuery);
        params.append("maxPrice", priceRange);
        params.append("sort", sortBy);
        params.append("page", page);
        params.append("limit", 12);
    
        const response = await fetch(`${API_URL}/api/products?${params.toString()}`);
        const data = await response.json();
    
        setProducts(Array.isArray(data.products) ? data.products : []);
        setTotalPages(data.totalPages || 1);

        window.scrollTo({ top: 0, behavior: 'smooth' });

      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categorySlug, priceRange, sortBy, page, searchQuery]);

  const mainCategories = categories.filter(cat => !cat.parent);
  const getSubCategories = (parentId) => categories.filter(cat => cat.parent === parentId);

  return (
    /* 1. Updated Container: Matches HomePage width and padding */
    <div className="w-full mx-auto px-4 md:px-12 py-6 md:py-10">
      
      {/* BREADCRUMBS */}
      <nav className="text-[10px] md:text-xs text-slate-400 mb-6 flex items-center gap-2 capitalize font-black tracking-[0.2em]">
        <Link to="/" className="hover:text-amber-500 transition-colors">Home</Link>
        <span className="opacity-30">/</span>
        <Link to="/products" className="hover:text-amber-500 transition-colors">Products</Link>
        
        {categorySlug && (() => {
          const currentCat = categories.find(c => c.slug === categorySlug);
          const parentCat = currentCat?.parent ? categories.find(c => c._id === currentCat.parent) : null;
          
          return (
            <>
              {parentCat && (
                <>
                  <span className="opacity-30">/</span>
                  <Link to={`/category/${parentCat.slug}`} className="hover:text-amber-500 transition-colors">{parentCat.name}</Link>
                </>
              )}
              <span className="opacity-30">/</span>
              <span className="text-slate-900">{currentCat?.name || categorySlug.replace(/-/g, ' ')}</span>
            </>
          );
        })()}
      </nav>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-24 items-start">
        
        {/* 2. SIDEBAR - Keeping it fixed width but adding better spacing */}
        <div 
          className={`fixed inset-0 bg-black/50 z-[90] md:hidden transition-opacity duration-300 ${isMobileFilterOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} 
          onClick={() => setIsMobileFilterOpen(false)} 
        />

        <aside 
          className={`
            fixed inset-y-0 left-0 z-[100] w-64 bg-white transition-transform duration-300
            md:relative md:inset-auto md:z-0 md:translate-x-0 md:w-56 lg:w-64 md:flex-shrink-0
            ${isMobileFilterOpen ? "translate-x-0" : "-translate-x-full"}
            h-[100dvh] md:h-auto overflow-y-auto
          `}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
            <div className="md:sticky md:top-24">
               {/* Categories & Price Range Logic */}
               <h2 className="font-black text-[12px] uppercase tracking-[0.2rem] mb-4 pl-2 text-slate-400">Categories</h2>
               <ul className="space-y-1 mb-10 px-1">
                <li>
                  <Link 
                    to="/products"
                    onClick={() => {setIsMobileFilterOpen(false); setTempSearch("");}}
                    className={`text-xs block py-3.5 px-5 rounded-2xl transition-all font-black uppercase tracking-widest ${!categorySlug ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    All Products
                  </Link>
                </li>

                {mainCategories.map((cat) => {
                  const subs = getSubCategories(cat._id);
                  const hasSubs = subs.length > 0;
                  const isActive = categorySlug === cat.slug || subs.some(s => s.slug === categorySlug);

                  return (
                    <li key={cat._id} className="group">
                        <Link 
                          to={`/category/${cat.slug}`}
                          onClick={() => setIsMobileFilterOpen(false)}
                          className={`flex-1 text-[11px] block py-3.5 px-5 rounded-2xl transition-all font-black uppercase tracking-widest ${categorySlug === cat.slug ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          {cat.name}
                        </Link>

                      {/* Sub-category list (Only shows if it has children and the parent or a child is active) */}
                      {hasSubs && isActive && (
                        <div className="ml-3 mt-1 flex flex-col gap-0.5 border-l border-slate-100 pl-3 py-1">
                          {subs.map((sub) => (
                            <Link
                              key={sub._id}
                              to={`/category/${sub.slug}`}
                              onClick={() => setIsMobileFilterOpen(false)}
                              className={`text-[9px] py-2 px-2 rounded-lg font-bold transition-colors ${categorySlug === sub.slug ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:text-slate-900'}`}
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
              {/* Price Range Slider */}
              <div className="px-2 pb-10">
                <h2 className="font-black text-[10px] uppercase tracking-[0.2em] mb-6 pl-2 text-slate-400">Price Range</h2>
                <div className="px-2">
                   <input 
                    type="range" min="20" max="5000" value={tempPrice} 
                    onChange={(e) => setTempPrice(e.target.value)} 
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500" 
                  />
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm font-black text-slate-900">₹{tempPrice}</span>
                    <button 
                      onClick={()=> {setPriceRange(tempPrice); setIsMobileFilterOpen(false);}} 
                      className="text-[10px] font-black bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-amber-500 transition uppercase tracking-widest"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
         
        </aside>

        {/* 3. MAIN AREA */}
        <main className="flex-1 min-w-0">
          {/* Top Bar - Clean and Wide */}
          <div className="flex flex-col xl:flex-row gap-4 mb-10">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={20} />
              <input
                type="text"
                value={tempSearch}
                onChange={(e) => setTempSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setSearchQuery(tempSearch)}
                placeholder="Search products..."
                className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-100 rounded-[1.5rem] focus:border-amber-500 outline-none transition-all font-bold text-sm shadow-sm"
              />
            </div>
            
            <div className="flex gap-3">
              <div className="relative flex-1 md:w-72">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none bg-white border-2 border-slate-100 px-6 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest outline-none focus:border-amber-500 transition-all cursor-pointer shadow-sm"
                >
                  <option value="default">Sort: Recommended</option>
                  <option value="low-high">Price: Low to High</option>
                  <option value="high-low">Price: High to Low</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="name-asc">Name: A - Z</option>
                  <option value="name-desc">Name: Z - A</option>
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" size={18} />
              </div>

              <button 
                onClick={() => setIsMobileFilterOpen(true)} 
                className="md:hidden flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-[1.5rem] font-black text-sm active:scale-95 transition-transform"
              >
                <Filter size={18} />
              </button>
            </div>
          </div>

          {/* Product Grid - Fluid column counts for Wide Screens */}
          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6 md:gap-10">
             {[...Array(6)].map((_, n) => (
               <div key={n} className="bg-white rounded-[2.5rem] p-5 border border-slate-50 flex flex-col h-full animate-pulse">
                 <div className="aspect-square bg-slate-50 rounded-[2rem] mb-6 flex items-center justify-center">
                   <Package size={48} className="text-slate-100" />
                 </div>
                 
                 <div className="px-2 pb-2 mt-auto space-y-4">
                   <div className="h-5 bg-slate-50 rounded-full w-full" />
                   <div className="h-5 bg-slate-50 rounded-full w-2/3" />
                   
                   <div className="flex items-center justify-between pt-2">
                     <div className="h-6 bg-slate-100 rounded-lg w-24" />
                     <div className="h-5 bg-slate-50 rounded-full w-16" />
                   </div>
                 </div>
               </div>
             ))}
           </div>
          ) : !categorySlug && !searchQuery ? (
            <div className="py-4">
              <div className="mb-12 text-center md:text-left">
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4">Our Catalog</h1>
                <p className="text-slate-500 font-bold uppercase text-[11px] tracking-[0.3em]">Select a category to explore our professional range</p>
              </div>
              {/* Category selector grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {categories.map((cat) => (
                  <Link key={cat._id} to={`/category/${cat.slug}`} className="group relative overflow-hidden bg-white border border-slate-100 p-10 rounded-[3rem] hover:shadow-3xl hover:shadow-slate-200 transition-all duration-500">
                    <div className="flex justify-between items-center">
                      <div className="space-y-4">
                        <div className="w-14 h-14 bg-slate-50 rounded-[1.25rem] flex items-center justify-center text-slate-400 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500">
                          <Package size={28} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-amber-500 transition-colors leading-tight">{cat.name}</h3>
                      </div>
                      <div className="p-4 rounded-full bg-slate-50 text-slate-300 group-hover:bg-amber-50 group-hover:text-amber-500 transition-all">
                        <ArrowRight size={24} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : products.length > 0 ? (
            <div>
              {/* UPDATED: Added xl:grid-cols-4 for extra width */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6 md:gap-8">
                {products.map((product) => (
                   <Link key={product._id} to={`/product/${product._id}`} className="group">
                    <div className="bg-white rounded-[2.5rem] p-5 border border-slate-100 transition-all hover:shadow-2xl hover:shadow-slate-200 h-full flex flex-col">
                      <div className="aspect-square bg-slate-50 rounded-[2rem] overflow-hidden relative mb-6 flex items-center justify-center p-8">
                        <img 
                          src={getOptimizedUrl(Array.isArray(product.images) ? product.images[0] : product.images)} 
                          alt={product.name} 
                          className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" 
                        />
                        {product.hasVariants ? (
                          <div className="absolute bottom-3 left-3 right-3 md:bottom-5 md:left-5 md:right-5 bg-amber-500 text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] tracking-widest flex items-center justify-center gap-2 
                            opacity-100 translate-y-0 
                            md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all">
                            <LayoutGrid size={14} /> SELECT OPTIONS
                          </div>
                        ) : (
                          <button 
                            onClick={(e) => { e.preventDefault(); addToCart(product, null, 1); }}
                            className="absolute bottom-3 left-3 right-3 md:bottom-5 md:left-5 md:right-5 bg-slate-900 text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] tracking-widest flex items-center justify-center gap-2 
                              opacity-100 translate-y-0 
                              md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all active:scale-95"
                          >
                            <ShoppingCart size={14} /> ADD TO CART
                          </button>
                        )}
                      </div>
                      <div className="px-2 pb-2 mt-auto">
                        <h3 className="font-black text-slate-800 text-lg line-clamp-2 group-hover:text-amber-500 transition-colors mb-3 leading-tight">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-xl font-black text-slate-900">
                              From ₹{product.price}
                            </span>
                            {product.oldPrice && (
                              <span className="text-xs text-slate-300 line-through font-bold">₹{product.oldPrice}</span>
                            )}
                          </div>
                          {product.hasVariants && (
                            <span className="text-[9px] bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full font-black capitalize tracking-tighter">
                              {product.variants.length} Types
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              {/* Pagination remains centered */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-20 gap-3">
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => setPage(i + 1)} className={`w-12 h-12 rounded-2xl font-black text-sm transition-all ${page === i + 1 ? "bg-slate-900 text-white shadow-2xl shadow-slate-400" : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50"}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-32 bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
               <Search size={64} className="mx-auto text-slate-200 mb-6" />
               <h3 className="text-2xl font-black text-slate-900">No matches found</h3>
               <p className="text-slate-400 mt-2 font-bold uppercase text-xs tracking-widest">Try adjusting your filters or search terms.</p>
               <button onClick={() => {setSearchQuery(""); setPriceRange(5000);}} className="mt-8 bg-white border border-slate-200 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all shadow-sm">Reset All Filters</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductListPage;