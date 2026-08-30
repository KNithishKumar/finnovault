import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PlusCircle, Trash2, ArrowUpRight, ArrowDownRight, Upload, Coins } from 'lucide-react';
import { assetsAPI } from '../services/api';

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [type, setType] = useState('House');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [imageFiles, setImageFiles] = useState([]);

  const fetchAssets = async () => {
    try {
      const res = await assetsAPI.getAssets();
      if (res.data.success) {
        setAssets(res.data.assets);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this asset record?')) return;
    try {
      const res = await assetsAPI.deleteAsset(id);
      if (res.data.success) {
        toast.success('Asset record removed');
        fetchAssets();
      }
    } catch (err) {
      toast.error('Error removing asset');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name || !purchasePrice || !currentPrice) {
      return toast.error('Please fill in required fields');
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('type', type);
      formData.append('purchasePrice', Number(purchasePrice));
      formData.append('currentPrice', Number(currentPrice));
      formData.append('purchaseDate', purchaseDate);
      formData.append('description', description);
      
      for (let i = 0; i < imageFiles.length; i++) {
        formData.append('images', imageFiles[i]);
      }

      const res = await assetsAPI.createAsset(formData);
      if (res.data.success) {
        toast.success('Asset record logged');
        setName('');
        setPurchasePrice('');
        setCurrentPrice('');
        setDescription('');
        setImageFiles([]);
        setShowAddForm(false);
        fetchAssets();
      }
    } catch (err) {
      toast.error('Error logging asset');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Physical Asset Ledger</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track properties, vehicles, metals, and tangible wealth holdings.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-soft"
        >
          <PlusCircle className="w-4 h-4" />
          Log Asset
        </button>
      </div>

      {/* Add Asset Form */}
      {showAddForm && (
        <div className="glass-card rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-900 shadow-soft animate-fadeIn max-w-xl ">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4">Log Physical Asset</h3>
          <form onSubmit={handleCreate} className="space-y-4" encType="multipart/form-data">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 text-blue-950 dark:text-[#eff6ff]">Asset Name</label>
                <input
                  type="text"
                  placeholder="e.g. Tesla Model 3, Gold 24k"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-800 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 text-blue-950 dark:text-[#eff6ff]">Asset Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-800 dark:text-white"
                >
                  <option value="House">House</option>
                  <option value="Car">Car</option>
                  <option value="Bike">Bike</option>
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Land">Land</option>
                  <option value="Crypto">Crypto Asset</option>
                  <option value="Stocks">Stock Portfolio</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Cash">Physical Cash</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 text-blue-950 dark:text-[#eff6ff]">Purchase Price (₹)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-800 dark:text-white font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 text-blue-950 dark:text-[#eff6ff]">Current Val Price (₹)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-800 dark:text-white font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 text-blue-950 dark:text-[#eff6ff]">Purchase Date</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-800 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 text-blue-950 dark:text-[#eff6ff]">Photos / Images</label>
                <label className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-850 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-350 transition">
                  <Upload className="w-4 h-4" />
                  Attach Photos
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setImageFiles(e.target.files)}
                    className="hidden"
                  />
                </label>
                {imageFiles.length > 0 && (
                  <span className="text-[10px] text-slate-400 mt-1 block">{imageFiles.length} images selected</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 text-blue-950 dark:text-[#eff6ff]">Notes / Description</label>
              <input
                type="text"
                placeholder="Details of purchase or status"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-800 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-350 px-3.5 py-2 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-soft"
              >
                Log Asset
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.length === 0 ? (
          <p className="text-sm text-slate-400">No assets logged yet.</p>
        ) : (
          assets.map((ast) => {
            const profit = ast.currentPrice - ast.purchasePrice;
            const isProfit = profit >= 0;
            const pct = ast.purchasePrice > 0 ? (profit / ast.purchasePrice) * 100 : 0;

            return (
              <div
                key={ast._id}
                className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-900 shadow-soft flex flex-col justify-between h-56"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">{ast.type}</span>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[150px]">
                        {ast.name}
                      </h4>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(ast._id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Body Valuation Prices */}
                <div className="grid grid-cols-2 gap-4 border-y border-slate-100 dark:border-slate-900/50 py-3 my-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Purchase Value</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">₹{ast.purchasePrice.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Current Value</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">₹{ast.currentPrice.toLocaleString()}</span>
                  </div>
                </div>

                {/* Profit Loss Indicator */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Profit / Loss</span>
                  <div className={`flex items-center gap-1 text-xs font-bold ₹{isProfit ? 'text-accent' : 'text-red-500'}`}>
                    {isProfit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    <span>₹{Math.abs(profit).toLocaleString()} ({pct.toFixed(1)}%)</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Assets;
