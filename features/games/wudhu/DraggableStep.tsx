import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface DraggableStepProps {
  id: string;
  text: string;
  index: number;
}

export function DraggableStep({ id, text, index }: DraggableStepProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border-2 border-gray-100 touch-none",
        isDragging ? "opacity-50 border-primary scale-105 z-50 shadow-xl" : "hover:border-primary-light"
      )}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 bg-gray-50 rounded-xl hover:bg-primary-light/20 transition-colors"
      >
        <GripVertical className="text-gray-400" />
      </div>
      
      <div className="w-8 h-8 rounded-full bg-primary-light/30 flex items-center justify-center font-bold text-primary-dark">
        {index + 1}
      </div>
      
      <span className="text-lg font-bold text-gray-700 select-none">
        {text}
      </span>
    </div>
  );
}
