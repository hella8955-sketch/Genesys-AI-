import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, User, Building2, Apple, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'Individual' | 'Business'>('Individual');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate network delay
    setTimeout(() => {
      login(email, userType);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black p-4">
      <div className="w-full max-w-md">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ShieldCheck className="w-10 h-10 text-cyan-400" />
            <span className="text-3xl font-display font-bold text-white tracking-wider">
              GENESYS<span className="text-cyan-400">.AI</span>
            </span>
          </div>
          <p className="text-slate-400">Enterprise Grade Media Forensics</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
          
          <div className="flex gap-4 mb-6 bg-slate-950/50 p-1 rounded-xl">
             <button 
               onClick={() => setIsLogin(true)}
               className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isLogin ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
             >
               Login
             </button>
             <button 
               onClick={() => setIsLogin(false)}
               className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isLogin ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
             >
               Sign Up
             </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setUserType('Individual')}
                  className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${userType === 'Individual' ? 'border-cyan-500 bg-cyan-950/20 text-cyan-400' : 'border-slate-700 bg-slate-900 text-slate-400'}`}
                >
                  <User size={20} />
                  <span className="text-xs font-bold">Individual</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('Business')}
                  className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${userType === 'Business' ? 'border-cyan-500 bg-cyan-950/20 text-cyan-400' : 'border-slate-700 bg-slate-900 text-slate-400'}`}
                >
                  <Building2 size={20} />
                  <span className="text-xs font-bold">Business</span>
                </button>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-medium text-slate-400 ml-1">Password</label>
               <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="animate-pulse">Authenticating...</span>
              ) : (
                <>
                  {isLogin ? 'Access Dashboard' : 'Start Free Trial'} <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-800"></div>
            <span className="text-xs text-slate-500">Or continue with</span>
            <div className="h-px flex-1 bg-slate-800"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-2.5 bg-slate-950 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors text-slate-300 text-sm font-medium">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.2 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-2.5 bg-slate-950 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors text-slate-300 text-sm font-medium">
              <Apple className="w-5 h-5" />
              Apple
            </button>
          </div>

          {!isLogin && (
            <p className="text-center text-xs text-slate-500 mt-6">
              By joining, you get 5 free forensic scans with full feature access. No credit card required.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
