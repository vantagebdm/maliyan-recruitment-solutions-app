import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, StickyNote } from 'lucide-react';

export default function ActivityNotesTab({ client }) {
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    setNotes(client.notes || '');
  }, [client.id, client.notes]);

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.Client.update(client.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client', client.id] }),
  });

  const handleSave = () => saveMutation.mutate({ notes });

  const dirty = notes !== (client.notes || '');

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-semibold mb-3 flex items-center gap-2"><StickyNote className="w-4 h-4 text-primary" /> Account Notes</h3>
      <Label className="text-xs text-muted-foreground">Record interactions, agreements, and reminders for this client.</Label>
      <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="h-48 mt-2" placeholder="Add notes about this client account..." />
      <div className="flex justify-end mt-3">
        <Button onClick={handleSave} disabled={!dirty || saveMutation.isPending} className="gap-1.5">
          <Save className="w-4 h-4" /> {saveMutation.isPending ? 'Saving...' : 'Save Notes'}
        </Button>
      </div>
    </div>
  );
}