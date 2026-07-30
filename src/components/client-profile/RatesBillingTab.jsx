import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreditCard, DollarSign, TrendingUp, Pencil } from 'lucide-react';

function RateRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value || '—'}</span>
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

  const chargeRates = placements.map(p => p.charge_rate).filter(Boolean);
  const payRates = placements.map(p => p.pay_rate).filter(Boolean);
  const maxCharge = chargeRates.length ? Math.max(...chargeRates) : null;
  const avgPay = payRates.length ? (payRates.reduce((a, b) => a + b, 0) / payRates.length).toFixed(2) : null;
  const margin = (maxCharge != null && avgPay != null) ? (maxCharge - Number(avgPay)).toFixed(2) : null;

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5"><Pencil className="w-4 h-4" /> Edit Billing</Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" /> Billing Configuration</h3>
          <RateRow label="ABN" value={client.abn} />
          <RateRow label="Payment Terms" value={client.payment_terms} />
          <RateRow label="Billing Address" value={client.billing_address} />
          <RateRow label="Invoicing Requirements" value={client.invoicing_requirements} />
          <div className="mt-3 pt-3 border-t border-border">
            <span className="text-sm text-muted-foreground">Approved Rates</span>
            <p className="text-sm font-medium mt-1 whitespace-pre-wrap">{client.approved_rates || 'No approved rates documented.'}</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Rate Summary</h3>
          <RateRow label="Highest Charge Rate" value={maxCharge != null ? `$${maxCharge}/hr` : null} />
          <RateRow label="Average Pay Rate" value={avgPay != null ? `$${avgPay}/hr` : null} />
          <RateRow label="Max Margin" value={margin != null ? `$${margin}/hr` : null} />
          <RateRow label="Active Placements" value={placements.filter(p => p.status === 'active').length} />
          <RateRow label="Open Job Orders" value={jobs.filter(j => j.status === 'open').length} />
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><DollarSign className="w-3.5 h-3.5" /> Rates derived from linked placements and job orders.</div>
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
    </div>
  );
}