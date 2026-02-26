import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Placeholder } from '../types';
import { CardPlaceholder } from './CardPlaceholder';
import { cn } from '../lib/utils';

interface GridCanvasProps {
  cards: Placeholder[];
  cellSize: number;
  width: number;
  height: number;
  onUpdateCard: (id: string, updates: Partial<Placeholder>) => void;
  onDeleteCard: (id: string) => void;
  selectedIds: Set<string>;
  activeId: string | null;
  dragDelta: { x: number, y: number } | null;
  onCardClick: (id: string, ctrlKey: boolean) => void;
  onClearSelection: () => void;
  onSetSelection: (ids: Set<string>) => void;
}

export function GridCanvas({ 
  cards, cellSize, width, height, onUpdateCard, onDeleteCard,
  selectedIds, activeId, dragDelta, onCardClick, onClearSelection, onSetSelection
}: GridCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'grid-canvas',
  });

  const [selectionBox, setSelectionBox] = useState<{startX: number, startY: number, currentX: number, currentY: number} | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      if (!e.ctrlKey && !e.metaKey) {
        onClearSelection();
      }
      
      // Disable marquee selection on touch devices to allow native scrolling
      if (e.pointerType === 'touch') return;

      e.currentTarget.setPointerCapture(e.pointerId);
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setSelectionBox({ startX: x, startY: y, currentX: x, currentY: y });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (selectionBox) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setSelectionBox(prev => prev ? { ...prev, currentX: x, currentY: y } : null);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (selectionBox) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      
      const left = Math.min(selectionBox.startX, selectionBox.currentX);
      const right = Math.max(selectionBox.startX, selectionBox.currentX);
      const top = Math.min(selectionBox.startY, selectionBox.currentY);
      const bottom = Math.max(selectionBox.startY, selectionBox.currentY);

      const newSelected = new Set(selectedIds);
      if (!e.ctrlKey && !e.metaKey) {
        newSelected.clear();
      }

      cards.forEach(card => {
        const cardLeft = card.x * cellSize;
        const cardTop = card.y * cellSize;
        const cardRight = cardLeft + (card.rotationMode === 'horizontal' ? card.height : card.width) * cellSize;
        const cardBottom = cardTop + (card.rotationMode === 'horizontal' ? card.width : card.height) * cellSize;

        if (cardLeft < right && cardRight > left && cardTop < bottom && cardBottom > top) {
          newSelected.add(card.id);
        }
      });

      onSetSelection(newSelected);
      setSelectionBox(null);
    }
  };

  return (
    <div
      ref={setNodeRef}
      id="grid-canvas"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={cn(
        "relative bg-slate-50 border-2 border-slate-200 rounded-2xl overflow-hidden shadow-inner transition-colors",
        isOver && "bg-indigo-50/50 border-indigo-200"
      )}
      style={{
        width: width * cellSize,
        height: height * cellSize,
      }}
    >
      {cards.map((card) => (
        <CardPlaceholder
          key={card.id}
          card={card}
          cellSize={cellSize}
          isSelected={selectedIds.has(card.id)}
          isActive={activeId === card.id}
          dragDelta={dragDelta}
          onUpdate={onUpdateCard}
          onDelete={onDeleteCard}
          onClick={(e) => onCardClick(card.id, e.ctrlKey || e.metaKey)}
        />
      ))}
      
      {selectionBox && (
        <div 
          className="absolute border-2 border-indigo-500 bg-indigo-500/20 pointer-events-none z-[1000]"
          style={{
            left: Math.min(selectionBox.startX, selectionBox.currentX),
            top: Math.min(selectionBox.startY, selectionBox.currentY),
            width: Math.abs(selectionBox.currentX - selectionBox.startX),
            height: Math.abs(selectionBox.currentY - selectionBox.startY),
          }}
        />
      )}
    </div>
  );
}
