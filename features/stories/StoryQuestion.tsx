import React, { useState } from 'react';
import { Story } from '../../types';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

interface StoryQuestionProps {
  story: Story;
  onCorrectAnswer: () => void;
  onRetry?: () => void;
}

export function StoryQuestion({ story, onCorrectAnswer, onRetry }: StoryQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleSelect = (index: number) => {
    if (isChecking) return;
    setSelectedOption(index);
  };

  const handleCheck = () => {
    if (selectedOption === null) return;
    
    setIsChecking(true);
    const correct = selectedOption === story.question.correctAnswerIndex;
    setIsCorrect(correct);
    
    if (correct) {
      setTimeout(() => {
        onCorrectAnswer();
      }, 1000);
    }
  };

  const handleTryAgain = () => {
    setSelectedOption(null);
    setIsChecking(false);
    setIsCorrect(null);
    if (onRetry) onRetry();
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border-4 border-gold-light text-center h-full flex flex-col">
      <div className="flex-grow">
        <h3 className="text-2xl font-black text-primary-dark mb-8 leading-normal">
          {story.question.text}
        </h3>

        <div className="space-y-4">
          {story.question.options.map((option, index) => {
            const isSelected = selectedOption === index;
            const showCorrect = isChecking && index === story.question.correctAnswerIndex;
            const showWrong = isChecking && isSelected && !isCorrect;
            
            return (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                disabled={isChecking}
                className={cn(
                  "w-full p-4 rounded-2xl text-xl font-bold transition-all duration-300 border-4",
                  {
                    "bg-gray-50 border-gray-100 text-gray-700 hover:bg-gray-100 hover:border-gray-200": !isSelected && !isChecking,
                    "bg-sky-light border-sky text-sky-800 scale-105": isSelected && !isChecking,
                    "bg-primary-light border-primary text-primary-dark": showCorrect,
                    "bg-coral-light border-coral text-red-800": showWrong,
                    "opacity-50": isChecking && !isSelected && !showCorrect,
                  }
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        {!isChecking ? (
          <Button 
            fullWidth 
            size="lg" 
            disabled={selectedOption === null}
            onClick={handleCheck}
            className="text-xl"
          >
            تحقق من الإجابة
          </Button>
        ) : isCorrect ? (
          <div className="bg-primary/20 text-primary-dark font-black p-4 rounded-2xl animate-bounce">
            إجابة صحيحة! أحسنت يا بطل 🌟
          </div>
        ) : (
          <Button 
            fullWidth 
            size="lg" 
            variant="danger"
            onClick={handleTryAgain}
            className="text-xl"
          >
            حاول مرة أخرى
          </Button>
        )}
      </div>
    </div>
  );
}
