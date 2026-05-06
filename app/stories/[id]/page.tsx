'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageWrapper } from '../../../components/ui/PageWrapper';
import { StoryReader } from '../../../features/stories/StoryReader';
import { StoryQuestion } from '../../../features/stories/StoryQuestion';
import { RewardPopup } from '../../../components/feedback/RewardPopup';
import { Button } from '../../../components/ui/Button';
import { stories as fallbackStories } from '../../../data/stories';
import { useProgress } from '../../../hooks/useProgress';
import { useRewards } from '../../../hooks/useRewards';
import { ChevronRight } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

type StoryState = 'reading' | 'question' | 'completed';

export default function SingleStoryPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [storyState, setStoryState] = useState<StoryState>('reading');
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const { addCompletedStory } = useProgress();
  const { showReward, rewardMessage, triggerReward } = useRewards();

  useEffect(() => {
    async function fetchStory() {
      try {
        const { data, error } = await supabase
          .from('stories')
          .select('*')
          .eq('slug', id)
          .single();
        
        if (data) {
          setStory({
            id: data.slug,
            title: data.title,
            description: data.description,
            content: data.content,
            question: {
              text: data.question_text,
              options: data.question_options,
              correctAnswerIndex: data.correct_answer_index
            }
          });
        } else {
          // Fallback
          const localStory = fallbackStories.find(s => s.id === id);
          if (localStory) setStory(localStory);
          else router.replace('/stories');
        }
      } catch (err) {
        console.error('Error fetching story:', err);
        const localStory = fallbackStories.find(s => s.id === id);
        if (localStory) setStory(localStory);
        else router.replace('/stories');
      } finally {
        setLoading(false);
      }
    }
    
    fetchStory();
  }, [id, router]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-sky-light"><LoadingSpinner size={48} /></div>;
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
    <div className="p-8 max-w-5xl mx-auto">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center mb-8 gap-4">
          <button 
            onClick={() => router.push('/stories')}
            className="p-3 bg-[#1e2329] border border-[#2d3748] rounded-xl hover:bg-[#252b36] transition-all text-gray-400 hover:text-white"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-white">{story.title}</h1>
            <p className="text-gray-400 text-sm">{story.description}</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 pb-12">
          {storyState === 'reading' && (
            <div className="bg-[#1e2329] rounded-[2.5rem] border border-[#2d3748] overflow-hidden shadow-2xl">
              <StoryReader story={story} onFinish={handleFinishReading} />
            </div>
          )}
          
          {storyState === 'question' && (
            <div className="bg-[#1e2329] rounded-[2.5rem] border border-[#2d3748] overflow-hidden shadow-2xl">
              <StoryQuestion story={story} onCorrectAnswer={handleCorrectAnswer} />
            </div>
          )}
          
          {storyState === 'completed' && (
            <div className="bg-[#1e2329] rounded-[2.5rem] p-12 border border-[#2d3748] text-center shadow-2xl flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-orange-400/10 rounded-full flex items-center justify-center text-5xl mb-8 border border-orange-400/20">🏆</div>
              <h2 className="text-4xl font-black text-white mb-6">عمل رائع يا بطل!</h2>
              <p className="text-xl font-medium text-gray-400 mb-10 max-w-lg leading-relaxed">
                لقد قرأت القصة بتمعن وأجبت على السؤال إجابة صحيحة. حصلت على نجمة ذكاء ⭐
              </p>
              <Button 
                size="lg" 
                onClick={() => router.push('/stories')}
                className="px-12 py-4 bg-orange-400 hover:bg-orange-300 text-gray-900 text-xl rounded-2xl font-black transition-all shadow-lg shadow-orange-400/20"
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
    </div>
  );
}
