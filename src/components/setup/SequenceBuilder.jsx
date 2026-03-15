import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  GripVertical, Plus, Trash2, Settings, ChevronRight, AlertCircle
} from 'lucide-react';
import useGameStore from '../../store/gameStore';
import useUIStore from '../../store/uiStore';
import { EVENT_META, EVENT_DEFAULTS } from '../../utils/eventTypes';

function EventLibraryCard({ type, meta, onAdd, disabled }) {
  const Icon = meta.icon;
  return (
    <motion.button
      onClick={() => onAdd(type)}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: '100%',
        textAlign: 'left',
        color: 'var(--text-primary)',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.2s',
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: `${meta.color}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={18} style={{ color: meta.color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{meta.label}</div>
        <div style={{
          fontSize: 11, color: 'var(--text-muted)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {meta.description}
        </div>
      </div>
      <Plus size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
    </motion.button>
  );
}

function SequenceItem({ event, index, onConfigure, onRemove }) {
  const meta = EVENT_META[event.type] || {};
  const Icon = meta.icon;
  const questionCount = event.questions?.length || 0;

  return (
    <Draggable draggableId={event.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 14px',
            background: snapshot.isDragging ? 'var(--bg-tertiary)' : 'var(--bg-card)',
            border: snapshot.isDragging ? '1px solid var(--accent)' : '1px solid var(--border)',
            borderRadius: 10,
            marginBottom: 8,
            transition: snapshot.isDragging ? 'none' : 'all 0.2s',
            boxShadow: snapshot.isDragging ? '0 8px 32px rgba(0,0,0,0.3)' : 'none',
            ...provided.draggableProps.style,
          }}
        >
          {/* Drag Handle */}
          <div
            {...provided.dragHandleProps}
            style={{
              cursor: 'grab',
              color: 'var(--text-muted)',
              display: 'flex',
              padding: '4px 2px',
            }}
          >
            <GripVertical size={16} />
          </div>

          {/* Event Number */}
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: `${meta.color}25`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: meta.color,
            flexShrink: 0,
          }}>
            {index + 1}
          </div>

          {/* Icon */}
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `${meta.color}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon size={16} style={{ color: meta.color }} />
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              {event.config?.name || meta.label}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {questionCount} question{questionCount !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={() => onConfigure(event.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '6px 10px', borderRadius: 6,
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--border)',
              color: 'var(--accent)',
              cursor: 'pointer',
              fontSize: 12, fontWeight: 500,
              transition: 'all 0.15s',
            }}
          >
            <Settings size={13} />
            Configure
          </button>

          <button
            onClick={() => onRemove(event.id)}
            style={{
              display: 'flex', alignItems: 'center',
              padding: 6, borderRadius: 6,
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}
    </Draggable>
  );
}

export default function SequenceBuilder() {
  const gameData = useGameStore((s) => s.gameData);
  const addEvent = useGameStore((s) => s.addEvent);
  const removeEvent = useGameStore((s) => s.removeEvent);
  const reorderEvents = useGameStore((s) => s.reorderEvents);
  const setActiveEvent = useUIStore((s) => s.setActiveEvent);

  const sequence = gameData?.sequence || [];
  const maxEvents = 10;
  const canAdd = sequence.length < maxEvents;

  const handleAddEvent = (type) => {
    if (!canAdd) return;
    const defaults = EVENT_DEFAULTS[type] || {};
    const newEvent = addEvent(type, defaults.config);
  };

  const handleConfigure = (eventId) => {
    setActiveEvent(eventId);
  };

  const handleRemove = (eventId) => {
    removeEvent(eventId);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;
    reorderEvents(result.source.index, result.destination.index);
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      overflow: 'hidden',
    }}>
      {/* Left: Event Library */}
      <div style={{
        width: 280,
        minWidth: 280,
        height: '100%',
        borderRight: '1px solid var(--border)',
        padding: '24px 16px',
        overflow: 'auto',
        background: 'var(--bg-secondary)',
      }}>
        <h3 style={{
          fontSize: 13, fontWeight: 600, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16,
        }}>
          Event Library
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Object.entries(EVENT_META).map(([type, meta]) => (
            <EventLibraryCard
              key={type}
              type={type}
              meta={meta}
              onAdd={handleAddEvent}
              disabled={!canAdd}
            />
          ))}
        </div>

        <div style={{
          marginTop: 16, padding: '10px 12px', borderRadius: 8,
          background: 'var(--bg-card)',
          fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5,
        }}>
          Click any event type to add it to your game sequence. Max {maxEvents} events per game.
        </div>
      </div>

      {/* Right: Game Sequence */}
      <div style={{
        flex: 1,
        height: '100%',
        padding: '24px 32px',
        overflow: 'auto',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 20,
        }}>
          <div>
            <h3 style={{
              fontSize: 20, fontWeight: 700, color: 'var(--text-primary)',
            }}>
              Game Sequence
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              {sequence.length} of {maxEvents} events • Drag to reorder
            </p>
          </div>
        </div>

        {sequence.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '60px 20px',
              background: 'var(--bg-card)',
              border: '2px dashed var(--border)',
              borderRadius: 12,
              textAlign: 'center',
            }}
          >
            <AlertCircle size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
              No events added yet
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 300 }}>
              Click event types from the library on the left to build your quiz sequence
            </p>
          </motion.div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sequence">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    minHeight: 100,
                    borderRadius: 10,
                    padding: snapshot.isDraggingOver ? 4 : 0,
                    background: snapshot.isDraggingOver ? 'var(--bg-card)' : 'transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  <AnimatePresence>
                    {sequence.map((event, index) => (
                      <SequenceItem
                        key={event.id}
                        event={event}
                        index={index}
                        onConfigure={handleConfigure}
                        onRemove={handleRemove}
                      />
                    ))}
                  </AnimatePresence>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}
