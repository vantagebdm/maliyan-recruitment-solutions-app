import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle2, AlertCircle, Loader2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-primary" />
        </div>
      )}
      <div className={cn('max-w-[85%]', isUser && 'flex flex-col items-end')}>
        {message.content && (
          <div className={cn(
            'rounded-2xl px-4 py-2.5',
            isUser ? 'bg-primary text-primary-foreground' : 'bg-muted/50 border border-border'
          )}>
            {isUser ? (
              <p className="text-sm leading-relaxed">{message.content}</p>
            ) : (
              <ReactMarkdown
                className="text-sm prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                components={{
                  code: ({ inline, children, ...props }) => inline ? (
                    <code className="px-1 py-0.5 rounded bg-muted text-foreground text-xs">{children}</code>
                  ) : (
                    <pre className="bg-muted rounded-lg p-3 overflow-x-auto my-2 text-xs">
                      <code {...props}>{children}</code>
                    </pre>
                  ),
                  a: ({ children, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary underline">{children}</a>,
                  p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="my-1 ml-4 list-disc">{children}</ul>,
                  ol: ({ children }) => <ol className="my-1 ml-4 list-decimal">{children}</ol>,
                  li: ({ children }) => <li className="my-0.5">{children}</li>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}
        {message.tool_calls?.length > 0 && (
          <div className="mt-1 space-y-1">
            {message.tool_calls.map((tc, i) => <ToolCallBadge key={i} toolCall={tc} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function ToolCallBadge({ toolCall }) {
  const [expanded, setExpanded] = useState(false);
  const status = toolCall?.status || 'pending';
  const name = (toolCall?.name || 'tool').split('.').pop().toLowerCase().replace(/_/g, ' ');

  const statusConfig = {
    pending: { icon: Loader2, color: 'text-muted-foreground', spin: true },
    running: { icon: Loader2, color: 'text-muted-foreground', spin: true },
    in_progress: { icon: Loader2, color: 'text-muted-foreground', spin: true },
    completed: { icon: CheckCircle2, color: 'text-green-600', spin: false },
    success: { icon: CheckCircle2, color: 'text-green-600', spin: false },
    failed: { icon: AlertCircle, color: 'text-destructive', spin: false },
    error: { icon: AlertCircle, color: 'text-destructive', spin: false },
  }[status] || { icon: Loader2, color: 'text-muted-foreground', spin: true };

  const Icon = statusConfig.icon;

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-card text-xs hover:bg-muted transition-colors"
    >
      <Icon className={cn('w-3 h-3', statusConfig.color, statusConfig.spin && 'animate-spin')} />
      <span className="text-muted-foreground">{name}</span>
      {toolCall.results && <ChevronRight className={cn('w-3 h-3 text-muted-foreground ml-auto transition-transform', expanded && 'rotate-90')} />}
    </button>
  );
}