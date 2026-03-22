import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom"; // Use Link, not Navigate

const CategoryGrid = () => {

  const getOptimizedUrl = (url) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    return url.replace("/upload/", "/upload/f_auto,q_auto/");
  };

  return (
    <section className="mb-20 px-2 md:px-12">
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-[600px]">
        
        {/* LARGE FEATURE BOX - General Stationeries */}
        <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-2xl bg-[#0a2533] text-white p-10 flex flex-col justify-end">
          <img 
            src={getOptimizedUrl("https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2?q=80&w=800")} 
            alt="General Stationeries" 
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-6 max-w-[200px]">General Stationeries</h2>
            <Link to="/category/general-stationeries">
              <button className="flex items-center gap-2 border-2 border-white rounded-full px-6 py-2 hover:bg-white hover:text-black transition-all">
                Shop Now <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        </div>

        {/* VERTICAL BOX - Accounts Registers */}
        <div className="md:col-span-1 md:row-span-2 relative group overflow-hidden rounded-2xl bg-[#8da9b6] p-8 flex flex-col">
          <img 
            src={getOptimizedUrl("https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=800")} 
            alt="Notebooks" 
            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="relative z-10 text-white">
            <p className="text-sm font-medium opacity-90">All Page Types</p>
            <h2 className="text-3xl font-bold mb-6">Oswal Accounts Registers</h2>
            <Link to="/category/oswal-accounts-register">
              <button className="flex items-center gap-2 border-2 border-white rounded-full px-5 py-2 hover:bg-white hover:text-black transition-all">
                Shop Now <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        </div>

        {/* TOP RIGHT - Copier Papers */}
        <div className="md:col-span-1 md:row-span-1 relative group overflow-hidden rounded-2xl bg-[#c5b4d1] p-6 flex flex-col justify-center">
          <img 
            src = {getOptimizedUrl("https://res.cloudinary.com/dkce5bqen/image/upload/v1773760225/71kmALRtskL_pic9ry.jpg")}
            alt = "Copier Papers" 
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="relative z-10 text-white">
            <p className="text-xs font-medium opacity-90">Office / Home</p>
            <h2 className="text-2xl font-bold mb-4">Copier Papers</h2>
            <Link to="/category/copier-papers">
              <button className="flex items-center gap-2 border-2 border-white rounded-full px-4 py-1.5 text-sm hover:bg-white hover:text-black transition-all w-fit">
                Shop Now <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </div>

        {/* BOTTOM RIGHT - Tape */}
        <div className="md:col-span-1 md:row-span-1 relative group overflow-hidden rounded-2xl bg-[#eeb0c3] p-6 flex flex-col justify-center">
          <img 
            src = {getOptimizedUrl("https://res.cloudinary.com/dkce5bqen/image/upload/v1773945664/black-chalk-board-446_f4gaj7.jpg")}
            alt = "Copier Papers" 
            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="relative z-10 text-white">
            <p className="text-xs font-medium opacity-90">Boards</p>
            <h2 className="text-2xl font-bold mb-4">White & Black Boards</h2>
            <Link to="/category/white-&-black-board">
              <button className="flex items-center gap-2 border-2 border-white rounded-full px-4 py-1.5 text-sm hover:bg-white hover:text-black transition-all w-fit">
                Shop Now <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};

export default CategoryGrid;