import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Clock } from 'lucide-react';
import StatusBadge from '../components/shared/StatusBadge';
import { format } from 'date-fns';

const statuses = ['draft', 'submitted', 'client_approved', 'admin_approved', 'rejected', 'payroll_ready', 'paid'];

export default function Timesheets() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const queryClient = useQueryClient();

  const { data: timesheets = [], isLoading } = useQuery({
    queryKey: ['timesheets'],
    queryFn: () => base44.entities.Timesheet.list('-created_date'),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Timesheet.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['timesheets'] }); setShowForm(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Timesheet.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['timesheets'] }); setShowForm(false); },
  });

  const openForm = (ts) => {
    setEditing(ts);
    setForm(ts ? { ...ts } : { status: 'draft', total_ordinary_hours: 0, total_overtime_hours: 0, total_allowances: 0 });
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

  const filtered = timesheets.filter(t => {
    const matchSearch = !search || t.candidate_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Timesheets</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage weekly timesheets</p>
        </div>
        <Button onClick={() => openForm(null)} className="gap-2">
          <Plus className="w-4 h-4" /> New Timesheet
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statuses.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Employee</th>
                <th className="text-left p-3 font-medium">Week Ending</th>
                <th className="text-left p-3 font-medium">Client</th>
                <th className="text-right p-3 font-medium">Ordinary</th>
                <th className="text-right p-3 font-medium">Overtime</th>
                <th className="text-right p-3 font-medium">Allowances</th>
                <th className="text-left p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Clock className="w-8 h-8 opacity-40" />
                      <p className="text-sm font-medium">No timesheets received yet</p>
                      <p className="text-xs">Timesheet entries submitted from the STS Hub will appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(ts => (
                  <tr key={ts.id} onClick={() => openForm(ts)} className="border-b hover:bg-muted/30 cursor-pointer transition-colors">
                    <td className="p-3 font-medium">{ts.candidate_name || 'Unknown'}</td>
                    <td className="p-3">{ts.week_ending ? format(new Date(ts.week_ending), 'dd MMM yyyy') : '—'}</td>
                    <td className="p-3">{ts.client_name || '—'}</td>
                    <td className="p-3 text-right">{ts.total_ordinary_hours || 0}h</td>
                    <td className="p-3 text-right">{ts.total_overtime_hours || 0}h</td>
                    <td className="p-3 text-right">${ts.total_allowances || 0}</td>
                    <td className="p-3"><StatusBadge status={ts.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Timesheet' : 'New Timesheet'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Employee Name</Label>
                <Input value={form.candidate_name || ''} onChange={e => update('candidate_name', e.target.value)} />
              </div>
              <div>
                <Label>Week Ending</Label>
                <Input type="date" value={form.week_ending || ''} onChange={e => update('week_ending', e.target.value)} />
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
                <Label>Ordinary Hours</Label>
                <Input type="number" value={form.total_ordinary_hours || ''} onChange={e => update('total_ordinary_hours', parseFloat(e.target.value))} />
              </div>
              <div>
                <Label>Overtime Hours</Label>
                <Input type="number" value={form.total_overtime_hours || ''} onChange={e => update('total_overtime_hours', parseFloat(e.target.value))} />
              </div>
              <div>
                <Label>Allowances ($)</Label>
                <Input type="number" value={form.total_allowances || ''} onChange={e => update('total_allowances', parseFloat(e.target.value))} />
              </div>
              <div>
                <Label>Pay Rate ($/hr)</Label>
                <Input type="number" value={form.pay_rate || ''} onChange={e => update('pay_rate', parseFloat(e.target.value))} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status || 'draft'} onValueChange={v => update('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statuses.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
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