import React from 'react';
import { motion } from 'motion/react';
import { Activity, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface LoginScreenProps {
  onLogin: () => void;
  onCreateAccount?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onCreateAccount }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 w-full max-w-5xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Left Side - Image/Branding */}
        <div className="md:w-1/2 bg-blue-600 p-8 lg:p-12 text-white flex flex-col relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                <Activity className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold">HemoX</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
              Modern Blood Report Analysis System
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed mb-8 max-w-md">
              A comprehensive health dashboard for tracking your blood parameters, trends, and diagnostic insights.
            </p>
            
            <div className="space-y-4">
              {[
                "AI-Powered Parameter Extraction",
                "Historical Trend Visualization",
                "Personalized Health Insights",
                "Secure & Private Data Storage"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-400/30 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <span className="text-sm font-medium text-blue-50">{text}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="absolute bottom-0 right-0 w-full h-1/2 opacity-20 pointer-events-none">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1650897492548-e169a9857373?auto=format&fit=crop&q=80&w=1080"
              alt="Medical background"
              className="object-cover h-full w-full"
            />
          </div>
          
          <div className="mt-auto relative z-10 pt-12 flex items-center gap-2 text-blue-200 text-xs">
            <ShieldCheck size={14} />
            <span>HIPAA Compliant Data Handling</span>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-8 lg:p-16 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome Back</h2>
              <p className="text-slate-500">Sign in to access your health reports</p>
            </div>

            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Email or Patient ID</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="alex@example.com"
                    defaultValue="alex@example.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-sm font-bold text-slate-700">Password</label>
                  <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-700">Forgot Password?</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    defaultValue="password123"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 px-1">
                <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor="remember" className="text-sm text-slate-600 font-medium cursor-pointer">Remember this device</label>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-[0.98]"
              >
                Sign In
                <ArrowRight size={18} />
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-10">
              Don't have an account?{' '}
              <button 
                onClick={onCreateAccount}
                className="font-bold text-blue-600 hover:text-blue-700"
              >
                Create an account
              </button>
            </p>
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-6 text-center text-slate-400 text-xs font-medium uppercase tracking-widest">
        Educational Project • v1.0.4
      </div>
    </div>
  );
};
