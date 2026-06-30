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
import { UploadForm, CATEGORIES } from './Icons';

export default function BoardEditor() {
  const { id } = useParams();
  const isNew  = !id;
  const nav    = useNavigate();

  const [name, setName]     = useState('Untitled board');
  const [desc, setDesc]     = useState('');
  const [rows, setRows]     = useState(4);
  const [cols, setCols]     = useState(4);
  const [bg, setBg]         = useState(localStorage.getItem('vb_last_board_bg') || '#FFFFFF');
  const [childId, setChild] = useState('');
  const [items, setItems]   = useState([]);  // {row, col, icon}

  const [iconLib, setIconLib] = useState([]);
  const [kids, setKids]       = useState([]);
  const [busy, setBusy]       = useState(false);
  const [dragIcon, setDrag]   = useState(null);
  const [parentId, setParentId] = useState('');
  const [quickUploadCell, setQuickUploadCell] = useState(null);
  const [iconFilter, setIconFilter] = useState('');
  const [boardList, setBoardList] = useState([]);

  /* ---- bootstrap ---- */
  useEffect(() => {
    Promise.all([
      iconApi.list({ is_folder_dp: 'false' }),
      boardApi.list(),
      childApi.list()
    ])
      .then(([iconsRes, boardsRes, kidsRes]) => {
        setIconLib(iconsRes.data.results ?? iconsRes.data);
        const fetchedBoards = boardsRes.data.results ?? boardsRes.data;
        // Exclude the current board from the potential parents list
        setBoardList(fetchedBoards.filter(b => b.id.toString() !== id));
        const childrenList = kidsRes.data.results ?? kidsRes.data;
        setKids(childrenList);
        if (isNew && childrenList.length > 0) {
          setChild(childrenList[0].id);
        }
      })
      .catch(() => toast.error('Failed to load libraries.'));

    if (!isNew) {
      boardApi.detail(id).then(({ data }) => {
        setName(data.name);
        setDesc(data.description || '');
        setRows(data.rows); setCols(data.cols);
        setBg(data.background_color || '#FFFFFF');
        setChild(data.child || '');
        setParentId(data.parent || '');
        setItems((data.items || []).map((it) => ({
          row: it.row, col: it.col, icon: it.icon,
        })));
      }).catch(() => {});
    }
  }, [id, isNew]);

  /* ---- auto-save ---- */
  useEffect(() => {
    if (isNew || busy) return;
    const timer = setTimeout(() => {
      const payload = {
        name, description: desc, rows, cols,
        background_color: bg,
        child: childId || null,
        parent_id: parentId || null,
        items: items.map((it) => ({
          icon_id: it.icon.id, row: it.row, col: it.col,
        })),
      };
      boardApi.update(id, payload).catch(() => {});
    }, 1000);
    return () => clearTimeout(timer);
  }, [id, isNew, name, desc, rows, cols, bg, childId, items, busy]); 

  /* ---- helpers ---- */
  const itemAt = (r, c) => items.find((it) => it.row === r && it.col === c);

  const placeOnCell = (r, c, icon) => {
    if (!icon) return;
    setItems((prev) => {
      const without = prev.filter((it) => !(it.row === r && it.col === c));
      return [...without, { row: r, col: c, icon: icon }];
    });
  };

  const dropOnCell = (r, c) => {
    placeOnCell(r, c, dragIcon);
    setDrag(null);
  };
  const removeAt = (r, c) =>
    setItems((prev) => prev.filter((it) => !(it.row === r && it.col === c)));

  // Trim items if grid shrinks
  useEffect(() => {
    setItems((prev) => prev.filter((it) => it.row < rows && it.col < cols));
  }, [rows, cols]);

  /* ---- save ---- */
  const save = async (redirectPath = '/boards') => {
    setBusy(true);
    const payload = {
      name, description: desc, rows, cols,
      background_color: bg,
      child: childId || null,
      parent_id: parentId || null,
      items: items.map((it) => ({
        icon_id: it.icon.id, row: it.row, col: it.col,
      })),
    };
    try {
      if (isNew) {
        await boardApi.create(payload);
        toast.success('Board created.');
      } else {
        await boardApi.update(id, payload);
        toast.success('Board saved.');
      }
      
      if (redirectPath === '/boards/new' && isNew) {
        // Reset state for a new board
        setName('Untitled board');
        setDesc('');
        setItems([]);
      } else if (redirectPath === '/boards/new') {
        nav('/boards/new');
      } else {
        nav(redirectPath);
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
          <button onClick={() => save('/boards/new')} disabled={busy} className="vb-btn-secondary">
            {busy ? 'Saving…' : 'Save & Create Another'}
          </button>
          <button onClick={() => save('/boards')} disabled={busy} className="vb-btn-primary">
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
              <input type="color" className="vb-input h-10 w-16 p-1 cursor-pointer"
                     value={bg}
                     onChange={(e) => {
                       setBg(e.target.value);
                       localStorage.setItem('vb_last_board_bg', e.target.value);
                     }} />
            </div>
            <div>
              <label className="vb-label">Place inside folder</label>
              <select className="vb-input" 
                      value={parentId}
                      onChange={(e) => setParentId(e.target.value)}>
                <option value="">— Top level —</option>
                {boardList.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-center bg-surface-container-low p-4 rounded-xl">
            <div className="grid gap-3 p-4 rounded-xl shadow-inner min-h-[300px] w-full"
                 style={{
                   background: bg,
                   gridTemplateColumns: `repeat(${cols}, minmax(80px, 140px))`,
                   justifyContent: 'center',
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
                  onClick={() => {
                    if (!cell) setQuickUploadCell({ r, c });
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
                    <div className="flex flex-col items-center justify-center h-full w-full gap-1 opacity-60">
                      <span className="material-symbols-outlined text-2xl">add_circle</span>
                      <span className="text-[10px] font-semibold text-center leading-tight">drop or<br/>click to add</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          </div>
        </div>

        {/* ============ PICKER ============ */}
        <aside className="vb-card sticky top-4 max-h-[calc(100vh-2rem)] flex flex-col">
          <div className="shrink-0 mb-3">
            <h3 className="text-lg font-bold">Icons</h3>
            <p className="text-sm text-on-surface-variant mb-3">
              Drag onto a cell. Need more? Add them in the icon library.
            </p>
            <select 
              className="vb-input w-full text-sm py-1.5"
              value={iconFilter}
              onChange={(e) => setIconFilter(e.target.value)}
            >
              <option value="">All categories</option>
              {CATEGORIES.map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          
          <div className="overflow-y-auto pr-2">
            {iconLib.length === 0 ? (
              <p className="text-sm text-on-surface-variant text-center py-4">
                No icons in your library yet.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {iconLib.filter(ic => !iconFilter || ic.category === iconFilter).map((ic) => (
                <div key={ic.id} draggable
                     onDragStart={(e) => {
                       setDrag(ic);
                       e.dataTransfer.setData('text/plain', ic.id);
                     }}
                     onDragEnd={() => setDrag(null)}
                     className="border border-outline-variant rounded-md p-1.5
                                cursor-grab active:cursor-grabbing bg-surface
                                hover:border-primary text-center">
                  <img src={ic.image} alt={ic.label} draggable={false}
                       className="w-full aspect-square object-cover rounded-sm pointer-events-none" />
                  <div className="text-[11px] truncate mt-1">{ic.label}</div>
                </div>
              ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {quickUploadCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface p-6 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-[slidein_0.2s_ease]">
            <button onClick={() => setQuickUploadCell(null)}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-surface-variant text-on-surface-variant hover:text-error hover:bg-error-container transition-colors">
              ✕
            </button>
            <h2 className="text-2xl font-serif-display font-bold mb-2">Create new icon</h2>
            <p className="text-on-surface-variant mb-6">This icon will be instantly placed on your board.</p>
            <UploadForm 
              hideFolderSelect={true}
              onDone={(newIcon) => {
                if (newIcon) {
                  setIconLib(prev => [newIcon, ...prev]);
                  setItems((prev) => {
                    const without = prev.filter((it) => !(it.row === quickUploadCell.r && it.col === quickUploadCell.c));
                    return [...without, { row: quickUploadCell.r, col: quickUploadCell.c, icon: newIcon }];
                  });
                }
                setQuickUploadCell(null);
              }} 
            />
          </div>
        </div>
      )}
    </>
  );
}
