import { useState } from 'react';

const SAMPLE_MEDS = [
  { id: 1, name: 'Risperidone', dose: '0.5 mg', frequency: 'Twice daily', time: '8:00 AM / 8:00 PM', notes: 'With food', active: true },
  { id: 2, name: 'Melatonin', dose: '3 mg', frequency: 'Once daily', time: '9:00 PM', notes: 'Before bedtime', active: true },
  { id: 3, name: 'Omega-3 Fish Oil', dose: '500 mg', frequency: 'Once daily', time: '8:00 AM', notes: 'With breakfast', active: true },
];

const SAMPLE_LOGS = [
  { id: 1, date: '2026-05-25', mood: '😊', sleep: '8h 20m', meals: 'Good appetite', therapy: 'Speech therapy — 45 min', notes: 'Made eye contact with teacher today. Initiated a request using the board without prompting.' },
  { id: 2, date: '2026-05-24', mood: '😐', sleep: '6h 50m', meals: 'Skipped lunch', therapy: 'Occupational therapy — 30 min', notes: 'Seemed tired in the morning. Engaged well during OT. Used 12 icons on the board.' },
  { id: 3, date: '2026-05-23', mood: '😊', sleep: '9h 10m', meals: 'Great appetite', therapy: 'ABA session — 1 hr', notes: 'Very responsive day. Independently navigated the food board to ask for juice.' },
];

export default function Maintenance() {
  const [activeTab, setActiveTab] = useState('medication');
  const [showAddMed, setShowAddMed] = useState(false);
  const [showAddLog, setShowAddLog] = useState(false);

  // Form states for new medication
  const [newMed, setNewMed] = useState({ name: '', dose: '', frequency: '', time: '', notes: '' });
  // Form states for new daily log
  const [newLog, setNewLog] = useState({ date: '', mood: '', sleep: '', meals: '', therapy: '', notes: '' });

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
                  <label className="vb-label">Time</label>
                  <input className="vb-input" placeholder="e.g. 8:00 AM" value={newMed.time} onChange={e => setNewMed({...newMed, time: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="vb-label">Notes</label>
                  <input className="vb-input" placeholder="e.g. Take with food" value={newMed.notes} onChange={e => setNewMed({...newMed, notes: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-3">
                <button className="vb-btn-primary text-sm" onClick={() => setShowAddMed(false)}>Save Medication</button>
                <button className="vb-btn-ghost text-sm" onClick={() => setShowAddMed(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Medication Cards */}
          <div className="grid gap-4">
            {SAMPLE_MEDS.map(med => (
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
                  <span className="vb-chip bg-primary-container text-on-primary-container">
                    <span className="material-symbols-outlined text-xs">schedule</span>
                    {med.time}
                  </span>
                  {med.notes && (
                    <span className="vb-chip bg-tertiary-container text-on-tertiary-container">
                      {med.notes}
                    </span>
                  )}
                  <span className="vb-chip bg-green-100 text-green-800">Active</span>
                </div>
              </div>
            ))}
          </div>

          {/* Medication Schedule Overview */}
          <div className="vb-card p-6 mt-8">
            <h3 className="font-bold text-lg mb-4">Today's Schedule</h3>
            <div className="space-y-4">
              {[
                { time: '8:00 AM', meds: ['Risperidone 0.5 mg', 'Omega-3 500 mg'], done: true },
                { time: '8:00 PM', meds: ['Risperidone 0.5 mg'], done: false },
                { time: '9:00 PM', meds: ['Melatonin 3 mg'], done: false },
              ].map((slot, i) => (
                <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${slot.done ? 'bg-green-50 border border-green-200' : 'bg-surface-container-low border border-outline-variant'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${slot.done ? 'bg-green-500 text-white' : 'bg-surface-container text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined text-sm">{slot.done ? 'check' : 'schedule'}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{slot.time}</p>
                    <p className="text-sm text-on-surface-variant">{slot.meds.join(', ')}</p>
                  </div>
                  {!slot.done && (
                    <button className="vb-btn-secondary text-xs">Mark Done</button>
                  )}
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
                  <label className="vb-label">Notes &amp; Observations</label>
                  <textarea className="vb-input min-h-[100px] resize-y" placeholder="What happened today? Any milestones or concerns?" value={newLog.notes} onChange={e => setNewLog({...newLog, notes: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-3">
                <button className="vb-btn-primary text-sm" onClick={() => setShowAddLog(false)}>Save Entry</button>
                <button className="vb-btn-ghost text-sm" onClick={() => setShowAddLog(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Daily Log Entries */}
          <div className="space-y-4">
            {SAMPLE_LOGS.map(log => (
              <div key={log.id} className="vb-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{log.mood}</span>
                    <div>
                      <h3 className="font-bold text-lg">{new Date(log.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                      <p className="text-xs text-on-surface-variant">{log.date}</p>
                    </div>
                  </div>
                  <button className="p-2 rounded-full hover:bg-surface-container transition-colors">
                    <span className="material-symbols-outlined text-on-surface-variant">more_vert</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-surface-container-low">
                    <p className="text-xs text-on-surface-variant font-medium mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">bedtime</span> Sleep
                    </p>
                    <p className="font-bold">{log.sleep}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low">
                    <p className="text-xs text-on-surface-variant font-medium mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">restaurant</span> Meals
                    </p>
                    <p className="font-bold">{log.meals}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low col-span-2 md:col-span-1">
                    <p className="text-xs text-on-surface-variant font-medium mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">psychology</span> Therapy
                    </p>
                    <p className="font-bold text-sm">{log.therapy}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-primary-container/20 border border-primary-container/40">
                  <p className="text-xs text-on-surface-variant font-medium mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">edit_note</span> Notes
                  </p>
                  <p className="text-sm leading-relaxed">{log.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
