import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor
} from '@dnd-kit/core';
import { MatchCard } from './MatchCard';
import { Button } from '../../../components/ui/Button';
import { useProgress } from '../../../hooks/useProgress';
import { useRewards } from '../../../hooks/useRewards';
import { RewardPopup } from '../../../components/feedback/RewardPopup';

const PRAYER_PILLARS = [
  { id: 'takbeer', name: 'تكبيرة الإحرام' },
  { id: 'rukoo', name: 'الركوع' },
  { id: 'sujood', name: 'السجود' },
  { id: 'tasleem', name: 'التسليم' },
];

export function PrayerGame() {
  // The targets are always in correct order
  const targets = [...PRAYER_PILLARS];
  
  // The draggable items are shuffled
  const [items, setItems] = useState(() => {
    return [...PRAYER_PILLARS].sort(() => Math.random() - 0.5);
  });
  
  // Track which items are successfully matched
  const [matches, setMatches] = useState<Record<string, boolean>>({});
  
  const { addCompletedGame } = useProgress();
  const { showReward, rewardMessage, triggerReward } = useRewards();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && over.id === `drop-${active.id.toString().replace('drag-', '')}`) {
      // Correct match!
      const id = active.id.toString().replace('drag-', '');
      setMatches(prev => {
        const newMatches = { ...prev, [id]: true };
        
        // Check if all matched
        if (Object.keys(newMatches).length === PRAYER_PILLARS.length) {
          const isNew = addCompletedGame('prayer');
          if (isNew) {
            setTimeout(() => triggerReward('ممتاز! لقد طابقت كل أركان الصلاة ⭐'), 500);
          } else {
            setTimeout(() => triggerReward('عمل رائع! أنت تعرف أركان الصلاة جيداً'), 500);
          }
        }
        
        return newMatches;
      });
    }
  };

  const handleReset = () => {
    setItems([...PRAYER_PILLARS].sort(() => Math.random() - 0.5));
    setMatches({});
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border-4 border-sky-light h-full flex flex-col">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-black text-primary-dark mb-2">أركان الصلاة</h2>
        <p className="text-gray-500 font-bold">اسحب كل ركن إلى مكانه الصحيح بالترتيب</p>
      </div>
      
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex-1 grid grid-cols-2 gap-4 mb-6">
          {/* Draggable items container */}
          <div className="space-y-3 p-4 bg-sky-light/20 rounded-2xl border-2 border-sky-light/50">
            <h3 className="font-bold text-center text-sky-800 mb-4 border-b-2 border-sky-light pb-2">البطاقات</h3>
            {items.map(item => (
              <MatchCard 
                key={`drag-${item.id}`} 
                id={item.id} 
                text={item.name} 
                type="draggable"
                isMatched={!!matches[item.id]}
              />
            ))}
          </div>

          {/* Droppable targets container */}
          <div className="space-y-3 p-4 bg-primary-light/10 rounded-2xl border-2 border-primary-light/30 flex flex-col justify-between">
            <h3 className="font-bold text-center text-primary-dark mb-4 border-b-2 border-primary-light/50 pb-2">الترتيب</h3>
            {targets.map((target, index) => (
              <div key={`target-${target.id}`} className="relative flex items-center">
                <div className="absolute -right-3 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold z-10 shadow-md border-2 border-white">
                  {index + 1}
                </div>
                <div className="w-full pr-6">
                  <MatchCard 
                    id={target.id} 
                    text={target.name} 
                    type="droppable"
                    isMatched={!!matches[target.id]}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </DndContext>
      
      <div className="pt-4 border-t-2 border-gray-100 text-center">
        <Button 
          variant="outline" 
          onClick={handleReset}
          className="px-8"
        >
          العب مرة أخرى
        </Button>
      </div>

      <RewardPopup 
        show={showReward} 
        message={rewardMessage} 
      />
    </div>
  );
}
