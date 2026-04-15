import { useState, useRef } from 'react';
import { Target, Scale, Download, Upload, RotateCcw, Plus, Trash2, Save, ChevronDown, ChevronUp, History, Eye, Edit2, X, Check } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { exerciseLibrary, getAllExercises } from '../data/exerciseLibrary.js';
import { exercises as standardExercises } from '../data/exercises.js';
import { exportData, importData, loadAutoBackups, restoreFromBackup } from '../utils/dataManager.js';
import FullSessionHistory from './FullSessionHistory.jsx';

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#111827', border: 'none', borderRadius: '12px', fontSize: 12 },
  labelStyle: { color: '#e2e8f0' },
};

// All exercise names for the objectives selector
function getAllExerciseOptions(customExercises = []) {
  const standard = standardExercises.map(e => ({ id: e.id, name: e.name }));
  const lib = exerciseLibrary.map(e => ({ id: e.id, name: e.name }));
  const custom = (customExercises || []).map(e => ({ id: e.id, name: e.name }));
  const seen = new Set();
  return [...standard, ...lib, ...custom].filter(e => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });
}

function formatDuration(startTime, endTime) {
  if (!startTime || !endTime) return null;
  const ms = new Date(endTime) - new Date(startTime);
  if (ms <= 0) return null;
  const mins = Math.round(ms / 60000);
  return `${mins} min`;
}

// ── Session Detail / Edit Modal ───────────────────────────────────────────────
function SessionModal({ session, onClose, onSave, onDelete }) {
  const [editMode, setEditMode] = useState(false);
  const [editedExercises, setEditedExercises] = useState(
    session.exercises?.map(ex => ({
      ...ex,
      sets: (ex.sets || []).map(s => ({ ...s })),
    })) ?? []
  );

  const duration = formatDuration(session.startTime, session.endTime);

  const handleSetChange = (exIdx, setIdx, field, value) => {
    setEditedExercises(prev => prev.map((ex, i) => {
      if (i !== exIdx) return ex;
      const sets = ex.sets.map((s, si) => si === setIdx ? { ...s, [field]: value } : s);
      return { ...ex, sets };
    }));
  };

  const handleDeleteSet = (exIdx, setIdx) => {
    setEditedExercises(prev => prev.map((ex, i) => {
      if (i !== exIdx) return ex;
      return { ...ex, sets: ex.sets.filter((_, si) => si !== setIdx).map((s, si) => ({ ...s, setNumber: si + 1 })) };
    }));
  };

  const handleAddSet = (exIdx) => {
    setEditedExercises(prev => prev.map((ex, i) => {
      if (i !== exIdx) return ex;
      const last = ex.sets[ex.sets.length - 1] || { reps: 10, weight: 50 };
      return { ...ex, sets: [...ex.sets, { ...last, setNumber: ex.sets.length + 1 }] };
    }));
  };

  const handleSave = () => {
    onSave({ ...session, exercises: editedExercises });
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-4 flex items-center justify-between">
        <div>
          <p className="font-bold text-white text-lg">{session.planName || 'Séance'}</p>
          <p className="text-xs text-gray-400">
            {new Date(session.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
            {duration && ` · ${duration}`}
          </p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {editMode ? (
          <>
            {editedExercises.map((ex, exIdx) => (
              <div key={exIdx} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="font-bold text-white mb-3">{ex.exerciseName || ex.exerciseId}</p>
                <div className="space-y-2">
                  {(ex.sets || []).map((set, setIdx) => (
                    <div key={setIdx} className="flex items-center gap-2 bg-gray-800/60 rounded-lg px-3 py-2">
                      <span className="text-xs text-gray-500 w-5">#{setIdx + 1}</span>
                      {set.weight !== undefined && (
                        <>
                          <input
                            type="number"
                            value={set.weight}
                            onChange={e => handleSetChange(exIdx, setIdx, 'weight', parseFloat(e.target.value) || 0)}
                            className="w-16 bg-gray-700 rounded px-2 py-1 text-center text-sm text-white focus:outline-none"
                          />
                          <span className="text-xs text-gray-500">kg</span>
                        </>
                      )}
                      {set.reps !== undefined && (
                        <>
                          <input
                            type="number"
                            value={set.reps}
                            onChange={e => handleSetChange(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                            className="w-14 bg-gray-700 rounded px-2 py-1 text-center text-sm text-white focus:outline-none"
                          />
                          <span className="text-xs text-gray-500">reps</span>
                        </>
                      )}
                      {set.duration !== undefined && (
                        <>
                          <input
                            type="number"
                            value={set.duration}
                            onChange={e => handleSetChange(exIdx, setIdx, 'duration', parseInt(e.target.value) || 0)}
                            className="w-16 bg-gray-700 rounded px-2 py-1 text-center text-sm text-white focus:outline-none"
                          />
                          <span className="text-xs text-gray-500">sec</span>
                        </>
                      )}
                      {set.value !== undefined && (
                        <>
                          <input
                            type="number"
                            value={set.value}
                            onChange={e => handleSetChange(exIdx, setIdx, 'value', parseFloat(e.target.value) || 0)}
                            className="w-16 bg-gray-700 rounded px-2 py-1 text-center text-sm text-white focus:outline-none"
                          />
                          <span className="text-xs text-gray-500">{set.cardioType === 'distance' ? 'km' : set.cardioType === 'duration' ? 'min' : 'reps'}</span>
                        </>
                      )}
                      <button onClick={() => handleDeleteSet(exIdx, setIdx)} className="text-gray-500 hover:text-red-400 ml-auto">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleAddSet(exIdx)}
                  className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Ajouter une série
                </button>
              </div>
            ))}
          </>
        ) : (
          <>
            {(session.exercises || []).map((ex, exIdx) => (
              <div key={exIdx} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="font-bold text-white mb-2">{ex.exerciseName || ex.exerciseId}</p>
                {(ex.sets || []).length === 0 ? (
                  <p className="text-xs text-gray-500 italic">Aucune série enregistrée</p>
                ) : (
                  <div className="space-y-1">
                    {(ex.sets || []).map((set, setIdx) => {
                      let label = '';
                      if (set.weight !== undefined && set.reps !== undefined) {
                        label = `${set.weight}kg × ${set.reps}${set.rpe ? ` · RPE ${set.rpe}` : ''}`;
                      } else if (set.reps !== undefined) {
                        label = `× ${set.reps} reps`;
                      } else if (set.duration !== undefined) {
                        label = `${Math.floor(set.duration / 60)}:${String(set.duration % 60).padStart(2, '0')}`;
                      } else if (set.value !== undefined) {
                        const suf = set.cardioType === 'distance' ? 'km' : set.cardioType === 'duration' ? 'min' : 'reps';
                        label = `${set.value} ${suf}`;
                      }
                      return (
                        <div key={setIdx} className="flex items-center gap-2 text-sm text-gray-300 px-2 py-1 bg-gray-800/40 rounded-lg">
                          <span className="text-gray-600 w-5">#{setIdx + 1}</span>
                          <span>{label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 p-4 flex gap-3">
        {editMode ? (
          <>
            <button
              onClick={() => setEditMode(false)}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition"
            >
              <Check className="w-4 h-4" /> Enregistrer
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                if (confirm('Supprimer cette séance ? Cette action est irréversible.')) {
                  onDelete();
                  onClose();
                }
              }}
              className="bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-400 px-4 py-3 rounded-xl transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setEditMode(true)}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition"
            >
              <Edit2 className="w-4 h-4" /> Modifier
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Section: Historique des séances ──────────────────────────────────────────
function SessionHistorySection({ store, onViewAll }) {
  const [selectedSession, setSelectedSession] = useState(null);

  const recentSessions = [...(store.sessions || [])]
    .filter(s => s?.status === 'completed')
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  const handleSave = (updated) => {
    store.updateSession(updated.id, updated);
    setSelectedSession(null);
  };

  if (recentSessions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Aucune séance complétée</p>
        <p className="text-sm mt-1">Lance ton premier entraînement!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {selectedSession && (
        <SessionModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onSave={handleSave}
          onDelete={() => store.deleteSession(selectedSession.id)}
        />
      )}

      {recentSessions.map((session, i) => {
        const duration = formatDuration(session.startTime, session.endTime);
        const exerciseCount = (session.exercises || []).length;
        const dateStr = new Date(session.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        const timeStr = session.startTime
          ? new Date(session.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
          : null;

        return (
          <div key={session.id || i} className="bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm truncate">{session.planName || 'Séance'}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {dateStr}{timeStr ? ` ${timeStr}` : ''}
                  {duration && ` · ${duration}`}
                  {exerciseCount > 0 && ` · ${exerciseCount} exercice${exerciseCount > 1 ? 's' : ''}`}
                </p>
              </div>
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => setSelectedSession(session)}
                  className="text-gray-500 hover:text-blue-400 p-1.5 rounded-lg hover:bg-gray-800 transition"
                  title="Afficher"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { if (confirm('Supprimer cette séance ?')) store.deleteSession(session.id); }}
                  className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-gray-800 transition"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {(store.sessions || []).filter(s => s?.status === 'completed').length > 10 && (
        <button
          onClick={onViewAll}
          className="w-full text-center text-sm text-blue-400 hover:text-blue-300 font-bold py-3 transition"
        >
          Voir tout l'historique →
        </button>
      )}
    </div>
  );
}

// ── Section: Objectifs ───────────────────────────────────────────────────────
function ObjectivesSection({ store }) {
  const { objectives = {}, customExercises = [], updateObjective, deleteObjective } = store;
  const [search, setSearch] = useState('');
  const [addExId, setAddExId] = useState('');
  const [addWeight, setAddWeight] = useState('');
  const [editValues, setEditValues] = useState({});

  const allOptions = getAllExerciseOptions(customExercises);
  const objectiveEntries = Object.entries(objectives);

  const filteredOptions = allOptions.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) &&
    !objectives[e.id]
  );

  const handleAdd = () => {
    if (!addExId || !addWeight) return;
    updateObjective(addExId, parseFloat(addWeight));
    setAddExId('');
    setAddWeight('');
    setSearch('');
  };

  const handleSaveEdit = (exId) => {
    const val = parseFloat(editValues[exId]);
    if (!isNaN(val)) updateObjective(exId, val);
    setEditValues(prev => { const { [exId]: _, ...rest } = prev; return rest; });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Les objectifs s'affichent dans les Analytics pour suivre ta progression.
      </p>

      {/* Add objective */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
        <p className="text-xs font-bold text-gray-400 uppercase">+ Ajouter un objectif</p>
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setAddExId(''); }}
          placeholder="🔍 Rechercher un exercice..."
          className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {search && filteredOptions.length > 0 && (
          <div className="max-h-36 overflow-y-auto space-y-1">
            {filteredOptions.slice(0, 8).map(ex => (
              <button
                key={ex.id}
                onClick={() => { setAddExId(ex.id); setSearch(ex.name); }}
                className="w-full text-left text-sm px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
              >
                {ex.name}
              </button>
            ))}
          </div>
        )}
        {addExId && (
          <div className="flex gap-2">
            <input
              type="number"
              value={addWeight}
              onChange={e => setAddWeight(e.target.value)}
              placeholder="Objectif (kg)"
              className="flex-1 bg-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleAdd}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Existing objectives */}
      {objectiveEntries.length === 0 ? (
        <p className="text-center text-gray-600 text-sm py-4">Aucun objectif défini</p>
      ) : (
        <div className="space-y-2">
          {objectiveEntries.map(([exId, targetWeight]) => {
            const name = allOptions.find(e => e.id === exId)?.name || exId;
            const isEditing = exId in editValues;
            return (
              <div key={exId} className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{name}</p>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editValues[exId]}
                      onChange={e => setEditValues(prev => ({ ...prev, [exId]: e.target.value }))}
                      className="mt-1 w-24 bg-gray-800 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                    />
                  ) : (
                    <p
                      className="text-sm text-blue-400 cursor-pointer hover:text-blue-300"
                      onClick={() => setEditValues(prev => ({ ...prev, [exId]: String(targetWeight) }))}
                    >
                      Objectif: {targetWeight} kg
                    </p>
                  )}
                </div>
                {isEditing ? (
                  <button onClick={() => handleSaveEdit(exId)} className="text-green-400 hover:text-green-300">
                    <Save className="w-4 h-4" />
                  </button>
                ) : null}
                <button onClick={() => deleteObjective(exId)} className="text-gray-500 hover:text-red-400 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Section: Poids de corps ──────────────────────────────────────────────────
function BodyWeightSection({ store }) {
  const { bodyWeight = [], logBodyWeight } = store;
  const [inputWeight, setInputWeight] = useState('');
  const today = new Date().toISOString().split('T')[0];

  const handleSave = () => {
    const w = parseFloat(inputWeight);
    if (!w || w < 20 || w > 300) return;
    logBodyWeight({ date: today, weight: w });
    setInputWeight('');
  };

  const chartData = [...bodyWeight]
    .slice(0, 30)
    .reverse()
    .map(b => ({ date: new Date(b.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }), weight: b.weight }));

  const latest = bodyWeight[0]?.weight;

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">Poids actuel (kg)</label>
          <input
            type="number"
            step="0.1"
            value={inputWeight}
            onChange={e => setInputWeight(e.target.value)}
            placeholder={latest ? `Dernier: ${latest}kg` : '80.0'}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          onClick={handleSave}
          className="self-end bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-bold transition"
        >
          <Save className="w-4 h-4" />
        </button>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 10 }} />
            <YAxis stroke="#9ca3af" domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`${v} kg`, 'Poids']} />
            <Line type="monotone" dataKey="weight" stroke="#3b82f6" dot={{ fill: '#60a5fa', r: 3 }} strokeWidth={2} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* History */}
      {bodyWeight.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Historique</p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {bodyWeight.slice(0, 15).map((b, i) => (
              <div key={i} className="flex justify-between text-sm px-3 py-1.5 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400">{new Date(b.date).toLocaleDateString('fr-FR')}</span>
                <span className="font-bold text-white">{b.weight} kg</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Section: Export/Import ────────────────────────────────────────────────────
function DataSection({ store }) {
  const fileInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState(null);
  const [backups, setBackups] = useState(() => loadAutoBackups());

  const { sessions = [], customPrograms = [], customExercises = [], objectives = {}, bodyWeight = [] } = store;

  const handleExport = () => {
    exportData({ sessions, customPrograms, customExercises, objectives, bodyWeight });
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = importData(ev.target.result, store);
      if (result.success) {
        store.importStoreData(result.data);
        setImportStatus({
          success: true,
          msg: `✅ ${result.stats.sessions} séances, ${result.stats.programs} programmes importés`,
        });
      } else {
        setImportStatus({ success: false, msg: `❌ ${result.error}` });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleRestoreBackup = (backup) => {
    const restored = restoreFromBackup(backup);
    if (restored && confirm('Restaurer ce backup ? Tes données actuelles seront remplacées.')) {
      store.importStoreData(restored);
      setImportStatus({ success: true, msg: '✅ Backup restauré avec succès' });
    }
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-gray-900 rounded-lg p-3">
          <p className="text-xl font-bold text-blue-400">{sessions.length}</p>
          <p className="text-xs text-gray-500">séances</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-3">
          <p className="text-xl font-bold text-purple-400">{customPrograms.length}</p>
          <p className="text-xs text-gray-500">programmes</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-3">
          <p className="text-xl font-bold text-green-400">{Object.keys(objectives).length}</p>
          <p className="text-xs text-gray-500">objectifs</p>
        </div>
      </div>

      {/* Export */}
      <button
        onClick={handleExport}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition"
      >
        <Download className="w-5 h-5" /> Exporter mes données (JSON)
      </button>

      {/* Import */}
      <div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition"
        >
          <Upload className="w-5 h-5" /> Importer depuis JSON
        </button>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportFile} className="hidden" />
        <p className="text-xs text-gray-500 mt-1 text-center">Fusionne avec les données existantes</p>
      </div>

      {importStatus && (
        <div className={`rounded-xl p-3 text-sm font-bold text-center ${importStatus.success ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
          {importStatus.msg}
        </div>
      )}

      {/* Auto-backups */}
      {backups.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Backups automatiques</p>
          <div className="space-y-2">
            {backups.map((b, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm text-white">{new Date(b.date).toLocaleString('fr-FR')}</p>
                  <p className="text-xs text-gray-500">{b.sessionCount} séances</p>
                </div>
                <button
                  onClick={() => handleRestoreBackup(b)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restaurer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function SettingsPage({ store }) {
  const [openSection, setOpenSection] = useState('objectives');
  const [showFullHistory, setShowFullHistory] = useState(false);

  if (showFullHistory) {
    return <FullSessionHistory store={store} onBack={() => setShowFullHistory(false)} />;
  }

  const sections = [
    { id: 'history', label: 'Historique des séances', icon: History, component: <SessionHistorySection store={store} onViewAll={() => setShowFullHistory(true)} /> },
    { id: 'objectives', label: 'Objectifs', icon: Target, component: <ObjectivesSection store={store} /> },
    { id: 'bodyweight', label: 'Mon Poids', icon: Scale, component: <BodyWeightSection store={store} /> },
    { id: 'data', label: 'Export / Import / Backup', icon: Download, component: <DataSection store={store} /> },
  ];

  return (
    <div className="p-6 pb-24 bg-gray-950 min-h-screen">
      <h1 className="text-3xl font-black text-white mb-6">Paramètres</h1>

      <div className="space-y-3">
        {sections.map(({ id, label, icon: Icon, component }) => (
          <div key={id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <button
              onClick={() => setOpenSection(openSection === id ? null : id)}
              className="w-full flex items-center justify-between px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-white">{label}</span>
              </div>
              {openSection === id
                ? <ChevronUp className="w-4 h-4 text-gray-400" />
                : <ChevronDown className="w-4 h-4 text-gray-400" />
              }
            </button>
            {openSection === id && (
              <div className="px-5 pb-5 border-t border-gray-800 pt-4">
                {component}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
