'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageWrapper } from '../../../components/ui/PageWrapper';
import { StoryReader } from '../../../features/stories/StoryReader';
import { StoryQuestion } from '../../../features/stories/StoryQuestion';
import { RewardPopup } from '../../../components/feedback/RewardPopup';
import { Button } from '../../../components/ui/Button';
import { stories } from '../../../data/stories';
import { useProgress } from '../../../hooks/useProgress';
import { useRewards } from '../../../hooks/useRewards';
import { ChevronRight } from 'lucide-react';

type StoryState = 'reading' | 'question' | 'completed';

export default function SingleStoryPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [storyState, setStoryState] = useState<StoryState>('reading');
  
  const { addCompletedStory } = useProgress();
  const { showReward, rewardMessage, triggerReward } = useRewards();

  const story = stories.find(s => s.id === id);

  useEffect(() => {
    if (!story) {
      router.replace('/stories');
    }
  }, [story, router]);

  if (!story) return null;

  const handleFinishReading = () => {
    setStoryState('question');
  };

  const handleCorrectAnswer = () => {
    const isNew = addCompletedStory(story.id);
    if (isNew) {
      triggerReward('أحسنت! حصلت على نجمة لذكائك ⭐');
    }
    setStoryState('completed');
  };

  return (
    <PageWrapper withBottomNav={false} className="bg-sky-light/30">
      <div className="p-4 h-screen flex flex-col max-h-screen">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => router.push('/stories')}
            className="p-2 bg-white rounded-full shadow-sm mr-4"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-black text-primary-dark">{story.title}</h1>
        </div>

        {/* Content Area */}
        <div className="flex-1 pb-4 min-h-0">
          {storyState === 'reading' && (
            <StoryReader story={story} onFinish={handleFinishReading} />
          )}
          
          {storyState === 'question' && (
            <StoryQuestion story={story} onCorrectAnswer={handleCorrectAnswer} />
          )}
          
          {storyState === 'completed' && (
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl text-center h-full flex flex-col items-center justify-center border-4 border-primary/20">
              <div className="text-6xl mb-6">🏆</div>
              <h2 className="text-3xl font-black text-primary-dark mb-4">عمل رائع!</h2>
              <p className="text-xl font-bold text-gray-600 mb-8 leading-relaxed">
                لقد قرأت القصة بتمعن وأجبت على السؤال إجابة صحيحة.
              </p>
              <Button 
                size="lg" 
                onClick={() => router.push('/stories')}
                className="px-12 text-xl"
              >
                العودة للقصص
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <RewardPopup 
        show={showReward} 
        message={rewardMessage} 
      />
    </PageWrapper>
  );
}
