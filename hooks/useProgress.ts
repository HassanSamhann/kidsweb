import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

export function useProgress() {
  const { user, setUser } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  const syncWithServer = useCallback(async (
    stars: number, 
    completed_stories: string[], 
    completed_games: string[]
  ) => {
    if (!user) return;
    
    setIsSyncing(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          stars,
          completed_stories,
          completed_games
        })
        .eq('id', user.id);
        
      if (error) throw error;
    } catch (err) {
      console.error('Failed to sync progress:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  const addCompletedStory = (storyId: string) => {
    if (!user) return false;
    
    // Check if already completed
    if (user.completed_stories.includes(storyId)) {
      return false; // Already completed, no new reward
    }
    
    const newCompletedStories = [...user.completed_stories, storyId];
    const newStars = user.stars + 1;
    
    const updatedUser = {
      ...user,
      completed_stories: newCompletedStories,
      stars: newStars
    };
    
    setUser(updatedUser);
    syncWithServer(newStars, newCompletedStories, user.completed_games);
    
    return true; // Added new reward
  };

  const addCompletedGame = (gameId: string) => {
    if (!user) return false;
    
    // Check if already completed
    if (user.completed_games.includes(gameId)) {
      return false; // Already completed
    }
    
    const newCompletedGames = [...user.completed_games, gameId];
    const newStars = user.stars + 1;
    
    const updatedUser = {
      ...user,
      completed_games: newCompletedGames,
      stars: newStars
    };
    
    setUser(updatedUser);
    syncWithServer(newStars, user.completed_stories, newCompletedGames);
    
    return true; // Added new reward
  };

  return { 
    addCompletedStory, 
    addCompletedGame,
    isSyncing 
  };
}
