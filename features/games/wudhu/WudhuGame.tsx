import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { DraggableStep } from './DraggableStep';
import { Button } from '../../../components/ui/Button';
import { useProgress } from '../../../hooks/useProgress';
import { useRewards } from '../../../hooks/useRewards';
import { RewardPopup } from '../../../components/feedback/RewardPopup';

// Correct order
const CORRECT_STEPS = [
  { id: '1', text: 'النية' },
  { id: '2', text: 'غسل اليدين' },
  { id: '3', text: 'المضمضة' },
  { id: '4', text: 'غسل الوجه' },
  { id: '5', text: 'غسل اليدين إلى المرفقين' },
  { id: '6', text: 'مسح الرأس' },
  { id: '7', text: 'غسل القدمين' },
];

export function WudhuGame() {
  const [items, setItems] = useState(() => {
    // Shuffle the items for the game
    return [...CORRECT_STEPS].sort(() => Math.random() - 0.5);
  });
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  
  const { addCompletedGame } = useProgress();
  const { showReward, rewardMessage, triggerReward } = useRewards();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
      setShowError(false);
    }
  };

  const handleCheck = () => {
    // Check if the current order matches the correct order
    const isCorrectOrder = items.every((item, index) => item.id === CORRECT_STEPS[index].id);
    
    if (isCorrectOrder) {
      setIsSuccess(true);
      setShowError(false);
      const isNew = addCompletedGame('wudhu');
      if (isNew) {
        triggerReward('رائع! لقد رتبت خطوات الوضوء بشكل صحيح ⭐');
      } else {
        triggerReward('عمل ممتاز! تذكر دائماً خطوات الوضوء الصحيحة');
      }
    } else {
      setIsSuccess(false);
      setShowError(true);
    }
  };

  const handleReset = () => {
    setItems([...CORRECT_STEPS].sort(() => Math.random() - 0.5));
    setIsSuccess(false);
    setShowError(false);
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border-4 border-sky-light text-center h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-primary-dark mb-2">ترتيب الوضوء</h2>
        <p className="text-gray-500 font-bold">اسحب الخطوات ورتبها بالشكل الصحيح</p>
      </div>
      
      {showError && (
        <div className="mb-4 bg-coral-light/50 text-coral p-3 rounded-xl font-bold animate-pulse text-sm">
          الترتيب غير صحيح، حاول مرة أخرى!
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto mb-6 pr-2">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={items}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {items.map((item, index) => (
                <DraggableStep 
                  key={item.id} 
                  id={item.id} 
                  text={item.text} 
                  index={index}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
      
      <div className="pt-4 border-t-2 border-gray-100 flex gap-4">
        <Button 
          variant="outline" 
          onClick={handleReset}
          className="flex-1"
        >
          إعادة
        </Button>
        <Button 
          variant="primary" 
          onClick={handleCheck}
          className="flex-[2]"
        >
          تحقق
        </Button>
      </div>

      <RewardPopup 
        show={showReward} 
        message={rewardMessage} 
      />
    </div>
  );
}
