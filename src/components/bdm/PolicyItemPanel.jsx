import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, Clock, FileCheck, Send, ExternalLink, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const APPROVAL_STAGES = [
  { key: 'draft', label: 'Draft', icon: FileText, color: 'text-muted-foreground bg-muted' },
  { key: 'in_review', label: 'In Review', icon: Clock, color: 'text-amber-600 bg-amber-500/10' },
  { key: 'approved', label: 'Approved', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-500/10' },
];

export default function PolicyItemPanel({ category, policy, entry, onUpdate, onClose }) {
  const [uploading, setUploading] = useState(false);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const documentUrl = entry?.document_url || null;
  const documentName = entry?.document_name || null;
  const approvalStatus = entry?.approval_status || 'draft';
  const comments = entry?.comments || [];

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const base44 = (await import('@/api/base44Client')).base44;
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const user = await base44.auth.me().catch(() => null);
      onUpdate({
        ...entry,
        document_url: file_url,
        document_name: file.name,
        approval_status: entry?.approval_status === 'approved' ? 'approved' : 'draft',
        comments: [
          ...(entry?.comments || []),
          { author_name: user?.full_name || 'Unknown', text: `Uploaded document: ${file.name}`, date: new Date().toISOString(), system: true },
        ],
      });
    } finally {
      setUploading(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    onUpdate({ ...entry, approval_status: newStatus });
  };

  const handleAddComment = () => {
    const text = comment.trim();
    if (!text) return;
    onUpdate({
      ...entry,
      comments: [...comments, { author_name: 'You', text, date: new Date().toISOString() }],
    });
    setComment('');
  };

  const handleRemoveDocument = () => {
    onUpdate({ ...entry, document_url: null, document_name: null, approval_status: 'draft' });
  };

  const stageIdx = APPROVAL_STAGES.findIndex((s) => s.key === approvalStatus);

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-card border-l border-border shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{category}</p>
            <h2 className="font-bold text-base leading-tight mt-0.5">{policy}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Approval workflow */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">Approval Status</h3>
            <div className="flex items-center gap-1">
              {APPROVAL_STAGES.map((stage, i) => {
                const isActive = i <= stageIdx;
                const isCurrent = stage.key === approvalStatus;
                const Icon = stage.icon;
                return (
                  <React.Fragment key={stage.key}>
                    <button
                      onClick={() => handleStatusChange(stage.key)}
                      className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-all flex-1 ${isCurrent ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? stage.color : 'bg-muted text-muted-foreground/40'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-semibold ${isActive ? 'text-foreground' : 'text-muted-foreground/50'}`}>{stage.label}</span>
                    </button>
                    {i < APPROVAL_STAGES.length - 1 && (
                      <div className={`h-0.5 flex-1 rounded-full ${i < stageIdx ? 'bg-emerald-500' : 'bg-muted'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Document */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">Document</h3>
            {documentUrl ? (
              <div className="border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{documentName}</p>
                    <p className="text-xs text-muted-foreground">Draft uploaded</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href={documentUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <ExternalLink className="w-3.5 h-3.5" /> View Document
                    </Button>
                  </a>
                  <label className="cursor-pointer">
                    <Button variant="secondary" size="sm" className="gap-2 pointer-events-none">
                      <Upload className="w-3.5 h-3.5" /> Replace
                    </Button>
                    <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
                  </label>
                  <Button variant="ghost" size="sm" onClick={handleRemoveDocument} className="text-destructive hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-8 cursor-pointer hover:bg-muted/30 transition-colors">
                {uploading ? (
                  <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 text-muted-foreground" />
                )}
                <span className="text-sm font-medium text-muted-foreground">
                  {uploading ? 'Uploading...' : 'Upload draft document'}
                </span>
                <span className="text-xs text-muted-foreground/70">PDF, DOCX, or image files</span>
                <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
              </label>
            )}
          </div>

          {/* Comments */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">
              Comments & Feedback {comments.length > 0 && `(${comments.length})`}
            </h3>
            {comments.length > 0 ? (
              <div className="space-y-2 mb-3">
                {comments.map((c, i) => (
                  <div key={i} className={`flex gap-2 ${c.system ? 'opacity-60' : ''}`}>
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                      {(c.author_name || '?')[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-semibold">{c.author_name}</span>
                        {!c.system && (
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(c.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-foreground/90 break-words">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mb-3">No comments yet. Add feedback below.</p>
            )}
            <div className="flex gap-2">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment or feedback..."
                rows={2}
                className="text-sm resize-none"
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
              />
              <Button size="icon" onClick={handleAddComment} disabled={!comment.trim()} className="flex-shrink-0 h-9 w-9">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}