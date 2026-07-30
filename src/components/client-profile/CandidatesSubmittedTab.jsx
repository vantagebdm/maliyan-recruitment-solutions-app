import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import StatusBadge from '@/components/shared/StatusBadge';
import ClientSection from '@/components/client-profile/ClientSection';
import { Briefcase, Plus, UserCheck } from 'lucide-react';

const statuses = ['submitted', 'reviewing', 'shortlisted', 'interview', 'offered', 'accepted', 'rejected', 'withdrawn'];

export default function CandidatesSubmittedTab({ applications, candidates, jobs, client }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ job_id: '', candidate_id: '', status: 'submitted' });

  const candidateMap = {};
  (candidates || []).forEach(c => { candidateMap[c.id] = c; });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Application.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['applications', 'client', client.id] }); setShowForm(false); setForm({ job_id: '', candidate_id: '', status: 'submitted' }); },
  });

  const onSave = (e) => {
    e.preventDefault();
    const job = jobs.find(j => j.id === form.job_id);
    const cand = candidateMap[form.candidate_id];
    createMutation.mutate({
      job_id: form.job_id,
      job_title: job?.title || '',
      candidate_id: form.candidate_id,
      candidate_name: cand ? `${cand.first_name} ${cand.last_name}` : '',
      status: form.status,
    });
  };

  return (
    <ClientSection
      icon={UserCheck}
      title="Candidate Submissions"
      action={<Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5"><Plus className="w-4 h-4" /> Add Submission</Button>}
    >
      {applications.length === 0 ? (
        <p className="text-sm text-muted-foreground italic text-center py-6">No candidates submitted for this client yet.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">Candidate</th>
                <th className="text-left px-4 py-2.5 font-medium">Job</th>
                <th className="text-left px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => {
                const candidate = candidateMap[app.candidate_id];
                const name = app.candidate_name || (candidate ? `${candidate.first_name} ${candidate.last_name}` : 'Unknown');
                return (
                  <tr key={app.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-2.5">
                      {app.candidate_id ? (
                        <Link to={`/candidates/${app.candidate_id}`} className="font-medium text-primary hover:underline">{name}</Link>
                      ) : <span className="font-medium">{name}</span>}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" />{app.job_title || '—'}</span>
                    </td>
                    <td className="px-4 py-2.5"><StatusBadge status={app.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Submission</DialogTitle></DialogHeader>
          <form onSubmit={onSave} className="space-y-3">
            <div>
              <Label>Job Order *</Label>
              <Select value={form.job_id} onValueChange={v => setForm({ ...form, job_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select job" /></SelectTrigger>
                <SelectContent>
                  {jobs.length === 0 ? <SelectItem value="_none" disabled>No job orders for this client</SelectItem> : jobs.map(j => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Candidate *</Label>
              <Select value={form.candidate_id} onValueChange={v => setForm({ ...form, candidate_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select candidate" /></SelectTrigger>
                <SelectContent>
                  {candidates.map(c => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || !form.job_id || !form.candidate_id}>Submit</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </ClientSection>
  );
}