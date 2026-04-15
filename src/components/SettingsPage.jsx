import { useState, useRef } from 'react';
import { Target, Scale, Download, Upload, RotateCcw, Plus, Trash2, Save, ChevronDown, ChevronUp } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { exerciseLibrary, getAllExercises } from '../data/exerciseLibrary.js';
import { exercises as standardExercises } from '../data/exercises.js';
import { exportData, importData, loadAutoBackups, restoreFromBackup } from '../utils/dataManager.js';

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#111827', border: 'none', borderRadius: '12px', fontSize: 12 },
  labelStyle: { color: '#e2e8f0' },
};

// All exercise names for the objectives selector
function getAllExerciseOptions(customExercises = []) {
  const standard = standardExercises.map(e => ({ id: e.id, name: e.name }));
  const lib = exerciseLibrary.map(e => ({ id: e.id, name: e.name }));
  const custom = (customExercises || []).map(e => ({ id: e.id, name: e.name }));
  // Deduplicate by id
  const seen = new Set();
  return [...standard, ...lib, ...custom].filter(e => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });
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

  // Build chart data (last 30 entries)
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

  const sections = [
    { id: 'objectives', label: 'Objectifs', icon: Target, component: <ObjectivesSection store={store} /> },
    { id: 'bodyweight', label: 'Mon Poids', icon: Scale, component: <BodyWeightSection store={store} /> },
    { id: 'data', label: 'Export / Import / Backup', icon: Download, component: <DataSection store={store} /> },
  ];

  return (
    <div className="p-6 pb-24 bg-gray-950 min-h-screen">
      <h1 className="text-3xl font-black text-white mb-6">⚙️ Paramètres</h1>

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
