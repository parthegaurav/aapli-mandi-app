import { Sprout, Globe, LogOut, LogIn, ArrowLeftRight } from 'lucide-react';
import { t } from '../data/i18n.js';

export default function RoleHeader({ user, lang, setLang, onLogout, onGoToLogin }) {
  if (!user) return null;

  // Determine user info display based on role
  let roleBadgeContent = '';
  let badgeStyle = '';

  if (user.role === 'farmer') {
    const name = user.name || user.farmer_name || (lang === 'mr' ? 'शेतकरी' : 'Farmer');
    const village = user.village || user.taluka || (lang === 'mr' ? 'जुन्नर' : 'Junnar');
    roleBadgeContent = `👨‍🌾 ${name} • ${village}`;
    badgeStyle = 'bg-agri-50 text-agri-800 border-agri-200';
  } else if (user.role === 'buyer') {
    const firmName = user.firm_name || user.name || (lang === 'mr' ? 'व्यापारी पेढी' : 'Buyer Firm');
    const marketYard = user.market_yard || (lang === 'mr' ? 'पुणे मार्केट' : 'Pune Market');
    const rawGala = user.gala_number || user.shop_gala_no || '१२';
    const gala = rawGala.includes('गाळा') || rawGala.toLowerCase().includes('gala')
      ? rawGala
      : `${lang === 'mr' ? 'गाळा' : 'Gala'} ${rawGala}`;
    roleBadgeContent = `🏪 ${firmName} • ${marketYard} • ${gala}`;
    badgeStyle = 'bg-highway-50 text-highway-800 border-highway-200';
  } else {
    // Admin
    const name = user.name || 'Admin';
    roleBadgeContent = `⚙️ Admin • ${name}`;
    badgeStyle = 'bg-slate-100 text-slate-800 border-slate-300';
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
      <div className="max-w-lg mx-auto px-3 sm:px-4 py-2 sm:py-2.5">
        {/* Top row: Brand & Actions */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-agri-600 rounded-xl flex items-center justify-center shadow-xs shrink-0">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div className="truncate">
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-none truncate">
                {t(lang, 'brandName')}
              </h1>
              <p className="text-[10px] text-gray-500 font-medium truncate mt-0.5">
                {t(lang, 'brandSub')}
              </p>
            </div>
          </div>

          {/* Controls: Switch Role / Login, Language toggle & Logout */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Switch Role / Login Screen Button */}
            {onGoToLogin && (
              <button
                type="button"
                onClick={onGoToLogin}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-agri-300 
                           bg-agri-50 text-xs font-bold text-agri-700 hover:bg-agri-100 
                           active:scale-95 transition-all cursor-pointer touch-manipulation min-h-[36px]"
                title={lang === 'mr' ? 'लॉगिन स्क्रीन / भूमिका बदला' : 'Login Screen / Switch Role'}
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-agri-600 shrink-0" />
                <span className="hidden xs:inline sm:inline">
                  {lang === 'mr' ? 'भूमिका बदला' : 'Switch Role'}
                </span>
              </button>
            )}

            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setLang(lang === 'mr' ? 'en' : 'mr')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-gray-200 
                         bg-gray-50 text-xs font-semibold text-gray-700 hover:bg-gray-100 
                         active:scale-95 transition-all cursor-pointer touch-manipulation min-h-[36px]"
              aria-label="Language switch"
            >
              <Globe className="w-3.5 h-3.5 text-agri-600 shrink-0" />
              <span>{lang === 'mr' ? 'EN' : 'मराठी'}</span>
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-red-200 
                         bg-red-50 text-xs font-semibold text-red-700 hover:bg-red-100 
                         active:scale-95 transition-all cursor-pointer touch-manipulation min-h-[36px]"
              title={t(lang, 'logout')}
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline">{t(lang, 'logout')}</span>
            </button>
          </div>
        </div>

        {/* Bottom row: User identity & role pill (clickable to switch role) */}
        <div className="mt-2">
          <button
            type="button"
            onClick={onGoToLogin}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-semibold shadow-2xs transition-all hover:brightness-95 cursor-pointer text-left ${badgeStyle}`}
            title={lang === 'mr' ? 'भूमिका बदलण्यासाठी येथे क्लिक करा' : 'Click to switch role or login'}
          >
            <span className="truncate">{roleBadgeContent}</span>
            <span className="text-[10px] underline ml-2 shrink-0 font-bold opacity-80 hover:opacity-100">
              {lang === 'mr' ? 'लॉगिन / भूमिका बदला ↗' : 'Switch / Login ↗'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
