import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Search, MapPin, Calendar } from 'lucide-react';
import StatusBadge from '../components/shared/StatusBadge';
import { format } from 'date-fns';

export default function JobOrders() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
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
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['jobs'] }); setShowForm(false); },
  });

  const openForm = (job) => {
    setEditing(job);
    setForm(job ? { ...job } : { status: 'draft', positions_available: 1, accommodation_required: false, travel_required: false });
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

  const filtered = jobs.filter(j =>
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.client_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">Labour requests and job orders</p>
        </div>
        <Button onClick={() => openForm(null)} className="gap-2">
          <Plus className="w-4 h-4" /> New Job Order
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
          {filtered.map(job => (
            <div key={job.id} onClick={() => openForm(job)}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">{job.client_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={job.status} />
                  <span className="text-sm font-semibold">{job.positions_available || 1} pos</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                {job.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>}
                {job.roster && <span>{job.roster}</span>}
                {job.start_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(job.start_date), 'dd MMM yyyy')}</span>}
                {job.charge_rate && <span>${job.charge_rate}/hr charge</span>}
                {job.pay_rate && <span>${job.pay_rate}/hr pay</span>}
                {job.accommodation_required && <span className="text-amber-600">Accom Required</span>}
                {job.travel_required && <span className="text-blue-600">Travel Required</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Job Order' : 'New Job Order'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Role Required *</Label>
                <Input value={form.title || ''} onChange={e => update('title', e.target.value)} required />
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
                <Label>Workers Required</Label>
                <Input type="number" value={form.positions_available || 1} onChange={e => update('positions_available', parseInt(e.target.value))} />
              </div>
              <div>
                <Label>Location</Label>
                <Input value={form.location || ''} onChange={e => update('location', e.target.value)} />
              </div>
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={form.start_date || ''} onChange={e => update('start_date', e.target.value)} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={form.end_date || ''} onChange={e => update('end_date', e.target.value)} />
              </div>
              <div>
                <Label>Roster</Label>
                <Input value={form.roster || ''} onChange={e => update('roster', e.target.value)} placeholder="e.g. 2/1 FIFO" />
              </div>
              <div>
                <Label>Shift Hours</Label>
                <Input value={form.shift_hours || ''} onChange={e => update('shift_hours', e.target.value)} />
              </div>
              <div>
                <Label>Charge Rate ($/hr)</Label>
                <Input type="number" value={form.charge_rate || ''} onChange={e => update('charge_rate', parseFloat(e.target.value))} />
              </div>
              <div>
                <Label>Pay Rate ($/hr)</Label>
                <Input type="number" value={form.pay_rate || ''} onChange={e => update('pay_rate', parseFloat(e.target.value))} />
              </div>
              <div>
                <Label>Purchase Order</Label>
                <Input value={form.purchase_order || ''} onChange={e => update('purchase_order', e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.accommodation_required || false} onCheckedChange={v => update('accommodation_required', v)} />
                <Label>Accommodation Required</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.travel_required || false} onCheckedChange={v => update('travel_required', v)} />
                <Label>Travel Required</Label>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description || ''} onChange={e => update('description', e.target.value)} className="h-20" />
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