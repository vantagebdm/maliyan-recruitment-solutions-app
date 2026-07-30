import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Check, X, Building2 } from 'lucide-react';

const STATUS_OPTS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'prospect', label: 'Prospect' },
];

export default function CompanyDetailsCard({ client, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  const startEdit = () => { setForm({ ...client }); setEditing(true); };
  const cancel = () => setEditing(false);
  const save = () => { onUpdate(form); setEditing(false); };
  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const Field = ({ label, value }) => (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-medium">{value || '—'}</p>
    </div>
  );

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-sm">Company Details</h3>
        </div>
        {!editing ? (
          <Button variant="ghost" size="sm" onClick={startEdit} className="gap-1 text-xs">
            <Pencil className="w-3 h-3" /> Edit
          </Button>
        ) : (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={cancel}><X className="w-3 h-3" /></Button>
            <Button variant="ghost" size="sm" onClick={save}><Check className="w-3 h-3" /></Button>
          </div>
        )}
      </div>

      {!editing ? (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Legal Company Name" value={client.company_name} />
          <Field label="Trading Name" value={client.trading_name} />
          <Field label="ABN" value={client.abn} />
          <Field label="Industry" value={client.industry} />
          <Field label="Website" value={client.website} />
          <Field label="Account Manager" value={client.account_manager} />
          <Field label="General Phone" value={client.primary_contact_phone} />
          <Field label="General Email" value={client.primary_contact_email} />
          <Field label="Billing Address" value={client.billing_address} />
          <Field label="Site Address" value={client.site_address} />
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Client Status</p>
            <p className="text-sm font-medium capitalize">{client.status || '—'}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label className="text-xs">Legal Company Name</Label><Input value={form.company_name || ''} onChange={e => update('company_name', e.target.value)} /></div>
          <div><Label className="text-xs">Trading Name</Label><Input value={form.trading_name || ''} onChange={e => update('trading_name', e.target.value)} /></div>
          <div><Label className="text-xs">ABN</Label><Input value={form.abn || ''} onChange={e => update('abn', e.target.value)} /></div>
          <div><Label className="text-xs">Industry</Label><Input value={form.industry || ''} onChange={e => update('industry', e.target.value)} /></div>
          <div><Label className="text-xs">Website</Label><Input value={form.website || ''} onChange={e => update('website', e.target.value)} /></div>
          <div><Label className="text-xs">Account Manager</Label><Input value={form.account_manager || ''} onChange={e => update('account_manager', e.target.value)} /></div>
          <div><Label className="text-xs">General Phone</Label><Input value={form.primary_contact_phone || ''} onChange={e => update('primary_contact_phone', e.target.value)} /></div>
          <div><Label className="text-xs">General Email</Label><Input value={form.primary_contact_email || ''} onChange={e => update('primary_contact_email', e.target.value)} /></div>
          <div className="col-span-2"><Label className="text-xs">Billing Address</Label><Input value={form.billing_address || ''} onChange={e => update('billing_address', e.target.value)} /></div>
          <div className="col-span-2"><Label className="text-xs">Site Address</Label><Input value={form.site_address || ''} onChange={e => update('site_address', e.target.value)} /></div>
          <div className="col-span-2"><Label className="text-xs">Client Status</Label>
            <Select value={form.status || 'active'} onValueChange={v => update('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUS_OPTS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}