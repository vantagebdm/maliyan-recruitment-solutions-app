import React from 'react';
import { cn } from '@/lib/utils';

const trafficLight = {
  compliant: { bg: 'bg-emerald-500', label: 'Compliant', text: 'text-emerald-700' },
  expiring_soon: { bg: 'bg-amber-500', label: 'Expiring Soon', text: 'text-amber-700' },
  expired: { bg: 'bg-red-500', label: 'Expired', text: 'text-red-700' },
  missing: { bg: 'bg-red-500', label: 'Missing', text: 'text-red-700' },
};

export default function ComplianceOverview({ items = [] }) {
  const grouped = {
    compliant: items.filter(i => i.compliance_status === 'compliant').length,
    expiring_soon: items.filter(i => i.compliance_status === 'expiring_soon').length,
    expired: items.filter(i => i.compliance_status === 'expired').length,
    missing: items.filter(i => i.compliance_status === 'missing').length,
  };
  const total = items.length || 1;

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold mb-4">Compliance Overview</h3>
      <div className="space-y-3">
        {Object.entries(grouped).map(([key, count]) => {
          const config = trafficLight[key];
          const pct = Math.round((count / total) * 100);
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2.5 h-2.5 rounded-full", config.bg)} />
                  <span className="text-xs font-medium">{config.label}</span>
                </div>
                <span className="text-xs font-semibold">{count}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", config.bg)} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}