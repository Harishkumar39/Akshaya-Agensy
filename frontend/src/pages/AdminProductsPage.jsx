import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Added for breadcrumbs
import { Plus, Pencil, Trash2, Image as ImageIcon, X, Upload, Loader2, Search, Filter, ChevronRight, Home } from "lucide-react";

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const initialFormState = {
    name: "", description: "", price: "", category: "", 
    images: [], stock: "", hasVariants: false, variants: []
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editId = params.get("edit");

    if (editId) {
      const fetchSingleProduct = async () => {
        try {
          const { data } = await axios.get(`${API_URL}/api/products/${editId}`);
          setEditingProduct(data);
          setFormData(data);
          setIsModalOpen(true);
        } catch (err) {
          console.error("Failed to fetch product for editing", err);
        }
      };
      fetchSingleProduct();
    }
  }, [location.search]);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData(initialFormState);
    navigate("/admin/products", { replace: true }); // Clears the ?edit=... from URL
  };

  const getOptimizedUrl = (url) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    return url.replace("/upload/", "/upload/f_auto,q_auto/");
  };

  const fetchProducts = async () => {
    if (!selectedCategory) {
      setProducts([]);
      return; 
    }
    try {
      let url = `${API_URL}/api/products?limit=500`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`;
      const { data } = await axios.get(url);
      setProducts(data.products || []);
    } catch (err) { console.error("Fetch failed", err); }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/categories`);
      setCategories(data || []);
    } catch (err) { console.error("Categories failed", err); }
  };

  const handleDeleteProduct = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await axios.delete(`${API_URL}/api/admin/products/${id}`);
        fetchProducts();
      } catch (err) { alert("Delete failed."); }
    }
  };

  const handleFileUpload = async (e, variantIndex = null) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    const uploadData = new FormData();
    files.forEach(file => uploadData.append("images", file));
    try {
      const { data } = await axios.post(`${API_URL}/api/admin/upload`, uploadData);
      if (variantIndex !== null) {
        const newVariants = [...formData.variants];
        newVariants[variantIndex].imageUrl = data.urls[0];
        setFormData({ ...formData, variants: newVariants });
      } else {
        setFormData(prev => ({ ...prev, images: [...prev.images, ...data.urls] }));
      }
    } catch (err) { alert("Upload failed"); } finally { setUploading(false); }
  };

  const addVariant = () => {
    setFormData({ ...formData, variants: [...formData.variants, { name: "", price: "", stock: "", imageUrl: null }] });
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index][field] = value;
    setFormData({ ...formData, variants: newVariants });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Sanitize variant numbers before sending
      const sanitizedVariants = formData.variants.map(v => ({
        ...v,
        price: v.price ? Number(v.price) : 0,
        stock: v.stock ? Number(v.stock) : 0
      }));
  
      const finalData = {
        ...formData,
        variants: sanitizedVariants, // Use the sanitized array
        hasVariants: sanitizedVariants.length > 0,
        price: Number(formData.price),
        stock: Number(formData.stock)
      };
  
      const url = editingProduct 
        ? `${API_URL}/api/admin/products/${editingProduct._id}` 
        : `${API_URL}/api/admin/products`;
  
      await axios[editingProduct ? "put" : "post"](url, finalData);
  
      closeModal(); 
      fetchProducts();
    } catch (err) { 
      console.error("Save error:", err.response?.data || err.message);
      alert("Error saving product."); 
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* --- BREADCRUMBS (Visible below 1124px) --- */}
      <nav className="flex xl:hidden items-center gap-2 text-sm font-bold text-slate-500 mb-2">
        <Link to="/admin" className="hover:text-amber-500 transition-colors flex items-center gap-1">
          <Home size={16} />
        </Link>
        <ChevronRight size={14} className="text-slate-300" />
        <span className="text-slate-900 bg-amber-100 px-2 py-1 rounded-md">Inventory</span>
      </nav>

      {/* Header Section (Hidden at 1123px and below) */}
      <div className="hidden min-[1124px]:flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Inventory Management</h1>
          <p className="text-slate-500 font-medium text-sm md:text-base">Managing stock for Akshaya Agensy</p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setFormData(initialFormState); setIsModalOpen(true); }}
          className="w-full md:w-auto bg-slate-900 text-amber-400 px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95"
        >
          <Plus size={20} strokeWidth={3} /> New Product
        </button>
      </div>

      {/* Filters & Mobile Add Button */}
      <div className="space-y-4">
        {/* Mobile New Product Button (Visible below 1124px) */}
        <button 
          onClick={() => { setEditingProduct(null); setFormData(initialFormState); setIsModalOpen(true); }}
          className="min-[1124px]:hidden w-full bg-slate-900 text-amber-400 py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg"
        >
          <Plus size={20} strokeWidth={3} /> New Product
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Search products..."
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[1.2rem] md:rounded-[1.5rem] outline-none focus:border-amber-500 transition-all shadow-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="md:col-span-4 relative">
            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
            <select 
              className="w-full pl-14 pr-12 py-4 bg-white border border-slate-200 rounded-[1.2rem] md:rounded-[1.5rem] outline-none appearance-none font-bold text-slate-700 shadow-sm truncate"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c._id} value={c.slug}>{c.name}</option>)}
            </select>
            <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 rotate-90 pointer-events-none" size={18} />
          </div>
        </div>
      </div>

      {/* Main View */}
      <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        {products.length === 0 ? (
          <div className="p-12 md:p-24 text-center space-y-4">
            <Search size={48} className="mx-auto text-slate-200" />
            <p className="text-slate-800 font-black text-xl">No products found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table (Only visible above 1123px) */}
            <div className="hidden min-[1124px]:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr className="text-slate-400 text-[11px] uppercase font-black tracking-[0.15em]">
                    <th className="p-8">Product Details</th>
                    <th className="p-8">Category</th>
                    <th className="p-8">Base Price</th>
                    <th className="p-8">Stock Status</th>
                    <th className="p-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {products.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-8 flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                          {p.images?.[0] ? <img src={getOptimizedUrl(p.images[0])} className="w-full h-full object-cover" alt="" /> : <ImageIcon className="m-auto mt-5 text-slate-300" />}
                        </div>
                        <div>
                          <div className="font-black text-slate-800 text-lg leading-tight">{p.name}</div>
                          <div className="text-sm text-slate-400 mt-1 line-clamp-1">{p.description}</div>
                        </div>
                      </td>
                      <td className="p-8">
                        <span className="px-4 py-1.5 bg-slate-100 rounded-full text-[11px] font-black text-slate-500 uppercase tracking-wider">
                          {categories.find(c => String(c._id) === String(p.category))?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="p-8 font-black text-slate-900 text-lg">₹{p.price}</td>
                      <td className="p-8">
                        <div className={`text-sm font-black ${p.stock < 10 ? 'text-red-500' : 'text-green-600'}`}>{p.stock} Units Left</div>
                      </td>
                      <td className="p-8 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setEditingProduct(p); setFormData(p); setIsModalOpen(true); }} className="p-3 hover:bg-amber-100 text-amber-600 rounded-xl transition-all"><Pencil size={18}/></button>
                          <button onClick={() => handleDeleteProduct(p._id, p.name)} className="p-3 hover:bg-red-100 text-red-500 rounded-xl transition-all"><Trash2 size={18}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Responsive Card View (Visible at 1123px and below) */}
            <div className="min-[1124px]:hidden divide-y divide-slate-100">
              {products.map((p) => (
                <div key={p._id} className="p-6 space-y-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                      {p.images?.[0] ? <img src={getOptimizedUrl(p.images[0])} className="w-full h-full object-cover" alt="" /> : <ImageIcon className="m-auto mt-7 text-slate-300" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-slate-800 text-base truncate">{p.name}</div>
                      <div className="text-xs text-slate-500 line-clamp-2 mt-1">{p.description}</div>
                      <div className="mt-2 font-black text-slate-900">₹{p.price}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                    <div className={`text-xs font-black uppercase ${p.stock < 10 ? 'text-red-500' : 'text-green-600'}`}>{p.stock} In Stock</div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingProduct(p); setFormData(p); setIsModalOpen(true); }} className="p-2 bg-white text-amber-600 rounded-lg border border-slate-200"><Pencil size={16}/></button>
                      <button onClick={() => handleDeleteProduct(p._id, p.name)} className="p-2 bg-white text-red-500 rounded-lg border border-slate-200"><Trash2 size={16}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Slide-over Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full md:max-w-2xl bg-white h-full shadow-2xl p-6 md:p-10 overflow-y-auto animate-in slide-in-from-right duration-300 md:rounded-l-[3rem]">
            <div className="flex justify-between items-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-black text-slate-900">{editingProduct ? "Update Item" : "New Product"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-100 text-slate-400 rounded-full hover:text-red-500 transition-all"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 pb-10">
              <section className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Gallery</label>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  <label className="w-24 h-24 flex-shrink-0 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-amber-400">
                    {uploading ? <Loader2 className="animate-spin text-amber-500" /> : <Upload className="text-slate-300" />}
                    <input type="file" multiple className="hidden" onChange={(e) => handleFileUpload(e)} />
                  </label>
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="w-24 h-24 flex-shrink-0 relative rounded-2xl overflow-hidden border border-slate-100">
                      <img src={getOptimizedUrl(img)} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setFormData({...formData, images: formData.images.filter((_, i) => i !== idx)})} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"><X size={10} strokeWidth={4}/></button>
                    </div>
                  ))}
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Product Name</label>
                  <input type="text" className="w-full p-4 bg-slate-50 rounded-xl outline-none font-bold" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Description</label>
                  <textarea className="w-full p-4 bg-slate-50 rounded-xl outline-none" rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Category</label>
                  <select className="w-full p-4 bg-slate-50 rounded-xl outline-none font-bold" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required>
                    <option value="">Select</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Price (₹)</label>
                  <input type="number" className="w-full p-4 bg-slate-50 rounded-xl outline-none font-bold" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} required />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Stock Units</label>
                  <input type="number" className="w-full p-4 bg-slate-50 rounded-xl outline-none font-bold" value={formData.stock} onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})} required />
                </div>
              </div>

              {/* Variants */}
              <div className="pt-8 border-t border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-slate-900">Variants</h3>
                  <button type="button" onClick={addVariant} className="text-[10px] font-black bg-slate-900 text-white px-4 py-2 rounded-lg">+ Add</button>
                </div>
                <div className="space-y-4">
                  {formData.variants.map((v, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-2xl relative border border-slate-100">
                      <button type="button" onClick={() => setFormData({...formData, variants: formData.variants.filter((_, idx) => idx !== i)})} className="absolute top-2 right-2 text-red-400"><Trash2 size={16}/></button>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <label className="md:col-span-3 h-20 flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-xl bg-white overflow-hidden">
                          {v.imageUrl ? <img src={getOptimizedUrl(v.imageUrl)} className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-slate-200" />}
                          <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, i)} />
                        </label>
                        <div className="md:col-span-9 space-y-3">
                          <input placeholder="Name" className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" value={v.name} onChange={(e) => handleVariantChange(i, 'name', e.target.value)} />
                          <div className="flex gap-2">
                            <input placeholder="Price" className="w-1/2 p-2 bg-white border border-slate-200 rounded-lg text-sm" value={v.price} onChange={(e) => handleVariantChange(i, 'price', e.target.value)} />
                            <input placeholder="Stock" className="w-1/2 p-2 bg-white border border-slate-200 rounded-lg text-sm" value={v.stock} onChange={(e) => handleVariantChange(i, 'stock', e.target.value)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={uploading} 
                className="w-full py-5 bg-amber-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-amber-100 disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Save Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;