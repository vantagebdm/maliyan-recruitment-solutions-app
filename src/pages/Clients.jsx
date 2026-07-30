import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Building2, Phone, Mail, MapPin, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import StatusBadge from '../components/shared/StatusBadge';

export default function Clients() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [expandedClient, setExpandedClient] = useState(null);
  const queryClient = useQueryClient();

  const { data: placements = [] } = useQuery({
    queryKey: ['placements'],
    queryFn: () => base44.entities.Placement.list('-created_date'),
    initialData: [],
  });

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list('-created_date'),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Client.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['clients'] }); setShowForm(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Client.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['clients'] }); setShowForm(false); setEditing(null); },
  });

  const openForm = (client) => {
    setEditing(client);
    setForm(client ? { ...client } : { status: 'active' });
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

  const filtered = clients.filter(c =>
    c.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.primary_contact_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">{clients.length} total clients</p>
        </div>
        <Button onClick={() => openForm(null)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Client
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Featured Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Maliyan Industry Partners */}
        <div onClick={() => navigate('/clients/maliyan')} className="col-span-2 sm:col-span-3 lg:col-span-2 bg-gradient-to-br from-primary to-primary/80 rounded-xl p-5 text-primary-foreground flex flex-col justify-between min-h-[110px] shadow-md cursor-pointer hover:opacity-90 transition-opacity">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 opacity-80" />
            <span className="text-xs font-semibold uppercase tracking-widest opacity-70">Partner</span>
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">Maliyan Industry Partners</h3>
            <p className="text-xs opacity-70 mt-1">Strategic Industry Partner</p>
          </div>
        </div>

        {/* State Cards */}
        {[
          { state: 'NSW', name: 'New South Wales', color: 'from-blue-600 to-blue-700' },
          { state: 'WA', name: 'Western Australia', color: 'from-amber-500 to-amber-600' },
          { state: 'SA', name: 'South Australia', color: 'from-red-600 to-red-700' },
          { state: 'NT', name: 'Northern Territory', color: 'from-orange-500 to-orange-600' },
          { state: 'QLD', name: 'Queensland', color: 'from-purple-600 to-purple-700' },
          { state: 'VIC', name: 'Victoria', color: 'from-teal-600 to-teal-700' },
          { state: 'TAS', name: 'Tasmania', color: 'from-emerald-600 to-emerald-700' },
          { state: 'ACT', name: 'Australian Capital Territory', color: 'from-slate-600 to-slate-700' },
        ].map(({ state, name, color }) => {
          const count = clients.filter(c => c.site_locations?.some(s => s.includes(state)) || c.billing_address?.includes(state)).length;
          return (
            <div key={state} className={`bg-gradient-to-br ${color} rounded-xl p-4 text-white flex flex-col justify-between min-h-[100px] shadow-sm`}>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 opacity-70" />
                <span className="text-xs opacity-70 font-medium">State</span>
              </div>
              <div>
                <p className="text-2xl font-black tracking-tight">{state}</p>
                <p className="text-[10px] opacity-60 leading-tight mt-0.5">{name}</p>
                {count > 0 && <p className="text-xs font-semibold mt-1 opacity-90">{count} client{count !== 1 ? 's' : ''}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground font-medium">All Clients</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(client => (
            <div
              key={client.id}
              onClick={() => openForm(client)}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{client.company_name}</h3>
                  <StatusBadge status={client.status} className="mt-1" />
                </div>
              </div>
              {client.primary_contact_name && (
                <p className="text-sm font-medium mb-1">{client.primary_contact_name}</p>
              )}
              <div className="space-y-1 text-xs text-muted-foreground">
                {client.primary_contact_email && (
                  <p className="flex items-center gap-1.5"><Mail className="w-3 h-3" />{client.primary_contact_email}</p>
                )}
                {client.primary_contact_phone && (
                  <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{client.primary_contact_phone}</p>
                )}
                {client.industry && <p className="mt-2 font-medium text-foreground">{client.industry}</p>}
              </div>

              {/* Employees / Placements */}
              {(() => {
                const clientPlacements = placements.filter(p => p.client_id === client.id);
                const activeCount = clientPlacements.filter(p => p.status === 'active').length;
                return (
                  <div className="mt-3 border-t border-border pt-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); setExpandedClient(expandedClient === client.id ? null : client.id); }}
                      className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <span className="flex items-center gap-1.5 font-medium">
                        <Users className="w-3.5 h-3.5" /> Employees / Placements
                        {activeCount > 0 && <span className="inline-flex px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[10px] font-semibold">{activeCount} active</span>}
                      </span>
                      {expandedClient === client.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {expandedClient === client.id && (
                      <div className="mt-2 space-y-1">
                        {clientPlacements.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic pl-1">No placements recorded.</p>
                        ) : (
                          clientPlacements.map(p => (
                            <div key={p.id} className="flex items-center justify-between gap-2 text-xs py-1">
                              {p.candidate_id ? (
                                <Link to={`/candidates/${p.candidate_id}`} onClick={(e) => e.stopPropagation()} className="font-medium text-primary hover:underline truncate">
                                  {p.candidate_name || 'View candidate'}
                                </Link>
                              ) : (
                                <span className="truncate">{p.candidate_name}</span>
                              )}
                              <span className="flex items-center gap-2 flex-shrink-0">
                                {p.job_title && <span className="text-muted-foreground truncate max-w-[120px]">{p.job_title}</span>}
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${p.status === 'active' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                                  {p.status === 'active' ? 'Active' : p.status}
                                </span>
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Client' : 'Add Client'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label>Company Name *</Label>
              <Input value={form.company_name || ''} onChange={e => update('company_name', e.target.value)} required />
            </div>
            <div>
              <Label>ABN</Label>
              <Input value={form.abn || ''} onChange={e => update('abn', e.target.value)} />
            </div>
            <div>
              <Label>Industry</Label>
              <Input value={form.industry || ''} onChange={e => update('industry', e.target.value)} />
            </div>
            <div>
              <Label>Primary Contact Name</Label>
              <Input value={form.primary_contact_name || ''} onChange={e => update('primary_contact_name', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contact Email</Label>
                <Input value={form.primary_contact_email || ''} onChange={e => update('primary_contact_email', e.target.value)} />
              </div>
              <div>
                <Label>Contact Phone</Label>
                <Input value={form.primary_contact_phone || ''} onChange={e => update('primary_contact_phone', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Billing Address</Label>
              <Textarea value={form.billing_address || ''} onChange={e => update('billing_address', e.target.value)} className="h-16" />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status || 'active'} onValueChange={v => update('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={form.notes || ''} onChange={e => update('notes', e.target.value)} className="h-16" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editing ? 'Update' : 'Add Client'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}