import React from 'react';
import {
  User, Calendar, ShieldCheck, FileText, MessageSquare, Activity,
  Briefcase, Truck, Clock, Receipt, Eye
} from 'lucide-react';

const SECTIONS = [
  { id: 'personal', label: 'Personal Details', icon: User },
  { id: 'availability', label: 'Availability', icon: Calendar },
  { id: 'verification', label: 'Verification', icon: ShieldCheck },
  { id: 'documentation', label: 'Documentation', icon: FileText },
  { id: 'comments', label: 'Comments / Notes', icon: MessageSquare },
  { id: 'activities', label: 'Activities', icon: Activity },
  { id: 'jobs', label: 'Job List', icon: Briefcase },
  { id: 'placements', label: 'Placements', icon: Truck },
  { id: 'attendance', label: 'Time & Attendance', icon: Clock },
  { id: 'invoices', label: 'Invoice List', icon: Receipt },
  { id: 'profile', label: 'Profile', icon: Eye },
];

export default function QuickAccess({ activeSection, onSelect }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="font-bold text-sm mb-3">Quick Access</h3>
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map(s => {
          const isActive = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground'
              }`}
            >
              <s.icon className="w-3 h-3" />
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}