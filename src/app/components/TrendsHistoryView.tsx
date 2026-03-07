import React, { useMemo, useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Calendar, 
  Filter, 
  Download, 
  Trash2,
  FileText,
  Clock,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface TrendsHistoryViewProps {
  reports?: any[];
  trends?: Record<string, any>;
  loading?: boolean;
  onDeleteReport?: (reportId: string) => Promise<void> | void;
}

// Color palette for dynamic chart lines
const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f43f5e', '#8b5cf6', '#f59e0b', 
  '#06b6d4', '#ec4899', '#14b8a6', '#6366f1', '#84cc16'
];

export const TrendsHistoryView: React.FC<TrendsHistoryViewProps> = ({ reports, trends, loading, onDeleteReport }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // Get all parameter names from trends
  const parameterNames = useMemo(() => {
    if (!trends || Object.keys(trends).length === 0) return [];
    return Object.keys(trends);
  }, [trends]);

  // Process trends data for charts
  const trendData = useMemo(() => {
    if (!trends || Object.keys(trends).length === 0) return [];

    const allTimestamps = new Set<number>();
    const parameterMaps: Record<string, Map<number, number>> = {};

    Object.entries(trends).forEach(([param, values]: [string, any]) => {
      if (!Array.isArray(values)) return;

      const valueByDate = new Map<number, number>();
      values.forEach((point: any) => {
        const pointDate = new Date(point?.date);
        if (Number.isNaN(pointDate.getTime())) return;

        const timestamp = new Date(
          pointDate.getFullYear(),
          pointDate.getMonth(),
          pointDate.getDate()
        ).getTime();
        const numericValue = Number(point?.value);
        if (!Number.isFinite(numericValue)) return;

        allTimestamps.add(timestamp);
        valueByDate.set(timestamp, numericValue);
      });

      parameterMaps[param] = valueByDate;
    });

    const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);

    return sortedTimestamps.map((timestamp) => {
      const dateObj = new Date(timestamp);
      const dataPoint: any = {
        date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }),
        rawDate: timestamp,
      };

      Object.entries(parameterMaps).forEach(([param, valueMap]) => {
        const value = valueMap.get(timestamp);
        if (typeof value === 'number') {
          dataPoint[param] = value;
        }
      });

      return dataPoint;
    });
  }, [trends]);

  const trendDateRangeLabel = useMemo(() => {
    if (trendData.length === 0) return 'No Data';
    const first = new Date(trendData[0].rawDate);
    const last = new Date(trendData[trendData.length - 1].rawDate);
    const firstLabel = first.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const lastLabel = last.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return firstLabel === lastLabel ? firstLabel : `${firstLabel} - ${lastLabel}`;
  }, [trendData]);

  // Process reports for history
  const reportHistory = useMemo(() => {
    if (!reports || reports.length === 0) return [];

    return reports.slice(0, 5).map((report: any) => ({
      id: report._id || report.id,
      fileName: report.originalFileName || report.fileName || report.originalname || `Report_${report._id || report.id}.pdf`,
      date: new Date(report.reportDate || report.createdAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      paramCount: report.parameters?.length || 0,
      status: 'Final'
    }));
  }, [reports]);

  const handleDelete = async (reportId: string) => {
    if (!onDeleteReport) return;
    try {
      setDeletingId(reportId);
      await onDeleteReport(reportId);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
          <p className="text-slate-500">Loading trends data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Trends & History</h1>
          <p className="text-slate-500 max-w-2xl">
            Track your health journey over time. Visualize changes in key biomarkers and access your complete medical report history.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <Calendar size={18} />
            {trendDateRangeLabel}
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <Filter size={18} />
            Advanced Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {parameterNames.length > 0 ? (
          <>
            {/* Dynamic chart: first half of parameters */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Parameter Trends</h2>
                  <p className="text-sm text-slate-500">Tracking your biomarkers over time</p>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  {parameterNames.slice(0, Math.ceil(parameterNames.length / 2)).map((name, i) => (
                    <div key={name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-xs font-medium text-slate-600">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      {parameterNames.slice(0, Math.ceil(parameterNames.length / 2)).map((name, i) => (
                        <linearGradient key={name} id={`color-${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.1}/>
                          <stop offset="95%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                    {parameterNames.slice(0, Math.ceil(parameterNames.length / 2)).map((name, i) => (
                      <Area 
                        key={name}
                        type="monotone" 
                        dataKey={name}
                        stroke={CHART_COLORS[i % CHART_COLORS.length]}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill={`url(#color-${i})`}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Dynamic chart: second half of parameters */}
            {parameterNames.length > 1 && (
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Additional Trends</h2>
                    <p className="text-sm text-slate-500">Other tracked biomarkers</p>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    {parameterNames.slice(Math.ceil(parameterNames.length / 2)).map((name, i) => {
                      const colorIdx = i + Math.ceil(parameterNames.length / 2);
                      return (
                        <div key={name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[colorIdx % CHART_COLORS.length] }} />
                          <span className="text-xs font-medium text-slate-600">{name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                      {parameterNames.slice(Math.ceil(parameterNames.length / 2)).map((name, i) => {
                        const colorIdx = i + Math.ceil(parameterNames.length / 2);
                        return (
                          <Line 
                            key={name}
                            type="monotone" 
                            dataKey={name}
                            stroke={CHART_COLORS[colorIdx % CHART_COLORS.length]}
                            strokeWidth={3}
                            dot={{ r: 5, fill: CHART_COLORS[colorIdx % CHART_COLORS.length], strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 7, strokeWidth: 0 }}
                          />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="xl:col-span-2 bg-white p-12 rounded-[32px] border border-slate-100 shadow-sm text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-bold text-slate-700 mb-2">No Trend Data Yet</h3>
            <p className="text-slate-500 text-sm">Upload multiple blood reports to start tracking parameter trends over time.</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Report History</h2>
            <p className="text-sm text-slate-500">Access and download your previous blood test reports</p>
          </div>
          <button className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:underline">
            Request Records Transfer
            <ArrowRight size={16} />
          </button>
        </div>
        
        <div className="divide-y divide-slate-50">
          {reportHistory.length > 0 ? reportHistory.map((report) => (
            <div key={report.id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{report.fileName}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Calendar size={12} />
                      {report.date}
                    </span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Clock size={12} />
                      {report.paramCount} parameters
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {report.status}
                </div>
                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                  <Download size={20} />
                </button>
                <button
                  onClick={() => handleDelete(report.id)}
                  disabled={deletingId === report.id || !onDeleteReport}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete report"
                >
                  {deletingId === report.id ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                </button>
              </div>
            </div>
          )) : (
            <div className="p-12 text-center text-slate-400">
              <p className="font-medium">No reports uploaded yet.</p>
            </div>
          )}
        </div>
        
        <div className="p-6 bg-slate-50/50 text-center">
          <button className="text-sm font-bold text-slate-500 hover:text-slate-800">
            View All Historical Records
          </button>
        </div>
      </div>
    </div>
  );
};
