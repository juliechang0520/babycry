
import React from 'react';

interface NoiseMeterProps {
  level: number;
}

const NoiseMeter: React.FC<NoiseMeterProps> = ({ level }) => {
  const percentage = Math.min(level * 100, 100);
  const colorClass = percentage > 80 ? 'bg-red-500' : percentage > 40 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="w-full max-w-md bg-slate-800 rounded-full h-6 border-2 border-slate-700 overflow-hidden relative shadow-inner">
      <div 
        className={`h-full transition-all duration-75 ease-out shadow-[0_0_10px_rgba(255,255,255,0.3)] ${colorClass}`}
        style={{ width: `${percentage}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tracking-widest text-white mix-blend-difference uppercase">
        Noise Level
      </div>
      {/* Danger Line */}
      <div className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-red-400 opacity-50 border-l border-red-900" />
    </div>
  );
};

export default NoiseMeter;
