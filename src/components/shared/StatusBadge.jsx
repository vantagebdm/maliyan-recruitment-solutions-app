import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusStyles = {
  // Job statuses
  draft: 'bg-muted text-muted-foreground',
  open: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  filled: 'bg-blue-100 text-blue-700 border-blue-200',
  on_hold: 'bg-amber-100 text-amber-700 border-amber-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  // Pipeline stages
  new_applicant: 'bg-blue-100 text-blue-700 border-blue-200',
  resume_review: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  phone_screen: 'bg-violet-100 text-violet-700 border-violet-200',
  interview: 'bg-purple-100 text-purple-700 border-purple-200',
  reference_check: 'bg-pink-100 text-pink-700 border-pink-200',
  compliance_check: 'bg-amber-100 text-amber-700 border-amber-200',
  medical_required: 'bg-orange-100 text-orange-700 border-orange-200',
  ready_for_placement: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  offered: 'bg-teal-100 text-teal-700 border-teal-200',
  accepted: 'bg-green-100 text-green-800 border-green-200',
  mobilising: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  talent_pool: 'bg-slate-100 text-slate-700 border-slate-200',
  // Compliance
  compliant: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  expiring_soon: 'bg-amber-100 text-amber-700 border-amber-200',
  expired: 'bg-red-100 text-red-700 border-red-200',
  missing: 'bg-red-100 text-red-700 border-red-200',
  non_compliant: 'bg-red-100 text-red-700 border-red-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  verified: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  // Timesheet
  submitted: 'bg-blue-100 text-blue-700 border-blue-200',
  client_approved: 'bg-teal-100 text-teal-700 border-teal-200',
  admin_approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  payroll_ready: 'bg-green-100 text-green-800 border-green-200',
  paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  // Placement/Mobilisation
  in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  terminated: 'bg-red-100 text-red-700 border-red-200',
  mobilised: 'bg-green-100 text-green-800 border-green-200',
  on_site: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  // Application
  reviewing: 'bg-blue-100 text-blue-700 border-blue-200',
  shortlisted: 'bg-violet-100 text-violet-700 border-violet-200',
  withdrawn: 'bg-gray-100 text-gray-600 border-gray-200',
  // Client
  prospect: 'bg-blue-100 text-blue-700 border-blue-200',
  inactive: 'bg-red-100 text-red-700 border-red-200',
  // Candidate stage (lifecycle)
  available: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  applied: 'bg-blue-100 text-blue-700 border-blue-200',
  demobbed: 'bg-slate-100 text-slate-700 border-slate-200',
  archived: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function StatusBadge({ status, className }) {
  const style = statusStyles[status] || 'bg-muted text-muted-foreground';
  const label = status ? status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown';

  return (
    <Badge variant="outline" className={cn("text-[11px] font-semibold border", style, className)}>
      {label}
    </Badge>
  );
}