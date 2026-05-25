import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { boards as boardApi } from '../api/endpoints';
import { toast } from '../components/Toaster';

export default function Boards() {
  const [list, setList] = useState([]);

  const load = () =>
    boardApi.list()
      .then(({ data }) => setList(data.results ?? data))
      .catch(() => {});

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm('Delete this board?')) return;
    await boardApi.remove(id);
    toast.info('Board deleted.');
    load();
  };

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif-display text-3xl font-bold text-on-surface">
            Communication boards
          </h1>
          <p className="text-on-surface-variant mt-1">
            Each board is a screen of icons your child taps to speak.
          </p>
        </div>
        <Link to="/boards/new" className="vb-btn-primary">+ New board</Link>
      </header>

      {list.length === 0 ? (
        <div className="vb-card border-2 border-dashed border-outline-variant text-center py-16">
          <h3 className="text-xl font-bold mb-1">No boards yet</h3>
          <p className="text-on-surface-variant mb-4">
            Create your first communication board.
          </p>
          <Link to="/boards/new" className="vb-btn-primary">+ Create a board</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((b) => (
            <div key={b.id} className="vb-card">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-wider font-bold
                                 bg-secondary-container text-on-secondary-container
                                 px-2 py-0.5 rounded-full">
                  {b.rows}×{b.cols}
                </span>
                {!b.is_active && (
                  <span className="text-[10px] uppercase tracking-wider font-bold
                                   bg-surface-container text-on-surface-variant
                                   px-2 py-0.5 rounded-full">
                    Inactive
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold">{b.name}</h3>
              {b.description && (
                <p className="text-sm text-on-surface-variant mt-1">
                  {b.description}
                </p>
              )}
              <div className="text-xs text-on-surface-variant mt-2">
                {b.items?.length || 0} icons placed
              </div>
              <div className="border-t border-outline-variant my-4" />
              <div className="flex gap-2">
                <Link to={`/boards/${b.id}/edit`}
                      className="vb-btn-secondary text-sm">Edit</Link>
                <button onClick={() => remove(b.id)}
                        className="vb-btn-danger text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
