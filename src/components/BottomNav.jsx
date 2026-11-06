import {
  TrendingUp,
  Truck,
  FileText,
  Package,
  ShoppingCart,
  IndianRupee,
  PlusCircle,
  Sprout,
  ShoppingBag,
  ClipboardList,
} from 'lucide-react';
import { t } from '../data/i18n.js';

export default function BottomNav({ role, activeTab, setActiveTab, lang }) {
  // Define tabs per role
  const tabConfigs = {
    farmer: [
      { id: 'rates', labelKey: 'navLiveRates', icon: TrendingUp },
      { id: 'book', labelKey: 'navBookPickup', icon: Truck },
      { id: 'receipts', labelKey: 'navMyReceipts', icon: FileText },
    ],
    buyer: [
      { id: 'catalog', labelKey: 'navBuyerOrder', icon: ClipboardList },
      { id: 'cart', labelKey: 'navCart', icon: ShoppingCart },
      { id: 'orders', labelKey: 'navMyOrders', icon: Truck },
    ],
    admin: [
      { id: 'rates', labelKey: 'navManageRates', icon: IndianRupee },
      { id: 'products', labelKey: 'navAddProducts', icon: PlusCircle },
      { id: 'farmerBookings', labelKey: 'navFarmerBookings', icon: Sprout },
      { id: 'buyerOrders', labelKey: 'navBuyerOrders', icon: ShoppingBag },
    ],
  };

  const tabs = tabConfigs[role] || tabConfigs.farmer;

  // Active styles per role
  const roleStyles = {
    farmer: {
      activeText: 'text-agri-700 font-extrabold',
      activeBorder: 'bg-agri-600',
      activeBg: 'bg-agri-50/50',
    },
    buyer: {
      activeText: 'text-highway-600 font-extrabold',
      activeBorder: 'bg-highway-500',
      activeBg: 'bg-highway-50/50',
    },
    admin: {
      activeText: 'text-slate-900 font-extrabold',
      activeBorder: 'bg-slate-800',
      activeBg: 'bg-slate-100/50',
    },
  };

  const currentRoleStyle = roleStyles[role] || roleStyles.farmer;

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] h-[60px] max-h-[60px]"
    >
      <div className="max-w-lg mx-auto h-full flex items-stretch">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 relative flex flex-col items-center justify-center gap-1 py-1 px-1 transition-all duration-150 cursor-pointer touch-manipulation min-h-[44px] select-none ${
                isActive
                  ? `${currentRoleStyle.activeText} ${currentRoleStyle.activeBg}`
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {/* Active top indicator accent */}
              {isActive && (
                <span
                  className={`absolute top-0 left-3 right-3 h-0.5 rounded-full ${currentRoleStyle.activeBorder}`}
                />
              )}

              <Icon
                className={`w-5 h-5 transition-transform duration-150 ${
                  isActive ? 'scale-110' : 'opacity-70'
                }`}
              />

              <span className="text-[10px] sm:text-[11px] leading-tight text-center font-bold tracking-tight truncate max-w-full px-0.5">
                {t(lang, tab.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
