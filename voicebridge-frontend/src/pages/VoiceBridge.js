import { useEffect, useState, useRef } from 'react';
import { boards as boardApi } from '../api/endpoints';
import { toast } from '../components/Toaster';

export default function VoiceBridge() {
  const [boards, setBoards] = useState([]);
  const [activeBoard, setActiveBoard] = useState(null);
  const [sentence, setSentence] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    boardApi.list().then(res => {
      const bs = res.data.results || res.data;
      setBoards(bs);
      if (bs.length > 0) loadBoard(bs[0].id);
    });
  }, []);

  const loadBoard = (id) => {
    boardApi.detail(id).then(res => {
      setActiveBoard(res.data);
    }).catch(() => toast.error('Failed to load board'));
  };

  const playAudio = (url) => {
    if (!url) return Promise.resolve();
    return new Promise(resolve => {
      const audio = new Audio(url);
      audio.onended = resolve;
      audio.onerror = resolve; // Continue even if error
      audio.play().catch(resolve);
    });
  };

  const handleIconClick = (item) => {
    if (!item || !item.icon) return;
    
    // Add to sentence
    setSentence(prev => [...prev, item.icon]);
    
    // Play immediately
    if (item.icon.audio) {
      playAudio(item.icon.audio);
    }
  };

  const playSentence = async () => {
    if (isPlaying || sentence.length === 0) return;
    setIsPlaying(true);
    for (const icon of sentence) {
      if (icon.audio) {
        await playAudio(icon.audio);
      }
      // Small pause between words
      await new Promise(r => setTimeout(r, 200));
    }
    setIsPlaying(false);
  };

  const clearSentence = () => {
    setSentence([]);
  };

  const popSentence = () => {
    setSentence(prev => prev.slice(0, -1));
  };

  // Convert board.items (which has {row, col, icon}) to a full grid array
  // so we can render empty cells where no icon exists.
  const gridCells = [];
  if (activeBoard) {
    const totalCells = activeBoard.rows * activeBoard.cols;
    for (let i = 0; i < totalCells; i++) {
      const r = Math.floor(i / activeBoard.cols);
      const c = i % activeBoard.cols;
      const item = (activeBoard.items || []).find(it => it.row === r && it.col === c);
      gridCells.push(item || { empty: true, row: r, col: c });
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-4 pb-10">
      {/* Header / Board Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif-display font-bold text-on-surface">VoiceBridge Simulator</h1>
          <p className="text-sm text-on-surface-variant">Test out your custom boards and voices exactly as your child sees them.</p>
        </div>
        {boards.length > 0 && (
          <select 
            className="vb-input w-auto min-w-[250px] shadow-sm"
            value={activeBoard?.id || ''}
            onChange={e => loadBoard(e.target.value)}
          >
            {boards.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
      </div>

      {/* Sentence Bar */}
      <div className="flex flex-col sm:flex-row items-stretch gap-4 p-4 glass-card rounded-2xl border border-white/20 min-h-[120px] shadow-xl relative z-10">
        <div className="flex-1 flex gap-2 items-center overflow-x-auto custom-scrollbar bg-surface-container-low rounded-xl p-3 border border-outline-variant shadow-inner">
          {sentence.length === 0 ? (
            <span className="text-on-surface-variant px-4 font-bold tracking-wide uppercase text-sm opacity-50">
              Tap icons to build a sentence...
            </span>
          ) : (
            sentence.map((icon, i) => (
              <div key={i} className="flex flex-col items-center bg-white p-2 rounded-xl shadow min-w-[70px] animate-[slideUp_0.2s_ease-out]">
                {icon.image ? (
                  <img src={icon.image} alt={icon.label} className="w-12 h-12 object-cover rounded-lg" />
                ) : (
                  <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-lg flex items-center justify-center font-bold text-xl">
                    {icon.label?.[0]?.toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-bold mt-1 max-w-[70px] truncate text-on-surface">{icon.label}</span>
              </div>
            ))
          )}
        </div>
        
        <div className="flex sm:flex-col gap-2 shrink-0">
          <button 
            className={`flex-1 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              isPlaying || sentence.length === 0 ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg'
            }`}
            onClick={playSentence}
            disabled={isPlaying || sentence.length === 0}
          >
            <span className="material-symbols-outlined">{isPlaying ? 'volume_up' : 'play_arrow'}</span>
            Speak
          </button>
          <div className="flex gap-2">
            <button className="flex-1 p-3 rounded-xl bg-error-container text-error hover:opacity-80 flex items-center justify-center transition-opacity shadow-sm" onClick={clearSentence}>
              <span className="material-symbols-outlined text-sm">delete</span>
            </button>
            <button className="flex-1 p-3 rounded-xl bg-surface-container-high hover:bg-surface-dim flex items-center justify-center transition-colors shadow-sm" onClick={popSentence}>
              <span className="material-symbols-outlined text-sm">backspace</span>
            </button>
          </div>
        </div>
      </div>

      {/* AAC Grid */}
      <div className="flex-1 glass-card rounded-[2rem] border border-white/20 p-4 sm:p-6 shadow-xl flex flex-col min-h-0 bg-surface-container-low/50">
        {!activeBoard ? (
          <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-4 opacity-50">grid_view</span>
            <p className="font-bold text-lg">{boards.length === 0 ? 'No boards available.' : 'Loading board...'}</p>
            {boards.length === 0 && <p className="text-sm mt-2">Create a board in the Boards tab first!</p>}
          </div>
        ) : (
          <div 
            className="flex-1 grid gap-3 overflow-y-auto custom-scrollbar pr-2" 
            style={{ 
              gridTemplateColumns: `repeat(${activeBoard.cols || 4}, minmax(0, 1fr))`,
              gridAutoRows: '1fr',
              background: activeBoard.background_color || 'transparent'
            }}
          >
            {gridCells.map((cell, idx) => {
              if (cell.empty) {
                return (
                  <div 
                    key={idx} 
                    className="rounded-2xl border-2 border-dashed border-outline-variant/30 bg-surface-container-lowest/30 aspect-square"
                  />
                );
              }

              return (
                <button 
                  key={cell.icon.id + '-' + idx}
                  className="bg-white hover:bg-primary-container/30 hover:border-primary active:scale-95 transition-all rounded-2xl p-2 sm:p-3 shadow-md border-2 border-transparent flex flex-col items-center justify-center gap-1 sm:gap-2 overflow-hidden aspect-square"
                  onClick={() => handleIconClick(cell)}
                >
                  {cell.icon.image ? (
                    <img src={cell.icon.image} alt={cell.icon.label} className="w-full h-2/3 object-contain rounded-xl drop-shadow-sm" />
                  ) : (
                    <div className="w-full h-2/3 bg-primary-container text-on-primary-container rounded-xl flex items-center justify-center font-bold text-4xl drop-shadow-sm">
                      {cell.icon.label?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="font-bold text-on-surface text-center leading-tight text-xs sm:text-base truncate w-full">
                    {cell.icon.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
