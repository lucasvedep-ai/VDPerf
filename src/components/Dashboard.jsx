import { useState, useMemo } from 'react';
import { Flame, Award, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { estimate1RM } from '../utils/calculations.js';
import { exerciseLibrary } from '../data/exerciseLibrary.js';
import { exercises as standardExercises } from '../data/exercises.js';
import SessionSelector from './SessionSelector.jsx';

// Group color map
const GROUP_COLORS = {
  Pectoraux: { bg: 'bg-red-500', light: 'bg-red-500/20 border-red-500/50', text: 'text-red-400', dot: '#ef4444' },
  Dos: { bg: 'bg-blue-500', light: 'bg-blue-500/20 border-blue-500/50', text: 'text-blue-400', dot: '#3b82f6' },
  Épaules: { bg: 'bg-yellow-500', light: 'bg-yellow-500/20 border-yellow-500/50', text: 'text-yellow-400', dot: '#eab308' },
  Jambes: { bg: 'bg-green-500', light: 'bg-green-500/20 border-green-500/50', text: 'text-green-400', dot: '#22c55e' },
  Biceps: { bg: 'bg-purple-500', light: 'bg-purple-500/20 border-purple-500/50', text: 'text-purple-400', dot: '#a855f7' },
  Triceps: { bg: 'bg-pink-500', light: 'bg-pink-500/20 border-pink-500/50', text: 'text-pink-400', dot: '#ec4899' },
  Abdominaux: { bg: 'bg-orange-500', light: 'bg-orange-500/20 border-orange-500/50', text: 'text-orange-400', dot: '#f97316' },
  Cardio: { bg: 'bg-cyan-500', light: 'bg-cyan-500/20 border-cyan-500/50', text: 'text-cyan-400', dot: '#06b6d4' },
};

const DEFAULT_COLOR = { bg: 'bg-gray-500', light: 'bg-gray-500/20 border-gray-500/50', text: 'text-gray-400', dot: '#6b7280' };

function getGroupColor(group) {
  return GROUP_COLORS[group] || DEFAULT_COLOR;
}

// Resolve session main muscle group
function getSessionGroup(session) {
  // Try planFocus
  if (session.planFocus && session.planFocus !== 'Personnalisé') {
    const focus = session.planFocus.toLowerCase();
    if (focus.includes('upper') || focus.includes('pec') || focus.includes('chest')) return 'Pectoraux';
    if (focus.includes('lower') || focus.includes('jambe') || focus.includes('leg')) return 'Jambes';
    if (focus.includes('dos') || focus.includes('back')) return 'Dos';
    if (focus.includes('épaule') || focus.includes('shoulder')) return 'Épaules';
  }
  // Try first exercise
  const firstEx = session.exercises?.[0];
  if (!firstEx) return null;
  const libEx = exerciseLibrary.find(e => e.id === firstEx.exerciseId);
  if (libEx) return libEx.muscleGroup;
  const stdEx = standardExercises.find(e => e.id === firstEx.exerciseId);
  if (stdEx) {
    const groupMap = { chest: 'Pectoraux', back: 'Dos', shoulders: 'Épaules', quads: 'Jambes', hamstrings: 'Jambes', biceps: 'Biceps', triceps: 'Triceps' };
    return groupMap[stdEx.group] || 'Autres';
  }
  return 'Autres';
}

// ── Performance Indicator ─────────────────────────────────────────────────────
function PerformanceIndicator({ sessions }) {
  const completed = sessions.filter(s => s?.status === 'completed');

  const perf = useMemo(() => {
    if (completed.length < 2) return null;

    const now = new Date();
    const weekAgo = new Date(now - 7 * 86400000);
    const monthAgo = new Date(now - 30 * 86400000);
    const prevMonthAgo = new Date(now - 60 * 86400000);

    const thisWeek = completed.filter(s => new Date(s.date) >= weekAgo);
    const thisMonth = completed.filter(s => new Date(s.date) >= monthAgo);
    const prevMonth = completed.filter(s => new Date(s.date) >= prevMonthAgo && new Date(s.date) < monthAgo);

    // 1. Look for PRs beaten this week
    for (const session of thisWeek) {
      for (const ex of session.exercises || []) {
        if (!ex.sets?.length) continue;
        const exMax = Math.max(...ex.sets.map(s => s.weight || 0));
        if (!exMax) continue;
        const history = completed
          .filter(s => new Date(s.date) < weekAgo)
          .flatMap(s => (s.exercises || []).filter(e => e.exerciseId === ex.exerciseId).flatMap(e => e.sets || []));
        if (!history.length) continue;
        const prevMax = Math.max(...history.map(s => s.weight || 0));
        if (exMax > prevMax) {
          const name = exerciseLibrary.find(e => e.id === ex.exerciseId)?.name
            || standardExercises.find(e => e.id === ex.exerciseId)?.name
            || ex.exerciseName || 'Exercice';
          return {
            emoji: '🏋️',
            title: `PR +${(exMax - prevMax).toFixed(1)}kg sur ${name}!`,
            sub: `${prevMax}kg → ${exMax}kg`,
            color: 'from-green-900/40 to-emerald-900/40 border-green-600/50',
          };
        }
      }
    }

    // 2. Adherence improvement
    if (prevMonth.length > 0) {
      const pct = Math.round(((thisMonth.length - prevMonth.length) / prevMonth.length) * 100);
      if (pct > 10) {
        return {
          emoji: '📈',
          title: `Assiduité +${pct}% vs mois dernier!`,
          sub: `${prevMonth.length} → ${thisMonth.length} séances`,
          color: 'from-blue-900/40 to-cyan-900/40 border-blue-600/50',
        };
      }
    }

    // 3. Milestone
    const total = completed.length;
    const milestones = [1, 5, 10, 25, 50, 100];
    const lastMilestone = milestones.filter(m => m <= total).pop();
    if (lastMilestone && total === lastMilestone) {
      return {
        emoji: '🏆',
        title: `${total} séances complétées!`,
        sub: 'Milestone atteint!',
        color: 'from-yellow-900/40 to-amber-900/40 border-yellow-600/50',
      };
    }

    // 4. This week summary
    if (thisWeek.length > 0) {
      return {
        emoji: '💪',
        title: `${thisWeek.length} séance${thisWeek.length > 1 ? 's' : ''} cette semaine`,
        sub: 'Continue comme ça!',
        color: 'from-purple-900/40 to-pink-900/40 border-purple-600/50',
      };
    }

    return null;
  }, [completed]);

  if (!perf) return null;

  return (
    <div className={`bg-gradient-to-r ${perf.color} border rounded-xl p-4 mb-6`}>
      <p className="text-xs font-black text-gray-300 uppercase mb-2">🎉 Dernière Performance</p>
      <p className="text-lg font-black text-white">{perf.emoji} {perf.title}</p>
      <p className="text-sm text-gray-400 mt-1">{perf.sub}</p>
    </div>
  );
}

// ── Integrated Calendar ───────────────────────────────────────────────────────
function MiniCalendar({ sessions }) {
  const completed = sessions.filter(s => s?.status === 'completed');
  const [offset, setOffset] = useState(0); // month offset from today

  const { year, month, days, monthLabel, groupStats } = useMemo(() => {
    const today = new Date();
    const d = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const yr = d.getFullYear();
    const mo = d.getMonth();
    const label = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    // Days in month
    const daysInMonth = new Date(yr, mo + 1, 0).getDate();
    const firstDayOfWeek = (new Date(yr, mo, 1).getDay() + 6) % 7; // Mon=0

    const dayMap = {};
    completed.forEach(s => {
      const sd = new Date(s.date);
      if (sd.getFullYear() === yr && sd.getMonth() === mo) {
        const day = sd.getDate();
        if (!dayMap[day]) dayMap[day] = [];
        const group = getSessionGroup(s);
        if (group) dayMap[day].push(group);
      }
    });

    // Group stats for the month
    const groupCounts = {};
    Object.values(dayMap).flat().forEach(g => { groupCounts[g] = (groupCounts[g] || 0) + 1; });

    return {
      year: yr,
      month: mo,
      days: { daysInMonth, firstDayOfWeek, dayMap },
      monthLabel: label.charAt(0).toUpperCase() + label.slice(1),
      groupStats: Object.entries(groupCounts).sort((a, b) => b[1] - a[1]),
    };
  }, [completed, offset]);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDay = isCurrentMonth ? today.getDate() : null;

  const cells = [];
  for (let i = 0; i < days.firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= days.daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setOffset(o => o - 1)} className="text-gray-400 hover:text-white p-1">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="font-bold text-white text-sm">{monthLabel}</p>
        <button onClick={() => setOffset(o => o + 1)} className="text-gray-400 hover:text-white p-1" disabled={offset >= 0}>
          <ChevronRight className={`w-4 h-4 ${offset >= 0 ? 'opacity-30' : ''}`} />
        </button>
      </div>

      {/* Days header */}
      <div className="grid grid-cols-7 mb-1">
        {['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'].map(d => (
          <div key={d} className="text-center text-xs text-gray-600 font-bold py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const groups = days.dayMap[day] || [];
          const isToday = day === todayDay;
          const mainGroup = groups[0];
          const color = mainGroup ? getGroupColor(mainGroup) : null;
          return (
            <div
              key={day}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-bold transition ${
                isToday
                  ? 'ring-2 ring-blue-400 text-blue-400'
                  : groups.length
                  ? `${color?.bg} text-white`
                  : 'text-gray-500 hover:bg-gray-800'
              }`}
            >
              {day}
              {groups.length > 1 && <div className="w-1 h-1 bg-white/70 rounded-full mt-0.5" />}
            </div>
          );
        })}
      </div>

      {/* Group legend */}
      {groupStats.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          <div className="flex flex-wrap gap-2">
            {groupStats.map(([group, count]) => {
              const c = getGroupColor(group);
              return (
                <span key={group} className={`text-xs px-2 py-0.5 rounded-full border ${c.light} ${c.text}`}>
                  {group}: {count}×
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Dashboard({ store }) {
  const [showSessionSelector, setShowSessionSelector] = useState(false);
  const { sessions = [] } = store || {};
  const completed = sessions.filter(s => s?.status === 'completed') || [];

  const stats = useMemo(() => {
    const totalVolume = completed.reduce((sum, s) =>
      sum + (s.exercises || []).reduce((eSum, ex) =>
        eSum + (ex.sets || []).reduce((sSum, set) => sSum + (set.weight || 0) * (set.reps || 0), 0), 0), 0);
    const totalSessions = completed.length;
    const avgSessionVolume = totalSessions > 0 ? totalVolume / totalSessions : 0;
    const totalSets = completed.reduce((sum, s) =>
      sum + (s.exercises || []).reduce((eSum, ex) => eSum + (ex.sets || []).length, 0), 0);
    return { totalVolume, totalSessions, avgSessionVolume, totalSets };
  }, [completed]);

  const streak = useMemo(() => {
    if (!completed.length) return 0;
    const dates = completed.map(s => new Date(s.date)).sort((a, b) => b - a);
    let current = 0;
    let lastDate = new Date();
    for (const date of dates) {
      const diffDays = Math.floor((lastDate - date) / 86400000);
      if (diffDays <= 1) { current++; lastDate = date; } else break;
    }
    return current;
  }, [completed]);

  const badges = useMemo(() => {
    const earned = [];
    if (stats.totalSessions >= 1) earned.push({ name: '🚀 Starter', desc: 'Première séance' });
    if (stats.totalSessions >= 10) earned.push({ name: '💪 Grinder', desc: '10 séances' });
    if (stats.totalSessions >= 25) earned.push({ name: '⚡ Machine', desc: '25 séances' });
    if (stats.totalSessions >= 50) earned.push({ name: '🏆 Legend', desc: '50 séances' });
    if (streak >= 7) earned.push({ name: '🔥 Week Warrior', desc: '7 jours consécutifs' });
    if (streak >= 30) earned.push({ name: '😤 Iron', desc: '30 jours consécutifs' });
    if (stats.totalVolume >= 50000) earned.push({ name: '🌊 Volume King', desc: '50k kg levés' });
    return earned;
  }, [stats, streak]);

  if (showSessionSelector) {
    return <SessionSelector store={store} onBack={() => setShowSessionSelector(false)} />;
  }

  return (
    <div className="p-6 pb-24 bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-1">
          VDPerf
        </h1>
        <p className="text-gray-400 text-sm">Entraînement Intelligent</p>
      </div>

      {/* Streak & Sessions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-red-600/20 to-orange-600/20 border border-orange-500/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="text-xs text-gray-400 font-bold">STREAK</span>
          </div>
          <p className="text-3xl font-black text-orange-400">{streak}</p>
          <p className="text-xs text-gray-400 mt-1">jours consécutifs</p>
        </div>
        <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-gray-400 font-bold">SESSIONS</span>
          </div>
          <p className="text-3xl font-black text-blue-400">{stats.totalSessions}</p>
          <p className="text-xs text-gray-400 mt-1">complétées</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Volume</p>
          <p className="text-xl font-black text-white">{(stats.totalVolume / 1000).toFixed(1)}k</p>
          <p className="text-xs text-gray-500">kg total</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Moy/Séance</p>
          <p className="text-xl font-black text-white">{(stats.avgSessionVolume / 1000).toFixed(1)}k</p>
          <p className="text-xs text-gray-500">kg</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Séries</p>
          <p className="text-xl font-black text-white">{stats.totalSets}</p>
          <p className="text-xs text-gray-500">totales</p>
        </div>
      </div>

      {/* Performance Indicator */}
      <PerformanceIndicator sessions={sessions} />

      {/* Calendrier intégré */}
      <MiniCalendar sessions={sessions} />

      {/* Badges */}
      {badges.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-black text-gray-400 uppercase mb-3 flex items-center gap-2">
            <Award className="w-4 h-4" /> Badges
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {badges.map((badge, idx) => (
              <div key={idx} className="bg-gradient-to-br from-yellow-600/20 to-amber-600/20 border border-yellow-500/50 rounded-lg p-3">
                <p className="text-2xl mb-1">{badge.name.split(' ')[0]}</p>
                <p className="text-xs text-gray-400">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Launch */}
      <button
        onClick={() => setShowSessionSelector(true)}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-4 rounded-xl transition shadow-lg text-lg"
      >
        🚀 Lancer l'entraînement
      </button>
    </div>
  );
}
