import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import LoginScreen from './components/LoginScreen.jsx';
import RoleHeader from './components/RoleHeader.jsx';
import BottomNav from './components/BottomNav.jsx';
import FarmerView from './components/FarmerView.jsx';
import WholesalerView from './components/WholesalerView.jsx';
import AdminView from './components/AdminView.jsx';
import WhatsAppFloatingButton from './components/WhatsAppFloatingButton.jsx';
import { crops } from './data/crops.js';

function App() {
  const { user, logout } = useAuth();
  const [lang, setLang] = useState(() => localStorage.getItem('aapliMandi_lang') || 'mr');
  const [activeTab, setActiveTab] = useState('rates');
  const [cropsList, setCropsList] = useState(crops);
  const [farmerState, setFarmerState] = useState(null);
  const [wholesalerState, setWholesalerState] = useState(null);
  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.pathname || '/';
  });

  // Listen to browser navigation (back/forward or URL changes)
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigateToLogin = useCallback(() => {
    window.history.pushState({}, '', '/login');
    setCurrentPath('/login');
  }, []);

  const navigateToDashboard = useCallback(() => {
    window.history.pushState({}, '', '/');
    setCurrentPath('/');
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigateToLogin();
  }, [logout, navigateToLogin]);

  // Fetch crops from API
  const fetchCrops = useCallback(async () => {
    try {
      const res = await fetch('/api/products?all=true');
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) setCropsList(data);
      }
    } catch (err) {
      console.log('Using fallback crops data:', err);
    }
  }, []);

  useEffect(() => {
    fetchCrops();
  }, [fetchCrops]);

  useEffect(() => {
    localStorage.setItem('aapliMandi_lang', lang);
  }, [lang]);

  // Reset active tab when user changes (on login)
  useEffect(() => {
    if (user) {
      if (user.role === 'farmer') setActiveTab('rates');
      else if (user.role === 'buyer') setActiveTab('catalog');
      else if (user.role === 'admin') setActiveTab('rates');
    }
  }, [user]);

  // If not logged in OR if URL is explicitly /login, show login screen
  const isLoginPage = !user || currentPath === '/login' || currentPath.endsWith('/login') || window.location.hash.includes('login');

  if (isLoginPage) {
    return (
      <LoginScreen
        lang={lang}
        setLang={setLang}
        onLoginSuccess={navigateToDashboard}
        onBack={user ? navigateToDashboard : null}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative pb-20">
      <RoleHeader
        user={user}
        lang={lang}
        setLang={setLang}
        onLogout={handleLogout}
        onGoToLogin={navigateToLogin}
      />

      <main className="max-w-lg mx-auto px-3 sm:px-4 py-4">
        {/* FARMER VIEW */}
        {user.role === 'farmer' && (
          <FarmerView
            lang={lang}
            crops={cropsList}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            user={user}
            onBookingChange={setFarmerState}
          />
        )}

        {/* BUYER VIEW */}
        {user.role === 'buyer' && (
          <WholesalerView
            lang={lang}
            crops={cropsList}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            user={user}
            onCartChange={setWholesalerState}
          />
        )}

        {/* ADMIN VIEW */}
        {user.role === 'admin' && (
          <AdminView
            lang={lang}
            crops={cropsList}
            onCropsUpdated={fetchCrops}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      <BottomNav
        role={user.role}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
      />

      {/* WhatsApp Floating Action Button */}
      {user.role !== 'admin' && (
        <WhatsAppFloatingButton
          activeRole={user.role === 'farmer' ? 'farmer' : 'wholesaler'}
          lang={lang}
          farmerState={farmerState}
          wholesalerState={wholesalerState}
          crops={cropsList}
        />
      )}

      <footer className="text-center py-6 text-xs text-gray-400 border-t border-gray-100 mt-8 pb-24">
        <p>🌿 आपली मंडी (Aapli Mandi) — Powered by FreshRoute Agri Logistics</p>
        <p className="mt-1">
          शेतकऱ्यांचा शेतमाल, थेट मार्केट यार्डला | Farm-to-Market in 6-10 Hours
        </p>
      </footer>
    </div>
  );
}

export default App;
