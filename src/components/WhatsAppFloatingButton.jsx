import { useState } from 'react';
import { MessageCircle, ExternalLink, X, Send, Check, Eye, Sparkles } from 'lucide-react';
import { crops, locations, deliveryLocations, deliverySlots } from '../data/crops.js';
import { t } from '../data/i18n.js';

/**
 * Helper to build the pre-filled Marathi message and wa.me link
 */
export function buildWhatsAppPayload({ activeRole, lang = 'mr', farmerState, wholesalerState, crops: cropsProp }) {
  const cropsList = cropsProp && cropsProp.length > 0 ? cropsProp : crops;
  const phoneNumber = '919822481092'; // FreshRoute Maharashtra Central Desk

  if (activeRole === 'farmer') {
    const crop = farmerState?.crop || cropsList[0];
    const cropName = crop?.name?.[lang] || crop?.name?.mr || 'टोमॅटो';
    const isCrates = farmerState?.unit === 'crates';
    const qty = Number(farmerState?.qty) || 5;
    const netWeightKg = isCrates ? qty * 20 : qty * 100;
    const ratePerKg = crop?.pricePerKg || 32;
    const estimatedPayout =
      farmerState?.estimatedPayout ||
      (isCrates ? qty * (crop?.cratePrice || 640) : qty * 100 * ratePerKg);

    const locObj =
      locations.find((l) => l.id === farmerState?.selectedLocation) || locations[0];
    const locationName = locObj?.name?.[lang] || locObj?.name?.mr || 'जुन्नर';

    const pickupTypeStr =
      farmerState?.pickupType === 'farmGate'
        ? (lang === 'mr' ? 'थेट बांधावरून पिकअप (Farm Gate)' : 'Farm Gate Direct Pickup')
        : (lang === 'mr' ? 'गाव संकलन केंद्र (Village Hub)' : 'Village Collection Hub');

    const farmerName =
      farmerState?.farmerName ||
      (lang === 'mr' ? 'ज्ञानेश्वर तुकाराम बोराडे' : 'Dnyaneshwar T. Borade');

    const text = `🌿 *आपली मंडी (Aapli Mandi) — शेतकरी गाडी बुकिंग*
----------------------------------------
👨‍🌾 *शेतकरी नाव:* ${farmerName}
📍 *गाव / संकलन ठिकाण:* ${locationName}
🚚 *पिकअप प्रकार:* ${pickupTypeStr}
📱 *मोबाईल:* +91 98224 81092

📦 *शेतमाल तपशील:*
• पीक: ${crop.emoji} ${cropName} (A-Grade)
• प्रमाण: ${qty} ${isCrates ? (lang === 'mr' ? 'प्लास्टिक क्रेट (२० किलो)' : 'Plastic Crates (20 Kg)') : (lang === 'mr' ? 'क्विंटल (१०० किलो)' : 'Quintals (100 Kg)')}
• एकूण अचूक वजन: ${netWeightKg} किलो (Net Weight)
• हमी खरेदी दर: ₹${ratePerKg}/किलो (₹${crop.cratePrice}/क्रेट)

💰 *अंदाजे पक्की रक्कम:* ₹${Number(estimatedPayout).toLocaleString('en-IN')}/-
✅ *कपात:* ₹० (Zero हमाली • Zero अडत • मोफत संकलन)
⚡ *पेमेंट:* २४ तासांत थेट बँक खात्यात UPI द्वारे जमा

कृपया टेम्पो पिकअप लवकरात लवकर कन्फर्म करावा. धन्यवाद!`;

    return {
      text,
      url: `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`,
      badge: `${qty} ${isCrates ? 'क्रेट' : 'क्विंटल'}`,
      summary: `${crop.emoji} ${cropName} (${qty} ${isCrates ? 'क्रेट' : 'क्विंटल'})`,
      title: lang === 'mr' ? 'शेतकरी गाडी बुकिंग' : 'Farmer Pickup Booking',
    };
  }

  if (activeRole === 'wholesaler') {
    const cart = wholesalerState?.cart || [];
    const locObj =
      deliveryLocations.find((l) => l.id === wholesalerState?.selectedLocation) ||
      deliveryLocations[0];
    const locationName = locObj?.name?.[lang] || locObj?.name?.mr || 'गुलटेकडी — पुणे मार्केट यार्ड';

    const slotObj =
      deliverySlots.find((s) => s.id === wholesalerState?.selectedSlot) || deliverySlots[0];
    const slotName = slotObj?.label?.[lang] || slotObj?.label?.mr || 'पहाटे ४:०० — ६:०० AM';

    if (cart.length > 0) {
      const itemsText = cart
        .map((item) => {
          const crop = cropsList.find((c) => c.id === item.cropId);
          if (!crop) return '';
          const subtotal = crop.cratePrice * item.qty;
          const name = crop.name?.[lang] || crop.name?.mr;
          return `• ${crop.emoji} ${name}: ${item.qty} क्रेट (₹${subtotal.toLocaleString('en-IN')})`;
        })
        .filter(Boolean)
        .join('\n');

      const totalCrates =
        wholesalerState?.totalCrates || cart.reduce((sum, item) => sum + item.qty, 0);
      const totalAmount =
        wholesalerState?.totalAmount ||
        cart.reduce((sum, item) => {
          const crop = cropsList.find((c) => c.id === item.cropId);
          return sum + (crop ? crop.cratePrice * item.qty : 0);
        }, 0);

      const text = `🏪 *FreshRoute B2B — व्यापारी क्रेट खरेदी ऑर्डर*
----------------------------------------
🛒 *मागवलेला A-ग्रेड शेतमाल:*
${itemsText}

📊 *एकूण क्रेट संख्या:* ${totalCrates} क्रेट
💰 *एकूण बिलाची रक्कम:* ₹${Number(totalAmount).toLocaleString('en-IN')}/-
🚚 *डिलिव्हरी ठिकाण:* ${locationName}
⏰ *डिलिव्हरी स्लॉट:* ${slotName} (Highway Express)
⚡ *हमी:* १००% ग्रेडिंग केलेला ताजा माल, अवघ्या ६ ते १० तासांत थेट मार्केट यार्डात!

कृपया आज रात्रीच्या हायवे एक्सप्रेस बॅचमधून ही ऑर्डर कन्फर्म करावी. धन्यवाद!`;

      return {
        text,
        url: `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`,
        badge: `${totalCrates} क्रेट`,
        summary: `₹${Number(totalAmount).toLocaleString('en-IN')} (${totalCrates} क्रेट)`,
        title: lang === 'mr' ? 'व्यापारी क्रेट ऑर्डर' : 'Wholesaler Crate Order',
      };
    } else {
      const text = `🏪 *FreshRoute B2B — व्यापारी चौकशी व क्रेट प्री-ऑर्डर*
----------------------------------------
नमस्कार FreshRoute टीम,
मला आज रात्रीच्या हायवे एक्सप्रेस बॅचमधील ताज्या A-ग्रेड क्रेट्सची (टोमॅटो, कांदा, मिरची, भेंडी) माहिती व थेट हमी खरेदी दर हवे आहेत.

🚚 *माझे मार्केट यार्ड:* ${locationName}
⏰ *अपेक्षित स्लॉट:* ${slotName}

कृपया आजचे उपलब्ध लॉट्स आणि हमीभाव पाठवा. धन्यवाद!`;

      return {
        text,
        url: `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`,
        badge: 'B2B चौकशी',
        summary: lang === 'mr' ? 'A-Grade क्रेट चौकशी' : 'A-Grade Crates Inquiry',
        title: lang === 'mr' ? 'व्यापारी चौकशी' : 'Wholesaler Inquiry',
      };
    }
  }

  // Logistics tracker role
  const text = `🚛 *FreshRoute लॉजिस्टिक्स — गाडी व माल ट्रॅकिंग चौकशी*
----------------------------------------
नमस्कार,
मला आजच्या तालुका मायक्रो-हब आणि रात्रीच्या हायवे एक्सप्रेस टेम्पो संकलन स्थितीबद्दल माहिती हवी आहे. कृपया चालू स्टेटस पाठवा. धन्यवाद!`;

  return {
    text,
    url: `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`,
    badge: 'ट्रॅकिंग',
    summary: lang === 'mr' ? 'गाडी व माल ट्रॅकिंग' : 'Live Fleet Tracking',
    title: lang === 'mr' ? 'लॉजिस्टिक्स चौकशी' : 'Logistics Query',
  };
}

export default function WhatsAppFloatingButton({
  activeRole,
  lang = 'mr',
  farmerState,
  wholesalerState,
  crops: cropsProp,
}) {
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const payload = buildWhatsAppPayload({
    activeRole,
    lang,
    farmerState,
    wholesalerState,
    crops: cropsProp,
  });

  const handleOpenWhatsApp = (e) => {
    e.stopPropagation();
    window.open(payload.url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyText = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(payload.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Floating Action Button (Screen Only, hidden in print) */}
      <div className="no-print fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2">
        {/* Main Floating WhatsApp Button */}
        <div className="relative group">
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white font-bold py-3.5 px-4 sm:px-5 rounded-full shadow-xl shadow-emerald-600/30 border border-emerald-400/40 transition-all duration-200 cursor-pointer touch-manipulation"
            aria-label="WhatsApp वरून ऑर्डर करा"
          >
            {/* Pulsing glow indicator */}
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>

            {/* Official WhatsApp SVG Icon */}
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 fill-current shrink-0"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>

            {/* Label */}
            <span className="text-xs sm:text-sm font-extrabold tracking-wide whitespace-nowrap">
              {t(lang, 'whatsappOrderBtn')}
            </span>

            {/* Dynamic Context Badge */}
            {payload.badge && (
              <span className="hidden xs:inline-block bg-white text-emerald-800 text-[11px] font-black px-2 py-0.5 rounded-full shadow-xs">
                {payload.badge}
              </span>
            )}
          </button>

          {/* Eye / Preview button badge */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowPreview(true);
            }}
            className="absolute -top-2.5 -left-2.5 w-7 h-7 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
            title="संदेश तपासा (Preview WhatsApp Text)"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-700" />
          </button>
        </div>
      </div>

      {/* Message Preview Modal */}
      {showPreview && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base leading-tight">
                    {t(lang, 'whatsappPreviewTitle')}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {payload.title} • {payload.summary}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat bubble simulator */}
            <div className="bg-[#efeae2] p-3.5 rounded-2xl border border-[#d1d7db] shadow-inner">
              <div className="bg-[#d9fdd3] text-gray-900 p-3.5 rounded-2xl rounded-tr-xs text-xs font-mono whitespace-pre-wrap leading-relaxed shadow-xs border border-[#c1ebb9] max-h-[280px] overflow-y-auto">
                {payload.text}
              </div>
              <div className="text-[10px] text-gray-500 text-right mt-1.5">
                ✓✓ FreshRoute Agri Logistics Helpline: +91 98224 81092
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>{lang === 'mr' ? 'WhatsApp वर पाठवा' : 'Send on WhatsApp'}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </button>

              <button
                type="button"
                onClick={handleCopyText}
                className="w-full sm:w-auto px-4 py-3 rounded-xl border border-gray-300 hover:bg-slate-50 font-semibold text-gray-700 text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{lang === 'mr' ? 'कॉपी झाले!' : 'Copied!'}</span>
                  </>
                ) : (
                  <span>{lang === 'mr' ? 'मजकूर कॉपी करा' : 'Copy Text'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
