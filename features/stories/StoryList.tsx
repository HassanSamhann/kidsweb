import React, { useEffect, useState } from 'react';
import { StoryCard } from './StoryCard';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

// Fallback data in case Supabase is not ready yet
import { stories as fallbackStories } from '../../data/stories';

export function StoryList() {
  const { user } = useAuth();
  const completedStories = user?.completed_stories || [];
  
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStories() {
      try {
        const { data, error } = await supabase
          .from('stories')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Map to match the existing Story type format
          const mappedStories = data.map(s => ({
            id: s.slug,
            title: s.title,
            description: s.description,
            content: s.content,
            question: {
              text: s.question_text,
              options: s.question_options,
              correctAnswerIndex: s.correct_answer_index
            }
          }));
          setStories(mappedStories);
        } else {
          setStories(fallbackStories);
        }
      } catch (err) {
        console.error('Error fetching stories:', err);
        setStories(fallbackStories); // Fallback to local data
      } finally {
        setLoading(false);
      }
    }
    
    fetchStories();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-4">
      {stories.map((story) => (
        <StoryCard 
          key={story.id} 
          story={story} 
          isCompleted={completedStories.includes(story.id)} 
        />
      ))}
    </div>
  );
}
