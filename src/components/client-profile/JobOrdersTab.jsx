import React from 'react';
import StatusBadge from '@/components/shared/StatusBadge';
import { Briefcase, MapPin, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function JobOrdersTab({ jobs }) {
  if (jobs.length === 0) {
    return <p className="text-sm text-muted-foreground italic bg-card rounded-xl border border-border p-5">No job orders recorded for this client.</p>;
  }

  return (
    <div className="space-y-2">
      {jobs.map(job => (
        <div key={job.id} className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h4 className="font-semibold text-sm">{job.title}</h4>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                {job.site && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.site}</span>}
                {job.roster && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.roster}</span>}
                {job.start_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(job.start_date), 'dd MMM yyyy')}</span>}
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{job.positions_filled || 0}/{job.positions_available || 1} filled</span>
              </div>
            </div>
            <StatusBadge status={job.status} />
          </div>
        </div>
      ))}
    </div>
  );
}