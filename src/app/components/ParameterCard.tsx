import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export type Status = 'normal' | 'high' | 'low' | 'borderline';

export interface Parameter {
  id: string;
  name: string;
  value: number;
  unit: string;
  range: string;
  status: Status;
  description: string;
  trend: 'up' | 'down' | 'stable';
}

interface ParameterCardProps {
  parameter: Parameter;
  onClick: (param: Parameter) => void;
}

const statusColors = {
  normal: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  high: 'text-rose-600 bg-rose-50 border-rose-100',
  low: 'text-rose-600 bg-rose-50 border-rose-100',
  borderline: 'text-amber-600 bg-amber-50 border-amber-100',
};

const statusIcons = {
  normal: <CheckCircle2 size={14} />,
  high: <AlertCircle size={14} />,
  low: <AlertCircle size={14} />,
  borderline: <AlertCircle size={14} />,
};

export const ParameterCard: React.FC<ParameterCardProps> = ({ parameter, onClick }) => {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      onClick={() => onClick(parameter)}
      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-slate-500 text-sm font-medium mb-1 group-hover:text-slate-800 transition-colors">
            {parameter.name}
          </h3>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-800">{parameter.value}</span>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{parameter.unit}</span>
          </div>
        </div>
        <div className={cn(
          "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border",
          statusColors[parameter.status]
        )}>
          {statusIcons[parameter.status]}
          {parameter.status}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-[11px] text-slate-400 font-medium uppercase tracking-tight">
          <span>Normal Range: {parameter.range}</span>
          <div className="flex items-center gap-1">
            {parameter.trend === 'up' && <ArrowUpRight size={12} className="text-rose-500" />}
            {parameter.trend === 'down' && <ArrowDownRight size={12} className="text-emerald-500" />}
            {parameter.trend === 'stable' && <Minus size={12} className="text-slate-300" />}
            <span>{parameter.trend}</span>
          </div>
        </div>
        
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
          {(() => {
            // Calculate progress percentage based on reference range
            const rangeMatch = parameter.range.match(/(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)/);
            let percent = 50;
            if (rangeMatch) {
              const low = parseFloat(rangeMatch[1]);
              const high = parseFloat(rangeMatch[2]);
              const span = high - low;
              if (span > 0) {
                percent = Math.min(Math.max(((parameter.value - low) / span) * 100, 5), 100);
              }
            } else {
              // For ranges like "< 200", use value/max
              const ltMatch = parameter.range.match(/[<≤]\s*(\d+\.?\d*)/);
              if (ltMatch) {
                const max = parseFloat(ltMatch[1]);
                percent = Math.min(Math.max((parameter.value / max) * 100, 5), 100);
              } else {
                percent = Math.min(Math.max((parameter.value / 200) * 100, 10), 100);
              }
            }
            return (
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  parameter.status === 'normal' ? "bg-emerald-500" : 
                  parameter.status === 'borderline' ? "bg-amber-500" : "bg-rose-500"
                )}
                style={{ width: `${percent}%` }}
              />
            );
          })()}
        </div>
      </div>
    </motion.div>
  );
};
