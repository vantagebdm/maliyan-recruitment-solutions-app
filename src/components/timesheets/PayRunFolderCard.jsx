import React, { useState } from 'react';
import { Folder, ChevronDown, ChevronRight, FileDown, Loader2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ShiftReportCard from './ShiftReportCard';
import { format } from 'date-fns';

export default function PayRunFolderCard({ folder, timesheets, onGeneratePdf, generating }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between p-4 gap-2">
        <button
          className="flex items-center gap-3 flex-1 min-w-0 text-left"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded
            ? <ChevronDown className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
            : <ChevronRight className="w-4 h-4 flex-shrink-0 text-muted-foreground" />}
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Folder className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{folder.client_name}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {folder.week_ending ? format(new Date(folder.week_ending), 'dd MMM yyyy') : '—'}
              </span>
              <span className="capitalize">{folder.pay_cycle}</span>
            </div>
          </div>
        </button>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary whitespace-nowrap">
            {timesheets.length} {timesheets.length === 1 ? 'entry' : 'entries'}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={onGeneratePdf}
            disabled={timesheets.length === 0 || generating}
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            Pay Run PDF
          </Button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-border p-3 space-y-2 bg-muted/20">
          {timesheets.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No timesheets in this folder.</p>
          ) : (
            timesheets.map(ts => <ShiftReportCard key={ts.id} report={ts} />)
          )}
        </div>
      )}
    </div>
  );
}