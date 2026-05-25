/**
 * Tiny toast system — avoids adding react-toastify to keep the bundle slim.
 * Uses a module-level subscriber pattern so any page can call notify().
 */
import { useEffect, useState } from 'react';

const listeners = new Set();
let counter = 0;

export function notify(message, kind = 'info', durationMs = 3000) {
  const id = ++counter;
  listeners.forEach((fn) => fn({ type: 'add', toast: { id, message, kind } }));
  setTimeout(() => {
    listeners.forEach((fn) => fn({ type: 'remove', id }));
  }, durationMs);
}

export const toast = {
  info:    (m) => notify(m, 'info'),
  success: (m) => notify(m, 'success'),
  error:   (m) => notify(m, 'error'),
};

export default function Toaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const fn = (ev) => {
      setToasts((cur) =>
        ev.type === 'add'    ? [...cur, ev.toast]
      : ev.type === 'remove' ? cur.filter((t) => t.id !== ev.id)
      : cur);
    };
    listeners.add(fn);
    return () => listeners.delete(fn);
  }, []);

  const colorOf = (kind) => ({
    info:    'bg-surface-container-high text-on-surface',
    success: 'bg-secondary text-on-secondary',
    error:   'bg-error text-on-error',
  }[kind] || 'bg-surface-container-high text-on-surface');

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div key={t.id}
             className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${colorOf(t.kind)}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
