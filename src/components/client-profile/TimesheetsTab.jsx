import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import StatusBadge from '@/components/shared/StatusBadge';
import { Calendar, Clock, Plus } from 'lucide-react';
import { format } from 'date-fns';

const statuses = ['draft', 'submitted', 'client_approved', 'admin_approved', 'rejected', 'payroll_ready', 'paid'];
const emptyForm = { placement_id: '', week_ending: '', total_ordinary_hours: '', status: 'draft' };

export default function TimesheetsTab({ timesheets, placements, client }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Timesheet.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['timesheets', 'client', client.id] }); setShowForm(false); setForm(emptyForm); },
  });

  const onSave = (e) => {
    e.preventDefault();
    const p = placements.find(pl => pl.id === form.placement_id);
    createMutation.mutate({
      candidate_id: p?.candidate_id || '',
      candidate_name: p?.candidate_name || '',
      placement_id: form.placement_id,
      client_id: client.id,
      client_name: client.company_name,
      week_ending: form.week_ending,
      total_ordinary_hours: Number(form.total_ordinary_hours) || 0,
      status: form.status,
      source: 'manual',
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5"><Plus className="w-4 h-4" /> Add Timesheet</Button>
      </div>
      {timesheets.length === 0 ? (
        <p className="text-sm text-muted-foreground italic bg-card rounded-xl border border-border p-5">No timesheets recorded for this client.</p>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">Candidate</th>
                <th className="text-left px-4 py-2.5 font-medium">Week Ending</th>
                <th className="text-left px-4 py-2.5 font-medium">Ordinary Hours</th>
                <th className="text-left px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {timesheets.map(t => (
                <tr key={t.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-2.5">
                    {t.candidate_id ? <Link to={`/candidates/${t.candidate_id}`} className="font-medium text-primary hover:underline">{t.candidate_name || 'View'}</Link> : <span className="font-medium">{t.candidate_name || '—'}</span>}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {t.week_ending ? <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{format(new Date(t.week_ending), 'dd MMM yyyy')}</span> : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground"><span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{t.total_ordinary_hours || 0} hrs</span></td>
                  <td className="px-4 py-2.5"><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Timesheet</DialogTitle></DialogHeader>
          <form onSubmit={onSave} className="space-y-3">
            <div>
              <Label>Employee / Placement *</Label>
              <Select value={form.placement_id} onValueChange={v => setForm({ ...form, placement_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {placements.length === 0 ? <SelectItem value="_none" disabled>No placements</SelectItem> : placements.map(p => <SelectItem key={p.id} value={p.id}>{p.candidate_name || '—'}{p.job_title ? ` · ${p.job_title}` : ''}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Week Ending *</Label><Input type="date" value={form.week_ending} onChange={e => setForm({ ...form, week_ending: e.target.value })} required /></div>
              <div><Label>Ordinary Hours</Label><Input type="number" value={form.total_ordinary_hours} onChange={e => setForm({ ...form, total_ordinary_hours: e.target.value })} /></div>
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
              <Button type="submit" disabled={createMutation.isPending || !form.placement_id || !form.week_ending}>Create</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}