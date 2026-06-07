import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Plus, Lightbulb, Bug, MessageSquare, HelpCircle, RefreshCw,
  Paperclip, Link2, X, Upload, FileText, Image, ThumbsUp, ChevronDown
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { value: 'idea', label: 'New Idea', icon: Lightbulb, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'change_request', label: 'Change Request', icon: RefreshCw, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'bug_report', label: 'Bug Report', icon: Bug, color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'feedback', label: 'Feedback', icon: MessageSquare, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'question', label: 'Question', icon: HelpCircle, color: 'bg-teal-100 text-teal-700 border-teal-200' },
];

const STATUSES = [
  { value: 'open', label: 'Open', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { value: 'under_review', label: 'Under Review', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'planned', label: 'Planned', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'completed', label: 'Completed', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'declined', label: 'Declined', color: 'bg-red-100 text-red-700 border-red-200' },
];

function CategoryBadge({ category }) {
  const cat = CATEGORIES.find(c => c.value === category);
  if (!cat) return null;
  const Icon = cat.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border', cat.color)}>
      <Icon className="w-3 h-3" />{cat.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const s = STATUSES.find(x => x.value === status);
  if (!s) return null;
  return (
    <span className={cn('inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border', s.color)}>
      {s.label}
    </span>
  );
}

export default function Brainstorm() {
  const [showForm, setShowForm] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ title: '', category: 'idea', description: '', links: [], file_urls: [], file_names: [] });
  const [linkInput, setLinkInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();
  const queryClient = useQueryClient();

  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ['ideas'],
    queryFn: () => base44.entities.IdeaBoard.list('-created_date'),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.IdeaBoard.create({ ...data, submitted_by_id: user?.id, submitted_by_name: user?.full_name || user?.email });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['ideas'] }); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.IdeaBoard.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['ideas'] }); setViewing(null); },
  });

  const upvoteMutation = useMutation({
    mutationFn: (idea) => base44.entities.IdeaBoard.update(idea.id, { upvotes: (idea.upvotes || 0) + 1 }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ideas'] }),
  });

  const resetForm = () => {
    setForm({ title: '', category: 'idea', description: '', links: [], file_urls: [], file_names: [] });
    setLinkInput('');
    setShowForm(false);
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const addLink = () => {
    if (!linkInput.trim()) return;
    update('links', [...(form.links || []), linkInput.trim()]);
    setLinkInput('');
  };

  const removeLink = (i) => update('links', form.links.filter((_, idx) => idx !== i));

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      update('file_urls', [...(form.file_urls || []), file_url]);
      update('file_names', [...(form.file_names || []), file.name]);
    }
    setUploading(false);
  };

  const removeFile = (i) => {
    update('file_urls', form.file_urls.filter((_, idx) => idx !== i));
    update('file_names', form.file_names.filter((_, idx) => idx !== i));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  const filtered = filter === 'all' ? ideas : ideas.filter(i => i.category === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Brainstorm Board</h1>
          <p className="text-sm text-muted-foreground mt-1">Submit ideas, request changes, flag issues, and share feedback</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Submit Idea
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80')}
        >
          All ({ideas.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = ideas.filter(i => i.category === cat.value).length;
          return (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', filter === cat.value ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80')}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <Lightbulb className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No submissions yet. Be the first to share an idea!</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(idea => (
            <div
              key={idea.id}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-all cursor-pointer"
              onClick={() => setViewing(idea)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <CategoryBadge category={idea.category} />
                    <StatusBadge status={idea.status} />
                  </div>
                  <h3 className="font-semibold text-sm leading-snug">{idea.title}</h3>
                  {idea.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{idea.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span>{idea.submitted_by_name || 'Anonymous'}</span>
                    <span>{idea.created_date ? format(new Date(idea.created_date), 'dd MMM yyyy') : ''}</span>
                    {idea.file_urls?.length > 0 && (
                      <span className="flex items-center gap-1"><Paperclip className="w-3 h-3" />{idea.file_urls.length} file{idea.file_urls.length > 1 ? 's' : ''}</span>
                    )}
                    {idea.links?.length > 0 && (
                      <span className="flex items-center gap-1"><Link2 className="w-3 h-3" />{idea.links.length} link{idea.links.length > 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); upvoteMutation.mutate(idea); }}
                  className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors flex-shrink-0"
                >
                  <ThumbsUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-semibold">{idea.upvotes || 0}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit an Idea or Request</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => update('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => update('title', e.target.value)} placeholder="Brief summary of your idea or request" required />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Describe in detail — what problem does it solve? What should change? How should it work?" className="h-28" />
            </div>

            {/* Links */}
            <div>
              <Label>Reference Links</Label>
              <div className="flex gap-2 mt-1">
                <Input value={linkInput} onChange={e => setLinkInput(e.target.value)} placeholder="https://..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLink())} />
                <Button type="button" variant="outline" size="sm" onClick={addLink}><Plus className="w-4 h-4" /></Button>
              </div>
              {form.links?.length > 0 && (
                <div className="mt-2 space-y-1">
                  {form.links.map((link, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs bg-muted rounded-lg px-3 py-2">
                      <Link2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span className="truncate flex-1 text-blue-600">{link}</span>
                      <button type="button" onClick={() => removeLink(i)}><X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* File uploads */}
            <div>
              <Label>Attachments</Label>
              <div
                onClick={() => fileRef.current?.click()}
                className="mt-1 border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload screenshots, documents, or files</p>
                <p className="text-xs text-muted-foreground mt-1">Images, PDFs, Word docs, and more</p>
              </div>
              <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFileUpload} />
              {uploading && <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2"><div className="w-3 h-3 border-2 border-muted border-t-primary rounded-full animate-spin" /> Uploading...</p>}
              {form.file_names?.length > 0 && (
                <div className="mt-2 space-y-1">
                  {form.file_names.map((name, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs bg-muted rounded-lg px-3 py-2">
                      <FileText className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span className="truncate flex-1">{name}</span>
                      <button type="button" onClick={() => removeFile(i)}><X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || uploading}>Submit</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View / Admin Dialog */}
      {viewing && (
        <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewing.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <CategoryBadge category={viewing.category} />
                <StatusBadge status={viewing.status} />
              </div>
              <div className="text-xs text-muted-foreground">Submitted by {viewing.submitted_by_name || 'Anonymous'} · {viewing.created_date ? format(new Date(viewing.created_date), 'dd MMM yyyy') : ''}</div>

              {viewing.description && (
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{viewing.description}</p>
              )}

              {viewing.links?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Links</p>
                  <div className="space-y-1">
                    {viewing.links.map((link, i) => (
                      <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-blue-600 hover:underline">
                        <Link2 className="w-3 h-3" />{link}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {viewing.file_urls?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Attachments</p>
                  <div className="grid grid-cols-2 gap-2">
                    {viewing.file_urls.map((url, i) => {
                      const name = viewing.file_names?.[i] || `File ${i + 1}`;
                      const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name) || url.includes('image');
                      return isImage ? (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                          <img src={url} alt={name} className="w-full h-28 object-cover rounded-lg border border-border hover:opacity-90 transition-opacity" />
                        </a>
                      ) : (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs bg-muted rounded-lg px-3 py-2.5 hover:bg-muted/80 transition-colors">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="truncate">{name}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Admin: update status / notes */}
              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Admin Response</p>
                <div>
                  <Label className="text-xs">Update Status</Label>
                  <Select value={viewing.status} onValueChange={v => setViewing(prev => ({ ...prev, status: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Admin Notes</Label>
                  <Textarea
                    value={viewing.admin_notes || ''}
                    onChange={e => setViewing(prev => ({ ...prev, admin_notes: e.target.value }))}
                    placeholder="Add a response or notes..."
                    className="mt-1 h-20"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
                  <Button onClick={() => updateMutation.mutate({ id: viewing.id, data: { status: viewing.status, admin_notes: viewing.admin_notes } })} disabled={updateMutation.isPending}>Save Response</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}