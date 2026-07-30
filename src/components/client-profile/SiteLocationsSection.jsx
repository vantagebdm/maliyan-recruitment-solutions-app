import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ClientSection from '@/components/client-profile/ClientSection';
import { MapPin, Plus, Trash2 } from 'lucide-react';

export default function SiteLocationsSection({ client }) {
  const queryClient = useQueryClient();
  const [newSite, setNewSite] = useState('');

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
    updateMutation.mutate({ site_locations: (client.site_locations || []).filter((_, i) => i !== idx) });
  };

  const sites = client.site_locations || [];

  return (
    <ClientSection icon={MapPin} title="Site Locations">
      {sites.length === 0 ? (
        <p className="text-sm text-muted-foreground italic text-center py-4 mb-3">No site locations recorded.</p>
      ) : (
        <ul className="space-y-1.5 mb-3">
          {sites.map((s, idx) => (
            <li key={idx} className="flex items-center justify-between gap-2 text-sm py-1.5 border-b border-border last:border-0">
              <span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-muted-foreground" /> {s}</span>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeSite(idx)} disabled={updateMutation.isPending}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Input value={newSite} onChange={e => setNewSite(e.target.value)} placeholder="Add a site location" onKeyDown={e => e.key === 'Enter' && addSite()} />
        <Button size="sm" onClick={addSite} disabled={updateMutation.isPending || !newSite.trim()} className="gap-1.5"><Plus className="w-4 h-4" /> Add</Button>
      </div>
    </ClientSection>
  );
}