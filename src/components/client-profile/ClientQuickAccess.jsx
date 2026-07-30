import React from 'react';
import {
  Building2, Users, Settings, Briefcase, UserCheck, UsersRound, Clock,
  Receipt, FileText, ShieldCheck, MessageSquare, Activity
} from 'lucide-react';

const SECTIONS = [
  { id: 'company', label: 'Company Details', icon: Building2 },
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'operations', label: 'Operational Details', icon: Settings },
  { id: 'job-orders', label: 'Job Orders', icon: Briefcase },
  { id: 'candidates', label: 'Candidates Submitted', icon: UserCheck },
  { id: 'employees', label: 'Employees/Placements', icon: UsersRound },
  { id: 'timesheets', label: 'Timesheets', icon: Clock },
  { id: 'rates', label: 'Rates & Billing', icon: Receipt },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
  { id: 'comments', label: 'Comments/Notes', icon: MessageSquare },
  { id: 'activities', label: 'Activities', icon: Activity },
];

export default function ClientQuickAccess({ activeSection, onSelect }) {
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