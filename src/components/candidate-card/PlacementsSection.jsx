import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Plus, Pencil, Trash2, Briefcase, MapPin, Calendar, Clock, Check, ChevronsUpDown, Building2 } from 'lucide-react';
import { format } from 'date-fns';

const INTERNAL_COMPANY = 'Maliyan';
const isInternal = (p) => p.employment_type === 'non_outsourced_company_employee';

const STATUS_STYLES = {
  active: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
  closed: 'bg-slate-500/10 text-slate-600 border-slate-500/30',
  pending: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
  completed: 'bg-blue-500/10 text-blue-700 border-blue-500/30',
  terminated: 'bg-rose-500/10 text-rose-700 border-rose-500/30',
  on_hold: 'bg-orange-500/10 text-orange-700 border-orange-500/30',
};
const STATUS_LABEL = {
  active: 'Active',
  closed: 'Closed',
  pending: 'Pending',
  completed: 'Completed',
  terminated: 'Terminated',
  on_hold: 'On Hold',
};

const EMP_TYPE_LABEL = {
  outsourced: 'Outsourced',
  non_outsourced_company_employee: 'Non Outsourced - Company Employee',
};
const EMP_TYPE_STYLE = {
  outsourced: 'bg-slate-500/10 text-slate-600 border-slate-500/30',
  non_outsourced_company_employee: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/30',
};

const EMPTY = { client_id: '', client_name: '', job_title: '', site: '', status: 'active', employment_type: 'outsourced', start_date: '', end_date: '', roster: '' };

export default function PlacementsSection({ candidate, placements = [], clients = [], onAdd, onUpdate, onDelete, isLoadingClients }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [clientOpen, setClientOpen] = useState(false);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const openAdd = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (p) => { setEditing(p); setForm({ ...EMPTY, ...p }); setOpen(true); };

  const handleSave = () => {
    const internal = form.employment_type === 'non_outsourced_company_employee';
    if (!internal && !form.client_id) return;
    const payload = {
      candidate_id: candidate.id,
      candidate_name: `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim(),
      client_id: internal ? '' : form.client_id,
      client_name: internal ? INTERNAL_COMPANY : form.client_name,
      job_title: form.job_title,
      site: form.site,
      status: form.status,
      employment_type: form.employment_type,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      roster: form.roster,
    };
    if (editing) onUpdate(editing.id, payload);
    else onAdd(payload);
    setOpen(false);
  };

  const selectClient = (c) => {
    set('client_id', c.id);
    set('client_name', c.company_name);
    setClientOpen(false);
  };
  const selectedClient = clients.find(c => c.id === form.client_id);

  const sorted = [...placements].sort((a, b) => (b.start_date || '').localeCompare(a.start_date || ''));

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Placements</h3>
            <p className="text-xs text-muted-foreground">Employment & client history</p>
          </div>
        </div>
        <Button size="sm" onClick={openAdd} className="gap-1">
          <Plus className="w-3.5 h-3.5" /> Add Placement
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-border rounded-lg">
          No placement records yet. Click <span className="font-medium text-foreground">Add Placement</span> to record this candidate's first placement.
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(p => (
            <div key={p.id} className={`rounded-lg border p-4 ${p.status === 'active' ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border bg-muted/20'}`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {p.client_id && !isInternal(p) ? (
                      <Link to="/clients" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />{p.client_name || 'Client'}
                      </Link>
                    ) : (
                      <span className="text-sm font-semibold inline-flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />{p.client_name || (isInternal(p) ? INTERNAL_COMPANY : 'Client')}
                      </span>
                    )}
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[p.status] || STATUS_STYLES.closed}`}>
                      {STATUS_LABEL[p.status] || p.status}
                    </span>
                    {p.employment_type && p.employment_type !== 'outsourced' && (
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${EMP_TYPE_STYLE[p.employment_type] || EMP_TYPE_STYLE.outsourced}`}>
                        {EMP_TYPE_LABEL[p.employment_type] || p.employment_type}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {p.job_title && <span className="font-medium text-foreground">{p.job_title}</span>}
                    {p.site && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{p.site}</span>}
                    {p.roster && <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{p.roster}</span>}
                    {p.start_date && <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(p.start_date), 'dd MMM yyyy')}{p.end_date ? ` → ${format(new Date(p.end_date), 'dd MMM yyyy')}` : ' → Present'}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(p)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(p.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Placement' : 'Add Placement'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Client searchable dropdown — hidden for internal company employees */}
            {form.employment_type !== 'non_outsourced_company_employee' && (
            <div className="space-y-1.5">
              <Label className="text-xs">Client *</Label>
              <Popover open={clientOpen} onOpenChange={setClientOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between font-normal" disabled={isLoadingClients}>
                    {selectedClient ? selectedClient.company_name : (isLoadingClients ? 'Loading clients…' : 'Search client…')}
                    <ChevronsUpDown className="w-4 h-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search clients…" />
                    <CommandList>
                      <CommandEmpty>No client found.</CommandEmpty>
                      <CommandGroup>
                        {clients.map(c => (
                          <CommandItem key={c.id} value={c.company_name} onSelect={() => selectClient(c)}>
                            <Check className={`w-3.5 h-3.5 ${form.client_id === c.id ? 'opacity-100' : 'opacity-0'}`} />
                            {c.company_name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Position</Label>
                <Input value={form.job_title} onChange={e => set('job_title', e.target.value)} placeholder="e.g. Diesel Mechanic" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Work location</Label>
                <Input value={form.site} onChange={e => set('site', e.target.value)} placeholder="e.g. Mt Keith Mine" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Placement status</Label>
                <Select value={form.status} onValueChange={v => set('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Employment type</Label>
                <Select value={form.employment_type || 'outsourced'} onValueChange={v => set('employment_type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="outsourced">Outsourced</SelectItem>
                    <SelectItem value="non_outsourced_company_employee">Non Outsourced - Company Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Roster</Label>
                <Input value={form.roster} onChange={e => set('roster', e.target.value)} placeholder="e.g. 2/1 FIFO" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Start date</Label>
                <Input type="date" value={form.start_date || ''} onChange={e => set('start_date', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">End date</Label>
                <Input type="date" value={form.end_date || ''} onChange={e => set('end_date', e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={form.employment_type !== 'non_outsourced_company_employee' && !form.client_id}>{editing ? 'Update' : 'Add Placement'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}