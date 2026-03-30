'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ErrorReport, ReportStatus } from '@/generated/graphql';
import { ErrorReportStatusBadge } from './error-report-status-badge';

import { useState } from 'react';
import { Check, X } from 'lucide-react';

interface ErrorReportQuickActionsProps {
  report: ErrorReport;
  onStatusUpdate: (id: string, status: ReportStatus) => Promise<void>;
  isUpdating?: boolean;
}

export function ErrorReportQuickActions({
  report,
  onStatusUpdate,
  isUpdating = false,
}: ErrorReportQuickActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(report.status);

  const handleUpdate = async () => {
    if (selectedStatus !== report.status) {
      await onStatusUpdate(report.id, selectedStatus);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSelectedStatus(report.status);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Select
          value={selectedStatus}
          onValueChange={(value: ReportStatus) => setSelectedStatus(value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ReportStatus.Open}>Open</SelectItem>
            <SelectItem value={ReportStatus.InProgress}>In Progress</SelectItem>
            <SelectItem value={ReportStatus.Resolved}>Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleUpdate}
          disabled={isUpdating}
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          disabled={isUpdating}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="rounded p-1 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
      disabled={isUpdating}
    >
      <ErrorReportStatusBadge status={report.status} />
    </button>
  );
}
