import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Star } from 'lucide-react';
import { isPriority } from './policyData';

export default function PolicyCategory({ category, color, policies, checkedMap, onToggle }) {
  const [expanded, setExpanded] = useState(true);

  const checkedCount = policies.filter((p) => checkedMap[`${category}::${p}`]?.checked).length;
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
            const isChecked = !!entry?.checked;
            const priority = isPriority(policy);
            return (
              <label
                key={key}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-muted/30 transition-colors group"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggle(category, policy)}
                  className="w-4 h-4 rounded border-border accent-primary flex-shrink-0"
                />
                <span className={`text-sm flex-1 ${isChecked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {policy}
                </span>
                {priority && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">
                    <Star className="w-2.5 h-2.5 fill-accent" /> Priority
                  </span>
                )}
                {isChecked && entry?.checked_by_name && (
                  <span className="text-[10px] text-muted-foreground hidden sm:inline">
                    {entry.checked_by_name}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}