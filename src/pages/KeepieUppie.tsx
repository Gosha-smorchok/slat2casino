import React, { useEffect, useRef, useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const GAME_HEIGHT = 400;
const BALL_SIZE = 60;
const REWARD_PER_TAP = 0.5;

const KeepieUppie = () => {
  const { addCoins } = useUserStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [combo, setCombo] = useState(1.0);
  const [earnedInSession, setEarnedInSession] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [lastTapTime, setLastTapTime] = useState(0);

  // Physics state (refs to avoid re-renders)
  const ballY = useRef(GAME_HEIGHT - BALL_SIZE);
  const velocityY = useRef(0);
  const rafId = useRef<number>();
  const ballRef = useRef<HTMLDivElement>(null);
  const sessionTotalRef = useRef(0);
  
  const startGame = () => {
    // Reset state
    setGameOver(false);
    setIsPlaying(true);
    setCombo(1.0);
    setEarnedInSession(0);
    sessionTotalRef.current = 0;
    
    // Reset physics
    ballY.current = GAME_HEIGHT / 2;
    velocityY.current = -5; // Initial pop up
    
    gameLoop();
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
    
    // Pay out
    const finalAmount = Math.floor(sessionTotalRef.current);
    if (finalAmount > 0) {
        addCoins(finalAmount);
    }
  };

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isPlaying || gameOver) return;
    e.stopPropagation();
    
    const now = Date.now();
    const timeSinceLast = now - lastTapTime;
    
    // Combo logic
    let newCombo = combo;
    if (timeSinceLast < 600) {
        newCombo = Math.min(5.0, combo + 0.2);
    } else {
        newCombo = 1.0;
    }
    
    setCombo(newCombo);
    setLastTapTime(now);

    // Physics Jump
    velocityY.current = JUMP_FORCE;
    
    // Reward
    const add = REWARD_PER_TAP * newCombo;
    setEarnedInSession(prev => prev + add);
    sessionTotalRef.current += add;
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
            <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-center">
                <span className="text-[10px] text-gray-500 uppercase font-bold">Combo</span>
                <div className={clsx("font-mono text-xl font-bold", combo > 1 ? "text-accent" : "text-white")}>
                    x{combo.toFixed(1)}
                </div>
            </div>
             <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-right">
                <span className="text-[10px] text-gray-500 uppercase font-bold">Earned</span>
                <div className="font-mono text-2xl font-bold text-warning">{earnedInSession.toFixed(1)}</div>
            </div>
        </div>

        {/* Game Area */}
        <div className="relative h-[400px] bg-slate-800/50 mt-16 mx-4 rounded-xl border border-white/5 overflow-hidden shadow-inner">
             {/* Floor - Avoid hitting! */}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
            
            {/* The Ball */}
            <div 
                ref={ballRef}
                onMouseDown={handleTap}
                onTouchStart={handleTap}
                className={clsx(
                    "absolute left-1/2 -ml-[30px] w-[60px] h-[60px] cursor-pointer active:scale-95 transition-transform duration-75 ease-linear z-10",
                    !isPlaying && !gameOver && "opacity-50 grayscale",
                    gameOver && "opacity-100 grayscale brightness-50"
                )}
                style={{ top: 0, touchAction: 'none' }}
            >
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-500 to-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.5)] flex items-center justify-center text-3xl">
                    ⚽️
                </div>
            </div>

            {/* Tap hint */}
            {!isPlaying && !gameOver && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-white/20 text-center animate-pulse">
                        <p className="text-3xl font-black">KEEPIE UPPIE</p>
                        <p className="text-sm">Tap the ball to earn coins!</p>
                    </div>
                </div>
            )}
            
            {/* Game Over Screen */}
            <AnimatePresence>
                {gameOver && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30"
                    >
                        <div className="text-center p-8 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl">
                            <h3 className="text-3xl font-black text-white mb-1">FLOOR HIT!</h3>
                            <p className="text-gray-400 mb-6">You kept it up well!</p>
                            
                            <div className="bg-black/40 p-4 rounded-xl mb-6">
                                <span className="text-gray-500 text-xs font-bold uppercase">Total Reward</span>
                                <div className="text-3xl font-black text-warning">+{Math.floor(sessionTotalRef.current)} Coins</div>
                            </div>
                            
                            <button onClick={startGame} className="w-full bg-primary hover:bg-primary/80 px-8 py-3 rounded-xl font-bold text-xl transition-all active:scale-95">Play Again</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="mt-auto p-6">
             {!isPlaying && (
                 <button 
                    onClick={startGame}
                    className="w-full py-5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl font-black text-2xl tracking-tight hover:brightness-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(59,130,246,0.5)]"
                 >
                    START PLAYING
                 </button>
             )}
             
             {isPlaying && (
                <div className="text-center opacity-40 animate-pulse font-bold text-sm uppercase tracking-widest py-5">
                    KEEP THE BALL IN THE AIR!
                </div>
             )}
        </div>
    </div>
  );
};

export default KeepieUppie;
