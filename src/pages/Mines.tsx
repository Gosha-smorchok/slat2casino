import React, { useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Bomb, Diamond } from 'lucide-react';
import clsx from 'clsx';

const GRID_SIZE = 25; // 5x5
const MINES_OPTIONS = [1, 3, 5, 10, 20];

// Simplified multipliers for 1, 3, 5 mines... (just demo math)
const getMultiplier = (mines: number, revealed: number) => {
    // This is a rough approximation of fair-ish odds
    const safeTiles = GRID_SIZE - mines;
    const remainingSafe = safeTiles - revealed;
    if (remainingSafe <= 0) return 0; // Should not happen
    
    // Probability of hitting next safe spot = remainingSafe / (25 - revealed)
    // Fair Odds = 1 / Probability
    // We take a small house edge off.
    const totalRemaining = GRID_SIZE - revealed;
    const prob = remainingSafe / totalRemaining;
    return 0.96 / prob; // 4% house edge logic per step
};

const Mines = () => {
    const { balance, removeCoins, addCoins } = useUserStore();
    const [bet, setBet] = useState(10);
    const [minesCount, setMinesCount] = useState(3);
    const [isPlaying, setIsPlaying] = useState(false);
    
    // Grid State
    // 0: Hidden, 1: Gem Revealed, 2: Mine Exploded, 3: Mine Revealed (after loss)
    const [gridState, setGridState] = useState<number[]>(Array(GRID_SIZE).fill(0)); 
    const [mineLocations, setMineLocations] = useState<boolean[]>([]);
    
    const revealedCount = gridState.filter(c => c === 1).length;
    
    // Calculate current winnings
    const currentMultiplier = revealedCount === 0 ? 1.0 : 
        Array.from({length: revealedCount}).reduce((acc: number, _, i) => acc * getMultiplier(minesCount, i), 1.0);
        
    const currentWin = Math.floor(bet * currentMultiplier);

    const startGame = () => {
        if (balance < bet) {
            alert("Not enough coins");
            return;
        }
        removeCoins(bet);
        setGridState(Array(GRID_SIZE).fill(0));
        setIsPlaying(true);
        
        // Plant mines
        const mines = Array(GRID_SIZE).fill(false);
        let placed = 0;
        while (placed < minesCount) {
            const idx = Math.floor(Math.random() * GRID_SIZE);
            if (!mines[idx]) {
                mines[idx] = true;
                placed++;
            }
        }
        setMineLocations(mines);
    };

    const cashOut = () => {
        setIsPlaying(false);
        addCoins(currentWin);
        // Reveal mines gently
        revealAllMines(false);
    };

    const handleTileClick = (index: number) => {
        if (!isPlaying || gridState[index] !== 0) return;

        if (mineLocations[index]) {
            // BOOM
            const newGrid = [...gridState];
            newGrid[index] = 2; // Exploded
            setGridState(newGrid);
            setIsPlaying(false);
            revealAllMines(true);
        } else {
            // GEM
            const newGrid = [...gridState];
            newGrid[index] = 1; // Gem
            setGridState(newGrid);
        }
    };

    const revealAllMines = (isLoss: boolean) => {
        const newGrid = [...gridState];
        mineLocations.forEach((isMine, idx) => {
            if (isMine && newGrid[idx] === 0) {
                 newGrid[idx] = 3; // Revealed mine
            }
            if (!isMine && isLoss && newGrid[idx] === 0) {
                 newGrid[idx] = 0; // Keep hidden or dim?
            }
        });
        setGridState(newGrid);
    };

    return (
        <div className="flex flex-col h-full gap-6">
            {/* Header / Stats */}
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                 <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Bat</div>
                    <div className="text-xl font-mono">{bet}</div>
                 </div>
                 <div className="text-right">
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Current Win</div>
                    <div className={clsx("text-xl font-mono font-bold", isPlaying && revealedCount > 0 ? "text-accent" : "text-white")}>
                        {currentWin}
                        {revealedCount > 0 && <span className="text-sm ml-1 text-slate-400">({currentMultiplier.toFixed(2)}x)</span>}
                    </div>
                 </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-5 gap-2 aspect-square">
                {gridState.map((cell, idx) => (
                    <motion.button
                        key={idx}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleTileClick(idx)}
                        disabled={!isPlaying && cell === 0}
                        className={clsx(
                            "rounded-lg relative flex items-center justify-center text-2xl transition-all shadow-sm",
                            cell === 0 ? "bg-slate-700 hover:bg-slate-600" : 
                            cell === 1 ? "bg-slate-800 border-2 border-accent" :
                            cell === 2 ? "bg-red-500 border-2 border-red-300 z-10 scale-110 shadow-red-500/50" :
                            "bg-slate-800 border border-slate-700 opacity-50" // Revealed mines (not exploded)
                        )}
                    >
                        <AnimatePresence>
                            {cell === 1 && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                    <Diamond className="w-8 h-8 text-accent fill-accent" />
                                </motion.div>
                            )}
                            {(cell === 2 || cell === 3) && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                    <Bomb className={clsx("w-8 h-8", cell === 2 ? "text-white fill-black" : "text-slate-500")} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                ))}
            </div>

            {/* Controls */}
            <div className="mt-auto space-y-4 bg-slate-900/50 p-4 rounded-xl border border-white/5">
                {!isPlaying ? (
                     <>
                        <div className="flex gap-2 items-center justify-between">
                            <span className="text-sm font-bold text-slate-400">Mines</span>
                            <div className="flex gap-1">
                                {MINES_OPTIONS.map(num => (
                                    <button 
                                        key={num}
                                        onClick={() => setMinesCount(num)}
                                        className={clsx(
                                            "w-8 h-8 rounded-md font-bold text-sm transition-colors",
                                            minesCount === num ? "bg-primary text-white" : "bg-slate-800 text-slate-400"
                                        )}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex gap-4 items-center">
                             <div className="flex-1 flex items-center gap-2 bg-slate-800 p-2 rounded-lg">
                                <button onClick={() => setBet(Math.max(10, bet - 10))} className="w-8 h-8 flex items-center justify-center bg-slate-700 rounded hover:bg-slate-600">-</button>
                                <div className="flex-1 text-center font-mono font-bold">{bet}</div>
                                <button onClick={() => setBet(bet + 10)} className="w-8 h-8 flex items-center justify-center bg-slate-700 rounded hover:bg-slate-600">+</button>
                             </div>
                             <button 
                                onClick={startGame}
                                className="flex-[2] py-3 bg-accent text-slate-900 font-black uppercase tracking-wide rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                             >
                                Play
                             </button>
                        </div>
                     </>
                ) : (
                    <button 
                        onClick={cashOut}
                        className={clsx(
                            "w-full py-4 rounded-xl font-black text-xl uppercase tracking-widest transition-all shadow-lg",
                            revealedCount > 0 
                                ? "bg-gradient-to-r from-accent to-emerald-500 text-slate-900 hover:scale-[1.02]" 
                                : "bg-slate-700 text-slate-500 cursor-not-allowed"
                        )}
                        disabled={revealedCount === 0}
                    >
                        {revealedCount === 0 ? "Pick a tile..." : `Cash Out ${currentWin}`}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Mines;
