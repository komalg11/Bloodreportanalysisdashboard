import React, { useMemo } from 'react';
import { 
  Lightbulb, 
  AlertCircle, 
  CheckCircle2, 
  TrendingDown, 
  TrendingUp,
  Brain,
  Info,
  Apple,
  Dumbbell,
  Moon,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface Insight {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  action: string;
}

interface InsightsViewProps {
  reports?: any[];
  loading?: boolean;
}

// Default insights for fallback
const defaultInsights: Insight[] = [
  {
    id: '1',
    title: 'Anemia Risk Detected',
    description: 'Your hemoglobin levels are slightly below the reference range (13.2 vs 13.5 g/dL). This may contribute to fatigue and low energy levels.',
    type: 'warning',
    category: 'Hematology',
    action: 'Increase iron-rich foods like spinach, lentils, and red meat.'
  },
  {
    id: '2',
    title: 'Lipid Management Needed',
    description: 'Total cholesterol is at 205 mg/dL, which is considered borderline high. Early lifestyle changes can prevent further increases.',
    type: 'caution',
    category: 'Cardiovascular',
    action: 'Reduce saturated fats and aim for 30 minutes of cardio 5 days a week.'
  },
  {
    id: '3',
    title: 'Optimal Glucose Levels',
    description: 'Your fasting blood sugar (92 mg/dL) is well within the normal healthy range, indicating good metabolic health.',
    type: 'success',
    category: 'Metabolic',
    action: 'Maintain current dietary habits and consistent exercise routine.'
  }
];

export const InsightsView: React.FC<InsightsViewProps> = ({ reports, loading }) => {
  // Process insights from reports
  const insights: Insight[] = useMemo(() => {
    if (!reports || reports.length === 0) {
      return defaultInsights;
    }

    // Get the latest report's analysis result
    const latestReport = reports[0];
    if (latestReport?.analysisResult) {
      const analysis = latestReport.analysisResult;
      const generatedInsights: any[] = [];

      // Parse AI-generated insights if available
      if (analysis.insights && Array.isArray(analysis.insights)) {
        return analysis.insights.map((insight: any, idx: number) => ({
          id: String(idx + 1),
          title: insight.title || 'Health Insight',
          description: insight.description || insight.message,
          type: insight.type || insight.severity || 'info',
          category: insight.category || 'General',
          action: insight.action || insight.recommendation || 'Consult your healthcare provider.'
        }));
      }

      // If insights is a string (from rules-based engine), use it as a summary
      // and generate per-parameter insights below
      const insightsSummary = typeof analysis.insights === 'string' ? analysis.insights : null;
      const recommendationsText = typeof analysis.recommendations === 'string' ? analysis.recommendations : null;

      // Generate insights from parameters if no AI insights
      if (latestReport.parameters && Array.isArray(latestReport.parameters)) {
        latestReport.parameters.forEach((param: any, idx: number) => {
          const statusLower = (param.status || '').toLowerCase();
          if (statusLower === 'low' || statusLower === 'high' || statusLower === 'borderline') {
            generatedInsights.push({
              id: String(idx + 1),
              title: `${param.name} ${statusLower === 'low' ? 'Below' : statusLower === 'high' ? 'Above' : 'Near'} Range`,
              description: `Your ${param.name} level is ${param.value} ${param.unit}, which is ${statusLower} compared to the reference range (${param.referenceRange || param.range || 'N/A'}).`,
              type: statusLower === 'borderline' ? 'caution' : 'warning',
              category: param.category || 'Blood Parameters',
              action: param.recommendation || 'Discuss with your healthcare provider for personalized advice.'
            });
          }
        });

        // Add a positive insight if most parameters are normal
        const normalCount = latestReport.parameters.filter((p: any) => (p.status || '').toLowerCase() === 'normal').length;
        if (normalCount > latestReport.parameters.length / 2) {
          generatedInsights.push({
            id: 'positive',
            title: 'Overall Health Looking Good',
            description: `${normalCount} out of ${latestReport.parameters.length} parameters are within normal range. Keep up the good work!`,
            type: 'success',
            category: 'Overall Health',
            action: 'Continue maintaining your current lifestyle and regular check-ups.'
          });
        }

        if (generatedInsights.length > 0) {
          // Add the overall summary insight at the top if available
          if (insightsSummary) {
            generatedInsights.unshift({
              id: 'summary',
              title: 'Health Summary',
              description: insightsSummary,
              type: generatedInsights.some((i: any) => i.type === 'warning') ? 'caution' : 'success',
              category: 'Overall',
              action: recommendationsText || 'Consult your healthcare provider for personalized advice.'
            });
          }
          return generatedInsights;
        }

        // If no abnormal params but we have a summary, show it
        if (insightsSummary) {
          return [{
            id: 'summary',
            title: 'Health Summary',
            description: insightsSummary,
            type: 'success',
            category: 'Overall',
            action: recommendationsText || 'Continue maintaining your current healthy lifestyle.'
          }];
        }
      }
    }

    return defaultInsights;
  }, [reports]);

  // Get last update date
  const lastUpdated = useMemo(() => {
    if (reports && reports.length > 0) {
      const date = new Date(reports[0].reportDate || reports[0].createdAt);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return 'Oct 24, 2025';
  }, [reports]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
          <p className="text-slate-500">Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">AI Insights & Summary</h1>
          <p className="text-slate-500 max-w-2xl">
            Automated analysis of your blood work using clinical guidelines. These insights are for informational purposes and should be discussed with your physician.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold uppercase tracking-wider border border-blue-100">
          <Brain size={16} />
          Analysis Updated {lastUpdated}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Lightbulb className="text-amber-500" size={24} />
            Key Observations
          </h2>
          
          <div className="space-y-4">
            {insights.map((insight, idx) => (
              <motion.div 
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "p-6 rounded-3xl border shadow-sm transition-all hover:shadow-md",
                  insight.type === 'warning' && "bg-rose-50/30 border-rose-100",
                  insight.type === 'caution' && "bg-amber-50/30 border-amber-100",
                  insight.type === 'success' && "bg-emerald-50/30 border-emerald-100"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                    insight.type === 'warning' && "bg-rose-100 text-rose-600",
                    insight.type === 'caution' && "bg-amber-100 text-amber-600",
                    insight.type === 'success' && "bg-emerald-100 text-emerald-600"
                  )}>
                    {insight.type === 'warning' && <AlertCircle size={20} />}
                    {insight.type === 'caution' && <Info size={20} />}
                    {insight.type === 'success' && <CheckCircle2 size={20} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-bold text-slate-800">{insight.title}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {insight.category}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                      {insight.description}
                    </p>
                    <div className="bg-white/60 p-4 rounded-2xl border border-white/80">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <TrendingUp size={12} className="text-blue-500" />
                        Recommended Action
                      </h4>
                      <p className="text-sm font-medium text-slate-700">
                        {insight.action}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-xl shadow-slate-200">
            <h2 className="text-xl font-bold mb-6">Lifestyle Guidance</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <Apple className="text-rose-400" size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Dietary Focus</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">Increase Vitamin C intake to enhance iron absorption from plant-based sources.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <Dumbbell className="text-blue-400" size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Physical Activity</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">Moderate intensity exercise can help improve your lipid profile and insulin sensitivity.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <Moon className="text-amber-400" size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Rest & Recovery</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">Prioritize 7-9 hours of quality sleep to support hormonal balance and immune function.</p>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-900/20">
              Personalize My Plan
            </button>
          </div>


        </div>
      </div>
    </div>
  );
};