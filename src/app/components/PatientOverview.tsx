import React from 'react';
import { Droplets, UserRound } from 'lucide-react';

interface PatientOverviewProps {
  patientName?: string | null;
  patientId?: string | null;
  patientAge?: number | null;
  gender?: string | null;
  bloodGroup?: string | null;
  lastReportDate?: string | null;
  doctorName?: string | null;
}

export const PatientOverview: React.FC<PatientOverviewProps> = ({
  patientName,
  patientId,
  patientAge,
  gender,
  bloodGroup,
  lastReportDate,
  doctorName,
}) => {
  const ageGender = [patientAge ? String(patientAge) : null, gender].filter(Boolean).join(' / ');

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <UserRound size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{patientName || 'Unknown Patient'}</h2>
            <p className="text-slate-500 text-sm">
              Patient ID: <span className="font-semibold">{patientId || 'N/A'}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Age / Gender</p>
            <p className="font-semibold text-slate-700">{ageGender || 'N/A'}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Blood Group</p>
            <div className="flex items-center gap-1.5 font-semibold text-rose-600">
              <Droplets size={14} />
              <span>{bloodGroup || 'N/A'}</span>
            </div>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Last Report Date</p>
            <p className="font-semibold text-slate-700">{lastReportDate || 'N/A'}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Ref. Doctor</p>
            <p className="font-semibold text-slate-700">{doctorName || ''}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
