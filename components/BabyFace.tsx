
import React from 'react';
import { BabyState } from '../types';

interface BabyFaceProps {
  state: BabyState;
  noiseLevel: number;
}

const BabyFace: React.FC<BabyFaceProps> = ({ state, noiseLevel }) => {
  const isRestless = state === 'RESTLESS' || noiseLevel > 0.6;
  const isAwake = state === 'AWAKE';
  const isVictory = state === 'VICTORY';

  return (
    <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
      {/* Halo/Aura */}
      <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 transition-colors duration-500 ${
        isAwake ? 'bg-red-500 animate-pulse' : isVictory ? 'bg-blue-400' : 'bg-indigo-500'
      }`} />

      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
        {/* Head */}
        <circle cx="100" cy="100" r="80" fill="#FFE0BD" stroke="#E3B39A" strokeWidth="4" />
        
        {/* Hair - Cute single curl */}
        <path d="M100 25 Q110 10 120 20" fill="none" stroke="#8B4513" strokeWidth="3" strokeLinecap="round" />

        {/* Eyes */}
        {isAwake ? (
          <>
            <circle cx="70" cy="90" r="10" fill="white" />
            <circle cx="70" cy="90" r="4" fill="black" />
            <circle cx="130" cy="90" r="10" fill="white" />
            <circle cx="130" cy="90" r="4" fill="black" />
          </>
        ) : isRestless ? (
          <>
            <path d="M60 90 Q70 85 80 90" fill="none" stroke="#4A3728" strokeWidth="4" strokeLinecap="round" />
            <path d="M120 90 Q130 85 140 90" fill="none" stroke="#4A3728" strokeWidth="4" strokeLinecap="round" />
          </>
        ) : isVictory ? (
          <>
            <path d="M60 90 Q70 95 80 90" fill="none" stroke="#4A3728" strokeWidth="3" strokeLinecap="round" />
            <path d="M120 90 Q130 95 140 90" fill="none" stroke="#4A3728" strokeWidth="3" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M60 90 L80 90" stroke="#4A3728" strokeWidth="4" strokeLinecap="round" />
            <path d="M120 90 L140 90" stroke="#4A3728" strokeWidth="4" strokeLinecap="round" />
          </>
        )}

        {/* Mouth */}
        {isAwake ? (
          <path d="M70 140 Q100 110 130 140" fill="#800" stroke="none" />
        ) : isRestless ? (
          <path d="M85 140 Q100 135 115 140" fill="none" stroke="#4A3728" strokeWidth="3" strokeLinecap="round" />
        ) : isVictory ? (
           <path d="M85 140 Q100 155 115 140" fill="none" stroke="#4A3728" strokeWidth="3" strokeLinecap="round" />
        ) : (
          <path d="M90 140 L110 140" stroke="#4A3728" strokeWidth="3" strokeLinecap="round" />
        )}

        {/* Cheeks */}
        {!isAwake && (
            <>
                <circle cx="55" cy="115" r="8" fill="#FFB6C1" opacity="0.4" />
                <circle cx="145" cy="115" r="8" fill="#FFB6C1" opacity="0.4" />
            </>
        )}
      </svg>
      
      {/* Zzzzz animations */}
      {state === 'SLEEPING' && !isRestless && (
        <div className="absolute top-0 right-0 pointer-events-none">
          <div className="animate-[bounce_3s_infinite] text-2xl font-bold text-blue-300 opacity-50">Z</div>
          <div className="animate-[bounce_2.5s_infinite] text-xl font-bold text-blue-300 opacity-40 ml-4 mt-2">z</div>
          <div className="animate-[bounce_4s_infinite] text-lg font-bold text-blue-300 opacity-30 ml-8 mt-4">z</div>
        </div>
      )}
    </div>
  );
};

export default BabyFace;
