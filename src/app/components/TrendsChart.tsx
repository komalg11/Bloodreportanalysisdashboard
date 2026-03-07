import React from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceArea,
  ReferenceLine
} from 'recharts';
import { parseReferenceRange } from '@/lib/parameterUtils';

interface TrendsChartProps {
  parameterName: string;
  color?: string;
  data?: { date: string; value: number }[];
  referenceRange?: string;
}

export const TrendsChart: React.FC<TrendsChartProps> = ({
  parameterName,
  color = "#3b82f6",
  data,
  referenceRange
}) => {
  const chartData = data && data.length > 0
    ? data.map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        value: Number(d.value)
      }))
    : [];
  const { low, high } = parseReferenceRange(referenceRange);

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-slate-400">
        <p className="text-sm">No trend data available for {parameterName}. Upload more reports to see trends.</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.1}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          {low !== null && high !== null && (
            <ReferenceArea y1={low} y2={high} fill="#10b981" fillOpacity={0.08} />
          )}
          {low !== null && <ReferenceLine y={low} stroke="#f59e0b" strokeDasharray="4 4" />}
          {high !== null && <ReferenceLine y={high} stroke="#f59e0b" strokeDasharray="4 4" />}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }} 
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorValue)" 
            dot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
