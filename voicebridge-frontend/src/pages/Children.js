import { useEffect, useState } from 'react';

import { children as childApi } from '../api/endpoints';
import { toast } from '../components/Toaster';

export default function Children() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name: '', date_of_birth: '', notes: '' });
  const [busy, setBusy] = useState(false);

  const load = () =>
    childApi.list()
      .then(({ data }) => setList(data.results ?? data))
      .catch(() => {});

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form };
      if (!payload.date_of_birth) delete payload.date_of_birth;
      await childApi.create(payload);
      setForm({ name: '', date_of_birth: '', notes: '' });
      toast.success('Child profile added.');
      load();
    } catch {
      toast.error('Could not save profile.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this profile? Their boards will also be removed.')) return;
    await childApi.remove(id);
    toast.info('Profile removed.');
    load();
  };

  return (
    <>
      <header className="mb-8">
        <h1 className="font-serif-display text-3xl font-bold text-on-surface">Children</h1>
        <p className="text-on-surface-variant mt-1">
          A profile for each non-verbal individual you support.
        </p>
      </header>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div>
          {list.length === 0 ? (
            <div className="vb-card border-2 border-dashed border-outline-variant text-center py-16">
              <h3 className="text-xl font-bold mb-1">No profiles yet</h3>
              <p className="text-on-surface-variant">
                Add your first child to start building boards for them.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {list.map((c) => (
                <div className="vb-card" key={c.id}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{c.name}</h3>
                      <div className="text-xs text-on-surface-variant mt-1 font-mono bg-surface-variant px-1.5 py-0.5 rounded inline-block">
                        Child ID: {c.id}
                      </div>
                      {c.date_of_birth && (
                        <div className="text-xs text-on-surface-variant mt-1">
                          DOB: {c.date_of_birth}
                        </div>
                      )}
                    </div>
                    <button onClick={() => remove(c.id)}
                            className="vb-btn-danger text-xs px-3 py-1.5">
                      Remove
                    </button>
                  </div>
                  {c.notes && (
                    <p className="text-sm text-on-surface mt-3">{c.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={submit} className="vb-card sticky top-4">
          <h3 className="text-lg font-bold mb-4">Add a child</h3>

          <label className="vb-label">Name</label>
          <input className="vb-input mb-3" required
                 value={form.name}
                 onChange={(e) => setForm({ ...form, name: e.target.value })} />

          <label className="vb-label">Date of birth (optional)</label>
          <input className="vb-input mb-3" type="date"
                 value={form.date_of_birth}
                 onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />

          <label className="vb-label">Private notes</label>
          <textarea className="vb-input mb-4" rows={4}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })} />

          <button className="vb-btn-primary w-full" disabled={busy}>
            {busy ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      </div>
    </>
  );
}
