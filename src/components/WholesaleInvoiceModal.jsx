import { useState } from 'react';
import {
  Printer,
  Download,
  Share2,
  X,
  CheckCircle2,
  Truck,
  MapPin,
  Clock,
  Store,
  FileCheck2,
  QrCode,
  Building2,
} from 'lucide-react';

export default function WholesaleInvoiceModal({ order, lang = 'mr', onClose }) {
  if (!order) return null;

  const [copied, setCopied] = useState(false);

  const formatInr = (num) =>
    Number(num || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSlip = () => {
    const invoiceText = `
======================================================
         FreshRoute B2B Agri Logistics
    होलसेल खरेदी बीजक / Wholesale B2B Tax Invoice
======================================================
ऑर्डर क्र. / Order No: ${order.id}
तारीख / Date: ${order.created_at || new Date().toLocaleDateString()}
व्यापारी पेढी / Firm: ${order.wholesaler_name}
मार्केट यार्ड / Market Yard: ${order.market_yard}
गाळा क्र. / Gala No: ${order.shop_gala_no}
------------------------------------------------------
मालाचा तपशील / Items:
${order.crop_name || 'शेतमाल'} — ${order.crates_ordered || 0} क्रेट (Cr.)
एकूण रक्कम / Total Amount: ₹${formatInr(order.total_amount)}
डिलिव्हरी स्थिती / Status: ${order.delivery_status || 'Pending'}
डिलिव्हरी वेळ: पहाटे ४:०० ते ६:०० AM (थेट गाळ्यावर)
======================================================
FreshRoute B2B APMC Express Highway Logistics
    `;
    const blob = new Blob([invoiceText.trim()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice-${order.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        id="printable-pavti-modal"
        className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-gray-100 relative my-auto max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="no-print absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Invoice Header */}
        <div className="border-b-2 border-highway-500 pb-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-highway-50 text-highway-800 rounded-full text-xs font-extrabold uppercase tracking-wide border border-highway-200 mb-2">
            <Truck className="w-3.5 h-3.5" />
            <span>FreshRoute B2B Express Mandi</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">
            {lang === 'mr' ? 'होलसेल खरेदी बिल / कर बीजक' : 'Wholesale B2B Tax Invoice'}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            शिवार ते मार्केट यार्ड थेट एक्सप्रेसवे डिलिव्हरी अधिकृत बिल
          </p>
        </div>

        {/* Order Meta Bar */}
        <div className="grid grid-cols-2 gap-3 py-3.5 border-b border-gray-100 text-xs">
          <div>
            <span className="text-gray-400 font-medium block">
              {lang === 'mr' ? 'ऑर्डर क्रमांक' : 'Order ID'}:
            </span>
            <span className="font-mono font-bold text-gray-800 text-sm">{order.id}</span>
          </div>
          <div className="text-right">
            <span className="text-gray-400 font-medium block">
              {lang === 'mr' ? 'तारीख व वेळ' : 'Date & Time'}:
            </span>
            <span className="font-semibold text-gray-800">
              {order.created_at ? new Date(order.created_at).toLocaleString('en-IN') : 'आजची रात्र बॅच'}
            </span>
          </div>
        </div>

        {/* Wholesaler Details Card */}
        <div className="bg-orange-50/60 rounded-2xl p-3.5 border border-orange-200/70 my-3 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-highway-800 font-bold text-sm">
            <Store className="w-4 h-4" />
            <span>{order.wholesaler_name}</span>
          </div>
          <div className="flex items-center justify-between text-gray-600">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-gray-400" />
              <span>{order.market_yard}</span>
            </span>
            <span className="font-bold text-gray-800 bg-white px-2 py-0.5 rounded-md border border-orange-200">
              {order.shop_gala_no}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-gray-500 pt-1 border-t border-orange-100">
            <Clock className="w-3 h-3 text-highway-600" />
            <span>डिलिव्हरी स्लॉट: पहाटे ४:०० ते ६:०० AM (थेट गाळ्यावर)</span>
          </div>
        </div>

        {/* Order Line Items */}
        <div className="my-3">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            {lang === 'mr' ? 'खरेदी केलेला माल' : 'Procured Produce'}
          </h4>
          <div className="rounded-xl border border-gray-200 overflow-hidden text-xs">
            <div className="bg-gray-50 p-2.5 font-bold text-gray-700 grid grid-cols-12 gap-1 border-b border-gray-200">
              <span className="col-span-6">मालाचा तपशील</span>
              <span className="col-span-3 text-center">क्रेट संख्या</span>
              <span className="col-span-3 text-right">रक्कम (₹)</span>
            </div>
            <div className="p-3 grid grid-cols-12 gap-1 items-center bg-white">
              <div className="col-span-6">
                <span className="font-bold text-gray-900 block">{order.crop_name || 'A-Grade Fresh Crop'}</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold inline-block mt-0.5">
                  100% Sorted A-Grade
                </span>
              </div>
              <span className="col-span-3 text-center font-bold text-gray-800">
                {order.crates_ordered} क्रेट
                <span className="block text-[10px] text-gray-500 font-semibold mt-0.5">
                  ({order.total_weight_kg ? `${order.total_weight_kg} kg` : `${order.crates_ordered * 20} kg`})
                </span>
              </span>
              <span className="col-span-3 text-right font-black text-gray-900">
                ₹{formatInr(order.total_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Grand Total */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 my-3 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-300 font-medium block">
              {lang === 'mr' ? 'एकूण देय रक्कम' : 'Total Payable Amount'}
            </span>
            <span className="text-[10px] text-emerald-400">GST/मंडी उपकर समाविष्ट</span>
          </div>
          <span className="text-2xl font-black text-white">
            ₹{formatInr(order.total_amount)}
          </span>
        </div>

        {/* Status Tracker & QR Code */}
        <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-gray-50 border border-gray-200 my-3 items-center text-xs">
          <div className="col-span-2 space-y-1">
            <span className="text-[11px] text-gray-400 font-medium block">सध्याची स्थिती:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs bg-emerald-100 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{order.delivery_status || 'Delivered'}</span>
            </span>
            <p className="text-[10px] text-gray-500 mt-1">
              रात्रीच्या हायवे एक्सप्रेस वाहनातून थेट गाळ्यावर अनलोडिंग
            </p>
          </div>
          <div className="text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-white border-2 border-gray-300 rounded-xl flex items-center justify-center p-1 shadow-2xs">
              <QrCode className="w-12 h-12 text-gray-800" />
            </div>
            <span className="text-[9px] text-gray-400 font-mono mt-1">GALA VERIFIED</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="no-print pt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-3 px-3 rounded-xl bg-highway-600 hover:bg-highway-700 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>{lang === 'mr' ? 'प्रिंट करा (Print)' : 'Print Invoice'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadSlip}
            className="py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{lang === 'mr' ? 'डाऊनलोड' : 'Download'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
