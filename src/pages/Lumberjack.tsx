import { useState, useEffect, useRef } from 'react';
import { useUserStore } from '@/store/userStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Axe, Zap, AlertTriangle, Play } from 'lucide-react';
import clsx from 'clsx';

type Side = 'left' | 'right' | 'none';

interface TreeSegment {
  id: number;
  branch: Side;
}

const BASE_REWARD = 0.1;
const COMBO_INCREMENT = 0.2; // How much combo increases per chop
const MAX_COMBO = 5.0;

const Lumberjack = () => {
  const { addCoins } = useUserStore();
  
  const [tree, setTree] = useState<TreeSegment[]>([]);
  const [playerSide, setPlayerSide] = useState<Side>('left');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalEarned, setTotalEarned] = useState(0);

  const scoreRef = useRef(0); // For immediate updates in callbacks

  // Initialize tree
  const initGame = () => {
    const initialTree: TreeSegment[] = [];
    for (let i = 0; i < 10; i++) {
        initialTree.push({ id: Math.random(), branch: 'none' });
    }
    setTree(initialTree);
    setPlayerSide('left');
    setScore(0);
    scoreRef.current = 0;
    setCombo(1);
    setIsGameOver(false);
    setIsPlaying(false);
    setTotalEarned(0);
  };

  useEffect(() => {
    initGame();
  }, []);

  // Combo decay logic
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    const interval = setInterval(() => {
        setCombo(prev => {
            const next = prev - 0.15; // Drip combo down
            return next < 1 ? 1 : next;
        });
    }, 150);

    return () => clearInterval(interval);
  }, [isPlaying, isGameOver]);

  const generateBranch = (lastBranch: Side): Side => {
    if (lastBranch !== 'none') return 'none';
    const rand = Math.random();
    if (rand < 0.4) return 'left';
    if (rand < 0.8) return 'right';
    return 'none';
  };

  const chop = (side: Side) => {
    if (isGameOver) return;
    if (!isPlaying) {
        setIsPlaying(true);
    }

    setPlayerSide(side);

    // The segment being chopped is the one at index 0 (the bottom)
    // Actually, it's easier to think of the player at index 0 and 
    // the branch they might hit is at index 0.
    const bottomSegment = tree[0];

    if (bottomSegment.branch === side) {
        handleGameOver();
        return;
    }

    // Success! 
    const reward = BASE_REWARD * combo;
    setScore(prev => prev + reward);
    scoreRef.current += reward;
    
    // Increase combo
    setCombo(prev => {
        const next = prev + COMBO_INCREMENT;
        return next > MAX_COMBO ? MAX_COMBO : next;
    });

    // Move tree down
    setTree(prev => {
        const next = [...prev.slice(1)];
        const lastBranch = next[next.length - 1]?.branch || 'none';
        next.push({ id: Math.random(), branch: generateBranch(lastBranch) });
        return next;
    });
  };

  const handleGameOver = () => {
    setIsGameOver(true);
    setIsPlaying(false);
    const finalReward = Math.floor(scoreRef.current);
    if (finalReward > 0) {
        addCoins(finalReward);
        setTotalEarned(finalReward);
    }
  };

  const getMultiplierColor = () => {
    if (combo >= 4) return 'text-red-500';
    if (combo >= 2.5) return 'text-orange-400';
    if (combo >= 1.5) return 'text-yellow-400';
    return 'text-white';
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white select-none touch-none overflow-hidden relative">
      {/* HUD */}
      <div className="p-4 flex justify-between items-center z-20">
        <div>
          <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">Earnings</div>
          <div className="text-2xl font-black text-warning font-mono">{score.toFixed(1)}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">Multiplier</div>
          <div className={clsx("text-2xl font-black font-mono flex items-center gap-1", getMultiplierColor())}>
            {combo >= 2 && <Zap size={20} className="fill-current" />}
            x{combo.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative flex justify-center items-end pb-12 bg-gradient-to-b from-sky-900 via-sky-950 to-slate-950">
        
        {/* Visual Background */}
        <div className="absolute inset-x-0 bottom-0 top-1/2 bg-[url('https://cdn-icons-png.flaticon.com/512/119/119596.png')] opacity-10 bg-repeat-x bg-bottom pointer-events-none" style={{ backgroundSize: '100px' }} />

        {/* Use clear tap indicators */}
        <div className="absolute inset-0 flex z-30 opacity-20 pointer-events-none">
            <div className={clsx("flex-1 bg-white/5 transition-opacity duration-75", playerSide === 'left' && "bg-white/20")} />
            <div className={clsx("flex-1 bg-white/5 transition-opacity duration-75", playerSide === 'right' && "bg-white/20")} />
        </div>

        {/* The Tree */}
        <div className="relative w-28 bg-[#5D4037] border-x-4 border-[#3E2723] flex flex-col-reverse items-center z-10 shadow-2xl">
            {tree.map((segment) => (
                <div 
                    key={segment.id} 
                    className="h-20 w-full relative flex-shrink-0 border-b border-[#3E2723]/30 flex items-center justify-center"
                >
                    {/* Bark detail */}
                    <div className="w-1 h-4 bg-black/10 absolute left-2 top-2 rounded-full" />
                    <div className="w-1 h-3 bg-black/10 absolute right-4 top-8 rounded-full" />

                    {segment.branch === 'left' && (
                        <div className="absolute right-full top-1/2 -translate-y-1/2 w-24 h-6 bg-green-800 rounded-l-xl border-l-4 border-y-2 border-green-950 shadow-lg flex items-center">
                            <div className="w-full h-1 bg-green-950/20" />
                        </div>
                    )}
                    {segment.branch === 'right' && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 w-24 h-6 bg-green-800 rounded-r-xl border-r-4 border-y-2 border-green-950 shadow-lg flex items-center">
                             <div className="w-full h-1 bg-green-950/20" />
                        </div>
                    )}
                </div>
            ))}
        </div>

        {/* Player */}
        <motion.div 
            animate={{ x: playerSide === 'left' ? -90 : 90 }}
            className="absolute bottom-24 z-20"
        >
            <div className="relative">
                <div className={clsx("text-6xl transition-transform", playerSide === 'left' ? "scale-x-100" : "-scale-x-100")}>
                    🪓
                </div>
                <div className="text-5xl absolute -bottom-4 -left-2 grayscale-[0.2]">🧔‍♂️</div>
            </div>
        </motion.div>

        {/* Tapping Overlay - Actual Buttons */}
        <div className="absolute inset-0 flex z-40">
            <div 
                className="flex-1 active:bg-white/5 relative bg-transparent" 
                onClick={() => chop('left')}
                onTouchStart={(e) => { e.preventDefault(); chop('left') }}
            >
                <div className="absolute bottom-20 left-10 text-white/20 text-4xl animate-pulse">L</div>
            </div>
            <div 
                className="flex-1 active:bg-white/5 relative bg-transparent" 
                onClick={() => chop('right')}
                onTouchStart={(e) => { e.preventDefault(); chop('right') }}
             >
                <div className="absolute bottom-20 right-10 text-white/20 text-4xl animate-pulse">R</div>
            </div>
        </div>

        {/* Start / Game Over Overlays remain the same... */}
        <AnimatePresence>
            {!isPlaying && !isGameOver && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/70 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center"
                >
                    <div className="bg-slate-900 p-8 rounded-3xl border border-white/10 shadow-2xl">
                        <Axe className="w-16 h-16 text-primary mx-auto mb-4 animate-bounce" />
                        <h2 className="text-3xl font-black mb-2 tracking-tighter">LUMBERJACK</h2>
                        <p className="text-gray-400 mb-6 text-sm">Tap sides to chop wood.<br/>Avoid the branches!</p>
                        <div className="flex flex-col gap-2">
                             <div className="text-xs text-accent font-bold bg-accent/10 py-1 px-3 rounded-full mb-2">FREE TO PLAY • EARN COINS</div>
                             <button 
                                onClick={() => setIsPlaying(true)}
                                className="w-full py-4 bg-primary rounded-2xl font-bold text-xl flex items-center justify-center gap-2"
                             >
                                <Play fill="currentColor" /> START
                             </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {isGameOver && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-red-950/80 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6 text-center"
                >
                    <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
                    <h2 className="text-4xl font-black mb-1">CRASH!</h2>
                    <p className="text-gray-300 mb-6">You hit a branch!</p>
                    
                    <div className="bg-black/40 p-6 rounded-2xl border border-white/10 mb-8 w-full max-w-xs">
                        <div className="text-gray-400 text-sm font-bold uppercase mb-1">Total Earned</div>
                        <div className="text-4xl font-black text-warning">+{totalEarned}</div>
                    </div>

                    <button 
                        onClick={initGame}
                        className="w-full max-w-xs py-4 bg-white text-black rounded-2xl font-bold text-xl"
                    >
                        PLAY AGAIN
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Controls Labels */}
      <div className="absolute bottom-10 inset-x-0 flex justify-between px-10 pointer-events-none opacity-50">
        <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-white flex items-center justify-center">L</div>
            <span className="text-[10px] font-bold">TAP LEFT</span>
        </div>
        <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-white flex items-center justify-center">R</div>
            <span className="text-[10px] font-bold">TAP RIGHT</span>
        </div>
      </div>
    </div>
  );
};

export default Lumberjack;
