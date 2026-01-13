import React, { useState, useEffect, useRef } from 'react';
import { useUserStore } from '@/store/userStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Settings2 } from 'lucide-react';
import clsx from 'clsx';

// --- TYPES & CONFIG ---
type RiskLevel = 'low' | 'medium' | 'high';
type RowsCount = 8 | 12 | 16;

interface Ball {
    id: number;
    path: number[]; // 0=Left, 1=Right
    currentStep: number; // Row index
    progress: number; // 0 to 1 between rows
    slotIndex: number;
    startX: number; // Random jitter on spawn
    multiplier: number;
}

// Multipliers (Simplified for valid rows/risks)
const MULTIPLIERS: Record<string, number[]> = {
    "8_low": [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
    "8_medium": [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
    "8_high": [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
    "12_low": [10, 3, 1.6, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.6, 3, 10], 
    // Fallback/Simulated mapping for other combos to save space...
    // In a real app we'd map all 16 rows.
};

// Helper: Get multiplier array or generate a dummy one if missing
const getMultipliers = (rows: number, risk: RiskLevel) => {
    const key = `${rows}_${risk}`;
    if (MULTIPLIERS[key]) return MULTIPLIERS[key];
    
    // Auto-generate a bell curve-ish array if not defined above
    const arr = [];
    const mid = rows / 2;
    for(let i=0; i<=rows; i++) {
        const dist = Math.abs(i - mid);
        let val = 0.5 + (dist * dist * (risk === 'high' ? 0.8 : risk === 'medium' ? 0.3 : 0.1));
        if (dist === 0) val = 0.3; // Center sink
        arr.push(parseFloat(val.toFixed(1)));
    }
    return arr;
};

// --- CONSTANTS ---
const PEG_GAP_X = 24; // Horizontal distance between pegs
const PEG_GAP_Y = 22; // Vertical distance between rows
const BALL_SPEED = 6; // Units per tick

const Plinko = () => {
    const { balance, removeCoins, addCoins } = useUserStore();
    
    // Setup State
    const [betAmount, setBetAmount] = useState(10);
    const [risk, setRisk] = useState<RiskLevel>('medium');
    const [rows, setRows] = useState<RowsCount>(8);
    
    // Game State
    const [balls, setBalls] = useState<Ball[]>([]);
    const [lastWin, setLastWin] = useState<{amount: number, mult: number} | null>(null);
    
    // Refs
    const ballsRef = useRef<Ball[]>([]);
    const requestRef = useRef<number>();
    const ballIdCounter = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Scaling Logic
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current) return;
            const availableWidth = containerRef.current.offsetWidth - 32; // padding
            // Approx Board Width = (rows + 1) * GAP (approx 30px per item with gap)
            // Let's use strict math if we know pins count.
            // visual width is roughly (rows + 3) * 20px?
            // Actually let's assume raw width is around rows * PEG_GAP_X
            
            const contentWidth = (rows + 2) * PEG_GAP_X; 
            
            let s = availableWidth / contentWidth;
            if (rows <= 8) s = Math.min(s, 1.4); // Zoom in for small board
            else s = Math.min(s, 1.0); // Fit large board
            
            setScale(s);
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [rows]);

    // Initial Multipliers
    const currentMultipliers = getMultipliers(rows, risk);

    // --- GAME LOOP ---
    const updatePhysics = () => {
        let needsUpdate = false;
        const activeBalls = ballsRef.current;
        const finishedBalls: number[] = []; // IDs to remove

        activeBalls.forEach(ball => {
            // Move ball
            ball.progress += 0.08; // Speed
            
            if (ball.progress >= 1) {
                // Move to next row
                ball.currentStep++;
                ball.progress = 0;
                
                // Check if finished (reached bottom)
                if (ball.currentStep >= rows) {
                    processWin(ball);
                    finishedBalls.push(ball.id);
                    needsUpdate = true;
                }
            }
            // Trigger React Render every frame is too heavy? 
            // Actually for <50 items it's fine in React 18 usually.
            // But strict mode might flicker. 
        });

        // Filter out finished balls
        if (finishedBalls.length > 0) {
            ballsRef.current = activeBalls.filter(b => !finishedBalls.includes(b.id));
            needsUpdate = true;
        }

        // Force render
        // Optimization: Only set state if balls list changed (add/remove) OR just always set to animate?
        // To animate smoothly in React without Canvas, we normally update state every frame.
        setBalls([...ballsRef.current]); 
        
        requestRef.current = requestAnimationFrame(updatePhysics);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(updatePhysics);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [rows]); // Reset loop if config changes substantially

    // --- CORE LOGIC ---
    const processWin = (ball: Ball) => {
        const payout = Math.floor(betAmount * ball.multiplier);
        if (payout > 0) {
            addCoins(payout);
            setLastWin({ amount: payout, mult: ball.multiplier });
        }
    };

    const dropBall = () => {
        if (balance < betAmount) {
            // alert("Not enough coins"); 
            return; 
        }
        
        // Instant deduct
        removeCoins(betAmount);

        // 1. Generate Path (Server Logic)
        const path: number[] = [];
        let rightTurns = 0;
        for (let i = 0; i < rows; i++) {
             // 50/50 Chance
             const dir = Math.random() > 0.5 ? 1 : 0;
             path.push(dir);
             rightTurns += dir;
        }

        const slotIndex = rightTurns;
        const multiplier = currentMultipliers[slotIndex];

        // 2. Add Ball
        const newBall: Ball = {
            id: ballIdCounter.current++,
            path,
            currentStep: 0,
            progress: 0,
            slotIndex,
            startX: Math.random() * 10 - 5, // Tiny jitter at start
            multiplier
        };
        
        ballsRef.current.push(newBall);
    };
    
    // --- RENDER HELPERS ---
    const getBallStyle = (ball: Ball) => {
        // Calculate Position
        // Row 0 is at top. 
        // X is centered.
        
        // Current Row Logic:
        // Center of row i is 0.
        // Pins are at (k - i/2) * GAP.
        // Ball is between pins.
        
        // Let's trace the path.
        // Start (Row 0): x=0, y=0.
        // Step 1: decided by path[0]. if 0->Left, 1->Right.
        // If 0, x shifts by -0.5 * GAP. If 1, x shifts by +0.5 * GAP.
        
        let x = 0;
        for(let i=0; i < ball.currentStep; i++) {
             const dir = ball.path[i];
             x += (dir === 0 ? -0.5 : 0.5) * PEG_GAP_X;
        }
        
        // Current transition (Interpolation)
        if (ball.currentStep < rows) {
             const nextDir = ball.path[ball.currentStep];
             // Target X change
             const dx = (nextDir === 0 ? -0.5 : 0.5) * PEG_GAP_X;
             
             // Simple Linear for X
             // x += dx * ball.progress; 
             
             // Physics-ish Bounce: Parabolic arc?
             // Or just linear x and gravity y.
             // Usually Plinko balls bounce up a bit when hitting a peg.
             
             x += dx * ball.progress;
             
             // Jitter
             // Add a little randomization mid-flight to look natural
             const bounce = Math.sin(ball.progress * Math.PI) * (Math.random() * 4); 
             x += bounce;
        }
        
        const y = ball.currentStep * PEG_GAP_Y + (ball.progress * PEG_GAP_Y);

        return {
            transform: `translate(${x}px, ${y}px)`,
            backgroundColor: ball.multiplier > 10 ? '#ef4444' : ball.multiplier > 2 ? '#f59e0b' : '#10b981'
        };
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 pb-safe-area-inset-bottom">
            {/* Game Area */}
            <div className="flex-1 overflow-hidden relative flex flex-col items-center pt-8" ref={containerRef}>
                
                {/* Scalable Contianer */}
                <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center', transition: 'transform 0.3s' }}>
                
                    {/* Board Container */}
                    <div className="relative mt-4">
                         {/* Pins Pyramid */}
                         {Array.from({ length: rows }).map((_, rowIndex) => {
                             const pinsInRow = rowIndex + 3; 
                             // Calculate Gap precisely. 
                             // We used GAP_X = 24.
                             // Pins width = 8 (w-2).
                             // We need (Gap + Pin) = 24. Gap should be 16.
                             return (
                                 <div 
                                    key={rowIndex} 
                                    className="flex justify-center mb-[14px]"
                                    style={{ gap: '16px', height: '8px' }} // 16px gap + 8px pin = 24px stride
                                 >
                                     {Array.from({ length: rowIndex + 3 }).map((__, pinIndex) => (
                                         <div key={pinIndex} className="w-2 h-2 rounded-full bg-white/20 shadow-[0_0_5px_rgba(255,255,255,0.2)]" />
                                     ))}
                                 </div>
                             )
                         })}
                         
                         {/* Balls Layer */}
                         <div className="absolute top-0 left-1/2 -ml-2 w-0 h-0"> {/* Center origin */}
                              {balls.map(ball => (
                                  <div
                                    key={ball.id}
                                    className="absolute w-3 h-3 rounded-full shadow-lg border border-black/20"
                                    style={getBallStyle(ball)}
                                  />
                              ))}
                         </div>
                    </div>

                    {/* Multiplier Buckets */}
                    <div className="mt-2 flex justify-center" style={{ gap: '4px' }}> {/* 4px gap + 20px width = 24px stride */}
                         {currentMultipliers.map((mult, i) => (
                             <div 
                                key={i}
                                className={clsx(
                                    "flex items-center justify-center rounded-sm font-bold text-[8px] h-8 shadow-sm transition-transform",
                                    mult >= 10 ? "bg-red-600 text-white" :
                                    mult >= 2 ? "bg-orange-500 text-white" :
                                    mult >= 1 ? "bg-amber-400 text-black" :
                                    "bg-emerald-500/50 text-emerald-100" // Loss
                                )}
                                style={{ width: '20px' }} // Explicit width to match stride
                             >
                                {mult}x
                             </div>
                         ))}
                    </div>
                
                </div> {/* End Scalable */}
                
                {/* Last Win Popup */}
                <AnimatePresence>
                     {lastWin && (
                         <motion.div 
                            key={performance.now()}
                            initial={{ opacity: 0, y: 10, scale: 0.5 }}
                            animate={{ opacity: 1, y: -20, scale: 1.2 }}
                            exit={{ opacity: 0 }}
                            className="absolute bottom-32 font-black text-3xl text-emerald-400 drop-shadow-md"
                         >
                            +{lastWin.amount}
                         </motion.div>
                     )}
                </AnimatePresence>

            </div>

            {/* Controls */}
            <div className="bg-slate-800 p-4 border-t border-white/10 space-y-4 z-10">
                {/* Settings */}
                <div className="flex gap-2">
                     <div className="flex-1 bg-slate-900 rounded-lg p-1 flex gap-1">
                         {(['low', 'medium', 'high'] as const).map(r => (
                             <button
                                key={r}
                                onClick={() => setRisk(r)}
                                className={clsx(
                                    "flex-1 rounded py-1 text-xs font-bold uppercase transition-colors",
                                    risk === r ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"
                                )}
                             >
                                 {r}
                             </button>
                         ))}
                     </div>
                     <div className="flex-1 bg-slate-900 rounded-lg p-1 flex gap-1">
                         {(['8', '12', '16'] as const).map(r => (
                             <button
                                key={r}
                                onClick={() => setRows(parseInt(r) as RowsCount)}
                                className={clsx(
                                    "flex-1 rounded py-1 text-xs font-bold uppercase transition-colors",
                                    rows === parseInt(r) ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"
                                )}
                             >
                                 {r}
                             </button>
                         ))}
                     </div>
                </div>

                {/* Bet & Play */}
                <div className="flex gap-4 items-center">
                     <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl flex-1 border border-white/5">
                        <button onClick={() => setBetAmount(Math.max(10, betAmount - 10))} className="w-10 h-10 bg-slate-800 rounded-lg font-bold text-xl hover:bg-slate-700">-</button>
                        <div className="flex-1 text-center font-mono font-bold">{betAmount}</div>
                        <button onClick={() => setBetAmount(betAmount + 10)} className="w-10 h-10 bg-slate-800 rounded-lg font-bold text-xl hover:bg-slate-700">+</button>
                     </div>
                     
                     <button
                         onClick={dropBall}
                         className="flex-[1.5] h-14 bg-gradient-to-tr from-rose-500 to-pink-500 rounded-xl font-black text-xl uppercase shadow-lg shadow-rose-500/20 active:scale-95 transition-transform"
                     >
                         DROP
                     </button>
                </div>
            </div>
        </div>
    );
};

export default Plinko;
