import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, Users, Briefcase, FileText, MapPin, Phone, Mail, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import { format } from 'date-fns';

const STAT_CARD = ({ label, value, icon: Icon, color }) => (
  <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  </div>
);

export default function MaliyanPortal() {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list('-created_date'),
    initialData: [],
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => base44.entities.Job.list('-created_date'),
    initialData: [],
  });

  const { data: placements = [] } = useQuery({
    queryKey: ['placements'],
    queryFn: () => base44.entities.Placement.list('-created_date'),
    initialData: [],
  });

  const { data: timesheets = [] } = useQuery({
    queryKey: ['timesheets'],
    queryFn: () => base44.entities.Timesheet.list('-created_date'),
    initialData: [],
  });

  const activeJobs = jobs.filter(j => j.status === 'open');
  const activePlacements = placements.filter(p => p.status === 'active');
  const pendingTimesheets = timesheets.filter(t => t.status === 'submitted' || t.status === 'client_approved');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'jobs', label: 'Active Jobs' },
    { id: 'placements', label: 'Placements' },
    { id: 'timesheets', label: 'Timesheets' },
  ];

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link to="/clients" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Clients
      </Link>

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-2xl p-8 text-primary-foreground shadow-lg">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest opacity-70 mb-1">Strategic Industry Partner</p>
              <h1 className="text-3xl font-black">Maliyan Industry Partners</h1>
              <p className="text-sm opacity-70 mt-1">Partner Portal — STS Recruitment Hub</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 text-right">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">Active Partner</span>
            <p className="text-xs opacity-60 mt-1">Managed by STS Recruitment</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <STAT_CARD label="Active Jobs" value={activeJobs.length} icon={Briefcase} color="bg-blue-100 text-blue-600" />
        <STAT_CARD label="Active Placements" value={activePlacements.length} icon={Users} color="bg-emerald-100 text-emerald-600" />
        <STAT_CARD label="Pending Timesheets" value={pendingTimesheets.length} icon={Clock} color="bg-amber-100 text-amber-600" />
        <STAT_CARD label="Total Clients" value={clients.length} icon={TrendingUp} color="bg-purple-100 text-purple-600" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* About */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="font-bold text-base">About This Partnership</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Maliyan Industry Partners is a key strategic partner of STS Recruitment, collaborating across multiple sectors and states to deliver skilled workforce solutions to Australian industry.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>National — All States & Territories</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>Mining, Construction, Civil, Oil & Gas</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="font-bold text-base">Recent Jobs</h2>
            {activeJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active jobs at this time.</p>
            ) : (
              <div className="space-y-3">
                {activeJobs.slice(0, 5).map(job => (
                  <div key={job.id} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job.site || job.location}</p>
                    </div>
                    <StatusBadge status={job.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-bold">Active Jobs</h2>
          </div>
          {activeJobs.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>No active jobs</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {activeJobs.map(job => (
                <div key={job.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{job.title}</p>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                      {job.site && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.site}</span>}
                      {job.roster && <span>{job.roster}</span>}
                      {job.start_date && <span>Start: {format(new Date(job.start_date), 'dd MMM yyyy')}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right text-xs">
                      <p className="font-semibold">{job.positions_filled || 0}/{job.positions_available || 0}</p>
                      <p className="text-muted-foreground">Filled</p>
                    </div>
                    <StatusBadge status={job.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'placements' && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-bold">Active Placements</h2>
          </div>
          {activePlacements.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>No active placements</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {activePlacements.map(p => (
                <div key={p.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{p.candidate_name}</p>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{p.job_title}</span>
                      {p.site && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.site}</span>}
                      {p.start_date && <span>From {format(new Date(p.start_date), 'dd MMM yyyy')}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 text-right text-xs">
                    {p.pay_rate && <div><p className="font-semibold">${p.pay_rate}/hr</p><p className="text-muted-foreground">Pay Rate</p></div>}
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'timesheets' && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-bold">Timesheets Awaiting Action</h2>
          </div>
          {pendingTimesheets.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>All timesheets are up to date</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {pendingTimesheets.map(t => (
                <div key={t.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{t.candidate_name}</p>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                      {t.week_ending && <span>Week ending {format(new Date(t.week_ending), 'dd MMM yyyy')}</span>}
                      {t.site && <span>{t.site}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 text-right text-xs">
                    <div>
                      <p className="font-semibold">{(t.total_ordinary_hours || 0) + (t.total_overtime_hours || 0)}h</p>
                      <p className="text-muted-foreground">Total Hours</p>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}