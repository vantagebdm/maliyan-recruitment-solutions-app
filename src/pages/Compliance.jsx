import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Upload } from 'lucide-react';
import TrafficLight from '../components/shared/TrafficLight';
import StatusBadge from '../components/shared/StatusBadge';
import { format } from 'date-fns';
import { base44 as base44Client } from '@/api/base44Client';

const itemTypes = [
  'drivers_licence', 'trade_certificate', 'white_card', 'high_risk_licence',
  'working_at_heights', 'confined_space', 'first_aid', 'voc', 'site_induction',
  'medical', 'drug_alcohol', 'police_clearance', 'right_to_work',
  'superannuation', 'tax_file_declaration', 'bank_details', 'employment_contract', 'other'
];

export default function Compliance() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => base44.entities.ComplianceItem.list('-created_date'),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ComplianceItem.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['compliance'] }); setShowForm(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ComplianceItem.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['compliance'] }); setShowForm(false); },
  });

  const openForm = (item) => {
    setEditing(item);
    setForm(item ? { ...item } : { compliance_status: 'missing', verification_status: 'pending' });
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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44Client.integrations.Core.UploadFile({ file });
    update('file_url', file_url);
  };

  const filtered = items.filter(i => {
    const matchSearch = !search || 
      i.candidate_name?.toLowerCase().includes(search.toLowerCase()) ||
      i.item_type?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || i.compliance_status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Group stats
  const stats = {
    compliant: items.filter(i => i.compliance_status === 'compliant').length,
    expiring_soon: items.filter(i => i.compliance_status === 'expiring_soon').length,
    expired: items.filter(i => i.compliance_status === 'expired').length,
    missing: items.filter(i => i.compliance_status === 'missing').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Compliance Hub</h1>
          <p className="text-sm text-muted-foreground mt-1">Track licences, tickets, medicals and documents</p>
        </div>
        <Button onClick={() => openForm(null)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Item
        </Button>
      </div>

      {/* Traffic Light Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { key: 'compliant', label: 'Compliant', color: 'bg-emerald-500' },
          { key: 'expiring_soon', label: 'Expiring Soon', color: 'bg-amber-500' },
          { key: 'expired', label: 'Expired', color: 'bg-red-500' },
          { key: 'missing', label: 'Missing', color: 'bg-red-500' },
        ].map(s => (
          <div key={s.key} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${s.color}`} />
            <div>
              <p className="text-2xl font-bold">{stats[s.key]}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="compliant">Compliant</SelectItem>
            <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="missing">Missing</SelectItem>
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
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Candidate</th>
                <th className="text-left p-3 font-medium">Document Type</th>
                <th className="text-left p-3 font-medium">Expiry Date</th>
                <th className="text-left p-3 font-medium">Verification</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} onClick={() => openForm(item)} className="border-b hover:bg-muted/30 cursor-pointer transition-colors">
                  <td className="p-3"><TrafficLight status={item.compliance_status} size="md" /></td>
                  <td className="p-3 font-medium">{item.candidate_name || 'Unknown'}</td>
                  <td className="p-3">{item.item_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                  <td className="p-3">{item.expiry_date ? format(new Date(item.expiry_date), 'dd MMM yyyy') : '—'}</td>
                  <td className="p-3"><StatusBadge status={item.verification_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Compliance Item' : 'Add Compliance Item'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label>Candidate Name</Label>
              <Input value={form.candidate_name || ''} onChange={e => update('candidate_name', e.target.value)} />
            </div>
            <div>
              <Label>Document Type *</Label>
              <Select value={form.item_type || ''} onValueChange={v => update('item_type', v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {itemTypes.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Issue Date</Label>
                <Input type="date" value={form.issue_date || ''} onChange={e => update('issue_date', e.target.value)} />
              </div>
              <div>
                <Label>Expiry Date</Label>
                <Input type="date" value={form.expiry_date || ''} onChange={e => update('expiry_date', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Compliance Status</Label>
                <Select value={form.compliance_status || 'missing'} onValueChange={v => update('compliance_status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compliant">Compliant</SelectItem>
                    <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="missing">Missing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Verification</Label>
                <Select value={form.verification_status || 'pending'} onValueChange={v => update('verification_status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Upload Document</Label>
              <div className="mt-1">
                <label className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{form.file_url ? 'File uploaded' : 'Choose file...'}</span>
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>
            <div>
              <Label>Admin Notes</Label>
              <Textarea value={form.admin_notes || ''} onChange={e => update('admin_notes', e.target.value)} className="h-16" />
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