import { useState, useEffect } from 'react';
import { toast } from '../components/Toaster';
import { medications as medApi, medicationLogs as medLogApi, dailyLogs as dailyLogApi } from '../api/endpoints';

export default function Maintenance() {
  const [activeTab, setActiveTab] = useState('medication');
  const [showAddMed, setShowAddMed] = useState(false);
  const [showAddLog, setShowAddLog] = useState(false);

  // Data states
  const [meds, setMeds] = useState([]);
  const [medLogs, setMedLogs] = useState([]);
  const [dailyLogs, setDailyLogs] = useState([]);

  // Form states
  const [newMed, setNewMed] = useState({ name: '', dose: '', frequency: '', time: '', notes: '', active: true });
  const [newLog, setNewLog] = useState({ date: new Date().toISOString().split('T')[0], mood: '', sleep: '', meals: '', therapy: '', notes: '' });
  const [medTimes, setMedTimes] = useState([]);

  const formatTimeAMPM = (time24) => {
    if (!time24) return '';
    let [hours, minutes] = time24.split(':');
    hours = parseInt(hours, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const loadData = () => {
    medApi.list().then(({ data }) => setMeds(data.results ?? data)).catch(() => {});
    
    const today = new Date().toISOString().split('T')[0];
    medLogApi.list({ date: today }).then(({ data }) => setMedLogs(data.results ?? data)).catch(() => {});
    
    dailyLogApi.list().then(({ data }) => setDailyLogs(data.results ?? data)).catch(() => {});
  };

  useEffect(() => { loadData(); }, []);

  const handleSaveMed = async () => {
    if (!newMed.name) return toast.error('Name is required.');
    const finalMed = { ...newMed, time: medTimes.map(formatTimeAMPM).join(' / ') };
    try {
      await medApi.create(finalMed);
      toast.success('Medication saved.');
      setShowAddMed(false);
      setNewMed({ name: '', dose: '', frequency: '', time: '', notes: '', active: true });
      setMedTimes([]);
      loadData();
    } catch {
      toast.error('Could not save medication.');
    }
  };

  const handleSaveDailyLog = async () => {
    if (!newLog.date) return toast.error('Date is required.');
    try {
      await dailyLogApi.create(newLog);
      toast.success('Daily entry saved.');
      setShowAddLog(false);
      setNewLog({ date: new Date().toISOString().split('T')[0], mood: '', sleep: '', meals: '', therapy: '', notes: '' });
      loadData();
    } catch {
      toast.error('Could not save daily entry.');
    }
  };

  const handleMarkDone = async (medId, timeSlot) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await medLogApi.create({ medication: medId, date: today, time_slot: timeSlot, is_done: true });
      loadData();
      toast.success('Marked as done.');
    } catch {
      toast.error('Could not mark done.');
    }
  };

  // Generate today's schedule dynamically
  const scheduleMap = {};
  meds.filter(m => m.active).forEach(m => {
    if (!m.time) return;
    const times = m.time.split(/[/,]/).map(t => t.trim()).filter(Boolean);
    times.forEach(t => {
      if (!scheduleMap[t]) scheduleMap[t] = [];
      const isDone = medLogs.some(log => log.medication === m.id && log.time_slot === t && log.is_done);
      scheduleMap[t].push({ med: m, done: isDone });
    });
  });

  const sortedTimes = Object.keys(scheduleMap).sort();
  const schedule = sortedTimes.map(time => ({
    time,
    items: scheduleMap[time],
    allDone: scheduleMap[time].every(i => i.done)
  }));

  const tabs = [
    { key: 'medication', label: 'Medication', icon: 'medication' },
    { key: 'daily', label: 'Daily Life', icon: 'calendar_today' },
  ];

  return (
    <div className="max-w-5xl mx-auto w-full pb-20">
      <header className="mb-8">
        <h1 className="font-serif-display text-3xl font-bold text-on-surface">
          Child Maintenance
        </h1>
        <p className="text-on-surface-variant mt-1">
          Track medication schedules and document your child's daily life.
        </p>
      </header>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-8">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
              activeTab === t.key
                ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                : 'glass-card text-on-surface-variant hover:text-primary hover:bg-white/50'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ───────── MEDICATION TAB ───────── */}
      {activeTab === 'medication' && (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif-display text-xl font-bold">Current Medications</h2>
            <button onClick={() => setShowAddMed(!showAddMed)} className="vb-btn-primary text-sm">
              <span className="material-symbols-outlined text-sm">add</span>
              Add Medication
            </button>
          </div>

          {/* Add medication form */}
          {showAddMed && (
            <div className="vb-card p-6 mb-6 animate-[slideUp_0.3s_ease-out]">
              <h3 className="font-bold text-lg mb-4">New Medication</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="vb-label">Medication Name</label>
                  <input className="vb-input" placeholder="e.g. Risperidone" value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})} />
                </div>
                <div>
                  <label className="vb-label">Dosage</label>
                  <input className="vb-input" placeholder="e.g. 0.5 mg" value={newMed.dose} onChange={e => setNewMed({...newMed, dose: e.target.value})} />
                </div>
                <div>
                  <label className="vb-label">Frequency</label>
                  <input className="vb-input" placeholder="e.g. Twice daily" value={newMed.frequency} onChange={e => setNewMed({...newMed, frequency: e.target.value})} />
                </div>
                <div>
                  <label className="vb-label">Time (AM/PM)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {medTimes.map((t, idx) => (
                      <span key={idx} className="vb-chip bg-primary-container text-on-primary-container flex items-center gap-1">
                        {formatTimeAMPM(t)}
                        <button type="button" onClick={() => setMedTimes(medTimes.filter((_, i) => i !== idx))} className="material-symbols-outlined text-xs hover:text-error">close</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="time" 
                      className="vb-input flex-1" 
                      id="time-picker"
                      style={{ accentColor: '#78555e' }}
                    />
                    <button type="button" className="vb-btn-secondary py-2 text-sm" onClick={() => {
                      const val = document.getElementById('time-picker').value;
                      if (val && !medTimes.includes(val)) setMedTimes([...medTimes, val]);
                      document.getElementById('time-picker').value = '';
                    }}>Add</button>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="vb-label">Notes</label>
                  <input className="vb-input" placeholder="e.g. Take with food" value={newMed.notes} onChange={e => setNewMed({...newMed, notes: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-3">
                <button className="vb-btn-primary text-sm" onClick={handleSaveMed}>Save Medication</button>
                <button className="vb-btn-ghost text-sm" onClick={() => setShowAddMed(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Medication Cards */}
          <div className="grid gap-4">
            {meds.length === 0 && (
              <div className="py-12 text-center text-on-surface-variant bg-surface-container-low rounded-2xl border border-outline-variant">
                No medications added yet.
              </div>
            )}
            {meds.map(med => (
              <div key={med.id} className="vb-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-2xl">medication</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{med.name}</h3>
                    <p className="text-sm text-on-surface-variant">{med.dose} — {med.frequency}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {med.time && (
                    <span className="vb-chip bg-primary-container text-on-primary-container">
                      <span className="material-symbols-outlined text-xs">schedule</span>
                      {med.time}
                    </span>
                  )}
                  {med.notes && (
                    <span className="vb-chip bg-tertiary-container text-on-tertiary-container">
                      {med.notes}
                    </span>
                  )}
                  {med.active ? (
                    <span className="vb-chip bg-green-100 text-green-800">Active</span>
                  ) : (
                    <span className="vb-chip bg-gray-100 text-gray-800">Inactive</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Medication Schedule Overview */}
          <div className="vb-card p-6 mt-8">
            <h3 className="font-bold text-lg mb-4">Today's Schedule</h3>
            <div className="space-y-4">
              {schedule.length === 0 && (
                <div className="text-sm text-on-surface-variant italic">No schedules for today based on active medications. Ensure times are added using the format: 8:00 AM / 8:00 PM.</div>
              )}
              {schedule.map((slot, i) => (
                <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${slot.allDone ? 'bg-green-50 border border-green-200' : 'bg-surface-container-low border border-outline-variant'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${slot.allDone ? 'bg-green-500 text-white' : 'bg-surface-container text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined text-sm">{slot.allDone ? 'check' : 'schedule'}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{slot.time}</p>
                    {slot.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm mt-1">
                        <span className={item.done ? 'line-through text-on-surface-variant' : 'text-on-surface'}>
                          {item.med.name} {item.med.dose && `(${item.med.dose})`}
                        </span>
                        {!item.done && (
                          <button onClick={() => handleMarkDone(item.med.id, slot.time)} className="vb-btn-secondary text-xs py-1 px-3 min-h-0">
                            Mark Done
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ───────── DAILY LIFE TAB ───────── */}
      {activeTab === 'daily' && (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif-display text-xl font-bold">Daily Life Journal</h2>
            <button onClick={() => setShowAddLog(!showAddLog)} className="vb-btn-primary text-sm">
              <span className="material-symbols-outlined text-sm">add</span>
              New Entry
            </button>
          </div>

          {/* Add daily log form */}
          {showAddLog && (
            <div className="vb-card p-6 mb-6 animate-[slideUp_0.3s_ease-out]">
              <h3 className="font-bold text-lg mb-4">New Daily Entry</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="vb-label">Date</label>
                  <input type="date" className="vb-input" value={newLog.date} onChange={e => setNewLog({...newLog, date: e.target.value})} />
                </div>
                <div>
                  <label className="vb-label">Mood</label>
                  <div className="flex gap-3 mt-1">
                    {['😊', '😐', '😢', '😤', '😴'].map(m => (
                      <button key={m} onClick={() => setNewLog({...newLog, mood: m})}
                        className={`text-2xl p-2 rounded-xl transition-all ${newLog.mood === m ? 'bg-primary-container scale-110 shadow-lg' : 'hover:bg-surface-container'}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="vb-label">Sleep Duration</label>
                  <input className="vb-input" placeholder="e.g. 8h 30m" value={newLog.sleep} onChange={e => setNewLog({...newLog, sleep: e.target.value})} />
                </div>
                <div>
                  <label className="vb-label">Meals</label>
                  <input className="vb-input" placeholder="e.g. Good appetite" value={newLog.meals} onChange={e => setNewLog({...newLog, meals: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="vb-label">Therapy Sessions</label>
                  <input className="vb-input" placeholder="e.g. Speech therapy — 45 min" value={newLog.therapy} onChange={e => setNewLog({...newLog, therapy: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="vb-label">Notes & Observations</label>
                  <textarea className="vb-input min-h-[100px] resize-y" placeholder="What happened today? Any milestones or concerns?" value={newLog.notes} onChange={e => setNewLog({...newLog, notes: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-3">
                <button className="vb-btn-primary text-sm" onClick={handleSaveDailyLog}>Save Entry</button>
                <button className="vb-btn-ghost text-sm" onClick={() => setShowAddLog(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Daily Log Entries */}
          <div className="space-y-4">
            {dailyLogs.length === 0 && (
              <div className="py-12 text-center text-on-surface-variant bg-surface-container-low rounded-2xl border border-outline-variant">
                No daily journal entries yet.
              </div>
            )}
            {dailyLogs.map(log => (
              <div key={log.id} className="vb-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{log.mood}</span>
                    <div>
                      <h3 className="font-bold text-lg">{new Date(log.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })}</h3>
                      <p className="text-xs text-on-surface-variant">{log.date}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-surface-container-low">
                    <p className="text-xs text-on-surface-variant font-medium mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">bedtime</span> Sleep
                    </p>
                    <p className="font-bold">{log.sleep || '—'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low">
                    <p className="text-xs text-on-surface-variant font-medium mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">restaurant</span> Meals
                    </p>
                    <p className="font-bold">{log.meals || '—'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low col-span-2 md:col-span-1">
                    <p className="text-xs text-on-surface-variant font-medium mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">psychology</span> Therapy
                    </p>
                    <p className="font-bold text-sm">{log.therapy || '—'}</p>
                  </div>
                </div>

                {log.notes && (
                  <div className="p-4 rounded-xl bg-primary-container/20 border border-primary-container/40">
                    <p className="text-xs text-on-surface-variant font-medium mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">edit_note</span> Notes
                    </p>
                    <p className="text-sm leading-relaxed">{log.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
