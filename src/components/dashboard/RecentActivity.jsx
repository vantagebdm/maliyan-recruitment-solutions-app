import React from 'react';
import { format } from 'date-fns';
import { Users, Briefcase, ShieldCheck, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap = {
  application: { icon: Users, color: 'text-blue-600 bg-blue-100' },
  compliance: { icon: ShieldCheck, color: 'text-amber-600 bg-amber-100' },
  timesheet: { icon: Clock, color: 'text-violet-600 bg-violet-100' },
  job_offer: { icon: Briefcase, color: 'text-emerald-600 bg-emerald-100' },
  mobilisation: { icon: Briefcase, color: 'text-primary bg-primary/10' },
  general: { icon: Users, color: 'text-muted-foreground bg-muted' },
  alert: { icon: ShieldCheck, color: 'text-red-600 bg-red-100' },
};

export default function RecentActivity({ notifications = [] }) {
  if (notifications.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
        <p className="text-sm text-muted-foreground text-center py-6">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {notifications.slice(0, 8).map((n) => {
          const config = iconMap[n.type] || iconMap.general;
          const IconComp = config.icon;
          return (
            <div key={n.id} className="flex items-start gap-3">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", config.color)}>
                <IconComp className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{n.title}</p>
                <p className="text-xs text-muted-foreground truncate">{n.message}</p>
              </div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {n.created_date ? format(new Date(n.created_date), 'dd MMM') : ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}