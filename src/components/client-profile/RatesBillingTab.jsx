import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ClientSection from '@/components/client-profile/ClientSection';
import { CreditCard, DollarSign, TrendingUp, Pencil, Receipt } from 'lucide-react';

function RateRow({ label, value, hint }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}{hint && <span className="text-xs text-muted-foreground ml-1">{hint}</span>}</span>
    </div>
  );
}

export default function RatesBillingTab({ client, jobs, placements }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    setForm({
      payment_terms: client.payment_terms || '',
      billing_address: client.billing_address || '',
      approved_rates: client.approved_rates || '',
      invoicing_requirements: client.invoicing_requirements || '',
    });
  }, [client.id, client.payment_terms, client.billing_address, client.approved_rates, client.invoicing_requirements]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Client.update(client.id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['client', client.id] }); setShowForm(false); },
  });

  const onSave = (e) => { e.preventDefault(); updateMutation.mutate(form); };

  // Rate summary derived from linked placements AND job orders
  const pCharge = placements.map(p => p.charge_rate).filter(Boolean);
  const pPay = placements.map(p => p.pay_rate).filter(Boolean);
  const jCharge = jobs.map(j => j.charge_rate).filter(Boolean);
  const jPay = jobs.map(j => j.pay_rate).filter(Boolean);
  const allCharge = [...pCharge, ...jCharge];
  const allPay = [...pPay, ...jPay];
  const maxCharge = allCharge.length ? Math.max(...allCharge) : null;
  const avgCharge = allCharge.length ? (allCharge.reduce((a, b) => a + b, 0) / allCharge.length).toFixed(2) : null;
  const avgPay = allPay.length ? (allPay.reduce((a, b) => a + b, 0) / allPay.length).toFixed(2) : null;
  const minPay = allPay.length ? Math.min(...allPay) : null;
  const maxMargin = (maxCharge != null && minPay != null) ? (maxCharge - minPay).toFixed(2) : null;
  const activePlacements = placements.filter(p => p.status === 'active').length;
  const openJobs = jobs.filter(j => j.status === 'open').length;

  return (
    <ClientSection
      icon={Receipt}
      title="Rates & Billing"
      action={<Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5"><Pencil className="w-4 h-4" /> Edit Billing</Button>}
    >
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border p-4">
          <h4 className="font-semibold text-sm flex items-center gap-2 mb-3"><CreditCard className="w-4 h-4 text-primary" />Billing Configuration</h4>
          <RateRow label="ABN" value={client.abn || '—'} />
          <RateRow label="Payment Terms" value={client.payment_terms || '—'} />
          <RateRow label="Billing Address" value={client.billing_address || '—'} />
          <RateRow label="Invoicing Requirements" value={client.invoicing_requirements || '—'} />
          <div className="mt-3 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">Approved Rates</span>
            <p className="text-sm font-medium mt-1 whitespace-pre-wrap">{client.approved_rates || 'No approved rates documented.'}</p>
          </div>
        </div>
        <div className="rounded-lg border border-border p-4">
          <h4 className="font-semibold text-sm flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-primary" />Rate Summary</h4>
          <RateRow label="Highest Charge Rate" value={maxCharge != null ? `$${maxCharge}/hr` : '—'} />
          <RateRow label="Average Charge Rate" value={avgCharge != null ? `$${avgCharge}/hr` : '—'} />
          <RateRow label="Average Pay Rate" value={avgPay != null ? `$${avgPay}/hr` : '—'} />
          <RateRow label="Lowest Pay Rate" value={minPay != null ? `$${minPay}/hr` : '—'} />
          <RateRow label="Max Margin" value={maxMargin != null ? `$${maxMargin}/hr` : '—'} />
          <RateRow label="Active Placements" value={activePlacements} />
          <RateRow label="Open Job Orders" value={openJobs} hint={`of ${jobs.length}`} />
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><DollarSign className="w-3.5 h-3.5" />Derived from linked placements & job orders.</div>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Billing</DialogTitle></DialogHeader>
          <form onSubmit={onSave} className="space-y-3">
            <div><Label>Payment Terms</Label><Input value={form.payment_terms || ''} onChange={e => setForm({ ...form, payment_terms: e.target.value })} placeholder="e.g. Net 14" /></div>
            <div><Label>Billing Address</Label><Textarea value={form.billing_address || ''} onChange={e => setForm({ ...form, billing_address: e.target.value })} className="h-16" /></div>
            <div><Label>Invoicing Requirements</Label><Textarea value={form.invoicing_requirements || ''} onChange={e => setForm({ ...form, invoicing_requirements: e.target.value })} className="h-16" placeholder="PO numbers, split invoicing, etc." /></div>
            <div><Label>Approved Rates</Label><Textarea value={form.approved_rates || ''} onChange={e => setForm({ ...form, approved_rates: e.target.value })} className="h-20" /></div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={updateMutation.isPending}>Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </ClientSection>
  );
}