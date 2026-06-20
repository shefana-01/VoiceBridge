import { useEffect, useState } from 'react';
import { journal as journalApi } from '../api/endpoints';
import { toast } from '../components/Toaster';

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState('');
  const [loading, setLoading] = useState(false);

  const [isWriting, setIsWriting] = useState(false);

  const fetchJournal = async () => {
    try {
      const res = await journalApi.list();
      setEntries(res.data.results || res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load journal entries');
    }
  };

  useEffect(() => {
    fetchJournal();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newEntry.trim()) return;
    setLoading(true);
    try {
      await journalApi.create({ text: newEntry.trim() });
      setNewEntry('');
      setIsWriting(false);
      toast.success('Journal entry saved');
      fetchJournal();
    } catch (err) {
      toast.error('Failed to save journal entry');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this journal entry?")) return;
    try {
      await journalApi.remove(id);
      toast.success('Entry deleted');
      fetchJournal();
    } catch (err) {
      toast.error('Failed to delete entry');
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full pb-20 animate-[fadeIn_0.3s_ease-out]">
      <header className="mb-10 text-center">
        <h1 className="font-serif-display text-4xl font-bold text-on-surface">Care Journal</h1>
        <p className="text-on-surface-variant mt-2 text-lg">A mindful space to document milestones, observations, and daily reflections.</p>
      </header>

      {!isWriting ? (
        <div className="flex justify-center mb-12">
          <button 
            onClick={() => setIsWriting(true)}
            className="w-48 h-48 rounded-[2.5rem] glass-card border-2 border-primary/20 flex flex-col items-center justify-center text-primary hover:bg-white/40 hover:scale-105 hover:shadow-xl transition-all group"
          >
            <span className="material-symbols-outlined text-5xl mb-3 group-hover:scale-110 transition-transform">add_reaction</span>
            <span className="font-bold text-lg">Add Yours</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handlePost} className="glass-card rounded-[2rem] border border-white/20 p-6 md:p-8 shadow-2xl mb-12 bg-surface-bright animate-[slideDown_0.3s_ease-out] relative">
          <button 
            type="button" 
            onClick={() => setIsWriting(false)}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-error-container hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">edit_note</span> Write Reflection
          </h2>
          <textarea 
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 text-on-surface text-lg focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none resize-none custom-scrollbar"
            rows={5}
            autoFocus
            placeholder="How was today? What new milestone did we reach?"
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
          />
          <div className="flex justify-end mt-4">
            <button 
              type="submit" 
              disabled={!newEntry.trim() || loading}
              className="vb-btn-primary flex items-center gap-2 px-8 py-3 text-lg rounded-full"
            >
              <span className="material-symbols-outlined">send</span>
              {loading ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {entries.length === 0 ? (
          <div className="text-center p-10 border-2 border-dashed border-outline-variant/30 rounded-2xl">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-2">auto_stories</span>
            <p className="text-on-surface-variant">Your journal is empty. Start writing your first reflection above!</p>
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="vb-card relative group animate-[slideUp_0.3s_ease-out]">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-primary bg-primary-container/30 px-3 py-1 rounded-full text-sm font-semibold border border-primary/10">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                  {new Date(entry.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  <span className="text-on-surface-variant/50 px-1">•</span>
                  {new Date(entry.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </div>
                <button 
                  onClick={() => handleDelete(entry.id)}
                  className="text-on-surface-variant/30 hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete entry"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
              <p className="text-on-surface whitespace-pre-wrap leading-relaxed">{entry.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
