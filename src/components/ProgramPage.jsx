import { useState, useMemo } from 'react';
import { Play, Plus, Trash2, BarChart2, Clock, Edit2 } from 'lucide-react';
import { planMap, planOrder } from '../data/workoutPlans.js';
import { exerciseMap } from '../data/exercises.js';
import { bonusSessionTemplates } from '../data/bonusTemplates.js';
import { estimate1RM } from '../utils/calculations.js';
import SessionPreview from './SessionPreview.jsx';
import CustomProgramCreator from './CustomProgramCreator.jsx';
import ExerciseCustomizer from './ExerciseCustomizer.jsx';

// Compute average duration (ms) for a given planId prefix
function useAvgDuration(sessions, planIdPrefix) {
  return useMemo(() => {
    const relevant = sessions.filter(s =>
      s?.status === 'completed' &&
      s.planId &&
      s.planId.startsWith(planIdPrefix) &&
      s.startTime && s.endTime
    );
    if (!relevant.length) return null;
    const totalMs = relevant.reduce((sum, s) => {
      const ms = new Date(s.endTime) - new Date(s.startTime);
      return ms > 0 ? sum + ms : sum;
    }, 0);
    const avgMs = totalMs / relevant.length;
    const mins = Math.round(avgMs / 60000);
    return mins > 0 ? `~${mins} min` : null;
  }, [sessions, planIdPrefix]);
}

// ── Stats avant lancement (programme perso) ───────────────────────────────────
function ProgramStats({ program, sessions, onLaunch, onBack }) {
  const completed = sessions.filter(s => s?.status === 'completed');

  const getExStats = (exerciseId) => {
    const allSets = completed
      .flatMap(s => (s.exercises || []).filter(e => e.exerciseId === exerciseId).flatMap(e => e.sets || []));
    if (!allSets.length) return null;
    const best1RM = Math.max(...allSets.map(s => estimate1RM(s.weight || 0, s.reps || 0)));
    const totalVolume = allSets.reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0);
    const timesCompleted = completed.filter(s =>
      (s.exercises || []).some(e => e.exerciseId === exerciseId && (e.sets || []).length > 0)
    ).length;
    const lastSession = completed
      .filter(s => (s.exercises || []).some(e => e.exerciseId === exerciseId && (e.sets || []).length > 0))
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    const lastSet = lastSession?.exercises?.find(e => e.exerciseId === exerciseId)?.sets?.[0];
    return { best1RM, totalVolume, timesCompleted, lastSet };
  };

  return (
    <div className="p-6 pb-24 bg-gray-950 min-h-screen">
      <button onClick={onBack} className="flex items-center gap-1 text-blue-400 font-bold mb-6">
        ← Retour
      </button>
      <h1 className="text-2xl font-black text-white mb-1">{program.name}</h1>
      <p className="text-gray-400 text-sm mb-6">Stats • {program.createdAt}</p>
      <div className="space-y-4 mb-8">
        {program.exercises.map((ex, idx) => {
          const stats = getExStats(ex.exerciseId);
          return (
            <div key={idx} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="font-bold text-white mb-1">{ex.exerciseName}</p>
              <p className="text-xs text-gray-500 mb-3">{ex.sets.length} séries · {ex.muscleGroup}</p>
              {stats ? (
                <div className="grid grid-cols-2 gap-2">
                  {stats.lastSet && (
                    <div className="bg-gray-800/50 rounded-lg p-2">
                      <p className="text-xs text-gray-500">Dernier</p>
                      <p className="text-sm font-bold text-white">{stats.lastSet.weight}kg × {stats.lastSet.reps}</p>
                    </div>
                  )}
                  <div className="bg-gray-800/50 rounded-lg p-2">
                    <p className="text-xs text-gray-500">1RM estimé</p>
                    <p className="text-sm font-bold text-green-400">{stats.best1RM} kg</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-2">
                    <p className="text-xs text-gray-500">Complété</p>
                    <p className="text-sm font-bold text-blue-400">{stats.timesCompleted}×</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-2">
                    <p className="text-xs text-gray-500">Volume total</p>
                    <p className="text-sm font-bold text-purple-400">{(stats.totalVolume / 1000).toFixed(1)}k kg</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-600 italic">Aucune donnée encore</p>
              )}
            </div>
          );
        })}
      </div>
      <button
        onClick={onLaunch}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-4 rounded-xl transition text-lg"
      >
        🚀 Lancer la séance
      </button>
    </div>
  );
}

// ── Duration Badge ──────────────────────────────────────────────────────────
function DurationBadge({ sessions, planId }) {
  const avg = useAvgDuration(sessions, planId);
  if (!avg) return null;
  return (
    <span className="text-xs text-gray-500 flex items-center gap-1">
      <Clock className="w-3 h-3" /> {avg}
    </span>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function ProgramPage({ store }) {
  const [activeTab, setActiveTab] = useState('perso');
  const [previewSession, setPreviewSession] = useState(null);
  const [view, setView] = useState('list');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [editingProgram, setEditingProgram] = useState(null);

  if (!store) return <div className="p-6 text-red-400">Erreur: store non disponible</div>;

  const { customPrograms = [], customExercises = [], sessions = [] } = store;

  if (view === 'create-program') {
    return (
      <CustomProgramCreator
        customExercises={customExercises}
        onSave={(program) => { store.saveCustomProgram(program); setView('list'); setActiveTab('perso'); }}
        onBack={() => setView('list')}
      />
    );
  }

  if (view === 'edit-program' && editingProgram) {
    return (
      <CustomProgramCreator
        customExercises={customExercises}
        initialProgram={editingProgram}
        onSave={(program) => { store.saveCustomProgram(program); setView('list'); setEditingProgram(null); }}
        onBack={() => { setView('list'); setEditingProgram(null); }}
      />
    );
  }

  if (view === 'create-exercise') {
    return (
      <ExerciseCustomizer
        onSave={(exercise) => { store.saveCustomExercise(exercise); setView('list'); }}
        onBack={() => setView('list')}
      />
    );
  }

  if (view === 'program-stats' && selectedProgram) {
    return (
      <ProgramStats
        program={selectedProgram}
        sessions={sessions}
        onLaunch={() => { store.startCustomProgram(selectedProgram); setView('list'); setSelectedProgram(null); }}
        onBack={() => { setView('list'); setSelectedProgram(null); }}
      />
    );
  }

  if (previewSession) {
    return (
      <SessionPreview
        session={previewSession}
        store={store}
        onStart={(session) => {
          const sessionId = session.id || session.planId || `session-${Date.now()}`;
          store.startSession(sessionId, session);
        }}
        onBack={() => setPreviewSession(null)}
      />
    );
  }

  const tabs = [
    { id: 'perso', label: `Perso (${customPrograms.length})` },
    { id: 'standard', label: 'Standard' },
    { id: 'bonus', label: `Bonus (${bonusSessionTemplates.length})` },
  ];

  return (
    <div className="p-6 pb-20">
      <h1 className="text-3xl font-bold mb-6">Mon Programme</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(tab => (
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

      {/* PERSO */}
      {activeTab === 'perso' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <button
              onClick={() => setView('create-program')}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-4 h-4" /> Créer un programme
            </button>
            <button
              onClick={() => setView('create-exercise')}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition text-sm"
            >
              <Plus className="w-4 h-4" /> Exercice perso
            </button>
          </div>

          {customExercises.length > 0 && (
            <div className="bg-gray-900 border border-purple-800/50 rounded-xl p-4">
              <p className="text-xs font-black text-purple-400 uppercase mb-2">Exercices perso ({customExercises.length})</p>
              <div className="flex flex-wrap gap-2">
                {customExercises.map(ex => (
                  <span key={ex.id} className="text-xs bg-purple-900/40 border border-purple-700/50 text-purple-300 px-2 py-1 rounded-full">
                    {ex.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {customPrograms.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">Aucun programme perso</p>
              <p className="text-sm">Crée ton premier programme ci-dessus!</p>
            </div>
          ) : (
            customPrograms.map(program => (
              <div key={program.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-white text-lg">{program.name}</h3>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <p className="text-xs text-gray-500">{program.exercises.length} exercice{program.exercises.length > 1 ? 's' : ''}</p>
                  <DurationBadge sessions={sessions} planId={program.id} />
                </div>
                <div className="space-y-1 mb-4">
                  {program.exercises.map((ex, idx) => (
                    <div key={idx} className="text-xs text-gray-400 flex justify-between">
                      <span>{ex.exerciseName}</span>
                      <span className="text-gray-600">{ex.sets.length} séries</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setSelectedProgram(program); setView('program-stats'); }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition text-sm"
                  >
                    <BarChart2 className="w-4 h-4" /> Stats + Lancer
                  </button>
                  <button
                    onClick={() => store.startCustomProgram(program)}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-lg transition"
                    title="Lancer directement"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setEditingProgram(program); setView('edit-program'); }}
                    className="bg-gray-800 hover:bg-blue-900/50 text-gray-400 hover:text-blue-400 px-3 py-2.5 rounded-lg transition"
                    title="Modifier"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { if (confirm(`Supprimer "${program.name}" ?`)) store.deleteCustomProgram(program.id); }}
                    className="bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-400 px-3 py-2.5 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* STANDARD */}
      {activeTab === 'standard' && (
        <div className="space-y-4">
          {planOrder.map(planId => {
            const plan = planMap[planId];
            return (
              <div key={planId} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-sm text-gray-400">Focus: {plan.focus}</p>
                  <DurationBadge sessions={sessions} planId={planId} />
                </div>
                <div className="space-y-2 mb-4">
                  {plan.exercises.map((ex, idx) => {
                    const exercise = exerciseMap[ex.exerciseId];
                    return (
                      <div key={idx} className="bg-gray-800 rounded px-3 py-2 text-sm">
                        <div className="font-bold text-white">{exercise?.name}</div>
                        <div className="text-gray-400">{ex.sets}x{ex.reps} @ RPE {ex.rpe}</div>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPreviewSession(plan)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex items-center justify-center gap-2 transition font-bold"
                >
                  <Play className="w-4 h-4" /> Lancer
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* BONUS */}
      {activeTab === 'bonus' && (
        <div className="space-y-4">
          {bonusSessionTemplates.map(template => (
            <div key={template.id} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-lg font-bold text-white">{template.name}</h3>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <p className="text-xs text-gray-400">{template.description}</p>
                <DurationBadge sessions={sessions} planId={template.id} />
              </div>
              <div className="space-y-2 mb-4">
                {template.exercises.map((ex, idx) => {
                  const exercise = exerciseMap[ex.exerciseId];
                  return (
                    <div key={idx} className="bg-gray-800 rounded px-3 py-2 text-sm">
                      <div className="font-bold text-white">{exercise?.name}</div>
                      <div className="text-gray-400">{ex.sets}x{ex.reps} @ RPE {ex.rpe}</div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => setPreviewSession(template)}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded flex items-center justify-center gap-2 transition font-bold"
              >
                <Play className="w-4 h-4" /> Lancer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
