/**
 * Sanctuary Dashboard — adapted exactly from Stitch caregiver_sanctuary_atmospheric_edition.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  boards as boardApi,
  icons as iconApi,
  children as childApi,
  journal as journalApi,
} from '../api/endpoints';
import { toast } from '../components/Toaster';

function timeAgo(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) + ' • LOGGED';
}

export default function Dashboard() {
  const [boards, setBoards] = useState([]);
  const [children, setChildren] = useState([]);
  const [clarity, setClarity] = useState(0);
  const [insight, setInsight] = useState('');
  const [notes, setNotes] = useState([]);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    boardApi.list().then(({ data }) => setBoards(data.results ?? data)).catch(() => {});
    childApi.list().then(({ data }) => setChildren(data.results ?? data)).catch(() => {});

    iconApi.list().then(({ data }) => {
      const list = data.results ?? data;
      if (list.length) {
        const withAudio = list.filter((i) => i.audio).length;
        const pct = Math.round((withAudio / list.length) * 100);
        setClarity(pct);
        setInsight(`"${withAudio} of ${list.length} cards now play a recorded voice."`);
      } else {
        setClarity(0);
        setInsight('"Add cards with recorded audio to start tracking communication clarity."');
      }
    }).catch(() => {});

    journalApi?.list?.()
      .then(({ data }) => setNotes((data.results ?? data).slice(0, 3)))
      .catch(() => {});
  }, []);

  const activeChild = children[0];
  const saveNote = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    try {
      const { data } = await journalApi.create({
        text: draft.trim(),
        child: activeChild?.id || null,
      });
      setNotes((n) => [data, ...n].slice(0, 3));
      setDraft('');
      toast.success('Reflection saved.');
    } catch {
      setNotes((n) => [{ id: Date.now(), text: draft.trim(),
                         created_at: new Date().toISOString() }, ...n].slice(0, 3));
      setDraft('');
      toast.info('Saved locally.');
    } finally {
      setSaving(false);
    }
  };

  const r = 76;
  const c = 2 * Math.PI * r;
  const off = c - (clarity / 100) * c;

  return (
    <div className="grid grid-cols-12 gap-gutter flex-1">
      {/* Left Column: Communication Flow */}
      <section className="col-span-12 lg:col-span-5 flex flex-col gap-gutter">
        <div className="glass-card rounded-xl p-md shadow-xl shadow-primary/5 h-full flex flex-col">
          <div className="flex items-center justify-between mb-md">
            <h3 className="font-title-md text-primary">Communication Flow</h3>
            <span className="material-symbols-outlined text-secondary">insights</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-md">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" fill="transparent" r="76" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="20"></circle>
                <circle className="donut-ring" cx="96" cy="96" fill="transparent" r="76" stroke="url(#gradient-pastels)" strokeLinecap="round" strokeWidth="20" strokeDasharray={c} strokeDashoffset={off} style={{ transition: 'stroke-dashoffset 1s ease' }}></circle>
                <defs>
                  <linearGradient id="gradient-pastels" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#ffd1dc', stopOpacity: 1 }}></stop>
                    <stop offset="100%" style={{ stopColor: '#b8e8ee', stopOpacity: 1 }}></stop>
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-primary">{clarity}%</span>
                <span className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">Clarity</span>
              </div>
            </div>
            <div className="mt-xl text-center">
              <p className="italic text-on-surface font-headline-lg-mobile leading-relaxed">
                {insight}
              </p>
              <div className="mt-4 flex gap-2 justify-center">
                <span className="px-3 py-1 bg-tertiary-container text-on-tertiary-container rounded-full text-xs font-bold">Vocabulary Up</span>
                <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold">Social +12%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right Column: Active Boards */}
      <section className="col-span-12 lg:col-span-7">
        <div className="glass-card rounded-xl p-md shadow-xl shadow-primary/5 h-full">
          <div className="flex items-center justify-between mb-md">
            <h3 className="font-title-md text-secondary">Active Boards</h3>
            <Link to="/boards" className="text-secondary font-label-caps hover:underline">Edit Canvas</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Board Items */}
            {boards.slice(0, 3).map((b, i) => {
              const bgClasses = [
                'bg-primary-container/80 text-on-primary-container',
                'bg-secondary-container/80 text-on-secondary-container',
                'bg-tertiary-container/80 text-on-tertiary-container'
              ];
              const barClasses = ['bg-tertiary w-3/4', 'bg-secondary w-1/4', 'bg-primary w-1/2'];
              const iconClass = ['restaurant', 'nature_people', 'bedtime'];
              return (
                <Link to={`/boards/${b.id}/edit`} key={b.id} className="p-6 rounded-xl bg-white/30 border border-white/40 hover:bg-white/50 transition-all cursor-pointer group block">
                  <div className={`w-12 h-12 rounded-2xl ${bgClasses[i % 3]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <span className="material-symbols-outlined">{iconClass[i % 3]}</span>
                  </div>
                  <h4 className="font-title-md text-on-surface">{b.name}</h4>
                  <p className="text-sm text-on-surface-variant">{(b.items?.length ?? 0)} icons · {b.rows}×{b.cols}</p>
                  <div className="mt-4 w-full bg-white/40 h-1.5 rounded-full overflow-hidden">
                    <div className={`${barClasses[i % 3]} h-full rounded-full`}></div>
                  </div>
                </Link>
              );
            })}

            {/* Board Item: Add New */}
            <Link to="/boards/new" className="p-6 rounded-xl border-2 border-dashed border-white/50 flex flex-col items-center justify-center hover:bg-white/30 transition-all cursor-pointer">
              <span className="material-symbols-outlined text-on-surface-variant mb-2">add_circle</span>
              <span className="font-label-caps text-on-surface-variant">New Activity</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom Row: Care Journal */}
      <section className="col-span-12">
        <div className="glass-card rounded-xl p-md shadow-xl shadow-primary/5">
          <div className="flex items-center justify-between mb-md">
            <h3 className="font-title-md text-primary">Care Journal</h3>
            <span className="material-symbols-outlined text-primary">history_edu</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Journal Feed */}
            <div className="md:col-span-2 space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {notes.length === 0 ? (
                <p className="text-sm text-on-surface-variant italic">No entries yet. Start reflecting on today's moments.</p>
              ) : notes.map((n, i) => (
                <div key={n.id} className="care-feed-item glass-card rounded-xl p-4 flex gap-4 border-l-4 border-primary" style={{ animationDelay: `${i * 0.15}s` }}>
                  <div className="min-w-[48px] h-[48px] rounded-full bg-primary-container/80 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">edit_note</span>
                  </div>
                  <div>
                    <p className="font-body-lg text-on-surface">{n.text}</p>
                    <span className="text-xs text-on-surface-variant font-bold mt-2 inline-block uppercase">{timeAgo(n.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Save Entry Area */}
            <div className="bg-white/40 p-6 rounded-xl border border-white/30 flex flex-col">
              <h4 className="font-label-caps mb-4 text-primary">QUICK ENTRY</h4>
              <textarea 
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full h-24 bg-white/20 border-none rounded-xl focus:ring-2 focus:ring-primary/30 p-4 font-body-lg text-on-surface mb-4 resize-none outline-none" 
                placeholder="How is the moment feeling?"></textarea>
              <button 
                onClick={saveNote}
                disabled={saving || !draft.trim()}
                className="w-full py-4 bg-gradient-to-r from-primary to-primary/80 text-on-primary rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                <span className="material-symbols-outlined">save</span>
                {saving ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
