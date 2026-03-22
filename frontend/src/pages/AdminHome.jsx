// AdminHome.jsx
import { Link } from "react-router-dom";
import { LayoutDashboard, Box, ShoppingCart } from "lucide-react";

const AdminHome = () => {
  const cards = [
    { title: "Dashboard", desc: "View sales analytics", path: "/admin/dashboard", icon: <LayoutDashboard className="text-amber-500" size={32} />, bg: "bg-amber-50" },
    { title: "Inventory", desc: "Manage products", path: "/admin/products", icon: <Box className="text-blue-500" size={32} />, bg: "bg-blue-50" },
    { title: "Orders", desc: "Track customer orders", path: "/admin/orders", icon: <ShoppingCart className="text-green-500" size={32} />, bg: "bg-green-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Admin Hub</h1>
        <p className="text-slate-500">Welcome back. Select a module to continue.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link 
            key={card.path} 
            to={card.path}
            className="group p-8 rounded-[2rem] border border-slate-100 bg-white hover:border-amber-200 hover:shadow-xl hover:shadow-amber-500/5 transition-all"
          >
            <div className={`${card.bg} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              {card.icon}
            </div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{card.title}</h3>
            <p className="text-slate-400 text-sm mt-1 font-medium">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminHome;