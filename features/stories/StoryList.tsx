import React from 'react';
import { StoryCard } from './StoryCard';
import { stories } from '../../data/stories';
import { useAuth } from '../../hooks/useAuth';

export function StoryList() {
  const { user } = useAuth();
  const completedStories = user?.completed_stories || [];

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
