import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ClientSection from '@/components/client-profile/ClientSection';
import { Plus, Trash2, Upload, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';

const DOC_TYPES = ['Client Agreement', 'Public Liability Insurance', 'Professional Indemnity Insurance', 'WHS Policy', 'Safe Work Method Statement', 'Site Induction', 'Other'];

export default function ClientDocumentsSection({ client }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'Client Agreement', expiry_date: '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Client.update(client.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client', client.id] }),
  });

  const removeDoc = (idx) => {
    const docs = (client.client_documents || []).filter((_, i) => i !== idx);
    updateMutation.mutate({ client_documents: docs });
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const docs = [...(client.client_documents || []), {
        type: form.type,
        document_name: file.name,
        file_url,
        uploaded_date: new Date().toISOString().slice(0, 10),
        expiry_date: form.expiry_date || '',
      }];
      await base44.entities.Client.update(client.id, { client_documents: docs });
      queryClient.invalidateQueries({ queryKey: ['client', client.id] });
      setShowForm(false);
      setForm({ type: 'Client Agreement', expiry_date: '' });
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const docs = client.client_documents || [];
  const isExpired = (d) => d && new Date(d) < new Date(new Date().toDateString());
  const isExpiringSoon = (d) => d && !isExpired(d) && (new Date(d) - new Date(new Date().toDateString()) < 1000 * 60 * 60 * 24 * 30);

  return (
    <ClientSection
      icon={FileText}
      title="Client Documents"
      action={<Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5"><Plus className="w-4 h-4" /> Upload Document</Button>}
    >
      {docs.length === 0 ? (
        <p className="text-sm text-muted-foreground italic text-center py-6">No client documents recorded. Upload client agreements, insurance and WHS documents with expiry dates.</p>
      ) : (
        <div className="space-y-2">
          {docs.map((d, idx) => {
            const expired = isExpired(d.expiry_date);
            const expiring = isExpiringSoon(d.expiry_date);
            return (
              <div key={idx} className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{d.type || 'Document'}</span>
                    {d.expiry_date && (expired ? <span className="text-[11px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-semibold">Expired</span> : expiring ? <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-semibold">Expiring Soon</span> : <span className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold">Valid</span>)}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                    <a href={d.file_url} target="_blank" rel="noreferrer" className="hover:text-primary truncate max-w-[220px]">{d.document_name || 'View file'}</a>
                    {d.expiry_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Expires {format(new Date(d.expiry_date), 'dd MMM yyyy')}</span>}
                    {d.uploaded_date && <span>Added {format(new Date(d.uploaded_date), 'dd MMM yyyy')}</span>}
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7 flex-shrink-0" onClick={() => removeDoc(idx)} disabled={updateMutation.isPending}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Upload Client Document</DialogTitle></DialogHeader>
          <form onSubmit={onSave} className="space-y-3">
            <div>
              <Label>Document Type</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DOC_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>File *</Label><Input type="file" onChange={e => setFile(e.target.files?.[0] || null)} required /></div>
            <div><Label>Expiry Date</Label><Input type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} /></div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={uploading}>Cancel</Button>
              <Button type="submit" disabled={uploading || !file} className="gap-1.5"><Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </ClientSection>
  );
}