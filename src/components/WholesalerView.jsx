import React, { useState, useEffect, useCallback } from 'react';
import { t } from '../data/i18n.js';
import { crops, deliveryLocations, deliverySlots } from '../data/crops.js';
import WholesaleInvoiceModal from './WholesaleInvoiceModal.jsx';
import { fetchWholesalerOrders, createWholesalerOrder } from '../services/supabase.js';
import {
  ShoppingCart,
  Plus,
  Minus,
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  Star,
  Zap,
  X,
  FileText,
  Store,
  ArrowRight,
  ShieldCheck,
  Check,
  Scale,
  ClipboardList,
  Search,
  Sparkles,
} from 'lucide-react';

export default function WholesalerView({
  lang = 'mr',
  onCartChange,
  crops: cropsProp,
  activeTab = 'catalog',
  setActiveTab,
  user,
}) {
  const cropsList = cropsProp && cropsProp.length > 0 ? cropsProp : crops;
  const [cart, setCart] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(deliverySlots[0]?.id || '');
  const [selectedLocation, setSelectedLocation] = useState(deliveryLocations[0]?.id || '');
  const [showOrderConfirm, setShowOrderConfirm] = useState(false);
  const [lastOrderId, setLastOrderId] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Requirement-based ordering state
  const [selectedCropId, setSelectedCropId] = useState(cropsList[0]?.id || 'tomato');
  const [reqWeightKg, setReqWeightKg] = useState('100');
  const [reqCrates, setReqCrates] = useState('5');
  const [unitMode, setUnitMode] = useState('kg'); // 'kg' or 'crates'
  const [searchQuery, setSearchQuery] = useState('');
  const [addedToast, setAddedToast] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customCropName, setCustomCropName] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  // Keep selected crop synced if cropsList changes
  useEffect(() => {
    if (cropsList.length > 0 && !selectedCropId) {
      setSelectedCropId(cropsList[0].id);
    }
  }, [cropsList, selectedCropId]);

  // Sync delivery location with user market yard if available
  useEffect(() => {
    if (user?.market_yard) {
      const match = deliveryLocations.find(
        (l) => l.name.mr.includes(user.market_yard) || user.market_yard.includes(l.name.mr)
      );
      if (match) setSelectedLocation(match.id);
    }
  }, [user]);

  // Buyer orders list
  const [buyerOrders, setBuyerOrders] = useState([
    {
      id: 'B2B-FR-1042',
      wholesaler_name: user?.firm_name || 'रमेश्वर ट्रेडिंग कंपनी',
      shop_gala_no: user?.gala_number || 'गाळा क्र. ४२',
      market_yard: user?.market_yard || 'गुलटेकडी — पुणे मार्केट यार्ड',
      crop_name: 'टोमॅटो (30 क्रेट)',
      crates_ordered: 30,
      total_weight_kg: 600,
      total_amount: 19200,
      delivery_status: 'गाळ्यावर पोहोचले (Delivered)',
      created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
  ]);

  const fetchBuyerOrders = useCallback(async () => {
    try {
      const data = await fetchWholesalerOrders({ phone: user?.phone });
      if (data && data.length > 0) {
        const relevant = user?.phone
          ? data.filter(
              (o) =>
                String(o.phone) === String(user.phone) ||
                (user.firm_name && o.wholesaler_name.includes(user.firm_name)) ||
                (user.name && o.wholesaler_name.includes(user.name))
            )
          : data;
        setBuyerOrders(relevant.length > 0 ? relevant : data);
      }
    } catch (e) {
      console.log('Error fetching buyer orders:', e);
    }
  }, [user]);

  useEffect(() => {
    fetchBuyerOrders();
  }, [fetchBuyerOrders]);

  // Cart Helpers — requirement-based with weight support
  const addToCartWithRequirement = () => {
    if (isCustomMode) {
      if (!customCropName.trim()) return;
      let weightKg = 0;
      let qty = 0;
      const crateKg = 20;

      if (unitMode === 'kg') {
        weightKg = Number(reqWeightKg) || 20;
        if (weightKg <= 0) return;
        qty = Math.max(1, Math.ceil(weightKg / crateKg));
      } else {
        qty = Number(reqCrates) || 1;
        if (qty <= 0) return;
        weightKg = qty * crateKg;
      }

      const estCratePrice = 500;
      const customId = `custom_${Date.now()}`;
      setCart((prev) => [
        ...prev,
        {
          cropId: customId,
          customName: customCropName.trim(),
          customEmoji: '🥬',
          customCratePrice: estCratePrice,
          qty,
          weight_kg: weightKg,
          notes: customNotes.trim(),
          isCustom: true,
        },
      ]);
      setAddedToast(`✓ विशेष मागणी: ${customCropName.trim()} (${weightKg} kg • ${qty} क्रेट) कार्टमध्ये जोडले!`);
      setTimeout(() => setAddedToast(''), 3500);
      setCustomCropName('');
      setCustomNotes('');
      setIsCustomMode(false);
      return;
    }

    if (!selectedCropId) return;
    const crop = cropsList.find((c) => c.id === selectedCropId);
    if (!crop) return;

    const crateKg = crop.crateWeightKg || crop.crate_weight_kg || 20;
    let weightKg = 0;
    let qty = 0;

    if (unitMode === 'kg') {
      weightKg = Number(reqWeightKg) || 0;
      if (weightKg <= 0) return;
      qty = Math.max(1, Math.ceil(weightKg / crateKg));
    } else {
      qty = Number(reqCrates) || 0;
      if (qty <= 0) return;
      weightKg = qty * crateKg;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.cropId === selectedCropId);
      if (existing) {
        return prev.map((item) =>
          item.cropId === selectedCropId
            ? { ...item, qty: item.qty + qty, weight_kg: (item.weight_kg || 0) + weightKg }
            : item
        );
      }
      return [...prev, { cropId: selectedCropId, qty, weight_kg: weightKg }];
    });

    const cropName = crop.name[lang] || crop.name.mr || crop.name.en;
    setAddedToast(`✓ ${cropName} (${weightKg} kg • ${qty} क्रेट) कार्टमध्ये जोडले!`);
    setTimeout(() => setAddedToast(''), 3500);
  };

  const addToCart = (cropId) => {
    const crop = cropsList.find((c) => c.id === cropId);
    const crateKg = crop?.crateWeightKg || crop?.crate_weight_kg || 20;
    setCart((prev) => {
      const existing = prev.find((item) => item.cropId === cropId);
      if (existing) {
        return prev.map((item) =>
          item.cropId === cropId ? { ...item, qty: item.qty + 5, weight_kg: (item.weight_kg || 0) + 5 * crateKg } : item
        );
      }
      return [...prev, { cropId, qty: 5, weight_kg: 5 * crateKg }];
    });
  };

  const updateQty = (cropId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cropId === cropId) {
            const newQty = item.qty + delta;
            if (newQty <= 0) return null;
            const crop = cropsList.find((c) => c.id === cropId);
            const crateKg = crop?.crateWeightKg || crop?.crate_weight_kg || 20;
            return { ...item, qty: newQty, weight_kg: newQty * crateKg };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const updateWeightKg = (cropId, newWeightKg) => {
    if (newWeightKg <= 0) return;
    const crop = cropsList.find((c) => c.id === cropId);
    const crateKg = crop?.crateWeightKg || crop?.crate_weight_kg || 20;
    setCart((prev) =>
      prev.map((item) => {
        if (item.cropId === cropId) {
          return { ...item, weight_kg: newWeightKg, qty: Math.ceil(newWeightKg / crateKg) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (cropId) => {
    setCart((prev) => prev.filter((item) => item.cropId !== cropId));
  };

  // Compute totals
  const totalCrates = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalWeightKg = cart.reduce((sum, item) => sum + (item.weight_kg || 0), 0);
  const totalAmount = cart.reduce((sum, item) => {
    if (item.isCustom) {
      return sum + ((item.customCratePrice || 500) * item.qty);
    }
    const crop = cropsList.find((c) => c.id === item.cropId);
    return sum + (crop ? crop.cratePrice * item.qty : 0);
  }, 0);

  // Sync cart state upward
  useEffect(() => {
    if (onCartChange) {
      onCartChange({
        cart,
        selectedSlot,
        selectedLocation,
        totalCrates,
        totalWeightKg,
        totalAmount,
      });
    }
  }, [cart, selectedSlot, selectedLocation, totalCrates, totalWeightKg, totalAmount, onCartChange]);

  const activeSlot = deliverySlots.find((s) => s.id === selectedSlot) || deliverySlots[0];
  const activeLocation = deliveryLocations.find((l) => l.id === selectedLocation) || deliveryLocations[0];

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `B2B-FR-${randomNum}`;
    setLastOrderId(orderId);

    const cropSummary = cart
      .map((item) => {
        if (item.isCustom) {
          return `${item.customName} (${item.qty} क्रेट, ${item.weight_kg} kg)`;
        }
        const c = cropsList.find((cr) => cr.id === item.cropId);
        return `${c?.name[lang] || c?.name.mr || 'पीक'} (${item.qty} क्रेट, ${item.weight_kg || item.qty * 20} kg)`;
      })
      .join(', ');

    const newOrderObj = {
      id: orderId,
      wholesaler_name: user?.firm_name || user?.name || (lang === 'mr' ? 'व्यापारी खरेदीदार' : 'Wholesaler Partner'),
      shop_gala_no: user?.gala_number || (lang === 'mr' ? 'गाळा क्र. १५' : 'Shop Gala #15'),
      market_yard: user?.market_yard || activeLocation?.name[lang] || 'गुलटेकडी — पुणे मार्केट यार्ड',
      crop_name: cropSummary,
      crates_ordered: totalCrates,
      total_weight_kg: totalWeightKg,
      total_amount: totalAmount,
      delivery_status: 'ऑर्डर स्वीकारली (Order Received)',
      created_at: new Date().toISOString(),
    };

    setBuyerOrders((prev) => [newOrderObj, ...prev]);
    setShowOrderConfirm(true);

    // Save directly to Supabase (with localStorage fallback)
    try {
      await createWholesalerOrder({
        id: orderId,
        wholesaler_name: newOrderObj.wholesaler_name,
        shop_gala_no: newOrderObj.shop_gala_no,
        market_yard: newOrderObj.market_yard,
        phone: user?.phone || '9850001234',
        crop_id: cart.length === 1 ? cart[0].cropId : 'mixed',
        crop_name: cropSummary,
        crates_ordered: totalCrates,
        total_weight_kg: totalWeightKg,
        total_amount: totalAmount,
        delivery_slot: activeSlot?.label?.[lang] || activeSlot?.label?.mr || 'पहाटे ४:०० ते ६:०० (Early Morning Express)',
        delivery_status: 'ऑर्डर स्वीकारली (Order Received)',
      });
    } catch (err) {
      console.error('Failed to save wholesaler order:', err);
    }
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Top B2B Banner (Shown on Catalog & Cart) - Commented out
      {(activeTab === 'catalog' || activeTab === 'cart' || !activeTab) && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-highway-600 to-amber-700 text-white p-5 shadow-lg">
          <div className="relative z-10 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-md px-2.5 py-0.5 text-xs font-bold text-white border border-white/20">
                <Zap className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
                FreshRoute B2B Wholesale
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-black/25 px-2.5 py-0.5 text-xs font-semibold text-white">
                <Truck className="h-3 w-3" /> पहाटे थेट गाळ्यावर डिलिव्हरी
              </span>
            </div>

            <h1 className="text-lg sm:text-xl font-black leading-tight text-white">
              {lang === 'mr'
                ? 'शिवार ते मार्केट यार्ड — १००% A-ग्रेड मानकीकृत क्रेट'
                : 'Direct Farm-to-Gala Procurement — 100% Graded Crates'}
            </h1>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-orange-100 font-medium">
              <span className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-lg">
                <Check className="w-3 h-3 text-amber-300" /> २० किलो क्रेट पॅकिंग
              </span>
              <span className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-lg">
                <Check className="w-3 h-3 text-amber-300" /> Zero वजन घट
              </span>
              <span className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-lg">
                <Check className="w-3 h-3 text-amber-300" /> थेट रात्रीच्या वाहनातून
              </span>
            </div>
          </div>
        </div>
      )}
      */}

      {/* ======================================================== */}
      {/* TAB 1: PLACE YOUR REQUIREMENT (तुमची ऑर्डर नोंदवा)       */}
      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* TAB 1: PLACE YOUR REQUIREMENT (तुमची ऑर्डर नोंदवा)       */}
      {/* ======================================================== */}
      {(activeTab === 'catalog' || !activeTab) && (
        <div className="space-y-4">
          {/* Success Toast Notification */}
          {addedToast && (
            <div className="p-3.5 bg-emerald-600 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
                <span>{addedToast}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab && setActiveTab('cart')}
                className="px-2.5 py-1 bg-white text-emerald-800 rounded-lg text-xs font-black hover:bg-emerald-50 transition-colors shrink-0 shadow-xs cursor-pointer"
              >
                {lang === 'mr' ? 'कार्ट पहा →' : 'View Cart →'}
              </button>
            </div>
          )}

          {/* ---- REQUIREMENT FORM ---- */}
          <div className="bg-white border-2 border-orange-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-orange-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-highway-100 text-highway-800 rounded-xl">
                  <ClipboardList className="w-5 h-5 text-highway-600" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-gray-900">
                    {lang === 'mr' ? 'तुमची मागणी व ऑर्डर नोंदवा' : 'Place Your Produce Requirement'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {lang === 'mr'
                      ? 'शेतमाल निवडा, हवे तेवढे वजन (Kg) टाका आणि थेट गाळ्यावर डिलिव्हरी मिळवा'
                      : 'Select crop, enter required weight (Kg), and get direct gala delivery'}
                  </p>
                </div>
              </div>

              {/* Toggle Custom Crop Button */}
              <button
                type="button"
                onClick={() => setIsCustomMode(!isCustomMode)}
                className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  isCustomMode
                    ? 'bg-highway-600 text-white border-highway-600 shadow-xs'
                    : 'bg-orange-50 text-highway-800 border-orange-200 hover:bg-orange-100'
                }`}
              >
                {isCustomMode
                  ? (lang === 'mr' ? '← उपलब्ध यादी' : '← Standard List')
                  : (lang === 'mr' ? '+ इतर शेतमाल' : '+ Custom Crop')}
              </button>
            </div>

            {/* Custom Crop Input Mode */}
            {isCustomMode ? (
              <div className="space-y-3 bg-gradient-to-br from-orange-50 via-amber-50/50 to-orange-50 p-4 rounded-2xl border-2 border-orange-300 shadow-sm animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-highway-900">
                    <Sparkles className="w-4 h-4 text-highway-600 animate-pulse" />
                    <span>{lang === 'mr' ? 'विशेष किंवा इतर शेतमाल मागणी (Custom Order)' : 'Custom / Unlisted Produce Order'}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-200 text-highway-900">
                    {lang === 'mr' ? 'थेट बांधावरून संकलन' : 'Direct Farm Sourcing'}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-800 block mb-1">
                    {lang === 'mr' ? '१. शेतमालाचे नाव टाका:' : '1. Produce Name:'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={customCropName}
                    onChange={(e) => setCustomCropName(e.target.value)}
                    placeholder={lang === 'mr' ? 'उदा. गाजर, शिमला मिरची, आले, लसूण, कोबी...' : 'e.g. Carrot, Capsicum, Ginger, Garlic...'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-highway-400 text-sm font-bold bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-highway-500 shadow-2xs"
                  />
                </div>

                {/* Quick Produce Suggestions */}
                <div>
                  <span className="text-[11px] font-semibold text-gray-500 block mb-1.5">
                    {lang === 'mr' ? 'किंवा खालीलपैकी निवडा:' : 'Or tap a common produce:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { mr: 'गाजर', en: 'Carrot', emoji: '🥕' },
                      { mr: 'शिमला मिरची', en: 'Capsicum', emoji: '🫑' },
                      { mr: 'आले', en: 'Ginger', emoji: '🫚' },
                      { mr: 'लसूण', en: 'Garlic', emoji: '🧄' },
                      { mr: 'कोथिंबीर', en: 'Coriander', emoji: '🌿' },
                      { mr: 'कोबी', en: 'Cabbage', emoji: '🥬' },
                      { mr: 'फुलकोबी', en: 'Cauliflower', emoji: '🥦' },
                      { mr: 'काकडी', en: 'Cucumber', emoji: '🥒' },
                    ].map((sug) => (
                      <button
                        key={sug.en}
                        type="button"
                        onClick={() => setCustomCropName(lang === 'mr' ? sug.mr : sug.en)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer active:scale-95 ${
                          customCropName === (lang === 'mr' ? sug.mr : sug.en)
                            ? 'bg-highway-600 text-white border-highway-600 shadow-xs'
                            : 'bg-white text-gray-700 border-orange-200 hover:bg-orange-100/70'
                        }`}
                      >
                        {sug.emoji} {lang === 'mr' ? sug.mr : sug.en}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Custom Notes */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    {lang === 'mr' ? 'विशिष्ट प्रतवारी / सूचना (ऐच्छिक):' : 'Quality / Packaging Notes (Optional):'}
                  </label>
                  <input
                    type="text"
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder={lang === 'mr' ? 'उदा. कच्चा माल, मध्यम आकार, विशेष पॅकिंग...' : 'e.g. Medium size, raw, specific packing...'}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-highway-500"
                  />
                </div>
              </div>
            ) : (
              /* Standard Crop Selection */
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-highway-600" />
                  <span>{lang === 'mr' ? '१. शेतमाल निवडा:' : '1. Select Produce:'}</span>
                </label>
                {/* Search box */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={lang === 'mr' ? 'शेतमाल शोधा...' : 'Search produce...'}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-highway-500 bg-gray-50"
                  />
                </div>
                {/* Product selection grid */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-h-[170px] overflow-y-auto pr-0.5">
                  {cropsList
                    .filter((c) => {
                      if (!searchQuery.trim()) return true;
                      const q = searchQuery.toLowerCase();
                      return (
                        (c.name.mr && c.name.mr.includes(searchQuery)) ||
                        (c.name.en && c.name.en.toLowerCase().includes(q))
                      );
                    })
                    .map((crop) => {
                      const isSel = selectedCropId === crop.id;
                      const crateKg = crop.crateWeightKg || crop.crate_weight_kg || 20;
                      const perKg = Math.round(crop.cratePrice / crateKg);
                      return (
                        <button
                          key={crop.id}
                          type="button"
                          onClick={() => setSelectedCropId(crop.id)}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer active:scale-95 ${
                            isSel
                              ? 'border-highway-500 bg-highway-50 ring-2 ring-highway-400 shadow-sm'
                              : 'border-gray-200 bg-white hover:border-highway-300 hover:bg-orange-50/40'
                          }`}
                        >
                          <span className="text-2xl block select-none">{crop.emoji}</span>
                          <span className="text-[11px] font-bold text-gray-800 block mt-0.5 leading-tight truncate">
                            {crop.name[lang] || crop.name.en}
                          </span>
                          <span className="text-[10px] text-highway-700 font-semibold block">
                            ₹{perKg}/kg
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Step 2: Weight & Quantity Configuration (ALWAYS VISIBLE) */}
            {(() => {
              const selCrop = cropsList.find((c) => c.id === selectedCropId) || cropsList[0];
              const selCrateKg = selCrop?.crateWeightKg || selCrop?.crate_weight_kg || 20;
              const perKgRate = selCrop ? Math.round(selCrop.cratePrice / selCrateKg) : 32;

              let calcCrates = 0;
              let calcWeight = 0;
              let estAmount = 0;

              if (unitMode === 'kg') {
                calcWeight = Number(reqWeightKg) || 0;
                calcCrates = Math.max(1, Math.ceil(calcWeight / selCrateKg));
                estAmount = isCustomMode ? calcCrates * 500 : calcCrates * (selCrop?.cratePrice || 640);
              } else {
                calcCrates = Number(reqCrates) || 0;
                calcWeight = calcCrates * selCrateKg;
                estAmount = isCustomMode ? calcCrates * 500 : calcCrates * (selCrop?.cratePrice || 640);
              }

              return (
                <div className="space-y-3.5 pt-3 border-t border-orange-100">
                  {/* Selected Crop Header Banner */}
                  {!isCustomMode && selCrop && (
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-orange-50/80 border border-orange-200">
                      <div className="flex items-center gap-2.5">
                        <span className="text-3xl select-none">{selCrop.emoji}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                              {selCrop.name[lang] || selCrop.name.en}
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              A-Grade
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 font-medium">
                            <span className="font-bold text-highway-700">₹{perKgRate}/kg</span> • ₹{selCrop.cratePrice}/क्रेट ({selCrateKg}kg क्रेट)
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-gray-700 bg-white px-2.5 py-1 rounded-xl border border-orange-200 shadow-2xs">
                        {selCrop.available} क्रेट स्टॉक
                      </span>
                    </div>
                  )}

                  {isCustomMode && (
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-orange-100/90 to-amber-100/90 border border-orange-300">
                      <div className="flex items-center gap-2.5">
                        <span className="text-3xl select-none">🥬</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-gray-900 text-sm sm:text-base">
                              {customCropName.trim() || (lang === 'mr' ? 'विशेष शेतमाल मागणी' : 'Custom Produce')}
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-200 text-highway-900 border border-orange-300">
                              {lang === 'mr' ? 'विशेष मागणी' : 'Custom Request'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-700 font-medium">
                            {lang === 'mr' ? 'अंदाजे दर: ₹२५/kg (₹५००/क्रेट • २०kg क्रेट)' : 'Est. rate: ₹25/kg (₹500/crate • 20kg crate)'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-highway-900 bg-white px-2.5 py-1 rounded-xl border border-orange-300 shadow-2xs">
                        {lang === 'mr' ? 'थेट खरेदी' : 'On-Demand'}
                      </span>
                    </div>
                  )}

                  {/* Quantity & Weight Header + Unit Mode Toggle */}
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-highway-600" />
                      <span>{lang === 'mr' ? '२. मालाचे वजन / प्रमाण टाका:' : '2. Enter Weight / Quantity:'}</span>
                    </label>

                    {/* Mode Toggle */}
                    <div className="flex bg-gray-100 p-0.5 rounded-xl border border-gray-200">
                      <button
                        type="button"
                        onClick={() => {
                          setUnitMode('kg');
                          if (!reqWeightKg) setReqWeightKg('100');
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          unitMode === 'kg'
                            ? 'bg-highway-600 text-white shadow-xs'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        ⚖️ वजन (Kg)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUnitMode('crates');
                          if (!reqCrates) setReqCrates('5');
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          unitMode === 'crates'
                            ? 'bg-highway-600 text-white shadow-xs'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        📦 क्रेट (Crates)
                      </button>
                    </div>
                  </div>

                  {/* Weight / Crate Input Field */}
                  {unitMode === 'kg' ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <input
                          type="number"
                          value={reqWeightKg}
                          onChange={(e) => setReqWeightKg(e.target.value)}
                          placeholder={lang === 'mr' ? 'वजन किलोमध्ये टाका (उदा. १००)' : 'Enter weight in Kg (e.g. 100)'}
                          min="1"
                          className="w-full h-12 px-4 rounded-xl border-2 border-highway-400 text-base font-bold focus:outline-none focus:ring-2 focus:ring-highway-500 bg-white pr-16 text-gray-900 shadow-2xs"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-highway-700 bg-orange-50 px-2 py-0.5 rounded-md">
                          Kg
                        </span>
                      </div>

                      {/* Quick Weight Preset Buttons */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[11px] font-semibold text-gray-500">जलद वजन:</span>
                        {[20, 50, 100, 200, 500, 1000].map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => setReqWeightKg(String(w))}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer active:scale-95 ${
                              reqWeightKg === String(w)
                                ? 'bg-highway-600 text-white border-highway-600 shadow-xs'
                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-orange-50 hover:border-highway-300'
                            }`}
                          >
                            {w >= 1000 ? `${w / 1000} टन` : `${w} kg`}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <input
                          type="number"
                          value={reqCrates}
                          onChange={(e) => setReqCrates(e.target.value)}
                          placeholder={lang === 'mr' ? 'क्रेट संख्या टाका (उदा. ५)' : 'Enter crate count (e.g. 5)'}
                          min="1"
                          className="w-full h-12 px-4 rounded-xl border-2 border-highway-400 text-base font-bold focus:outline-none focus:ring-2 focus:ring-highway-500 bg-white pr-20 text-gray-900 shadow-2xs"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-highway-700 bg-orange-50 px-2 py-0.5 rounded-md">
                          क्रेट
                        </span>
                      </div>

                      {/* Quick Crate Preset Buttons */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[11px] font-semibold text-gray-500">जलद क्रेट:</span>
                        {[1, 5, 10, 15, 25, 50].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setReqCrates(String(c))}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer active:scale-95 ${
                              reqCrates === String(c)
                                ? 'bg-highway-600 text-white border-highway-600 shadow-xs'
                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-orange-50 hover:border-highway-300'
                            }`}
                          >
                            {c} क्रेट
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Live Calculation Preview Callout */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                    <div>
                      <span className="font-bold text-emerald-900 block sm:inline">
                        ≈ {calcCrates} क्रेट • {calcWeight} kg एकूण वजन
                      </span>
                      <span className="text-emerald-700 text-[11px] block mt-0.5">
                        ({selCrateKg} kg / क्रेट मानकीकृत प्रतवारी)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500 text-[10px] block font-medium">अंदाजे रक्कम:</span>
                      <span className="text-sm sm:text-base font-black text-emerald-900">
                        ₹{estAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    type="button"
                    onClick={addToCartWithRequirement}
                    disabled={
                      isCustomMode
                        ? !customCropName.trim()
                        : (unitMode === 'kg' ? !(Number(reqWeightKg) > 0) : !(Number(reqCrates) > 0))
                    }
                    className="w-full py-3.5 px-4 rounded-2xl bg-highway-600 hover:bg-highway-700 active:scale-[0.99] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-highway-600/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                    <span>
                      {isCustomMode
                        ? (lang === 'mr' ? 'विशेष मागणी कार्टमध्ये जोडा' : 'Add Custom Produce to Cart')
                        : (lang === 'mr' ? `ऑर्डर कार्टमध्ये जोडा (${calcWeight} kg • ${calcCrates} क्रेट)` : `Add to Cart (${calcWeight} kg • ${calcCrates} Crates)`)}
                    </span>
                  </button>
                </div>
              );
            })()}
          </div>

          {/* ---- QUICK BROWSE CATALOG: Available Stock Cards ---- */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Package className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">
                    {lang === 'mr' ? 'आजचा उपलब्ध स्टॉक (A-Grade)' : 'Available Graded Stock'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {lang === 'mr'
                      ? 'थेट क्रेट किंवा वजनाने निवडा आणि लगेच ऑर्डर करा'
                      : 'Select by crates or exact weight for immediate order'}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-highway-700 bg-highway-50 px-2.5 py-1 rounded-lg border border-highway-200">
                {cropsList.length} पिके
              </span>
            </div>

            {/* Grid of crop cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {cropsList.map((crop) => {
                const inCartItem = cart.find((item) => item.cropId === crop.id);
                const inCartQty = inCartItem ? inCartItem.qty : 0;
                const inCartWeight = inCartItem ? inCartItem.weight_kg || 0 : 0;
                const crateKg = crop.crateWeightKg || crop.crate_weight_kg || 20;
                const wholesalePerKg = Math.round(crop.cratePrice / crateKg);

                return (
                  <div
                    key={crop.id}
                    className={`rounded-2xl border p-3 sm:p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-md bg-white ${
                      selectedCropId === crop.id ? 'border-highway-500 ring-2 ring-highway-300 shadow-sm' : 'border-orange-100'
                    } shadow-2xs`}
                  >
                    <div>
                      {/* Header: Emoji + A-Grade Badge */}
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <span className="text-3xl select-none" role="img" aria-label={crop.name.en}>
                          {crop.emoji}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {t(lang, 'gradeA')}
                        </span>
                      </div>

                      {/* Crop Name */}
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">
                        {crop.name[lang] || crop.name.en}
                      </h3>

                      {/* Wholesaler B2B Price - NEVER shows farmer rate */}
                      <div className="mt-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg sm:text-xl font-black text-gray-900">
                            ₹{crop.cratePrice.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-gray-600 font-medium">/ क्रेट</span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium">
                          (₹{wholesalePerKg} / kg • {crateKg}kg क्रेट)
                        </p>
                      </div>

                      {/* Available Crates + Weight info */}
                      <div className="mt-2 flex items-center justify-between text-[11px] bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-200/60">
                        <span className="text-gray-500 font-medium">{t(lang, 'available')}:</span>
                        <span className="font-bold text-gray-900">
                          {crop.available} क्रेट ({(crop.available * crateKg).toLocaleString('en-IN')} kg)
                        </span>
                      </div>

                      {/* Show in-cart weight badge if added */}
                      {inCartQty > 0 && (
                        <div className="mt-1.5 flex items-center justify-between text-[11px] bg-highway-50 px-2 py-1.5 rounded-lg border border-highway-200">
                          <span className="text-highway-700 font-bold flex items-center gap-1">
                            <Scale className="w-3 h-3" /> कार्ट:
                          </span>
                          <span className="font-extrabold text-highway-900">
                            {inCartQty} क्रेट • {inCartWeight} kg
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quick Add with Weight Buttons */}
                    <div className="mt-3 pt-2 border-t border-slate-100 space-y-1.5">
                      {inCartQty === 0 ? (
                        <>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const addKg = crateKg;
                                setCart((prev) => [...prev, { cropId: crop.id, qty: 1, weight_kg: addKg }]);
                                setAddedToast(`✓ ${crop.name[lang] || crop.name.en} (+${addKg}kg) जोडले!`);
                                setTimeout(() => setAddedToast(''), 3000);
                              }}
                              className="py-1.5 px-1 bg-orange-50 hover:bg-orange-100 text-highway-800 border border-orange-200 rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer active:scale-95"
                            >
                              +{crateKg} kg
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const addKg = crateKg * 5;
                                setCart((prev) => [...prev, { cropId: crop.id, qty: 5, weight_kg: addKg }]);
                                setAddedToast(`✓ ${crop.name[lang] || crop.name.en} (+${addKg}kg) जोडले!`);
                                setTimeout(() => setAddedToast(''), 3000);
                              }}
                              className="py-1.5 px-1 bg-highway-600 hover:bg-highway-700 text-white rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer active:scale-95 shadow-2xs"
                            >
                              +{crateKg * 5} kg
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCropId(crop.id);
                              setIsCustomMode(false);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="w-full py-1.5 px-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-[10px] font-semibold text-center cursor-pointer transition-colors"
                          >
                            ✏️ {lang === 'mr' ? 'वजन / मागणी बदला' : 'Customize Weight'}
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center justify-between bg-orange-50 rounded-xl p-1 border border-orange-200">
                          <button
                            type="button"
                            onClick={() => updateQty(crop.id, -1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-gray-700 font-bold active:scale-95 shadow-2xs cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-black text-highway-900 px-1 text-center">
                            {inCartQty} क्रेट • {inCartWeight}kg
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(crop.id, 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-highway-600 text-white font-bold active:scale-95 shadow-2xs cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sticky Quick Cart Button if items exist */}
          {cart.length > 0 && (
            <div className="sticky bottom-20 z-30 p-1">
              <button
                type="button"
                onClick={() => setActiveTab && setActiveTab('cart')}
                className="w-full py-3.5 px-4 rounded-2xl bg-highway-600 hover:bg-highway-700 active:scale-[0.99] text-white font-extrabold text-sm flex items-center justify-between shadow-xl shadow-highway-600/30 cursor-pointer animate-in fade-in"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>{totalCrates} क्रेट • {totalWeightKg} kg ({cart.length} शेतमाल)</span>
                </div>
                <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-xl">
                  <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CART & PRE-ORDER CHECKOUT (कार्ट व बुकिंग)         */}
      {/* ======================================================== */}
      {activeTab === 'cart' && (
        <div className="space-y-4">
          <div className="bg-white border border-orange-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-orange-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-highway-100 text-highway-700 rounded-xl">
                  <ShoppingCart className="w-5 h-5 text-highway-600" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">
                    {t(lang, 'yourCart')}
                  </h2>
                  <span className="text-xs text-gray-500 font-medium">
                    {cart.length > 0
                      ? `${cart.length} प्रकारचे पीक • ${totalCrates} क्रेट • ${totalWeightKg} kg`
                      : t(lang, 'cartEmpty')}
                  </span>
                </div>
              </div>

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="text-xs font-semibold text-red-500 hover:underline"
                >
                  रिकामी करा
                </button>
              )}
            </div>

            {/* Empty state */}
            {cart.length === 0 ? (
              <div className="text-center py-12 px-4 bg-orange-50/40 rounded-2xl border border-dashed border-orange-200">
                <Package className="w-10 h-10 text-orange-300 mx-auto mb-2" />
                <p className="text-gray-800 font-bold text-sm">
                  {t(lang, 'cartEmpty')}
                </p>
                <p className="text-xs text-gray-500 mt-1 max-w-[240px] mx-auto mb-4">
                  {lang === 'mr'
                    ? 'आजच्या उपलब्ध स्टॉक यादीतून शेतमालाचे क्रेट निवडा'
                    : 'Select graded crates from the catalog to place your pre-order'}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab && setActiveTab('catalog')}
                  className="px-4 py-2.5 bg-highway-600 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  📦 आजचा स्टॉक पहा (Browse Catalog)
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Cart Items List */}
                <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-0.5">
                  {cart.map((item) => {
                    const crop = item.isCustom
                      ? { name: { mr: item.customName, en: item.customName }, emoji: '🥬', cratePrice: item.customCratePrice || 500 }
                      : cropsList.find((c) => c.id === item.cropId);
                    if (!crop) return null;
                    const subtotal = (crop.cratePrice || 500) * item.qty;

                    return (
                      <div
                        key={item.cropId}
                        className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-2xl select-none">{crop.emoji}</span>
                            <div className="truncate">
                              <h4 className="font-bold text-gray-900 text-xs sm:text-sm truncate flex items-center gap-1.5">
                                {crop.name[lang] || crop.name.en}
                                {item.isCustom && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-orange-100 text-highway-800 border border-orange-200">
                                    {lang === 'mr' ? 'विशेष मागणी' : 'Custom'}
                                  </span>
                                )}
                              </h4>
                              <p className="text-[11px] text-gray-500">
                                ₹{crop.cratePrice} × {item.qty} क्रेट ={' '}
                                <span className="font-bold text-gray-900">
                                  ₹{subtotal.toLocaleString('en-IN')}
                                </span>
                              </p>
                              {item.notes && (
                                <p className="text-[10px] text-highway-700 italic truncate max-w-[200px]">
                                  📝 {item.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.cropId)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg cursor-pointer shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Weight & Crate Controls */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Weight display/edit */}
                          <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200 flex-1 min-w-[120px]">
                            <Scale className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <input
                              type="number"
                              value={item.weight_kg || ''}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                if (val > 0) updateWeightKg(item.cropId, val);
                              }}
                              className="w-full bg-transparent text-xs font-bold text-amber-900 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              min="1"
                            />
                            <span className="text-[10px] font-semibold text-amber-700 shrink-0">kg</span>
                          </div>

                          {/* Crate +/- controls */}
                          <div className="flex items-center bg-white rounded-lg p-0.5 border border-gray-200 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => updateQty(item.cropId, -1)}
                              className="w-7 h-7 flex items-center justify-center rounded text-gray-700 active:scale-95 cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-12 text-center text-xs font-bold text-gray-900">
                              {item.qty} क्रेट
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQty(item.cropId, 1)}
                              className="w-7 h-7 flex items-center justify-center rounded text-gray-700 active:scale-95 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Wholesaler Gala Auto-Details */}
                <div className="bg-orange-50/80 rounded-2xl p-3.5 border border-orange-200 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-highway-900">
                    <span className="flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-highway-600" />
                      <span>{user?.firm_name || 'व्यापारी पेढी'}</span>
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded-md border border-orange-200">
                      {user?.gala_number || 'गाळा क्र. १५'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>मार्केट यार्ड:</span>
                    <span className="font-semibold text-gray-800">{user?.market_yard || 'गुलटेकडी पुणे'}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>थेट डिलिव्हरी वेळ:</span>
                    <span className="font-bold text-highway-700">पहाटे ४:०० ते ६:०० वाजेपर्यंत थेट गाळ्यावर</span>
                  </div>
                </div>

                {/* Total Summary */}
                <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-300 block font-medium">एकूण देय रक्कम (Total):</span>
                    <span className="text-[11px] text-slate-400">{totalCrates} क्रेट • {totalWeightKg} kg • GST/उपकर समाविष्ट</span>
                  </div>
                  <span className="text-2xl font-black text-highway-400">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Order Button */}
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  className="w-full py-4 px-6 rounded-2xl bg-highway-600 hover:bg-highway-700 active:scale-[0.99] text-white font-extrabold text-base shadow-lg shadow-highway-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Truck className="w-5 h-5" />
                  <span>{t(lang, 'placeOrder')} (ऑर्डर कन्फर्म करा)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: MY ORDERS & INVOICES (माझ्या ऑर्डर्स)              */}
      {/* ======================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-highway-100 text-highway-800 rounded-xl">
                <Truck className="w-5 h-5 text-highway-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  {lang === 'mr' ? 'माझ्या ऑर्डर्स व डिलिव्हरी ट्रॅकिंग' : 'My Orders & Deliveries'}
                </h2>
                <p className="text-xs text-gray-500">
                  {lang === 'mr' ? 'रात्रीच्या हायवे एक्सप्रेस ट्रकचे थेट ट्रॅकिंग' : 'Overnight highway cold-chain tracker'}
                </p>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-3">
            {buyerOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200/90 space-y-3.5"
              >
                {/* Order Meta Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div>
                    <span className="font-mono text-xs font-bold text-gray-800 block">
                      #{ord.id}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {ord.created_at ? new Date(ord.created_at).toLocaleDateString() : 'Today'}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{ord.delivery_status || 'Delivered'}</span>
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400 block font-medium">मालाचा तपशील:</span>
                    <span className="font-bold text-gray-900 text-sm">{ord.crop_name || 'शेतमाल'}</span>
                    <span className="text-[11px] text-gray-500 block">{ord.crates_ordered} क्रेट (20kg Crates)</span>
                  </div>

                  <div className="text-right">
                    <span className="text-gray-400 block font-medium">एकूण बिल:</span>
                    <span className="text-base font-black text-highway-600">
                      ₹{ord.total_amount?.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-gray-500 block">{ord.shop_gala_no}</span>
                  </div>
                </div>

                {/* Live Overnight Highway Truck Tracker Bar */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-700">
                    <span className="flex items-center gap-1 text-highway-700">
                      <Truck className="w-3.5 h-3.5" /> एक्सप्रेस ट्रक: MH-14-GH-8291
                    </span>
                    <span className="text-emerald-700">पहाटे ४:३० ETA</span>
                  </div>

                  {/* 4 Stage Progress Bar */}
                  <div className="relative pt-1">
                    <div className="flex mb-1 items-center justify-between text-[10px] text-gray-500 font-semibold">
                      <span>ऑर्डर प्राप्त ✓</span>
                      <span>हायवे लोड ✓</span>
                      <span>रवाना ✓</span>
                      <span className="text-emerald-700 font-bold">गाळा अनलोड</span>
                    </div>
                    <div className="overflow-hidden h-2 text-xs flex rounded-full bg-slate-200">
                      <div className="w-3/4 shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-highway-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Action button: View/Download Invoice */}
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 font-medium">
                    {ord.market_yard}
                  </span>

                  <button
                    type="button"
                    onClick={() => setSelectedInvoice(ord)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-highway-50 hover:bg-highway-100 text-highway-800 border border-highway-200 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
                  >
                    <FileText className="w-3.5 h-3.5 text-highway-600" />
                    <span>होलसेल बिल / इनव्हॉइस (Invoice)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Confirmation Modal */}
      {showOrderConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100 overflow-hidden text-center space-y-4">
            <button
              type="button"
              onClick={() => setShowOrderConfirm(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-gray-900">
                {t(lang, 'orderPlaced')}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                ऑर्डर क्रमांक <span className="font-mono font-bold text-gray-800">#{lastOrderId}</span> गाळ्यासाठी पक्की झाली आहे!
              </p>
            </div>

            <div className="bg-orange-50 rounded-2xl p-4 text-xs text-left space-y-2 border border-orange-200">
              <div className="flex justify-between">
                <span className="text-gray-500">डिलिव्हरी स्लॉट:</span>
                <span className="font-bold text-gray-900">पहाटे ४:०० ते ६:०० AM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">गाळा क्र.:</span>
                <span className="font-bold text-gray-900">{user?.gala_number || 'गाळा क्र. १५'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">एकूण प्रमाण व वजन:</span>
                <span className="font-bold text-gray-900">{totalCrates} क्रेट • {totalWeightKg} kg</span>
              </div>
              <div className="flex justify-between border-t border-orange-200 pt-2 font-bold text-sm">
                <span>एकूण रक्कम:</span>
                <span className="text-highway-600">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowOrderConfirm(false);
                  setCart([]);
                  if (setActiveTab) setActiveTab('orders');
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-highway-600 hover:bg-highway-700 active:scale-95 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                🚛 माझ्या ऑर्डर्स व ट्रक ट्रॅकिंग पहा
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowOrderConfirm(false);
                  setCart([]);
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
              >
                नवीन ऑर्डर करा (New Order)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Wholesale Tax Invoice Modal */}
      {selectedInvoice && (
        <WholesaleInvoiceModal
          order={selectedInvoice}
          lang={lang}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}
