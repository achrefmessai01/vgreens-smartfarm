'use client';

import { Button } from '@/components/ui/button';
import { WriteActionButton } from '@/components/ui/write-action-button';
import { useI18n } from '@/i18n';
import { Trash2 } from 'lucide-react';

interface SensorConfigFormFooterProps {
  /** True when the sensor already has a saved override (shows the reset button). */
  hasConfig: boolean;
  /** Saved override id, forwarded to the delete callback when Reset is clicked. */
  configId: string | undefined;
  saving: boolean;
  /** Save + delete are both disabled while `disableSave` is true. */
  disableSave: boolean;
  onDelete: (id: string) => Promise<void>;
  onCancel: () => void;
  /** Called after a successful reset to close the sidebar. */
  onClose: () => void;
}

/**
 * Footer row for the sensor-config sidebar: an optional Reset-to-defaults
 * button on the left (only when a saved override exists) and the
 * Cancel / Save pair on the right. Extracted so the parent form shell can
 * stay under the repo-wide 150-line component limit.
 */
export function SensorConfigFormFooter({
  hasConfig,
  configId,
  saving,
  disableSave,
  onDelete,
  onCancel,
  onClose,
}: SensorConfigFormFooterProps) {
  const { t } = useI18n();
  const sc = t.pages.admin.tenants.sensorConfig;

  return (
    <div className="flex items-center justify-between">
      {hasConfig && configId ? (
        <WriteActionButton
          type="button"
          variant="ghost"
          size="sm"
          disabled={saving}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
          onClick={async () => {
            await onDelete(configId);
            onClose();
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
          {sc.resetToDefaults}
        </WriteActionButton>
      ) : (
        <span />
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={saving}
        >
          {sc.cancel}
        </Button>
        <WriteActionButton
          type="submit"
          size="sm"
          disabled={disableSave}
          className="min-w-16"
          aria-disabled={disableSave}
        >
          {saving ? sc.saving : sc.save}
        </WriteActionButton>
      </div>
    </div>
  );
}
