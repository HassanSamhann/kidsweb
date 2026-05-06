import React, { useRef, useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Eraser, Download, Palette, Trash2, Brush } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { useProgress } from '../../hooks/useProgress';
import { useRewards } from '../../hooks/useRewards';
import { RewardPopup } from '../../components/feedback/RewardPopup';

const COLORS = [
  '#000000', '#FF0000', '#00FF00', '#0000FF', 
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', 
  '#800080', '#008000', '#FFFFFF'
];

const TEMPLATES = [
  { id: 'mosque', name: 'مسجد', emoji: '🕌' },
  { id: 'crescent', name: 'هلال', emoji: '🌙' },
  { id: 'star', name: 'نجمة', emoji: '⭐' },
];

export function ColoringApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState('#FF0000');
  const [brushSize, setBrushSize] = useState(10);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const { addCompletedGame } = useProgress();
  const { showReward, rewardMessage, triggerReward } = useRewards();

  // Handle resizing and initial setup
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Set canvas dimensions to match container
    const resizeCanvas = () => {
      // Save current content
      const ctx = canvas.getContext('2d');
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      
      const { width, height } = container.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      
      // Fill background
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        
        // Restore content if exists
        if (imageData) {
          ctx.putImageData(imageData, 0, 0);
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = (e as React.MouseEvent).clientX - rect.left;
      y = (e as React.MouseEvent).clientY - rect.top;
    }

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = isEraser ? '#FFFFFF' : color;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'islami-drawing.png';
    link.href = dataUrl;
    link.click();

    // Reward for saving
    const isNew = addCompletedGame('coloring');
    if (isNew) {
      triggerReward('رسمة جميلة جداً! حصلت على نجمة 🎨⭐');
    } else {
      triggerReward('لقد حفظت رسمتك الجميلة! 🎨');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] shadow-xl overflow-hidden border-4 border-primary-light">
      {/* Tools Header */}
      <div className="bg-gray-50 p-4 border-b-2 border-gray-200 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          <Button 
            variant={isEraser ? 'ghost' : 'primary'} 
            size="sm"
            onClick={() => setIsEraser(false)}
            className="w-12 h-12 p-0 rounded-xl"
          >
            <Brush className={cn("w-6 h-6", !isEraser && "text-white")} />
          </Button>
          <Button 
            variant={isEraser ? 'primary' : 'ghost'} 
            size="sm"
            onClick={() => setIsEraser(true)}
            className="w-12 h-12 p-0 rounded-xl"
          >
            <Eraser className={cn("w-6 h-6", isEraser && "text-white")} />
          </Button>
        </div>

        <div className="flex gap-2 items-center relative">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-12 h-12 p-0 rounded-xl relative"
          >
            <div 
              className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-inner" 
              style={{ backgroundColor: color }}
            />
          </Button>
          
          {showColorPicker && (
            <div className="absolute top-14 left-0 z-50 bg-white p-4 rounded-2xl shadow-2xl border-2 border-gray-100">
              <HexColorPicker color={color} onChange={setColor} />
              <div className="mt-4 flex flex-wrap gap-2 justify-center w-[200px]">
                {COLORS.map(c => (
                  <button
                    key={c}
                    className={cn(
                      "w-8 h-8 rounded-full shadow-inner border border-gray-200 transition-transform",
                      color === c && "scale-110 border-2 border-primary ring-2 ring-primary/30"
                    )}
                    style={{ backgroundColor: c }}
                    onClick={() => {
                      setColor(c);
                      setShowColorPicker(false);
                      setIsEraser(false);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <input 
            type="range" 
            min="2" 
            max="40" 
            value={brushSize} 
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-24 accent-primary"
          />
          <div 
            className="bg-gray-800 rounded-full" 
            style={{ width: brushSize, height: brushSize, backgroundColor: isEraser ? '#gray-300' : color }}
          />
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        ref={containerRef} 
        className="flex-1 w-full bg-gray-100 relative cursor-crosshair touch-none"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 w-full h-full"
        />
      </div>

      {/* Footer Tools */}
      <div className="bg-gray-50 p-4 border-t-2 border-gray-200 flex justify-between">
        <Button variant="danger" size="sm" onClick={clearCanvas} className="gap-2 rounded-xl">
          <Trash2 className="w-5 h-5" /> مسح الكل
        </Button>
        <Button variant="secondary" size="sm" onClick={saveImage} className="gap-2 rounded-xl">
          <Download className="w-5 h-5" /> حفظ الرسمة
        </Button>
      </div>

      <RewardPopup show={showReward} message={rewardMessage} />
    </div>
  );
}
