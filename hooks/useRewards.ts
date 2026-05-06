import { useState } from 'react';

// A lightweight hook for UI reward animations and state
export function useRewards() {
  const [showReward, setShowReward] = useState(false);
  const [rewardMessage, setRewardMessage] = useState('أحسنت! حصلت على نجمة');

  const triggerReward = (message?: string) => {
    if (message) {
      setRewardMessage(message);
    }
    setShowReward(true);
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      setShowReward(false);
    }, 3000);
  };

  return {
    showReward,
    rewardMessage,
    triggerReward,
    setShowReward
  };
}
