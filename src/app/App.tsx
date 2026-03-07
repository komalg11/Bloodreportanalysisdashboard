import React, { useState, useMemo } from 'react';
import { Sidebar } from '@/app/components/Sidebar';
import { TopNav } from '@/app/components/TopNav';
import { ParameterCard, Parameter } from '@/app/components/ParameterCard';
import { InsightsSummary } from '@/app/components/InsightsSummary';
import { UploadModal } from '@/app/components/UploadModal';
import { LoginScreen } from '@/app/components/LoginScreen';
import { RegisterScreen } from '@/app/components/RegisterScreen';
import { DetailView } from '@/app/components/DetailView';
import { ParametersView } from '@/app/components/ParametersView';
import { TrendsHistoryView } from '@/app/components/TrendsHistoryView';
import { InsightsView } from '@/app/components/InsightsView';
import { ProfileView } from '@/app/components/ProfileView';
import { SettingsView } from '@/app/components/SettingsView';
import {
  Plus,
  Filter,
  Download,
  TrendingUp,
  LayoutGrid,
  List,
  Activity,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { computeTrendDirection, normalizeStatus, toNumericValue } from '@/lib/parameterUtils';
import ReportIntegrationExample from '../examples/ReportIntegrationExample';
import { useReports, useReportTrends } from '@/hooks/useReportApi';
import { deleteReportApi } from '@/services/reportApi';

export default function App() {
  const [authScreen, setAuthScreen] = useState<'login' | 'register' | 'authenticated'>('login');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedParam, setSelectedParam] = useState<Parameter | null>(null);

  // API hooks for dynamic data
  const { reports, loading: reportsLoading, refetch: refetchReports } = useReports();
  const { trends, loading: trendsLoading, refetch: refetchTrends } = useReportTrends();
  const latestReport = reports?.[0];

  const formatDisplayDate = (dateInput?: string | Date | null) => {
    if (!dateInput) return null;
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Convert API reports to Parameter format for the dashboard
  const bloodParameters: Parameter[] = useMemo(() => {
    if (!reports || reports.length === 0) return [];

    // Get the latest report's parameters
    const latestReport = reports[0];
    if (!latestReport?.parameters || !Array.isArray(latestReport.parameters)) {
      return [];
    }

    return latestReport.parameters.map((param: any, idx: number) => {
      const value = toNumericValue(param.value);
      const range = param.referenceRange || param.range || 'N/A';
      const status = normalizeStatus(param.status, value, range);

      return {
        id: param.id || String(idx + 1),
        name: param.name || param.parameterName,
        value: value,
        unit: param.unit || '',
        range: range,
        status: status,
        description: param.description || `${param.name} from your latest blood report.`,
        trend: computeTrendDirection(param.name || param.parameterName, trends)
      } as Parameter;
    });
  }, [reports, trends]);

  // Handle upload completion — await refetch so data is ready before redirect
  const handleUploadComplete = async () => {
    await refetchReports();
    await refetchTrends();
  };

  const handleDeleteReportFromHistory = async (reportId: string) => {
    await deleteReportApi(reportId);
    await refetchReports();
    await refetchTrends();
  };

  if (authScreen === 'login') {
    return (
      <LoginScreen 
        onLogin={() => setAuthScreen('authenticated')} 
        onCreateAccount={() => setAuthScreen('register')}
      />
    );
  }

  if (authScreen === 'register') {
    return (
      <RegisterScreen 
        onRegister={() => setAuthScreen('authenticated')} 
        onBackToLogin={() => setAuthScreen('login')}
      />
    );
  }

  const handleLogout = () => {
    setAuthScreen('login');
    setActiveTab('dashboard');
  };

  const renderContent = () => {
    if (selectedParam) {
      return <DetailView parameter={selectedParam} onClose={() => setSelectedParam(null)} trends={trends} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Patient Header */}
            

            {/* Parameter Grid Section */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Report Parameters</h2>
                  <p className="text-sm text-slate-500">
                    {bloodParameters.length > 0 
                      ? `Showing ${bloodParameters.length} parameters from your latest report`
                      : 'Showing results from your latest report'
                    }
                  </p>
                </div>
                {bloodParameters.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
                    <button className="p-1.5 bg-slate-100 text-blue-600 rounded-lg shadow-sm">
                      <LayoutGrid size={18} />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                      <List size={18} />
                    </button>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                    <Filter size={16} />
                    Filter
                  </button>
                </div>
                )}
              </div>

              {reportsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <Loader2 className="w-10 h-10 mx-auto mb-3 text-blue-500 animate-spin" />
                    <p className="text-slate-500 text-sm font-medium">Loading parameters...</p>
                  </div>
                </div>
              ) : bloodParameters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {bloodParameters.map((param) => (
                    <ParameterCard
                      key={param.id}
                      parameter={param}
                      onClick={setSelectedParam}
                    />
                  ))}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsUploadOpen(true)}
                    className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50 transition-all min-h-[180px]"
                  >
                    <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center">
                      <Plus size={24} />
                    </div>
                    <span className="font-bold">Upload Another Report</span>
                  </motion.button>
                </div>
              ) : (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                    <Activity size={32} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-700">No Report Parameters Yet</h3>
                    <p className="text-sm text-slate-500 mt-1">Upload a blood report to extract and view all your parameters here.</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsUploadOpen(true)}
                    className="mt-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Upload Report
                  </motion.button>
                </div>
              )}
            </section>

            {/* Summary Section */}
            <section className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Insights & Summary</h2>
                  <p className="text-sm text-slate-500">Personalized interpretation of your results</p>
                </div>
                <button className="hidden sm:flex items-center gap-2 text-blue-600 font-bold text-sm hover:underline">
                  Download Full Analysis (PDF)
                  <Download size={16} />
                </button>
              </div>
              <InsightsSummary reports={reports} />
            </section>
          </div>
        );
      case 'upload':
        return (
          <div className="max-w-3xl mx-auto py-12">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Upload Report</h2>
              <p className="text-slate-500">Our system will automatically extract and categorize your results.</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm text-center">
              <button
                onClick={() => setIsUploadOpen(true)}
                className="w-full h-64 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-blue-400 hover:bg-blue-50/50 transition-all"
              >
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                  <TrendingUp size={32} />
                </div>
                <p className="font-bold text-slate-800">Click to upload your medical report</p>
                <p className="text-sm text-slate-500">PDF, JPG, or PNG formats</p>
              </button>
            </div>
          </div>
        );
      case 'parameters':
        return <ParametersView parameters={bloodParameters} onSelectParameter={setSelectedParam} />;
      case 'trends':
        return (
          <TrendsHistoryView
            reports={reports}
            trends={trends}
            loading={reportsLoading || trendsLoading}
            onDeleteReport={handleDeleteReportFromHistory}
          />
        );
      case 'insights':
        return <InsightsView reports={reports} loading={reportsLoading} />;
      case 'profile':
        return (
          <ProfileView
            patientId={latestReport?.patientId}
          />
        );
      case 'settings':
        return <SettingsView onLogout={handleLogout} />;
      case 'integration':
        return <ReportIntegrationExample />;
      default:
        return (
          <div className="flex items-center justify-center h-[60vh] text-slate-400">
            <div className="text-center">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-bold text-slate-600">Coming Soon</h3>
              <p className="text-sm">The {activeTab} section is currently under development.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedParam(null);
        }}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onLogout={handleLogout}
      />

      <main className={cn(
        "transition-all duration-300 min-h-screen flex flex-col",
        isCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}>
        <TopNav
          setIsMobileOpen={setIsMobileOpen}
          lastReportDate={formatDisplayDate(latestReport?.reportDate || latestReport?.createdAt)}
        />

        <div className="p-4 lg:p-8 flex-1">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>

        <footer className="p-8 border-t border-slate-200 bg-white/50">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 text-xs font-medium">
            <p>© 2026 HemoX • Blood Report Analysis System</p>
            <div className="flex items-center gap-6">
              <span>Educational Project • College of Health Sciences</span>
              <span>v1.0.4</span>
            </div>
            <p className="text-center md:text-right max-w-xs">
              This application is for educational purposes only and does not provide medical advice.
            </p>
          </div>
        </footer>
      </main>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadComplete={handleUploadComplete}
        onViewResults={() => {
          setIsUploadOpen(false);
          setActiveTab('dashboard');
        }}
      />
    </div>
  );
}
