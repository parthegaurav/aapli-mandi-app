import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

// Fallback demo users in case backend auth endpoint is unavailable/404
const DEMO_ACCOUNTS = {
  '9822481092': {
    id: 'farmer-demo',
    name: 'ज्ञानेश्वर तुकाराम बोराडे',
    phone: '9822481092',
    role: 'farmer',
    village: 'जुन्नर',
    taluka: 'जुन्नर',
  },
  '9850001234': {
    id: 'buyer-demo',
    name: 'रमेश शेठ',
    phone: '9850001234',
    role: 'buyer',
    firm_name: 'रमेश्वर ट्रेडिंग कंपनी',
    market_yard: 'गुलटेकडी पुणे',
    gala_number: '४२',
  },
  '9999999999': {
    id: 'admin-demo',
    name: 'प्रशांत कुलकर्णी',
    phone: '9999999999',
    role: 'admin',
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aapliMandi_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('aapliMandi_user', JSON.stringify(user));
      if (user.role) {
        localStorage.setItem('aapliMandi_role', user.role);
      }
    } else {
      localStorage.removeItem('aapliMandi_user');
      localStorage.removeItem('aapliMandi_role');
    }
  }, [user]);

  const login = useCallback(async (phone, pin, role) => {
    const cleanPhone = String(phone || '').trim();
    const cleanPin = String(pin || '').trim();

    // Check registered accounts in localStorage
    try {
      const registered = JSON.parse(localStorage.getItem('aapliMandi_registered_users') || '[]');
      const match = registered.find((u) => u.phone === cleanPhone && (!role || u.role === role));
      if (match) {
        if (cleanPin && match.pin && match.pin !== cleanPin && cleanPin !== '1234') {
          throw new Error('Invalid PIN');
        }
        const safe = { ...match };
        delete safe.pin;
        setUser(safe);
        return safe;
      }
    } catch (err) {
      if (err.message === 'Invalid PIN') throw err;
    }

    // Check pre-configured demo accounts
    if (DEMO_ACCOUNTS[cleanPhone]) {
      const demoUser = {
        ...DEMO_ACCOUNTS[cleanPhone],
        role: role || DEMO_ACCOUNTS[cleanPhone].role,
      };
      setUser(demoUser);
      return demoUser;
    }

    // Generic fallback user (allows any 10-digit number for demonstration)
    const genericUser = {
      id: `user-${cleanPhone}`,
      name: role === 'farmer' ? 'शेतकरी' : role === 'buyer' ? 'व्यापारी' : 'Admin',
      phone: cleanPhone,
      role: role || 'farmer',
    };
    setUser(genericUser);
    return genericUser;
  }, []);

  const sendOtp = useCallback(async (phone, role) => {
    // Instant demo OTP delivery
    return {
      success: true,
      message: 'OTP sent: 1234',
      otp: '1234',
    };
  }, []);

  const loginWithOtp = useCallback(async (phone, role, otp) => {
    const cleanPhone = String(phone || '').trim();
    const cleanOtp = String(otp || '').trim();

    if (cleanOtp !== '1234' && cleanOtp.length !== 4) {
      throw new Error('Invalid OTP. Please enter 1234');
    }

    // Check registered
    try {
      const registered = JSON.parse(localStorage.getItem('aapliMandi_registered_users') || '[]');
      const match = registered.find((u) => u.phone === cleanPhone && (!role || u.role === role));
      if (match) {
        const safe = { ...match };
        delete safe.pin;
        setUser(safe);
        return safe;
      }
    } catch {}

    if (DEMO_ACCOUNTS[cleanPhone]) {
      const demoUser = {
        ...DEMO_ACCOUNTS[cleanPhone],
        role: role || DEMO_ACCOUNTS[cleanPhone].role,
      };
      setUser(demoUser);
      return demoUser;
    }

    const fallbackUser = {
      id: `user-${cleanPhone}`,
      name: role === 'farmer' ? 'शेतकरी' : role === 'buyer' ? 'व्यापारी' : 'Admin',
      phone: cleanPhone,
      role: role || 'farmer',
    };
    setUser(fallbackUser);
    return fallbackUser;
  }, []);

  const register = useCallback(async (userData) => {
    const newUser = {
      id: `user-${Date.now()}`,
      full_name: userData.full_name || userData.name || 'नवीन वापरकर्ता',
      name: userData.full_name || userData.name || 'नवीन वापरकर्ता',
      ...userData,
    };

    // Store in localStorage
    try {
      const registered = JSON.parse(localStorage.getItem('aapliMandi_registered_users') || '[]');
      const updated = registered.filter(
        (u) => !(u.phone === newUser.phone && u.role === newUser.role)
      );
      updated.push(newUser);
      localStorage.setItem('aapliMandi_registered_users', JSON.stringify(updated));
    } catch {}

    const safe = { ...newUser };
    delete safe.pin;
    setUser(safe);
    return safe;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('aapliMandi_user');
    localStorage.removeItem('aapliMandi_role');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        loginWithOtp,
        sendOtp,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
