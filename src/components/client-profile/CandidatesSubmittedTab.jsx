import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '@/components/shared/StatusBadge';
import { Briefcase } from 'lucide-react';

export default function CandidatesSubmittedTab({ applications, candidates }) {
  if (applications.length === 0) {
    return <p className="text-sm text-muted-foreground italic bg-card rounded-xl border border-border p-5">No candidates submitted for this client yet.</p>;
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="text-left px-4 py-2.5 font-medium">Candidate</th>
            <th className="text-left px-4 py-2.5 font-medium">Job</th>
            <th className="text-left px-4 py-2.5 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {applications.map(app => {
            const candidate = candidates[app.candidate_id];
            const name = app.candidate_name || (candidate ? `${candidate.first_name} ${candidate.last_name}` : 'Unknown');
            return (
              <tr key={app.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-2.5">
                  {app.candidate_id ? (
                    <Link to={`/candidates/${app.candidate_id}`} className="font-medium text-primary hover:underline">{name}</Link>
                  ) : (
                    <span className="font-medium">{name}</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" />{app.job_title || '—'}</span>
                </td>
                <td className="px-4 py-2.5"><StatusBadge status={app.status} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}