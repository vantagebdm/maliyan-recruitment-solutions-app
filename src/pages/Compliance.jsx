import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
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

const DAYS_SOON = 30;

function computeComplianceStatus(expiryDate, verificationStatus, isDocument = false) {
  if (verificationStatus === 'expired') return 'expired';
  if (expiryDate) {
    const days = (new Date(expiryDate) - new Date()) / 86400000;
    if (days < 0) return 'expired';
    if (days < DAYS_SOON) return 'expiring_soon';
    return 'compliant';
  }
  if (isDocument) return 'compliant';
  return verificationStatus === 'verified' ? 'compliant' : 'missing';
}

function prettyType(type) {
  return (type || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function buildDerivedItems(candidates = []) {
  const items = [];
  candidates.forEach(c => {
    const name = `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.email || 'Unknown';
    const verifByKey = {};
    (c.verifications || []).forEach(v => {
      const key = (v.item || '').toLowerCase().trim();
      if (key) verifByKey[key] = v;
    });

    (c.verifications || []).forEach(v => {
      const vStatus = v.status === 'verified' ? 'verified' : v.status === 'expired' ? 'rejected' : 'pending';
      items.push({
        id: `${c.id}-ver-${v.item}-${v.reference_number || ''}`,
        candidate_id: c.id,
        candidate_name: name,
        item_type: v.item,
        reference_number: v.reference_number,
        expiry_date: v.expiry_date,
        verified_date: v.date_verified,
        verified_by: v.verified_by,
        verification_status: vStatus,
        compliance_status: v.status === 'not_required' ? 'compliant' : computeComplianceStatus(v.expiry_date, v.status),
        source: 'verification',
      });
    });

    (c.documents || []).forEach(d => {
      const key = (d.type || '').toLowerCase().trim();
      if (key && verifByKey[key]) return;
      const vStatus = 'pending';
      items.push({
        id: `${c.id}-doc-${d.type}-${d.file_name}`,
        candidate_id: c.id,
        candidate_name: name,
        item_type: d.type,
        document_name: d.file_name,
        file_url: d.file_url,
        expiry_date: d.expiry_date,
        uploaded_date: d.uploaded_date,
        verification_status: vStatus,
        compliance_status: computeComplianceStatus(d.expiry_date, vStatus, true),
        source: 'document',
      });
    });
  });
  return items;
}

export default function Compliance() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const queryClient = useQueryClient();

  const { data: complianceItems = [], isLoading: loadingItems } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => base44.entities.ComplianceItem.list('-created_date'),
    initialData: [],
  });

  const { data: candidates = [], isLoading: loadingCandidates } = useQuery({
    queryKey: ['candidates-compliance'],
    queryFn: () => base44.entities.Candidate.list('-created_date', 500),
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

  const derivedItems = useMemo(() => buildDerivedItems(candidates), [candidates]);

  const allItems = useMemo(() => [
    ...derivedItems,
    ...complianceItems.map(i => ({ ...i, source: 'item' })),
  ], [derivedItems, complianceItems]);

  const filtered = allItems.filter(i => {
    const matchSearch = !search ||
      i.candidate_name?.toLowerCase().includes(search.toLowerCase()) ||
      i.item_type?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || i.compliance_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    compliant: allItems.filter(i => i.compliance_status === 'compliant').length,
    expiring_soon: allItems.filter(i => i.compliance_status === 'expiring_soon').length,
    expired: allItems.filter(i => i.compliance_status === 'expired').length,
    missing: allItems.filter(i => i.compliance_status === 'missing').length,
  };

  const isLoading = loadingItems || loadingCandidates;

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
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} items</span>
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
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground text-sm">No compliance items found.</td></tr>
              ) : filtered.map(item => (
                <tr
                  key={item.id}
                  onClick={() => item.source === 'item' ? openForm(item) : item.candidate_id && (window.location.hash = `#/candidates/${item.candidate_id}`)}
                  className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <td className="p-3"><TrafficLight status={item.compliance_status} size="md" /></td>
                  <td className="p-3 font-medium">
                    {item.candidate_id ? (
                      <Link to={`/candidates/${item.candidate_id}`} onClick={e => e.stopPropagation()} className="hover:underline text-primary">
                        {item.candidate_name || 'Unknown'}
                      </Link>
                    ) : (item.candidate_name || 'Unknown')}
                  </td>
                  <td className="p-3">{prettyType(item.item_type)}</td>
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
                  {itemTypes.map(t => <SelectItem key={t} value={t}>{prettyType(t)}</SelectItem>)}
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