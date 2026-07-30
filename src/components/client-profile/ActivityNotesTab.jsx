import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, StickyNote, Plus, Phone, Mail, RefreshCw, MessageSquare, Calendar, Trash2, History } from 'lucide-react';
import { format } from 'date-fns';

const TYPES = [
  { value: 'call', label: 'Call', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'change', label: 'Change', icon: RefreshCw },
  { value: 'note', label: 'Note', icon: MessageSquare },
  { value: 'meeting', label: 'Meeting', icon: Calendar },
];

const typeIcon = (t) => TYPES.find(x => x.value === t)?.icon || MessageSquare;

export default function ActivityNotesTab({ client }) {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState('');
  const [showActivity, setShowActivity] = useState(false);
  const [actForm, setActForm] = useState({ type: 'call', description: '', by: '' });

  useEffect(() => { setNotes(client.notes || ''); }, [client.id, client.notes]);

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.Client.update(client.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client', client.id] }),
  });

  const handleSaveNotes = () => saveMutation.mutate({ notes });

  const addActivity = (e) => {
    e.preventDefault();
    const activities = [{
      type: actForm.type,
      description: actForm.description,
      by: actForm.by,
      date: new Date().toISOString(),
    }, ...(client.client_activities || [])];
    saveMutation.mutate({ client_activities: activities });
    setShowActivity(false);
    setActForm({ type: 'call', description: '', by: '' });
  };

  const removeActivity = (idx) => {
    const activities = (client.client_activities || []).filter((_, i) => i !== idx);
    saveMutation.mutate({ client_activities: activities });
  };

  const activities = client.client_activities || [];
  const dirty = notes !== (client.notes || '');

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2"><History className="w-4 h-4 text-primary" /> Activity Log</h3>
          <Button size="sm" onClick={() => setShowActivity(true)} className="gap-1.5"><Plus className="w-4 h-4" /> Add Activity</Button>
        </div>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No activity recorded. Log calls, emails, changes and general notes.</p>
        ) : (
          <ul className="space-y-2">
            {activities.map((a, idx) => {
              const Icon = typeIcon(a.type);
              return (
                <li key={idx} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{a.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="uppercase font-medium">{a.type}</span>
                      {a.by && <span>· {a.by}</span>}
                      {a.date && <span>· {format(new Date(a.date), 'dd MMM yyyy, HH:mm')}</span>}
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="h-6 w-6 flex-shrink-0" onClick={() => removeActivity(idx)} disabled={saveMutation.isPending}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><StickyNote className="w-4 h-4 text-primary" /> Account Notes</h3>
        <Label className="text-xs text-muted-foreground">Record interactions, agreements, and reminders for this client.</Label>
        <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="h-40 mt-2" placeholder="Add notes about this client account..." />
        <div className="flex justify-end mt-3">
          <Button onClick={handleSaveNotes} disabled={!dirty || saveMutation.isPending} className="gap-1.5"><Save className="w-4 h-4" /> {saveMutation.isPending ? 'Saving...' : 'Save Notes'}</Button>
        </div>
      </div>

      <Dialog open={showActivity} onOpenChange={setShowActivity}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Activity</DialogTitle></DialogHeader>
          <form onSubmit={addActivity} className="space-y-3">
            <div>
              <Label>Type</Label>
              <Select value={actForm.type} onValueChange={v => setActForm({ ...actForm, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Description *</Label><Textarea value={actForm.description} onChange={e => setActForm({ ...actForm, description: e.target.value })} className="h-24" required /></div>
            <div><Label>Recorded By</Label><Input value={actForm.by} onChange={e => setActForm({ ...actForm, by: e.target.value })} placeholder="Name" /></div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowActivity(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMutation.isPending || !actForm.description}>Add</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}