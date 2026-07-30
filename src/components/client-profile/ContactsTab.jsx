import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, MapPin, Plus, Trash2 } from 'lucide-react';

export default function ContactsTab({ client }) {
  const [newSite, setNewSite] = useState('');
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Client.update(client.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client', client.id] }),
  });

  const addSite = () => {
    if (!newSite.trim()) return;
    updateMutation.mutate({ site_locations: [...(client.site_locations || []), newSite.trim()] });
    setNewSite('');
  };

  const removeSite = (idx) => {
    const next = (client.site_locations || []).filter((_, i) => i !== idx);
    updateMutation.mutate({ site_locations: next });
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-3">Primary Contact</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Name:</span>
            <span className="font-medium">{client.primary_contact_name || '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Email:</span>
            {client.primary_contact_email ? (
              <a href={`mailto:${client.primary_contact_email}`} className="font-medium text-primary hover:underline">{client.primary_contact_email}</a>
            ) : <span className="font-medium">—</span>}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Phone:</span>
            <span className="font-medium">{client.primary_contact_phone || '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Address:</span>
            <span className="font-medium">{client.billing_address || '—'}</span>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-3">Site Locations / Contacts</h3>
        <ul className="space-y-1.5 mb-3">
          {(client.site_locations || []).length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No site locations recorded.</p>
          ) : (
            client.site_locations.map((s, idx) => (
              <li key={idx} className="flex items-center justify-between gap-2 text-sm py-1.5 border-b border-border last:border-0">
                <span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-muted-foreground" /> {s}</span>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeSite(idx)} disabled={updateMutation.isPending}>
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </Button>
              </li>
            ))
          )}
        </ul>
        <div className="flex gap-2">
          <Input value={newSite} onChange={e => setNewSite(e.target.value)} placeholder="Add a site location" onKeyDown={e => e.key === 'Enter' && addSite()} />
          <Button size="sm" onClick={addSite} disabled={updateMutation.isPending || !newSite.trim()} className="gap-1.5">
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
}