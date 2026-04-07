import { useState } from 'react';
import { planMap, planOrder } from '../data/workoutPlans.js';
import { exerciseMap } from '../data/exercises.js';
import { calculateAdherence, estimate1RM, getNextPlanId } from '../utils/calculations.js';
import { bonusSessionTemplates } from '../data/bonusTemplates.js';
import SessionPreview from './SessionPreview.jsx';
import AppleMusicPlayer from './AppleMusicPlayer.jsx';

export default function Dashboard({ store }) {
  const { sessions, startSession } = store;
  const [showSessionSelector, setShowSessionSelector] = useState(false);
  const [previewSession, setPreviewSession] = useState(null);
  const completed = sessions.filter(s => s.status === 'completed');

  const nextPlanId = getNextPlanId(sessions, planOrder);
  const nextPlan = planMap[nextPlanId];
  const adherence = calculateAdherence(sessions);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const weeklyVolume = completed
    .filter(s => new Date(s.date) >= cutoff)
    .flatMap(s => s.exercises.flatMap(e => e.sets))
    .reduce((total, set) => total + set.weight * set.reps, 0);

  const mainLifts = ['bench-press', 'squat', 'deadlift'];
  const bestLifts = mainLifts.map(exerciseId => {
    const allSets = completed.flatMap(
      s => s.exercises.find(e => e.exerciseId === exerciseId)?.sets ?? []
    );
    if (allSets.length === 0) return { exerciseId, e1rm: null };
    const best = allSets.reduce((best, set) =>
      estimate1RM(set.weight, set.reps) > estimate1RM(best.weight, best.reps) ? set : best
    );
    return { exerciseId, e1rm: estimate1RM(best.weight, best.reps) };
  });

  const recentSessions = [...completed]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const formatVolume = (v) =>
    v >= 1000 ? `${(v / 1000).toFixed(1)}k kg` : `${v} kg`;

  if (previewSession) {
    return (
      <SessionPreview
        session={previewSession}
        onStart={(session) => {
          startSession(session.id || session.planId, session);
          setPreviewSession(null);
        }}
        onBack={() => setPreviewSession(null)}
      />
    );
  }

  if (showSessionSelector) {
    return (
      <div className="p-6">
        <button
          onClick={() => setShowSessionSelector(false)}
          className="text-blue-400 mb-6 font-bold"
        >
          ← Retour
        </button>

        <h2 className="text-2xl font-bold mb-6">Sélectionne ta séance</h2>

        {/* Standard Sessions */}
        <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Programmes Standards</h3>
        <div className="space-y-3 mb-8">
          {planOrder.map((planId) => {
            const plan = planMap[planId];
            return (
              <button
                key={planId}
                onClick={() => setPreviewSession(plan)}
                className="w-full bg-gray-900 border-l-4 border-blue-600 p-4 rounded text-left hover:bg-gray-800 transition"
              >
                <div className="font-bold">{plan.name}</div>
                <div className="text-xs text-gray-400">{plan.focus}</div>
              </button>
            );
          })}
        </div>

        {/* Bonus Sessions */}
        <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Bonus ({bonusSessionTemplates.length})</h3>
        <div className="space-y-3">
          {bonusSessionTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => setPreviewSession(template)}
              className="w-full bg-gray-900 border-l-4 border-amber-600 p-4 rounded text-left hover:bg-gray-800 transition"
            >
              <div className="font-bold">{template.name}</div>
              <div className="text-xs text-gray-400">{template.description}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="pt-8">
        <h1 className="text-2xl font-bold tracking-tight">VDPerf</h1>
        <p className="text-gray-400 text-sm capitalize">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Apple Music Player */}
      <AppleMusicPlayer />

      {/* Next workout card */}
      <div className="bg-indigo-600 rounded-2xl p-5">
        <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest">
          Prochain entraînement
        </p>
        <h2 className="text-xl font-bold mt-1">
          {nextPlan.name} — {nextPlan.focus}
        </h2>
        <p className="text-indigo-200 text-sm mt-0.5">
          {nextPlan.exercises.length} exercices
        </p>
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => setPreviewSession(nextPlan)}
            className="flex-1 bg-white text-indigo-600 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-indigo-50 transition"
          >
            Lancer
          </button>
          <button
            onClick={() => setShowSessionSelector(true)}
            className="flex-1 bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-sm hover:bg-indigo-800 transition"
          >
            Choisir
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-950/60 border border-green-900/40 rounded-2xl p-4">
          <p className="text-green-400 text-xs font-semibold uppercase tracking-wider">Adhérence</p>
          <p className="text-2xl font-bold text-green-300 mt-1">{adherence}%</p>
          <p className="text-green-500 text-xs mt-1">4 dernières semaines</p>
        </div>
        <div className="bg-blue-950/60 border border-blue-900/40 rounded-2xl p-4">
          <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider">Volume hebdo</p>
          <p className="text-2xl font-bold text-blue-300 mt-1">{formatVolume(weeklyVolume)}</p>
          <p className="text-blue-500 text-xs mt-1">7 derniers jours</p>
        </div>
      </div>

      {/* Best lifts */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
          1RM estimé — meilleurs lifts
        </h3>
        <div className="space-y-2">
          {bestLifts.map(({ exerciseId, e1rm }) => (
            <div
              key={exerciseId}
              className="flex items-center justify-between bg-gray-900 rounded-xl px-4 py-3"
            >
              <span className="font-medium text-sm">{exerciseMap[exerciseId]?.name}</span>
              <span className="font-bold text-indigo-400">
                {e1rm !== null ? `${e1rm} kg` : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
            Séances récentes
          </h3>
          <div className="space-y-2">
            {recentSessions.map(session => {
              const plan = planMap[session.planId];
              const totalSets = session.exercises.reduce((t, e) => t + e.sets.length, 0);
              const vol = session.exercises.flatMap(e => e.sets).reduce((t, s) => t + s.weight * s.reps, 0);
              const duration = session.endTime
                ? Math.round((session.endTime - session.startTime) / 60000)
                : null;
              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between bg-gray-900 rounded-xl px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-sm">{plan?.name} — {plan?.focus}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {new Date(session.date).toLocaleDateString('fr-FR')}
                      {' · '}{totalSets} séries
                      {duration ? ` · ${duration} min` : ''}
                    </p>
                  </div>
                  <span className="text-sm text-gray-400 font-medium">{formatVolume(vol)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {completed.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          <p className="text-sm">Aucune séance enregistrée.</p>
          <p className="text-sm">Lance ton premier entraînement ci-dessus.</p>
        </div>
      )}
    </div>
  );
}