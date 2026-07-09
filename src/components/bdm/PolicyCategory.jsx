import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Star, FileText, Clock, CheckCircle2, Upload, ClipboardCheck, FileCheck, MessageCircle } from 'lucide-react';


const APPROVAL_BADGE = {
  uploaded: { label: 'Uploaded', icon: Upload, cls: 'text-blue-600 bg-blue-500/10' },
  assessed: { label: 'Assessed', icon: ClipboardCheck, cls: 'text-amber-600 bg-amber-500/10' },
  approved: { label: 'Approved', icon: CheckCircle2, cls: 'text-emerald-600 bg-emerald-500/10' },
};

export default function PolicyCategory({ category, color, policies, checkedMap, onToggle, onManage, isPriority, onTogglePriority }) {
  const [expanded, setExpanded] = useState(true);

  const checkedCount = policies.filter((p) => checkedMap[`${category}::${p}`]?.approval_status === 'approved').length;
  const total = policies.length;
  const pct = total > 0 ? Math.round((checkedCount / total) * 100) : 0;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
      >
        <div className={`w-1.5 h-10 rounded-full ${color}`} />
        <div className="flex-1 text-left">
          <h3 className="font-bold text-sm">{category}</h3>
          <p className="text-xs text-muted-foreground">
            {checkedCount} / {total} complete · {pct}%
          </p>
        </div>
        {/* Progress ring/bar */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block w-24 h-2 bg-muted rounded-full overflow-hidden">
            <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${pct}%` }} />
          </div>
          <span className="text-sm font-bold tabular-nums w-9 text-right">{pct}%</span>
          {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Policy list */}
      {expanded && (
        <div className="border-t border-border divide-y divide-border">
          {policies.map((policy) => {
            const key = `${category}::${policy}`;
            const entry = checkedMap[key];
            const isChecked = entry?.approval_status === 'approved';
            const inProgress = entry?.approval_status !== 'approved' && (entry?.comments?.length > 0 || ['uploaded', 'assessed'].includes(entry?.approval_status));
            const newComments = (entry?.new_comment_count || 0) > 0;
            const priority = isPriority(policy);
            return (
              <div
                key={key}
                className={`flex items-center gap-3 px-4 py-2.5 transition-colors group ${inProgress ? 'bg-orange-500/10 hover:bg-orange-500/15' : 'hover:bg-muted/30'}`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggle(category, policy)}
                  className="w-4 h-4 rounded border-border accent-primary flex-shrink-0 cursor-pointer"
                />
                <span className={`text-sm flex-1 ${isChecked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {policy}
                </span>
                {newComments && (
                  <span className="relative flex-shrink-0" title="New comment">
                    <MessageCircle className="w-4 h-4 text-red-500 fill-red-500" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">
                      {entry.new_comment_count}
                    </span>
                  </span>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); onTogglePriority(policy); }}
                  className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full transition-colors ${priority ? 'text-accent bg-accent/10' : 'text-muted-foreground bg-muted opacity-0 group-hover:opacity-100'} hover:bg-accent/20`}
                  title={priority ? 'Remove priority' : 'Mark as priority'}
                >
                  <Star className={`w-2.5 h-2.5 ${priority ? 'fill-accent' : ''}`} /> {priority ? 'Priority' : 'Set Priority'}
                </button>
                {/* Status badge */}
                <button
                  onClick={() => onManage(category, policy)}
                  className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full transition-opacity ${entry?.approval_status && APPROVAL_BADGE[entry.approval_status] ? APPROVAL_BADGE[entry.approval_status].cls : 'text-muted-foreground bg-muted'} hover:opacity-80 flex-shrink-0`}
                  title="View / update status"
                >
                  {entry?.approval_status && APPROVAL_BADGE[entry.approval_status]
                    ? <>{React.createElement(APPROVAL_BADGE[entry.approval_status].icon, { className: 'w-2.5 h-2.5' })}{APPROVAL_BADGE[entry.approval_status].label}</>
                    : <><FileText className="w-2.5 h-2.5" />No Status</>}
                </button>
                {/* Evidence button */}
                <button
                  onClick={() => onManage(category, policy)}
                  className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors flex-shrink-0 ${entry?.document_url ? 'text-primary bg-primary/10' : 'text-muted-foreground bg-muted'} hover:opacity-80`}
                  title="View / upload evidence"
                >
                  {entry?.document_url ? <FileCheck className="w-2.5 h-2.5" /> : <Upload className="w-2.5 h-2.5" />}
                  Evidence
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}