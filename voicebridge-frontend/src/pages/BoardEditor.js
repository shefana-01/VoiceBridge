/**
 * Board editor — the Canva-style canvas.
 *
 *   ┌─────────────────────────────────┐ ┌──────────────┐
 *   │   Grid canvas (rows × cols)     │ │  Icon picker │
 *   │   Drag tile from picker → cell  │ │  (sticky)    │
 *   │   Click × on a cell to remove   │ │              │
 *   └─────────────────────────────────┘ └──────────────┘
 *
 * State: items is an array of {row, col, icon}. We use HTML5 drag-and-drop
 * (no extra library needed).
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  boards as boardApi,
  icons  as iconApi,
  children as childApi,
} from '../api/endpoints';
import { toast } from '../components/Toaster';

export default function BoardEditor() {
  const { id } = useParams();
  const isNew  = !id;
  const nav    = useNavigate();

  const [name, setName]     = useState('Untitled board');
  const [desc, setDesc]     = useState('');
  const [rows, setRows]     = useState(4);
  const [cols, setCols]     = useState(4);
  const [bg, setBg]         = useState('#FFFFFF');
  const [childId, setChild] = useState('');
  const [items, setItems]   = useState([]);  // {row, col, icon}

  const [iconLib, setIconLib] = useState([]);
  const [kids, setKids]       = useState([]);
  const [busy, setBusy]       = useState(false);
  const [dragIcon, setDrag]   = useState(null);

  /* ---- bootstrap ---- */
  useEffect(() => {
    iconApi.list().then(({ data }) => setIconLib(data.results ?? data)).catch(() => {});
    childApi.list().then(({ data }) => setKids(data.results ?? data)).catch(() => {});
    if (!isNew) {
      boardApi.detail(id).then(({ data }) => {
        setName(data.name);
        setDesc(data.description || '');
        setRows(data.rows); setCols(data.cols);
        setBg(data.background_color || '#FFFFFF');
        setChild(data.child || '');
        setItems((data.items || []).map((it) => ({
          row: it.row, col: it.col, icon: it.icon,
        })));
      });
    }
  }, [id, isNew]);

  /* ---- helpers ---- */
  const itemAt = (r, c) => items.find((it) => it.row === r && it.col === c);

  const dropOnCell = (r, c) => {
    if (!dragIcon) return;
    setItems((prev) => {
      const without = prev.filter((it) => !(it.row === r && it.col === c));
      return [...without, { row: r, col: c, icon: dragIcon }];
    });
    setDrag(null);
  };
  const removeAt = (r, c) =>
    setItems((prev) => prev.filter((it) => !(it.row === r && it.col === c)));

  // Trim items if grid shrinks
  useEffect(() => {
    setItems((prev) => prev.filter((it) => it.row < rows && it.col < cols));
  }, [rows, cols]);

  /* ---- save ---- */
  const save = async () => {
    setBusy(true);
    const payload = {
      name, description: desc, rows, cols,
      background_color: bg,
      child: childId || null,
      items: items.map((it) => ({
        icon_id: it.icon.id, row: it.row, col: it.col,
      })),
    };
    try {
      if (isNew) {
        const { data } = await boardApi.create(payload);
        toast.success('Board created.');
        nav(`/boards/${data.id}/edit`);
      } else {
        await boardApi.update(id, payload);
        toast.success('Board saved.');
      }
    } catch (err) {
      const msg = err.response?.data?.detail
        || JSON.stringify(err.response?.data) || 'Save failed.';
      toast.error(msg.slice(0, 200));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif-display text-3xl font-bold text-on-surface">
            {isNew ? 'New board' : 'Edit board'}
          </h1>
          <p className="text-on-surface-variant mt-1">
            Drag icons from the right onto cells. Click × to remove.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => nav('/boards')} className="vb-btn-ghost">
            Cancel
          </button>
          <button onClick={save} disabled={busy} className="vb-btn-primary">
            {busy ? 'Saving…' : 'Save board'}
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">

        {/* ============ CANVAS ============ */}
        <div className="vb-card">
          <div className="grid sm:grid-cols-[2fr_1fr] gap-3 mb-3">
            <div>
              <label className="vb-label">Board name</label>
              <input className="vb-input" value={name}
                     onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="vb-label">For child</label>
              <select className="vb-input" value={childId}
                      onChange={(e) => setChild(e.target.value)}>
                <option value="">— template —</option>
                {kids.map((k) => (
                  <option key={k.id} value={k.id}>{k.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <div>
              <label className="vb-label">Rows</label>
              <input type="number" min={1} max={10}
                     className="vb-input w-24"
                     value={rows}
                     onChange={(e) => setRows(+e.target.value || 1)} />
            </div>
            <div>
              <label className="vb-label">Cols</label>
              <input type="number" min={1} max={10}
                     className="vb-input w-24"
                     value={cols}
                     onChange={(e) => setCols(+e.target.value || 1)} />
            </div>
            <div>
              <label className="vb-label">Background</label>
              <input type="color" className="vb-input p-1 w-20 h-12"
                     value={bg}
                     onChange={(e) => setBg(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-2 p-3 rounded-xl"
               style={{
                 background: bg,
                 gridTemplateColumns: `repeat(${cols}, 1fr)`,
               }}>
            {Array.from({ length: rows * cols }, (_, idx) => {
              const r = Math.floor(idx / cols), c = idx % cols;
              const cell = itemAt(r, c);
              return (
                <div
                  key={`${r}-${c}`}
                  onDragOver={(e) => { e.preventDefault();
                    e.currentTarget.classList.add('ring-2', 'ring-primary'); }}
                  onDragLeave={(e) =>
                    e.currentTarget.classList.remove('ring-2', 'ring-primary')}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('ring-2', 'ring-primary');
                    dropOnCell(r, c);
                  }}
                  className={`aspect-square rounded-lg overflow-hidden relative
                              transition-colors cursor-pointer ${
                    cell
                      ? 'bg-surface-container-lowest border border-outline-variant'
                      : 'border-2 border-dashed border-outline-variant bg-surface-container/50 ' +
                        'flex items-center justify-center text-xs text-on-surface-variant ' +
                        'hover:border-primary hover:bg-secondary-container/50'
                  }`}>
                  {cell ? (
                    <>
                      <button onClick={() => removeAt(r, c)} title="Remove"
                              className="absolute top-1 right-1 z-10
                                         w-6 h-6 rounded-full
                                         bg-surface-container-lowest border border-outline-variant
                                         text-error text-xs flex items-center justify-center">
                        ×
                      </button>
                      <img src={cell.icon.image} alt={cell.icon.label}
                           className="w-full h-[70%] object-cover" />
                      <div className="text-xs font-semibold text-center truncate px-1 py-1">
                        {cell.icon.label}
                      </div>
                    </>
                  ) : (
                    <span>drop here</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ============ PICKER ============ */}
        <aside className="vb-card sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
          <h3 className="text-lg font-bold">Icons</h3>
          <p className="text-sm text-on-surface-variant mb-3">
            Drag onto a cell. Need more? Add them in the icon library.
          </p>
          {iconLib.length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              No icons in your library yet.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {iconLib.map((ic) => (
                <div key={ic.id} draggable
                     onDragStart={() => setDrag(ic)}
                     onDragEnd={() => setDrag(null)}
                     className="border border-outline-variant rounded-md p-1.5
                                cursor-grab active:cursor-grabbing bg-surface
                                hover:border-primary text-center">
                  <img src={ic.image} alt={ic.label}
                       className="w-full aspect-square object-cover rounded-sm" />
                  <div className="text-[11px] truncate mt-1">{ic.label}</div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
