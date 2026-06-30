import { useState, useEffect } from 'react';
import { icons as iconApi, boards as boardApi } from '../api/endpoints';
import { toast } from './Toaster';

export default function ArasaacModal({ onClose, onImport, initialSaveType = 'icon' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [saveType, setSaveType] = useState(initialSaveType);

  const [boardList, setBoardList] = useState([]);
  const [addToBoard, setAddToBoard] = useState('');

  useEffect(() => {
    boardApi.list().then(({ data }) => setBoardList(data.results ?? data)).catch(() => {});
  }, []);

  const search = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`https://api.arasaac.org/api/pictograms/en/search/${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      } else {
        setResults([]);
        toast.error('No results found or ARASAAC is down.');
      }
    } catch {
      toast.error('Failed to connect to ARASAAC.');
    }
    setLoading(false);
  };
  const handleImport = async (pic) => {
    setImporting(true);
    try {
      const keyword = pic.keywords?.[0]?.keyword || query;
      await iconApi.importArasaac({
        arasaac_id: pic._id,
        label: keyword,
        category: 'OTHER',
        is_folder_dp: saveType === 'folder',
        add_to_board_id: saveType === 'icon' ? addToBoard : null
      });
      toast.success(`Imported ${keyword}!`);
      onImport(saveType);
    } catch {
      toast.error('Failed to import pictogram.');
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold font-serif-display text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">travel_explore</span>
              ARASAAC Global Library
            </h2>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-error transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="bg-primary-container/20 p-4 border-b border-outline-variant flex flex-col gap-4">
          <div className="flex gap-6 items-center flex-wrap">
            <span className="font-bold text-sm text-on-surface">Import as:</span>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
              <input type="radio" name="saveType" value="icon" checked={saveType === 'icon'} onChange={() => setSaveType('icon')} className="text-primary" />
              Icon Library (Will require voice, goes inside folders)
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
              <input type="radio" name="saveType" value="folder" checked={saveType === 'folder'} onChange={() => setSaveType('folder')} className="text-secondary" />
              Folder Library (Cover images only, no voice needed)
            </label>
          </div>
          
          {saveType === 'icon' && (
            <div className="flex items-center gap-4 bg-surface-container-low p-3 rounded-xl border border-outline-variant/50">
              <span className="font-bold text-sm text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">folder</span>
                Auto-place in Folder:
              </span>
              <select className="vb-input text-sm py-1.5 min-w-[250px]" value={addToBoard} onChange={(e) => setAddToBoard(e.target.value)}>
                <option value="">-- Library Only (Do not auto-place) --</option>
                {boardList.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <span className="text-xs text-on-surface-variant italic">
                (Instantly drops it into the next available grid slot)
              </span>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-surface-container-low">
          <form onSubmit={search} className="flex gap-2">
            <input 
              autoFocus
              className="vb-input flex-1" 
              placeholder="Search 13,000+ free pictograms (e.g. 'apple', 'happy')..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" disabled={loading} className="vb-btn-primary px-6">
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        <div className="p-4 overflow-y-auto flex-1 bg-surface">
          {results.length === 0 && !loading && (
            <div className="text-center text-on-surface-variant py-10 opacity-70">
              <span className="material-symbols-outlined text-5xl mb-2">search</span>
              <p>Type a word above to search the Spanish government's free AAC library.</p>
            </div>
          )}
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {results.map((pic) => (
              <div key={pic._id} className="relative group cursor-pointer border border-outline-variant rounded-xl p-2 hover:border-primary hover:shadow-md transition-all text-center"
                   onClick={() => handleImport(pic)}>
                <img src={`https://static.arasaac.org/pictograms/${pic._id}/${pic._id}_300.png`} 
                     alt="Pictogram" 
                     className="w-full aspect-square object-cover rounded-lg group-hover:scale-95 transition-transform bg-white" />
                <div className="mt-2 text-xs font-semibold text-on-surface truncate px-1">
                  {pic.keywords?.[0]?.keyword || `Icon ${pic._id}`}
                </div>
                
                {importing && (
                  <div className="absolute inset-0 bg-surface/80 flex items-center justify-center rounded-xl">
                    <span className="material-symbols-outlined animate-spin text-primary">sync</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
