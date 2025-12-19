
import React, { useState } from 'react';
import { Package, AlertCircle, ShoppingCart, Search, Plus, Filter, ArrowDownToLine, TrendingUp } from 'lucide-react';

const InventoryManager: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  
  const stockItems = [
    { id: '1', name: 'Amoxicillin 500mg', category: 'Medicine', stock: 15, threshold: 20, price: 120.00, lastRefill: '2024-03-10' },
    { id: '2', name: 'Disposable Syringes (Box 100)', category: 'Supplies', stock: 142, threshold: 50, price: 250.00, lastRefill: '2024-02-15' },
    { id: '3', name: 'Ibuprofen 400mg', category: 'Medicine', stock: 8, threshold: 15, price: 85.00, lastRefill: '2024-03-12' },
    { id: '4', name: 'Surgical Masks (Box 50)', category: 'Supplies', stock: 24, threshold: 30, price: 150.00, lastRefill: '2024-01-20' },
    { id: '5', name: 'Lidocaine 2%', category: 'Injectables', stock: 45, threshold: 20, price: 340.00, lastRefill: '2024-03-05' },
  ];

  const filteredItems = activeCategory === 'All' 
    ? stockItems 
    : stockItems.filter(i => i.category === activeCategory);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black dark:text-white tracking-tight">Pharmacy Hub</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time inventory tracking, clinical supply chain, and procurement.</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-2xl hover:bg-gray-200 transition-all font-bold">
            <ArrowDownToLine size={18} />
            <span>Export Inventory</span>
          </button>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 font-bold active:scale-95">
            <Plus size={18} />
            <span>New Batch Entry</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-2xl"><AlertCircle size={20} /></div>
            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Action Needed</span>
          </div>
          <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Stock Alerts</div>
          <div className="text-3xl font-black dark:text-white">03 Items</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl"><TrendingUp size={20} /></div>
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Asset Value</span>
          </div>
          <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Total Valuation</div>
          <div className="text-3xl font-black dark:text-white">42,500 <span className="text-sm font-bold text-gray-400">EGP</span></div>
        </div>
        <div className="md:col-span-2 bg-blue-600 p-8 rounded-[2.5rem] text-white flex items-center justify-between shadow-xl shadow-blue-100">
          <div>
            <h3 className="text-xl font-black">Procurement Request</h3>
            <p className="text-blue-100 text-sm mt-1">Initialize supply order with verified vendors.</p>
          </div>
          <button className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-black text-sm hover:bg-blue-50 transition-all">
            Order Supplies
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            {['All', 'Medicine', 'Supplies', 'Injectables'].map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                  activeCategory === cat 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'bg-gray-50 dark:bg-slate-900 text-gray-400 hover:text-blue-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by batch or SKU..." 
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-medium dark:text-white"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-900 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-5">Product Definition</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Inventory Depth</th>
                <th className="px-8 py-5">Price (EGP)</th>
                <th className="px-8 py-5">Logistics Status</th>
                <th className="px-8 py-5 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filteredItems.map((item) => {
                const isLow = item.stock < item.threshold;
                const stockPercent = Math.min((item.stock / (item.threshold * 2)) * 100, 100);
                
                return (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="text-sm font-black dark:text-white group-hover:text-blue-600 transition-colors">{item.name}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Refill: {item.lastRefill}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black text-gray-500 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-gray-200 dark:border-slate-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-24 h-2 bg-gray-100 dark:bg-slate-900 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${isLow ? 'bg-red-500' : 'bg-emerald-500'}`}
                            style={{ width: `${stockPercent}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold ${isLow ? 'text-red-600' : 'text-gray-400'}`}>{item.stock} Units</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-black dark:text-gray-300">{item.price.toFixed(2)}</td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
                        isLow ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}>
                        {isLow ? 'Critical Refill' : 'Optimal'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline px-4 py-2 bg-blue-50 rounded-xl">Manage Batch</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryManager;
