import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/shared/StatusBadge';
import JobFormDialog from '@/components/jobs/JobFormDialog';
import { Briefcase, MapPin, Users, Calendar, Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function JobOrdersTab({ jobs, client }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Job.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['jobs', 'client', client.id] }); setShowForm(false); },
  });

  const onSave = (form) => createMutation.mutate({ ...form, client_id: client.id, client_name: client.company_name });

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5"><Plus className="w-4 h-4" /> Add Job Order</Button>
      </div>
      {jobs.length === 0 ? (
        <p className="text-sm text-muted-foreground italic bg-card rounded-xl border border-border p-5">No job orders recorded for this client.</p>
      ) : (
        <div className="space-y-2">
          {jobs.map(job => (
            <div key={job.id} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h4 className="font-semibold text-sm">{job.title}</h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                    {job.site && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.site}</span>}
                    {job.roster && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.roster}</span>}
                    {job.start_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(job.start_date), 'dd MMM yyyy')}</span>}
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{job.positions_filled || 0}/{job.positions_available || 1} filled</span>
                  </div>
                </div>
                <StatusBadge status={job.status} />
              </div>
            </div>
          ))}
        </div>
      )}
      <JobFormDialog open={showForm} onOpenChange={setShowForm} onSave={onSave} isLoading={createMutation.isPending} />
    </div>
  );
}