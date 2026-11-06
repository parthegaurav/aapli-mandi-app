import { useState, useEffect } from 'react';
import {
  Camera,
  Mic,
  Truck,
  ChevronRight,
  IndianRupee,
  Package,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Leaf,
  X,
  Check,
  FileText,
  Printer,
  Download,
  User,
  Sparkles
} from 'lucide-react';
import { t } from '../data/i18n.js';
import { crops, locations, generateSampleReceipts } from '../data/crops.js';
import DigitalPavtiModal from './DigitalPavtiModal.jsx';

export default function FarmerView({ lang = 'mr', onBookingChange, crops: cropsProp, activeTab = 'rates', setActiveTab, user }) {
  const cropsList = cropsProp && cropsProp.length > 0 ? cropsProp : crops;

  // Selected crop for booking
  const [selectedCrop, setSelectedCrop] = useState(cropsList[0]);

  // Sync selectedCrop when cropsList updates from database
  useEffect(() => {
    if (cropsList.length > 0) {
      const currentId = selectedCrop?.id;
      const found = cropsList.find((c) => c.id === currentId);
      if (found) {
        setSelectedCrop(found);
      } else {
        setSelectedCrop(cropsList[0]);
      }
    }
  }, [cropsList]);

  // Farmer info state - auto-bound to logged-in user
  const [farmerName, setFarmerName] = useState(
    user?.name || user?.full_name || (lang === 'mr' ? 'ज्ञानेश्वर तुकाराम बोराडे' : 'Dnyaneshwar T. Borade')
  );

  // Sync with logged in user if changed
  useEffect(() => {
    if (user?.name || user?.full_name) {
      setFarmerName(user.name || user.full_name);
    }
    if (user?.village) {
      const match = locations.find((l) =>
        l.name.mr.includes(user.village) ||
        user.village.includes(l.name.mr) ||
        l.id.toLowerCase() === user.village.toLowerCase()
      );
      if (match) {
        setSelectedLocation(match.id);
      }
    }
  }, [user]);

  // Booking form states
  const [qty, setQty] = useState(5);
  const [unit, setUnit] = useState('crates'); // 'crates' | 'quintals'
  const [pickupType, setPickupType] = useState('farmGate'); // 'farmGate' | 'collectionHub'
  const [selectedLocation, setSelectedLocation] = useState(locations[0].id);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasVoice, setHasVoice] = useState(false);

  // Receipts state - loaded from API if available, falling back to samples
  const [receipts, setReceipts] = useState(() => generateSampleReceipts());

  // Load receipts from SQLite backend - filtered by logged-in farmer
  useEffect(() => {
    const fetchUrl = user?.id ? `/api/farmer-bookings?farmer_id=${user.id}` : '/api/farmer-bookings';
    fetch(fetchUrl)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.length > 0) {
          // If no farmer_id filter on backend or returned all, filter client side by user name/phone
          const relevant = user?.id
            ? data
            : (user ? data.filter((b) => b.farmer_name === (user.name || user.full_name) || b.phone === user.phone) : data);
          const sourceList = relevant.length > 0 ? relevant : data;

          const mapped = sourceList.map((b) => {
            const cropMatch = cropsList.find((c) => c.id === b.crop_id) || {
              id: b.crop_id,
              emoji: '🥬',
              name: { mr: b.crop_name || 'शेतमाल', en: b.crop_name || 'Crop' },
              cratePrice: Math.round(b.total_estimated_amount / (b.crates_count || 1)),
              pricePerKg: Math.round(b.total_estimated_amount / ((b.crates_count || 1) * 20)),
            };

            const createdDate = b.created_at
              ? new Date(b.created_at).toLocaleDateString(lang === 'mr' ? 'mr-IN' : 'en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : '15 Oct 2026';

            return {
              id: b.id,
              farmerName: b.farmer_name,
              crop: cropMatch,
              crates: b.crates_count,
              bookedQty: b.crates_count,
              unit: 'crates',
              totalAmount: b.total_estimated_amount,
              status: b.status === 'Weighed & Paid' || b.status === 'Paid' ? 'paid' : 'processing',
              tempoEta: b.tempo_eta || '35 min',
              date: createdDate,
              pickupLocation: b.village,
              pickupType: b.pickup_type,
            };
          });
          setReceipts(mapped);
        }
      })
      .catch((err) => console.log('Using sample receipts:', err));
  }, [lang, cropsList, user]);

  // Modal confirmation & Digital Pavti states
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [activePavti, setActivePavti] = useState(null);

  // Payout calculation
  // Crates: qty * cratePrice; Quintals: qty * 100 * pricePerKg (1 quintal = 100kg)
  const numericQty = Math.max(1, Number(qty) || 1);
  const estimatedPayout =
    unit === 'crates'
      ? numericQty * (selectedCrop?.cratePrice || 0)
      : numericQty * 100 * (selectedCrop?.pricePerKg || 0);

  // Sync state upward to parent / WhatsApp floating button
  useEffect(() => {
    if (onBookingChange) {
      onBookingChange({
        crop: selectedCrop,
        farmerName,
        qty: numericQty,
        unit,
        pickupType,
        selectedLocation,
        estimatedPayout,
      });
    }
  }, [
    selectedCrop,
    farmerName,
    numericQty,
    unit,
    pickupType,
    selectedLocation,
    estimatedPayout,
    onBookingChange,
  ]);

  // Handlers for simulated photo & voice
  const handlePhotoClick = () => {
    setHasPhoto((prev) => !prev);
  };

  const handleVoiceClick = () => {
    if (isRecording) {
      setIsRecording(false);
      setHasVoice(true);
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setHasVoice(true);
      }, 1800);
    }
  };

  // Helper for crop border color in receipts
  const getCropBorderClass = (cropId) => {
    switch (cropId) {
      case 'tomato':
        return 'border-l-red-500';
      case 'onion':
        return 'border-l-purple-500';
      case 'greenchilli':
        return 'border-l-green-500';
      case 'okra':
        return 'border-l-lime-500';
      case 'pomegranate':
        return 'border-l-rose-500';
      case 'palak':
        return 'border-l-emerald-500';
      default:
        return 'border-l-agri-500';
    }
  };

  // Submit booking
  const handleBookPickup = async (e) => {
    e.preventDefault();

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const receiptId = `FR-${yyyy}-${mm}-${dd}-${randomDigits}`;

    const locObj = locations.find((l) => l.id === selectedLocation) || locations[0];
    const locationName = locObj.name[lang] || locObj.name.mr;

    // Crates count equivalent: 1 quintal (100kg) = 5 crates (20kg each)
    const crateEquivalent = unit === 'crates' ? numericQty : numericQty * 5;

    const formattedDate = now.toLocaleDateString(lang === 'mr' ? 'mr-IN' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const newBookingReceipt = {
      id: receiptId,
      farmerName: farmerName.trim() || (lang === 'mr' ? 'ज्ञानेश्वर तुकाराम बोराडे' : 'Dnyaneshwar T. Borade'),
      crop: selectedCrop,
      crates: crateEquivalent,
      totalAmount: estimatedPayout,
      status: 'processing',
      tempoEta: pickupType === 'farmGate' ? '35 min' : '50 min',
      date: formattedDate,
      pickupLocation: locationName,
      pickupType: pickupType,
      unit: unit,
      bookedQty: numericQty,
    };

    // Prepend new booking to receipts list
    setReceipts((prev) => [newBookingReceipt, ...prev]);
    setConfirmedBooking(newBookingReceipt);
    setActivePavti(newBookingReceipt);

    // Persist to SQLite Backend
    try {
      await fetch('/api/farmer-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: receiptId,
          farmer_id: user?.id || null,
          farmer_name: newBookingReceipt.farmerName,
          phone: user?.phone || '9822481092',
          village: locationName,
          crop_id: selectedCrop?.id || 'crop',
          crop_name: selectedCrop?.name?.mr || 'शेतमाल',
          crates_count: crateEquivalent,
          pickup_type: pickupType === 'farmGate' ? 'बांधावरून' : 'संकलन केंद्र',
          total_estimated_amount: estimatedPayout,
          status: 'Pending',
          tempo_eta: newBookingReceipt.tempoEta,
        }),
      });
    } catch (err) {
      console.error('Failed to save farmer booking to database:', err);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* ======================================================== */}
      {/* SECTION A: Today's Guaranteed Rates Grid                */}
      {/* ======================================================== */}
      {(!activeTab || activeTab === 'rates') && (
        <section className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-agri-100 text-agri-700 flex items-center justify-center shrink-0">
              <Leaf className="w-5 h-5 text-agri-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                {t(lang, 'todaysRates')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                {t(lang, 'todaysRatesSub')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {cropsList.map((crop) => {
              const upliftPct = Math.round(
                ((crop.pricePerKg - crop.localMandiPrice) / crop.localMandiPrice) * 100
              );
              const isSelected = selectedCrop?.id === crop.id;

              return (
                <div
                  key={crop.id}
                  onClick={() => setSelectedCrop(crop)}
                  className={`relative p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    crop.color
                  } ${
                    isSelected
                      ? 'ring-2 ring-agri-600 border-agri-600 shadow-md scale-[1.01]'
                      : 'hover:shadow-sm hover:border-gray-300'
                  }`}
                >
                  {/* Selection indicator pill */}
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 bg-agri-600 text-white rounded-full p-0.5 shadow-sm">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-2xl sm:text-3xl select-none">{crop.emoji}</span>
                      <h3 className="font-bold text-sm sm:text-base text-gray-900 leading-tight">
                        {crop.name[lang] || crop.name.mr}
                      </h3>
                    </div>

                    {/* Price per Kg */}
                    <div className="mt-1">
                      <div className="text-xs text-gray-500">{t(lang, 'perKg')}</div>
                      <div className="text-lg sm:text-xl font-black text-gray-900">
                        ₹{crop.pricePerKg}
                      </div>
                    </div>

                    {/* Price per Crate */}
                    <div className="mt-1 text-xs text-gray-600 font-medium">
                      ₹{crop.cratePrice}{' '}
                      <span className="text-[11px] text-gray-500">
                        ({t(lang, 'perCrate')})
                      </span>
                    </div>
                  </div>

                  {/* Uplift badge vs Local Mandi & Sell Now button */}
                  <div className="mt-3 space-y-2">
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                      +{upliftPct}% {t(lang, 'vsLocalMandi')}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCrop(crop);
                        if (setActiveTab) setActiveTab('book');
                      }}
                      className="w-full py-1.5 px-2 bg-agri-600 hover:bg-agri-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>{lang === 'mr' ? 'शेतमाल विका' : 'Sell Now'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* SECTION B: Sell Produce & Book Pickup Form              */}
      {/* ======================================================== */}
      {(!activeTab || activeTab === 'book') && (
        <section className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 space-y-5">
          {/* Header */}
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-highway-100 text-highway-700 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-highway-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                {t(lang, 'sellProduce')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                {t(lang, 'sellProduceSub')}
              </p>
            </div>
          </div>

          <form onSubmit={handleBookPickup} className="space-y-4">
            {/* Selected Crop Banner */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                {t(lang, 'selectCrop')}
              </label>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{selectedCrop?.emoji}</span>
                  <div>
                    <div className="font-bold text-gray-900 text-sm sm:text-base">
                      {selectedCrop?.name[lang] || selectedCrop?.name.mr}
                    </div>
                    <div className="text-xs text-gray-500">
                      ₹{selectedCrop?.cratePrice} / {t(lang, 'perCrate')} • ₹{selectedCrop?.pricePerKg} / {t(lang, 'perKg')}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-medium text-agri-700 bg-agri-50 border border-agri-200 px-2.5 py-1 rounded-full">
                  {lang === 'mr' ? 'निवडलेले' : 'Selected'}
                </span>
              </div>
            </div>

            {/* Farmer Name & Contact Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-agri-600" />
                  <span>{t(lang, 'farmerNameLabel')}</span>
                </label>
                <input
                  type="text"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  placeholder={lang === 'mr' ? 'उदा. ज्ञानेश्वर तुकाराम बोराडे' : 'e.g. Dnyaneshwar T. Borade'}
                  className="w-full h-11 px-3.5 text-sm font-semibold rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-agri-500 focus:border-agri-500 text-gray-900 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                  {t(lang, 'farmerMobileLabel')}
                </label>
                <input
                  type="tel"
                  defaultValue={user?.phone ? `+91 ${user.phone}` : '+91 98224 81092'}
                  className="w-full h-11 px-3.5 text-sm font-semibold rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-agri-500 focus:border-agri-500 text-gray-900 bg-white font-mono"
                />
              </div>
            </div>

            {/* Quantity & Unit Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                  {t(lang, 'quantity')}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQty((prev) => Math.max(1, (Number(prev) || 1) - 1))}
                    className="w-11 h-11 rounded-xl border border-gray-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center font-bold text-lg text-gray-700 active:scale-95"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={qty}
                    onChange={(e) => setQty(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="flex-1 h-11 text-center font-bold text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-agri-500 focus:border-agri-500 text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setQty((prev) => (Number(prev) || 0) + 1)}
                    className="w-11 h-11 rounded-xl border border-gray-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center font-bold text-lg text-gray-700 active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Unit Toggle: Crates vs Quintals */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                  {lang === 'mr' ? 'एकक (Unit)' : 'Unit'}
                </label>
                <div className="grid grid-cols-2 gap-2 h-11 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setUnit('crates')}
                    className={`rounded-lg font-semibold text-xs sm:text-sm transition-all flex items-center justify-center ${
                      unit === 'crates'
                        ? 'bg-white text-agri-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t(lang, 'crates')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnit('quintals')}
                    className={`rounded-lg font-semibold text-xs sm:text-sm transition-all flex items-center justify-center ${
                      unit === 'quintals'
                        ? 'bg-white text-agri-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t(lang, 'quintals')}
                  </button>
                </div>
              </div>
            </div>

            {/* Estimated Payout Calculator Banner */}
            <div className="bg-gradient-to-r from-agri-50 via-emerald-50 to-agri-100/70 border border-agri-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-agri-800">
                  {t(lang, 'estimatedPayout')}
                </span>
                <div className="text-2xl sm:text-3xl font-black text-agri-700 flex items-center gap-1 mt-0.5">
                  <IndianRupee className="w-6 h-6 inline stroke-[2.5]" />
                  <span>{estimatedPayout.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs text-agri-700/90 mt-0.5">
                  {unit === 'crates'
                    ? `${numericQty} × ₹${selectedCrop?.cratePrice} (${t(lang, 'perCrate')})`
                    : `${numericQty} × 100 kg × ₹${selectedCrop?.pricePerKg} (${t(lang, 'perKg')})`}
                </p>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-agri-200">
                <span className="inline-block bg-white text-agri-700 border border-agri-200 px-3 py-1 rounded-full text-xs font-bold shadow-xs">
                  {t(lang, 'paid24hr')}
                </span>
                <span className="text-[11px] text-gray-500 mt-1 hidden sm:inline">
                  {lang === 'mr' ? 'Zero कपात • Direct UPI' : 'Zero deduction • Direct UPI'}
                </span>
              </div>
            </div>

            {/* Pickup Type Toggle */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                {t(lang, 'pickupType')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPickupType('farmGate')}
                  className={`p-3.5 rounded-xl border-2 flex items-center gap-3 transition-all cursor-pointer text-left ${
                    pickupType === 'farmGate'
                      ? 'border-agri-600 bg-agri-50/60 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      pickupType === 'farmGate'
                        ? 'bg-agri-600 text-white'
                        : 'bg-slate-100 text-gray-600'
                    }`}
                  >
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-900">
                      {t(lang, 'farmGate')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {lang === 'mr'
                        ? 'टेम्पो थेट तुमच्या बांधावर येईल'
                        : 'Tempo pickup directly at farm gate'}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPickupType('collectionHub')}
                  className={`p-3.5 rounded-xl border-2 flex items-center gap-3 transition-all cursor-pointer text-left ${
                    pickupType === 'collectionHub'
                      ? 'border-agri-600 bg-agri-50/60 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      pickupType === 'collectionHub'
                        ? 'bg-agri-600 text-white'
                        : 'bg-slate-100 text-gray-600'
                    }`}
                  >
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-900">
                      {t(lang, 'collectionHub')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {lang === 'mr'
                        ? 'गावातील मुख्य संकलन केंद्र'
                        : 'Drop at village collection hub'}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Village / Taluka Dropdown */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-agri-600" />
                {t(lang, 'villageTaluka')}
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-agri-500 focus:border-agri-500 shadow-xs cursor-pointer"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name[lang] || loc.name.mr}
                  </option>
                ))}
              </select>
            </div>

            {/* Photo & Voice Action Row */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handlePhotoClick}
                className={`py-3 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  hasPhoto
                    ? 'bg-agri-50 border-agri-300 text-agri-800'
                    : 'bg-white border-gray-300 hover:bg-slate-50 text-gray-700'
                }`}
              >
                <Camera
                  className={`w-4 h-4 shrink-0 ${
                    hasPhoto ? 'text-agri-600' : 'text-gray-500'
                  }`}
                />
                <span className="truncate">
                  {hasPhoto
                    ? lang === 'mr'
                      ? 'फोटो जोडला ✓'
                      : 'Photo Added ✓'
                    : t(lang, 'uploadPhoto')}
                </span>
              </button>

              <button
                type="button"
                onClick={handleVoiceClick}
                className={`py-3 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-red-50 border-red-300 text-red-700 animate-pulse'
                    : hasVoice
                    ? 'bg-highway-50 border-highway-300 text-highway-800'
                    : 'bg-white border-gray-300 hover:bg-slate-50 text-gray-700'
                }`}
              >
                <Mic
                  className={`w-4 h-4 shrink-0 ${
                    isRecording
                      ? 'text-red-600'
                      : hasVoice
                      ? 'text-highway-600'
                      : 'text-gray-500'
                  }`}
                />
                <span className="truncate">
                  {isRecording
                    ? lang === 'mr'
                      ? 'ऐकत आहे...'
                      : 'Listening...'
                    : hasVoice
                    ? lang === 'mr'
                      ? 'आवाज नोंदवला ✓'
                      : 'Voice Recorded ✓'
                    : t(lang, 'voiceBooking')}
                </span>
              </button>
            </div>

            {/* Big Green Submit Button */}
            <button
              type="submit"
              className="w-full bg-agri-600 hover:bg-agri-700 active:scale-[0.99] text-white font-bold py-4 px-6 rounded-2xl shadow-md shadow-agri-600/25 flex items-center justify-center gap-3 transition-all text-base sm:text-lg cursor-pointer mt-2"
            >
              <Truck className="w-5 h-5 stroke-[2.5]" />
              <span>{t(lang, 'bookPickup')}</span>
            </button>
          </form>
        </section>
      )}

      {/* ======================================================== */}
      {/* SECTION C: Digital Receipts & Payments                   */}
      {/* ======================================================== */}
      {(!activeTab || activeTab === 'receipts') && (
        <section className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-agri-100 text-agri-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-agri-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                {t(lang, 'receipts')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                {t(lang, 'receiptsSub')}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {receipts.length === 0 ? (
              <div className="text-center py-10 px-4 bg-white rounded-2xl border border-dashed border-slate-200">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-700">
                  {lang === 'mr' ? 'कोणतीही पक्की पावती उपलब्ध नाही' : 'No receipts available'}
                </p>
                <p className="text-xs text-gray-400 mt-1 mb-4">
                  {lang === 'mr' ? 'नवीन शेतमाल विक्रीसाठी गाडी बुक करा' : 'Book a pickup to see your receipts here'}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab && setActiveTab('book')}
                  className="px-4 py-2 bg-agri-600 hover:bg-agri-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  {lang === 'mr' ? '🚛 गाडी बुक करा' : '🚛 Book Pickup'}
                </button>
              </div>
            ) : (
              receipts.map((rcpt) => {
                const isPaid = rcpt.status === 'paid';
                const borderClass = getCropBorderClass(rcpt.crop?.id);

                return (
                  <div
                    key={rcpt.id}
                    className={`bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 border-l-4 ${borderClass} transition-all hover:shadow-md`}
                  >
                    {/* Top Row: Receipt ID & Status Badge */}
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          {t(lang, 'receiptId')}
                        </span>
                        <span className="font-mono text-xs sm:text-sm font-bold text-gray-700">
                          {rcpt.id}
                        </span>
                      </div>

                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {t(lang, 'paidDone')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          {t(lang, 'processing')}
                        </span>
                      )}
                    </div>

                    {/* Middle: Crop & Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 items-center">
                      {/* Crop Info */}
                      <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
                        <span className="text-3xl select-none">{rcpt.crop?.emoji}</span>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">
                            {rcpt.crop?.name?.[lang] || rcpt.crop?.name?.mr}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {rcpt.crates} {t(lang, 'crates')}
                          </p>
                        </div>
                      </div>

                      {/* Location & Date */}
                      <div>
                        <div className="text-[11px] uppercase tracking-wide font-medium text-gray-400">
                          {lang === 'mr' ? 'संकलन ठिकाण' : 'Pickup Location'}
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-gray-800 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{rcpt.pickupLocation}</span>
                        </div>
                        <div className="text-[11px] text-gray-400">{rcpt.date}</div>
                      </div>

                      {/* Tempo ETA */}
                      <div>
                        <div className="text-[11px] uppercase tracking-wide font-medium text-gray-400">
                          {t(lang, 'tempoEta')}
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-highway-600 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>{rcpt.tempoEta}</span>
                        </div>
                      </div>

                      {/* Total Payout */}
                      <div className="text-right sm:text-right">
                        <div className="text-[11px] uppercase tracking-wide font-medium text-gray-400">
                          {lang === 'mr' ? 'एकूण रक्कम' : 'Total Amount'}
                        </div>
                        <div className="text-base sm:text-lg font-black text-agri-700">
                          ₹{rcpt.totalAmount?.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Footer notes */}
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-gray-500">
                      <span className="flex items-center gap-1 text-agri-700 font-medium">
                        <Check className="w-3 h-3 text-agri-600" />
                        {t(lang, 'receiptsSub')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActivePavti(rcpt)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-agri-50 hover:bg-agri-100 text-agri-800 border border-agri-200 font-bold text-xs transition-all cursor-pointer active:scale-95 shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-agri-600" />
                        <span>{t(lang, 'digitalPavti')}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* BOOKING CONFIRMATION MODAL                               */}
      {/* ======================================================== */}
      {showConfirm && confirmedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative text-center space-y-4">
            {/* Dismiss cross button */}
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Checkmark icon badge */}
            <div className="w-16 h-16 rounded-full bg-agri-100 text-agri-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                {t(lang, 'bookingConfirmed')}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {lang === 'mr'
                  ? 'तुमची गाडी बुक झाली आहे. टेम्पो ड्रायव्हर लवकरच संपर्क करेल.'
                  : 'Your pickup has been dispatched. The driver will contact you shortly.'}
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-200/80 space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-gray-500 font-medium">{t(lang, 'receiptId')}</span>
                <span className="font-mono font-bold text-gray-800">
                  {confirmedBooking.id}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">{t(lang, 'selectCrop')}</span>
                <span className="font-bold text-gray-900 flex items-center gap-1.5">
                  <span>{confirmedBooking.crop?.emoji}</span>
                  <span>{confirmedBooking.crop?.name?.[lang] || confirmedBooking.crop?.name?.mr}</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">{t(lang, 'quantity')}</span>
                <span className="font-bold text-gray-900">
                  {confirmedBooking.crates} {t(lang, 'crates')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">{t(lang, 'pickupType')}</span>
                <span className="font-medium text-gray-800">
                  {confirmedBooking.pickupType === 'farmGate'
                    ? t(lang, 'farmGate')
                    : t(lang, 'collectionHub')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">{t(lang, 'villageTaluka')}</span>
                <span className="font-medium text-gray-800">
                  {confirmedBooking.pickupLocation}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">{t(lang, 'tempoEta')}</span>
                <span className="font-bold text-highway-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {confirmedBooking.tempoEta}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-sm">
                <span className="font-semibold text-agri-800">
                  {t(lang, 'estimatedPayout')}
                </span>
                <span className="font-black text-agri-700 text-lg">
                  ₹{confirmedBooking.totalAmount?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* UPI Guarantee Badge */}
            <div className="bg-agri-50 rounded-xl p-2.5 text-xs text-agri-800 font-medium border border-agri-200/80 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-agri-600 shrink-0" />
              <span>{t(lang, 'paid24hr')} — No Hamali • No Dalali</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  setActivePavti(confirmedBooking);
                }}
                className="w-full bg-agri-600 hover:bg-agri-700 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <FileText className="w-4 h-4" />
                <span>
                  {lang === 'mr'
                    ? 'डिजिटल पक्की पावती पहा व प्रिंट करा'
                    : 'View & Print Digital Pakki Pavti'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {lang === 'mr' ? 'मागे जा / ठीक आहे' : 'Done / Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DIGITAL PAKKI PAVTI MODAL (Printable & Downloadable)      */}
      {/* ======================================================== */}
      {activePavti && (
        <DigitalPavtiModal
          booking={activePavti}
          lang={lang}
          onClose={() => setActivePavti(null)}
        />
      )}
    </div>
  );
}
