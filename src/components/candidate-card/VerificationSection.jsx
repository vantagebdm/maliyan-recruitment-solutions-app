import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldCheck, Plus, Trash2, CheckCircle2, Clock, XCircle, MinusCircle } from 'lucide-react';
import { format } from 'date-fns';

const VERIFICATION_ITEMS = [
  'Working Rights', 'LOO Signed', 'Contract', 'PID Signed',
  "Driver's Licence", 'LF Licence', 'HR Licence', 'Forklift Ticket',
  'Working at Heights', 'Confined Space', 'White Card', 'First Aid',
  'Trade Certificate', 'High Risk Licence', 'Police Clearance', 'Medical',
];

const STATUS_CONFIG = {
  verified: { label: 'Verified', icon: CheckCircle2, cls: 'text-emerald-600' },
  pending: { label: 'Pending', icon: Clock, cls: 'text-amber-600' },
  expired: { label: 'Expired', icon: XCircle, cls: 'text-red-600' },
  not_required: { label: 'N/A', icon: MinusCircle, cls: 'text-muted-foreground' },
};

export default function VerificationSection({ candidate, onAddVerification, onDeleteVerification }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ item: '', reference_number: '', expiry_date: '', date_verified: '', verified_by: '', status: 'pending' });

  const verifications = candidate.verifications || [];

  const handleAdd = async () => {
    if (!form.item) return;
    await onAddVerification(form);
    setForm({ item: '', reference_number: '', expiry_date: '', date_verified: '', verified_by: '', status: 'pending' });
    setShowForm(false);
  };

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-sm">Verification</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowForm(!showForm)} className="gap-1 text-xs">
          <Plus className="w-3 h-3" /> Add Verification
        </Button>
      </div>

      {showForm && (
        <div className="mb-4 p-4 rounded-lg bg-muted/30 border border-border space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Item</Label>
              <Select value={form.item} onValueChange={v => update('item', v)}>
                <SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger>
                <SelectContent>
                  {VERIFICATION_ITEMS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Reference Number</Label>
              <Input value={form.reference_number} onChange={e => update('reference_number', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Expiry Date</Label>
              <Input type="date" value={form.expiry_date} onChange={e => update('expiry_date', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Date Verified</Label>
              <Input type="date" value={form.date_verified} onChange={e => update('date_verified', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Verified By</Label>
              <Input value={form.verified_by} onChange={e => update('verified_by', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={v => update('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="not_required">Not Required</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAdd}>Save</Button>
          </div>
        </div>
      )}

      {verifications.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No verifications recorded.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left p-2 font-medium">Item</th>
                <th className="text-left p-2 font-medium">Ref Number</th>
                <th className="text-left p-2 font-medium">Expiry</th>
                <th className="text-left p-2 font-medium">Verified</th>
                <th className="text-left p-2 font-medium">By</th>
                <th className="text-left p-2 font-medium">Status</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {verifications.map((v, idx) => {
                const st = STATUS_CONFIG[v.status] || STATUS_CONFIG.pending;
                return (
                  <tr key={idx} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="p-2 font-medium">{v.item}</td>
                    <td className="p-2">{v.reference_number || '—'}</td>
                    <td className="p-2">{v.expiry_date ? format(new Date(v.expiry_date), 'dd MMM yyyy') : '—'}</td>
                    <td className="p-2">{v.date_verified ? format(new Date(v.date_verified), 'dd MMM yyyy') : '—'}</td>
                    <td className="p-2">{v.verified_by || '—'}</td>
                    <td className="p-2">
                      <span className={`inline-flex items-center gap-1 font-medium ${st.cls}`}>
                        <st.icon className="w-3 h-3" /> {st.label}
                      </span>
                    </td>
                    <td className="p-2">
                      <button onClick={() => onDeleteVerification(idx)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}