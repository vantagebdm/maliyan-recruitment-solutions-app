import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MapPin, Calendar, DollarSign, Users as UsersIcon } from 'lucide-react';
import StatusBadge from '../components/shared/StatusBadge';
import JobFormDialog from '../components/jobs/JobFormDialog';
import { format } from 'date-fns';

export default function Jobs() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => base44.entities.Job.list('-created_date'),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Job.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['jobs'] }); setShowForm(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Job.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['jobs'] }); setShowForm(false); setEditingJob(null); },
  });

  const handleSave = (data) => {
    if (editingJob) {
      updateMutation.mutate({ id: editingJob.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filtered = jobs.filter(j =>
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.client_name?.toLowerCase().includes(search.toLowerCase()) ||
    j.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jobs</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage vacancies and job postings</p>
        </div>
        <Button onClick={() => { setEditingJob(null); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Post Job
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No jobs found. Create your first job posting.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(job => (
            <div
              key={job.id}
              onClick={() => { setEditingJob(job); setShowForm(true); }}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-base">{job.title}</h3>
                    <StatusBadge status={job.status} />
                    {job.job_type && (
                      <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{job.job_type}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {job.client_name && <span className="font-medium text-foreground">{job.client_name}</span>}
                    {job.location && (
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                    )}
                    {job.roster && <span>{job.roster}</span>}
                    {job.start_date && (
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{format(new Date(job.start_date), 'dd MMM yyyy')}</span>
                    )}
                    {job.pay_rate && (
                      <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />${job.pay_rate}/hr</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-sm">
                    <UsersIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">{job.positions_filled || 0}</span>
                    <span className="text-muted-foreground">/ {job.positions_available || 1}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Positions</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <JobFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        job={editingJob}
        onSave={handleSave}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}