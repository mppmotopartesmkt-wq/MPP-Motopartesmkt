import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile } from '../types';

interface AuthContextType {
  profile: Profile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loginAsDemoUser: (role?: 'customer' | 'admin') => void;
  logout: () => void;
  updateProfile: (data: Partial<Profile>) => void;
}

const DEFAULT_DEMO_CUSTOMER: Profile = {
  id: 'd1111111-1111-1111-1111-111111111111',
  full_name: 'Carlos Rodríguez',
  email: 'carlos.rider@example.com',
  document_type: 'CC',
  document_number: '1020304050',
  phone: '+57 300 123 4567',
  address: 'Carrera 15 # 85-30, Apto 402',
  city: 'Bogotá',
  role: 'customer',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(() => {
    try {
      const saved = localStorage.getItem('ridez_profile');
      return saved ? JSON.parse(saved) : DEFAULT_DEMO_CUSTOMER;
    } catch {
      return DEFAULT_DEMO_CUSTOMER;
    }
  });

  useEffect(() => {
    try {
      if (profile) {
        localStorage.setItem('ridez_profile', JSON.stringify(profile));
      } else {
        localStorage.removeItem('ridez_profile');
      }
    } catch (e) {
      console.error(e);
    }
  }, [profile]);

  const loginAsDemoUser = (role: 'customer' | 'admin' = 'customer') => {
    if (role === 'admin') {
      setProfile({
        id: 'a9999999-9999-9999-9999-999999999999',
        full_name: 'Admin MPR Repuestos',
        email: 'admin@mprrepuestos.com',
        role: 'admin',
        city: 'Medellín',
      });
    } else {
      setProfile(DEFAULT_DEMO_CUSTOMER);
    }
  };

  const logout = () => {
    setProfile(null);
  };

  const updateProfile = (data: Partial<Profile>) => {
    if (profile) {
      setProfile({ ...profile, ...data });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        profile,
        isAuthenticated: !!profile,
        isAdmin: profile?.role === 'admin',
        loginAsDemoUser,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
