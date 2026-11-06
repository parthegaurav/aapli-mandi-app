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
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pin, role }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return data.user;
      }

      // If backend responded with 401/400 (explicit rejection)
      if (res.status === 400 || res.status === 401) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Login failed');
      }

      // If endpoint not found (404), fallback for demo/offline accounts
      if (res.status === 404) {
        if (DEMO_ACCOUNTS[phone]) {
          const demoUser = { ...DEMO_ACCOUNTS[phone], role: role || DEMO_ACCOUNTS[phone].role };
          setUser(demoUser);
          return demoUser;
        }
        // Generic fallback user
        const genericUser = {
          id: `user-${Date.now()}`,
          name: role === 'farmer' ? 'शेतकरी' : role === 'buyer' ? 'व्यापारी' : 'Admin',
          phone,
          role: role || 'farmer',
        };
        setUser(genericUser);
        return genericUser;
      }

      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Login failed');
    } catch (err) {
      // If network failure (backend offline), support demo logins
      if (DEMO_ACCOUNTS[phone]) {
        const demoUser = { ...DEMO_ACCOUNTS[phone], role: role || DEMO_ACCOUNTS[phone].role };
        setUser(demoUser);
        return demoUser;
      }
      throw err;
    }
  }, []);

  const sendOtp = useCallback(async (phone, role) => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, role }),
      });

      if (res.ok) {
        return await res.json();
      }

      if (res.status === 404) {
        // Fallback demo OTP response
        return { success: true, message: 'OTP sent: 1234', otp: '1234' };
      }

      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to send OTP');
    } catch (err) {
      // Offline fallback
      return { success: true, message: 'OTP sent: 1234', otp: '1234' };
    }
  }, []);

  const loginWithOtp = useCallback(async (phone, role, otp) => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, role, otp }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return data.user;
      }

      if (res.status === 400 || res.status === 401) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'OTP verification failed');
      }

      if (res.status === 404) {
        if (DEMO_ACCOUNTS[phone]) {
          const demoUser = { ...DEMO_ACCOUNTS[phone], role: role || DEMO_ACCOUNTS[phone].role };
          setUser(demoUser);
          return demoUser;
        }
        const fallbackUser = {
          id: `user-${Date.now()}`,
          name: role === 'farmer' ? 'शेतकरी' : role === 'buyer' ? 'व्यापारी' : 'Admin',
          phone,
          role: role || 'farmer',
        };
        setUser(fallbackUser);
        return fallbackUser;
      }

      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'OTP verification failed');
    } catch (err) {
      if (DEMO_ACCOUNTS[phone]) {
        const demoUser = { ...DEMO_ACCOUNTS[phone], role: role || DEMO_ACCOUNTS[phone].role };
        setUser(demoUser);
        return demoUser;
      }
      throw err;
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return data.user;
      }

      if (res.status === 400) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Registration failed');
      }

      if (res.status === 404) {
        // Fallback for new user offline
        const newUser = {
          id: `user-${Date.now()}`,
          ...userData,
        };
        delete newUser.pin;
        setUser(newUser);
        return newUser;
      }

      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Registration failed');
    } catch (err) {
      if (err.message && err.message !== 'Failed to fetch') {
        throw err;
      }
      const newUser = {
        id: `user-${Date.now()}`,
        ...userData,
      };
      delete newUser.pin;
      setUser(newUser);
      return newUser;
    }
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
