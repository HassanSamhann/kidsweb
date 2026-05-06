import React from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle } from 'lucide-react';
import { Story } from '../../types';
import { cn } from '../../lib/utils';

interface StoryCardProps {
  story: Story;
  isCompleted: boolean;
}

export function StoryCard({ story, isCompleted }: StoryCardProps) {
  return (
    <Link href={`/stories/${story.id}`} className="block">
      <div className={cn(
        "relative overflow-hidden rounded-3xl p-6 transition-all duration-300 transform hover:scale-105 active:scale-95 border-4",
        isCompleted 
          ? "bg-sky-light border-sky-light hover:border-sky" 
          : "bg-white border-white hover:border-primary-light hover:shadow-lg shadow-sm"
      )}>
        {/* Completed Badge */}
        {isCompleted && (
          <div className="absolute top-4 left-4 bg-white rounded-full p-1 shadow-sm">
            <CheckCircle className="w-6 h-6 text-primary" />
          </div>
        )}
        
        <div className="flex items-start gap-4">
          <div className={cn(
            "p-4 rounded-2xl flex-shrink-0",
            isCompleted ? "bg-white" : "bg-primary-light/20"
          )}>
            <BookOpen className={cn(
              "w-8 h-8",
              isCompleted ? "text-sky" : "text-primary"
            )} />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">{story.title}</h3>
            <p className="text-gray-500 text-sm font-medium leading-relaxed line-clamp-2">
              {story.description}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
