import React from 'react';
import { Activity, Phone, Calendar, MessageSquare, FileUp, ShieldCheck, RefreshCw, Mail, Users } from 'lucide-react';
import { format } from 'date-fns';

const ACTIVITY_ICONS = {
  phone_call: { icon: Phone, cls: 'text-blue-500' },
  interview: { icon: Users, cls: 'text-purple-500' },
  sms: { icon: MessageSquare, cls: 'text-cyan-500' },
  note: { icon: Activity, cls: 'text-slate-500' },
  document_uploaded: { icon: FileUp, cls: 'text-amber-500' },
  verification_completed: { icon: ShieldCheck, cls: 'text-emerald-500' },
  stage_changed: { icon: RefreshCw, cls: 'text-indigo-500' },
  email: { icon: Mail, cls: 'text-blue-400' },
  meeting: { icon: Calendar, cls: 'text-rose-500' },
};

export default function ActivitiesSection({ candidate }) {
  const activities = candidate.activities || [];

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-primary" />
        <h3 className="font-bold text-sm">Activities</h3>
        {activities.length > 0 && <span className="text-xs text-muted-foreground">({activities.length})</span>}
      </div>

      {activities.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No activities recorded.</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {[...activities].reverse().map((a, idx) => {
            const cfg = ACTIVITY_ICONS[a.type] || ACTIVITY_ICONS.note;
            return (
              <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <div className={`w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0`}>
                  <cfg.icon className={`w-3.5 h-3.5 ${cfg.cls}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{a.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{a.by || 'System'}</span>
                    {a.date && <span>· {format(new Date(a.date), 'dd MMM yyyy HH:mm')}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}