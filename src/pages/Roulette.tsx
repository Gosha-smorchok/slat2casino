import React, { useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { motion, useAnimation } from 'framer-motion';
import clsx from 'clsx';
import { Coins } from 'lucide-react';

const NUMBERS = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

const Roulette = () => {
    const { balance, removeCoins, addCoins } = useUserStore();
    const [spinning, setSpinning] = useState(false);
    const [betAmount, setBetAmount] = useState(10);
    const [selectedType, setSelectedType] = useState<'red' | 'black' | 'green' | number | null>(null);
    const [lastNumber, setLastNumber] = useState<number | null>(null);
    
    const controls = useAnimation();

    const getNumberColor = (num: number) => {
        if (num === 0) return 'green';
        const index = NUMBERS.indexOf(num);
        return index % 2 === 0 ? 'red' : 'black'; // Simplified logic (usually varies)
    };

    const spin = async () => {
        if (spinning || !selectedType || betAmount <= 0) return;
        
        if (!removeCoins(betAmount)) {
            alert("Not enough coins!");
            return;
        }

        setSpinning(true);
        setLastNumber(null);
        
        // Random winning index
        const winningIndex = Math.floor(Math.random() * 37);
        const winningNumber = NUMBERS[winningIndex];
        const rot = 360 * 5 + (winningIndex * (360 / 37)); // 5 full spins + target

        await controls.start({
            rotate: rot,
            transition: { duration: 3, ease: "easeOut" }
        });

        // Calculate Win
        let win = 0;
        const color = getNumberColor(winningNumber);

        if (typeof selectedType === 'number') {
            if (selectedType === winningNumber) win = betAmount * 36;
        } else {
            if (selectedType === color) win = betAmount * 2;
            if (selectedType === 'green' && winningNumber === 0) win = betAmount * 14; // Higher payout for 0
        }

        if (win > 0) {
            addCoins(win);
            setTimeout(() => alert(`You Won ${win}!`), 500);
        }

        setLastNumber(winningNumber);
        setSpinning(false);
        controls.set({ rotate: winningIndex * (360 / 37) }); // Reset to actual position but keep rotation visual
    };

    return (
        <div className="flex flex-col items-center gap-8 p-4">
            {/* Wheel */}
            <div className="relative w-64 h-64">
                <div className="absolute top-0 left-1/2 -ml-0.5 w-1 h-8 bg-warning z-20 arrow-down" />
                <motion.div 
                    animate={controls}
                    className="w-full h-full rounded-full border-4 border-gray-800 bg-gray-900 relative overflow-hidden shadow-2xl"
                    style={{ background: 'conic-gradient(from 0deg, #ef4444 0 9.7deg, #000000 9.7deg 19.4deg, #ef4444 19.4deg 29.1deg, #000000 29.1deg 38.8deg, #ef4444 38.8deg 48.5deg, #000000 48.5deg 58.2deg, #ef4444 58.2deg 67.9deg, #000000 67.9deg 77.6deg, #ef4444 77.6deg 87.3deg, #000000 87.3deg 97deg, #ef4444 97deg 106.7deg, #000000 106.7deg 116.4deg, #ef4444 116.4deg 126.1deg, #000000 126.1deg 135.8deg, #ef4444 135.8deg 145.5deg, #000000 145.5deg 155.2deg, #ef4444 155.2deg 164.9deg, #000000 164.9deg 174.6deg, #ef4444 174.6deg 184.3deg, #000000 184.3deg 194deg, #ef4444 194deg 203.7deg, #000000 203.7deg 213.4deg, #ef4444 213.4deg 223.1deg, #000000 223.1deg 232.8deg, #ef4444 232.8deg 242.5deg, #000000 242.5deg 252.2deg, #ef4444 252.2deg 261.9deg, #000000 261.9deg 271.6deg, #ef4444 271.6deg 281.3deg, #000000 281.3deg 291deg, #ef4444 291deg 300.7deg, #000000 300.7deg 310.4deg, #ef4444 310.4deg 320.1deg, #000000 320.1deg 329.8deg, #ef4444 329.8deg 339.5deg, #000000 339.5deg 349.2deg, #10b981 349.2deg 360deg)'}}
                >
                    {/* Inner Circle to make it look nicer */}
                    <div className="absolute inset-8 bg-gray-900 rounded-full flex items-center justify-center border-4 border-gray-800">
                        {lastNumber !== null && (
                            <span className={clsx("text-4xl font-bold", getNumberColor(lastNumber) === 'red' ? "text-danger" : getNumberColor(lastNumber) === 'green' ? "text-accent" : "text-white")}>
                                {lastNumber}
                            </span>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Controls */}
            <div className="w-full max-w-sm space-y-4">
                <div className="flex items-center justify-center gap-4 bg-white/5 p-3 rounded-xl">
                    <button onClick={() => setBetAmount(Math.max(10, betAmount - 10))} className="w-8 h-8 rounded-full bg-white/10">-</button>
                    <div className="flex items-center gap-2">
                         <Coins className="w-4 h-4 text-warning" />
                         <span className="font-mono text-xl">{betAmount}</span>
                    </div>
                    <button onClick={() => setBetAmount(betAmount + 10)} className="w-8 h-8 rounded-full bg-white/10">+</button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <BetButton 
                        color="bg-red-600" 
                        label="RED" 
                        active={selectedType === 'red'} 
                        onClick={() => setSelectedType('red')} 
                    />
                     <BetButton 
                        color="bg-emerald-600" 
                        label="ZERO" 
                        active={selectedType === 'green'} 
                        onClick={() => setSelectedType('green')} 
                    />
                    <BetButton 
                        color="bg-gray-900" 
                        label="BLACK" 
                        active={selectedType === 'black'} 
                        onClick={() => setSelectedType('black')} 
                    />
                </div>

                <button 
                    disabled={spinning || !selectedType}
                    onClick={spin}
                    className="w-full py-4 text-lg font-bold uppercase tracking-widest rounded-xl bg-gradient-to-r from-warning to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-yellow-500/20 active:scale-95 transition-all text-black"
                >
                    {spinning ? "Spinning..." : "SPIN"}
                </button>
            </div>
        </div>
    );
};

const BetButton = ({ color, label, active, onClick }: any) => (
    <button 
        onClick={onClick}
        className={clsx(
            "py-3 rounded-lg font-bold border-2 transition-all", 
            color,
            active ? "border-white scale-105" : "border-transparent opacity-80"
        )}
    >
        {label}
    </button>
);

export default Roulette;
