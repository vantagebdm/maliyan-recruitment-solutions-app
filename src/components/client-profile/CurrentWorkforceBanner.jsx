import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, MapPin, Briefcase, Clock, ShieldCheck } from 'lucide-react';

export default function CurrentWorkforceBanner({ activeEmployees, mainWorksite, openJobs, pendingTimesheets, complianceSummary, onViewEmployees }) {
  const toneClass = {
    muted: 'bg-muted text-muted-foreground',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
    green: 'bg-emerald-100 text-emerald-700',
  }[complianceSummary.tone];

  return (
    <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-4 flex-wrap">
      <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
        <Users className="w-4 h-4 text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Current Workforce</span>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm mt-1">
          <span><strong className="font-semibold">{activeEmployees}</strong> <span className="text-muted-foreground">active employees</span></span>
          {mainWorksite && (
            <span className="inline-flex items-center gap-1 text-muted-foreground"><MapPin className="w-3.5 h-3.5" />{mainWorksite}</span>
          )}
          <span className="inline-flex items-center gap-1 text-muted-foreground"><Briefcase className="w-3.5 h-3.5" />{openJobs} open job{openJobs !== 1 ? 's' : ''}</span>
          <span className="inline-flex items-center gap-1 text-muted-foreground"><Clock className="w-3.5 h-3.5" />{pendingTimesheets} pending timesheet{pendingTimesheets !== 1 ? 's' : ''}</span>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5" />Compliance:
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${toneClass}`}>{complianceSummary.label}</span>
          </span>
        </div>
      </div>
      <Button size="sm" variant="outline" onClick={onViewEmployees}>View Employees/Placements</Button>
    </div>
  );
}