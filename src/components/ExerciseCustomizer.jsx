import { useState } from 'react';
import { ChevronLeft, Save } from 'lucide-react';
import { muscleGroups } from '../data/exerciseLibrary.js';

export default function ExerciseCustomizer({ onSave, onBack }) {
  const [form, setForm] = useState({
    name: '',
    muscleGroup: muscleGroups[0],
    difficulty: 'Moyen',
    equipment: '',
  });
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      setError('Le nom est obligatoire.');
      return;
    }
    const newExercise = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: form.name.trim(),
      muscleGroup: form.muscleGroup,
      difficulty: form.difficulty,
      equipment: form.equipment.trim() || 'Non spécifié',
      isCustom: true,
    };
    onSave(newExercise);
  };

  return (
    <div className="p-6 pb-24 bg-gray-950 min-h-screen">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-bold mb-6"
      >
        <ChevronLeft className="w-5 h-5" /> Retour
      </button>

      <h1 className="text-2xl font-black text-white mb-2">Créer un exercice perso</h1>
      <p className="text-gray-400 text-sm mb-8">Cet exercice sera disponible dans tes programmes.</p>

      <div className="space-y-5">
        {/* Nom */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Nom de l'exercice</label>
          <input
            type="text"
            value={form.name}
            onChange={e => handleChange('name', e.target.value)}
            placeholder="Ex: Tirage nuque barre"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
          />
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>

        {/* Groupe musculaire */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Groupe musculaire</label>
          <select
            value={form.muscleGroup}
            onChange={e => handleChange('muscleGroup', e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
          >
            {muscleGroups.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Difficulté */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Difficulté</label>
          <div className="flex gap-3">
            {['Facile', 'Moyen', 'Difficile'].map(d => (
              <button
                key={d}
                onClick={() => handleChange('difficulty', d)}
                className={`flex-1 py-2 rounded-lg font-bold text-sm transition ${
                  form.difficulty === d
                    ? d === 'Facile' ? 'bg-green-600 text-white'
                      : d === 'Moyen' ? 'bg-yellow-600 text-white'
                      : 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Équipement */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Équipement</label>
          <input
            type="text"
            value={form.equipment}
            onChange={e => handleChange('equipment', e.target.value)}
            placeholder="Ex: Haltères, Machine, Barre..."
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition mt-4"
        >
          <Save className="w-5 h-5" /> Sauvegarder l'exercice
        </button>
      </div>
    </div>
  );
}
