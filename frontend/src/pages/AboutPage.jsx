import React, { useEffect } from 'react';
import { BookOpen, Truck, MapPin, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  const stats = [
    { label: "Products", value: "300+" },
    { label: "Experience", value: "15+ Yrs" },
    { label: "Happy Clients", value: "5k+" },
    { label: "Delivery Radius", value: "15 KM" }, // Modified from Pan-India
  ];

  const deliverablePincodes = [
    "600119", "600097", "600100", "600130", 
    "600041", "600096", "600115", "603103", 
    "600020", "600042", "600113", "600091"
  ];

  useEffect(()=>{
    window.scrollTo(0,0)
  },[])

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-slate-900 text-white px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">
            Quality Stationery, <span className="text-amber-500">Locally Delivered.</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Akshaya Agensy has been a trusted name in physical ledgers and office supplies for over a decade. We now provide express fulfillment to our South Chennai community.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 -mt-10 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 text-center">
              <div className="text-3xl font-black text-slate-900">{stat.value}</div>
              <div className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Values & Delivery Info */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <div className="space-y-8">
            <h2 className="text-3xl font-black text-slate-900">Why Choose Akshaya Agensy?</h2>
            
            <div className="flex gap-6">
              <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl h-fit"><BookOpen size={24}/></div>
              <div>
                <h4 className="font-black text-slate-900 uppercase text-sm mb-1">Extensive Catalog</h4>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">From Keny folders to Kolor Nine pouches, we carry the full range of premium stationery brands.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl h-fit"><MapPin size={24}/></div>
              <div>
                <h4 className="font-black text-slate-900 uppercase text-sm mb-1">Our Service Area</h4>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-3">We deliver within a 15km radius of Sholinganallur. Covered Pincodes:</p>
                <div className="flex flex-wrap gap-2">
                  {deliverablePincodes.map(pin => (
                    <span key={pin} className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-black text-slate-600">
                      {pin}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl h-fit"><MessageCircle size={24}/></div>
              <div>
                <h4 className="font-black text-slate-900 uppercase text-sm mb-1">Custom Requests</h4>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Located outside our range? For bulk orders or special delivery requests, please <Link to="/contact" className="text-amber-600 underline font-bold">contact us</Link> and we will do our maximum to support you.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-100 rounded-[3rem] aspect-square overflow-hidden relative border-8 border-white shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                <Truck size={48} className="text-slate-300 mb-4" />
                <span className="text-slate-400 font-black text-xl italic uppercase tracking-tighter opacity-50">Local Delivery Hub Sholinganallur</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;