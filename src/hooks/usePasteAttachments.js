import { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook that enables pasting files (images, PDFs) directly into a comment textarea.
 * Text/links are left to the default paste behaviour so they flow into the textarea.
 *
 * @param {string[]} images   - current attached file URLs
 * @param {(string[]) => void} onChange - setter to append uploaded files
 */
export function usePasteAttachments(images, onChange) {
  const [pasting, setPasting] = useState(false);

  const handlePaste = useCallback(async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const files = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }

    // No files in clipboard → let the default text/link paste happen
    if (files.length === 0) return;

    e.preventDefault();
    setPasting(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        if (file_url) uploaded.push(file_url);
      }
      if (uploaded.length) onChange([...(images || []), ...uploaded]);
    } finally {
      setPasting(false);
    }
  }, [images, onChange]);

  return { handlePaste, pasting };
}