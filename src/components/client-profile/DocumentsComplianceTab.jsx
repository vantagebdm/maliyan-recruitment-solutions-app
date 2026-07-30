import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '@/components/shared/StatusBadge';
import { ShieldCheck, FileWarning, FileCheck, FileX } from 'lucide-react';

export default function DocumentsComplianceTab({ placements, candidates, compliance }) {
  const placedCandidateIds = [...new Set(placements.map(p => p.candidate_id).filter(Boolean))];

  const items = placedCandidateIds
    .map(cid => ({ candidate: candidates[cid], items: compliance.filter(c => c.candidate_id === cid) }))
    .filter(x => x.candidate || x.items.length > 0);

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground italic bg-card rounded-xl border border-border p-5">No compliance records linked to this client's employees.</p>;
  }

  const counts = items.reduce((acc, { items: ci }) => {
    ci.forEach(c => {
      acc[c.compliance_status] = (acc[c.compliance_status] || 0) + 1;
    });
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-emerald-600"><FileCheck className="w-4 h-4" /><span className="text-xs font-medium">Compliant</span></div>
          <p className="text-2xl font-bold mt-1">{counts.compliant || 0}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-amber-600"><FileWarning className="w-4 h-4" /><span className="text-xs font-medium">Expiring Soon</span></div>
          <p className="text-2xl font-bold mt-1">{counts.expiring_soon || 0}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-red-600"><FileX className="w-4 h-4" /><span className="text-xs font-medium">Expired</span></div>
          <p className="text-2xl font-bold mt-1">{counts.expired || 0}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground"><ShieldCheck className="w-4 h-4" /><span className="text-xs font-medium">Missing</span></div>
          <p className="text-2xl font-bold mt-1">{counts.missing || 0}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">Employee</th>
              <th className="text-left px-4 py-2.5 font-medium">Candidate Compliance</th>
              <th className="text-left px-4 py-2.5 font-medium">Items</th>
            </tr>
          </thead>
          <tbody>
            {items.map(({ candidate, items: ci }, idx) => {
              const name = candidate ? `${candidate.first_name} ${candidate.last_name}` : 'Unknown';
              return (
                <tr key={idx} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-2.5">
                    {candidate?.id ? (
                      <Link to={`/candidates/${candidate.id}`} className="font-medium text-primary hover:underline">{name}</Link>
                    ) : (
                      <span className="font-medium">{name}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">{candidate?.compliance_status ? <StatusBadge status={candidate.compliance_status} /> : '—'}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{ci.length} item{ci.length !== 1 ? 's' : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}