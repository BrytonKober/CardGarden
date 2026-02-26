import React from 'react';
import { Plus, Grid, Shuffle, Download, Upload, RotateCcw, Trash2, HelpCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Placeholder } from '../types';

interface SidebarProps {
  cards: Placeholder[];
  onAddCard: () => void;
  onFlipCards: () => void;
  onResetFlips: () => void;
  onClearAll: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  cellSize: number;
  onChangeCellSize: (size: number) => void;
  allowDuplicates: boolean;
  onToggleDuplicates: () => void;
  isFlipped: boolean;
  question: string;
  onChangeQuestion: (q: string) => void;
  isFlipping: boolean;
  onClose?: () => void;
}

export function Sidebar({
  cards,
  onAddCard,
  onFlipCards,
  onResetFlips,
  onClearAll,
  onExport,
  onImport,
  cellSize,
  onChangeCellSize,
  allowDuplicates,
  onToggleDuplicates,
  isFlipped,
  question,
  onChangeQuestion,
  isFlipping,
  onClose,
}: SidebarProps) {
  return (
    <div className="w-72 md:w-64 bg-white border-r border-slate-200 h-full flex flex-col shadow-sm z-10">
      <div className="p-6 border-b border-slate-100 flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="text-indigo-600">✧</span> Tarot Builder
          </h1>
          <p className="text-xs text-slate-500 mt-1">Design your custom spreads</p>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={onAddCard}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-xl font-medium transition-colors shadow-sm"
          >
            <Plus size={18} />
            Add Card
          </button>
        </div>

        {/* Question Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <HelpCircle size={14} /> Focus / Question
          </label>
          <textarea
            value={question}
            onChange={(e) => onChangeQuestion(e.target.value)}
            placeholder="What is your intention?"
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none h-20"
            disabled={isFlipped}
          />
          <button
            onClick={isFlipped ? onResetFlips : onFlipCards}
            disabled={isFlipping}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium transition-colors shadow-sm border mt-2",
              isFlipped 
                ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                : "bg-slate-900 text-white border-slate-900 hover:bg-slate-800 disabled:opacity-50"
            )}
          >
            {isFlipped ? <RotateCcw size={18} /> : <Shuffle size={18} className={isFlipping ? "animate-spin" : ""} />}
            {isFlipped ? "Reset Flips" : isFlipping ? "Drawing..." : "Flip / Draw Cards"}
          </button>
        </div>

        {/* Reading Summary */}
        {isFlipped && cards.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reading Summary</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {cards.map(card => (
                <div key={card.id} className="text-sm p-2 bg-slate-50 rounded-lg border border-slate-200 shadow-sm">
                  <div className="font-semibold text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">{card.label || 'Unlabeled Position'}</div>
                  <div className="text-slate-900 font-medium flex justify-between items-center">
                    <span>
                      {card.assignedCard?.name}
                      {card.orientation === 'reversed' && <span className="text-red-500 ml-1 text-xs font-bold">(Rev)</span>}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                      {card.assignedCard?.arcana === 'Major' ? 'Major' : card.assignedCard?.suit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Settings</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-600 flex items-center gap-2">
                <Grid size={16} className="text-slate-400" />
                Grid Size
              </label>
              <select
                value={cellSize}
                onChange={(e) => onChangeCellSize(Number(e.target.value))}
                className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 outline-none focus:border-indigo-500"
              >
                <option value={60}>Small</option>
                <option value={80}>Medium</option>
                <option value={100}>Large</option>
              </select>
            </div>

            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Allow Duplicates</span>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={allowDuplicates}
                  onChange={onToggleDuplicates}
                />
                <div className={cn(
                  "block w-10 h-6 rounded-full transition-colors",
                  allowDuplicates ? "bg-indigo-500" : "bg-slate-200"
                )}></div>
                <div className={cn(
                  "absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform",
                  allowDuplicates ? "transform translate-x-4" : ""
                )}></div>
              </div>
            </label>
          </div>
        </div>

        {/* Data Management */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Data</h3>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onExport}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Download size={14} /> Export
            </button>
            <label className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
              <Upload size={14} /> Import
              <input type="file" accept=".json" className="hidden" onChange={onImport} />
            </label>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={onClearAll}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={16} />
          Clear All
        </button>
      </div>
    </div>
  );
}
