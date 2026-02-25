import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Placeholder } from '../types';
import { cn } from '../lib/utils';
import { Settings, Trash2, ArrowUp, ArrowDown, RotateCw } from 'lucide-react';
import { motion } from 'motion/react';

interface CardPlaceholderProps {
  key?: string;
  card: Placeholder;
  cellSize: number;
  isSelected: boolean;
  isActive: boolean;
  dragDelta: { x: number, y: number } | null;
  onUpdate: (id: string, updates: Partial<Placeholder>) => void;
  onDelete: (id: string) => void;
  onClick: (e: React.MouseEvent) => void;
}

export function CardPlaceholder({ 
  card, cellSize, isSelected, isActive, dragDelta, onUpdate, onDelete, onClick 
}: CardPlaceholderProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: card,
  });

  const [showMenu, setShowMenu] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelText, setLabelText] = useState(card.label || '');

  let finalX = card.x * cellSize;
  let finalY = card.y * cellSize;

  if (isSelected && !isActive && dragDelta) {
    finalX += dragDelta.x;
    finalY += dragDelta.y;
  }

  const style = {
    transform: CSS.Translate.toString(transform),
    left: finalX,
    top: finalY,
    width: card.rotationMode === 'horizontal' ? card.height * cellSize : card.width * cellSize,
    height: card.rotationMode === 'horizontal' ? card.width * cellSize : card.height * cellSize,
    zIndex: isDragging || (isSelected && dragDelta) ? 999 : (showMenu ? 800 : card.zIndex),
  };

  const handleLabelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(card.id, { label: labelText });
    setIsEditingLabel(false);
  };

  const isFlipped = card.flipped && card.assignedCard;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "absolute touch-none group",
        isDragging ? "opacity-80 cursor-grabbing" : "cursor-grab"
      )}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      <div 
        className={cn(
          "relative w-full h-full rounded-xl border-2 transition-all duration-300",
          isFlipped ? "border-indigo-300 bg-white shadow-md" : "border-dashed border-slate-300 bg-slate-50/50",
          (isDragging || (isSelected && dragDelta)) && "shadow-xl border-indigo-400 bg-indigo-50/50",
          isSelected && !dragDelta && "ring-4 ring-indigo-400 border-indigo-400"
        )}
        {...listeners}
        {...attributes}
        onClick={onClick}
      >
        {isFlipped ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
            <motion.div
              initial={{ rotateY: 90 }}
              animate={{ 
                rotateY: 0,
                rotateZ: card.orientation === 'reversed' ? 180 : 0 
              }}
              transition={{ duration: 0.5 }}
              className="w-full h-full flex flex-col items-center justify-center"
            >
              <div className="text-xs font-semibold text-indigo-900 mb-1">{card.assignedCard?.arcana}</div>
              <div className="text-sm font-bold text-slate-800">{card.assignedCard?.name}</div>
              {card.orientation === 'reversed' && <div className="text-xs text-red-500 mt-1 font-medium">Reversed</div>}
              {card.orientation === 'sideways' && <div className="text-xs text-amber-500 mt-1 font-medium">Sideways</div>}
            </motion.div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
            <div className="w-12 h-16 border-2 border-slate-200 rounded-md flex items-center justify-center bg-slate-100">
              <span className="text-2xl opacity-50">✧</span>
            </div>
          </div>
        )}
      </div>

      {/* Label Display */}
      {card.label && !isEditingLabel && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max max-w-[200%] text-center pointer-events-none z-10">
          <span className="inline-block bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-bold text-slate-700 shadow-sm border border-slate-200/50 truncate">
            {card.label}
          </span>
        </div>
      )}

      {/* Context Menu */}
      {showMenu && !isDragging && !card.flipped && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-2 z-50">
          <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-1 flex items-center gap-1">
            <button
              onClick={() => setIsEditingLabel(true)}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600"
              title="Edit Label"
            >
              <Settings size={14} />
            </button>
            <button
              onClick={() => onUpdate(card.id, { rotationMode: card.rotationMode === 'vertical' ? 'horizontal' : 'vertical' })}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600"
              title="Toggle Rotation"
            >
              <RotateCw size={14} />
            </button>
            <button
              onClick={() => onUpdate(card.id, { zIndex: card.zIndex + 1 })}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600"
              title="Bring Forward"
            >
              <ArrowUp size={14} />
            </button>
            <button
              onClick={() => onUpdate(card.id, { zIndex: Math.max(0, card.zIndex - 1) })}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600"
              title="Send Backward"
            >
              <ArrowDown size={14} />
            </button>
            <div className="w-px h-4 bg-slate-200 mx-1" />
            <button
              onClick={() => onDelete(card.id)}
              className="p-1.5 hover:bg-red-50 rounded text-red-500"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Label Editor */}
      {isEditingLabel && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-white p-2 rounded-lg shadow-xl border border-slate-200">
          <form onSubmit={handleLabelSubmit} className="flex gap-2">
            <input
              type="text"
              value={labelText}
              onChange={(e) => setLabelText(e.target.value)}
              placeholder="e.g. Past, Present..."
              className="text-sm border border-slate-300 rounded px-2 py-1 outline-none focus:border-indigo-500"
              autoFocus
              onBlur={handleLabelSubmit}
            />
          </form>
        </div>
      )}
    </div>
  );
}
