import React, { useState } from 'react';
import { ParameterCard, Parameter } from '@/app/components/ParameterCard';
import { 
  LayoutGrid, 
  List, 
  Search, 
  Filter, 
  ArrowUpDown,
  Download,
  Share2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface ParametersViewProps {
  parameters: Parameter[];
  onSelectParameter: (param: Parameter) => void;
}

export const ParametersView: React.FC<ParametersViewProps> = ({ parameters, onSelectParameter }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'normal' | 'low' | 'high' | 'borderline'>('all');

  const filteredParameters = parameters.filter(param => {
    const matchesSearch = param.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || param.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Report Parameters</h1>
          <p className="text-slate-500 max-w-2xl">
            Detailed view of all parameters extracted from your blood reports. Click on any parameter to view historical trends and clinical significance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={18} />
            Export Data
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 rounded-xl text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-200">
            <Share2 size={18} />
            Share Report
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search parameters..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="flex-1 md:flex-none px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
            <option value="high">High</option>
            <option value="borderline">Borderline</option>
          </select>

          <div className="h-8 w-px bg-slate-200 hidden md:block" />

          <div className="flex items-center bg-slate-50 border border-slate-200 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                viewMode === 'grid' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                viewMode === 'list' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredParameters.map((param) => (
            <ParameterCard 
              key={param.id} 
              parameter={param} 
              onClick={onSelectParameter}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Parameter</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ref. Range</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trend</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParameters.map((param) => (
                <tr 
                  key={param.id} 
                  className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                  onClick={() => onSelectParameter(param)}
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{param.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-baseline gap-1">
                      <span className="font-bold text-slate-900">{param.value}</span>
                      <span className="text-xs text-slate-500">{param.unit}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-500 font-medium">{param.range}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      param.status === 'normal' && "bg-emerald-50 text-emerald-600 border border-emerald-100",
                      param.status === 'borderline' && "bg-amber-50 text-amber-600 border border-amber-100",
                      param.status === 'low' && "bg-rose-50 text-rose-600 border border-rose-100",
                      param.status === 'high' && "bg-rose-50 text-rose-600 border border-rose-100",
                    )}>
                      {param.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "flex items-center gap-1 text-sm font-medium",
                      param.trend === 'up' && "text-rose-500",
                      param.trend === 'down' && "text-emerald-500",
                      param.trend === 'stable' && "text-slate-400",
                    )}>
                      {param.trend === 'up' && 'Increasing'}
                      {param.trend === 'down' && 'Decreasing'}
                      {param.trend === 'stable' && 'Stable'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 font-bold text-sm hover:underline">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredParameters.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Search className="text-slate-300" size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-700">
            {parameters.length === 0 ? 'No Report Parameters Yet' : 'No parameters found'}
          </h3>
          <p className="text-slate-500">
            {parameters.length === 0 
              ? 'Upload a blood report to extract and view all your parameters here.'
              : 'Try adjusting your search or filters to find what you\'re looking for.'
            }
          </p>
        </div>
      )}
    </div>
  );
};