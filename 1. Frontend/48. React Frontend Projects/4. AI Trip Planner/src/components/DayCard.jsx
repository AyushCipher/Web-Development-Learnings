import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDispatch } from 'react-redux';
import { reorderStops } from '../store/itinerarySlice.js';
import StopCard from './StopCard.jsx';

function SortableStop({ stop, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
    position: 'relative',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <StopCard
        stop={stop}
        onRemove={onRemove}
        dragHandleProps={listeners}
      />
    </div>
  );
}

export default function DayCard({ day, onRemoveStop }) {
  const [expanded, setExpanded] = useState(true);
  const dispatch = useDispatch();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = day.stops.findIndex((s) => s.id === active.id);
    const newIndex = day.stops.findIndex((s) => s.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      dispatch(reorderStops({ dayId: day.id, oldIndex, newIndex }));
    }
  };

  const handleRemove = (stopId) => {
    onRemoveStop(day.id, stopId);
  };

  const stopIds = day.stops ? day.stops.map((s) => s.id) : [];

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
      <div
        className="flex cursor-pointer select-none items-center justify-between gap-4 bg-sand/50 px-4 py-3 transition hover:bg-sand sm:px-6 sm:py-4"
        onClick={toggleExpand}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpand();
          }
        }}
      >
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-pine text-sm font-bold text-white">{day.dayNumber}</div>
          <h2 className="font-display truncate text-lg font-semibold text-ink sm:text-xl">{day.title}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <span className="text-sm text-ink/60">
            {day.stops?.length || 0} stops
          </span>
          <span
            className={`text-xs text-ink/60 transition-transform ${
              expanded ? 'rotate-180' : ''
            }`}
          >
            ▼
          </span>
        </div>
      </div>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ${
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="bg-paper/60 px-4 py-4 sm:px-6 sm:pb-6" data-day-id={day.id}>
            {!day.stops || day.stops.length === 0 ? (
              <p className="rounded-xl border border-dashed border-ink/20 bg-white px-4 py-6 text-center text-sm italic text-ink/60">
                No stops planned for this day.
              </p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={stopIds}
                  strategy={verticalListSortingStrategy}
                >
                  {day.stops.map((stop) => (
                    <SortableStop
                      key={stop.id}
                      stop={stop}
                      onRemove={handleRemove}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
