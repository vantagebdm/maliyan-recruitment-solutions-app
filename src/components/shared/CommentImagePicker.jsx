import React, { useState } from 'react';
import { Paperclip, X, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

/**
 * Shared image attachment picker for comment/note sections.
 * Props:
 *  - images: string[]  (array of file URLs)
 *  - onChange: (string[]) => void
 *  - disabled?: boolean
 */
export default function CommentImagePicker({ images = [], onChange, disabled }) {
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    e.target.value = '';
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        if (file_url) uploaded.push(file_url);
      }
      if (uploaded.length) onChange([...(images || []), ...uploaded]);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) => {
    const next = [...(images || [])];
    next.splice(idx, 1);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {(images?.length > 0 || uploading) && (
        <div className="flex flex-wrap gap-2">
          {(images || []).map((url, idx) => (
            <div key={idx} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-border bg-muted">
              <img src={url} alt="attachment" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {uploading && (
            <div className="w-16 h-16 rounded-lg border border-dashed border-border bg-muted flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
            </div>
          )}
        </div>
      )}

      <label
        className={cn(
          'inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors',
          disabled && 'opacity-50 pointer-events-none'
        )}
      >
        <Paperclip className="w-3.5 h-3.5" />
        {uploading ? 'Uploading...' : 'Attach images'}
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFiles}
          disabled={disabled || uploading}
        />
      </label>
    </div>
  );
}