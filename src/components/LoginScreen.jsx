import { useState } from 'react';
import {
  Sprout,
  Globe,
  Phone,
  KeyRound,
  ShieldCheck,
  Building2,
  MapPin,
  Store,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  Send,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { t } from '../data/i18n.js';

const VILLAGES = [
  { name: 'जुन्नर', taluka: 'जुन्नर' },
  { name: 'मंचर', taluka: 'आंबेगाव' },
  { name: 'नारायणगाव', taluka: 'जुन्नर' },
  { name: 'सासवड', taluka: 'पुरंदर' },
  { name: 'बारामती', taluka: 'बारामती' },
  { name: 'निफाड', taluka: 'निफाड' },
];

const MARKET_YARDS = [
  'गुलटेकडी पुणे',
  'वाशी मुंबई',
  'पिंपरी',
  'नाशिक',
];

export default function LoginScreen({ lang, setLang, onLoginSuccess, onBack }) {
  const { login, loginWithOtp, sendOtp, register } = useAuth();

  // Role: 'farmer' | 'buyer' | 'admin'
  const [role, setRole] = useState('farmer');

  // Mode: 'login' | 'signup'
  const [mode, setMode] = useState('login');

  // Login sub-mode: 'pin' | 'otp'
  const [loginMethod, setLoginMethod] = useState('pin');

  // Form Fields
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPin, setShowPin] = useState(false);

  // Sign up fields
  const [fullName, setFullName] = useState('');
  const [village, setVillage] = useState(VILLAGES[0].name);
  const [taluka, setTaluka] = useState(VILLAGES[0].taluka);
  const [firmName, setFirmName] = useState('');
  const [marketYard, setMarketYard] = useState(MARKET_YARDS[0]);
  const [galaNumber, setGalaNumber] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Role configuration for color schemes
  const roleConfig = {
    farmer: {
      id: 'farmer',
      title: lang === 'mr' ? '👨‍🌾 शेतकरी' : '👨‍🌾 Farmer',
      badge: lang === 'mr' ? 'शेतकरी पोर्टल' : 'Farmer Portal',
      themeBorder: 'border-agri-500',
      themeBg: 'bg-agri-50',
      themeText: 'text-agri-800',
      themeActiveTab: 'bg-agri-600 text-white shadow-md shadow-agri-600/30',
      btnBg: 'bg-agri-600 hover:bg-agri-700 active:bg-agri-800 shadow-md shadow-agri-600/25',
      ringColor: 'focus:ring-agri-500',
      accentColor: 'text-agri-600',
    },
    buyer: {
      id: 'buyer',
      title: lang === 'mr' ? '🏪 व्यापारी' : '🏪 Buyer',
      badge: lang === 'mr' ? 'व्यापारी पोर्टल' : 'Buyer Portal',
      themeBorder: 'border-highway-500',
      themeBg: 'bg-highway-50',
      themeText: 'text-highway-800',
      themeActiveTab: 'bg-highway-500 text-white shadow-md shadow-highway-500/30',
      btnBg: 'bg-highway-500 hover:bg-highway-600 active:bg-highway-700 shadow-md shadow-highway-500/25',
      ringColor: 'focus:ring-highway-500',
      accentColor: 'text-highway-600',
    },
    admin: {
      id: 'admin',
      title: lang === 'mr' ? '⚙️ Admin' : '⚙️ Admin',
      badge: lang === 'mr' ? 'अॅडमिन पोर्टल' : 'Admin Portal',
      themeBorder: 'border-slate-700',
      themeBg: 'bg-slate-100',
      themeText: 'text-slate-900',
      themeActiveTab: 'bg-slate-800 text-white shadow-md shadow-slate-800/30',
      btnBg: 'bg-slate-800 hover:bg-slate-900 active:bg-slate-950 shadow-md shadow-slate-800/25',
      ringColor: 'focus:ring-slate-700',
      accentColor: 'text-slate-800',
    },
  };

  const currentTheme = roleConfig[role];

  // Handle Village Change & auto-set Taluka
  const handleVillageChange = (val) => {
    setVillage(val);
    const found = VILLAGES.find((v) => v.name === val);
    if (found) {
      setTaluka(found.taluka);
    }
  };

  // Clear messages when switching tabs
  const handleRoleSelect = (r) => {
    setRole(r);
    setError('');
    setSuccessMsg('');
  };

  const handleModeSelect = (m) => {
    setMode(m);
    setError('');
    setSuccessMsg('');
  };

  // Handle Send OTP
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!phone || phone.trim().length < 10) {
      setError(lang === 'mr' ? 'कृपया १० अंकी मोबाईल नंबर टाका' : 'Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setSuccessMsg('');
    setSendingOtp(true);
    try {
      const res = await sendOtp(phone.trim(), role);
      setOtpSent(true);
      setSuccessMsg(res.message || (lang === 'mr' ? 'OTP पाठवला गेला आहे (डेमो OTP: 1234)' : 'OTP sent successfully (Demo OTP: 1234)'));
    } catch (err) {
      setError(err.message || (lang === 'mr' ? 'OTP पाठवण्यात अयशस्वी' : 'Failed to send OTP'));
    } finally {
      setSendingOtp(false);
    }
  };

  // Submit Login / Register
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      setError(lang === 'mr' ? 'कृपया वैध १० अंकी मोबाईल नंबर टाका' : 'Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        if (loginMethod === 'pin') {
          if (!pin || pin.length < 4) {
            throw new Error(lang === 'mr' ? 'कृपया ४ अंकी PIN टाका' : 'Please enter 4-digit PIN');
          }
          await login(cleanPhone, pin.trim(), role);
        } else {
          // OTP login
          if (!otp || otp.length < 4) {
            throw new Error(lang === 'mr' ? 'कृपया ४ अंकी OTP टाका' : 'Please enter 4-digit OTP');
          }
          await loginWithOtp(cleanPhone, role, otp.trim());
        }
      } else {
        // Sign Up
        if (!fullName.trim()) {
          throw new Error(lang === 'mr' ? 'कृपया पूर्ण नाव टाका' : 'Please enter your full name');
        }
        if (!pin || pin.length < 4) {
          throw new Error(lang === 'mr' ? 'कृपया ४ अंकी सुरक्षेचा PIN टाका' : 'Please enter a 4-digit security PIN');
        }

        const userData = {
          name: fullName.trim(),
          phone: cleanPhone,
          pin: pin.trim(),
          role,
        };

        if (role === 'farmer') {
          userData.village = village;
          userData.taluka = taluka;
        } else if (role === 'buyer') {
          if (!firmName.trim()) {
            throw new Error(lang === 'mr' ? 'कृपया पेढीचे नाव टाका' : 'Please enter firm name');
          }
          userData.firm_name = firmName.trim();
          userData.market_yard = marketYard;
          userData.gala_number = galaNumber.trim() || 'गाळा १२';
        }

        await register(userData);
      }

      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      setError(err.message || (lang === 'mr' ? 'प्रक्रिया अयशस्वी' : 'Action failed'));
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login Handler
  const handleQuickDemoLogin = async (demoPhone, demoPin, demoRole) => {
    setError('');
    setSuccessMsg('');
    setRole(demoRole);
    setPhone(demoPhone);
    setPin(demoPin);
    setLoading(true);
    try {
      await login(demoPhone, demoPin, demoRole);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white flex flex-col justify-between py-6 px-3 sm:px-6">
      <div className="w-full max-w-[480px] mx-auto">
        {/* Top Header: Brand + Language Toggle */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 bg-agri-600 rounded-2xl flex items-center justify-center shadow-md shadow-agri-600/30">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 leading-tight tracking-tight">
                {t(lang, 'brandName')}
              </h1>
              <p className="text-[11px] font-medium text-slate-500 tracking-wide">
                {t(lang, 'brandSub')}
              </p>
            </div>
          </div>

          {/* Top Actions: Back button (if logged in) + Language Toggle */}
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 
                           bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 
                           shadow-xs active:scale-95 transition-all cursor-pointer touch-manipulation"
                title="Back to Dashboard"
              >
                <span>← {lang === 'mr' ? 'डॅशबोर्ड' : 'Dashboard'}</span>
              </button>
            )}

            {/* Language Toggle */}
            <button
              type="button"
              onClick={() => setLang(lang === 'mr' ? 'en' : 'mr')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 
                         bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 
                         shadow-xs active:scale-95 transition-all cursor-pointer touch-manipulation"
            >
              <Globe className="w-3.5 h-3.5 text-agri-600" />
              <span>{lang === 'mr' ? 'English' : 'मराठी'}</span>
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden transition-all duration-300">
          {/* Role Tabs (3 Role Pills) */}
          <div className="p-3 bg-slate-50/80 border-b border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1 text-center">
              {lang === 'mr' ? 'तुमची भूमिका निवडा' : 'Select Your Role'}
            </p>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/70 rounded-2xl">
              <button
                type="button"
                onClick={() => handleRoleSelect('farmer')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer touch-manipulation min-h-[44px] ${
                  role === 'farmer'
                    ? 'bg-agri-600 text-white shadow-md shadow-agri-600/30 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span className="text-base sm:text-lg">👨‍🌾</span>
                <span className="truncate">{lang === 'mr' ? 'शेतकरी' : 'Farmer'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('buyer')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer touch-manipulation min-h-[44px] ${
                  role === 'buyer'
                    ? 'bg-highway-500 text-white shadow-md shadow-highway-500/30 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span className="text-base sm:text-lg">🏪</span>
                <span className="truncate">{lang === 'mr' ? 'व्यापारी' : 'Buyer'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('admin')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer touch-manipulation min-h-[44px] ${
                  role === 'admin'
                    ? 'bg-slate-800 text-white shadow-md shadow-slate-800/30 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span className="text-base sm:text-lg">⚙️</span>
                <span className="truncate">Admin</span>
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            {/* Login / Sign Up Toggle */}
            <div className="flex border-b border-slate-100">
              <button
                type="button"
                onClick={() => handleModeSelect('login')}
                className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-all cursor-pointer touch-manipulation min-h-[44px] ${
                  mode === 'login'
                    ? `${currentTheme.accentColor} border-current`
                    : 'text-slate-400 border-transparent hover:text-slate-600'
                }`}
              >
                {t(lang, 'loginTitle')}
              </button>
              <button
                type="button"
                onClick={() => handleModeSelect('signup')}
                className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-all cursor-pointer touch-manipulation min-h-[44px] ${
                  mode === 'signup'
                    ? `${currentTheme.accentColor} border-current`
                    : 'text-slate-400 border-transparent hover:text-slate-600'
                }`}
              >
                {t(lang, 'signupTitle')}
              </button>
            </div>

            {/* Inline Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Inline Success Message */}
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-medium">{successMsg}</span>
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Sign Up Fields */}
              {mode === 'signup' && (
                <>
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t(lang, 'fullName')} *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={lang === 'mr' ? 'उदा. ज्ञानेश्वर बोराडे' : 'e.g. Ramesh Kumar'}
                        className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 ${currentTheme.ringColor} transition-all min-h-[44px]`}
                      />
                    </div>
                  </div>

                  {/* Role-Specific Sign Up Fields */}
                  {role === 'farmer' && (
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Village Dropdown */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          {t(lang, 'village')} *
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <select
                            value={village}
                            onChange={(e) => handleVillageChange(e.target.value)}
                            className={`w-full pl-9 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 ${currentTheme.ringColor} min-h-[44px]`}
                          >
                            {VILLAGES.map((v) => (
                              <option key={v.name} value={v.name}>
                                {v.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Taluka */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          {t(lang, 'taluka')} *
                        </label>
                        <input
                          type="text"
                          required
                          value={taluka}
                          onChange={(e) => setTaluka(e.target.value)}
                          placeholder="तालुका"
                          className={`w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 ${currentTheme.ringColor} min-h-[44px]`}
                        />
                      </div>
                    </div>
                  )}

                  {role === 'buyer' && (
                    <>
                      {/* Firm Name */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          {t(lang, 'firmName')} *
                        </label>
                        <div className="relative">
                          <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={firmName}
                            onChange={(e) => setFirmName(e.target.value)}
                            placeholder={lang === 'mr' ? 'उदा. रमेश्वर ट्रेडिंग कंपनी' : 'e.g. Rameshwar Trading Co.'}
                            className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 ${currentTheme.ringColor} min-h-[44px]`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        {/* Market Yard Dropdown */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            {t(lang, 'marketYard')} *
                          </label>
                          <div className="relative">
                            <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <select
                              value={marketYard}
                              onChange={(e) => setMarketYard(e.target.value)}
                              className={`w-full pl-9 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 ${currentTheme.ringColor} min-h-[44px]`}
                            >
                              {MARKET_YARDS.map((yard) => (
                                <option key={yard} value={yard}>
                                  {yard}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Gala Number */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            {t(lang, 'galaNumber')} *
                          </label>
                          <input
                            type="text"
                            required
                            value={galaNumber}
                            onChange={(e) => setGalaNumber(e.target.value)}
                            placeholder="गाळा क्र. ४२"
                            className={`w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 ${currentTheme.ringColor} min-h-[44px]`}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Common: Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t(lang, 'phoneNumber')} *
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                    <Phone className="w-4 h-4" />
                    <span className="text-xs font-bold text-slate-600">+91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="98XXXXXXXX"
                    className={`w-full pl-18 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 tracking-wider focus:bg-white focus:outline-none focus:ring-2 ${currentTheme.ringColor} transition-all min-h-[44px]`}
                  />
                </div>
              </div>

              {/* Login Sub-Toggle: PIN vs OTP (Only shown in Login mode) */}
              {mode === 'login' && (
                <div className="flex items-center gap-2 pt-1 pb-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('pin');
                      setError('');
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[36px] ${
                      loginMethod === 'pin'
                        ? `${currentTheme.themeBg} ${currentTheme.themeText} border ${currentTheme.themeBorder}`
                        : 'text-slate-500 hover:text-slate-800 bg-slate-50'
                    }`}
                  >
                    {t(lang, 'pinLogin')}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('otp');
                      setError('');
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[36px] ${
                      loginMethod === 'otp'
                        ? `${currentTheme.themeBg} ${currentTheme.themeText} border ${currentTheme.themeBorder}`
                        : 'text-slate-500 hover:text-slate-800 bg-slate-50'
                    }`}
                  >
                    {t(lang, 'otpLogin')}
                  </button>
                </div>
              )}

              {/* PIN input: Shown if in signup mode OR in login mode with PIN method */}
              {(mode === 'signup' || (mode === 'login' && loginMethod === 'pin')) && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      {mode === 'signup' ? (lang === 'mr' ? '४ अंकी PIN सेट करा' : 'Set 4-Digit PIN') : t(lang, 'enterPin')} *
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">४ अंक (4 digits)</span>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPin ? 'text' : 'password'}
                      required
                      maxLength={4}
                      pattern="[0-9]{4}"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••"
                      className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg font-black tracking-widest text-slate-900 focus:bg-white focus:outline-none focus:ring-2 ${currentTheme.ringColor} transition-all min-h-[44px]`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* OTP Mode in Login: Send OTP + Enter OTP */}
              {mode === 'login' && loginMethod === 'otp' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={sendingOtp || !phone || phone.length < 10}
                      onClick={handleSendOtp}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${currentTheme.btnBg} min-h-[44px]`}
                    >
                      {sendingOtp ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{lang === 'mr' ? 'OTP पाठवत आहे...' : 'Sending OTP...'}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>{otpSent ? (lang === 'mr' ? 'OTP पुन्हा पाठवा' : 'Resend OTP') : t(lang, 'sendOtp')}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {otpSent && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {t(lang, 'enterOtp')} *
                      </label>
                      <div className="relative">
                        <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          maxLength={4}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="1234"
                          className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg font-black tracking-widest text-slate-900 focus:bg-white focus:outline-none focus:ring-2 ${currentTheme.ringColor} min-h-[44px]`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Main Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 px-4 rounded-2xl text-white font-extrabold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed ${currentTheme.btnBg} min-h-[48px]`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{lang === 'mr' ? 'प्रक्रिया चालू आहे...' : 'Processing...'}</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'login' ? t(lang, 'loginBtn') : t(lang, 'signupBtn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Demo Login Section */}
          <div className="bg-slate-50 border-t border-slate-100 p-4 sm:p-5">
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <p className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                {t(lang, 'demoLogin')} (१-टॅप लॉगिन)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Farmer Demo */}
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('9822481092', '1234', 'farmer')}
                className="p-2.5 rounded-xl border border-agri-300 bg-white hover:bg-agri-50 text-left transition-all group cursor-pointer active:scale-95 shadow-xs flex flex-col justify-between min-h-[58px]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-agri-900">🌾 Demo Farmer</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-agri-100 text-agri-800 font-semibold">
                    1234
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">9822481092</span>
              </button>

              {/* Buyer Demo */}
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('9850001234', '1234', 'buyer')}
                className="p-2.5 rounded-xl border border-highway-300 bg-white hover:bg-highway-50 text-left transition-all group cursor-pointer active:scale-95 shadow-xs flex flex-col justify-between min-h-[58px]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-highway-900">🏪 Demo Buyer</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-highway-100 text-highway-800 font-semibold">
                    1234
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">9850001234</span>
              </button>

              {/* Admin Demo */}
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('9999999999', '1234', 'admin')}
                className="p-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-left transition-all group cursor-pointer active:scale-95 shadow-xs flex flex-col justify-between min-h-[58px]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">⚙️ Demo Admin</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-semibold">
                    1234
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">9999999999</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footnote */}
        <p className="text-center text-[11px] text-slate-400 mt-5 font-medium">
          FreshRoute Agri Logistics • सुरक्षित थेट शेतमाल खरेदी-विक्री प्लॅटफॉर्म
        </p>
      </div>
    </div>
  );
}
