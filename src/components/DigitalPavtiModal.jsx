import { useState } from 'react';
import {
  Printer,
  Download,
  Share2,
  X,
  CheckCircle2,
  ShieldCheck,
  Truck,
  MapPin,
  Calendar,
  Clock,
  IndianRupee,
  Sparkles,
  QrCode,
  FileCheck2,
  UserCheck
} from 'lucide-react';
import { t } from '../data/i18n.js';

export default function DigitalPavtiModal({ booking, lang = 'mr', onClose }) {
  if (!booking) return null;

  const [copied, setCopied] = useState(false);

  // Exact calculations
  const crop = booking.crop;
  const isCrates = booking.unit === 'crates';
  const quantity = booking.bookedQty || booking.crates || 1;
  const netWeightKg = isCrates ? quantity * 20 : quantity * 100;
  const totalCratesEquivalent = isCrates ? quantity : quantity * 5;
  const ratePerKg = crop?.pricePerKg || 30;
  const grossAmount = booking.totalAmount || (netWeightKg * ratePerKg);
  const totalAmount = grossAmount; // ₹0 deductions!

  // Format currency
  const formatInr = (num) =>
    Number(num || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Handle browser print
  const handlePrint = () => {
    window.print();
  };

  // Handle receipt download as text slip
  const handleDownloadSlip = () => {
    const slipText = `
======================================================
         आपली मंडी (Aapli Mandi)
     Powered by FreshRoute Agri Logistics
        डिजिटल पक्की पावती / Digital Pavti
======================================================
पावती क्र. / Receipt No: ${booking.id}
तारीख / Date: ${booking.date || new Date().toLocaleDateString()}
शेतकऱ्याचे नाव / Farmer: ${booking.farmerName || 'ज्ञानेश्वर तुकाराम बोराडे'}
गाव / संकलन केंद्र / Village: ${booking.pickupLocation}
पिकअप प्रकार / Pickup Mode: ${booking.pickupType === 'farmGate' ? 'थेट बांधावरून (Farm Gate)' : 'गाव संकलन केंद्र (Village Hub)'}

------------------------------------------------------
शेतमाल व प्रतवारी / Produce Details:
------------------------------------------------------
पीक / Crop: ${crop?.name?.[lang] || crop?.name?.mr} (${crop?.emoji})
प्रतवारी / Quality: A-Grade Crate (१००% प्रतवारी केलेला माल)
संख्या / Quantity: ${quantity} ${isCrates ? 'प्लास्टिक क्रेट (20 Kg)' : 'क्विंटल (100 Kg)'}
एकूण अचूक वजन / Net Weight: ${netWeightKg.toFixed(2)} Kg
हमी खरेदी भाव / Guaranteed Rate: ₹${ratePerKg.toFixed(2)} / Kg (₹${crop?.cratePrice} / 20Kg Crate)

------------------------------------------------------
कपात तपशील / Zero Deductions:
------------------------------------------------------
एकूण कच्ची रक्कम (Gross): ₹${formatInr(grossAmount)}
हमाली खर्च (Hamali): ₹0.00 (माफ / Free)
दलाली / अडत (Commission): ₹0.00 (0% Commission)
वजन काटा खर्च (Weighing): ₹0.00 (मोफत)
गाडी भाडे (Milk-Run Transport): ₹0.00 (मोफत बांधावरून)
एकूण कपात (Total Deductions): ₹0.00 (ZERO)

======================================================
एकूण UPI जमा रक्कम (Net Payout): ₹${formatInr(totalAmount)}
======================================================
पेमेंट हमी: 24 तासांत थेट बँक खात्यात UPI द्वारे जमा
स्टेटस: Verified DBT Transfer Queue (Zero Hidden Cuts)
अधिकृत स्वाक्षरी: FreshRoute Quality & Weighbridge Certified
======================================================
    `.trim();

    const blob = new Blob([slipText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Pakki-Pavti-${booking.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle WhatsApp Share
  const handleShare = () => {
    const text = `🌿 *आपली मंडी - डिजिटल पक्की पावती*\n\nपावती क्र.: ${booking.id}\nशेतकरी: ${booking.farmerName || 'ज्ञानेश्वर तुकाराम बोराडे'}\nगाव: ${booking.pickupLocation}\nपीक: ${crop?.name?.[lang] || crop?.name?.mr} (A-Grade)\nवजन: ${netWeightKg} Kg (${quantity} ${isCrates ? 'क्रेट' : 'क्विंटल'})\nहमी भाव: ₹${ratePerKg}/Kg\nकपात: ₹0 (No हमाली / No दलाली)\n*एकूण UPI रक्कम: ₹${formatInr(totalAmount)}*\n\nFreshRoute द्वारे २४ तासांत थेट खात्यात जमा!`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl my-auto bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Floating Screen Actions Bar (hidden in print) */}
        <div className="no-print bg-slate-900 text-white px-4 sm:px-6 py-3 flex items-center justify-between gap-2 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-agri-400">
            <ShieldCheck className="w-4 h-4 text-agri-400 shrink-0" />
            <span className="hidden xs:inline">
              {lang === 'mr' ? 'अधिकृत डिजिटल पक्की पावती' : 'Official Digital Pakki Pavti'}
            </span>
            <span className="xs:hidden">पावती</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-agri-600 hover:bg-agri-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer"
              title="Print Voucher"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'प्रिंट / PDF' : 'Print / PDF'}</span>
            </button>

            <button
              onClick={handleDownloadSlip}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition-all cursor-pointer"
              title="Download Text Slip"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'mr' ? 'डाऊनलोड' : 'Download'}</span>
            </button>

            <button
              onClick={handleShare}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-medium transition-all cursor-pointer"
              title="Share on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Pavti Sheet */}
        <div className="overflow-y-auto p-4 sm:p-7 space-y-5 bg-white text-gray-900" id="printable-pavti-modal">
          {/* Header of Voucher */}
          <div className="border-b-2 border-agri-600 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              {/* Brand and Seal */}
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-agri-700 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
                  🌿
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-agri-800 tracking-tight leading-none">
                      आपली मंडी (Aapli Mandi)
                    </h2>
                    <span className="bg-agri-100 text-agri-800 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full border border-agri-300">
                      ISO 9001:2026
                    </span>
                  </div>
                  <p className="text-xs text-highway-600 font-bold mt-1 tracking-wide">
                    Powered by FreshRoute Agri Logistics Pvt. Ltd.
                  </p>
                  <p className="text-[11px] text-gray-500">
                    महाराष्ट्र शासन कृषी पणन मंडळ नोंदणीकृत थेट शेतमाल संकलन प्रणाली
                  </p>
                </div>
              </div>

              {/* Pavti Badge & Voucher ID */}
              <div className="sm:text-right flex sm:flex-col justify-between items-start sm:items-end border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                <div className="inline-block bg-agri-50 border border-agri-300 text-agri-900 px-3 py-1 rounded-xl text-xs font-extrabold uppercase tracking-wide">
                  {lang === 'mr' ? 'पक्की पावती' : 'Tax & Purchase Invoice'}
                </div>
                <div className="font-mono text-xs font-bold text-gray-700 mt-1">
                  <span className="text-gray-400">{t(lang, 'receiptVoucherNo')}: </span>
                  <span className="text-gray-900 font-extrabold">{booking.id}</span>
                </div>
                <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span>{booking.date || '14 Oct 2026'} • </span>
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span>08:45 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Farmer & Location Two-Column Info Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm">
            {/* Farmer Info */}
            <div className="space-y-1.5">
              <div className="text-[11px] uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-agri-600" />
                <span>{t(lang, 'farmerNameLabel')}</span>
              </div>
              <div className="font-extrabold text-gray-900 text-sm sm:text-base">
                {booking.farmerName || (lang === 'mr' ? 'ज्ञानेश्वर तुकाराम बोराडे' : 'Dnyaneshwar T. Borade')}
              </div>
              <div className="text-gray-600 text-xs">
                {t(lang, 'farmerMobileLabel')}: <span className="font-mono font-semibold">+91 98224 81092</span>
              </div>
              <div className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>UPI ID: <span className="font-mono font-semibold">borade.patil@oksbi</span> (KYC Verified ✓)</span>
              </div>
            </div>

            {/* Hub / Pickup Info */}
            <div className="space-y-1.5 sm:border-l sm:border-slate-200 sm:pl-4">
              <div className="text-[11px] uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-highway-600" />
                <span>{t(lang, 'farmerVillageLabel')}</span>
              </div>
              <div className="font-extrabold text-gray-900 text-sm sm:text-base">
                {booking.pickupLocation} (पुणे विभाग)
              </div>
              <div className="text-gray-600 text-xs">
                {t(lang, 'pickupType')}:{' '}
                <span className="font-semibold text-gray-800">
                  {booking.pickupType === 'farmGate'
                    ? (lang === 'mr' ? 'थेट बांधावरून पिकअप (Farm Gate)' : 'Direct Farm Gate Pickup')
                    : (lang === 'mr' ? 'गाव संकलन केंद्र (Village Hub)' : 'Village Collection Hub')}
                </span>
              </div>
              <div className="text-xs text-highway-700 font-medium flex items-center gap-1">
                <Truck className="w-3 h-3 text-highway-600" />
                <span>नियुक्त गाडी: Tata Ace (MH-14-GV-6218) • ETA: {booking.tempoEta || '35 min'}</span>
              </div>
            </div>
          </div>

          {/* Graded Produce Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="bg-slate-100 px-4 py-2.5 text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
              <span>{lang === 'mr' ? 'शेतमालाचा अधिकृत तपशील' : 'Produce & Grading Specifications'}</span>
              <span className="text-agri-700 font-extrabold">100% Quality Graded</span>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl select-none">{crop?.emoji}</span>
                  <div>
                    <div className="font-black text-gray-900 text-base sm:text-lg flex items-center gap-2">
                      <span>{crop?.name?.[lang] || crop?.name?.mr}</span>
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full">
                        {t(lang, 'cropGradeValue')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      सॉर्टिंग: ए-ग्रेड (एकसारखा आकार, योग्य रंग, विना डाग व निर्यातक्षम गुणवत्ता)
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-gray-400 font-semibold uppercase">{t(lang, 'rateLabel')}</span>
                  <div className="text-base sm:text-lg font-black text-agri-700">
                    ₹{ratePerKg} / किलो
                  </div>
                  <div className="text-[11px] text-gray-500">
                    (₹{crop?.cratePrice} प्रति २० किलो क्रेट)
                  </div>
                </div>
              </div>

              {/* Quantity and Weight Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="text-gray-400 font-medium text-[11px]">{t(lang, 'quantity')}</div>
                  <div className="font-extrabold text-gray-900 text-sm mt-0.5">
                    {quantity} {isCrates ? 'क्रेट (Plastic Crates)' : 'क्विंटल'}
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="text-gray-400 font-medium text-[11px]">{t(lang, 'exactWeightLabel')}</div>
                  <div className="font-black text-agri-800 text-sm mt-0.5 font-mono">
                    {netWeightKg.toFixed(2)} Kg
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="text-gray-400 font-medium text-[11px]">क्रेट समतुल्य</div>
                  <div className="font-extrabold text-gray-900 text-sm mt-0.5">
                    {totalCratesEquivalent} क्रेट (20 Kg Crates)
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="text-gray-400 font-medium text-[11px]">{t(lang, 'grossAmount')}</div>
                  <div className="font-black text-gray-900 text-sm mt-0.5 font-mono">
                    ₹{formatInr(grossAmount)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Zero Deductions Highlight Breakdown Box (₹0 Commission / Hamali) */}
          <div className="border-2 border-emerald-500 bg-emerald-50/50 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-black text-emerald-950 text-sm sm:text-base">
                    {t(lang, 'deductionsLabel')}
                  </h3>
                  <p className="text-[11px] text-emerald-800 font-medium">
                    {t(lang, 'zeroHighlightText')}
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-block bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                100% शेतकरी हिताचे
              </span>
            </div>

            {/* Detailed 0 Deduction Items */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-emerald-200 flex flex-col justify-between">
                <span className="text-gray-600">{t(lang, 'hamaliCharges')}</span>
                <span className="font-extrabold text-emerald-700 text-sm mt-1">{t(lang, 'zeroFree')}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-emerald-200 flex flex-col justify-between">
                <span className="text-gray-600">{t(lang, 'commissionCharges')}</span>
                <span className="font-extrabold text-emerald-700 text-sm mt-1">{t(lang, 'zeroFree')}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-emerald-200 flex flex-col justify-between">
                <span className="text-gray-600">{t(lang, 'weighingCharges')}</span>
                <span className="font-extrabold text-emerald-700 text-sm mt-1">{t(lang, 'zeroFree')}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-emerald-200 flex flex-col justify-between">
                <span className="text-gray-600">{t(lang, 'transportCharges')}</span>
                <span className="font-extrabold text-emerald-700 text-sm mt-1">{t(lang, 'zeroFree')}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs text-emerald-900 font-semibold">
              <span>{t(lang, 'totalDeductions')} (Zero Hidden Deductions):</span>
              <span className="font-black text-sm text-emerald-800">₹0.00 (शून्य कपात)</span>
            </div>
          </div>

          {/* Grand Net UPI Payout Banner */}
          <div className="bg-gradient-to-r from-agri-700 via-agri-800 to-agri-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-agri-200 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>{t(lang, 'netUpiPayout')}</span>
              </span>
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-1 mt-1 font-mono">
                <span>₹{formatInr(totalAmount)}</span>
              </div>
              <p className="text-xs text-agri-200 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{t(lang, 'payoutGuarantee')}</span>
              </p>
            </div>

            {/* QR Code Placeholder for UPI Verification */}
            <div className="bg-white p-2 rounded-xl text-gray-900 flex items-center gap-3 shrink-0 self-start sm:self-center">
              {/* QR Graphic */}
              <div className="w-16 h-16 bg-slate-900 rounded-lg p-1 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 44 44" className="w-full h-full text-white fill-current">
                  {/* Outer corner finders */}
                  <rect x="0" y="0" width="14" height="14" fill="white" />
                  <rect x="2" y="2" width="10" height="10" fill="#0f172a" />
                  <rect x="4" y="4" width="6" height="6" fill="white" />

                  <rect x="30" y="0" width="14" height="14" fill="white" />
                  <rect x="32" y="2" width="10" height="10" fill="#0f172a" />
                  <rect x="34" y="4" width="6" height="6" fill="white" />

                  <rect x="0" y="30" width="14" height="14" fill="white" />
                  <rect x="2" y="32" width="10" height="10" fill="#0f172a" />
                  <rect x="4" y="34" width="6" height="6" fill="white" />

                  {/* Simulated QR bits */}
                  <rect x="18" y="2" width="4" height="4" fill="white" />
                  <rect x="24" y="6" width="3" height="3" fill="white" />
                  <rect x="18" y="10" width="4" height="4" fill="white" />
                  <rect x="6" y="18" width="4" height="4" fill="white" />
                  <rect x="12" y="22" width="4" height="4" fill="white" />
                  <rect x="18" y="18" width="8" height="8" fill="#15803d" />
                  <rect x="28" y="18" width="4" height="4" fill="white" />
                  <rect x="36" y="22" width="4" height="4" fill="white" />
                  <rect x="18" y="30" width="4" height="4" fill="white" />
                  <rect x="26" y="34" width="4" height="4" fill="white" />
                  <rect x="34" y="32" width="4" height="4" fill="white" />
                </svg>
              </div>

              <div className="text-left text-[11px] leading-tight">
                <div className="font-extrabold text-agri-800 flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-agri-600" />
                  <span>UPI Verified</span>
                </div>
                <div className="text-gray-500 text-[10px] mt-0.5">
                  स्कॅन करून पावती व पेमेंट पडताळणी करा
                </div>
                <div className="font-mono text-[9px] text-gray-400 mt-0.5">
                  ID: {booking.id}
                </div>
              </div>
            </div>
          </div>

          {/* Verification Stamps and Signatures */}
          <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gray-500">
            {/* Stamp */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-emerald-600 flex items-center justify-center text-emerald-700 font-extrabold text-[9px] text-center leading-tight rotate-[-6deg] p-1">
                SEALED & VERIFIED
              </div>
              <div className="text-[11px] text-gray-600 leading-tight">
                <span className="font-bold text-gray-800">{t(lang, 'authorizedSign')}</span>
                <br />
                <span>डिजिटल वजन काटा प्रमाणीकरण क्र. MH-PUN-08412</span>
              </div>
            </div>

            {/* Note */}
            <div className="text-[11px] text-gray-400 sm:text-right">
              <span>FreshRoute Agri Logistics 24x7 शेतकरी मदत केंद्र: </span>
              <span className="font-bold text-agri-700">1800-843-2754</span>
            </div>
          </div>
        </div>

        {/* Footer Modal Action (Screen Only) */}
        <div className="no-print bg-slate-50 px-4 sm:px-6 py-3 border-t border-slate-200 flex flex-col xs:flex-row items-center justify-between gap-2 shrink-0">
          <p className="text-xs text-gray-500 text-center xs:text-left">
            {lang === 'mr'
              ? 'ही पावती तुमच्या WhatsApp वर सुद्धा पाठवली गेली आहे.'
              : 'This digital voucher has also been sent to your registered WhatsApp.'}
          </p>

          <div className="flex items-center gap-2 w-full xs:w-auto">
            <button
              onClick={handlePrint}
              type="button"
              className="flex-1 xs:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-agri-600 hover:bg-agri-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>{t(lang, 'printPavti')}</span>
            </button>

            <button
              onClick={onClose}
              type="button"
              className="flex-1 xs:flex-none px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 font-bold text-gray-700 text-xs sm:text-sm transition-all cursor-pointer"
            >
              {t(lang, 'closePavti')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
