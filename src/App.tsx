import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, User, Hash, ChevronRight, Save } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  number: string;
}

const STORAGE_KEY = 'volley_rotation_tracker_v1';

const ROTATION_ORDER = [1, 6, 5, 4, 3, 2];

const INITIAL_PLAYERS: Record<number, Player> = {
  1: { id: 'p1', name: 'Player 1', number: '1' },
  2: { id: 'p2', name: 'Player 2', number: '2' },
  3: { id: 'p3', name: 'Player 3', number: '3' },
  4: { id: 'p4', name: 'Player 4', number: '4' },
  5: { id: 'p5', name: 'Player 5', number: '5' },
  6: { id: 'p6', name: 'Player 6', number: '6' },
};

export default function App() {
  const [players, setPlayers] = useState<Record<number, Player>>(INITIAL_PLAYERS);
  const [startingPlayers, setStartingPlayers] = useState<Record<number, Player>>(INITIAL_PLAYERS);
  const [rotationCount, setRotationCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.players) setPlayers(parsed.players);
        if (parsed.startingPlayers) setStartingPlayers(parsed.startingPlayers);
        if (typeof parsed.rotationCount === 'number') setRotationCount(parsed.rotationCount);
      } catch (e) {
        console.error('Failed to parse saved data', e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ players, startingPlayers, rotationCount }));
    }
  }, [players, startingPlayers, rotationCount, isInitialized]);

  const rotate = useCallback(() => {
    setPlayers((prev) => {
      const nextPlayers: Record<number, Player> = {};
      for (let i = 0; i < ROTATION_ORDER.length; i++) {
        const currentPos = ROTATION_ORDER[i];
        const nextPos = ROTATION_ORDER[(i + 1) % ROTATION_ORDER.length];
        nextPlayers[nextPos] = prev[currentPos];
      }
      return nextPlayers;
    });
    setRotationCount(c => c + 1);
  }, []);

  const updatePlayer = (pos: number, field: keyof Player, value: string) => {
    setPlayers((prev) => ({
      ...prev,
      [pos]: { ...prev[pos], [field]: value },
    }));

    setStartingPlayers((prev) => {
      const i = ROTATION_ORDER.indexOf(pos);
      const shift = rotationCount % ROTATION_ORDER.length;
      const originalIdx = (i - shift + ROTATION_ORDER.length) % ROTATION_ORDER.length;
      const originalPos = ROTATION_ORDER[originalIdx];
      return {
        ...prev,
        [originalPos]: { ...prev[originalPos], [field]: value },
      };
    });
  };

  const resetAll = () => {
    if (confirm('Bạn có chắc chắn muốn quay lại vị trí bắt đầu?')) {
      setPlayers(startingPlayers);
      setRotationCount(0);
    }
  };

  if (!isInitialized) return <div className="min-h-screen bg-zinc-950" />;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center p-3 sm:p-6 md:p-10 font-sans selection:bg-orange-500/30">
      <header className="w-full max-w-6xl flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 md:mb-12">
        <div className="text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-4 mb-2">
            <div className="w-2 h-10 bg-orange-600 rounded-full hidden sm:block" />
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase italic text-orange-500 leading-none">
              Volley Rotation
            </h1>
          </div>
          <p className="text-zinc-500 font-mono text-[10px] sm:text-xs uppercase tracking-[0.3em] opacity-70">
            Advanced Position Tracking System
          </p>
        </div>
        
        <div className="flex items-center justify-between sm:justify-end gap-6 bg-zinc-900/40 p-3 sm:p-0 rounded-2xl sm:bg-transparent border border-zinc-800 sm:border-none">
          <div className="flex flex-col items-start sm:items-end px-3 sm:px-0">
            <span className="text-[10px] md:text-sm font-mono text-zinc-500 uppercase font-black">Rotations</span>
            <span className="text-2xl md:text-4xl font-mono leading-none font-black text-white">{rotationCount}</span>
          </div>
          <div className="flex gap-2">
             <button
              onClick={resetAll}
              className="p-4 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-600 hover:text-zinc-400 transition-all active:scale-95"
              title="Khởi động lại"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-4xl flex flex-col items-center gap-8 md:gap-12">
        {/* Court Section */}
        <div className="w-full relative aspect-[4/3] bg-zinc-900 rounded-[2.5rem] border-2 border-zinc-800 p-3 sm:p-8 shadow-[0_0_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col group/court transition-all duration-700 hover:border-zinc-700">
          {/* Court markings */}
          <div className="absolute inset-x-6 sm:inset-x-12 inset-y-10 sm:inset-y-16 border-2 border-zinc-700/20 rounded-sm pointer-events-none transition-colors group-hover/court:border-zinc-700/40">
            <div className="absolute top-1/2 left-0 right-0 border-t-[4px] border-zinc-600/30 border-dashed" />
            <div className="absolute top-1/3 left-0 right-0 border-t border-zinc-700/10" />
            <div className="absolute bottom-1/3 left-0 right-0 border-t border-zinc-700/10" />
          </div>

          <div className="h-full grid grid-rows-2 gap-4 sm:gap-10 relative z-10">
            <div className="grid grid-cols-3 gap-4 sm:gap-10">
              {[4, 3, 2].map((pos) => (
                <PositionCard 
                  key={pos} 
                  pos={pos} 
                  player={players[pos] as Player} 
                  onUpdate={(f, v) => updatePlayer(pos, f, v)} 
                />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4 sm:gap-10">
              {[5, 6, 1].map((pos) => (
                <PositionCard 
                  key={pos} 
                  pos={pos} 
                  player={players[pos] as Player} 
                  onUpdate={(f, v) => updatePlayer(pos, f, v)} 
                />
              ))}
            </div>
          </div>
        </div>

        <button
          id="rotate-btn"
          onClick={rotate}
          className="w-full sm:w-auto flex items-center justify-center gap-4 bg-orange-600 hover:bg-orange-500 active:scale-95 transition-all text-white px-12 md:px-20 py-5 md:py-6 rounded-2xl font-black uppercase tracking-widest group shadow-2xl shadow-orange-900/40 text-base md:text-xl border-b-4 border-orange-800 hover:border-orange-700"
        >
          <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700 ease-in-out" />
          <span className="whitespace-nowrap">Xoay Cầu Thủ</span>
        </button>
      </main>
    </div>
  );
}

function PositionCard({ pos, player, onUpdate }: { pos: number, player: Player, onUpdate: (f: keyof Player, v: string) => void }) {
  return (
    <motion.div
      layout
      transition={{ type: 'spring', damping: 25, stiffness: 180 }}
      className="bg-zinc-800/90 backdrop-blur-lg border-2 border-zinc-700/50 rounded-2xl sm:rounded-[2rem] p-2.5 sm:p-6 flex flex-col hover:bg-zinc-800 hover:border-orange-500/60 transition-all shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] relative group overflow-hidden h-full"
    >
      <div className="absolute top-2 right-2 sm:top-5 sm:right-5 w-6 h-6 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-[10px] sm:text-lg font-black shadow-2xl z-20 text-zinc-500 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-500 transition-all group-hover:scale-110 group-hover:-rotate-6">
        {pos}
      </div>
      
      {/* Name section - Centered vertically and horizontally */}
      <div className="flex-1 flex flex-col justify-center items-center -mt-2 sm:-mt-4">
        <input
          type="text"
          value={player.name}
          onChange={(e) => onUpdate('name', e.target.value)}
          className="w-full bg-transparent border-b-2 border-transparent focus:border-orange-500 focus:outline-none text-xs sm:text-2xl font-black text-white placeholder:text-zinc-700 truncate transition-all py-1 text-center"
          placeholder="Tên..."
        />
      </div>

      {/* Number section - At the bottom */}
      <div className="flex items-center sm:items-end justify-center sm:justify-between gap-2 sm:gap-3">
        <div className="min-w-0">
          <label className="hidden sm:block text-[9px] sm:text-xs uppercase font-black text-zinc-500 mb-1.5 tracking-widest transition-colors group-hover:text-orange-500/60 text-center sm:text-left">Số áo</label>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
            <Hash className="w-3 h-3 sm:w-5 sm:h-5 text-zinc-600 shrink-0 group-hover:text-orange-500 transition-colors" />
            <input
              type="text"
              value={player.number}
              onChange={(e) => onUpdate('number', e.target.value)}
              className="w-12 sm:w-full bg-transparent border-b-2 border-transparent focus:border-orange-500 focus:outline-none text-base sm:text-3xl font-mono font-black text-white p-0 text-center sm:text-left"
              placeholder="00"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
