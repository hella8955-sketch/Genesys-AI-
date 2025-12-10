import React from 'react';
import { ShieldCheck, Activity, MessageSquare } from 'lucide-react';
import { AppMode } from '../types';

interface HeaderProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

const Header: React.FC<HeaderProps> = ({ currentMode, setMode }) => {
  const navItems = [
    { mode: AppMode.SCAN, icon: ShieldCheck, label: 'Detector' },
    { mode: AppMode.LIVE, icon: Activity, label: 'Live' },
    { mode: AppMode.CHAT, icon: MessageSquare, label: 'Chat' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-cyan-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-cyan-400" />
            <span className="text-xl font-display font-bold text-white tracking-wider">
              GENESYS<span className="text-cyan-400">.AI</span>
            </span>
          </div>
          
          <nav className="flex gap-4">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setMode(item.mode)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                  currentMode === item.mode
                    ? 'text-cyan-400 bg-cyan-950/30'
                    : 'text-slate-400 hover:text-cyan-200'
                }`}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;