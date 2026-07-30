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
import ClientSection from '@/components/client-profile/ClientSection';
import { Briefcase, MapPin, Calendar, DollarSign, Plus, Search, UsersRound } from 'lucide-react';
import { format } from 'date-fns';

const statuses = ['pending', 'active', 'completed', 'terminated', 'on_hold', 'closed'];
const emptyForm = { candidate_id: '', job_title: '', site: '', start_date: '', end_date: '', pay_rate: '', charge_rate: '', roster: '', purchase_order: '', status: 'active' };

export default function EmployeesPlacementsTab({ placements, candidates, client }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Placement.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['placements', 'client', client.id] }); setShowForm(false); setForm(emptyForm); setSearch(''); },
  });

  const onSave = (e) => {
    e.preventDefault();
    const cand = candidates.find(c => c.id === form.candidate_id);
    createMutation.mutate({
      ...form,
      pay_rate: form.pay_rate ? Number(form.pay_rate) : undefined,
      charge_rate: form.charge_rate ? Number(form.charge_rate) : undefined,
      candidate_id: form.candidate_id,
      candidate_name: cand ? `${cand.first_name} ${cand.last_name}` : '',
      client_id: client.id,
      client_name: client.company_name,
    });
  };

  const filtered = candidates.filter(c => {
    const q = search.toLowerCase();
    return !q || `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) || (c.candidate_id || '').toLowerCase().includes(q);
  });

  const sorted = [...placements].sort((a, b) => (b.start_date || '').localeCompare(a.start_date || ''));

  return (
    <ClientSection
      icon={UsersRound}
      title="Employees/Placements"
      action={<Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5"><Plus className="w-4 h-4" /> Add Placement</Button>}
    >
      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground italic text-center py-6">No employees / placements recorded for this client.</p>
      ) : (
        <div className="space-y-2">
          {sorted.map(p => (
            <div key={p.id} className="rounded-lg border border-border p-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  {p.candidate_id ? (
                    <Link to={`/candidates/${p.candidate_id}`} className="font-semibold text-sm text-primary hover:underline">{p.candidate_name || 'View candidate'}</Link>
                  ) : <h4 className="font-semibold text-sm">{p.candidate_name || '—'}</h4>}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                    {p.job_title && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{p.job_title}</span>}
                    {p.site && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.site}</span>}
                    {p.roster && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{p.roster}</span>}
                    {p.start_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(p.start_date), 'dd MMM yyyy')}</span>}
                    {p.pay_rate && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${p.pay_rate}/hr</span>}
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Placement</DialogTitle></DialogHeader>
          <form onSubmit={onSave} className="space-y-3">
            <div>
              <Label>Candidate *</Label>
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search candidate..." className="pl-8" />
              </div>
              <Select value={form.candidate_id} onValueChange={v => setForm({ ...form, candidate_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select candidate" /></SelectTrigger>
                <SelectContent>
                  {filtered.slice(0, 50).map(c => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}{c.candidate_id ? ` · ${c.candidate_id}` : ''}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Job Title</Label><Input value={form.job_title} onChange={e => setForm({ ...form, job_title: e.target.value })} /></div>
              <div><Label>Site</Label><Input value={form.site} onChange={e => setForm({ ...form, site: e.target.value })} /></div>
              <div><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} /></div>
              <div><Label>End Date</Label><Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} /></div>
              <div><Label>Pay Rate ($/hr)</Label><Input type="number" value={form.pay_rate} onChange={e => setForm({ ...form, pay_rate: e.target.value })} /></div>
              <div><Label>Charge Rate ($/hr)</Label><Input type="number" value={form.charge_rate} onChange={e => setForm({ ...form, charge_rate: e.target.value })} /></div>
              <div><Label>Roster</Label><Input value={form.roster} onChange={e => setForm({ ...form, roster: e.target.value })} placeholder="e.g. 2/1 FIFO" /></div>
              <div><Label>PO</Label><Input value={form.purchase_order} onChange={e => setForm({ ...form, purchase_order: e.target.value })} /></div>
              <div className="col-span-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || !form.candidate_id}>Create Placement</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </ClientSection>
  );
}