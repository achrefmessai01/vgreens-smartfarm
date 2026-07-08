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
  /** Items to render, already ordered and filtered. */
  items: SortableGridItem[];

  /** Tailwind classes for the grid container. */
  className: string;

  /** Enables drag-and-drop reordering. */
  editMode?: boolean;

  /** Called with the reordered IDs of the visible cards. */
  onReorder?: (orderedVisibleIds: string[]) => void;
}

interface SortableCellProps {
  id: string;
  children: React.ReactNode;
  disabled: boolean;
}

function SortableCell({ id, children, disabled }: SortableCellProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    willChange: transform ? 'transform' : undefined,
  };

  if (disabled) {
    return <div>{children}</div>;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        /**
         * `group` allows the drag indicator to react when the user
         * hovers anywhere over the entire card.
         */
        'group relative rounded-2xl',

        /**
         * Keep the title close to the drag indicator.
         */
        '[&_[data-dashboard-card-header]]:pl-10',
        'sm:[&_[data-dashboard-card-header]]:pl-11',

        /**
         * Subtle feedback for the whole card.
         * No scaling is used here because that could conflict with
         * the transform supplied by dnd-kit.
         */
        'ring-1 ring-transparent',
        'transition-[filter,box-shadow] duration-200 ease-out',
        'hover:ring-border/40 hover:drop-shadow-md',

        /**
         * Appearance while dragging.
         */
        isDragging && [
          'z-50',
          'opacity-90',
          'ring-border/60',
          'drop-shadow-xl',
        ],
      )}
    >
      <button
        type="button"
        aria-label="Drag card to reorder"
        title="Drag to reorder"
        {...attributes}
        {...listeners}
        className={cn(
          /**
           * Named group for stronger animation when the user hovers
           * directly over the drag indicator.
           */
          'group/drag absolute top-4 left-3 z-20',
          'sm:top-5 sm:left-4',

          /**
           * Comfortable interaction area without making the control
           * look like a normal button.
           */
          'inline-flex h-7 w-7 shrink-0 items-center justify-center',
          'appearance-none border-0 bg-transparent p-0 shadow-none',

          /**
           * Drag behavior.
           */
          'cursor-grab touch-none select-none',
          'active:cursor-grabbing',

          /**
           * Default appearance.
           */
          'text-muted-foreground/45',

          /**
           * Hovering anywhere over the card brightens the indicator.
           */
          'transition-colors duration-200 ease-out',
          'group-hover:text-primary/80',

          /**
           * Directly hovering over the indicator makes it stronger.
           */
          'hover:text-primary',

          /**
           * Keyboard interaction.
           */
          'focus-visible:text-primary',
          'focus-visible:outline-none',

          /**
           * Dragging state.
           */
          isDragging && ['cursor-grabbing', 'text-primary'],
        )}
      >
        {/* Animated glow behind the drag icon */}
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-1 rounded-full',
            'bg-primary/25 scale-75 opacity-0 blur-md',
            'transition-[transform,opacity] duration-300 ease-out',

            /**
             * Soft glow when hovering anywhere over the card.
             */
            'group-hover:scale-125',
            'group-hover:opacity-50',

            /**
             * Stronger glow when directly hovering over the indicator.
             */
            'group-hover/drag:scale-150',
            'group-hover/drag:opacity-100',

            /**
             * Keyboard focus gets the stronger animation.
             */
            'group-focus-visible/drag:scale-150',
            'group-focus-visible/drag:opacity-100',

            isDragging && ['scale-150', 'opacity-100'],
          )}
        />

        <GripVertical
          aria-hidden="true"
          strokeWidth={2.25}
          className={cn(
            'relative z-10 h-4 w-4 origin-center',
            'transition-[transform,filter] duration-200 ease-out',

            /**
             * Animation when hovering anywhere over the card.
             */
            'group-hover:scale-110',
            'group-hover:drop-shadow-[0_0_3px_currentColor]',

            /**
             * Stronger animation when hovering directly over the grip.
             */
            'group-hover/drag:-translate-y-px',
            'group-hover/drag:scale-125',
            'group-hover/drag:drop-shadow-[0_0_5px_currentColor]',

            /**
             * Keyboard focus.
             */
            'group-focus-visible/drag:-translate-y-px',
            'group-focus-visible/drag:scale-125',
            'group-focus-visible/drag:drop-shadow-[0_0_5px_currentColor]',

            /**
             * Keep the animation active while dragging.
             */
            isDragging && [
              '-translate-y-px',
              'scale-125',
              'drop-shadow-[0_0_5px_currentColor]',
            ],
          )}
        />
      </button>

      {children}
    </div>
  );
}

export function SortableGrid({
  items,
  className,
  editMode = false,
  onReorder,
}: SortableGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const itemIds = React.useMemo(() => items.map((item) => item.id), [items]);

  const handleDragEnd = React.useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = itemIds.indexOf(String(active.id));
      const newIndex = itemIds.indexOf(String(over.id));

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      onReorder?.(arrayMove(itemIds, oldIndex, newIndex));
    },
    [itemIds, onReorder],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={itemIds} strategy={rectSortingStrategy}>
        <div className={className}>
          {items.map((item) => (
            <SortableCell key={item.id} id={item.id} disabled={!editMode}>
              {item.node}
            </SortableCell>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
