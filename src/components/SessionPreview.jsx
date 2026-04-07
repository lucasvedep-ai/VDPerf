import { useState } from 'react';
import { ChevronLeft, Edit2, Trash2, Plus } from 'lucide-react';
import { exerciseMap } from '../data/exercises.js';
import { exercises } from '../data/exercises.js';

export default function SessionPreview({ session, onStart, onBack, store }) {
  const [isEditing, setIsEditing] = useState(false);
  const [exercises, setExercises] = useState(session.exercises || []);

  const handleStartSession = () => {
    console.log('🚀 Starting session with:', { ...session, exercises });
    try {
      onStart({ ...session, exercises });
    } catch (error) {
      console.error('❌ Error starting session:', error);
      alert('Erreur au lancement de la séance. Vérifiez la console.');
    }
  };

  const handleRemoveExercise = (idx) => {
    setExercises(exercises.filter((_, i) => i !== idx));
  };

  const handleAddExercise = (exerciseId) => {
    const newExercise = {
      exerciseId,
      sets: 3,
      reps: '8-10',
      rpe: '7',
      rest: 90
    };
    setExercises([...exercises, newExercise]);
  };

  const handleGoBack = () => {
    console.log('Going back...');
    if (onBack) {
      onBack();
    }
  };

  return (
    <div className="p-6 pb-20">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleGoBack}
          className="flex items-center text-blue-400 hover:text-blue-300 font-bold"
        >
          <ChevronLeft className="w-5 h-5" />
          Retour
        </button>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 text-amber-400 hover:text-amber-300 font-bold"
        >
          <Edit2 className="w-4 h-4" />
          {isEditing ? 'Terminé' : 'Modifier'}
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-2 text-white">{session.name}</h2>
      <p className="text-gray-400 mb-6">{session.description || ''}</p>

      {/* Exercise List */}
      <div className="space-y-3 mb-8">
        {exercises.map((ex, idx) => {
          const exercise = exerciseMap[ex.exerciseId];
          return (
            <div key={idx} className="bg-gray-900 border-l-4 border-blue-600 p-4 rounded flex justify-between items-start">
              <div className="flex-1">
                <div className="font-bold text-white">{exercise?.name || 'Unknown'}</div>
                <div className="text-sm text-gray-400 mt-1">
                  {ex.sets}x{ex.reps} @ RPE {ex.rpe} (Repos: {ex.rest}s)
                </div>
              </div>
              {isEditing && (
                <button
                  onClick={() => handleRemoveExercise(idx)}
                  className="text-red-400 hover:text-red-300 ml-3"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Exercise Button (edit mode) */}
      {isEditing && (
        <div className="mb-8 p-4 bg-gray-900 rounded-lg border border-gray-800">
          <h3 className="font-bold mb-3 text-white">Ajouter exercice</h3>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {exercises.map((e) => (
              <button
                key={e.exerciseId}
                onClick={() => handleAddExercise(e.exerciseId)}
                className="bg-gray-800 hover:bg-gray-700 p-2 rounded text-sm text-left transition"
              >
                {exerciseMap[e.exerciseId]?.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleGoBack}
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition"
        >
          ← Retour
        </button>
        <button
          onClick={handleStartSession}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-3 rounded-lg hover:from-blue-700 hover:to-blue-600 transition"
        >
          🚀 Lancer la séance
        </button>
      </div>
    </div>
  );
}