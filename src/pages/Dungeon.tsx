import { useState, useEffect, useRef } from 'react';
import { useUserStore } from '@/store/userStore';
import { Shield, Skull, Crown, DoorOpen, Coins } from 'lucide-react';
import clsx from 'clsx';
import confetti from 'canvas-confetti';

// --- GAME CONFIG ---
const LEVELS = 10;
const HOUSE_EDGE = 0.03; // 3%

type GameStatus = 'idle' | 'playing' | 'dead' | 'won' | 'cashed_out';

const Dungeon = () => {
    const { balance, removeCoins, addCoins } = useUserStore();
    const [bet, setBet] = useState(100);
    const [difficulty, setDifficulty] = useState(2); // 2 doors, 3 doors, or 4 doors
    const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
    
    // Game State
    const [currentStep, setCurrentStep] = useState(0); // 0 to 10
    const [history, setHistory] = useState<number[]>([]); // Track choices (0, 1, 2...)
    const [multiplier, setMultiplier] = useState(1.0);
    const [winningPath, setWinningPath] = useState<number[]>([]); // Pre-generated path for this session

    // Scroll helper
    const scrollRef = useRef<HTMLDivElement>(null);

    // Calculate Step Multiplier
    const stepMultiplier = (1 / (1/difficulty)) * (1 - HOUSE_EDGE);
    const currentWin = Math.floor(bet * multiplier);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [currentStep, gameStatus]);

    const startGame = () => {
        if (balance < bet) {
            alert("Недостаточно монет!");
            return;
        }
        removeCoins(bet);
        
        // Generate Winning Path (Provably Fair -ish mock)
        const path = Array.from({ length: LEVELS }, () => Math.floor(Math.random() * difficulty));
        setWinningPath(path);
        
        setGameStatus('playing');
        setCurrentStep(0);
        setHistory([]);
        setMultiplier(1.0);
    };

    const makeMove = (doorIndex: number) => {
        if (gameStatus !== 'playing') return;

        const correctDoor = winningPath[currentStep];
        const isAlive = doorIndex === correctDoor;

        const newHistory = [...history, doorIndex];
        setHistory(newHistory);

        if (isAlive) {
            const nextStep = currentStep + 1;
            const newMult = multiplier * stepMultiplier;
            setMultiplier(newMult);
            setCurrentStep(nextStep);

            if (nextStep === LEVELS) {
                // JACKPOT / PRINCESS
                setGameStatus('won');
                addCoins(Math.floor(bet * newMult));
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            }
        } else {
            setGameStatus('dead');
        }
    };

    const cashOut = () => {
        if (gameStatus !== 'playing') return;
        setGameStatus('cashed_out');
        addCoins(currentWin);
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.8 } });
    };

    // Helper to render levels
    const renderLevel = (levelIndex: number) => {
        const isCurrent = levelIndex === currentStep;
        const isPassed = levelIndex < currentStep;
        // const isFuture = levelIndex > currentStep;
        
        // Calculate potential multiplier for this level visual
        // Start from 1.0, multiply by stepMultiplier 'levelIndex + 1' times
        const levelMult = Math.pow(stepMultiplier, levelIndex + 1);

        return (
            <div key={levelIndex} className={clsx(
                "flex items-center justify-between p-3 rounded-xl border mb-2 transition-all relative overflow-hidden",
                isCurrent && gameStatus === 'playing' ? "bg-indigo-900/50 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] scale-[1.02]" : 
                isPassed ? "bg-green-900/20 border-green-500/30 opacity-60" :
                "bg-slate-900/40 border-slate-800 opacity-80"
            )}>
                {/* Level info */}
                <span className="font-mono text-xs opacity-50 absolute top-1 left-2">LVL {levelIndex + 1}</span>
                <span className="font-mono font-bold text-yellow-400 absolute top-1 right-2">x{levelMult.toFixed(2)}</span>

                {/* Content Area */}
                <div className="flex w-full justify-center items-center gap-4 mt-4 mb-2">
                    {/* Doors Logic */}
                    {Array.from({ length: difficulty }).map((_, doorIdx) => {
                        // Visual State
                        let content = <DoorOpen className="w-8 h-8 text-slate-500" />;
                        let bgClass = "bg-slate-800 hover:bg-slate-700";
                        
                        if (isPassed) {
                            // History shows what we picked
                            if (history[levelIndex] === doorIdx) {
                                content = <Shield className="w-8 h-8 text-green-400" />;
                                bgClass = "bg-green-900/50 border-green-500";
                            } else {
                                bgClass = "bg-slate-900/20 opacity-20";
                            }
                        } else if (isCurrent && gameStatus === 'playing') {
                            content = <DoorOpen className="w-8 h-8 text-indigo-300 animate-pulse" />;
                            bgClass = "bg-indigo-900/40 border-indigo-500 cursor-pointer active:scale-95 transition-transform";
                        } else if (gameStatus === 'dead' && levelIndex === currentStep) {
                            // This was the fatal level
                            if (history[levelIndex] === doorIdx) {
                                content = <Skull className="w-8 h-8 text-red-500" />;
                                bgClass = "bg-red-900/50 border-red-500";
                            } else if (doorIdx === winningPath[levelIndex]) {
                                // Show where the safe spot was
                                content = <Shield className="w-8 h-8 text-green-500/50" />;
                                bgClass = "bg-green-900/20";
                            }
                        }

                        return (
                            <button 
                                key={doorIdx}
                                disabled={!isCurrent || gameStatus !== 'playing'}
                                onClick={() => makeMove(doorIdx)}
                                className={clsx(
                                    "w-16 h-16 rounded-lg border-2 flex items-center justify-center transition-all",
                                    bgClass
                                )}
                            >
                                {content}
                            </button>
                        );
                    })}
                </div>

                {/* Princess at Level 10 */}
                {levelIndex === LEVELS - 1 && (
                     <Crown className="w-5 h-5 text-yellow-500 absolute bottom-1 right-1 opacity-20" />
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-slate-950">
             {/* Header */}
             <div className="flex items-center justify-between p-4 bg-slate-900/50 backdrop-blur-sm border-b border-white/5">
                <div className="flex flex-col">
                    <span className="text-xs text-slate-400">Current Win</span>
                    <span className={clsx("text-2xl font-black font-mono", 
                        gameStatus === 'dead' ? "text-red-500" : "text-green-400"
                    )}>
                        {currentWin}
                    </span>
                </div>
                {gameStatus === 'playing' && currentStep > 0 && (
                     <button 
                        onClick={cashOut}
                        className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-full shadow-lg shadow-green-900/50 animate-bounce"
                     >
                        TAKE {currentWin} cr
                     </button>
                )}
            </div>

            {/* Game Screen - Scrollable from Bottom */}
            <div className="flex-1 overflow-y-auto min-h-0 bg-black/40 relative flex flex-col-reverse p-4" ref={scrollRef}>
                {/* Levels are rendered 0..9, but we want 9 at top, 0 at bottom visually */}
                {/* Actually with flex-col-reverse, the first item in DOM (0) is at bottom. Perfect. */}
                {Array.from({ length: LEVELS }).map((_, i) => renderLevel(i))}
                
                <div className="text-center pb-4 pt-10 opacity-50">
                    <h3 className="text-2xl font-bold tracking-[0.5em] text-slate-700">DUNGEON</h3>
                    <p className="text-xs text-slate-600">REACH THE PRINCESS</p>
                </div>
            </div>

            {/* Controls */}
            <div className="p-4 bg-slate-950 border-t border-white/10">
                {gameStatus === 'idle' || gameStatus === 'dead' || gameStatus === 'won' || gameStatus === 'cashed_out' ? (
                    <div className="space-y-4">
                        {/* Result Message */}
                        {gameStatus === 'dead' && (
                            <div className="text-red-500 text-center font-bold animate-pulse">
                                💀 YOU DIED AT LEVEL {currentStep + 1}
                            </div>
                        )}
                         {gameStatus === 'won' && (
                            <div className="text-yellow-400 text-center font-bold animate-pulse">
                                👑 PRINCESS SAVED! JACKPOT!
                            </div>
                        )}
                        {gameStatus === 'cashed_out' && (
                            <div className="text-green-400 text-center font-bold">
                                💰 ESCAPED WITH {currentWin}
                            </div>
                        )}

                        {/* Difficulty Selector */}
                        <div className="flex justify-center gap-2">
                            {[2, 3, 4].map(d => (
                                <button
                                    key={d}
                                    onClick={() => setDifficulty(d)}
                                    className={clsx(
                                        "flex-1 py-2 rounded-lg border font-bold text-sm transition-all",
                                        difficulty === d 
                                            ? "bg-indigo-600 border-indigo-400 text-white" 
                                            : "bg-slate-900 border-slate-700 text-slate-400"
                                    )}
                                >
                                    {d} Doors
                                </button>
                            ))}
                        </div>

                         {/* Quick Bets */}
                         <div className="grid grid-cols-4 gap-2">
                             {[100, 500, 1000, 5000].map(amt => (
                                 <button key={amt} onClick={() => setBet(amt)} className="bg-slate-800 text-xs rounded py-2 hover:bg-slate-700">
                                     {amt}
                                 </button>
                             ))}
                         </div>

                        {/* Bet Input & Start */}
                        <div className="flex gap-2 h-12">
                             <div className="relative flex-1">
                                <Coins className="w-4 h-4 absolute left-3 top-4 text-slate-500" />
                                <input 
                                    type="number" 
                                    value={bet} 
                                    onChange={(e) => setBet(Number(e.target.value))}
                                    className="w-full h-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 font-mono font-bold text-white focus:border-indigo-500 outline-none"
                                />
                             </div>
                             <button 
                                onClick={startGame}
                                className="w-1/2 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-lg rounded-lg shadow-lg shadow-yellow-900/20 active:translate-y-0.5 transition-all"
                             >
                                START
                             </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-slate-400 text-sm py-2">
                        CHOOSE A DOOR TO SURVIVE
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dungeon;
