
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BabyState, GameStatus } from './types';
import BabyFace from './components/BabyFace';
import VelcroStrip from './components/VelcroStrip';
import NoiseMeter from './components/NoiseMeter';
import { audioService } from './services/audioService';
import { getBabyResponse } from './services/geminiService';

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>({
    progress: 0,
    noiseLevel: 0,
    babyState: 'SLEEPING',
    isGameOver: false,
    message: "Shhh... don't wake the little one."
  });
  
  const [gameStarted, setGameStarted] = useState(false);
  const [babyReaction, setBabyReaction] = useState("Zzzzz...");
  // Fixed: Replaced NodeJS.Timeout with ReturnType<typeof setTimeout> to avoid NodeJS namespace error in browser
  const alertTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noiseRef = useRef(0);

  const handlePeel = useCallback((velocity: number, progress: number) => {
    if (gameStatus.isGameOver) return;

    // Normalizing velocity: 0 to 2 range usually captures most drag speeds
    const normalizedNoise = Math.min(velocity * 0.8, 1.2);
    noiseRef.current = normalizedNoise;
    audioService.update(normalizedNoise);

    setGameStatus(prev => {
      let nextState: BabyState = prev.babyState;
      let isGameOver = false;

      if (normalizedNoise > 0.85) {
        nextState = 'RESTLESS';
      } else if (normalizedNoise < 0.2 && prev.babyState === 'RESTLESS') {
        nextState = 'SLEEPING';
      }

      if (progress >= 100) {
        nextState = 'VICTORY';
        isGameOver = true;
      }

      return {
        ...prev,
        progress,
        noiseLevel: normalizedNoise,
        babyState: nextState,
        isGameOver
      };
    });
  }, [gameStatus.isGameOver]);

  // Noise monitoring for game over
  useEffect(() => {
    const checkNoise = setInterval(() => {
      if (noiseRef.current > 0.95 && !gameStatus.isGameOver) {
        setGameStatus(prev => ({
          ...prev,
          babyState: 'AWAKE',
          isGameOver: true,
          message: "YOU WOKE THE KRAKEN!"
        }));
        audioService.stop();
      }
    }, 200);

    return () => clearInterval(checkNoise);
  }, [gameStatus.isGameOver]);

  // Periodic AI Commentary
  useEffect(() => {
    if (!gameStarted || gameStatus.isGameOver) return;
    
    const fetchCommentary = async () => {
        const text = await getBabyResponse(gameStatus.babyState, gameStatus.progress);
        setBabyReaction(text);
    };

    const timer = setInterval(fetchCommentary, 5000);
    return () => clearInterval(timer);
  }, [gameStarted, gameStatus.babyState, gameStatus.progress, gameStatus.isGameOver]);

  // One-off commentary for game over or victory
  useEffect(() => {
    if (gameStatus.isGameOver) {
      getBabyResponse(gameStatus.babyState, gameStatus.progress).then(setBabyReaction);
    }
  }, [gameStatus.isGameOver]);

  const startGame = () => {
    audioService.init();
    setGameStarted(true);
    setGameStatus({
      progress: 0,
      noiseLevel: 0,
      babyState: 'SLEEPING',
      isGameOver: false,
      message: "Steady hands..."
    });
  };

  const restart = () => {
    setGameStatus({
      progress: 0,
      noiseLevel: 0,
      babyState: 'SLEEPING',
      isGameOver: false,
      message: "Let's try that again. More ninja, less hippo."
    });
    setGameStarted(false);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between p-4 md:p-8 overflow-hidden select-none">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[10%] left-[10%] w-32 h-32 bg-indigo-500 opacity-10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-64 h-64 bg-blue-500 opacity-10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header Info */}
      <div className="w-full max-w-2xl text-center space-y-2 mt-4 z-10">
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white drop-shadow-lg">
          VELCRO <span className="text-blue-400 italic">NINJA</span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base font-medium">
          The ultimate diaper-changing stealth simulator.
        </p>
      </div>

      {/* Main Game Area */}
      {!gameStarted ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-8 z-10">
          <BabyFace state="SLEEPING" noiseLevel={0} />
          <button 
            onClick={startGame}
            className="group relative px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xl rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
          >
            START MISSION
            <div className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </div>
          </button>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Recommended: Use Headphones</p>
        </div>
      ) : (
        <div className="flex-1 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center justify-items-center">
          
          {/* Feedback Section */}
          <div className="flex flex-col items-center space-y-6 md:space-y-8 w-full order-2 lg:order-1">
             <div className="relative group">
                <BabyFace state={gameStatus.babyState} noiseLevel={gameStatus.noiseLevel} />
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-full text-center">
                    <div className="inline-block bg-slate-800/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 shadow-xl min-w-[200px]">
                        <p className="text-blue-200 font-medium italic animate-pulse">
                            "{babyReaction}"
                        </p>
                    </div>
                </div>
             </div>
             
             <div className="w-full space-y-4 pt-10">
                <NoiseMeter level={gameStatus.noiseLevel} />
                <div className="flex justify-between items-center text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
                    <span>Stealth</span>
                    <span className={gameStatus.noiseLevel > 0.8 ? 'text-red-500 animate-bounce' : ''}>
                        {gameStatus.noiseLevel > 0.8 ? 'ALERT' : 'Quiet'}
                    </span>
                </div>
             </div>
          </div>

          {/* Interaction Section */}
          <div className="flex flex-col items-center space-y-6 w-full order-1 lg:order-2">
            <VelcroStrip 
              onPeel={handlePeel} 
              disabled={gameStatus.isGameOver} 
            />
            
            <div className="w-full max-w-[200px] text-center">
                <div className="text-xs font-black text-slate-500 uppercase mb-1">Peel Progress</div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-blue-500 transition-all duration-300" 
                        style={{ width: `${gameStatus.progress}%` }}
                    />
                </div>
                <div className="mt-2 text-xl font-black text-blue-400">
                    {Math.round(gameStatus.progress)}%
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Over / Win Overlays */}
      {gameStatus.isGameOver && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center">
          <div className={`p-8 rounded-3xl border-4 max-w-md w-full space-y-6 ${gameStatus.babyState === 'VICTORY' ? 'border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.3)]' : 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.3)]'}`}>
             <h2 className={`text-5xl font-black italic tracking-tighter mb-2 ${gameStatus.babyState === 'VICTORY' ? 'text-blue-400' : 'text-red-500'}`}>
                {gameStatus.babyState === 'VICTORY' ? 'NINJA MASTER!' : 'FAILURE'}
             </h2>
             <p className="text-xl text-white font-medium">
                {gameStatus.message}
             </p>
             <p className="text-slate-400 italic">
                "{babyReaction}"
             </p>
             <button 
               onClick={restart}
               className={`w-full py-4 px-8 rounded-xl font-black text-xl transition-all hover:scale-105 active:scale-95 ${gameStatus.babyState === 'VICTORY' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'}`}
             >
               TRY AGAIN
             </button>
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <div className="w-full text-center py-4 text-[10px] font-bold text-slate-600 tracking-widest uppercase z-10">
        AI-Powered Sensory Challenge &copy; 2024
      </div>
    </div>
  );
};

export default App;
