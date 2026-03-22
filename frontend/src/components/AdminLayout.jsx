import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Box, ShoppingCart, ArrowLeft, Home } from "lucide-react";

const AdminLayout = () => {
  const { pathname } = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Products", path: "/admin/products", icon: <Box size={20} /> },
    { name: "Orders", path: "/admin/orders", icon: <ShoppingCart size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-100">
      {/* --- DESKTOP SIDEBAR --- */}

      <aside className="w-64 bg-slate-900 text-white p-6 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="mb-10">
          <h2 className="text-xl font-black tracking-tighter text-amber-500">ADMIN PANEL</h2>
        </div>
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                pathname === item.path ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              {item.icon}
              <span className="font-bold text-sm uppercase tracking-widest">{item.name}</span>
            </Link>
          ))}
          <div className="pt-10">
            <Link to="/" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-white transition-colors">
              <ArrowLeft size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">Back to Store</span>
            </Link>
          </div>
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-10 pb-32 lg:pb-10"> {/* Added bottom padding for mobile nav */}
        <div className="max-w-7xl mx-auto bg-white rounded-[1.5rem] lg:rounded-[2rem] shadow-sm min-h-[80vh] p-4 md:p-8 border border-slate-200">
          <Outlet />
        </div>
      </main>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-[999] shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">

        <Link to="/admin" className="flex flex-col items-center gap-1 text-slate-400">
          <Home size={22} className={pathname === "/admin" ? "text-amber-500" : ""} />
          <span className="text-[10px] font-bold uppercase">Menu</span>
        </Link>

        {menuItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`flex flex-col items-center gap-1 transition-colors ${
              pathname === item.path ? "text-amber-500" : "text-slate-400"
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-bold uppercase">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default AdminLayout;