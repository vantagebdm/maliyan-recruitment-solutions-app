import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '@/components/shared/StatusBadge';
import ClientSection from '@/components/client-profile/ClientSection';
import { ShieldCheck, FileCheck, FileWarning, FileX, ClipboardCheck, HardHat } from 'lucide-react';

export default function EmployeeComplianceSection({ activePlacements, candidateMap, compliance }) {
  const activeIds = [...new Set(activePlacements.map(p => p.candidate_id).filter(Boolean))];

  const rows = activeIds.map(cid => {
    const candidate = candidateMap[cid];
    const verifications = candidate?.verifications || [];
    const compItems = compliance.filter(c => c.candidate_id === cid);
    return { candidate, verifications, compItems, total: verifications.length + compItems.length };
  }).filter(r => r.candidate || r.total > 0);

  const counts = compliance.reduce((acc, c) => {
    acc[c.compliance_status] = (acc[c.compliance_status] || 0) + 1;
    return acc;
  }, {});

  return (
    <ClientSection icon={HardHat} title="Employee Compliance">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="rounded-lg border border-border p-3"><div className="flex items-center gap-2 text-emerald-600"><FileCheck className="w-4 h-4" /><span className="text-xs font-medium">Compliant</span></div><p className="text-xl font-bold mt-1">{counts.compliant || 0}</p></div>
        <div className="rounded-lg border border-border p-3"><div className="flex items-center gap-2 text-amber-600"><FileWarning className="w-4 h-4" /><span className="text-xs font-medium">Expiring Soon</span></div><p className="text-xl font-bold mt-1">{counts.expiring_soon || 0}</p></div>
        <div className="rounded-lg border border-border p-3"><div className="flex items-center gap-2 text-red-600"><FileX className="w-4 h-4" /><span className="text-xs font-medium">Expired</span></div><p className="text-xl font-bold mt-1">{counts.expired || 0}</p></div>
        <div className="rounded-lg border border-border p-3"><div className="flex items-center gap-2 text-muted-foreground"><ShieldCheck className="w-4 h-4" /><span className="text-xs font-medium">Missing</span></div><p className="text-xl font-bold mt-1">{counts.missing || 0}</p></div>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground italic text-center py-6">No active employees linked.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">Employee</th>
                <th className="text-left px-4 py-2.5 font-medium">Compliance</th>
                <th className="text-left px-4 py-2.5 font-medium">Verifications</th>
                <th className="text-left px-4 py-2.5 font-medium">Compliance Items</th>
                <th className="text-left px-4 py-2.5 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ candidate, verifications, compItems, total }, idx) => {
                const name = candidate ? `${candidate.first_name} ${candidate.last_name}` : 'Unknown';
                return (
                  <tr key={idx} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-2.5">{candidate?.id ? <Link to={`/candidates/${candidate.id}`} className="font-medium text-primary hover:underline">{name}</Link> : <span className="font-medium">{name}</span>}</td>
                    <td className="px-4 py-2.5">{candidate?.compliance_status ? <StatusBadge status={candidate.compliance_status} /> : '—'}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{verifications.length}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{compItems.length}</td>
                    <td className="px-4 py-2.5 font-semibold">{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><ClipboardCheck className="w-3.5 h-3.5" />Verification & compliance records retrieved from each linked Candidate Card.</div>
    </ClientSection>
  );
}