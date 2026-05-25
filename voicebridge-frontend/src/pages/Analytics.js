import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api from '../api/client';
import { children as childApi } from '../api/endpoints';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Analytics() {
  const [children, setChildren] = useState([]);
  const [activeChild, setActiveChild] = useState(null);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    childApi.list().then(({ data }) => {
      const list = data.results ?? data;
      setChildren(list);
      if (list.length > 0) {
        setActiveChild(list[0].id);
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeChild) {
      setLoading(true);
      api.get(`/analytics/events/stats/?child_id=${activeChild}`)
        .then(res => {
          setStats(res.data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [activeChild]);

  const chartData = {
    labels: stats.map(s => s.icon__label || 'Unknown'),
    datasets: [
      {
        label: 'Taps',
        data: stats.map(s => s.tap_count),
        backgroundColor: '#BDE0FE',
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="mb-2">
        <h1 className="font-serif-display text-3xl font-bold text-on-surface mb-2">Analytics</h1>
        <p className="text-on-surface-variant text-sm">
          Track icon usage and interaction patterns over time.
        </p>
      </header>

      <div className="vb-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-on-surface">Interaction Frequency</h2>
          {children.length > 0 && (
            <select
              className="vb-input max-w-xs"
              value={activeChild || ''}
              onChange={e => setActiveChild(e.target.value)}
            >
              {children.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center text-on-surface-variant">Loading data...</div>
        ) : children.length === 0 ? (
          <div className="py-12 text-center text-on-surface-variant">
            No children profiles found. Add a child to view analytics.
          </div>
        ) : stats.length === 0 ? (
          <div className="py-12 text-center text-on-surface-variant">
            No tap events recorded yet for this child.
          </div>
        ) : (
          <div className="h-80 w-full">
            <Bar data={chartData} options={chartOptions} />
          </div>
        )}
      </div>
    </div>
  );
}
