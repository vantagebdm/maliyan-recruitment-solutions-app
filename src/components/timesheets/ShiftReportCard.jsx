import React from 'react';
import { Clock, FileText, CheckCircle2 } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import { format } from 'date-fns';

export default function ShiftReportCard({ report, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-card rounded-lg border border-border p-4 hover:shadow-sm hover:border-primary/30 cursor-pointer transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{report.candidate_name || 'Unknown'}</p>
            <p className="text-xs text-muted-foreground">{report.client_name || '—'}</p>
          </div>
        </div>
        <StatusBadge status={report.status} />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {report.week_ending ? format(new Date(report.week_ending), 'dd MMM yyyy') : '—'}
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          {report.total_ordinary_hours || 0}h ord
        </span>
      </div>
    </div>
  );
}