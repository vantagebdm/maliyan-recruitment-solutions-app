import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Briefcase, Users, ShieldCheck, Clock, Truck, DollarSign,
  UserCheck, AlertTriangle, CheckCircle, ClipboardList
} from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import ComplianceOverview from '../components/dashboard/ComplianceOverview';
import RecentActivity from '../components/dashboard/RecentActivity';
import PipelineChart from '../components/dashboard/PipelineChart';

export default function Dashboard() {
  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'], queryFn: () => base44.entities.Job.list(), initialData: [],
  });
  const { data: candidates = [] } = useQuery({
    queryKey: ['candidates'], queryFn: () => base44.entities.Candidate.list(), initialData: [],
  });
  const { data: complianceItems = [] } = useQuery({
    queryKey: ['compliance'], queryFn: () => base44.entities.ComplianceItem.list(), initialData: [],
  });
  const { data: timesheets = [] } = useQuery({
    queryKey: ['timesheets'], queryFn: () => base44.entities.Timesheet.list(), initialData: [],
  });
  const { data: placements = [] } = useQuery({
    queryKey: ['placements'], queryFn: () => base44.entities.Placement.list(), initialData: [],
  });
  const { data: mobilisations = [] } = useQuery({
    queryKey: ['mobilisations'], queryFn: () => base44.entities.Mobilisation.list(), initialData: [],
  });
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'], queryFn: () => base44.entities.Notification.list('-created_date', 20), initialData: [],
  });

  const activeJobs = jobs.filter(j => j.status === 'open').length;
  const newApplicants = candidates.filter(c => c.pipeline_stage === 'new_applicant').length;
  const inScreening = candidates.filter(c => ['resume_review', 'phone_screen', 'interview'].includes(c.pipeline_stage)).length;
  const readyForPlacement = candidates.filter(c => c.pipeline_stage === 'ready_for_placement').length;
  const complianceIssues = complianceItems.filter(c => ['expired', 'missing'].includes(c.compliance_status)).length;
  const expiringTickets = complianceItems.filter(c => c.compliance_status === 'expiring_soon').length;
  const pendingTimesheets = timesheets.filter(t => t.status === 'submitted').length;
  const activePlacements = placements.filter(p => p.status === 'active').length;
  const upcomingMobs = mobilisations.filter(m => ['pending', 'in_progress'].includes(m.status)).length;
  const payrollReady = timesheets.filter(t => t.status === 'admin_approved').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">STS Recruitment Hub Overview</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Active Vacancies" value={activeJobs} icon={Briefcase} color="blue" />
        <StatCard title="New Applicants" value={newApplicants} icon={Users} color="primary" />
        <StatCard title="In Screening" value={inScreening} icon={UserCheck} color="purple" />
        <StatCard title="Ready to Place" value={readyForPlacement} icon={CheckCircle} color="success" />
        <StatCard title="Compliance Issues" value={complianceIssues} icon={AlertTriangle} color="destructive" />
        <StatCard title="Expiring Tickets" value={expiringTickets} icon={ShieldCheck} color="warning" />
        <StatCard title="Pending Timesheets" value={pendingTimesheets} icon={Clock} color="blue" />
        <StatCard title="Active Placements" value={activePlacements} icon={ClipboardList} color="success" />
        <StatCard title="Mobilisations" value={upcomingMobs} icon={Truck} color="purple" />
        <StatCard title="Payroll Ready" value={payrollReady} icon={DollarSign} color="primary" />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PipelineChart candidates={candidates} />
        </div>
        <ComplianceOverview items={complianceItems} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity notifications={notifications} />
      </div>
    </div>
  );
}