import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Search, CheckCircle2, Circle } from 'lucide-react';
import StatusBadge from '../components/shared/StatusBadge';
import { format } from 'date-fns';

const checklistItems = [
  { key: 'candidate_selected', label: 'Candidate Selected' },
  { key: 'compliance_checked', label: 'Compliance Checked' },
  { key: 'medical_checked', label: 'Medical Checked' },
  { key: 'contract_issued', label: 'Contract Issued' },
  { key: 'travel_booked', label: 'Travel Booked' },
  { key: 'accommodation_booked', label: 'Accommodation Booked' },
  { key: 'site_induction_completed', label: 'Site Induction Completed' },
  { key: 'ppe_confirmed', label: 'PPE Confirmed' },
  { key: 'client_notified', label: 'Client Notified' },
  { key: 'start_date_confirmed', label: 'Start Date Confirmed' },
];

export default function Mobilisation() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const queryClient = useQueryClient();

  const { data: mobilisations = [], isLoading } = useQuery({
    queryKey: ['mobilisations'],
    queryFn: () => base44.entities.Mobilisation.list('-created_date'),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Mobilisation.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['mobilisations'] }); setShowForm(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Mobilisation.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['mobilisations'] }); setShowForm(false); },
  });

  const openForm = (item) => {
    setEditing(item);
    setForm(item ? { ...item } : { status: 'pending', checklist: {} });
    setShowForm(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const getCompletionPct = (checklist) => {
    if (!checklist) return 0;
    const done = checklistItems.filter(i => checklist[i.key]).length;
    return Math.round((done / checklistItems.length) * 100);
  };

  const filtered = mobilisations.filter(m =>
    m.candidate_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.job_title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mobilisation Centre</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage workforce deployment</p>
        </div>
        <Button onClick={() => openForm(null)} className="gap-2">
          <Plus className="w-4 h-4" /> New Mobilisation
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(mob => {
            const pct = getCompletionPct(mob.checklist);
            return (
              <div key={mob.id} onClick={() => openForm(mob)}
                className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{mob.candidate_name || 'Unknown'}</h3>
                    <p className="text-sm text-muted-foreground">{mob.job_title} — {mob.client_name}</p>
                  </div>
                  <StatusBadge status={mob.status} />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold">{pct}%</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {checklistItems.map(item => (
                    <div key={item.key} className="flex items-center gap-1 text-xs">
                      {mob.checklist?.[item.key] ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                      <span className={mob.checklist?.[item.key] ? 'text-foreground' : 'text-muted-foreground'}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Mobilisation' : 'New Mobilisation'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Candidate Name</Label>
                <Input value={form.candidate_name || ''} onChange={e => update('candidate_name', e.target.value)} />
              </div>
              <div>
                <Label>Job Title</Label>
                <Input value={form.job_title || ''} onChange={e => update('job_title', e.target.value)} />
              </div>
              <div>
                <Label>Client</Label>
                <Input value={form.client_name || ''} onChange={e => update('client_name', e.target.value)} />
              </div>
              <div>
                <Label>Site</Label>
                <Input value={form.site || ''} onChange={e => update('site', e.target.value)} />
              </div>
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={form.start_date || ''} onChange={e => update('start_date', e.target.value)} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status || 'pending'} onValueChange={v => update('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="mobilised">Mobilised</SelectItem>
                    <SelectItem value="on_site">On Site</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Checklist</Label>
              <div className="space-y-2 bg-muted/30 rounded-lg p-4">
                {checklistItems.map(item => (
                  <div key={item.key} className="flex items-center gap-3">
                    <Checkbox
                      checked={form.checklist?.[item.key] || false}
                      onCheckedChange={v => update('checklist', { ...form.checklist, [item.key]: v })}
                    />
                    <span className="text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea value={form.notes || ''} onChange={e => update('notes', e.target.value)} className="h-16" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}