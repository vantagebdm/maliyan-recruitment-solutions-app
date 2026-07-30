import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Globe, FileText, CreditCard, MapPin, User, Briefcase, ClipboardList } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2 py-1.5 text-sm">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <span className="text-muted-foreground w-32 flex-shrink-0">{label}</span>
      <span className="font-medium text-foreground break-words flex-1">{value || '—'}</span>
    </div>
  );
}

export default function OverviewTab({ client, jobs, placements, timesheets, applications }) {
  const activeEmployees = placements.filter(p => p.status === 'active').length;
  const openJobs = jobs.filter(j => j.status === 'open').length;
  const pendingTimesheets = timesheets.filter(t => !['admin_approved', 'paid'].includes(t.status)).length;

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2 bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" /> Company Profile</h3>
        <div className="grid sm:grid-cols-2 gap-x-4">
          <InfoRow icon={Building2} label="Company" value={client.company_name} />
          <InfoRow icon={FileText} label="ABN" value={client.abn} />
          <InfoRow icon={Briefcase} label="Industry" value={client.industry} />
          <InfoRow icon={Globe} label="Website" value={client.website} />
          <InfoRow icon={MapPin} label="Billing Address" value={client.billing_address} />
          <InfoRow icon={CreditCard} label="Payment Terms" value={client.payment_terms} />
          <InfoRow icon={User} label="Account Manager" value={client.account_manager} />
          <div className="flex items-start gap-2 py-1.5 text-sm">
            <ClipboardList className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground w-32 flex-shrink-0">Status</span>
            <StatusBadge status={client.status} />
          </div>
        </div>
        {client.approved_rates && (
          <div className="mt-3 pt-3 border-t border-border">
            <span className="text-sm text-muted-foreground">Approved Rates</span>
            <p className="text-sm font-medium mt-1 whitespace-pre-wrap">{client.approved_rates}</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-3">Key Metrics</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Active Employees</span>
              <span className="font-semibold text-emerald-600">{activeEmployees}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Open Job Orders</span>
              <span className="font-semibold text-primary">{openJobs}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Candidates Submitted</span>
              <span className="font-semibold">{applications.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pending Timesheets</span>
              <span className="font-semibold text-amber-600">{pendingTimesheets}</span>
            </div>
          </div>
        </div>

        {client.site_locations?.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Site Locations</h3>
            <ul className="space-y-1.5 text-sm">
              {client.site_locations.map((s, i) => (
                <li key={i} className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-3 h-3" /> {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}