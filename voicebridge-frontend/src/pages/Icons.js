/**
 * Icon library page.
 *
 * Upload form lets caregivers record audio directly in the browser via
 * MediaRecorder — no need for a separate audio app. Falls back to file upload
 * if the device denies mic permission.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { icons as iconApi, boards as boardApi } from '../api/endpoints';
import { toast } from '../components/Toaster';
import ArasaacModal from '../components/ArasaacModal';

export const CATEGORIES = [
  ['FOOD',         'Food & Drink'],
  ['EMOTIONS',     'Emotions'],
  ['BODY',         'Body & Hygiene'],
  ['ACTIVITIES',   'Activities'],
  ['PEOPLE',       'People'],
  ['PLACES',       'Places'],
  ['REQUESTS',     'Requests & Needs'],
  ['EMERGENCY',    'Emergency'],
  ['ROUTINES',     'Routines'],
  ['MEDICATIONS',  'Medications'],
  ['ANIMALS',      'Animals & Pets'],
  ['CLOTHING',     'Clothing & Accessories'],
  ['TOYS',         'Toys & Games'],
  ['SCHOOL',       'School & Education'],
  ['COLORS',       'Colors'],
  ['SHAPES',       'Shapes'],
  ['NUMBERS',      'Numbers & Math'],
  ['TIME',         'Time & Days'],
  ['WEATHER',      'Weather & Seasons'],
  ['TRANSPORT',    'Transportation'],
  ['NATURE',       'Nature & Outdoors'],
  ['HOME',         'Home & Furniture'],
  ['KITCHEN',      'Kitchen & Cooking'],
  ['BATHROOM',     'Bathroom Items'],
  ['BEDROOM',      'Bedroom Items'],
  ['ELECTRONICS',  'Electronics & Tech'],
  ['SPORTS',       'Sports & Fitness'],
  ['MUSIC',        'Music & Instruments'],
  ['ART',          'Art & Craft'],
  ['PROFESSIONS',  'Jobs & Professions'],
  ['HOLIDAYS',     'Holidays & Events'],
  ['CHORES',       'Chores & Tasks'],
  ['SENSORY',      'Sensory Needs'],
  ['SOCIAL',       'Social Greetings'],
  ['QUESTIONS',    'Questions'],
  ['DESCRIPTIONS', 'Adjectives & Descriptions'],
  ['ACTIONS',      'Actions & Verbs'],
  ['PREPOSITIONS', 'Positions & Directions'],
  ['PRONOUNS',     'Pronouns'],
  ['FEELINGS',     'Physical Feelings'],
  ['MEDICAL',      'Medical & Doctor'],
  ['THERAPY',      'Therapy & Exercises'],
  ['HOBBIES',      'Hobbies & Interests'],
  ['MEDIA',        'TV, Movies & Books'],
  ['SNACKS',       'Snacks & Treats'],
  ['DRINKS',       'Drinks & Beverages'],
  ['VEGETABLES',   'Vegetables'],
  ['FRUITS',       'Fruits'],
  ['DESSERTS',     'Desserts & Sweets'],
  ['UTENSILS',     'Utensils'],
  ['OTHER',        'Other'],
].sort((a, b) => a[1].localeCompare(b[1]));

export default function IconsPage() {
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState('');
  const [editingIcon, setEditingIcon] = useState(null);
  const [showArasaac, setShowArasaac] = useState(false);
  const audioRef = useRef(null);
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'arasaac') {
      setShowArasaac(true);
      setSearchParams({});
    } else if (action === 'upload') {
      setEditingIcon({});
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const load = useCallback(() =>
    iconApi.list({ is_folder_dp: 'false', ...(filter ? { category: filter } : {}) })
      .then(({ data }) => setList(data.results ?? data))
      .catch(() => {}), [filter]);

  useEffect(() => { load(); }, [load]);

  const play = (url) => {
    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.src = url;
    audioRef.current.play().catch(() => {});
  };

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif-display text-3xl font-bold text-on-surface">Icon Library</h1>
          <p className="text-on-surface-variant mt-1">
            Each icon is an image + the voice that speaks for it.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowArasaac(true)} className="vb-btn bg-secondary text-white hover:opacity-90 transition-opacity rounded-full px-6 py-2.5 font-bold shadow-md">
            Search ARASAAC
          </button>
          <button onClick={() => { setEditingIcon(editingIcon ? null : {}); }} className="vb-btn-primary">
            {editingIcon ? 'Close' : '+ New custom icon'}
          </button>
          <button onClick={() => nav('/library')} className="vb-btn bg-surface-container-high text-on-surface hover:bg-outline-variant transition-colors rounded-full px-6 py-2.5 font-bold shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Central Library
          </button>
        </div>
      </header>

      {editingIcon && (
        <UploadForm initialData={editingIcon} onDone={() => { setEditingIcon(null); load(); }} />
      )}
      
      {showArasaac && (
        <ArasaacModal onClose={() => setShowArasaac(false)} onImport={(type) => { 
          setShowArasaac(false); 
          if (type === 'folder') nav('/folder-dps');
          else load(); 
        }} />
      )}

      <div className="mb-4 max-w-xs">
        <label className="vb-label">Filter by category</label>
        <select className="vb-input" value={filter}
                onChange={(e) => setFilter(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {list.length === 0 ? (
        <div className="vb-card border-2 border-dashed border-outline-variant text-center py-16">
          <h3 className="text-xl font-bold mb-1">No icons yet</h3>
          <p className="text-on-surface-variant">
            Upload your first icon to start building boards.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {list.map((ic) => (
            <div key={ic.id}
                 onClick={() => setEditingIcon(ic)}
                 className="vb-card p-3 text-center relative hover:-translate-y-0.5 transition-transform cursor-pointer">
              <button onClick={(e) => { e.stopPropagation(); play(ic.audio); }} title="Play"
                      className="absolute top-2 right-2 w-8 h-8 rounded-full
                                 bg-surface-container-lowest border border-outline-variant
                                 flex items-center justify-center text-primary
                                 hover:border-primary z-10">
                ▶
              </button>
              <img src={ic.image} alt={ic.label}
                   className="w-full aspect-square object-cover rounded-md bg-surface-container" />
              <div className="font-semibold mt-2 text-sm">{ic.label}</div>
              <div className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                {ic.category}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ---------- Upload form (image + audio with browser recording) ---------- */
export function UploadForm({ onDone, initialData = {}, hideFolderSelect = false }) {
  const [label, setLabel]       = useState(initialData.label || '');
  const [category, setCategory] = useState(initialData.category || 'OTHER');
  const [image, setImage]       = useState(null);
  const [audio, setAudio]       = useState(null);
  const [recording, setRecording] = useState(false);
  const [tts, setTts]           = useState(initialData.tts_text || '');
  const [language, setLanguage] = useState(initialData.language || 'English');
  const [isShared, setIsShared] = useState(initialData.is_shared || false);
  const [busy, setBusy]         = useState(false);
  
  const [boardList, setBoardList] = useState([]);
  const [addToBoard, setAddToBoard] = useState('');

  // We use a mutable ref for MediaRecorder so we can stop it easily
  const mrRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    boardApi.list().then(({ data }) => setBoardList(data.results ?? data)).catch(() => {});
  }, []);

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        // File-like object so the backend accepts it
        const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
        setAudio(file);
        stream.getTracks().forEach(t => t.stop());
      };
      mrRef.current = mr;
      chunksRef.current = [];
      mr.start();
      setRecording(true);
    } catch {
      toast.error('Microphone access denied or unavailable.');
    }
  };

  const stopRec = () => {
    if (mrRef.current && recording) {
      mrRef.current.stop();
      setRecording(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('label', label);
      fd.append('category', category);
      if (image) fd.append('image', image);
      if (audio) fd.append('audio', audio);
      fd.append('tts_text', tts);
      fd.append('language', language);
      fd.append('is_shared', isShared);
      fd.append('is_folder_dp', 'false');
      if (addToBoard && !hideFolderSelect) {
        fd.append('add_to_board_id', addToBoard);
      }

      if (initialData.id) {
        const res = await iconApi.update(initialData.id, fd);
        toast.success('Icon updated!');
        if (onDone) onDone(res.data);
      } else {
        const res = await iconApi.create(fd);
        toast.success('Icon saved!');
        if (onDone) onDone(res.data);
      }
    } catch {
      toast.error('Failed to save icon.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this icon?')) return;
    setBusy(true);
    try {
      await iconApi.remove(initialData.id);
      toast.info('Icon deleted.');
      if (onDone) onDone(null);
    } catch {
      toast.error('Failed to delete icon.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="vb-card mb-6">
      <div className="grid sm:grid-cols-4 gap-3 mb-3">
        <div className={hideFolderSelect ? "sm:col-span-3" : "sm:col-span-2"}>
          <label className="vb-label">Label (what the icon represents)</label>
          <input className="vb-input" required
                 placeholder="e.g. Water"
                 value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>
        <div>
          <label className="vb-label">Category</label>
          <select className="vb-input" value={category}
                  onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        {!hideFolderSelect && (
          <div>
            <label className="vb-label">Place inside Folder</label>
            <select className="vb-input" value={addToBoard}
                    onChange={(e) => setAddToBoard(e.target.value)}>
              <option value="">-- No folder --</option>
              {boardList.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="vb-label">Image (PNG/JPG, max 5 MB)</label>
          {initialData.image && !image && (
            <div className="mb-2 relative w-20 h-20 rounded border border-outline-variant overflow-hidden">
              <img src={initialData.image} alt="Current" className="w-full h-full object-cover bg-surface-container" />
              <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center py-0.5">Current</div>
            </div>
          )}
          <input type="file" accept="image/*" required={!initialData.id} className="vb-input"
                 onChange={(e) => setImage(e.target.files[0])} />
        </div>
        <div>
          <label className="vb-label mb-2">Audio (Choose one method)</label>
          <div className="bg-surface-container/30 p-3 rounded-xl border border-outline-variant/30 space-y-4">
            {initialData.audio && !audio && !recording && (
              <div className="bg-surface p-2 rounded-lg border border-outline-variant/50 flex items-center justify-between">
                <span className="text-xs font-semibold text-primary">Current Audio</span>
                <audio src={initialData.audio} controls className="h-8 max-w-[200px]" />
              </div>
            )}
            {/* Option 1: File Upload */}
            <div>
              <p className="text-sm font-semibold mb-1 text-primary">Option 1: Upload File</p>
              <input type="file" className="vb-input text-sm"
                     onChange={(e) => setAudio(e.target.files[0])} />
            </div>

            {/* Option 2: Record with Mic */}
            <div className="border-t border-outline-variant/30 pt-3">
              <p className="text-sm font-semibold mb-2 text-primary">Option 2: Record Directly</p>
              <div className="flex items-center gap-3">
                {!recording ? (
                  <button type="button" onClick={startRec}
                          className="bg-secondary text-white px-4 py-2 rounded-full text-sm font-bold shadow-md hover:scale-105 transition-transform flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">mic</span> Start Recording
                  </button>
                ) : (
                  <button type="button" onClick={stopRec}
                          className="bg-error text-white px-4 py-2 rounded-full text-sm font-bold shadow-md hover:scale-105 transition-transform flex items-center gap-2 animate-pulse">
                    <span className="material-symbols-outlined text-sm">stop_circle</span> Stop Recording
                  </button>
                )}
                {audio && (
                  <span className="text-xs font-medium text-primary-fixed-dim bg-primary/10 px-3 py-1 rounded-full truncate max-w-[150px]">
                    {audio.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="vb-label">Text-to-speech fallback (optional)</label>
          <input className="vb-input" value={tts}
                 onChange={(e) => setTts(e.target.value)}
                 placeholder="Used by the app if audio fails." />
        </div>
        <div>
          <label className="vb-label">Language (for sharing)</label>
          <input className="vb-input" value={language}
                 onChange={(e) => setLanguage(e.target.value)}
                 placeholder="e.g. English, Bengali" />
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <label className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer select-none">
          <input 
            type="checkbox" 
            className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
            checked={isShared}
            onChange={(e) => setIsShared(e.target.checked)}
          />
          <span className="flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-[18px]">public</span>
            Share to Global Marketplace
          </span>
        </label>
        <div className="flex gap-3">
          {initialData.id && (
            <button type="button" onClick={remove} disabled={busy} className="vb-btn bg-error/10 text-error hover:bg-error/20 px-6 font-bold">
              Delete
            </button>
          )}
          <button className="vb-btn-primary px-8" disabled={busy}>
            {busy ? 'Saving…' : (initialData.id ? 'Save changes' : 'Add icon')}
          </button>
        </div>
      </div>
    </form>
  );
}
