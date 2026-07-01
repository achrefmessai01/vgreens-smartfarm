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
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SortableGridItem {
  id: string;
  node: React.ReactNode;
}

interface SortableGridProps {
  /** Items to render, already ordered and filtered to the visible set. */
  items: SortableGridItem[];
  /** Tailwind grid classes for the container (same in view and edit mode). */
  className: string;
  /** When true, items become draggable to reorder. */
  editMode?: boolean;
  /** Called with the new order of the *visible* ids after a drag. */
  onReorder?: (orderedVisibleIds: string[]) => void;
}

function SortableCell({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        // `touch-none` stops the browser hijacking the drag as a scroll on
        // touch devices. The whole cell is the drag handle in edit mode.
        'relative cursor-grab touch-none rounded-xl outline-dashed outline-1 outline-transparent active:cursor-grabbing',
        'ring-primary/40 hover:outline-border',
        isDragging && 'z-10 opacity-80 shadow-lg ring-2',
      )}
      {...attributes}
      {...listeners}
    >
      <span
        aria-hidden
        className="bg-background/90 text-muted-foreground pointer-events-none absolute top-2 right-2 z-10 rounded-md border p-1 shadow-sm"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </span>
      {children}
    </div>
  );
}

/**
 * Grid that renders `items` in the given layout. In edit mode it wraps them in
 * a dnd-kit sortable context so each cell can be dragged to reorder; otherwise
 * it renders the exact same markup as the plain grid it replaces.
 */
export function SortableGrid({
  items,
  className,
  editMode = false,
  onReorder,
}: SortableGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const ids = items.map((item) => item.id);
      const oldIndex = ids.indexOf(String(active.id));
      const newIndex = ids.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;
      onReorder?.(arrayMove(ids, oldIndex, newIndex));
    },
    [items, onReorder],
  );

  if (!editMode) {
    return (
      <div className={className}>
        {items.map((item) => (
          <div key={item.id}>{item.node}</div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={rectSortingStrategy}
      >
        <div className={className}>
          {items.map((item) => (
            <SortableCell key={item.id} id={item.id}>
              {item.node}
            </SortableCell>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
