import React, { useState, useEffect } from 'react';
import { X, Copy, Check, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DraftEditor({ policy, category, initialContent, onSave, onClose }) {
  const [content, setContent] = useState(initialContent || '');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setContent(initialContent || '');
  }, [initialContent]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    if (content !== initialContent) {
      onSave(content);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{category}</p>
            <h2 className="font-bold text-base leading-tight truncate">{policy} — Draft Box</h2>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleCopy} disabled={!content.trim()}>
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button size="sm" className="gap-2" onClick={handleClose}>
            <X className="w-4 h-4" /> Close
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden p-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste or type your draft content here..."
          className="w-full h-full resize-none rounded-xl border border-border bg-card p-6 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring"
          autoFocus
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-card">
        <p className="text-xs text-muted-foreground">
          {content.trim() ? `${content.trim().length} characters · ${content.trim().split(/\s+/).filter(Boolean).length} words` : 'Empty draft'}
        </p>
        <p className="text-xs text-muted-foreground">Drafts auto-save when you close</p>
      </div>
    </div>
  );
}