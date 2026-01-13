import { useNavigate } from 'react-router-dom';
import { Game } from '@/types';
import { motion } from 'framer-motion';
import { ArrowRight, Dice5, CircleDollarSign, Ghost, TowerControl, TrendingUp } from 'lucide-react';

const GAMES: Game[] = [
  { id: 'roulette', name: 'Roulette', description: 'Classic Wheel', path: '/roulette', image: '🎡', category: 'luck', color: 'from-red-500 to-rose-600' },
  { id: 'keepie-uppie', name: 'Keepie Uppie', description: 'Don\'t drop the ball', path: '/keepie-uppie', image: '⚽️', category: 'skill', color: 'from-blue-500 to-cyan-400' },
  { id: 'mines', name: 'Mines', description: 'Watch your step', path: '/mines', image: '💣', category: 'luck', color: 'from-slate-600 to-slate-800' },
  { id: 'crash', name: 'Aviator', description: 'Fly high', path: '#', image: '🚀', category: 'luck', color: 'from-orange-500 to-red-500' },
  { id: 'plinko', name: 'Plinko', description: 'Drop & Win', path: '#', image: '🎰', category: 'luck', color: 'from-pink-500 to-purple-500' },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent" />
          Hot Games
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {GAMES.filter(g => g.path !== '#').map((game) => (
            <GameCard key={game.id} game={game} onClick={() => navigate(game.path)} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Ghost className="w-5 h-5 text-secondary" />
          More Adventures
        </h2>
        <div className="space-y-3">
          {GAMES.filter(g => g.path === '#').map((game) => (
            <GameRow key={game.id} game={game} onClick={() => alert("Coming Soon!")} />
          ))}
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
    className={`relative h-32 rounded-2xl p-4 flex flex-col justify-between overflow-hidden bg-gradient-to-br ${game.color}`}
  >
    <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl select-none grayscale-0 filter">{game.image}</div>
    <span className="relative z-10 text-xs font-bold uppercase tracking-wider opacity-70 bg-black/20 self-start px-2 py-0.5 rounded-md">{game.category}</span>
    <span className="relative z-10 text-xl font-bold text-white text-left">{game.name}</span>
  </motion.button>
);

const GameRow = ({ game, onClick }: { game: Game, onClick: () => void }) => (
  <div onClick={onClick} className="flex items-center gap-4 p-3 bg-white/5 border border-white/5 rounded-xl active:bg-white/10 transition-colors">
    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl`}>
      {game.image}
    </div>
    <div className="flex-1">
      <h3 className="font-bold">{game.name}</h3>
      <p className="text-xs text-gray-400">{game.description}</p>
    </div>
    <ArrowRight className="w-5 h-5 text-gray-600" />
  </div>
);

export default Home;
