import React from 'react';

const PolicyLayout = ({ title, lastUpdated, children }) => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-amber-400 p-8 text-white">
          <h1 className="text-3xl font-black">{title}</h1>
          {lastUpdated && (
            <p className="text-amber-900/70 mt-2 font-medium">Last Updated: {lastUpdated}</p>
          )}
        </div>
        <div className="p-8 md:p-12 prose prose-slate max-w-none text-slate-600 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PolicyLayout;