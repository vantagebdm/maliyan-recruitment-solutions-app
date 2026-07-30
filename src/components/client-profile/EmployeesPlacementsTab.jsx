import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '@/components/shared/StatusBadge';
import { Briefcase, MapPin, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export default function EmployeesPlacementsTab({ placements }) {
  if (placements.length === 0) {
    return <p className="text-sm text-muted-foreground italic bg-card rounded-xl border border-border p-5">No employees / placements recorded for this client.</p>;
  }

  return (
    <div className="space-y-2">
      {placements.map(p => (
        <div key={p.id} className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              {p.candidate_id ? (
                <Link to={`/candidates/${p.candidate_id}`} className="font-semibold text-sm text-primary hover:underline">{p.candidate_name || 'View candidate'}</Link>
              ) : (
                <h4 className="font-semibold text-sm">{p.candidate_name || '—'}</h4>
              )}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                {p.job_title && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{p.job_title}</span>}
                {p.site && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.site}</span>}
                {p.roster && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{p.roster}</span>}
                {p.start_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(p.start_date), 'dd MMM yyyy')}</span>}
                {p.pay_rate && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${p.pay_rate}/hr</span>}
              </div>
            </div>
            <StatusBadge status={p.status} />
          </div>
        </div>
      ))}
    </div>
  );
}