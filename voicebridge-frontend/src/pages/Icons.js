/**
 * Icon library page.
 *
 * Upload form lets caregivers record audio directly in the browser via
 * MediaRecorder — no need for a separate audio app. Falls back to file upload
 * if the device denies mic permission.
 */
import { useEffect, useRef, useState, useCallback } from 'react';

import { icons as iconApi } from '../api/endpoints';
import { toast } from '../components/Toaster';

const CATEGORIES = [
  ['FOOD',       'Food & Drink'],
  ['EMOTIONS',   'Emotions'],
  ['BODY',       'Body & Hygiene'],
  ['ACTIVITIES', 'Activities'],
  ['PEOPLE',     'People'],
  ['PLACES',     'Places'],
  ['REQUESTS',   'Requests & Needs'],
  ['EMERGENCY',  'Emergency'],
  ['OTHER',      'Other'],
];

export default function IconsPage() {
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const audioRef = useRef(null);

  const load = useCallback(() =>
    iconApi.list(filter ? { category: filter } : {})
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
          <h1 className="font-serif-display text-3xl font-bold text-on-surface">Icon library</h1>
          <p className="text-on-surface-variant mt-1">
            Each icon is an image + the voice that speaks for it.
          </p>
        </div>
        <button onClick={() => setShowForm((s) => !s)}
                className="vb-btn-primary">
          {showForm ? 'Close' : '+ New icon'}
        </button>
      </header>

      {showForm && (
        <UploadForm onDone={() => { setShowForm(false); load(); }} />
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
                 className="vb-card p-3 text-center relative hover:-translate-y-0.5 transition-transform">
              <button onClick={() => play(ic.audio)} title="Play"
                      className="absolute top-2 right-2 w-8 h-8 rounded-full
                                 bg-surface-container-lowest border border-outline-variant
                                 flex items-center justify-center text-primary
                                 hover:border-primary">
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
function UploadForm({ onDone }) {
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [tts, setTts] = useState('');
  const [image, setImage] = useState(null);
  const [audio, setAudio] = useState(null);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);

  const recRef = useRef(null);
  const chunksRef = useRef([]);

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `recording-${Date.now()}.webm`,
                              { type: 'audio/webm' });
        setAudio(file);
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      recRef.current = rec;
      setRecording(true);
    } catch {
      toast.error('Could not access the microphone.');
    }
  };
  const stopRec = () => {
    recRef.current?.stop();
    setRecording(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!image || !audio) {
      toast.error('Both an image and an audio clip are required.');
      return;
    }
    const fd = new FormData();
    fd.append('label', label);
    fd.append('category', category);
    fd.append('tts_text', tts);
    fd.append('image', image);
    fd.append('audio', audio);

    setBusy(true);
    try {
      await iconApi.create(fd);
      toast.success(`Icon "${label}" added.`);
      onDone();
    } catch {
      toast.error('Upload failed — check file sizes and types.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="vb-card mb-6">
      <div className="grid sm:grid-cols-3 gap-3 mb-3">
        <div className="sm:col-span-2">
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
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="vb-label">Image (PNG/JPG, max 5 MB)</label>
          <input type="file" accept="image/*" required className="vb-input"
                 onChange={(e) => setImage(e.target.files[0])} />
        </div>
        <div>
          <label className="vb-label">Audio (MP3/WAV/OGG, max 3 MB)</label>
          <input type="file" accept="audio/*" className="vb-input"
                 onChange={(e) => setAudio(e.target.files[0])} />
          <div className="flex items-center gap-2 mt-2">
            {!recording ? (
              <button type="button" onClick={startRec}
                      className="vb-btn-secondary text-sm">● Record</button>
            ) : (
              <button type="button" onClick={stopRec}
                      className="vb-btn-danger text-sm">■ Stop</button>
            )}
            {audio && (
              <span className="text-xs text-on-surface-variant truncate">
                {audio.name}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="vb-label">Text-to-speech fallback (optional)</label>
        <input className="vb-input" value={tts}
               onChange={(e) => setTts(e.target.value)}
               placeholder="Used by the app if the audio file is unavailable." />
      </div>

      <button className="vb-btn-primary" disabled={busy}>
        {busy ? 'Uploading…' : 'Add icon'}
      </button>
    </form>
  );
}
