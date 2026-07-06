'use client';

import * as React from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SortableEntryListProps {
  /** Stable per-entry ids (HarvestEntryData.uid), in display order. */
  ids: string[];
  /** When true the handles disappear and dragging is off (view mode / busy). */
  disabled?: boolean;
  /** aria-label for the per-entry drag handle. */
  dragHandleLabel: string;
  onReorder: (fromIndex: number, toIndex: number) => void;
  /**
   * Renders one entry card. `dragHandle` is a ready-made grip element carrying
   * the drag listeners — place it inside the card's header (null when
   * disabled). Unlike the dashboard's SortableGrid, the whole card can't be
   * the drag surface: it is full of form inputs.
   */
  renderEntry: (
    index: number,
    dragHandle: React.ReactNode,
  ) => React.ReactNode;
}

function SortableEntryItem({
  id,
  index,
  disabled,
  dragHandleLabel,
  renderEntry,
}: {
  id: string;
  index: number;
  disabled: boolean;
  dragHandleLabel: string;
  renderEntry: SortableEntryListProps['renderEntry'];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dragHandle = disabled ? null : (
    <button
      type="button"
      aria-label={dragHandleLabel}
      {...attributes}
      {...listeners}
      className={cn(
        // `touch-none` stops the browser hijacking the drag as a scroll on
        // touch devices (same as the dashboard grid).
        'text-muted-foreground hover:text-foreground -m-1 shrink-0 cursor-grab touch-none rounded-md p-1',
        'focus-visible:ring-ring/40 active:cursor-grabbing focus-visible:ring-2 focus-visible:outline-none',
      )}
    >
      <GripVertical className="h-4 w-4" aria-hidden="true" />
    </button>
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && 'relative z-10 rounded-xl opacity-80 shadow-lg')}
    >
      {renderEntry(index, dragHandle)}
    </div>
  );
}

/**
 * Vertical sortable list for the sidebar's harvest-entry cards. Drags reorder
 * the entries via a grip handle in each card header; the parent owns the
 * order (entries array) and receives from/to indices on drop.
 */
export function SortableEntryList({
  ids,
  disabled = false,
  dragHandleLabel,
  onReorder,
  renderEntry,
}: SortableEntryListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = ids.indexOf(String(active.id));
      const newIndex = ids.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;
      onReorder(oldIndex, newIndex);
    },
    [ids, onReorder],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {ids.map((id, index) => (
          <SortableEntryItem
            key={id}
            id={id}
            index={index}
            disabled={disabled}
            dragHandleLabel={dragHandleLabel}
            renderEntry={renderEntry}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}
