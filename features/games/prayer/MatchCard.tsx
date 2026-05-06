import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../../lib/utils';

interface MatchCardProps {
  id: string;
  text: string;
  isMatched: boolean;
  type: 'draggable' | 'droppable';
}

export function MatchCard({ id, text, isMatched, type }: MatchCardProps) {
  if (type === 'draggable') {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: `drag-${id}`,
      disabled: isMatched
    });

    const style = {
      transform: CSS.Translate.toString(transform),
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn(
          "p-4 rounded-2xl font-bold text-center transition-all touch-none select-none",
          isMatched 
            ? "bg-gray-100 text-gray-400 border-2 border-dashed border-gray-300 opacity-50"
            : "bg-white border-2 border-primary-light shadow-md text-primary-dark cursor-grab active:cursor-grabbing hover:border-primary hover:shadow-lg",
          isDragging && "scale-105 shadow-xl border-primary z-50 opacity-90"
        )}
      >
        {text}
      </div>
    );
  }

  // Droppable target
  const { setNodeRef, isOver } = useDroppable({
    id: `drop-${id}`,
    disabled: isMatched
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "p-4 rounded-2xl font-bold text-center min-h-[60px] flex items-center justify-center transition-all border-4",
        isMatched 
          ? "bg-primary-light/30 border-primary text-primary-dark shadow-inner"
          : "bg-gray-50 border-dashed border-gray-300 text-gray-500",
        isOver && !isMatched && "bg-sky-light border-sky text-sky-800 scale-105"
      )}
    >
      {isMatched ? text : 'ضع البطاقة هنا'}
    </div>
  );
}
