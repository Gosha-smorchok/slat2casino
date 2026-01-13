import React, { useEffect, useRef, useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Trophy, Ban } from 'lucide-react';
import clsx from 'clsx';

const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const GAME_HEIGHT = 400;
const BALL_SIZE = 60;
const ENTRY_FEE = 50;

const KeepieUppie = () => {
  const { balance, removeCoins, addCoins } = useUserStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [multiplier, setMultiplier] = useState(1.0);
  const [potentialWin, setPotentialWin] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState<number | null>(null);

  // Physics state (refs to avoid re-renders)
  const ballY = useRef(GAME_HEIGHT - BALL_SIZE);
  const velocityY = useRef(0);
  const rafId = useRef<number>();
  const ballRef = useRef<HTMLDivElement>(null);
  
  const startGame = () => {
    if (balance < ENTRY_FEE) {
        alert("Not enough coins! Need 50.");
        return;
    }
    
    // Reset state
    removeCoins(ENTRY_FEE);
    setGameOver(false);
    setWin(null);
    setIsPlaying(true);
    setMultiplier(1.0);
    setPotentialWin(ENTRY_FEE);
    
    // Reset physics
    ballY.current = GAME_HEIGHT / 2;
    velocityY.current = -5; // Initial pop up
    
    gameLoop();
  };

  const cashOut = () => {
    cancelAnimationFrame(rafId.current!);
    setIsPlaying(false);
    addCoins(Math.floor(potentialWin));
    setWin(Math.floor(potentialWin));
  };

  const gameLoop = () => {
    if (!isPlaying) return;

    // Apply Physics
    velocityY.current += GRAVITY;
    ballY.current += velocityY.current;

    // Check Floor Collision
    if (ballY.current >= GAME_HEIGHT - BALL_SIZE) {
        handleLoss();
        return;
    }
    
    // Update DOM directly for performance
    if (ballRef.current) {
        ballRef.current.style.transform = `translateY(${ballY.current}px)`;
    }

    rafId.current = requestAnimationFrame(gameLoop);
  };

  const handleLoss = () => {
    cancelAnimationFrame(rafId.current!);
    setIsPlaying(false);
    setGameOver(true);
    ballY.current = GAME_HEIGHT - BALL_SIZE; // Snap to floor
    if (ballRef.current) ballRef.current.style.transform = `translateY(${GAME_HEIGHT - BALL_SIZE}px)`;
  };

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isPlaying || gameOver) return;
    e.stopPropagation(); // Prevent issues
    
    // Physics Jump
    velocityY.current = JUMP_FORCE;
    
    // Economy Math
    // Diminishing returns calculation or risky multiplier? 
    // Let's go with: Risk increases (gravity?), Reward increases linearly.
    // For simplicity:
    setMultiplier(m => {
        const newM = m + 0.1;
        setPotentialWin(Math.floor(ENTRY_FEE * newM));
        return newM;
    });
  };

  useEffect(() => {
    if (isPlaying) {
        rafId.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(rafId.current!);
  }, [isPlaying]);

  return (
    <div className="flex flex-col h-full bg-slate-900 border-x border-white/5 relative overflow-hidden select-none touch-none">
        {/* HUD */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start pointer-events-none">
            <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                <span className="text-sm text-gray-400">Multiplier</span>
                <div className="font-mono text-xl font-bold text-accent">x{multiplier.toFixed(1)}</div>
            </div>
             <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-right">
                <span className="text-sm text-gray-400">Win</span>
                <div className="font-mono text-xl font-bold text-warning">{Math.floor(potentialWin)}</div>
            </div>
        </div>

        {/* Game Area */}
        <div className="relative h-[400px] bg-slate-800/50 mt-16 mx-4 rounded-xl border border-white/5 overflow-hidden shadow-inner">
             {/* Lines or Background decor */}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
            
            {/* The Ball */}
            <div 
                ref={ballRef}
                onMouseDown={handleTap}
                onTouchStart={handleTap}
                className={clsx(
                    "absolute left-1/2 -ml-[30px] w-[60px] h-[60px] cursor-pointer active:scale-90 transition-transform duration-75 ease-linear z-10",
                    !isPlaying && !gameOver && "opacity-50 grayscale",
                    gameOver && "opacity-100 grayscale brightness-50"
                )}
                style={{ top: 0, touchAction: 'none' }}
            >
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-500 to-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.5)] flex items-center justify-center text-2xl">
                    ⚽️
                </div>
            </div>

            {/* Tap hint */}
            {isPlaying && multiplier === 1.0 && (
                <div className="absolute top-1/2 left-0 right-0 text-center text-white/20 animate-pulse pointer-events-none">
                    TAP TO JUMP
                </div>
            )}
            
            {/* Game Over / Win Screens overlay */}
            <AnimatePresence>
                {gameOver && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30"
                    >
                        <div className="text-center p-6 bg-slate-900 border border-slate-700 rounded-2xl">
                            <Ban className="w-12 h-12 text-red-500 mx-auto mb-2" />
                            <h3 className="text-2xl font-bold text-white mb-1">CRASHED!</h3>
                            <p className="text-gray-400 mb-4">You lost {ENTRY_FEE} coins</p>
                            <button onClick={startGame} className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg font-bold">Retry</button>
                        </div>
                    </motion.div>
                )}
                 {win !== null && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30"
                    >
                        <div className="text-center p-6 bg-slate-900 border border-slate-700 rounded-2xl">
                            <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                            <h3 className="text-2xl font-bold text-white mb-1">CASHED OUT!</h3>
                            <p className="text-accent text-xl font-bold mb-4">+{win} Coins</p>
                            <button onClick={startGame} className="bg-emerald-500 hover:bg-emerald-600 px-6 py-2 rounded-lg font-bold text-black">Play Again</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="mt-auto p-4 flex gap-4">
             {!isPlaying || gameOver || win !== null ? (
                 <button 
                    onClick={startGame}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl font-black text-xl tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg"
                 >
                    START GAME ({ENTRY_FEE})
                 </button>
             ) : (
                 <button 
                    onClick={cashOut}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl font-black text-xl tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg text-black"
                 >
                    CASH OUT ({Math.floor(potentialWin)})
                 </button>
             )}
        </div>
    </div>
  );
};

export default KeepieUppie;
