import React, { useState, useEffect, useRef } from 'react';
import { useUserStore } from '@/store/userStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Flame, Rocket, Trophy, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

// --- CONFIG ---
const START_MULTIPLIER = 1.00;
const SPEED = 0.06; // Exponential growth speed
const HOUSE_EDGE_CHANCE_INSTANT = 0.01; // 1% instant crash
const COOLDOWN_SECONDS = 5;

// --- GAME STATES ---
type GameState = 'WAITING' | 'FLYING' | 'CRASHED';

const Crash = () => {
    // Store
    const { balance, removeCoins, addCoins } = useUserStore();

    // Local State
    const [gameState, setGameState] = useState<GameState>('WAITING');
    const [multiplier, setMultiplier] = useState(START_MULTIPLIER);
    const [cooldown, setCooldown] = useState(COOLDOWN_SECONDS);
    
    // Refs for Game Loop Logic (Source of Truth)
    const gameStateRef = useRef<GameState>('WAITING');
    const crashPointRef = useRef<number>(0);
    const requestRef = useRef<number>();
    const startTimeRef = useRef<number>(0);
    
    // Betting State
    const [betAmount, setBetAmount] = useState(10);
    const [hasBet, setHasBet] = useState(false);
    const [cashedOut, setCashedOut] = useState(false);
    const [winAmount, setWinAmount] = useState(0);

    // Sync state to refs for UI consistency if needed, but mainly use refs in loop
    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);

    // --- GAME LOOP ---
    const tick = () => {
        if (gameStateRef.current !== 'FLYING') return;

        const now = Date.now();
        const elapsed = (now - startTimeRef.current) / 1000;

        // Exponential Growth Formula
        const currentMult = Math.floor(100 * Math.exp(SPEED * elapsed)) / 100;

        if (currentMult >= crashPointRef.current) {
            handleCrash(crashPointRef.current);
        } else {
            setMultiplier(currentMult);
            requestRef.current = requestAnimationFrame(tick);
        }
    };

    const handleCrash = (finalValue: number) => {
        setMultiplier(finalValue);
        setGameState('CRASHED'); // This triggers useEffect to update ref, but we update ref immediately too just in case
        gameStateRef.current = 'CRASHED';
        
        if (requestRef.current) cancelAnimationFrame(requestRef.current);

        // Auto restart after delay
        setTimeout(() => {
            resetGame();
        }, 3000);
    };

    const resetGame = () => {
        setGameState('WAITING');
        gameStateRef.current = 'WAITING';
        setMultiplier(1.00);
        setHasBet(false);
        setCashedOut(false);
        setWinAmount(0);
        setCooldown(5); // Start cooldown timer
    };

    // --- COOLDOWN TIMER ---
    useEffect(() => {
        let interval: any;
        if (gameState === 'WAITING') {
            interval = setInterval(() => {
                setCooldown((prev) => {
                    if (prev <= 1) {
                        // Time to start!
                        // We need to call startGame but ensure it's safe inside interval
                        // We'll perform the start logic here directly or call a stable function
                        startGame();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [gameState]); // Dependency on gameState means this recreates when state changes

    const startGame = () => {
        const r = Math.random();
        // 1% chance for instant 1.00x crash
        const nextCrash = Math.max(1.00, 0.99 / (1 - r));
        
        crashPointRef.current = nextCrash;
        
        setGameState('FLYING');
        gameStateRef.current = 'FLYING';
        
        startTimeRef.current = Date.now();
        requestRef.current = requestAnimationFrame(tick);
    };

    // --- ACTIONS ---
    const handleBet = () => {
        if (gameState !== 'WAITING') return;
        if (balance < betAmount) {
            alert("Not enough coins!");
            return;
        }
        if (removeCoins(betAmount)) {
            setHasBet(true);
        }
    };

    const handleCashOut = () => {
        if (gameState !== 'FLYING' || !hasBet || cashedOut) return;
        
        const win = Math.floor(betAmount * multiplier);
        addCoins(win);
        setWinAmount(win);
        setCashedOut(true);
    };

    // --- CLEANUP ---
    useEffect(() => {
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    // --- VISUALIZATION HELPERS ---
    // Rocket position based on multiplier (clamped for visual bounds)
    const getRocketStyle = () => {
        if (gameState === 'WAITING' || gameState === 'CRASHED') return { x: 0, y: 0, rotate: -45 };
        
        // Simple linear interpolation for demo, ideally logarithmic visualization
        const progress = Math.min((multiplier - 1) / 10, 1); // 0 to 1 over first 10x
        
        return {
            x: progress * 100, // Move right
            y: -progress * 200, // Move up
            rotate: 0 // Straight up? or tilted
        };
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 relative overflow-hidden">
            {/* Background Animation (Stars) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={clsx("absolute inset-0 transition-opacity duration-1000", gameState === 'FLYING' ? "opacity-100" : "opacity-30")}>
                     {/* CSS-based Stars would go here, simplified as dots */}
                     {[...Array(20)].map((_, i) => (
                        <div 
                            key={i}
                            className="absolute bg-white rounded-full w-1 h-1 animate-pulse"
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`
                            }}
                        />
                     ))}
                </div>
            </div>

            {/* Game Canvas Layer */}
            <div className="flex-1 relative flex items-center justify-center">
                
                {/* Multiplier Big Text */}
                <div className="absolute top-20 left-0 right-0 text-center z-10">
                    <div className={clsx(
                        "text-6xl font-black tabular-nums tracking-tighter transition-colors",
                        gameState === 'CRASHED' ? "text-red-500" : 
                        gameState === 'FLYING' ? "text-white" : "text-slate-500"
                    )}>
                        {multiplier.toFixed(2)}x
                    </div>
                    
                    {gameState === 'CRASHED' && (
                        <div className="text-red-500 font-bold uppercase tracking-widest mt-2 animate-bounce">
                            CRASHED
                        </div>
                    )}
                    
                    {gameState === 'WAITING' && (
                        <div className="flex flex-col items-center mt-4">
                             <div className="text-accent font-bold uppercase tracking-widest mb-2">Next Round in</div>
                             <div className="text-4xl font-mono text-white">{cooldown}</div>
                        </div>
                    )}
                </div>

                {/* Rocket Visual Area */}
                <div className="relative w-full max-w-sm h-64 flex items-end px-12 pb-12">
                    {/* Trajectory SVG */}
                    {gameState === 'FLYING' && (
                         <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{overflow: 'visible'}}>
                             <path 
                                d={`M 0,256 Q ${50 + (multiplier * 2)},${256 - (multiplier * 10)} ${100 + (multiplier * 10)},${256 - (multiplier * 20)}`}
                                fill="none"
                                stroke="rgba(139, 92, 246, 0.5)"
                                strokeWidth="4"
                                strokeDasharray="10 10"
                                className="opacity-50"
                             />
                         </svg>
                    )}

                    <motion.div
                        className="relative z-20"
                        animate={{
                             x: gameState === 'FLYING' ? 50 + (Math.min(multiplier, 10) * 20) : 0,
                             y: gameState === 'FLYING' ? -(Math.min(multiplier, 10) * 20) : 0,
                             rotate: gameState === 'CRASHED' ? 180 : gameState === 'FLYING' ? -35 : 0
                        }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    >
                         {/* Exhaust Flame */}
                         {gameState === 'FLYING' && (
                             <motion.div 
                                className="absolute top-10 -left-4 text-orange-500 transform rotate-90"
                                animate={{ scale: [1, 1.2, 0.9, 1.1] }}
                                transition={{ repeat: Infinity, duration: 0.2 }}
                             >
                                 <Flame size={40} className="fill-orange-500 blur-sm" />
                             </motion.div>
                         )}
                         
                         <Rocket size={64} className={clsx(
                             "fill-gray-200", 
                             gameState === 'CRASHED' ? "text-red-500 fill-red-900" : "text-white"
                         )} />
                    </motion.div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-slate-800/80 backdrop-blur-lg border-t border-white/10 p-4 pb- safe-area-inset-bottom z-30">
                {/* Result Message for Player */}
                {cashedOut && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-full left-0 right-0 bg-emerald-500/20 backdrop-blur-md border-t border-emerald-500/30 p-2 text-center"
                    >
                         <div className="text-emerald-400 font-bold uppercase text-sm">Cashed Out!</div>
                         <div className="text-2xl font-black text-white">+{winAmount.toLocaleString()}</div>
                    </motion.div>
                )}

                {!hasBet ? (
                    <div className="flex gap-4 items-center">
                         <div className="flex-[2] flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-white/5">
                            <button 
                                onClick={() => setBetAmount(Math.max(10, betAmount - 10))} 
                                className="w-10 h-10 flex items-center justify-center bg-slate-800 rounded-lg hover:bg-slate-700 active:bg-slate-600 transition-colors text-xl font-bold"
                            >
                                -
                            </button>
                            <div className="flex-1 text-center">
                                <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Bet Amount</div>
                                <div className="font-mono font-bold text-xl">{betAmount}</div>
                            </div>
                            <button 
                                onClick={() => setBetAmount(betAmount + 10)} 
                                className="w-10 h-10 flex items-center justify-center bg-slate-800 rounded-lg hover:bg-slate-700 active:bg-slate-600 transition-colors text-xl font-bold"
                            >
                                +
                            </button>
                         </div>
                         
                         <button 
                            onClick={handleBet}
                            disabled={gameState !== 'WAITING'}
                            className={clsx(
                                "flex-1 h-14 rounded-xl font-black text-lg uppercase tracking-wider flex flex-col items-center justify-center transition-all shadow-lg",
                                gameState === 'WAITING' 
                                    ? "bg-gradient-to-tr from-emerald-500 to-emerald-400 text-slate-900 hover:scale-[1.02] active:scale-95 shadow-emerald-500/20" 
                                    : "bg-slate-700 text-slate-500 cursor-not-allowed opacity-50"
                            )}
                         >
                            {gameState === 'WAITING' ? "PLACE BET" : "WAITING..."}
                         </button>
                    </div>
                ) : (
                    <button 
                        onClick={handleCashOut}
                        disabled={cashedOut || gameState === 'CRASHED'}
                        className={clsx(
                            "w-full h-16 rounded-xl font-black text-2xl uppercase tracking-widest transition-all shadow-xl flex flex-col items-center justify-center relative overflow-hidden",
                            cashedOut ? "bg-slate-700 text-slate-400" :
                            gameState === 'CRASHED' ? "bg-red-600/50 text-red-200 border-2 border-red-500/50" :
                            "bg-gradient-to-tr from-orange-500 to-amber-500 text-white hover:brightness-110 active:scale-95 shadow-orange-500/30"
                        )}
                    >
                         {cashedOut ? (
                             <span>WAITING FOR NEXT ROUND</span>
                         ) : gameState === 'CRASHED' ? (
                             <span>FLEW AWAY</span>
                         ) : (
                             <>
                                 <span className="text-sm opacity-80 font-bold">CASH OUT</span>
                                 <span>{Math.floor(betAmount * multiplier).toLocaleString()}</span>
                             </>
                         )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Crash;
