import React from 'react';
import { ArrowLeft, Info, TrendingUp, History, Download } from 'lucide-react';
import { Parameter } from './ParameterCard';
import { TrendsChart } from './TrendsChart';
import { findTrendByParameterName, normalizeStatus, toNumericValue } from '@/lib/parameterUtils';

interface DetailViewProps {
  parameter: Parameter;
  onClose: () => void;
  trends?: Record<string, any>;
}

export const DetailView: React.FC<DetailViewProps> = ({ parameter, onClose, trends }) => {
  // Get trend data for this specific parameter (case-insensitive fallback)
  const paramTrendData = findTrendByParameterName(trends, parameter.name);

  // Build past readings from trend data
  const pastReadings = paramTrendData.length > 0
    ? paramTrendData.map((point: any) => ({
        date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        value: point.value,
        status: normalizeStatus(undefined, toNumericValue(point.value), parameter.range),
      })).reverse()
    : [{ date: 'Latest', value: parameter.value, status: parameter.status }];

  return (
    <div className="space-y-6">
      <button
        onClick={onClose}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Summary & Value */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <h2 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">{parameter.name}</h2>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-black text-slate-900">{parameter.value}</span>
              <span className="text-lg text-slate-400 font-bold">{parameter.unit}</span>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Status</p>
                <p className="text-lg font-bold text-slate-800 capitalize">{parameter.status}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Normal Range</p>
                <p className="text-lg font-bold text-slate-800">{parameter.range}</p>
              </div>
            </div>

            <button className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
              <Download size={18} />
              Export Parameter History
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4 text-blue-700">
              <Info size={20} />
              <h3 className="font-bold">About {parameter.name}</h3>
            </div>
            <p className="text-blue-900/70 text-sm leading-relaxed">
              {parameter.description}
            </p>
          </div>
        </div>

        {/* Right: Trends & Visualization */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Historical Trends</h3>
                  <p className="text-sm text-slate-500">Showing data from last 4 months</p>
                </div>
              </div>

              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                {['Weekly', 'Monthly', 'Yearly'].map((tab) => (
                  <button
                    key={tab}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${tab === 'Monthly' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <TrendsChart parameterName={parameter.name} data={paramTrendData} referenceRange={parameter.range} />
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600">
                <History size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Past Readings</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Value</th>
                    <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pastReadings.map((row: any, i: number) => (
                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 text-sm font-semibold text-slate-700">{row.date}</td>
                      <td className="py-4 text-sm font-bold text-slate-900">{row.value} {parameter.unit}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          row.status === 'normal' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          row.status === 'low' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          row.status === 'high' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
