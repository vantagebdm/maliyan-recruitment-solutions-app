import React from 'react';
import { CreditCard, FileText, DollarSign, TrendingUp } from 'lucide-react';

function RateRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || '—'}</span>
    </div>
  );
}

export default function RatesBillingTab({ client, jobs, placements }) {
  const chargeRates = placements.map(p => p.charge_rate).filter(Boolean);
  const payRates = placements.map(p => p.pay_rate).filter(Boolean);
  const maxCharge = chargeRates.length ? Math.max(...chargeRates) : null;
  const avgPay = payRates.length ? (payRates.reduce((a, b) => a + b, 0) / payRates.length).toFixed(2) : null;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" /> Billing Configuration</h3>
        <RateRow icon={FileText} label="ABN" value={client.abn} />
        <RateRow label="Payment Terms" value={client.payment_terms} />
        <RateRow label="Billing Address" value={client.billing_address} />
        <div className="mt-3 pt-3 border-t border-border">
          <span className="text-sm text-muted-foreground">Approved Rates</span>
          <p className="text-sm font-medium mt-1 whitespace-pre-wrap">{client.approved_rates || 'No approved rates documented.'}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Rate Summary</h3>
        <RateRow label="Highest Charge Rate" value={maxCharge != null ? `$${maxCharge}/hr` : null} />
        <RateRow label="Average Pay Rate" value={avgPay != null ? `$${avgPay}/hr` : null} />
        <RateRow label="Active Placements" value={placements.filter(p => p.status === 'active').length} />
        <RateRow label="Open Job Orders" value={jobs.filter(j => j.status === 'open').length} />
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <DollarSign className="w-3.5 h-3.5" />
          Rates are derived from linked placements and job orders.
        </div>
      </div>
    </div>
  );
}