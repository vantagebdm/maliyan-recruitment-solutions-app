import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Upload, Download, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';

const DOC_TYPES = [
  'Resume', 'Passport', 'Birth Certificate', 'Driver\'s Licence', 'Trade Certificate', 'White Card',
  'High Risk Licence', 'Medical Certificate', 'Police Clearance', 'Tax File Declaration',
  'Superannuation Form', 'Bank Details', 'Employment Contract', 'Induction Certificate', 'Other'
];

export default function DocumentationSection({ candidate, onAddDocument, onDeleteDocument }) {
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ type: '', file_name: '', file_url: '', uploaded_date: '', expiry_date: '' });

  const documents = candidate.documents || [];

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(p => ({ ...p, file_url, file_name: file.name, uploaded_date: new Date().toISOString().split('T')[0] }));
    setUploading(false);
  };

  const handleAdd = async () => {
    if (!form.file_url) return;
    await onAddDocument(form);
    setForm({ type: '', file_name: '', file_url: '', uploaded_date: '', expiry_date: '' });
    setShowForm(false);
  };

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-sm">Documentation</h3>
          {documents.length > 0 && <span className="text-xs text-muted-foreground">({documents.length})</span>}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowForm(!showForm)} className="gap-1 text-xs">
          <Plus className="w-3 h-3" /> Upload Document
        </Button>
      </div>

      {showForm && (
        <div className="mb-4 p-4 rounded-lg bg-muted/30 border border-border space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Document Type</Label>
              <Select value={form.type} onValueChange={v => update('type', v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Expiry Date (optional)</Label>
              <Input type="date" value={form.expiry_date} onChange={e => update('expiry_date', e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-xs">File</Label>
            <label className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <Upload className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{uploading ? 'Uploading...' : form.file_name || 'Choose file...'}</span>
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAdd} disabled={!form.file_url}>Save</Button>
          </div>
        </div>
      )}

      {documents.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No documents uploaded.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left p-2 font-medium">Type</th>
                <th className="text-left p-2 font-medium">File Name</th>
                <th className="text-left p-2 font-medium">Uploaded</th>
                <th className="text-left p-2 font-medium">Expiry</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d, idx) => (
                <tr key={idx} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="p-2 font-medium">{d.type || '—'}</td>
                  <td className="p-2">
                    <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                      <FileText className="w-3 h-3" /> {d.file_name || 'View'}
                    </a>
                  </td>
                  <td className="p-2">{d.uploaded_date ? format(new Date(d.uploaded_date), 'dd MMM yyyy') : '—'}</td>
                  <td className="p-2">{d.expiry_date ? format(new Date(d.expiry_date), 'dd MMM yyyy') : '—'}</td>
                  <td className="p-2">
                    <div className="flex items-center gap-1">
                      <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                        <Download className="w-3 h-3" />
                      </a>
                      <button onClick={() => onDeleteDocument(idx)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}