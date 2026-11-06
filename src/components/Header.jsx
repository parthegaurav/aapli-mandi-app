import { useState } from 'react';
import { Sprout, Globe, ChevronDown } from 'lucide-react';
import { t } from '../data/i18n.js';

const roles = [
  { id: 'farmer', emoji: '👨‍🌾', labelKey: 'farmer' },
  { id: 'wholesaler', emoji: '🏪', labelKey: 'wholesaler' },
  { id: 'logistics', emoji: '🚛', labelKey: 'logistics' },
  { id: 'admin', emoji: '⚙️', labelKey: 'admin' },
];

export default function Header({ lang, setLang, activeRole, setActiveRole }) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      {/* Top bar: Brand + Language */}
      <div className="flex items-center justify-between px-4 py-2.5">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-agri-600 rounded-xl flex items-center justify-center shadow-md">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div className="leading-tight">
            <h1 className="text-lg font-bold text-agri-800 leading-tight">
              {t(lang, 'brandName')}
            </h1>
            <p className="text-[10px] text-gray-500 font-medium tracking-wide">
              {t(lang, 'brandSub')}
            </p>
          </div>
        </div>

        {/* Language Toggle */}
        <button
          onClick={() => setLang(lang === 'mr' ? 'en' : 'mr')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 
                     bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 
                     active:scale-95 transition-all touch-manipulation select-none"
        >
          <Globe className="w-4 h-4 text-agri-600" />
          <span>{lang === 'mr' ? 'EN' : 'मराठी'}</span>
        </button>
      </div>

      {/* Role Switcher Tabs */}
      <nav className="flex border-t border-gray-100 bg-gray-50/50">
        {roles.map((role) => {
          const isActive = activeRole === role.id;
          return (
            <button
              key={role.id}
              onClick={() => setActiveRole(role.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold 
                transition-all touch-manipulation select-none relative
                ${isActive
                  ? 'text-agri-700 bg-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                }`}
            >
              <span className="text-base">{role.emoji}</span>
              <span className="hidden xs:inline sm:inline">{t(lang, role.labelKey)}</span>
              <span className="xs:hidden sm:hidden text-xs">{t(lang, role.labelKey)}</span>
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-agri-600 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
