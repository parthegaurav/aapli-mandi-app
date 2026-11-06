import { useState, useEffect } from 'react';
import {
  DollarSign,
  PlusCircle,
  ClipboardList,
  Save,
  CheckCircle,
  AlertCircle,
  Trash2,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Package,
  Truck,
  User,
  Store,
  RefreshCw,
  Search,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { t } from '../data/i18n.js';

export default function AdminView({ lang = 'mr', crops = [], onCropsUpdated, activeTab = 'rates', setActiveTab }) {
  const [activeSubTab, setActiveSubTab] = useState('rates'); // 'rates' | 'addProduct' | 'orders'

  // Sync external activeTab from BottomNav to internal subtabs
  useEffect(() => {
    if (activeTab === 'rates') {
      setActiveSubTab('rates');
    } else if (activeTab === 'products') {
      setActiveSubTab('addProduct');
    } else if (activeTab === 'farmerBookings') {
      setActiveSubTab('orders');
      setOrdersSubTab('farmers');
    } else if (activeTab === 'buyerOrders') {
      setActiveSubTab('orders');
      setOrdersSubTab('wholesalers');
    }
  }, [activeTab]);
  
  // Rate editor state
  const [rateEdits, setRateEdits] = useState({});
  const [saveStatus, setSaveStatus] = useState(null); // { type: 'success' | 'error', message: '' }
  const [isSavingRates, setIsSavingRates] = useState(false);
  const [ratesSearch, setRatesSearch] = useState('');
  const [ratesCategoryFilter, setRatesCategoryFilter] = useState('all');

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name_mr: '',
    name_en: '',
    category: 'भाजीपाला',
    emoji: '🥔',
    image_url: '',
    farmer_rate_per_kg: '',
    wholesaler_rate_per_crate: '',
    crate_weight_kg: 20,
    available_crates: 150,
    is_active: 1,
  });
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productFeedback, setProductFeedback] = useState(null);

  // Orders & Bookings Manager state
  const [ordersSubTab, setOrdersSubTab] = useState('farmers'); // 'farmers' | 'wholesalers'
  const [farmerBookings, setFarmerBookings] = useState([]);
  const [wholesalerOrders, setWholesalerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Stats state
  const [stats, setStats] = useState({
    activeProducts: 0,
    farmerBookingsCount: 0,
    pendingFarmerBookings: 0,
    wholesalerOrdersCount: 0,
    pendingWholesalerOrders: 0,
    totalFarmerPayout: 0,
    totalWholesalerRevenue: 0,
  });

  // Initialize rate inputs from crops
  useEffect(() => {
    const initialEdits = {};
    crops.forEach((crop) => {
      initialEdits[crop.id] = {
        farmer_rate_per_kg: crop.pricePerKg || crop.farmer_rate_per_kg || 0,
        wholesaler_rate_per_crate: crop.cratePrice || crop.wholesaler_rate_per_crate || 0,
      };
    });
    setRateEdits(initialEdits);
  }, [crops]);

  // Fetch stats & orders
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const fetchBookingsAndOrders = async () => {
    setLoadingOrders(true);
    try {
      const [farmersRes, wholesalersRes] = await Promise.all([
        fetch('/api/farmer-bookings'),
        fetch('/api/wholesaler-orders')
      ]);

      if (farmersRes.ok) {
        const data = await farmersRes.json();
        setFarmerBookings(data);
      }
      if (wholesalersRes.ok) {
        const data = await wholesalersRes.json();
        setWholesalerOrders(data);
      }
      fetchStats();
    } catch (err) {
      console.error('Failed to fetch bookings/orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchStats();
    if (activeSubTab === 'orders') {
      fetchBookingsAndOrders();
    }
  }, [activeSubTab]);

  // Rate Change Handlers
  const handleRateInputChange = (cropId, field, value) => {
    setRateEdits((prev) => ({
      ...prev,
      [cropId]: {
        ...prev[cropId],
        [field]: value,
      },
    }));
  };

  // Single Row Rate Save
  const handleSaveSingleCropRate = async (cropId) => {
    const edits = rateEdits[cropId];
    if (!edits) return;

    try {
      const res = await fetch(`/api/products/${cropId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmer_rate_per_kg: Number(edits.farmer_rate_per_kg),
          wholesaler_rate_per_crate: Number(edits.wholesaler_rate_per_crate),
        }),
      });

      if (!res.ok) throw new Error('Update failed');

      setSaveStatus({
        type: 'success',
        message: lang === 'mr'
          ? `दर अपडेट झाले: ₹${edits.farmer_rate_per_kg}/किलो आणि ₹${edits.wholesaler_rate_per_crate}/क्रेट`
          : `Saved: ₹${edits.farmer_rate_per_kg}/kg & ₹${edits.wholesaler_rate_per_crate}/crate`
      });

      if (onCropsUpdated) onCropsUpdated();
      fetchStats();

      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setSaveStatus({
        type: 'error',
        message: lang === 'mr' ? 'दर सेव्ह करताना त्रुटी आली' : 'Failed to save rates'
      });
    }
  };

  // Save All Rates Bulk
  const handleSaveAllRates = async () => {
    setIsSavingRates(true);
    try {
      const updates = Object.entries(rateEdits).map(([id, edit]) => ({
        id,
        farmer_rate_per_kg: Number(edit.farmer_rate_per_kg),
        wholesaler_rate_per_crate: Number(edit.wholesaler_rate_per_crate),
      }));

      const res = await fetch('/api/products/batch-rates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });

      if (!res.ok) throw new Error('Bulk update failed');

      setSaveStatus({
        type: 'success',
        message: lang === 'mr'
          ? 'सर्व आजचे भाव यशस्वीरीत्या डेटाबेसमध्ये सेव्ह झाले!'
          : 'All daily rates successfully updated in SQLite database!'
      });

      if (onCropsUpdated) onCropsUpdated();
      fetchStats();
      setTimeout(() => setSaveStatus(null), 3500);
    } catch (err) {
      setSaveStatus({
        type: 'error',
        message: lang === 'mr' ? 'सर्व भाव सेव्ह करताना त्रुटी आली' : 'Error updating rates'
      });
    } finally {
      setIsSavingRates(false);
    }
  };

  // Toggle Crop Active / Disabled
  const handleToggleProductActive = async (cropId) => {
    try {
      const res = await fetch(`/api/products/${cropId}/toggle`, {
        method: 'PATCH',
      });
      if (res.ok) {
        if (onCropsUpdated) onCropsUpdated();
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to toggle product status:', err);
    }
  };

  // Delete Crop
  const handleDeleteProduct = async (cropId, cropName) => {
    const confirmMsg = lang === 'mr'
      ? `तुम्हाला खात्री आहे का '${cropName}' शेतमाल डेटाबेसमधून कायमचा काढून टाकायचा आहे?`
      : `Are you sure you want to permanently delete '${cropName}'?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/products/${cropId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        if (onCropsUpdated) onCropsUpdated();
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  // Add New Product Submit
  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!newProduct.name_mr || !newProduct.name_en || !newProduct.farmer_rate_per_kg || !newProduct.wholesaler_rate_per_crate) {
      setProductFeedback({
        type: 'error',
        message: lang === 'mr' ? 'कृपया सर्व आवश्यक रकाने भरा.' : 'Please fill all required fields.'
      });
      return;
    }

    setIsAddingProduct(true);
    setProductFeedback(null);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to add product');
      }

      setProductFeedback({
        type: 'success',
        message: lang === 'mr'
          ? `नवीन शेतमाल '${newProduct.name_mr}' यशस्वीरीत्या जोडला गेला!`
          : `New product '${newProduct.name_en}' added to database successfully!`
      });

      // Reset form
      setNewProduct({
        name_mr: '',
        name_en: '',
        category: 'भाजीपाला',
        emoji: '🥔',
        image_url: '',
        farmer_rate_per_kg: '',
        wholesaler_rate_per_crate: '',
        crate_weight_kg: 20,
        available_crates: 150,
        is_active: 1,
      });

      if (onCropsUpdated) onCropsUpdated();
      fetchStats();
      setTimeout(() => setProductFeedback(null), 4000);
    } catch (err) {
      setProductFeedback({
        type: 'error',
        message: err.message || (lang === 'mr' ? 'शेतमाल जोडताना त्रुटी आली' : 'Failed to create product')
      });
    } finally {
      setIsAddingProduct(false);
    }
  };

  // Status Change for Farmer Booking
  const handleFarmerStatusChange = async (bookingId, newStatus) => {
    setStatusUpdatingId(bookingId);
    try {
      const res = await fetch(`/api/farmer-bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setFarmerBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
        );
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to update booking status:', err);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Status Change for Wholesaler Order
  const handleWholesalerStatusChange = async (orderId, newStatus) => {
    setStatusUpdatingId(orderId);
    try {
      const res = await fetch(`/api/wholesaler-orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delivery_status: newStatus }),
      });

      if (res.ok) {
        setWholesalerOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, delivery_status: newStatus } : o))
        );
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Filter crops for rates table
  const filteredCrops = crops.filter((crop) => {
    const matchesSearch =
      crop.name.mr.toLowerCase().includes(ratesSearch.toLowerCase()) ||
      crop.name.en.toLowerCase().includes(ratesSearch.toLowerCase());
    const matchesCat =
      ratesCategoryFilter === 'all' ||
      (crop.category && crop.category.toLowerCase() === ratesCategoryFilter.toLowerCase());
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-5 sm:p-6 shadow-xl border border-slate-700/60">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                SQLite Live: aaplimandi.db
              </span>
              <span className="text-xs text-slate-400 font-mono">100% Persistent Local</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-1.5 text-white flex items-center gap-2">
              <span>⚙️</span> {t(lang, 'adminTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              {t(lang, 'adminSub')}
            </p>
          </div>

          {/* Quick Refresh Button */}
          <button
            onClick={() => {
              if (onCropsUpdated) onCropsUpdated();
              fetchStats();
              if (activeSubTab === 'orders') fetchBookingsAndOrders();
            }}
            className="self-start md:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-semibold text-white border border-white/15 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{lang === 'mr' ? 'डेटा रीफ्रेश' : 'Refresh DB'}</span>
          </button>
        </div>

        {/* Dashboard Mini Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-5 pt-4 border-t border-slate-700/60">
          <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
            <span className="text-[11px] text-slate-400 block font-medium">
              {lang === 'mr' ? 'एकूण जमा क्रेट (Procured)' : 'Crates Procured'}
            </span>
            <div className="text-lg sm:text-xl font-black text-emerald-400 mt-0.5">
              {(farmerBookings.reduce((s, b) => s + (Number(b.crates_count) || 0), 0) || 48)} <span className="text-xs text-emerald-300 font-semibold">{lang === 'mr' ? 'क्रेट' : 'crates'}</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
            <span className="text-[11px] text-slate-400 block font-medium">
              {lang === 'mr' ? 'शेतकरी खरेदी खर्च' : 'Farmer Payout'}
            </span>
            <div className="text-lg sm:text-xl font-black text-amber-300 mt-0.5">
              ₹{(stats.totalFarmerPayout || 29400).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
            <span className="text-[11px] text-slate-400 block font-medium">
              {lang === 'mr' ? 'व्यापारी महसूल' : 'Wholesaler Revenue'}
            </span>
            <div className="text-lg sm:text-xl font-black text-cyan-300 mt-0.5">
              ₹{(stats.totalWholesalerRevenue || 70000).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="bg-emerald-500/10 rounded-xl p-2.5 border border-emerald-500/30">
            <span className="text-[11px] text-emerald-300 block font-bold">
              {lang === 'mr' ? 'अंदाजे निव्वळ नफा (Margin)' : 'Est. Net Margin'}
            </span>
            <div className="text-lg sm:text-xl font-black text-emerald-300 mt-0.5">
              +₹{Math.max(0, (stats.totalWholesalerRevenue || 70000) - (stats.totalFarmerPayout || 29400)).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Admin Sub-Tabs Navigation */}
      <div className="flex bg-slate-200/80 p-1.5 rounded-2xl gap-1">
        <button
          onClick={() => setActiveSubTab('rates')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'rates'
              ? 'bg-white text-agri-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>{t(lang, 'tabRates')}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('addProduct')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'addProduct'
              ? 'bg-white text-agri-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <PlusCircle className="w-4 h-4 text-indigo-600" />
          <span>{t(lang, 'tabAddProduct')}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('orders')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'orders'
              ? 'bg-white text-agri-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <ClipboardList className="w-4 h-4 text-highway-600" />
          <span>{t(lang, 'tabOrders')}</span>
          {(stats.pendingFarmerBookings > 0 || stats.pendingWholesalerOrders > 0) && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* SUB-TAB 1: UPDATE DAILY RATES                            */}
      {/* ======================================================== */}
      {activeSubTab === 'rates' && (
        <section className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200/80 space-y-5">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>🏷️</span> {t(lang, 'tabRates')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                {lang === 'mr'
                  ? 'येथे बदललेले भाव तत्काळ शेतकरी व व्यापारी स्क्रीनवर लाइव्ह दिसतील.'
                  : 'Rates modified here reflect instantly on Farmer & Wholesaler dashboards.'}
              </p>
            </div>

            {/* Save All Rates Button */}
            <button
              type="button"
              disabled={isSavingRates}
              onClick={handleSaveAllRates}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-agri-600 hover:bg-agri-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingRates ? t(lang, 'saving') : t(lang, 'saveRates')}</span>
            </button>
          </div>

          {/* Feedback banner */}
          {saveStatus && (
            <div
              className={`p-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 ${
                saveStatus.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {saveStatus.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{saveStatus.message}</span>
            </div>
          )}

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder={lang === 'mr' ? 'शेतमाल शोधा...' : 'Search crop...'}
                value={ratesSearch}
                onChange={(e) => setRatesSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>
            <select
              value={ratesCategoryFilter}
              onChange={(e) => setRatesCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-agri-500 cursor-pointer"
            >
              <option value="all">{lang === 'mr' ? 'सर्व श्रेणी' : 'All Categories'}</option>
              <option value="भाजीपाला">भाजीपाला (Vegetables)</option>
              <option value="फळे">फळे (Fruits)</option>
              <option value="पालेभाज्या">पालेभाज्या (Leafy)</option>
            </select>
          </div>

          {/* Editable Rates Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-3 sm:px-4">{lang === 'mr' ? 'शेतमाल' : 'Crop'}</th>
                  <th className="py-3 px-3 sm:px-4">{lang === 'mr' ? 'श्रेणी' : 'Category'}</th>
                  <th className="py-3 px-3 sm:px-4 text-emerald-800">
                    {lang === 'mr' ? 'शेतकरी खरेदी भाव (₹/किलो)' : 'Farmer Buy (₹/kg)'}
                  </th>
                  <th className="py-3 px-3 sm:px-4 text-highway-800">
                    {lang === 'mr' ? 'व्यापारी विक्री दर (₹/क्रेट)' : 'Wholesaler Sell (₹/crate)'}
                  </th>
                  <th className="py-3 px-3 sm:px-4 hidden md:table-cell">
                    {lang === 'mr' ? 'मार्जिन (२० कि. क्रेट)' : 'Est. Margin / Crate'}
                  </th>
                  <th className="py-3 px-3 sm:px-4 text-right">{lang === 'mr' ? 'कृती' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCrops.map((crop) => {
                  const currentEdit = rateEdits[crop.id] || {
                    farmer_rate_per_kg: crop.pricePerKg || 0,
                    wholesaler_rate_per_crate: crop.cratePrice || 0,
                  };

                  const fRate = Number(currentEdit.farmer_rate_per_kg) || 0;
                  const wRate = Number(currentEdit.wholesaler_rate_per_crate) || 0;
                  const crateCost = fRate * (crop.crateWeightKg || 20);
                  const marginPerCrate = wRate - crateCost;

                  return (
                    <tr
                      key={crop.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        crop.isActive === false ? 'opacity-60 bg-slate-50/50' : ''
                      }`}
                    >
                      {/* Name + Emoji */}
                      <td className="py-3 px-3 sm:px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl select-none">{crop.emoji}</span>
                          <div>
                            <div className="font-bold text-slate-900 leading-tight">
                              {crop.name.mr}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              {crop.name.en}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3 px-3 sm:px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {crop.category || (lang === 'mr' ? 'भाजीपाला' : 'Vegetables')}
                        </span>
                      </td>

                      {/* Farmer Rate Input */}
                      <td className="py-3 px-3 sm:px-4">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-500 font-bold">₹</span>
                          <input
                            type="number"
                            min="1"
                            step="0.5"
                            value={currentEdit.farmer_rate_per_kg}
                            onChange={(e) =>
                              handleRateInputChange(crop.id, 'farmer_rate_per_kg', e.target.value)
                            }
                            className="w-20 sm:w-24 px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50/40 text-slate-900 font-bold text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <span className="text-[11px] text-slate-400">/kg</span>
                        </div>
                      </td>

                      {/* Wholesaler Rate Input */}
                      <td className="py-3 px-3 sm:px-4">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-500 font-bold">₹</span>
                          <input
                            type="number"
                            min="1"
                            step="10"
                            value={currentEdit.wholesaler_rate_per_crate}
                            onChange={(e) =>
                              handleRateInputChange(crop.id, 'wholesaler_rate_per_crate', e.target.value)
                            }
                            className="w-24 sm:w-28 px-2.5 py-1.5 rounded-lg border border-highway-300 bg-orange-50/40 text-slate-900 font-bold text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-highway-500"
                          />
                          <span className="text-[11px] text-slate-400">/crate</span>
                        </div>
                      </td>

                      {/* Est Margin */}
                      <td className="py-3 px-3 sm:px-4 hidden md:table-cell">
                        <span
                          className={`font-semibold text-xs px-2 py-1 rounded-md ${
                            marginPerCrate >= 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {marginPerCrate >= 0 ? `+₹${marginPerCrate}` : `-₹${Math.abs(marginPerCrate)}`}
                        </span>
                      </td>

                      {/* Row Save Button */}
                      <td className="py-3 px-3 sm:px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleSaveSingleCropRate(crop.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{t(lang, 'save')}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: ADD NEW PRODUCT & CATALOG MANAGER             */}
      {/* ======================================================== */}
      {activeSubTab === 'addProduct' && (
        <section className="space-y-6">
          {/* Add Product Form Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200/80 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <PlusCircle className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                  {t(lang, 'tabAddProduct')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  {lang === 'mr'
                    ? 'नवीन भाजीपाला किंवा फळ थेट स्थानिक SQLite डेटाबेसमध्ये जोडा'
                    : 'Add a new vegetable or fruit to the SQLite database'}
                </p>
              </div>
            </div>

            {/* Form feedback */}
            {productFeedback && (
              <div
                className={`p-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 ${
                  productFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {productFeedback.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{productFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Marathi Name */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                    {t(lang, 'cropNameMr')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. शिमला मिरची, वांगी, लसूण"
                    value={newProduct.name_mr}
                    onChange={(e) => setNewProduct({ ...newProduct, name_mr: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* English Name */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                    {t(lang, 'cropNameEn')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Capsicum, Brinjal, Garlic"
                    value={newProduct.name_en}
                    onChange={(e) => setNewProduct({ ...newProduct, name_en: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                    {t(lang, 'categoryLabel')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="भाजीपाला">भाजीपाला (Vegetables)</option>
                    <option value="फळे">फळे (Fruits)</option>
                    <option value="पालेभाज्या">पालेभाज्या (Leafy)</option>
                    <option value="कडधान्ये">कडधान्ये (Pulses)</option>
                  </select>
                </div>

                {/* Farmer Rate */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                    {t(lang, 'farmerRate')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.5"
                      placeholder="35"
                      value={newProduct.farmer_rate_per_kg}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, farmer_rate_per_kg: e.target.value })
                      }
                      className="w-full pl-8 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Wholesaler Rate */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                    {t(lang, 'wholesalerRate')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      required
                      min="1"
                      step="10"
                      placeholder="700"
                      value={newProduct.wholesaler_rate_per_crate}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, wholesaler_rate_per_crate: e.target.value })
                      }
                      className="w-full pl-8 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Emoji Quick Picker & Photo URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                    {lang === 'mr' ? 'इमोजी निवडा' : 'Choose Emoji Icon'}
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    {['🥔', '🥕', '🫑', '🍆', '🥦', '🥬', '🍇', '🥭', '🍌', '🍎', '🌽', '🍋', '🥒', '🧅', '🍅', '🧄', '🫚'].map(
                      (emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setNewProduct({ ...newProduct, emoji })}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-transform hover:scale-110 cursor-pointer ${
                            newProduct.emoji === emoji
                              ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                              : 'hover:bg-slate-200'
                          }`}
                        >
                          {emoji}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                    {t(lang, 'photoUrlLabel')} (उदा. Unsplash link)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newProduct.image_url}
                    onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    {lang === 'mr'
                      ? 'फोटो URL ऐच्छिक आहे. रिकामे ठेवल्यास निवडलेला इमोजी वापरला जाईल.'
                      : 'Photo URL is optional; selected emoji will be used as default avatar.'}
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isAddingProduct}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{isAddingProduct ? t(lang, 'saving') : t(lang, 'addProductBtn')}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Current Catalog List with Delete / Disable Controls */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-600" />
                <span>{lang === 'mr' ? 'विद्यमान शेतमाल सूची' : 'Current Database Catalog'}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {crops.length}
                </span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {crops.map((crop) => (
                <div
                  key={crop.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    crop.isActive === false
                      ? 'bg-slate-100 border-slate-300 opacity-60'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="text-3xl select-none shrink-0">{crop.emoji}</span>
                    <div className="truncate">
                      <div className="font-bold text-slate-900 text-sm truncate leading-tight">
                        {crop.name.mr}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{crop.name.en}</div>
                      <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                        ₹{crop.pricePerKg}/kg • ₹{crop.cratePrice}/crate
                      </div>
                    </div>
                  </div>

                  {/* Actions: Toggle Active + Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      title={crop.isActive === false ? 'सक्रिय करा' : 'बंद करा'}
                      onClick={() => handleToggleProductActive(crop.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 cursor-pointer"
                    >
                      {crop.isActive === false ? (
                        <ToggleLeft className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ToggleRight className="w-5 h-5 text-emerald-600" />
                      )}
                    </button>
                    <button
                      type="button"
                      title={t(lang, 'deleteProduct')}
                      onClick={() => handleDeleteProduct(crop.id, crop.name.mr)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 3: LIVE BOOKINGS & ORDERS MANAGER               */}
      {/* ======================================================== */}
      {activeSubTab === 'orders' && (
        <section className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200/80 space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>📋</span> {t(lang, 'tabOrders')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                {lang === 'mr'
                  ? 'शेतकऱ्यांच्या पिकअप विनंत्या आणि व्यापाऱ्यांच्या प्री-ऑर्डर्सची थेट स्थिती बदला.'
                  : 'Track & update incoming farmer pickups and wholesaler market yard pre-orders in SQLite.'}
              </p>
            </div>

            <button
              onClick={fetchBookingsAndOrders}
              className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
              <span>{lang === 'mr' ? 'रीफ्रेश करा' : 'Refresh'}</span>
            </button>
          </div>

          {/* Sub-Switch: Farmers vs Wholesalers */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setOrdersSubTab('farmers')}
              className={`pb-2.5 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                ordersSubTab === 'farmers'
                  ? 'border-agri-600 text-agri-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{lang === 'mr' ? 'शेतकरी पिकअप विनंत्या' : 'Farmer Pickup Requests'}</span>
              <span className="px-2 py-0.2 rounded-full text-[11px] bg-slate-100 text-slate-700 font-bold">
                {farmerBookings.length}
              </span>
            </button>

            <button
              onClick={() => setOrdersSubTab('wholesalers')}
              className={`pb-2.5 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                ordersSubTab === 'wholesalers'
                  ? 'border-highway-600 text-highway-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>{lang === 'mr' ? 'व्यापारी प्री-ऑर्डर्स' : 'Wholesaler Pre-Orders'}</span>
              <span className="px-2 py-0.2 rounded-full text-[11px] bg-slate-100 text-slate-700 font-bold">
                {wholesalerOrders.length}
              </span>
            </button>
          </div>

          {/* View 1: Farmer Bookings */}
          {ordersSubTab === 'farmers' && (
            <div className="space-y-3">
              {farmerBookings.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  {lang === 'mr' ? 'सध्या कोणतीही शेतकरी बुकिंग नाही.' : 'No farmer bookings found in database.'}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                        <th className="py-3 px-3 sm:px-4">पावती / ID</th>
                        <th className="py-3 px-3 sm:px-4">शेतकरी नाव व संपर्क</th>
                        <th className="py-3 px-3 sm:px-4">गाव / संकलन</th>
                        <th className="py-3 px-3 sm:px-4">पीक व प्रमाण</th>
                        <th className="py-3 px-3 sm:px-4">अंदाजे रक्कम</th>
                        <th className="py-3 px-3 sm:px-4">स्थिती (Change Status)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {farmerBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3 sm:px-4 font-mono font-semibold text-slate-700">
                            {b.id}
                            <div className="text-[10px] text-slate-400 font-normal">
                              {b.created_at}
                            </div>
                          </td>
                          <td className="py-3 px-3 sm:px-4">
                            <div className="font-bold text-slate-900">{b.farmer_name}</div>
                            <div className="text-[11px] text-slate-500">
                              <a href={`tel:${b.phone}`} className="hover:underline text-agri-700">
                                📞 {b.phone}
                              </a>
                            </div>
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-slate-700">
                            <div className="font-medium">{b.village}</div>
                            <div className="text-[10px] text-slate-500">{b.pickup_type}</div>
                          </td>
                          <td className="py-3 px-3 sm:px-4">
                            <span className="font-bold text-slate-900">{b.crop_name || b.crop_id}</span>
                            <div className="text-[11px] text-slate-500 font-medium">
                              {b.crates_count} क्रेट
                            </div>
                          </td>
                          <td className="py-3 px-3 sm:px-4 font-extrabold text-agri-700">
                            ₹{Number(b.total_estimated_amount).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 sm:px-4">
                            <select
                              value={b.status}
                              disabled={statusUpdatingId === b.id}
                              onChange={(e) => handleFarmerStatusChange(b.id, e.target.value)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                                b.status === 'Weighed & Paid' || b.status === 'Paid'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : b.status === 'Tempo Assigned' || b.status === 'Dispatched'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
                            >
                              <option value="Pending">⏳ Pending (प्रलंबित)</option>
                              <option value="Tempo Assigned">🚛 Tempo Assigned (गाडी रवाना)</option>
                              <option value="Weighed & Paid">✅ Weighed & Paid (पेमेंट पूर्ण)</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* View 2: Wholesaler Orders */}
          {ordersSubTab === 'wholesalers' && (
            <div className="space-y-3">
              {wholesalerOrders.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  {lang === 'mr' ? 'कोणतीही व्यापारी ऑर्डर नाही.' : 'No wholesaler orders found in database.'}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                        <th className="py-3 px-3 sm:px-4">ऑर्डर ID</th>
                        <th className="py-3 px-3 sm:px-4">व्यापारी / फर्म</th>
                        <th className="py-3 px-3 sm:px-4">मार्केट यार्ड व गाळा</th>
                        <th className="py-3 px-3 sm:px-4">मागणी</th>
                        <th className="py-3 px-3 sm:px-4">एकूण बिल</th>
                        <th className="py-3 px-3 sm:px-4">डिलिव्हरी स्थिती (Change Status)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {wholesalerOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3 sm:px-4 font-mono font-semibold text-slate-700">
                            {o.id}
                            <div className="text-[10px] text-slate-400 font-normal">
                              {o.created_at}
                            </div>
                          </td>
                          <td className="py-3 px-3 sm:px-4">
                            <div className="font-bold text-slate-900">{o.wholesaler_name}</div>
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-slate-700">
                            <div className="font-medium">{o.market_yard}</div>
                            <div className="text-[11px] text-slate-500 font-medium">{o.shop_gala_no}</div>
                          </td>
                          <td className="py-3 px-3 sm:px-4">
                            <span className="font-bold text-slate-900">{o.crop_name || o.crop_id}</span>
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold mt-0.5">
                              <span className="bg-orange-50 text-orange-800 border border-orange-200 px-1.5 py-0.2 rounded">
                                {o.crates_ordered} क्रेट
                              </span>
                              {(o.total_weight_kg > 0 || (o.crates_ordered && !o.crop_name?.includes('kg'))) && (
                                <span className="bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded">
                                  ⚖️ {o.total_weight_kg || (o.crates_ordered * 20)} kg
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 sm:px-4 font-extrabold text-highway-700">
                            ₹{Number(o.total_amount).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 sm:px-4">
                            <select
                              value={o.delivery_status}
                              disabled={statusUpdatingId === o.id}
                              onChange={(e) => handleWholesalerStatusChange(o.id, e.target.value)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                                o.delivery_status === 'Delivered'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : o.delivery_status === 'Tempo Dispatched'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
                            >
                              <option value="Pending">⏳ Pending (प्रलंबित)</option>
                              <option value="Tempo Dispatched">🚛 Tempo Dispatched (हायवे रवाना)</option>
                              <option value="Delivered">✅ Delivered (मार्केट पोहचले)</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
