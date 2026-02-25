import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  useSensor,
  useSensors,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
  DragStartEvent,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { Menu } from 'lucide-react';

import { Placeholder, Spread, TarotCard } from './types';
import { TAROT_DECK } from './lib/deck';
import { createSecureRandom } from './lib/random';
import { Sidebar } from './components/Sidebar';
import { GridCanvas } from './components/GridCanvas';
import { cn } from './lib/utils';

const DEFAULT_CELL_SIZE = 80;
const GRID_WIDTH = 20;
const GRID_HEIGHT = 15;

export default function App() {
  const [cards, setCards] = useState<Placeholder[]>([]);
  const [cellSize, setCellSize] = useState(DEFAULT_CELL_SIZE);
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [isFlipping, setIsFlipping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dragDelta, setDragDelta] = useState<{x: number, y: number} | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleAddCard = () => {
    let startX = Math.floor(GRID_WIDTH / 2) - 1;
    let startY = Math.floor(GRID_HEIGHT / 2) - 1.5;

    const canvas = document.getElementById('grid-canvas');
    const main = document.getElementById('main-scroll-area');

    if (canvas && main) {
      const canvasRect = canvas.getBoundingClientRect();
      const mainRect = main.getBoundingClientRect();

      // Calculate the center of the visible area relative to the canvas
      const visibleCenterX = (mainRect.left + mainRect.width / 2) - canvasRect.left;
      const visibleCenterY = (mainRect.top + mainRect.height / 2) - canvasRect.top;

      startX = visibleCenterX / cellSize - 1;
      startY = visibleCenterY / cellSize - 1.5;

      // Keep within bounds
      startX = Math.max(0, Math.min(startX, GRID_WIDTH - 2));
      startY = Math.max(0, Math.min(startY, GRID_HEIGHT - 3));
    }

    // Add slight offset for multiple cards added in the same spot
    const offset = (cards.length % 5) * 0.5;

    const newCard: Placeholder = {
      id: uuidv4(),
      x: startX + offset,
      y: startY + offset,
      width: 2,
      height: 3,
      rotationMode: 'vertical',
      zIndex: cards.length,
      flipped: false,
    };
    setCards((prev) => [...prev, newCard]);
  };

  const handleUpdateCard = (id: string, updates: Partial<Placeholder>) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const handleDeleteCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveId(id);
    if (!selectedIds.has(id)) {
      setSelectedIds(new Set([id]));
    }
  };

  const handleDragMove = (event: DragMoveEvent) => {
    setDragDelta({ x: event.delta.x, y: event.delta.y });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    setDragDelta(null);
    const { delta } = event;

    setCards((prev) =>
      prev.map((c) => {
        if (selectedIds.has(c.id)) {
          let newX = c.x + delta.x / cellSize;
          let newY = c.y + delta.y / cellSize;
          newX = Math.max(0, Math.min(newX, GRID_WIDTH - (c.rotationMode === 'horizontal' ? c.height : c.width)));
          newY = Math.max(0, Math.min(newY, GRID_HEIGHT - (c.rotationMode === 'horizontal' ? c.width : c.height)));
          return { ...c, x: newX, y: newY };
        }
        return c;
      })
    );
  };

  const handleCardClick = (id: string, ctrlKey: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (ctrlKey) {
        if (next.has(id)) next.delete(id);
        else next.add(id);
      } else {
        next.clear();
        next.add(id);
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleSetSelection = (ids: Set<string>) => {
    setSelectedIds(ids);
  };

  const handleFlipCards = async () => {
    if (cards.length === 0) return;
    
    setIsFlipping(true);

    try {
      const secureRandom = await createSecureRandom(question);
      let availableDeck = [...TAROT_DECK];
      
      // If we don't allow duplicates and we need more cards than the deck has, we must allow duplicates
      const needsDuplicates = !allowDuplicates && cards.length > availableDeck.length;
      const useDuplicates = allowDuplicates || needsDuplicates;

      if (!useDuplicates) {
        availableDeck = secureRandom.shuffle(availableDeck);
      }

      const newCards = cards.map((card, index) => {
        let assignedCard: TarotCard;
        
        if (useDuplicates) {
          const randomIndex = secureRandom.nextInt(0, TAROT_DECK.length);
          assignedCard = TAROT_DECK[randomIndex];
        } else {
          assignedCard = availableDeck[index];
        }

        const orientation = card.rotationMode === 'horizontal' 
          ? 'sideways' 
          : (secureRandom.nextBoolean() ? 'upright' : 'reversed');

        return {
          ...card,
          assignedCard,
          orientation,
          flipped: true,
        };
      });

      setCards(newCards);
      setIsFlipped(true);
    } finally {
      setIsFlipping(false);
    }
  };

  const handleResetFlips = () => {
    setCards((prev) =>
      prev.map((c) => ({
        ...c,
        assignedCard: null,
        orientation: undefined,
        flipped: false,
      }))
    );
    setIsFlipped(false);
  };

  const handleClearAll = () => {
    setCards([]);
    setIsFlipped(false);
    setSelectedIds(new Set());
  };

  const handleExport = () => {
    const spread: Spread = {
      grid: { cellSize, width: GRID_WIDTH, height: GRID_HEIGHT },
      cards,
    };
    const blob = new Blob([JSON.stringify(spread, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tarot-spread.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const spread: Spread = JSON.parse(event.target?.result as string);
        setCellSize(spread.grid.cellSize || DEFAULT_CELL_SIZE);
        setCards(spread.cards || []);
        setIsFlipped(spread.cards?.some(c => c.flipped) || false);
        setSelectedIds(new Set());
      } catch (err) {
        console.error('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-100 overflow-hidden font-sans">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center z-20 shadow-sm shrink-0">
        <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="text-indigo-600">✧</span> Tarot Builder
        </h1>
        <button 
          onClick={() => setIsSidebarOpen(true)} 
          className="p-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 h-full",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar
          cards={cards}
          onAddCard={handleAddCard}
          onFlipCards={handleFlipCards}
          onResetFlips={handleResetFlips}
          onClearAll={handleClearAll}
          onExport={handleExport}
          onImport={handleImport}
          cellSize={cellSize}
          onChangeCellSize={setCellSize}
          allowDuplicates={allowDuplicates}
          onToggleDuplicates={() => setAllowDuplicates(!allowDuplicates)}
          isFlipped={isFlipped}
          question={question}
          onChangeQuestion={setQuestion}
          isFlipping={isFlipping}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      <main id="main-scroll-area" className="flex-1 overflow-auto p-4 md:p-8 flex items-start justify-start md:items-center md:justify-center relative z-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToWindowEdges]}
        >
          <GridCanvas
            cards={cards}
            cellSize={cellSize}
            width={GRID_WIDTH}
            height={GRID_HEIGHT}
            onUpdateCard={handleUpdateCard}
            onDeleteCard={handleDeleteCard}
            selectedIds={selectedIds}
            activeId={activeId}
            dragDelta={dragDelta}
            onCardClick={handleCardClick}
            onClearSelection={handleClearSelection}
            onSetSelection={handleSetSelection}
          />
        </DndContext>
      </main>
    </div>
  );
}
