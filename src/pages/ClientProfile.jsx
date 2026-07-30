import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import StatusBadge from '@/components/shared/StatusBadge';
import TrafficLight from '@/components/shared/TrafficLight';
import ClientFormDialog from '@/components/clients/ClientFormDialog';
import OverviewTab from '@/components/client-profile/OverviewTab';
import ContactsTab from '@/components/client-profile/ContactsTab';
import JobOrdersTab from '@/components/client-profile/JobOrdersTab';
import CandidatesSubmittedTab from '@/components/client-profile/CandidatesSubmittedTab';
import EmployeesPlacementsTab from '@/components/client-profile/EmployeesPlacementsTab';
import TimesheetsTab from '@/components/client-profile/TimesheetsTab';
import RatesBillingTab from '@/components/client-profile/RatesBillingTab';
import DocumentsComplianceTab from '@/components/client-profile/DocumentsComplianceTab';
import ActivityNotesTab from '@/components/client-profile/ActivityNotesTab';
import { Building2, ArrowLeft, Pencil, Mail, Phone, MapPin, User, FileText, Globe, Briefcase, Users, ClipboardList, ShieldCheck } from 'lucide-react';

export default function ClientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: () => base44.entities.Client.get(id),
    enabled: !!id,
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs', 'client', id],
    queryFn: () => base44.entities.Job.filter({ client_id: id }),
    enabled: !!id,
    initialData: [],
  });

  const { data: placements = [] } = useQuery({
    queryKey: ['placements', 'client', id],
    queryFn: () => base44.entities.Placement.filter({ client_id: id }),
    enabled: !!id,
    initialData: [],
  });

  const { data: timesheets = [] } = useQuery({
    queryKey: ['timesheets', 'client', id],
    queryFn: () => base44.entities.Timesheet.filter({ client_id: id }),
    enabled: !!id,
    initialData: [],
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['applications', 'client', id],
    queryFn: () => base44.entities.Application.list('-created_date'),
    enabled: !!id,
    initialData: [],
  });

  const jobIds = new Set(jobs.map(j => j.id));
  const clientApplications = applications.filter(a => jobIds.has(a.job_id));

  const placedCandidateIds = [...new Set(placements.map(p => p.candidate_id).filter(Boolean))];
  const { data: allCandidates = [] } = useQuery({
    queryKey: ['candidates'],
    queryFn: () => base44.entities.Candidate.list('-created_date'),
    initialData: [],
  });
  const candidateMap = {};
  allCandidates.forEach(c => { candidateMap[c.id] = c; });

  const { data: allCompliance = [] } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => base44.entities.ComplianceItem.list('-created_date'),
    initialData: [],
  });
  const clientCompliance = allCompliance.filter(c => placedCandidateIds.includes(c.candidate_id));

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground">Client not found.</p>
        <Button variant="outline" onClick={() => navigate('/clients')} className="mt-4">Back to Clients</Button>
      </div>
    );
  }

  const activeEmployees = placements.filter(p => p.status === 'active').length;
  const openJobs = jobs.filter(j => j.status === 'open').length;

  // Compliance status aggregate from placed candidates' compliance items
  const cc = clientCompliance;
  const complianceScore = cc.length === 0 ? null : (() => {
    if (cc.some(c => c.compliance_status === 'expired')) return 'expired';
    if (cc.some(c => c.compliance_status === 'missing')) return 'missing';
    if (cc.some(c => c.compliance_status === 'expiring_soon')) return 'expiring_soon';
    return 'compliant';
  })();

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/clients')} className="gap-1.5 -ml-2">
        <ArrowLeft className="w-4 h-4" /> Back to Clients
      </Button>

      {/* Summary Header */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{client.company_name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={client.status} />
                {client.industry && <span className="text-sm text-muted-foreground">· {client.industry}</span>}
              </div>
            </div>
          </div>
          <Button onClick={() => setShowEdit(true)} className="gap-1.5">
            <Pencil className="w-4 h-4" /> Edit Client
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-5 pt-5 border-t border-border">
          <HeaderStat icon={FileText} label="ABN" value={client.abn || '—'} />
          <HeaderStat icon={MapPin} label="Address" value={client.billing_address || '—'} />
          <HeaderStat icon={User} label="Primary Contact" value={client.primary_contact_name || '—'} />
          <HeaderStat icon={User} label="Account Manager" value={client.account_manager || '—'} />
          <HeaderStat icon={Users} label="Active Employees" value={activeEmployees} accent="emerald" />
          <HeaderStat icon={Briefcase} label="Open Job Orders" value={openJobs} accent="primary" />
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border flex-wrap text-sm">
          {client.primary_contact_email && (
            <a href={`mailto:${client.primary_contact_email}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary">
              <Mail className="w-4 h-4" /> {client.primary_contact_email}
            </a>
          )}
          {client.primary_contact_phone && (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Phone className="w-4 h-4" /> {client.primary_contact_phone}
            </span>
          )}
          {client.website && (
            <a href={client.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary">
              <Globe className="w-4 h-4" /> {client.website}
            </a>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <ShieldCheck className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Compliance:</span>
            {complianceScore ? <TrafficLight status={complianceScore} /> : <span className="text-muted-foreground text-xs">No employees linked</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/40 p-1 rounded-xl">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="contacts" className="text-xs">Contacts</TabsTrigger>
          <TabsTrigger value="job-orders" className="text-xs">Job Orders</TabsTrigger>
          <TabsTrigger value="candidates" className="text-xs">Candidates Submitted</TabsTrigger>
          <TabsTrigger value="employees" className="text-xs">Employees/Placements</TabsTrigger>
          <TabsTrigger value="timesheets" className="text-xs">Timesheets</TabsTrigger>
          <TabsTrigger value="rates" className="text-xs">Rates & Billing</TabsTrigger>
          <TabsTrigger value="compliance" className="text-xs">Documents & Compliance</TabsTrigger>
          <TabsTrigger value="activity" className="text-xs">Activity & Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab client={client} jobs={jobs} placements={placements} timesheets={timesheets} applications={clientApplications} />
        </TabsContent>
        <TabsContent value="contacts" className="mt-4">
          <ContactsTab client={client} />
        </TabsContent>
        <TabsContent value="job-orders" className="mt-4">
          <JobOrdersTab jobs={jobs} />
        </TabsContent>
        <TabsContent value="candidates" className="mt-4">
          <CandidatesSubmittedTab applications={clientApplications} candidates={candidateMap} />
        </TabsContent>
        <TabsContent value="employees" className="mt-4">
          <EmployeesPlacementsTab placements={placements} />
        </TabsContent>
        <TabsContent value="timesheets" className="mt-4">
          <TimesheetsTab timesheets={timesheets} />
        </TabsContent>
        <TabsContent value="rates" className="mt-4">
          <RatesBillingTab client={client} jobs={jobs} placements={placements} />
        </TabsContent>
        <TabsContent value="compliance" className="mt-4">
          <DocumentsComplianceTab placements={placements} candidates={candidateMap} compliance={clientCompliance} />
        </TabsContent>
        <TabsContent value="activity" className="mt-4">
          <ActivityNotesTab client={client} />
        </TabsContent>
      </Tabs>

      <ClientFormDialog client={client} open={showEdit} onOpenChange={setShowEdit} />
    </div>
  );
}

function HeaderStat({ icon: Icon, label, value, accent }) {
  const accentClass = accent === 'emerald' ? 'text-emerald-600' : accent === 'primary' ? 'text-primary' : 'text-foreground';
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="w-3.5 h-3.5" /> {label}
      </div>
      <p className={`font-semibold text-sm mt-1 truncate ${accentClass}`} title={typeof value === 'string' ? value : undefined}>{value}</p>
    </div>
  );
}