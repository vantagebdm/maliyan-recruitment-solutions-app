import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, FileText, Users } from 'lucide-react';
import TrafficLight from '@/components/shared/TrafficLight';
import StatusBadge from '@/components/shared/StatusBadge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

function prettyType(type) {
  return (type || 'Other').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

const statusOrder = ['expired', 'missing', 'expiring_soon', 'compliant'];

export default function ComplianceTypeCards({ items = [] }) {
  const [expanded, setExpanded] = useState(null);

  // Group items by document type
  const grouped = items.reduce((acc, item) => {
    const key = item.item_type || 'other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  // Sort groups: types with expired/missing items first, then by count
  const groups = Object.entries(grouped).map(([type, groupItems]) => {
    const counts = {
      compliant: groupItems.filter(i => i.compliance_status === 'compliant').length,
      expiring_soon: groupItems.filter(i => i.compliance_status === 'expiring_soon').length,
      expired: groupItems.filter(i => i.compliance_status === 'expired').length,
      missing: groupItems.filter(i => i.compliance_status === 'missing').length,
    };
    const worst = statusOrder.find(s => counts[s] > 0) || 'compliant';
    return { type, items: groupItems, counts, worst, total: groupItems.length };
  }).sort((a, b) => {
    const ai = statusOrder.indexOf(a.worst);
    const bi = statusOrder.indexOf(b.worst);
    if (ai !== bi) return ai - bi;
    return b.total - a.total;
  });

  if (groups.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No compliance items found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {groups.map(({ type, items: groupItems, counts, worst, total }) => {
        const isOpen = expanded === type;
        return (
          <div
            key={type}
            className={cn(
              "bg-card rounded-xl border overflow-hidden transition-all",
              worst === 'expired' && "border-red-500/40 shadow-sm",
              worst === 'missing' && "border-red-500/30",
              worst === 'expiring_soon' && "border-amber-500/40",
              worst === 'compliant' && "border-border",
              isOpen && "md:col-span-2 xl:col-span-3"
            )}
          >
            {/* Card header */}
            <button
              onClick={() => setExpanded(isOpen ? null : type)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <TrafficLight status={worst} size="md" />
                <div className="text-left">
                  <p className="font-semibold text-sm">{prettyType(type)}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" /> {total} {total === 1 ? 'candidate' : 'candidates'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {counts.compliant > 0 && <span className="text-xs font-medium text-emerald-600">{counts.compliant}✓</span>}
                  {counts.expiring_soon > 0 && <span className="text-xs font-medium text-amber-600">{counts.expiring_soon}!</span>}
                  {counts.expired > 0 && <span className="text-xs font-medium text-red-600">{counts.expired}✕</span>}
                  {counts.missing > 0 && <span className="text-xs font-medium text-red-600">{counts.missing}?</span>}
                </div>
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
              </div>
            </button>

            {/* Expanded list */}
            {isOpen && (
              <div className="border-t border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/40">
                      <th className="text-left p-2.5 font-medium text-xs">Status</th>
                      <th className="text-left p-2.5 font-medium text-xs">Candidate</th>
                      <th className="text-left p-2.5 font-medium text-xs">Expiry</th>
                      <th className="text-left p-2.5 font-medium text-xs">Verification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupItems.map(item => (
                      <tr key={item.id} className="border-t border-border/60 hover:bg-muted/20 transition-colors">
                        <td className="p-2.5"><TrafficLight status={item.compliance_status} size="sm" /></td>
                        <td className="p-2.5 font-medium">
                          {item.candidate_id ? (
                            <Link to={`/candidates/${item.candidate_id}`} className="hover:underline text-primary">
                              {item.candidate_name || 'Unknown'}
                            </Link>
                          ) : (item.candidate_name || 'Unknown')}
                        </td>
                        <td className="p-2.5">{item.expiry_date ? format(new Date(item.expiry_date), 'dd MMM yyyy') : '—'}</td>
                        <td className="p-2.5"><StatusBadge status={item.verification_status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}