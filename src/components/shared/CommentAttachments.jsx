import React from 'react';
import { FileText } from 'lucide-react';

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg|bmp|ico|avif)$/i;

/**
 * Renders attachments stored on a comment: image thumbnails or a PDF/file icon.
 * @param {string[]} images - file URLs attached to the comment
 */
export default function CommentAttachments({ images = [] }) {
  if (!images?.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {images.map((url, iIdx) => {
        const isImage = IMAGE_EXT.test(url) || (url.includes('image') && !url.includes('pdf'));
        if (isImage) {
          return (
            <a
              key={iIdx}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="block w-14 h-14 rounded-md overflow-hidden border border-border"
            >
              <img src={url} alt="attachment" className="w-full h-full object-cover" />
            </a>
          );
        }
        return (
          <a
            key={iIdx}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center w-14 h-14 rounded-md border border-border bg-muted text-muted-foreground gap-0.5"
          >
            <FileText className="w-4 h-4" />
            <span className="text-[8px] font-medium">PDF</span>
          </a>
        );
      })}
    </div>
  );
}