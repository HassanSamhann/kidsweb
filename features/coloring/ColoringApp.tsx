import React, { useRef, useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Eraser, Download, Palette, Trash2, Brush, PaintBucket, Shapes } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { useProgress } from '../../hooks/useProgress';
import { useRewards } from '../../hooks/useRewards';
import { RewardPopup } from '../../components/feedback/RewardPopup';
import { floodFill } from './utils';

const COLORS = [
  '#000000', '#FFFFFF', '#FF3B30', '#FF9500', '#FFCC00', 
  '#4CD964', '#5AC8FA', '#007AFF', '#5856D6', '#FF2D55',
  '#FF9FCE', '#A2DED0', '#FDFD96', '#B19CD9'
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
  const [activeTool, setActiveTool] = useState<'brush' | 'eraser' | 'fill'>('brush');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  
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
      let imageData = null;
      if (canvas.width > 0 && canvas.height > 0) {
        imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      }
      
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
    if (activeTool === 'fill') {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
      
      const rect = canvas.getBoundingClientRect();
      let x, y;
      if ('touches' in e) {
        x = Math.floor(e.touches[0].clientX - rect.left);
        y = Math.floor(e.touches[0].clientY - rect.top);
      } else {
        x = Math.floor((e as React.MouseEvent).clientX - rect.left);
        y = Math.floor((e as React.MouseEvent).clientY - rect.top);
      }
      
      floodFill(ctx, x, y, color);
      return;
    }

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
    if (!isDrawing || activeTool === 'fill') return;
    
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
    ctx.lineJoin = 'round';
    ctx.strokeStyle = activeTool === 'eraser' ? '#FFFFFF' : color;

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

  const drawTemplate = (templateId: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas first
    clearCanvas();
    
    ctx.beginPath();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const size = Math.min(canvas.width, canvas.height) * 0.3;

    if (templateId === 'star') {
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(cx + Math.cos((18 + i * 72) / 180 * Math.PI) * size,
                   cy - Math.sin((18 + i * 72) / 180 * Math.PI) * size);
        ctx.lineTo(cx + Math.cos((54 + i * 72) / 180 * Math.PI) * (size/2.5),
                   cy - Math.sin((54 + i * 72) / 180 * Math.PI) * (size/2.5));
      }
      ctx.closePath();
      ctx.stroke();
    } else if (templateId === 'crescent') {
      ctx.arc(cx, cy, size, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.fillStyle = '#FFFFFF';
      ctx.arc(cx + size * 0.4, cy - size * 0.4, size * 0.8, 0, Math.PI * 2);
      ctx.fill();
    } else if (templateId === 'mosque') {
      // Base
      ctx.strokeRect(cx - size, cy, size * 2, size);
      // Dome
      ctx.arc(cx, cy, size * 0.6, Math.PI, 0);
      ctx.stroke();
      // Minaret
      ctx.strokeRect(cx + size + 20, cy - size * 0.8, size * 0.3, size * 1.8);
      ctx.beginPath();
      ctx.moveTo(cx + size + 20, cy - size * 0.8);
      ctx.lineTo(cx + size + 20 + size * 0.15, cy - size * 1.2);
      ctx.lineTo(cx + size + 20 + size * 0.3, cy - size * 0.8);
      ctx.stroke();
    }
    
    setShowTemplates(false);
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
            variant={activeTool === 'brush' ? 'primary' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTool('brush')}
            className="w-12 h-12 p-0 rounded-xl"
          >
            <Brush className={cn("w-6 h-6", activeTool === 'brush' && "text-white")} />
          </Button>
          <Button 
            variant={activeTool === 'eraser' ? 'primary' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTool('eraser')}
            className="w-12 h-12 p-0 rounded-xl"
          >
            <Eraser className={cn("w-6 h-6", activeTool === 'eraser' && "text-white")} />
          </Button>
          <Button 
            variant={activeTool === 'fill' ? 'primary' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTool('fill')}
            className="w-12 h-12 p-0 rounded-xl"
          >
            <PaintBucket className={cn("w-6 h-6", activeTool === 'fill' && "text-white")} />
          </Button>
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowTemplates(!showTemplates)}
              className="w-12 h-12 p-0 rounded-xl bg-gray-200 hover:bg-gray-300"
            >
              <Shapes className="w-6 h-6 text-gray-700" />
            </Button>
            {showTemplates && (
              <div className="absolute top-14 right-0 z-50 bg-white p-4 rounded-2xl shadow-2xl border-2 border-gray-100 flex gap-2 w-[180px] flex-wrap justify-center">
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => drawTemplate(t.id)}
                    className="flex flex-col items-center justify-center p-2 hover:bg-sky-light rounded-xl transition-colors"
                  >
                    <span className="text-2xl">{t.emoji}</span>
                    <span className="text-xs font-bold mt-1 text-gray-600">{t.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
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
                      if (activeTool === 'eraser') setActiveTool('brush');
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
            style={{ width: brushSize, height: brushSize, backgroundColor: activeTool === 'eraser' ? '#d1d5db' : color }}
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
