import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ShiftReportCard from '@/components/timesheets/ShiftReportCard';
import PayRunFolderDialog from '@/components/timesheets/PayRunFolderDialog';
import PayRunFolderCard from '@/components/timesheets/PayRunFolderCard';
import { Inbox, CheckCircle2, CheckCheck, Loader2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generatePayRunPdf } from '@/utils/payRunPdf';

export default function Timesheets() {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState([]);
  const [approving, setApproving] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [generatingFolderId, setGeneratingFolderId] = useState(null);

  const { data: timesheets = [], isLoading } = useQuery({
    queryKey: ['timesheets'],
    queryFn: () => base44.entities.Timesheet.list('-created_date'),
    initialData: [],
  });

  const { data: folders = [] } = useQuery({
    queryKey: ['payRunFolders'],
    queryFn: () => base44.entities.PayRunFolder.list('-created_date'),
    initialData: [],
  });

  const submitted = timesheets.filter(t => t.status === 'submitted' || t.status === 'draft');
  const approvedTimesheets = timesheets.filter(t => ['client_approved', 'admin_approved', 'payroll_ready', 'paid'].includes(t.status));

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const selectAll = () => {
    if (selectedIds.length === submitted.length) setSelectedIds([]);
    else setSelectedIds(submitted.map(t => t.id));
  };

  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return;
    setFolderDialogOpen(true);
  };

  const handleCreateFolder = async ({ client_name, client_id, week_ending, pay_cycle }) => {
    setApproving(true);
    try {
      const folder = await base44.entities.PayRunFolder.create({
        client_name,
        client_id,
        week_ending,
        pay_cycle,
        status: 'open'
      });
      await base44.entities.Timesheet.bulkUpdate(
        selectedIds.map(id => ({
          id,
          status: 'admin_approved',
          admin_approval: true,
          pay_run_folder_id: folder.id
        }))
      );
      setSelectedIds([]);
      setFolderDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
      queryClient.invalidateQueries({ queryKey: ['payRunFolders'] });
    } finally {
      setApproving(false);
    }
  };

  const handleGenerateFolderPdf = (folder) => {
    const folderTimesheets = approvedTimesheets.filter(t => t.pay_run_folder_id === folder.id);
    if (folderTimesheets.length === 0) return;
    setGeneratingFolderId(folder.id);
    try {
      generatePayRunPdf(folderTimesheets);
    } finally {
      setGeneratingFolderId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PayRunFolderDialog
        open={folderDialogOpen}
        onOpenChange={setFolderDialogOpen}
        onConfirm={handleCreateFolder}
        selectedCount={selectedIds.length}
      />

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Timesheets</h1>
        <p className="text-sm text-muted-foreground mt-1">Shift report intake and payroll approval</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left box: New submitted shift reports */}
        <div className="bg-muted/30 rounded-xl border-2 border-dashed border-border min-h-[60vh] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Inbox className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">Submitted Shift Reports</h2>
                <p className="text-xs text-muted-foreground">Newly submitted — awaiting review</p>
              </div>
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">{submitted.length}</span>
          </div>

          {submitted.length > 0 && (
            <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-border">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.length === submitted.length && submitted.length > 0}
                  onChange={selectAll}
                  className="w-4 h-4 rounded border-border accent-primary"
                />
                Select all ({selectedIds.length}/{submitted.length})
              </label>
              <Button
                size="sm"
                onClick={handleBulkApprove}
                disabled={selectedIds.length === 0 || approving}
              >
                {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
                Approve ({selectedIds.length})
              </Button>
            </div>
          )}

          <div className="space-y-3 flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
              </div>
            ) : submitted.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                <Inbox className="w-10 h-10 opacity-30 mb-2" />
                <p className="text-sm font-medium">No new shift reports</p>
                <p className="text-xs">Submitted reports from the STS Hub will appear here.</p>
              </div>
            ) : (
              submitted.map(ts => (
                <ShiftReportCard
                  key={ts.id}
                  report={ts}
                  selectable
                  selected={selectedIds.includes(ts.id)}
                  onToggle={toggleSelect}
                />
              ))
            )}
          </div>
        </div>

        {/* Right box: Approved for pay folders */}
        <div className="bg-muted/30 rounded-xl border-2 border-dashed border-border min-h-[60vh] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-success" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">Approved for Pay</h2>
                <p className="text-xs text-muted-foreground">Pay run folders</p>
              </div>
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-success/10 text-success">{folders.length}</span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
              </div>
            ) : folders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                <FolderOpen className="w-10 h-10 opacity-30 mb-2" />
                <p className="text-sm font-medium">No pay run folders yet</p>
                <p className="text-xs">Approve shift reports to create a folder.</p>
              </div>
            ) : (
              folders.map(folder => (
                <PayRunFolderCard
                  key={folder.id}
                  folder={folder}
                  timesheets={approvedTimesheets.filter(t => t.pay_run_folder_id === folder.id)}
                  onGeneratePdf={() => handleGenerateFolderPdf(folder)}
                  generating={generatingFolderId === folder.id}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}