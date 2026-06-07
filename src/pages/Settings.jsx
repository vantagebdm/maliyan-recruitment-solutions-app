import React from 'react';
import { Settings as SettingsIcon, Building2, Bell, Shield, Users } from 'lucide-react';

const sections = [
  {
    icon: Building2,
    title: 'Company Settings',
    description: 'Company name, ABN, branding, and contact details.',
  },
  {
    icon: Users,
    title: 'User Management',
    description: 'Manage team members, roles and permissions.',
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Configure compliance reminders and email alerts.',
  },
  {
    icon: Shield,
    title: 'Compliance Rules',
    description: 'Define required documents and expiry thresholds.',
  },
];

export default function Settings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform configuration and preferences</p>
      </div>
      <div className="grid gap-4">
        {sections.map((s) => (
          <div key={s.title} className="bg-card rounded-xl border border-border p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <s.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{s.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Full settings configuration coming in a future update.</p>
    </div>
  );
}