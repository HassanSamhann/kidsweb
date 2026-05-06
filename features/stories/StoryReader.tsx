import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Story } from '../../types';
import { Button } from '../../components/ui/Button';

interface StoryReaderProps {
  story: Story;
  onFinish: () => void;
}

export function StoryReader({ story, onFinish }: StoryReaderProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = story.content.length;

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    } else {
      onFinish();
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] p-6 shadow-xl border-4 border-primary/20">
      {/* Progress Bar */}
      <div className="w-full bg-gray-100 rounded-full h-3 mb-8 overflow-hidden">
        <div 
          className="bg-primary h-3 rounded-full transition-all duration-500" 
          style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-grow flex items-center justify-center py-8">
        <p className="text-2xl md:text-3xl font-bold text-gray-800 leading-loose text-center transition-opacity duration-300">
          {story.content[currentPage]}
        </p>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mt-8">
        <Button 
          variant="outline" 
          size="lg" 
          onClick={handlePrev} 
          disabled={currentPage === 0}
          className="rounded-full w-16 h-16 p-0"
        >
          <ChevronRight className="w-8 h-8" />
        </Button>
        
        <span className="text-lg font-bold text-gray-500">
          {currentPage + 1} / {totalPages}
        </span>
        
        <Button 
          variant="primary" 
          size="lg" 
          onClick={handleNext}
          className="rounded-full w-16 h-16 p-0"
        >
          {currentPage === totalPages - 1 ? (
            <span className="text-xl">سؤال</span>
          ) : (
            <ChevronLeft className="w-8 h-8" />
          )}
        </Button>
      </div>
    </div>
  );
}
