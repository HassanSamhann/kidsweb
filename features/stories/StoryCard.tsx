import React from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle, ChevronRight } from 'lucide-react';
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
        "relative overflow-hidden rounded-3xl p-6 transition-all duration-300 transform hover:-translate-y-1 bg-[#1e2329] border border-[#2d3748] hover:border-orange-400/50 shadow-sm",
        isCompleted && "bg-emerald-900/10 border-emerald-500/20"
      )}>
        {/* Completed Badge */}
        {isCompleted && (
          <div className="absolute top-4 left-4 bg-emerald-500/20 rounded-full p-1 border border-emerald-500/30">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
        )}
        
        <div className="flex items-center gap-6">
          <div className={cn(
            "p-5 rounded-2xl flex-shrink-0 transition-colors",
            isCompleted ? "bg-emerald-500/10" : "bg-orange-400/10"
          )}>
            <BookOpen className={cn(
              "w-8 h-8",
              isCompleted ? "text-emerald-400" : "text-orange-400"
            )} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-black text-white mb-2 truncate font-arabic">{story.title}</h3>
            <p className="text-gray-400 text-sm font-medium leading-relaxed line-clamp-1">
              {story.description}
            </p>
          </div>

          <div className="w-10 h-10 rounded-full border border-[#2d3748] flex items-center justify-center text-gray-500 group-hover:text-white transition-colors">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
