import React, { useMemo } from 'react';
import { Lightbulb, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

interface InsightsSummaryProps {
  reports?: any[];
}

export const InsightsSummary: React.FC<InsightsSummaryProps> = ({ reports }) => {
  const { healthStatus, attentionItems, recommendations } = useMemo(() => {
    if (!reports || reports.length === 0) {
      return {
        healthStatus: { label: 'No Data', message: 'Upload a blood report to see your health insights.', type: 'neutral' as const },
        attentionItems: ['Upload your first blood report to get started.'],
        recommendations: [],
      };
    }

    const latest = reports[0];
    const params = latest?.parameters || [];
    const analysis = latest?.analysisResult;

    // Determine attention items from abnormal parameters
    const abnormal = params.filter((p: any) => {
      const s = (p.status || '').toLowerCase();
      return s === 'low' || s === 'high' || s === 'borderline';
    });
    const normalCount = params.length - abnormal.length;

    const attentionItems = abnormal.map((p: any) => {
      const s = (p.status || '').toLowerCase();
      return `${p.name}: ${p.value} ${p.unit} — ${s === 'low' ? 'below' : s === 'high' ? 'above' : 'near the boundary of'} normal range${p.referenceRange ? ` (${p.referenceRange})` : ''}.`;
    });

    if (attentionItems.length === 0) {
      attentionItems.push('All parameters are within normal range. Great job!');
    }

    // Health status
    let healthStatus;
    if (abnormal.length === 0) {
      healthStatus = { label: 'Health Status: Good', message: `All ${params.length} parameters are within normal range. Keep maintaining your healthy lifestyle.`, type: 'good' as const };
    } else if (abnormal.length <= 2) {
      healthStatus = { label: 'Health Status: Fair', message: `${normalCount} of ${params.length} parameters are normal. A few areas need attention — review the details below.`, type: 'fair' as const };
    } else {
      healthStatus = { label: 'Health Status: Needs Attention', message: `${abnormal.length} of ${params.length} parameters are outside normal range. Please consult your doctor.`, type: 'attention' as const };
    }

    // Recommendations from analysis result
    const recs: string[] = [];
    if (analysis?.recommendations) {
      const recText = analysis.recommendations;
      // Parse bullet points from the recommendations text
      recText.split('\n').forEach((line: string) => {
        const cleaned = line.replace(/^[•\-\*]\s*/, '').trim();
        if (cleaned.length > 0) recs.push(cleaned);
      });
    }

    return { healthStatus, attentionItems, recommendations: recs };
  }, [reports]);

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl p-6 ${healthStatus.type === 'good' ? 'bg-emerald-50/50 border border-emerald-100' : healthStatus.type === 'fair' ? 'bg-amber-50/50 border border-amber-100' : healthStatus.type === 'attention' ? 'bg-rose-50/50 border border-rose-100' : 'bg-slate-50/50 border border-slate-100'}`}>
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${healthStatus.type === 'good' ? 'bg-emerald-100 text-emerald-600' : healthStatus.type === 'fair' ? 'bg-amber-100 text-amber-600' : healthStatus.type === 'attention' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h3 className={`font-bold mb-1 ${healthStatus.type === 'good' ? 'text-emerald-900' : healthStatus.type === 'fair' ? 'text-amber-900' : healthStatus.type === 'attention' ? 'text-rose-900' : 'text-slate-900'}`}>{healthStatus.label}</h3>
            <p className={`text-sm leading-relaxed ${healthStatus.type === 'good' ? 'text-emerald-800/80' : healthStatus.type === 'fair' ? 'text-amber-800/80' : healthStatus.type === 'attention' ? 'text-rose-800/80' : 'text-slate-800/80'}`}>
              {healthStatus.message}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
              <AlertTriangle size={18} />
            </div>
            <h4 className="font-bold text-slate-800">Areas for Attention</h4>
          </div>
          <ul className="space-y-3">
            {attentionItems.map((text: string, i: number) => (
              <li key={i} className="flex gap-3 text-sm text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
              <Lightbulb size={18} />
            </div>
            <h4 className="font-bold text-slate-800">Recommended Next Steps</h4>
          </div>
          <div className="space-y-4">
            {recommendations.length > 0 ? (
              <ul className="space-y-3">
                {recommendations.slice(0, 5).map((text: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                    {text}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">Upload a report to get personalized recommendations.</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <p className="text-[10px] text-slate-400 font-medium uppercase text-center leading-relaxed">
          Disclaimer: This summary is generated for educational purposes based on reference ranges. 
          It does not constitute medical advice. Please consult with a qualified physician for clinical diagnosis.
        </p>
      </div>
    </div>
  );
};
