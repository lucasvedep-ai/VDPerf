import { useState, useEffect } from 'react';
import { Check, X, Plus, Trash2 } from 'lucide-react';
import { exerciseMap } from '../data/exercises.js';
import { useRestTimer } from '../hooks/useRestTimer.js';
import { estimate1RM } from '../utils/calculations.js';
import RestTimer from './RestTimer.jsx';

// Résout le nom d'un exercice: exerciseMap d'abord, sinon le nom stocké dans planExercises
function resolveExName(planEx) {
  return exerciseMap[planEx.exerciseId]?.name || planEx.name || planEx.exerciseName || 'Exercice';
}

export default function ActiveSession({ store, onComplete }) {
  const { activeSession, logSet, removeSet, completeSession, cancelSession, getExerciseHistory } = store;

  const planExercises = activeSession?.planExercises || [];
  const planName = activeSession?.planName || 'Session';
  const planFocus = activeSession?.planFocus || '';

  if (!planExercises || planExercises.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 font-bold mb-4">Erreur: Aucun exercice trouvé</p>
          <button
            onClick={() => cancelSession()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  const timer = useRestTimer();

  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [setInput, setSetInput] = useState({ weight: '', reps: '', rpe: '', duration: '', distance: '', value: '' });
  const [elapsed, setElapsed] = useState(0);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - activeSession.startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession.startTime]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const currentPlanEx = planExercises[currentExIdx];
  const currentSessionEx = activeSession.exercises?.[currentExIdx];

  if (!currentPlanEx) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 font-bold mb-4">Erreur: Exercice {currentExIdx} non trouvé</p>
          <button
            onClick={() => setCurrentExIdx(0)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const history = getExerciseHistory(currentPlanEx.exerciseId);
  const lastSession = history[history.length - 1] ?? null;

  // Nombre de séries planifiées (compatible standard et custom)
  const setsCount = typeof currentPlanEx.sets === 'number'
    ? currentPlanEx.sets
    : (Array.isArray(currentPlanEx.sets) ? currentPlanEx.sets.length : 0);

  const paramType = currentSessionEx?.paramType || 'weight';
  const cardioType = currentSessionEx?.cardioType || null;

  const handleLogSet = () => {
    let setData = {};
    let valid = false;

    if (paramType === 'weight') {
      const weight = parseFloat(setInput.weight);
      const reps = parseInt(setInput.reps, 10);
      if (!weight || !reps) return;
      setData = { weight, reps, rpe: setInput.rpe ? parseFloat(setInput.rpe) : null };
      valid = true;
    } else if (paramType === 'reps') {
      const reps = parseInt(setInput.reps, 10);
      if (!reps) return;
      setData = { reps };
      valid = true;
    } else if (paramType === 'time') {
      const duration = parseInt(setInput.duration, 10);
      if (!duration) return;
      setData = { duration };
      valid = true;
    } else if (paramType === 'cardio') {
      const value = parseFloat(setInput.value);
      if (!value) return;
      setData = { cardioType, value };
      valid = true;
    }

    if (!valid) return;
    logSet(currentPlanEx.exerciseId, setData);
    const restTime = typeof currentPlanEx.rest === 'number' ? currentPlanEx.rest : 60;
    timer.start(restTime);
    setSetInput(prev => ({ ...prev, rpe: '', duration: '', value: '' }));
  };

  const handleComplete = () => {
    completeSession();
    onComplete();
  };

  const handleCancel = () => {
    cancelSession();
  };

  const currentExName = resolveExName(currentPlanEx);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {timer.isRunning && <RestTimer timer={timer} />}

      {/* Header */}
      <div className="bg-gray-900 px-4 py-4 flex items-center justify-between border-b border-gray-800">
        <div>
          <h1 className="font-bold text-lg">{planName}{planFocus ? ` — ${planFocus}` : ''}</h1>
          <p className="text-gray-400 text-sm tabular-nums">{formatTime(elapsed)}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleComplete}
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Check size={15} /> Terminer
          </button>
          <button
            onClick={() => setShowConfirmCancel(true)}
            className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Exercise tabs */}
      <div className="flex overflow-x-auto gap-2 px-4 py-3 bg-gray-900/50 border-b border-gray-800/50">
        {planExercises.map((ex, i) => {
          const sessionEx = activeSession.exercises?.[i];
          const exSetsCount = typeof ex.sets === 'number' ? ex.sets : (Array.isArray(ex.sets) ? ex.sets.length : 0);
          const done = (sessionEx?.sets?.length || 0) >= exSetsCount;
          const name = resolveExName(ex);
          return (
            <button
              key={`${ex.exerciseId}-${i}`}
              onClick={() => setCurrentExIdx(i)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                i === currentExIdx
                  ? 'bg-indigo-600 text-white'
                  : done
                  ? 'bg-green-900/60 text-green-400'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              {name.split(' ').slice(0, 2).join(' ')}
              {done && ' ✓'}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-8">
        {/* Exercise header */}
        <div>
          <h2 className="text-xl font-bold">{currentExName}</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            {setsCount} séries × {currentPlanEx.reps} reps
            {currentPlanEx.rpe ? ` · RPE ${currentPlanEx.rpe}` : ''}
            {currentPlanEx.rest ? ` · Repos ${currentPlanEx.rest}s` : ''}
          </p>
        </div>

        {/* Last session reference */}
        {lastSession && (
          <div className="bg-gray-900 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-2">
              Dernière séance — {new Date(lastSession.date).toLocaleDateString('fr-FR')}
            </p>
            <div className="flex gap-4 flex-wrap">
              {lastSession.sets.map((set, i) => (
                <div key={i} className="text-center">
                  <p className="text-xs text-gray-600">#{i + 1}</p>
                  <p className="text-sm font-semibold text-gray-200">
                    {set.weight}kg × {set.reps}
                  </p>
                  {set.rpe && <p className="text-xs text-gray-500">RPE {set.rpe}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Set input */}
        <div className="bg-gray-900 rounded-2xl p-4 space-y-4">
          <p className="text-sm font-semibold text-gray-300">
            Série {(currentSessionEx?.sets?.length || 0) + 1}
            {(currentSessionEx?.sets?.length || 0) < setsCount && ` / ${setsCount}`}
          </p>

          {/* Weight type: weight + reps + RPE */}
          {paramType === 'weight' && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'weight', label: 'Poids (kg)', placeholder: '80', step: '2.5' },
                { key: 'reps', label: 'Reps', placeholder: '8', step: '1' },
                { key: 'rpe', label: 'RPE', placeholder: '8', step: '0.5' },
              ].map(({ key, label, placeholder, step }) => (
                <div key={key}>
                  <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                  <input
                    type="number"
                    step={step}
                    value={setInput[key]}
                    onChange={e => setSetInput(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full bg-gray-800 rounded-xl px-3 py-3 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder={placeholder}
                    inputMode="decimal"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Reps only */}
          {paramType === 'reps' && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Répétitions</label>
              <input
                type="number"
                step="1"
                value={setInput.reps}
                onChange={e => setSetInput(p => ({ ...p, reps: e.target.value }))}
                className="w-full bg-gray-800 rounded-xl px-3 py-3 text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="15"
                inputMode="numeric"
              />
            </div>
          )}

          {/* Time (seconds) */}
          {paramType === 'time' && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Durée (secondes)</label>
              <input
                type="number"
                step="5"
                value={setInput.duration}
                onChange={e => setSetInput(p => ({ ...p, duration: e.target.value }))}
                className="w-full bg-gray-800 rounded-xl px-3 py-3 text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="60"
                inputMode="numeric"
              />
            </div>
          )}

          {/* Cardio */}
          {paramType === 'cardio' && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                {cardioType === 'duration' ? 'Durée (min)' : cardioType === 'distance' ? 'Distance (km)' : 'Répétitions'}
              </label>
              <input
                type="number"
                step={cardioType === 'distance' ? '0.5' : '1'}
                value={setInput.value}
                onChange={e => setSetInput(p => ({ ...p, value: e.target.value }))}
                className="w-full bg-gray-800 rounded-xl px-3 py-3 text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder={cardioType === 'duration' ? '30' : cardioType === 'distance' ? '5' : '50'}
                inputMode="decimal"
              />
            </div>
          )}

          <button
            onClick={handleLogSet}
            disabled={
              (paramType === 'weight' && (!setInput.weight || !setInput.reps)) ||
              (paramType === 'reps' && !setInput.reps) ||
              (paramType === 'time' && !setInput.duration) ||
              (paramType === 'cardio' && !setInput.value)
            }
            className="w-full bg-indigo-600 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={18} /> Enregistrer la série
          </button>
        </div>

        {/* Logged sets */}
        {(currentSessionEx?.sets?.length || 0) > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Séries enregistrées
            </p>
            <div className="space-y-2">
              {currentSessionEx.sets.map((set, i) => {
                let label = '';
                if (paramType === 'weight') {
                  const e1rm = estimate1RM(set.weight || 0, set.reps || 0);
                  label = `${set.weight} kg × ${set.reps}${set.rpe ? ` · RPE ${set.rpe}` : ''} · ≈${e1rm} kg`;
                } else if (paramType === 'reps') {
                  label = `× ${set.reps} reps`;
                } else if (paramType === 'time') {
                  const mins = Math.floor((set.duration || 0) / 60);
                  const secs = (set.duration || 0) % 60;
                  label = `${mins}:${String(secs).padStart(2, '0')}`;
                } else if (paramType === 'cardio') {
                  const suffix = set.cardioType === 'duration' ? 'min' : set.cardioType === 'distance' ? 'km' : 'reps';
                  label = `${set.value} ${suffix}`;
                }
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-gray-900 rounded-xl px-4 py-3"
                  >
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-600 w-4">#{i + 1}</span>
                      <span className="font-semibold">{label}</span>
                    </div>
                    <button
                      onClick={() => removeSet(currentPlanEx.exerciseId, i)}
                      className="text-gray-600 hover:text-red-400 p-1 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Confirm cancel modal */}
      {showConfirmCancel && (
        <div className="fixed inset-0 bg-black/75 flex items-end justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-bold text-lg">Annuler la séance ?</h3>
            <p className="text-gray-400 text-sm">
              Les données de cette séance ne seront pas sauvegardées.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmCancel(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 py-3 rounded-xl font-semibold text-sm transition-colors"
              >
                Continuer
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-red-600 hover:bg-red-500 py-3 rounded-xl font-semibold text-sm transition-colors"
              >
                Annuler la séance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
