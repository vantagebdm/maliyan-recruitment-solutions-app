import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Save, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import CommentImagePicker from '@/components/shared/CommentImagePicker';
import CommentAttachments from '@/components/shared/CommentAttachments';
import { usePasteAttachments } from '@/hooks/usePasteAttachments';

const COMMENT_TYPES = [
  { value: 'interview', label: 'Interview', color: 'bg-blue-500' },
  { value: 'phone_call', label: 'Candidate Phone Call', color: 'bg-emerald-500' },
  { value: 'sms_sent', label: 'SMS Sent', color: 'bg-cyan-500' },
  { value: 'did_not_answer', label: 'Did Not Answer', color: 'bg-amber-500' },
  { value: 'general', label: 'General Notes', color: 'bg-slate-500' },
  { value: 'note', label: 'Note', color: 'bg-purple-500' },
];

export default function CommentsSection({ candidate, onAddComment, onDeleteComment }) {
  const [type, setType] = useState('general');
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const { handlePaste, pasting } = usePasteAttachments(images, setImages);

  const comments = candidate.comments || [];

  const handleSave = async () => {
    if (!text.trim() && images.length === 0) return;
    setSaving(true);
    await onAddComment({ type, text: text.trim(), images });
    setText('');
    setImages([]);
    setSaving(false);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-4 h-4 text-primary" />
        <h3 className="font-bold text-sm">Comments / Notes</h3>
      </div>

      {/* Add comment */}
      <div className="space-y-2 mb-4">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            {COMMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Textarea value={text} onChange={e => setText(e.target.value)} onPaste={handlePaste} placeholder="Add a comment... (paste images, PDFs, or links)" className="h-20" />
        <CommentImagePicker images={images} onChange={setImages} disabled={saving || pasting} loading={pasting} />
        <div className="flex justify-end">
          <Button size="sm" onClick={handleSave} disabled={saving || pasting || (!text.trim() && images.length === 0)} className="gap-1">
            <Save className="w-3 h-3" /> Save Comment
          </Button>
        </div>
      </div>

      {/* Comment list */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No comments yet.</p>
        ) : (
          [...comments].reverse().map((c, idx) => {
            const typeInfo = COMMENT_TYPES.find(t => t.value === c.type) || COMMENT_TYPES[4];
            return (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                <div className={`w-2 h-2 rounded-full ${typeInfo.color} mt-1.5 flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">{typeInfo.label}</span>
                      <span className="text-xs text-muted-foreground">{c.author_name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {c.date && <span className="text-xs text-muted-foreground">{format(new Date(c.date), 'dd MMM yyyy HH:mm')}</span>}
                      <button onClick={() => onDeleteComment(comments.length - 1 - idx)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm mt-1">{c.text}</p>
                  <CommentAttachments images={c.images} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}