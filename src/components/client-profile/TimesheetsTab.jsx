import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '@/components/shared/StatusBadge';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function TimesheetsTab({ timesheets }) {
  if (timesheets.length === 0) {
    return <p className="text-sm text-muted-foreground italic bg-card rounded-xl border border-border p-5">No timesheets recorded for this client.</p>;
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="text-left px-4 py-2.5 font-medium">Candidate</th>
            <th className="text-left px-4 py-2.5 font-medium">Week Ending</th>
            <th className="text-left px-4 py-2.5 font-medium">Ordinary Hours</th>
            <th className="text-left px-4 py-2.5 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {timesheets.map(t => (
            <tr key={t.id} className="border-t border-border hover:bg-muted/30">
              <td className="px-4 py-2.5">
                {t.candidate_id ? (
                  <Link to={`/candidates/${t.candidate_id}`} className="font-medium text-primary hover:underline">{t.candidate_name || 'View'}</Link>
                ) : (
                  <span className="font-medium">{t.candidate_name || '—'}</span>
                )}
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">
                {t.week_ending ? <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{format(new Date(t.week_ending), 'dd MMM yyyy')}</span> : '—'}
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{t.total_ordinary_hours || 0} hrs</span>
              </td>
              <td className="px-4 py-2.5"><StatusBadge status={t.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}