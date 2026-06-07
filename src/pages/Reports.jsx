import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const COLORS = ['#1e3a5f', '#d4a017', '#22c55e', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

export default function Reports() {
  const { data: jobs = [] } = useQuery({ queryKey: ['jobs'], queryFn: () => base44.entities.Job.list(), initialData: [] });
  const { data: candidates = [] } = useQuery({ queryKey: ['candidates'], queryFn: () => base44.entities.Candidate.list(), initialData: [] });
  const { data: placements = [] } = useQuery({ queryKey: ['placements'], queryFn: () => base44.entities.Placement.list(), initialData: [] });
  const { data: timesheets = [] } = useQuery({ queryKey: ['timesheets'], queryFn: () => base44.entities.Timesheet.list(), initialData: [] });
  const { data: compliance = [] } = useQuery({ queryKey: ['compliance'], queryFn: () => base44.entities.ComplianceItem.list(), initialData: [] });

  const jobsByStatus = ['draft', 'open', 'filled', 'closed'].map(s => ({
    name: s.replace(/\b\w/g, l => l.toUpperCase()),
    value: jobs.filter(j => j.status === s).length,
  })).filter(d => d.value > 0);

  const complianceData = [
    { name: 'Compliant', value: compliance.filter(c => c.compliance_status === 'compliant').length },
    { name: 'Expiring', value: compliance.filter(c => c.compliance_status === 'expiring_soon').length },
    { name: 'Expired', value: compliance.filter(c => c.compliance_status === 'expired').length },
    { name: 'Missing', value: compliance.filter(c => c.compliance_status === 'missing').length },
  ].filter(d => d.value > 0);

  const pipelineData = [
    { stage: 'New', count: candidates.filter(c => c.pipeline_stage === 'new_applicant').length },
    { stage: 'Screening', count: candidates.filter(c => ['resume_review', 'phone_screen'].includes(c.pipeline_stage)).length },
    { stage: 'Interview', count: candidates.filter(c => c.pipeline_stage === 'interview').length },
    { stage: 'Compliance', count: candidates.filter(c => ['compliance_check', 'medical_required'].includes(c.pipeline_stage)).length },
    { stage: 'Ready', count: candidates.filter(c => c.pipeline_stage === 'ready_for_placement').length },
    { stage: 'Active', count: candidates.filter(c => c.pipeline_stage === 'active').length },
  ];

  const timesheetData = [
    { name: 'Draft', value: timesheets.filter(t => t.status === 'draft').length },
    { name: 'Submitted', value: timesheets.filter(t => t.status === 'submitted').length },
    { name: 'Approved', value: timesheets.filter(t => ['client_approved', 'admin_approved'].includes(t.status)).length },
    { name: 'Payroll Ready', value: timesheets.filter(t => t.status === 'payroll_ready').length },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Recruitment and workforce analytics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase">Total Candidates</p>
          <p className="text-3xl font-bold mt-1">{candidates.length}</p>
        </div>
        <div className="bg-card rounded-xl border p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase">Active Placements</p>
          <p className="text-3xl font-bold mt-1">{placements.filter(p => p.status === 'active').length}</p>
        </div>
        <div className="bg-card rounded-xl border p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase">Open Vacancies</p>
          <p className="text-3xl font-bold mt-1">{jobs.filter(j => j.status === 'open').length}</p>
        </div>
        <div className="bg-card rounded-xl border p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase">Compliance Issues</p>
          <p className="text-3xl font-bold mt-1">{compliance.filter(c => ['expired', 'missing'].includes(c.compliance_status)).length}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border p-5">
          <h3 className="text-sm font-semibold mb-4">Candidate Pipeline</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-5">
          <h3 className="text-sm font-semibold mb-4">Compliance Status</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={complianceData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {complianceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-5">
          <h3 className="text-sm font-semibold mb-4">Jobs by Status</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={jobsByStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {jobsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-5">
          <h3 className="text-sm font-semibold mb-4">Timesheet Status</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={timesheetData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {timesheetData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}