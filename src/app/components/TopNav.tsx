import React from 'react';
import { 
  Bell, 
  Search, 
  ChevronDown, 
  Calendar,
  Menu
} from 'lucide-react';

interface TopNavProps {
  setIsMobileOpen: (open: boolean) => void;
  lastReportDate?: string | null;
}

export const TopNav: React.FC<TopNavProps> = ({ setIsMobileOpen, lastReportDate }) => {
  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8">
      <div className="h-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 lg:hidden"
          >
            <Menu size={20} />
          </button>
          
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-slate-500 text-sm">
            <Calendar size={14} />
            <span className="font-medium">Last Report Date: {lastReportDate || 'N/A'}</span>
            <ChevronDown size={14} />
          </div>
        </div>

        <div className="flex items-center gap-3 lg:gap-6">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search parameters..." 
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all w-64"
            />
          </div>

          <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-all">
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
};
