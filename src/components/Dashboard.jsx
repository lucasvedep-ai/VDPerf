import { useState, useMemo } from 'react';
import { Flame, Award, TrendingUp, Calendar } from 'lucide-react';
import { planMap } from '../data/workoutPlans.js';
import SessionSelector from './SessionSelector.jsx';

export default function Dashboard({ store }) {
  const [showSessionSelector, setShowSessionSelector] = useState(false);
  const { sessions = [] } = store || {};
  const completed = sessions.filter(s => s?.status === 'completed') || [];

  // Calculer les stats
  const stats = useMemo(() => {
    const totalVolume = completed.reduce((sum, s) => {
      return sum + (s.exercises || []).reduce((exSum, ex) => {
        return exSum + (ex.sets || []).reduce((setSum, set) => {
          return setSum + (set.weight || 0) * (set.reps || 0);
        }, 0);
      }, 0);
    }, 0);

    const totalSessions = completed.length;
    const avgSessionVolume = totalSessions > 0 ? totalVolume / totalSessions : 0;
    const totalSets = completed.reduce((sum, s) => {
      return sum + (s.exercises || []).reduce((exSum, ex) => exSum + (ex.sets || []).length, 0);
    }, 0);

    return { totalVolume, totalSessions, avgSessionVolume, totalSets };
  }, [completed]);

  // Calculer streak (jours consécutifs d'entraînement)
  const streak = useMemo(() => {
    if (completed.length === 0) return 0;

    const dates = completed
      .map(s => new Date(s.date))
      .sort((a, b) => b - a);

    let current = 0;
    let lastDate = new Date();

    for (const date of dates) {
      const diffDays = Math.floor((lastDate - date) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) {
        current++;
        lastDate = date;
      } else {
        break;
      }
    }

    return current;
  }, [completed]);

  const { totalVolume, totalSessions, avgSessionVolume, totalSets } = stats;

  // Calculer badges
  const badges = useMemo(() => {
    const earned = [];

    if (totalSessions >= 1) earned.push({ name: '🚀 Starter', desc: 'Première séance' });
    if (totalSessions >= 10) earned.push({ name: '💪 Grinder', desc: '10 séances complétées' });
    if (totalSessions >= 25) earned.push({ name: '⚡ Machine', desc: '25 séances complétées' });
    if (totalSessions >= 50) earned.push({ name: '🏆 Legend', desc: '50 séances complétées' });
    if (streak >= 7) earned.push({ name: '🔥 Week Warrior', desc: '7 jours consécutifs' });
    if (streak >= 30) earned.push({ name: '😤 Iron', desc: '30 jours consécutifs' });
    if (Math.round(totalVolume) >= 50000) earned.push({ name: '🌊 Volume King', desc: '50k kg levés' });

    return earned;
  }, [totalSessions, totalVolume, streak]);

  if (showSessionSelector) {
    return <SessionSelector store={store} onBack={() => setShowSessionSelector(false)} />;
  }

  return (
    <div className="p-6 pb-24 bg-gray-950 min-h-screen">
      {/* Header Premium */}
      <div className="mb-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-2">
          VDPerf
        </h1>
        <p className="text-gray-400 text-sm">Entraînement Intelligent • Progression Garantie</p>
      </div>

      {/* Streak & Stats Premium */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Streak */}
        <div className="bg-gradient-to-br from-red-600/20 to-orange-600/20 border border-orange-500/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="text-xs text-gray-400 font-bold">STREAK</span>
          </div>
          <p className="text-3xl font-black text-orange-400">{streak}</p>
          <p className="text-xs text-gray-400 mt-1">jours consécutifs 🔥</p>
        </div>

        {/* Sessions */}
        <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-gray-400 font-bold">SESSIONS</span>
          </div>
          <p className="text-3xl font-black text-blue-400">{totalSessions}</p>
          <p className="text-xs text-gray-400 mt-1">complétées ✅</p>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Volume</p>
          <p className="text-xl font-black text-white">{(totalVolume / 1000).toFixed(1)}k</p>
          <p className="text-xs text-gray-500 mt-1">kg total</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Moy/Séance</p>
          <p className="text-xl font-black text-white">{(avgSessionVolume / 1000).toFixed(1)}k</p>
          <p className="text-xs text-gray-500 mt-1">kg/séance</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Séries</p>
          <p className="text-xl font-black text-white">{totalSets}</p>
          <p className="text-xs text-gray-500 mt-1">totales</p>
        </div>
      </div>

      {/* Badges Section */}
      {badges.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-black text-gray-400 uppercase mb-3 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Badges Débloqués
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {badges.map((badge, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-yellow-600/20 to-amber-600/20 border border-yellow-500/50 rounded-lg p-3"
              >
                <p className="text-2xl mb-1">{badge.name.split(' ')[0]}</p>
                <p className="text-xs text-gray-400">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prochaine Séance */}
      <div className="mb-6">
        <h2 className="text-sm font-black text-gray-400 uppercase mb-3">Prochaine Séance</h2>
        <button
          onClick={() => setShowSessionSelector(true)}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-4 rounded-xl transition shadow-lg hover:shadow-xl"
        >
          🚀 Lancer l'entraînement
        </button>
      </div>

      {/* Motivation Quote */}
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/50 rounded-xl p-4">
        <p className="text-sm text-gray-300 italic">
          "La consistance bat la perfection. Chaque séance te rapproche de tes objectifs. 💪"
        </p>
      </div>
    </div>
  );
}