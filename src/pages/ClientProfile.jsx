import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, ArrowLeft } from 'lucide-react';
import ClientFormDialog from '@/components/clients/ClientFormDialog';
import ClientQuickAccess from '@/components/client-profile/ClientQuickAccess';
import ClientHeader from '@/components/client-profile/ClientHeader';
import CurrentWorkforceBanner from '@/components/client-profile/CurrentWorkforceBanner';
import CompanyDetailsCard from '@/components/client-profile/CompanyDetailsCard';
import OperationalDetailsCard from '@/components/client-profile/OperationalDetailsCard';
import ClientRequirementsSection from '@/components/client-profile/ClientRequirementsSection';
import ClientContactsSection from '@/components/client-profile/ClientContactsSection';
import SiteLocationsSection from '@/components/client-profile/SiteLocationsSection';
import JobOrdersTab from '@/components/client-profile/JobOrdersTab';
import CandidatesSubmittedTab from '@/components/client-profile/CandidatesSubmittedTab';
import EmployeesPlacementsTab from '@/components/client-profile/EmployeesPlacementsTab';
import TimesheetsTab from '@/components/client-profile/TimesheetsTab';
import RatesBillingTab from '@/components/client-profile/RatesBillingTab';
import ClientDocumentsSection from '@/components/client-profile/ClientDocumentsSection';
import ClientComplianceSection from '@/components/client-profile/ClientComplianceSection';
import ClientCommentsSection from '@/components/client-profile/ClientCommentsSection';
import ActivityNotesTab from '@/components/client-profile/ActivityNotesTab';

export default function ClientProfile() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState('company');
  const [showEdit, setShowEdit] = useState(false);
  const sectionRefs = useRef({});

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: () => base44.entities.Client.get(id),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Client.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client', id] }),
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

  const { data: allApplications = [] } = useQuery({
    queryKey: ['applications', 'client', id],
    queryFn: () => base44.entities.Application.list('-created_date'),
    enabled: !!id,
    initialData: [],
  });

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

  const jobIds = new Set(jobs.map(j => j.id));
  const clientApplications = allApplications.filter(a => jobIds.has(a.job_id));

  const activePlacements = placements.filter(p => p.status === 'active');
  const activeCandidateIds = [...new Set(activePlacements.map(p => p.candidate_id).filter(Boolean))];
  const clientCompliance = allCompliance.filter(c => activeCandidateIds.includes(c.candidate_id));

  const activeEmployees = activePlacements.length;
  const openJobs = jobs.filter(j => j.status === 'open').length;
  const pendingTimesheets = timesheets.filter(t => !['admin_approved', 'paid'].includes(t.status)).length;

  const cc = clientCompliance;
  const complianceSummary = activePlacements.length === 0
    ? { label: 'No employees linked', tone: 'muted' }
    : cc.length === 0
      ? { label: 'Documents Due', tone: 'amber' }
      : cc.some(c => ['expired', 'missing', 'non_compliant'].includes(c.compliance_status))
        ? { label: 'Non-Compliant', tone: 'red' }
        : cc.some(c => c.compliance_status === 'expiring_soon')
          ? { label: 'Expiring Soon', tone: 'amber' }
          : { label: 'Complete', tone: 'green' };

  const mainWorksite = client?.primary_worksite
    || activePlacements.find(p => p.site)?.site
    || client?.site_locations?.[0]
    || client?.billing_address
    || '—';

  useEffect(() => {
    if (client && !client.client_id) {
      const num = String(client.id).slice(-5).padStart(5, '0');
      base44.entities.Client.update(client.id, { client_id: `CLI-${num}` });
    }
  }, [client]);

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const ref = sectionRefs.current[sectionId];
    if (ref) ref.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleUpdate = (data) => updateMutation.mutate(data);

  const handleAddComment = async ({ type, text }) => {
    const user = await base44.auth.me().catch(() => null);
    const comments = [...(client.client_comments || []), { type, text, author_name: user?.full_name || 'Unknown', date: new Date().toISOString() }];
    await base44.entities.Client.update(id, { client_comments: comments });
    queryClient.invalidateQueries({ queryKey: ['client', id] });
  };

  const handleDeleteComment = async (idx) => {
    const comments = [...(client.client_comments || [])];
    comments.splice(idx, 1);
    await base44.entities.Client.update(id, { client_comments: comments });
    queryClient.invalidateQueries({ queryKey: ['client', id] });
  };

  const handleAddCompliance = async (c) => {
    const items = [...(client.client_compliance || []), { ...c }];
    await base44.entities.Client.update(id, { client_compliance: items });
    queryClient.invalidateQueries({ queryKey: ['client', id] });
  };

  const handleDeleteCompliance = async (idx) => {
    const items = [...(client.client_compliance || [])];
    items.splice(idx, 1);
    await base44.entities.Client.update(id, { client_compliance: items });
    queryClient.invalidateQueries({ queryKey: ['client', id] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Client not found.</p>
        <Link to="/clients" className="text-primary hover:underline mt-2 inline-block">Back to Clients</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link to="/clients" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Clients
      </Link>

      <ClientHeader client={client} onEdit={() => setShowEdit(true)} onStatusChange={(s) => handleUpdate({ status: s })} />

      <CurrentWorkforceBanner
        activeEmployees={activeEmployees}
        mainWorksite={mainWorksite}
        openJobs={openJobs}
        pendingTimesheets={pendingTimesheets}
        complianceSummary={complianceSummary}
        onViewEmployees={() => scrollToSection('employees')}
      />

      <ClientQuickAccess activeSection={activeSection} onSelect={scrollToSection} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div ref={el => sectionRefs.current.company = el}><CompanyDetailsCard client={client} onUpdate={handleUpdate} /></div>
        <div ref={el => sectionRefs.current.operations = el}><OperationalDetailsCard client={client} onUpdate={handleUpdate} /></div>
        <div ref={el => sectionRefs.current.requirements = el}><ClientRequirementsSection client={client} onUpdate={handleUpdate} /></div>
        <div ref={el => sectionRefs.current.contacts = el}><ClientContactsSection client={client} /></div>
        <div ref={el => sectionRefs.current.sites = el}><SiteLocationsSection client={client} /></div>
        <div ref={el => sectionRefs.current['job-orders'] = el}><JobOrdersTab jobs={jobs} client={client} /></div>
        <div ref={el => sectionRefs.current.candidates = el}><CandidatesSubmittedTab applications={clientApplications} candidates={allCandidates} jobs={jobs} client={client} /></div>
        <div ref={el => sectionRefs.current.employees = el}><EmployeesPlacementsTab placements={placements} candidates={allCandidates} client={client} /></div>
        <div ref={el => sectionRefs.current.timesheets = el}><TimesheetsTab timesheets={timesheets} placements={placements} client={client} /></div>
        <div ref={el => sectionRefs.current.rates = el}><RatesBillingTab client={client} jobs={jobs} placements={placements} /></div>
        <div ref={el => sectionRefs.current.documents = el}><ClientDocumentsSection client={client} /></div>
        <div ref={el => sectionRefs.current.compliance = el}><ClientComplianceSection client={client} onAddCompliance={handleAddCompliance} onDeleteCompliance={handleDeleteCompliance} /></div>
        <div ref={el => sectionRefs.current.comments = el}><ClientCommentsSection client={client} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment} /></div>
        <div ref={el => sectionRefs.current.activities = el} className="lg:col-span-2"><ActivityNotesTab client={client} /></div>
      </div>

      <ClientFormDialog client={client} open={showEdit} onOpenChange={setShowEdit} />
    </div>
  );
}