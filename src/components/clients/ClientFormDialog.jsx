import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ClientFormDialog({ client, open, onOpenChange, onSaved }) {
  const [editing, setEditing] = useState(!!client);
  const [form, setForm] = useState({});
  const queryClient = useQueryClient();

  useEffect(() => {
    setEditing(!!client);
    setForm(client ? { ...client } : { status: 'active' });
  }, [client, open]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Client.create(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onSaved?.(created);
      onOpenChange(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Client.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', updated.id] });
      onSaved?.(updated);
      onOpenChange(false);
    },
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate({ id: client.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Client' : 'Add Client'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label>Company Name *</Label>
            <Input value={form.company_name || ''} onChange={e => update('company_name', e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>ABN</Label>
              <Input value={form.abn || ''} onChange={e => update('abn', e.target.value)} />
            </div>
            <div>
              <Label>Industry</Label>
              <Input value={form.industry || ''} onChange={e => update('industry', e.target.value)} />
            </div>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Website</Label>
              <Input value={form.website || ''} onChange={e => update('website', e.target.value)} placeholder="https://" />
            </div>
            <div>
              <Label>Account Manager</Label>
              <Input value={form.account_manager || ''} onChange={e => update('account_manager', e.target.value)} placeholder="Internal owner" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Payment Terms</Label>
              <Input value={form.payment_terms || ''} onChange={e => update('payment_terms', e.target.value)} placeholder="e.g. Net 14" />
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
          </div>
          <div>
            <Label>Approved Rates</Label>
            <Textarea value={form.approved_rates || ''} onChange={e => update('approved_rates', e.target.value)} className="h-16" placeholder="Flat or hourly rates agreed with client" />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={form.notes || ''} onChange={e => update('notes', e.target.value)} className="h-16" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {editing ? 'Update' : 'Add Client'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}