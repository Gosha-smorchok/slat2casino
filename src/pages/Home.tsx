import { useNavigate } from 'react-router-dom';
import { Game } from '@/types';
import { motion } from 'framer-motion';
import { ArrowRight, Coins, TrendingUp } from 'lucide-react';

const GAMES: Game[] = [
  { id: 'crash', name: 'To The Moon', description: 'Eject before crash', path: '/crash', image: '🚀', category: 'crash', color: 'from-purple-600 to-indigo-900' },
  { id: 'plinko', name: 'Plinko', description: 'Drop the ball', path: '/plinko', image: '🎰', category: 'plinko', color: 'from-pink-500 to-rose-500' },
  { id: 'dungeon', name: 'Dungeon', description: 'Save the princess', path: '/dungeon', image: '🗡️', category: 'luck', color: 'from-indigo-600 to-violet-800' },
  { id: 'roulette', name: 'Roulette', description: 'Classic Wheel', path: '/roulette', image: '🎡', category: 'luck', color: 'from-red-500 to-rose-600' },
  { id: 'mines', name: 'Mines', description: 'Watch your step', path: '/mines', image: '💣', category: 'luck', color: 'from-slate-600 to-slate-800' },
];

const FARMING_GAMES: Game[] = [
  { id: 'lumberjack', name: 'Lumberjack', description: 'Chop wood for coins', path: '/lumberjack', image: '🪓', category: 'farming', color: 'from-amber-600 to-orange-500' },
  { id: 'keepie-uppie', name: 'Keepie Uppie', description: 'Don\'t drop the ball', path: '/keepie-uppie', image: '⚽️', category: 'farming', color: 'from-blue-500 to-cyan-400' },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Farming Section (NEW) */}
      <section>
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black flex items-center gap-2 tracking-tight">
            <Coins className="w-5 h-5 text-warning" />
            FREE COINS
            </h2>
            <span className="text-[10px] bg-warning/20 text-warning px-2 py-0.5 rounded-full font-bold uppercase">No Risk</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {FARMING_GAMES.map((game) => (
            <GameCard key={game.id} game={game} onClick={() => navigate(game.path)} />
          ))}
        </div>
      </section>

      {/* Casino Section */}
      <section>
        <h2 className="text-xl font-black mb-4 flex items-center gap-2 tracking-tight">
          <TrendingUp className="w-5 h-5 text-primary" />
          CASINO GAMES
        </h2>
        <div className="grid grid-cols-1 gap-3">
          {GAMES.map((game) => (
            <GameRow key={game.id} game={game} onClick={() => navigate(game.path)} />
          ))}
        </div>
      </section>

      {/* Coming Soon */}
      <section className="opacity-50">
        <h2 className="text-sm font-bold mb-3 uppercase text-gray-500 tracking-widest">
          Coming Soon
        </h2>
        <div className="grid grid-cols-2 gap-3">
             <div className="h-20 bg-white/5 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-xs font-bold text-gray-600">AVIATOR</div>
             <div className="h-20 bg-white/5 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-xs font-bold text-gray-600">PLINKO</div>
        </div>
      </section>
    </div>
  );
};

const GameCard = ({ game, onClick }: { game: Game, onClick: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`relative h-32 rounded-3xl p-4 flex flex-col justify-between overflow-hidden bg-gradient-to-br ${game.color} shadow-lg shadow-black/20 group`}
  >
    <div className="absolute top-0 right-0 p-4 opacity-30 text-6xl select-none grayscale-0 filter group-hover:scale-110 transition-transform">{game.image}</div>
    <span className="relative z-10 text-[9px] font-black uppercase tracking-wider opacity-60 bg-black/20 self-start px-2 py-0.5 rounded-md">{game.category}</span>
    <span className="relative z-10 text-lg font-black text-white text-left leading-tight">{game.name}</span>
  </motion.button>
);

const GameRow = ({ game, onClick }: { game: Game, onClick: () => void }) => (
  <motion.button 
    whileTap={{ scale: 0.98 }}
    onClick={onClick} 
    className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-3xl active:bg-white/10 transition-colors w-full text-left"
  >
    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-3xl shadow-lg`}>
      {game.image}
    </div>
    <div className="flex-1">
      <h3 className="font-black text-lg">{game.name}</h3>
      <p className="text-xs text-gray-500 font-medium">{game.description}</p>
    </div>
    <ArrowRight className="w-5 h-5 text-gray-700" />
  </motion.button>
);

export default Home;

