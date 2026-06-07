import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Plus, Lightbulb, Bug, MessageSquare, HelpCircle, RefreshCw,
  Paperclip, Link2, X, Upload, FileText, ThumbsUp, ArrowLeft,
  CheckCircle2, Clock, Eye, Calendar, User, Tag, AlertCircle
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
  { value: 'open', label: 'Open', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: Clock },
  { value: 'under_review', label: 'Under Review', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Eye },
  { value: 'planned', label: 'Planned', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Calendar },
  { value: 'completed', label: 'Completed', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  { value: 'declined', label: 'Declined', color: 'bg-red-100 text-red-700 border-red-200', icon: X },
];

const PRIORITY = [
  { value: 'low', label: 'Low', color: 'text-slate-500' },
  { value: 'medium', label: 'Medium', color: 'text-amber-600' },
  { value: 'high', label: 'High', color: 'text-red-600' },
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
  const Icon = s.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border', s.color)}>
      <Icon className="w-3 h-3" />{s.label}
    </span>
  );
}

// ── Full-page submission form ──────────────────────────────────────────────────
function SubmitForm({ onCancel, onSuccess }) {
  const [form, setForm] = useState({
    title: '', category: 'idea', description: '', priority: 'medium',
    affected_area: '', expected_outcome: '', steps_to_reproduce: '',
    links: [], file_urls: [], file_names: []
  });
  const [linkInput, setLinkInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

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

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.IdeaBoard.create({
        ...data,
        submitted_by_id: user?.id,
        submitted_by_name: user?.full_name || user?.email
      });
    },
    onSuccess,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  const selectedCat = CATEGORIES.find(c => c.value === form.category);

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onCancel} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Board
      </button>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Colour header strip */}
        <div className="h-2 w-full bg-gradient-to-r from-primary to-primary/60" />

        <div className="p-8">
          <h2 className="text-xl font-bold mb-1">Submit an Idea or Request</h2>
          <p className="text-sm text-muted-foreground mb-8">The more detail you provide, the easier it is to action your submission.</p>

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Row 1: Category + Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <Label className="text-sm font-semibold">Category *</Label>
                <Select value={form.category} onValueChange={v => update('category', v)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => {
                      const Icon = c.icon;
                      return (
                        <SelectItem key={c.value} value={c.value}>
                          <span className="flex items-center gap-2"><Icon className="w-4 h-4" />{c.label}</span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold">Priority</Label>
                <Select value={form.priority} onValueChange={v => update('priority', v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITY.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Title */}
            <div>
              <Label className="text-sm font-semibold">Title *</Label>
              <Input
                className="mt-1.5"
                value={form.title}
                onChange={e => update('title', e.target.value)}
                placeholder="Give your submission a clear, concise title"
                required
              />
            </div>

            {/* Affected area */}
            <div>
              <Label className="text-sm font-semibold">Affected Area / Module</Label>
              <Input
                className="mt-1.5"
                value={form.affected_area}
                onChange={e => update('affected_area', e.target.value)}
                placeholder="e.g. Timesheets, Compliance, Candidate Pipeline, Billing..."
              />
            </div>

            {/* Description */}
            <div>
              <Label className="text-sm font-semibold">Description *</Label>
              <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">What is the idea / issue? What problem does it solve?</p>
              <Textarea
                value={form.description}
                onChange={e => update('description', e.target.value)}
                placeholder="Describe your idea or issue in as much detail as possible..."
                className="h-36 resize-y"
                required
              />
            </div>

            {/* Expected Outcome */}
            <div>
              <Label className="text-sm font-semibold">Expected Outcome / Desired Result</Label>
              <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">What should happen once this is addressed?</p>
              <Textarea
                value={form.expected_outcome}
                onChange={e => update('expected_outcome', e.target.value)}
                placeholder="Describe what success looks like..."
                className="h-24 resize-y"
              />
            </div>

            {/* Steps to reproduce (shown for bug reports) */}
            {form.category === 'bug_report' && (
              <div>
                <Label className="text-sm font-semibold">Steps to Reproduce</Label>
                <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">Walk through exactly how to trigger the issue</p>
                <Textarea
                  value={form.steps_to_reproduce}
                  onChange={e => update('steps_to_reproduce', e.target.value)}
                  placeholder="1. Go to...\n2. Click on...\n3. Observe that..."
                  className="h-28 resize-y font-mono text-xs"
                />
              </div>
            )}

            {/* Reference Links */}
            <div>
              <Label className="text-sm font-semibold">Reference Links</Label>
              <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">Add any relevant URLs — examples, documentation, references</p>
              <div className="flex gap-2">
                <Input
                  value={linkInput}
                  onChange={e => setLinkInput(e.target.value)}
                  placeholder="https://..."
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLink())}
                />
                <Button type="button" variant="outline" onClick={addLink}><Plus className="w-4 h-4" /></Button>
              </div>
              {form.links?.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {form.links.map((link, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs bg-muted rounded-lg px-3 py-2">
                      <Link2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <a href={link} target="_blank" rel="noopener noreferrer" className="truncate flex-1 text-blue-600 hover:underline">{link}</a>
                      <button type="button" onClick={() => removeLink(i)}><X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Attachments */}
            <div>
              <Label className="text-sm font-semibold">Evidence & Attachments</Label>
              <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">Screenshots, screen recordings, documents — anything that helps explain the issue</p>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:bg-muted/40 transition-colors"
              >
                <Upload className="w-7 h-7 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Click to upload files</p>
                <p className="text-xs text-muted-foreground mt-1">Screenshots, PDFs, Word docs, videos, and more</p>
              </div>
              <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFileUpload} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.mp4,.mov" />
              {uploading && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-muted border-t-primary rounded-full animate-spin" /> Uploading...
                </p>
              )}
              {form.file_names?.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {form.file_names.map((name, i) => {
                    const url = form.file_urls[i];
                    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);
                    return isImage ? (
                      <div key={i} className="relative group rounded-lg overflow-hidden border border-border">
                        <img src={url} alt={name} className="w-full h-32 object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="absolute top-1.5 right-1.5 bg-white rounded-full p-0.5 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5 text-destructive" />
                        </button>
                        <p className="text-[10px] text-center truncate px-2 py-1 bg-muted">{name}</p>
                      </div>
                    ) : (
                      <div key={i} className="flex items-center gap-2 text-xs bg-muted rounded-lg px-3 py-2.5">
                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate flex-1">{name}</span>
                        <button type="button" onClick={() => removeFile(i)}><X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" /></button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || uploading} className="px-8">
                {createMutation.isPending ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Detail / Admin view ────────────────────────────────────────────────────────
function DetailView({ idea, onBack, onSave }) {
  const [status, setStatus] = useState(idea.status || 'open');
  const [adminNotes, setAdminNotes] = useState(idea.admin_notes || '');
  const saving = useMutation({
    mutationFn: () => base44.entities.IdeaBoard.update(idea.id, { status, admin_notes: adminNotes }),
    onSuccess: () => onSave(),
  });

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Board
      </button>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-primary to-primary/60" />
        <div className="p-8 space-y-7">
          {/* Title + badges */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <CategoryBadge category={idea.category} />
              <StatusBadge status={idea.status} />
              {idea.priority && (
                <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border bg-muted text-muted-foreground">
                  {idea.priority.charAt(0).toUpperCase() + idea.priority.slice(1)} Priority
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold">{idea.title}</h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><User className="w-3 h-3" />{idea.submitted_by_name || 'Anonymous'}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{idea.created_date ? format(new Date(idea.created_date), 'dd MMM yyyy') : ''}</span>
              {idea.affected_area && <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{idea.affected_area}</span>}
            </div>
          </div>

          {/* Description */}
          {idea.description && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Description</p>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{idea.description}</p>
            </div>
          )}

          {/* Expected Outcome */}
          {idea.expected_outcome && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Expected Outcome</p>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{idea.expected_outcome}</p>
            </div>
          )}

          {/* Steps to reproduce */}
          {idea.steps_to_reproduce && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Steps to Reproduce</p>
              <pre className="text-xs bg-muted rounded-lg p-4 whitespace-pre-wrap font-mono leading-relaxed">{idea.steps_to_reproduce}</pre>
            </div>
          )}

          {/* Links */}
          {idea.links?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Reference Links</p>
              <div className="space-y-1.5">
                {idea.links.map((link, i) => (
                  <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-blue-600 hover:underline">
                    <Link2 className="w-3 h-3" />{link}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {idea.file_urls?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Evidence & Attachments</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {idea.file_urls.map((url, i) => {
                  const name = idea.file_names?.[i] || `File ${i + 1}`;
                  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name) || url.includes('image');
                  return isImage ? (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border border-border hover:opacity-90 transition-opacity">
                      <img src={url} alt={name} className="w-full h-32 object-cover" />
                      <p className="text-[10px] truncate px-2 py-1 bg-muted text-muted-foreground">{name}</p>
                    </a>
                  ) : (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs bg-muted rounded-lg px-3 py-3 hover:bg-muted/80 transition-colors">
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{name}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Admin Response */}
          <div className="border-t border-border pt-6 space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Admin Response</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold">Update Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => {
                      const Icon = s.icon;
                      return (
                        <SelectItem key={s.value} value={s.value}>
                          <span className="flex items-center gap-2"><Icon className="w-4 h-4" />{s.label}</span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold">Admin Notes / Feedback</Label>
              <Textarea
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                placeholder="Add your response, decision rationale, or next steps..."
                className="mt-1.5 h-28 resize-y"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => saving.mutate()} disabled={saving.isPending} className="px-8">
                {saving.isPending ? 'Saving...' : 'Save Response'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Board ────────────────────────────────────────────────────────────────
export default function Brainstorm() {
  const [view, setView] = useState('board'); // 'board' | 'submit' | 'detail'
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ['ideas'],
    queryFn: () => base44.entities.IdeaBoard.list('-created_date'),
    initialData: [],
  });

  const upvoteMutation = useMutation({
    mutationFn: (idea) => base44.entities.IdeaBoard.update(idea.id, { upvotes: (idea.upvotes || 0) + 1 }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ideas'] }),
  });

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['ideas'] });
    setView('board');
  };

  const filtered = filter === 'all' ? ideas : ideas.filter(i => i.category === filter);

  if (view === 'submit') return <SubmitForm onCancel={() => setView('board')} onSuccess={handleSuccess} />;
  if (view === 'detail' && selected) return (
    <DetailView
      idea={selected}
      onBack={() => setView('board')}
      onSave={() => { queryClient.invalidateQueries({ queryKey: ['ideas'] }); setView('board'); }}
    />
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Brainstorm Board</h1>
          <p className="text-sm text-muted-foreground mt-1">Submit ideas, request changes, flag issues, and share feedback with the team</p>
        </div>
        <Button onClick={() => setView('submit')} className="gap-2">
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
          const Icon = cat.icon;
          return (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', filter === cat.value ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80')}
            >
              <Icon className="w-3.5 h-3.5" />{cat.label} ({count})
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
        <div className="bg-card rounded-xl border border-dashed border-border p-16 text-center text-muted-foreground">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No submissions yet</p>
          <p className="text-sm mt-1">Be the first to share an idea or flag an issue!</p>
          <Button onClick={() => setView('submit')} className="mt-4 gap-2" variant="outline"><Plus className="w-4 h-4" />Submit Now</Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(idea => (
            <div
              key={idea.id}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-all cursor-pointer group"
              onClick={() => { setSelected(idea); setView('detail'); }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <CategoryBadge category={idea.category} />
                    <StatusBadge status={idea.status} />
                    {idea.priority && idea.priority !== 'medium' && (
                      <span className={cn(
                        'text-[11px] font-semibold',
                        idea.priority === 'high' ? 'text-red-600' : 'text-slate-400'
                      )}>
                        {idea.priority === 'high' ? '↑ High Priority' : '↓ Low Priority'}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors">{idea.title}</h3>
                  {idea.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{idea.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{idea.submitted_by_name || 'Anonymous'}</span>
                    <span>{idea.created_date ? format(new Date(idea.created_date), 'dd MMM yyyy') : ''}</span>
                    {idea.affected_area && <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{idea.affected_area}</span>}
                    {idea.file_urls?.length > 0 && (
                      <span className="flex items-center gap-1"><Paperclip className="w-3 h-3" />{idea.file_urls.length} attachment{idea.file_urls.length > 1 ? 's' : ''}</span>
                    )}
                    {idea.links?.length > 0 && (
                      <span className="flex items-center gap-1"><Link2 className="w-3 h-3" />{idea.links.length} link{idea.links.length > 1 ? 's' : ''}</span>
                    )}
                  </div>
                  {idea.admin_notes && (
                    <div className="mt-3 text-xs bg-muted rounded-lg px-3 py-2 text-muted-foreground italic">
                      <span className="font-semibold not-italic text-foreground">Admin: </span>{idea.admin_notes}
                    </div>
                  )}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); upvoteMutation.mutate(idea); }}
                  className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors flex-shrink-0"
                  title="Upvote"
                >
                  <ThumbsUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-semibold">{idea.upvotes || 0}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}