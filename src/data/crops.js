// ============================================================
// crops.js — Crop catalog with realistic Maharashtra pricing
// ============================================================

export const crops = [
  {
    id: 'tomato',
    emoji: '🍅',
    name: { mr: 'टोमॅटो', en: 'Tomato' },
    pricePerKg: 32,
    cratePrice: 640,     // 20kg crate
    localMandiPrice: 28, // comparison baseline
    unit: 'kg',
    color: 'bg-red-50 border-red-200',
    iconColor: 'text-red-600',
    available: 450,      // crates available for wholesaler
  },
  {
    id: 'onion',
    emoji: '🧅',
    name: { mr: 'कांदा', en: 'Onion' },
    pricePerKg: 22,
    cratePrice: 440,
    localMandiPrice: 18,
    unit: 'kg',
    color: 'bg-purple-50 border-purple-200',
    iconColor: 'text-purple-600',
    available: 620,
  },
  {
    id: 'greenchilli',
    emoji: '🌶️',
    name: { mr: 'हिरवी मिरची', en: 'Green Chilli' },
    pricePerKg: 55,
    cratePrice: 1100,
    localMandiPrice: 48,
    unit: 'kg',
    color: 'bg-green-50 border-green-200',
    iconColor: 'text-green-600',
    available: 180,
  },
  {
    id: 'okra',
    emoji: '🥒',
    name: { mr: 'भेंडी', en: 'Okra (Bhendi)' },
    pricePerKg: 40,
    cratePrice: 800,
    localMandiPrice: 35,
    unit: 'kg',
    color: 'bg-lime-50 border-lime-200',
    iconColor: 'text-lime-600',
    available: 240,
  },
  {
    id: 'pomegranate',
    emoji: '🫐',
    name: { mr: 'डाळिंब', en: 'Pomegranate' },
    pricePerKg: 120,
    cratePrice: 2400,
    localMandiPrice: 105,
    unit: 'kg',
    color: 'bg-rose-50 border-rose-200',
    iconColor: 'text-rose-600',
    available: 90,
  },
  {
    id: 'palak',
    emoji: '🥬',
    name: { mr: 'पालक', en: 'Spinach (Palak)' },
    pricePerKg: 25,
    cratePrice: 500,
    localMandiPrice: 20,
    unit: 'kg',
    color: 'bg-emerald-50 border-emerald-200',
    iconColor: 'text-emerald-600',
    available: 310,
  },
];

export const locations = [
  { id: 'junnar', name: { mr: 'जुन्नर', en: 'Junnar' } },
  { id: 'manchar', name: { mr: 'मंचर', en: 'Manchar' } },
  { id: 'narayangaon', name: { mr: 'नारायणगाव', en: 'Narayangaon' } },
  { id: 'saswad', name: { mr: 'सासवड', en: 'Saswad' } },
  { id: 'baramati', name: { mr: 'बारामती', en: 'Baramati' } },
  { id: 'niphad', name: { mr: 'निफाड', en: 'Niphad' } },
  { id: 'sinnar', name: { mr: 'सिन्नर', en: 'Sinnar' } },
  { id: 'igatpuri', name: { mr: 'इगतपुरी', en: 'Igatpuri' } },
];

export const deliveryLocations = [
  { id: 'gultekdi', name: { mr: 'गुलटेकडी — पुणे मार्केट यार्ड', en: 'Gultekdi — Pune Market Yard' } },
  { id: 'vashi', name: { mr: 'वाशी — नवी मुंबई APMC', en: 'Vashi — Navi Mumbai APMC' } },
  { id: 'pimpri', name: { mr: 'पिंपरी — PCMC मार्केट', en: 'Pimpri — PCMC Market' } },
];

export const deliverySlots = [
  { id: 'early', label: { mr: 'पहाटे ४:०० — ६:०० AM', en: '4:00 AM — 6:00 AM (Early)' } },
  { id: 'morning', label: { mr: 'सकाळी ६:०० — ८:०० AM', en: '6:00 AM — 8:00 AM (Morning)' } },
];

// Generate sample receipt data
export function generateSampleReceipts() {
  return [
    {
      id: 'FR-2026-10-14-0047',
      farmerName: 'ज्ञानेश्वर तुकाराम बोराडे',
      crop: crops[0], // Tomato
      crates: 15,
      bookedQty: 15,
      unit: 'crates',
      totalAmount: 9600,
      status: 'paid',
      tempoEta: '45 min',
      date: '14 Oct 2026',
      pickupLocation: 'Narayangaon',
      pickupType: 'farmGate',
    },
    {
      id: 'FR-2026-10-13-0031',
      farmerName: 'ज्ञानेश्वर तुकाराम बोराडे',
      crop: crops[1], // Onion
      crates: 25,
      bookedQty: 25,
      unit: 'crates',
      totalAmount: 11000,
      status: 'paid',
      tempoEta: 'Delivered',
      date: '13 Oct 2026',
      pickupLocation: 'Junnar',
      pickupType: 'farmGate',
    },
    {
      id: 'FR-2026-10-14-0052',
      farmerName: 'ज्ञानेश्वर तुकाराम बोराडे',
      crop: crops[2], // Green Chilli
      crates: 8,
      bookedQty: 8,
      unit: 'crates',
      totalAmount: 8800,
      status: 'processing',
      tempoEta: '2 hr 15 min',
      date: '14 Oct 2026',
      pickupLocation: 'Baramati',
      pickupType: 'collectionHub',
    },
  ];
}
