import { useState } from 'react';
import { ChevronLeft, Trash2, Plus } from 'lucide-react';
import { exerciseMap } from '../data/exercises.js';
import { exercises } from '../data/exercises.js';

export default function SessionEditor({ session, onSave, onCancel }) {
  const [sessionExercises, setSessionExercises] = useState(session.exercises || []);
  const [showAddExercise, setShowAddExercise] = useState(false);

  const handleRemoveExercise = (idx) => {
    setSessionExercises(sessionExercises.filter((_, i) => i !== idx));
  };

  const handleAddExercise = (exerciseId) => {
    const newExercise = {
      exerciseId,
      sets: 3,
      reps: '8-10',
      rpe: '7',
      rest: 90
    };
    setSessionExercises([...sessionExercises, newExercise]);
    setShowAddExercise(false);
  };

  const handleSaveSession = () => {
    onSave({ ...session, exercises: sessionExercises });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onCancel} className="flex items-center text-blue-400">
          <ChevronLeft className="w-5 h-5" />
          Annuler
        </button>
        <h2 className="text-xl font-bold">Modifier séance</h2>
        <button
          onClick={handleSaveSession}
          className="text-green-400 hover:text-green-300 font-bold"
        >
          Sauver
        </button>
      </div>

      <div className="space-y-3 mb-6">
        {sessionExercises.map((ex, idx) => {
          const exercise = exerciseMap[ex.exerciseId];
          return (
            <div key={idx} className="bg-gray-900 border-l-4 border-amber-600 p-3 rounded flex justify-between items-start">
              <div className="flex-1">
                <div className="font-bold">{exercise?.name}</div>
                <div className="text-xs text-gray-400">
                  {ex.sets}x{ex.reps} @ RPE {ex.rpe}
                </div>
              </div>
              <button
                onClick={() => handleRemoveExercise(idx)}
                className="text-red-400 hover:text-red-300 ml-3"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {showAddExercise && (
        <div className="bg-gray-900 rounded-lg p-4 mb-6 max-h-48 overflow-y-auto">
          <h3 className="font-bold mb-3">Ajouter un exercice</h3>
          <div className="grid grid-cols-2 gap-2">
            {exercises.map((ex) => (
              <button
                key={ex.id}
                onClick={() => handleAddExercise(ex.id)}
                className="bg-gray-800 hover:bg-gray-700 p-2 rounded text-sm text-left"
              >
                {ex.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {!showAddExercise && (
        <button
          onClick={() => setShowAddExercise(true)}
          className="w-full bg-gray-900 border border-gray-700 hover:border-blue-600 text-blue-400 py-3 rounded flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Ajouter exercice
        </button>
      )}
    </div>
  );
}