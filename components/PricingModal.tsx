import React from 'react';
import { Check, Shield, Zap, Globe, Crown, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PlanType } from '../types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredFeature?: string;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, requiredFeature }) => {
  const { upgradePlan } = useAuth();

  if (!isOpen) return null;

  const handleSelect = (plan: PlanType) => {
    upgradePlan(plan);
    onClose();
  };

  const Feature = ({ text }: { text: string }) => (
    <div className="flex items-center gap-2 text-sm text-slate-400">
      <Check className="w-4 h-4 text-cyan-500" /> {text}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
          <X size={24} />
        </button>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-display font-bold text-white mb-2">Upgrade for Access</h2>
          {requiredFeature && (
            <div className="inline-block bg-cyan-900/30 text-cyan-400 px-3 py-1 rounded-full text-sm font-medium mb-2 border border-cyan-500/30">
              Feature Locked: {requiredFeature}
            </div>
          )}
          <p className="text-slate-400">Choose a plan to continue verifying media authenticity.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* STARTER */}
          <div className="border border-slate-700 bg-slate-950/50 rounded-xl p-6 flex flex-col hover:border-slate-500 transition-colors">
            <div className="mb-4">
              <Shield className="w-8 h-8 text-slate-400 mb-2" />
              <h3 className="text-xl font-bold text-white">Starter</h3>
              <p className="text-sm text-slate-500">For individuals</p>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold text-white">$9</span><span className="text-slate-500">/mo</span>
            </div>
            <div className="space-y-3 flex-1 mb-6">
              <Feature text="20 Scans per month" />
              <Feature text="Basic Deepfake Detection" />
              <Feature text="Detailed Analysis Report" />
            </div>
            <button 
              onClick={() => handleSelect('STARTER')}
              className="w-full py-3 rounded-lg border border-slate-700 text-white font-medium hover:bg-slate-800 transition-colors"
            >
              Select Starter
            </button>
          </div>

          {/* INTERMEDIATE */}
          <div className="border border-cyan-500/30 bg-slate-900 rounded-xl p-6 flex flex-col relative transform hover:scale-105 transition-transform duration-300">
            <div className="absolute top-0 right-0 bg-cyan-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
              POPULAR
            </div>
            <div className="mb-4">
              <Zap className="w-8 h-8 text-cyan-400 mb-2" />
              <h3 className="text-xl font-bold text-white">Intermediate</h3>
              <p className="text-sm text-slate-500">Power users</p>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold text-white">$23</span><span className="text-slate-500">/mo</span>
            </div>
            <div className="space-y-3 flex-1 mb-6">
              <Feature text="50 Scans per month" />
              <Feature text="Google Search Verification" />
              <Feature text="Genesys AI Chatbot" />
              <Feature text="Priority Processing" />
            </div>
            <button 
              onClick={() => handleSelect('INTERMEDIATE')}
              className="w-full py-3 rounded-lg bg-cyan-600 text-white font-bold hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-500/20"
            >
              Select Intermediate
            </button>
          </div>

          {/* BUSINESS */}
          <div className="border border-purple-500/30 bg-slate-950/50 rounded-xl p-6 flex flex-col hover:border-purple-500/50 transition-colors">
            <div className="mb-4">
              <Crown className="w-8 h-8 text-purple-400 mb-2" />
              <h3 className="text-xl font-bold text-white">Business</h3>
              <p className="text-sm text-slate-500">Enterprise grade</p>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold text-white">$99</span><span className="text-slate-500">/mo</span>
            </div>
            <div className="space-y-3 flex-1 mb-6">
              <Feature text="Unlimited Scans" />
              <Feature text="All Verification Tools (Maps)" />
              <Feature text="Live Audio Chat" />
              <Feature text="API Access" />
            </div>
            <button 
              onClick={() => handleSelect('BUSINESS')}
              className="w-full py-3 rounded-lg border border-purple-500/50 text-purple-300 font-medium hover:bg-purple-900/20 transition-colors"
            >
              Select Business
            </button>
          </div>

        </div>
        <p className="text-center text-xs text-slate-600 mt-8">Secure payment processing via Stripe. Cancel anytime.</p>
      </div>
    </div>
  );
};

export default PricingModal;
