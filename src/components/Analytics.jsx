import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { exercises } from '../data/exercises.js';
import { exerciseLibrary, muscleGroups } from '../data/exerciseLibrary.js';
import { estimate1RM, predictNextMax, getWeekNumber } from '../utils/calculations.js';

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#111827', border: 'none', borderRadius: '12px', fontSize: 12 },
  labelStyle: { color: '#e2e8f0' },
};

// All known exercises (standard + library)
const allKnownExercises = [
  ...exercises,
  ...exerciseLibrary.map(e => ({ id: e.id, name: e.name, group: e.muscleGroup })),
];

function getExerciseName(id, customExercises = []) {
  const known = allKnownExercises.find(e => e.id === id);
  if (known) return known.name;
  const custom = customExercises.find(e => e.id === id);
  return custom?.name || id;
}

function getExerciseMuscleGroup(id, customExercises = []) {
  const lib = exerciseLibrary.find(e => e.id === id);
  if (lib) return lib.muscleGroup;
  const std = exercises.find(e => e.id === id);
  if (std) return std.group || '';
  const custom = customExercises.find(e => e.id === id);
  return custom?.muscleGroup || '';
}

// Get ISO week number + year key like "2024-W01"
function getWeekKey(dateStr) {
  const d = new Date(dateStr);
  const week = getWeekNumber(d);
  const year = d.getFullYear();
  return `${year}-W${String(week).padStart(2, '0')}`;
}

// Last N weeks keys
function getLastNWeeks(n) {
  const weeks = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    weeks.push(getWeekKey(d.toISOString()));
  }
  return weeks;
}

export default function Analytics({ store }) {
  const { sessions = [], customPrograms = [], customExercises = [] } = store || {};
  const completed = useMemo(() => sessions.filter(s => s?.status === 'completed'), [sessions]);

  const [activeTab, setActiveTab] = useState('global');

  // Par exercice state
  const [selectedProgramId, setSelectedProgramId] = useState('all');
  const [selectedExercise, setSelectedExercise] = useState(exercises[0]?.id || 'bench-press');

  // Par groupe musculaire state
  const [selectedGroup, setSelectedGroup] = useState('Pectoraux');

  // ── Global Stats ────────────────────────────────────────────────────────────
  const globalStats = useMemo(() => {
    const allSets = completed.flatMap(s =>
      (s?.exercises || []).flatMap(e => e?.sets || [])
    );
    const totalVolume = allSets.reduce((sum, s) => sum + ((s?.weight || 0) * (s?.reps || 0)), 0);
    const totalSessions = completed.length;
    const avgSessionVolume = totalSessions > 0 ? totalVolume / totalSessions : 0;

    // Sessions per week (avg over last 12 weeks)
    const last12 = getLastNWeeks(12);
    const weekCounts = {};
    last12.forEach(w => { weekCounts[w] = 0; });
    completed.forEach(s => {
      if (!s.date) return;
      const wk = getWeekKey(s.date);
      if (weekCounts[wk] !== undefined) weekCounts[wk]++;
    });
    const avgPerWeek = (Object.values(weekCounts).reduce((a, b) => a + b, 0) / 12).toFixed(1);

    return { totalSessions, avgSessionVolume, avgPerWeek };
  }, [completed]);

  // Sessions per week bar chart (last 6 weeks)
  const sessionsPerWeekData = useMemo(() => {
    const last6 = getLastNWeeks(6);
    const weekCounts = {};
    last6.forEach(w => { weekCounts[w] = 0; });
    completed.forEach(s => {
      if (!s.date) return;
      const wk = getWeekKey(s.date);
      if (weekCounts[wk] !== undefined) weekCounts[wk]++;
    });
    return last6.map(wk => ({
      week: wk.split('-W')[1] ? `S${wk.split('-W')[1]}` : wk,
      séances: weekCounts[wk],
    }));
  }, [completed]);

  // ── Par groupe musculaire ──────────────────────────────────────────────────
  const groupExerciseStats = useMemo(() => {
    // Collect all exercise IDs seen in sessions for this muscle group
    const exerciseIds = new Set();
    completed.forEach(s => {
      (s.exercises || []).forEach(e => {
        if (!e.exerciseId) return;
        const group = getExerciseMuscleGroup(e.exerciseId, customExercises);
        if (group === selectedGroup) exerciseIds.add(e.exerciseId);
      });
    });
    // Also include exercises from the library for this group (even without data)
    exerciseLibrary
      .filter(e => e.muscleGroup === selectedGroup)
      .forEach(e => exerciseIds.add(e.id));

    return [...exerciseIds].map(exId => {
      const name = getExerciseName(exId, customExercises);
      const allSets = completed.flatMap(s =>
        (s.exercises || [])
          .filter(e => e.exerciseId === exId)
          .flatMap(e => e.sets || [])
          .filter(s => s.weight > 0)
      );
      if (!allSets.length) return { exId, name, noData: true };

      const bestWeight = Math.max(...allSets.map(s => s.weight || 0));
      const best1RM = Math.max(...allSets.map(s => estimate1RM(s.weight || 0, s.reps || 0)));
      const avgWeight = allSets.reduce((sum, s) => sum + (s.weight || 0), 0) / allSets.length;

      // Weekly PR trend
      const weekMap = {};
      completed.forEach(s => {
        if (!s.date) return;
        const wk = getWeekKey(s.date);
        const ex = (s.exercises || []).find(e => e.exerciseId === exId);
        if (!ex) return;
        const weekSets = (ex.sets || []).filter(st => st.weight > 0);
        if (!weekSets.length) return;
        const w1RM = Math.max(...weekSets.map(st => estimate1RM(st.weight || 0, st.reps || 0)));
        const wAvg = weekSets.reduce((sum, st) => sum + (st.weight || 0), 0) / weekSets.length;
        if (!weekMap[wk] || w1RM > weekMap[wk].pr) {
          weekMap[wk] = { pr: Math.round(w1RM), charge: Math.round(wAvg) };
        }
      });
      const weeklyData = Object.entries(weekMap)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([wk, v]) => ({
          week: `S${wk.split('-W')[1] || wk}`,
          PR: v.pr,
          Charge: v.charge,
        }));

      return { exId, name, bestWeight, best1RM: Math.round(best1RM), avgWeight: Math.round(avgWeight), weeklyData, noData: false };
    }).filter(ex => !ex.noData);
  }, [completed, selectedGroup, customExercises]);

  // ── Par exercice ──────────────────────────────────────────────────────────
  const selectedProgram = customPrograms.find(p => p.id === selectedProgramId) || null;

  const exercisesForSelector = useMemo(() => {
    if (selectedProgram) {
      return selectedProgram.exercises.map(ex => ({
        id: ex.exerciseId,
        name: ex.exerciseName,
      }));
    }
    const sessionExIds = new Set(
      completed.flatMap(s => (s.exercises || []).map(e => e.exerciseId))
    );
    const fromSessions = [...sessionExIds].map(id => ({
      id,
      name: getExerciseName(id, customExercises),
    }));
    const seen = new Set(fromSessions.map(e => e.id));
    const standard = exercises.filter(e => !seen.has(e.id)).map(e => ({ id: e.id, name: e.name }));
    return [...fromSessions, ...standard];
  }, [completed, selectedProgram, customExercises]);

  const exerciseData = useMemo(() => {
    if (!selectedExercise) return null;
    const sessionsToUse = selectedProgram
      ? completed.filter(s => s.planId && s.planId.startsWith(selectedProgram.id))
      : completed;

    const sets = sessionsToUse.flatMap(s => {
      const sessionDate = s?.date || new Date().toISOString();
      return (s?.exercises || [])
        .filter(e => e?.exerciseId === selectedExercise)
        .flatMap(e =>
          (e?.sets || []).map(set => ({
            weight: set?.weight || 0,
            reps: set?.reps || 0,
            week: getWeekNumber(new Date(sessionDate)),
          }))
        );
    });

    if (!sets.length) return null;

    const weekData = {};
    sets.forEach(set => {
      if (!weekData[set.week]) weekData[set.week] = [];
      weekData[set.week].push(set);
    });

    return Object.entries(weekData)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map(([week, weekSets]) => {
        const best1RM = Math.max(...weekSets.map(s => estimate1RM(s.weight, s.reps)));
        const volume = weekSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
        return {
          week: `S${week}`,
          best1RM: isFinite(best1RM) ? Math.round(best1RM) : 0,
          volume: Math.round(volume),
          count: weekSets.length,
        };
      });
  }, [completed, selectedExercise, selectedProgram]);

  const currentExerciseName = getExerciseName(selectedExercise, customExercises);
  const prediction = exerciseData?.length > 0 ? predictNextMax(completed, selectedExercise) : null;

  return (
    <div className="p-6 pb-20">
      <h1 className="text-3xl font-bold mb-6">Stats</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'global', label: 'Global' },
          { id: 'group', label: 'Par groupe' },
          { id: 'exercise', label: 'Par exercice' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded font-bold transition text-sm ${
              activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── GLOBAL ── */}
      {activeTab === 'global' && (
        <div className="space-y-6">
          {/* 3 KPIs */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <p className="text-gray-400 text-xs font-bold leading-tight">Séances totales</p>
              <p className="text-3xl font-bold text-blue-400 mt-2">{globalStats.totalSessions}</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <p className="text-gray-400 text-xs font-bold leading-tight">Vol. moy / séance</p>
              <p className="text-3xl font-bold text-green-400 mt-2">
                {(globalStats.avgSessionVolume / 1000).toFixed(1)}
                <span className="text-sm font-normal text-gray-400"> k</span>
              </p>
            </div>
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <p className="text-gray-400 text-xs font-bold leading-tight">Séances / sem.</p>
              <p className="text-3xl font-bold text-purple-400 mt-2">{globalStats.avgPerWeek}</p>
            </div>
          </div>

          {/* Sessions/week bar chart */}
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-xs font-bold text-gray-400 uppercase mb-4">Séances par semaine (6 sem.)</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={sessionsPerWeekData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="week" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <YAxis stroke="#9ca3af" allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="séances" fill="#3b82f6" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── PAR GROUPE MUSCULAIRE ── */}
      {activeTab === 'group' && (
        <div className="space-y-4">
          {/* Muscle group selector */}
          <div className="flex flex-wrap gap-2">
            {muscleGroups.filter(g => g !== 'Poids du corps').map(g => (
              <button
                key={g}
                onClick={() => setSelectedGroup(g)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                  selectedGroup === g
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {groupExerciseStats.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Aucune donnée pour {selectedGroup}</p>
              <p className="text-sm mt-1">Lance une séance avec ces exercices!</p>
            </div>
          ) : (
            groupExerciseStats.map(ex => (
              <div key={ex.exId} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="font-bold text-white mb-3">{ex.name}</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-gray-800/50 rounded-lg p-2">
                    <p className="text-xs text-gray-500">1RM estimé</p>
                    <p className="text-lg font-bold text-green-400">{ex.best1RM} kg</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-2">
                    <p className="text-xs text-gray-500">Charge moy.</p>
                    <p className="text-lg font-bold text-blue-400">{ex.avgWeight} kg</p>
                  </div>
                </div>

                {ex.weeklyData.length > 1 && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Progression 1RM</p>
                      <ResponsiveContainer width="100%" height={100}>
                        <LineChart data={ex.weeklyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="week" stroke="#6b7280" tick={{ fontSize: 10 }} />
                          <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} width={35} />
                          <Tooltip {...TOOLTIP_STYLE} />
                          <Line type="monotone" dataKey="PR" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Charge d'entraînement</p>
                      <ResponsiveContainer width="100%" height={100}>
                        <LineChart data={ex.weeklyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="week" stroke="#6b7280" tick={{ fontSize: 10 }} />
                          <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} width={35} />
                          <Tooltip {...TOOLTIP_STYLE} />
                          <Line type="monotone" dataKey="Charge" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── PAR EXERCICE ── */}
      {activeTab === 'exercise' && (
        <div className="space-y-6">
          {/* Optional program filter */}
          {customPrograms.length > 0 && (
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Filtrer par programme</label>
              <select
                value={selectedProgramId}
                onChange={e => {
                  const newId = e.target.value;
                  setSelectedProgramId(newId);
                  if (newId !== 'all') {
                    const prog = customPrograms.find(p => p.id === newId);
                    if (prog?.exercises?.[0]) setSelectedExercise(prog.exercises[0].exerciseId);
                  } else {
                    setSelectedExercise(exercises[0]?.id || '');
                  }
                }}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">Tous les programmes</option>
                {customPrograms.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase">Exercice</h3>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {exercisesForSelector.map(ex => (
                <button
                  key={ex.id}
                  onClick={() => setSelectedExercise(ex.id)}
                  className={`p-2 rounded text-sm font-bold transition text-left ${
                    selectedExercise === ex.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {ex.name}
                </button>
              ))}
            </div>
          </div>

          {exerciseData && exerciseData.length > 0 ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-900 rounded p-3 border border-gray-800">
                  <p className="text-xs text-gray-400">Meilleur 1RM</p>
                  <p className="text-2xl font-bold text-green-400 mt-1">
                    {Math.max(...exerciseData.map(d => d.best1RM))} kg
                  </p>
                </div>
                <div className="bg-gray-900 rounded p-3 border border-gray-800">
                  <p className="text-xs text-gray-400">Séries</p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">
                    {exerciseData.reduce((sum, d) => sum + d.count, 0)}
                  </p>
                </div>
                <div className="bg-gray-900 rounded p-3 border border-gray-800">
                  <p className="text-xs text-gray-400">Progression</p>
                  <p className="text-2xl font-bold text-amber-400 mt-1">
                    +{(exerciseData[exerciseData.length - 1]?.best1RM - exerciseData[0]?.best1RM).toFixed(0)} kg
                  </p>
                </div>
              </div>

              {prediction && (
                <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg p-4 border border-purple-700">
                  <p className="text-purple-200 text-sm font-bold">Prédiction</p>
                  <p className="text-white mt-2">
                    Dans {prediction.weeks} semaines, tu pourras faire{' '}
                    <span className="font-bold text-2xl text-purple-300">{prediction.predictedMax} kg</span>!
                  </p>
                </div>
              )}

              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <p className="text-xs text-gray-400 font-bold uppercase mb-3">Progression 1RM</p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={exerciseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="week" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Line
                      type="monotone"
                      dataKey="best1RM"
                      stroke="#3b82f6"
                      dot={{ fill: '#60a5fa', r: 4 }}
                      strokeWidth={2}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <p className="text-xs text-gray-400 font-bold uppercase mb-3">Volume</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={exerciseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="week" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Bar dataKey="volume" fill="#10b981" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-400">
              Aucune donnée pour {currentExerciseName}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
