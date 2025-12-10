import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, PlanType, PLAN_FEATURES } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, type: 'Individual' | 'Business') => void;
  logout: () => void;
  upgradePlan: (plan: PlanType) => void;
  deductCredit: () => boolean;
  hasFeatureAccess: (feature: string) => boolean;
  credits: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Simulate session restoration
    const savedUser = localStorage.getItem('genesys_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const saveUser = (u: UserProfile | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem('genesys_user', JSON.stringify(u));
    } else {
      localStorage.removeItem('genesys_user');
    }
  };

  const login = (email: string, type: 'Individual' | 'Business') => {
    // In a real app, this would validate against a backend
    // For now, we create a new session or restore if email matches (mock)
    
    // Default to Trial
    const newUser: UserProfile = {
      email,
      type,
      plan: 'TRIAL',
      creditsRemaining: 5,
      isTrialUsed: false
    };
    saveUser(newUser);
  };

  const logout = () => {
    saveUser(null);
  };

  const upgradePlan = (plan: PlanType) => {
    if (!user) return;
    
    const config = PLAN_FEATURES[plan];
    const updatedUser: UserProfile = {
      ...user,
      plan,
      creditsRemaining: config.scans,
      isTrialUsed: true // Once upgraded, trial is technically "over"/converted
    };
    saveUser(updatedUser);
  };

  const deductCredit = (): boolean => {
    if (!user) return false;
    
    if (user.creditsRemaining === -1) return true; // Unlimited

    if (user.creditsRemaining > 0) {
      const updatedUser = { ...user, creditsRemaining: user.creditsRemaining - 1 };
      saveUser(updatedUser);
      return true;
    }
    return false;
  };

  const hasFeatureAccess = (feature: string): boolean => {
    if (!user) return false;
    const allowed = PLAN_FEATURES[user.plan].features;
    return allowed.includes(feature);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      upgradePlan,
      deductCredit,
      hasFeatureAccess,
      credits: user?.creditsRemaining ?? 0
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
