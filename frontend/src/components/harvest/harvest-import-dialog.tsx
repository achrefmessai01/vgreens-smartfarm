'use client';

import * as React from 'react';
import { useMutation } from '@apollo/client';
import { useTenantIdVariable } from '@/lib/contexts/selected-tenant-context';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast-provider';
import { IMPORT_HARVEST_MUTATION } from '@/graphql/mutations/harvest.mutations';

// ── Types ──────────────────────────────────────────────────────────────────

interface RowIssue {
  sourceRow: number;
  level: 'error' | 'warning';
  reason: string;
}

interface ImportReport {
  tenant: string;
  dryRun: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  created: number;
  skippedDuplicates: number;
  failed: number;
  issues: RowIssue[];
  globalWarnings: string[];
}

interface HarvestImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful commit (dryRun=false) so the list refreshes. */
  onImported?: () => void;
  /** Whether the backend confirmed import is available for this tenant. */
  importAvailable?: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const ALLOWED_EXTS = ['.xls', '.xlsx', '.csv'];
const ALLOWED_TYPES = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'application/csv',
];

function isAllowedFile(file: File): boolean {
  const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase();
  return ALLOWED_EXTS.includes(ext) || ALLOWED_TYPES.includes(file.type);
}

// ── Component ──────────────────────────────────────────────────────────────

export function HarvestImportDialog({
  open,
  onOpenChange,
  onImported,
  importAvailable,
}: HarvestImportDialogProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  const { toast } = useToast();
  const { isVGreensAdmin } = useCurrentUser();
  // For VGREENS_ADMIN: the currently selected tenant in the admin switcher.
  // For TENANT_ADMIN: undefined (backend uses their JWT tenantId instead).
  const selectedTenantId = useTenantIdVariable();

  const [file, setFile] = React.useState<File | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [dryRun, setDryRun] = React.useState(true);
  const [report, setReport] = React.useState<ImportReport | null>(null);
  const [importError, setImportError] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [runImport, { loading: isImporting }] = useMutation<{
    importHarvest: ImportReport;
  }>(IMPORT_HARVEST_MUTATION);

  // Reset state whenever the dialog opens
  React.useEffect(() => {
    if (open) {
      setFile(null);
      setDryRun(true);
      setReport(null);
      setImportError(null);
    }
  }, [open]);

  const handleFileSelect = (selected: File | null) => {
    if (!selected) return;
    if (!isAllowedFile(selected)) {
      setImportError(
        h?.importUnsupportedFile ??
          'Unsupported file type. Please upload an XLS, XLSX, or CSV file.',
      );
      return;
    }
    setFile(selected);
    setReport(null);
    setImportError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files[0] ?? null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files?.[0] ?? null);
    // Reset input so the same file can be re-selected after removal
    e.target.value = '';
  };

  const handleImport = async () => {
    if (!file) return;

    // VGREENS_ADMIN must have a tenant selected in the admin switcher.
    if (isVGreensAdmin && !selectedTenantId) {
      setImportError(
        h?.importErrorNoTenant ??
          'Please select a tenant that has a mapper configured before importing.',
      );
      return;
    }

    // TENANT_ADMIN: double-check that their farm has a mapper configured.
    if (!isVGreensAdmin && importAvailable === false) {
      setImportError(
        h?.importErrorNoMapper ??
          'Harvest import is not available for your farm. Contact the vGreens team to set it up.',
      );
      return;
    }

    setReport(null);
    setImportError(null);

    try {
      const { data, errors } = await runImport({
        variables: {
          input: {
            file,
            dryRun,
            tenantId: selectedTenantId ?? null,
          },
        },
        errorPolicy: 'all',
      });

      if (errors?.length) throw new Error(errors[0].message);

      const result = data?.importHarvest;
      if (!result) throw new Error(h?.importError ?? 'Import failed');

      setReport(result);

      if (!dryRun && result.created > 0) {
        toast({
          title: h?.importSuccess ?? 'Import complete',
          description: `${result.created} ${h?.importResultCreated ?? 'Created'}`,
        });
        onImported?.();
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : (h?.importError ?? 'Import failed');
      setImportError(msg);
      toast({
        title: h?.importError ?? 'Import failed',
        description: msg,
        variant: 'destructive',
      });
    }
  };

  const canImport = !!file && !isImporting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden p-0 sm:max-w-lg"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="relative shrink-0 overflow-hidden border-b bg-gradient-to-br from-[#016f7c]/10 via-[#016f7c]/5 to-transparent px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-[#016f7c]/10 blur-2xl"
          />
          <div className="relative flex items-start gap-3 sm:gap-3.5">
            <div className="shrink-0 rounded-xl bg-white p-2 text-[#016f7c] shadow-sm ring-1 ring-[#016f7c]/20 sm:p-2.5 dark:bg-[#016f7c]/15">
              <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base font-semibold sm:text-lg">
                {h?.importDialogTitle ?? 'Import Harvest Data'}
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs sm:text-sm">
                {h?.importDialogDescription ??
                  'Upload an Erntemeldung XLS, XLSX, or CSV file to import harvest entries.'}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:space-y-5 sm:px-6 sm:py-5">
          {/* Drop zone */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload file"
            className={cn(
              'relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors',
              dragOver
                ? 'border-[#016f7c] bg-[#016f7c]/5'
                : 'border-border hover:border-[#016f7c]/50 hover:bg-muted/30',
            )}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xls,.xlsx,.csv"
              className="sr-only"
              onChange={handleInputChange}
            />
            {file ? (
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 shrink-0 text-[#016f7c]" />
                <div className="min-w-0 text-left">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Remove file"
                  className="text-muted-foreground hover:text-foreground ml-auto shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setReport(null);
                    setImportError(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="text-muted-foreground h-8 w-8" />
                <div>
                  <p className="text-sm font-medium">
                    {h?.importDropHint ?? 'Drop file here or click to browse'}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {h?.importDropFormats ?? 'XLS, XLSX, or CSV · max 10 MB'}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Dry-run toggle */}
          <label className="bg-muted/30 flex cursor-pointer items-start gap-3 rounded-lg border p-3">
            <input
              type="checkbox"
              checked={dryRun}
              onChange={(e) => {
                setDryRun(e.target.checked);
                setReport(null);
              }}
              className="accent-[#016f7c] mt-0.5 h-4 w-4 shrink-0 rounded"
            />
            <div>
              <p className="text-sm font-medium">
                {h?.importDryRun ?? 'Preview only (dry-run)'}
              </p>
              <p className="text-muted-foreground text-xs">
                {h?.importDryRunHint ??
                  'Validate and preview without writing to the database.'}
              </p>
            </div>
          </label>

          {/* Error banner */}
          {importError && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
              <AlertCircle className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-destructive leading-snug">{importError}</p>
            </div>
          )}

          {/* Result summary */}
          {report && (
            <div className="space-y-2.5">
              {/* Dry-run notice */}
              {report.dryRun && (
                <div className="rounded-lg border border-amber-300/50 bg-amber-50/60 px-3 py-2 text-xs font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-900/20 dark:text-amber-400">
                  {h?.importResultDryRun ?? 'Dry-run — no data was written'}
                </div>
              )}

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2">
                <StatBadge
                  icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                  label={h?.importResultCreated ?? 'Created'}
                  value={report.created}
                  color="green"
                />
                <StatBadge
                  icon={<AlertCircle className="h-3.5 w-3.5" />}
                  label={h?.importResultSkipped ?? 'Skipped'}
                  value={report.skippedDuplicates}
                  color="amber"
                />
                <StatBadge
                  icon={<X className="h-3.5 w-3.5" />}
                  label={h?.importResultFailed ?? 'Failed'}
                  value={report.failed}
                  color="red"
                />
              </div>

              {/* Issues list */}
              {report.issues.length > 0 && (
                <div className="bg-muted/20 max-h-40 space-y-1 overflow-y-auto rounded-lg border p-2">
                  {report.issues.map((issue, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex gap-2 rounded px-2 py-1 text-xs',
                        issue.level === 'error'
                          ? 'bg-destructive/5 text-destructive'
                          : 'bg-amber-50/60 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
                      )}
                    >
                      <span className="shrink-0 font-mono">
                        row {issue.sourceRow}
                      </span>
                      <span className="min-w-0 break-words">{issue.reason}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Global warnings */}
              {report.globalWarnings.length > 0 && (
                <div className="bg-muted/20 max-h-28 space-y-1 overflow-y-auto rounded-lg border p-2">
                  {report.globalWarnings.map((w, i) => (
                    <p
                      key={i}
                      className="text-muted-foreground break-words text-xs"
                    >
                      {w}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-muted/20 flex shrink-0 flex-col-reverse gap-2 border-t px-4 py-3 sm:flex-row sm:justify-end sm:gap-2 sm:px-6 sm:py-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isImporting}
            className="w-full sm:w-auto sm:min-w-[6rem]"
          >
            {isImporting
              ? (h?.importRunning ?? 'Running…')
              : (h?.importClose ?? 'Close')}
          </Button>
          <Button
            onClick={handleImport}
            disabled={!canImport}
            className="group relative w-full overflow-hidden bg-[#016f7c] text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#015862] hover:shadow-lg active:translate-y-0 sm:w-auto sm:min-w-[10rem]"
          >
            {isImporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
            )}
            {isImporting
              ? (h?.importing ?? 'Importing…')
              : (h?.importButton ?? 'Run Import')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Sub-component ──────────────────────────────────────────────────────────

function StatBadge({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'green' | 'amber' | 'red';
}) {
  const colorMap = {
    green: 'border-green-200 bg-green-50/60 text-green-700 dark:border-green-700/30 dark:bg-green-900/20 dark:text-green-400',
    amber: 'border-amber-200 bg-amber-50/60 text-amber-700 dark:border-amber-700/30 dark:bg-amber-900/20 dark:text-amber-400',
    red: 'border-red-200 bg-red-50/60 text-red-700 dark:border-red-700/30 dark:bg-red-900/20 dark:text-red-400',
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-center',
        colorMap[color],
      )}
    >
      {icon}
      <span className="text-lg font-bold tabular-nums leading-none">
        {value}
      </span>
      <span className="text-[10px] font-medium uppercase tracking-wide opacity-80">
        {label}
      </span>
    </div>
  );
}
