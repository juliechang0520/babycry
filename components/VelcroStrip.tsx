
import React, { useState, useRef, useEffect } from 'react';

interface VelcroStripProps {
  onPeel: (velocity: number, progress: number) => void;
  disabled: boolean;
}

const VelcroStrip: React.FC<VelcroStripProps> = ({ onPeel, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const containerRef = useRef<HTMLDivElement>(null);
  const lastY = useRef<number | null>(null);
  const lastTime = useRef<number | null>(null);

  const handleStart = (y: number) => {
    if (disabled || progress >= 100) return;
    setIsDragging(true);
    lastY.current = y;
    lastTime.current = Date.now();
  };

  const handleMove = (y: number) => {
    if (!isDragging || disabled || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const currentTime = Date.now();
    
    if (lastY.current !== null && lastTime.current !== null) {
      const dy = y - lastY.current;
      const dt = currentTime - lastTime.current;
      
      if (dy > 0 && dt > 0) {
        const velocity = dy / dt; // pixels per ms
        const stepProgress = (dy / rect.height) * 100;
        const nextProgress = Math.min(progress + stepProgress, 100);
        
        setProgress(nextProgress);
        onPeel(velocity, nextProgress);
      } else {
        onPeel(0, progress);
      }
    }

    lastY.current = y;
    lastTime.current = currentTime;
  };

  const handleEnd = () => {
    setIsDragging(false);
    onPeel(0, progress);
    lastY.current = null;
    lastTime.current = null;
  };

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => handleStart(e.touches[0].clientY);
  const onTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientY);
  const onMouseDown = (e: React.MouseEvent) => handleStart(e.clientY);
  const onMouseMove = (e: React.MouseEvent) => handleMove(e.clientY);

  useEffect(() => {
    const handleGlobalEnd = () => handleEnd();
    window.addEventListener('mouseup', handleGlobalEnd);
    window.addEventListener('touchend', handleGlobalEnd);
    return () => {
      window.removeEventListener('mouseup', handleGlobalEnd);
      window.removeEventListener('touchend', handleGlobalEnd);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative w-24 h-80 md:w-32 md:h-[500px] bg-slate-800 rounded-xl shadow-2xl overflow-hidden cursor-ns-resize border-4 border-slate-700 select-none ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
    >
      {/* Hook Side (Bottom Layer) */}
      <div className="absolute inset-0 bg-[radial-gradient(#2d3748_1px,transparent_1px)] [background-size:4px_4px] opacity-30" />
      
      {/* Loop Side (Peeling Layer) */}
      <div 
        className="absolute inset-0 bg-blue-600 shadow-xl flex flex-col items-center justify-start origin-top transition-transform duration-75"
        style={{ transform: `translateY(${progress}%)` }}
      >
        {/* Velcro Texture */}
        <div className="w-full h-full bg-[repeating-linear-gradient(45deg,#2563eb,#2563eb_5px,#1d4ed8_5px,#1d4ed8_10px)] opacity-80" />
        
        {/* Edge / Peel Lip */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-blue-400 border-b-4 border-blue-300 flex items-center justify-center">
            <div className="w-12 h-1 bg-white rounded-full opacity-50" />
        </div>
      </div>

      {/* Peel Indication */}
      {progress < 10 && !isDragging && !disabled && (
          <div className="absolute top-10 left-0 right-0 flex flex-col items-center animate-bounce text-blue-200 opacity-50 pointer-events-none">
              <i className="fa-solid fa-hand-pointer text-2xl mb-2"></i>
              <span className="text-xs font-bold">DRAG DOWN</span>
          </div>
      )}
    </div>
  );
};

export default VelcroStrip;
