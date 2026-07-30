import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ClientSection from '@/components/client-profile/ClientSection';
import { Mail, Phone, Plus, Trash2, Pencil, Star, Users } from 'lucide-react';

const ROLES = ['primary', 'accounts', 'recruitment', 'timesheet', 'site', 'other'];
const emptyContact = { name: '', email: '', phone: '', role: 'site' };

export default function ClientContactsSection({ client }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);
  const [form, setForm] = useState(emptyContact);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Client.update(client.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client', client.id] }),
  });

  const openAdd = () => { setEditingIdx(null); setForm(emptyContact); setShowForm(true); };
  const openEdit = (idx) => { setEditingIdx(idx); setForm(client.contacts[idx] || emptyContact); setShowForm(true); };

  const handleSave = (e) => {
    e.preventDefault();
    const contacts = [...(client.contacts || [])];
    if (editingIdx !== null) contacts[editingIdx] = form;
    else contacts.push(form);
    updateMutation.mutate({ contacts });
    setShowForm(false);
  };

  const removeContact = (idx) => {
    const contacts = (client.contacts || []).filter((_, i) => i !== idx);
    updateMutation.mutate({ contacts });
  };

  const contacts = client.contacts || [];

  return (
    <ClientSection
      icon={Users}
      title="Client Contacts"
      action={<Button size="sm" onClick={openAdd} className="gap-1.5"><Plus className="w-4 h-4" /> Add Contact</Button>}
    >
      {contacts.length === 0 ? (
        <p className="text-sm text-muted-foreground italic text-center py-4">No contacts recorded. Add contacts and nominate primary, accounts, recruitment, timesheet and site contacts.</p>
      ) : (
        <div className="space-y-2">
          {contacts.map((c, idx) => (
            <div key={idx} className="flex items-start justify-between gap-3 py-2.5 border-b border-border last:border-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{c.name || '—'}</span>
                  <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">{c.role || 'other'}</span>
                  {c.role === 'primary' && <Star className="w-3.5 h-3.5 text-amber-500" />}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                  {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-1 hover:text-primary"><Mail className="w-3 h-3" />{c.email}</a>}
                  {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(idx)}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeContact(idx)} disabled={updateMutation.isPending}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingIdx !== null ? 'Edit Contact' : 'Add Contact'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-3">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div>
              <Label>Role</Label>
              <Select value={form.role} onValueChange={v => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => <SelectItem key={r} value={r}>{r.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={updateMutation.isPending}>{editingIdx !== null ? 'Update' : 'Add'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </ClientSection>
  );
}