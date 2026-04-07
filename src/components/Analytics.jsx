import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { exercises } from '../data/exercises.js';
import { estimate1RM, predictNextMax, getWeekNumber } from '../utils/calculations.js';
import ExportData from './ExportData.jsx';

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#111827', border: 'none', borderRadius: '12px', fontSize: 12 },
  labelStyle: { color: '#e2e8f0' },
};

export default function Analytics({ store }) {
  const [selectedExercise, setSelectedExercise] = useState(exercises[0]?.id || 'bench-press');
  const [activeTab, setActiveTab] = useState('global');

  const { sessions = [] } = store || {};
  const completed = sessions.filter(s => s?.status === 'completed') || [];

  // Global indicators - FIXED
  const globalStats = useMemo(() => {
    try {
      const allSets = completed.flatMap(s => 
        s?.exercises?.flatMap(e => e?.sets || []) || []
      );
      
      const totalVolume = allSets.reduce((sum, s) => sum + ((s?.weight || 0) * (s?.reps || 0)), 0);
      const totalSessions = completed.length || 0;
      const avgSessionVolume = totalSessions > 0 ? totalVolume / totalSessions : 0;
      const totalSets = allSets.length || 0;

      return { totalVolume, totalSessions, avgSessionVolume, totalSets };
    } catch (e) {
      console.error('Error calculating global stats:', e);
      return { totalVolume: 0, totalSessions: 0, avgSessionVolume: 0, totalSets: 0 };
    }
  }, [completed]);

  // Exercise-specific data - FIXED
  const exerciseData = useMemo(() => {
    try {
      if (!selectedExercise) return null;

      const sets = completed
        .flatMap(s => {
          const sessionDate = s?.date || new Date().toISOString();
          return (s?.exercises || [])
            .filter(e => e?.exerciseId === selectedExercise)
            .flatMap(e => 
              (e?.sets || []).map(set => ({
                weight: set?.weight || 0,
                reps: set?.reps || 0,
                week: getWeekNumber(new Date(sessionDate)),
                date: new Date(sessionDate).toLocaleDateString('fr-FR'),
              }))
            );
        });

      if (sets.length === 0) return null;

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
            count: weekSets.length 
          };
        });
    } catch (e) {
      console.error('Error calculating exercise data:', e);
      return null;
    }
  }, [completed, selectedExercise]);

  const exercise = exercises.find(e => e?.id === selectedExercise);
  const currentExerciseSets = completed
    .flatMap(s => s?.exercises?.filter(e => e?.exerciseId === selectedExercise) || [])
    .flatMap(e => e?.sets || [])
    .sort((a, b) => (b?.weight || 0) - (a?.weight || 0));

  const currentExercise = currentExerciseSets?.[0];
  const prediction = currentExercise ? predictNextMax(completed, selectedExercise) : null;

  return (
    <div className="p-6 pb-20">
      <h1 className="text-3xl font-bold mb-6">📊 Analytics</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('global')}
          className={`px-4 py-2 rounded font-bold transition ${activeTab === 'global' ? 'bg-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}
        >
          Global
        </button>
        <button
          onClick={() => setActiveTab('exercise')}
          className={`px-4 py-2 rounded font-bold transition ${activeTab === 'exercise' ? 'bg-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}
        >
          Par exercice
        </button>
      </div>

      {/* Global Stats */}
      {activeTab === 'global' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <p className="text-gray-400 text-xs font-bold">Total séances</p>
              <p className="text-3xl font-bold text-blue-400 mt-2">{globalStats.totalSessions}</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <p className="text-gray-400 text-xs font-bold">Volume total</p>
              <p className="text-3xl font-bold text-blue-400 mt-2">{(globalStats.totalVolume / 1000).toFixed(1)}k</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <p className="text-gray-400 text-xs font-bold">Moy / séance</p>
              <p className="text-3xl font-bold text-blue-400 mt-2">{(globalStats.avgSessionVolume / 1000).toFixed(1)}k</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <p className="text-gray-400 text-xs font-bold">Total séries</p>
              <p className="text-3xl font-bold text-blue-400 mt-2">{globalStats.totalSets}</p>
            </div>
          </div>

          <ExportData store={store} />
        </div>
      )}

      {/* Exercise Stats */}
      {activeTab === 'exercise' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-bold text-gray-400 mb-3">Sélectionne un exercice</h3>
            <div className="grid grid-cols-2 gap-2">
              {exercises.map(ex => (
                <button
                  key={ex.id}
                  onClick={() => setSelectedExercise(ex.id)}
                  className={`p-2 rounded text-sm font-bold transition ${
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
                  <p className="text-purple-200 text-sm font-bold">🔮 Prédiction</p>
                  <p className="text-white mt-2">
                    Dans {prediction.weeks} semaines, tu pourras faire <span className="font-bold text-2xl text-purple-300">{prediction.predictedMax} kg</span>!
                  </p>
                </div>
              )}

              <ResponsiveContainer width="100%" height={300}>
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

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={exerciseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="week" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Bar dataKey="volume" fill="#10b981" isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div className="text-center py-8 text-gray-400">
              Aucune donnée pour {exercise?.name || 'cet exercice'}
            </div>
          )}

          <ExportData store={store} />
        </div>
      )}
    </div>
  );
}