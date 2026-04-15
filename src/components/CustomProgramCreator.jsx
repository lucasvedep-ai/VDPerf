import { useState } from 'react';
import { ChevronLeft, Search, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { muscleGroups, getExercisesByMuscleGroup } from '../data/exerciseLibrary.js';

// ─── Quick Fill Popup ────────────────────────────────────────────────────────
function QuickFillPopup({ exercise, onConfirm, onCancel }) {
  const isCardio = exercise.paramType === 'cardio';
  const [cardioType, setCardioType] = useState('duration'); // duration | distance | reps
  const [values, setValues] = useState({ numSets: isCardio ? 1 : 4, reps: 10, weight: 50, restTime: 60, value: 30 });

  const handleChange = (field, val) => {
    const num = field === 'value' ? parseFloat(val) : parseInt(val, 10);
    if (!isNaN(num) && num > 0) setValues(prev => ({ ...prev, [field]: num }));
  };

  const handleConfirm = () => {
    if (isCardio) {
      const sets = Array.from({ length: values.numSets }, (_, i) => ({
        setNumber: i + 1,
        cardioType,
        value: values.value,
        restTime: values.restTime,
      }));
      onConfirm(sets, 'cardio', cardioType);
    } else {
      const sets = Array.from({ length: values.numSets }, (_, i) => ({
        setNumber: i + 1,
        reps: values.reps,
        weight: values.weight,
        restTime: values.restTime,
      }));
      onConfirm(sets, exercise.paramType || 'weight', null);
    }
  };

  const cardioValueConfig = {
    duration: { label: 'Durée', suffix: 'min', step: 5, default: 30 },
    distance: { label: 'Distance', suffix: 'km', step: 1, default: 5 },
    reps: { label: 'Répétitions', suffix: 'reps', step: 10, default: 50 },
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm p-6 space-y-5">
        <h3 className="text-lg font-black text-white">{exercise.name}</h3>
        <p className="text-xs text-gray-400 -mt-3">Remplissage rapide des séries</p>

        {/* Cardio type selector */}
        {isCardio && (
          <div>
            <p className="text-sm text-gray-300 mb-2">Type de cardio</p>
            <div className="flex gap-2">
              {['duration', 'distance', 'reps'].map(t => (
                <button
                  key={t}
                  onClick={() => setCardioType(t)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                    cardioType === t ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {t === 'duration' ? 'Durée' : t === 'distance' ? 'Distance' : 'Reps'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Common fields */}
        {[
          { label: 'Nombre de séries', field: 'numSets', suffix: 'séries', step: 1 },
          ...(isCardio
            ? [{ label: cardioValueConfig[cardioType].label, field: 'value', suffix: cardioValueConfig[cardioType].suffix, step: cardioValueConfig[cardioType].step }]
            : [
                { label: 'Reps par défaut', field: 'reps', suffix: 'reps', step: 1 },
                { label: 'Poids par défaut', field: 'weight', suffix: 'kg', step: 5 },
              ]
          ),
          { label: 'Repos par défaut', field: 'restTime', suffix: 'sec', step: 15 },
        ].map(({ label, field, suffix, step }) => (
          <div key={field} className="flex items-center justify-between">
            <span className="text-sm text-gray-300">{label}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleChange(field, values[field] - step)}
                className="w-8 h-8 bg-gray-800 rounded-lg font-bold text-gray-300 hover:bg-gray-700 flex items-center justify-center"
              >−</button>
              <span className="text-white font-bold w-12 text-center">{values[field]}</span>
              <button
                onClick={() => handleChange(field, values[field] + step)}
                className="w-8 h-8 bg-gray-800 rounded-lg font-bold text-gray-300 hover:bg-gray-700 flex items-center justify-center"
              >+</button>
              <span className="text-xs text-gray-500 w-10">{suffix}</span>
            </div>
          </div>
        ))}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition"
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Set Editor Row ──────────────────────────────────────────────────────────
function SetRow({ set, isEditing, onToggleEdit, onChange, onDelete, paramType }) {
  const isCardio = paramType === 'cardio';
  const cardioSuffix = set.cardioType === 'duration' ? 'min' : set.cardioType === 'distance' ? 'km' : 'reps';

  const setLabel = isCardio
    ? `${set.value} ${cardioSuffix} · ${set.restTime}s`
    : paramType === 'reps'
    ? `${set.reps} reps · ${set.restTime}s`
    : `${set.reps} reps · ${set.weight}kg · ${set.restTime}s`;

  return (
    <div className="flex items-center gap-2 bg-gray-800/60 rounded-lg px-3 py-2">
      <span className="text-xs text-gray-500 w-5">#{set.setNumber}</span>
      {isEditing ? (
        <>
          {isCardio ? (
            <>
              <input
                type="number"
                value={set.value}
                onChange={e => onChange('value', parseFloat(e.target.value) || 1)}
                className="w-16 bg-gray-700 rounded px-2 py-1 text-center text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-500">{cardioSuffix}</span>
            </>
          ) : (
            <>
              <input
                type="number"
                value={set.reps}
                onChange={e => onChange('reps', parseInt(e.target.value) || 1)}
                className="w-14 bg-gray-700 rounded px-2 py-1 text-center text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-500">reps</span>
              {paramType !== 'reps' && (
                <>
                  <input
                    type="number"
                    value={set.weight}
                    onChange={e => onChange('weight', parseFloat(e.target.value) || 0)}
                    className="w-16 bg-gray-700 rounded px-2 py-1 text-center text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-500">kg</span>
                </>
              )}
            </>
          )}
          <input
            type="number"
            value={set.restTime}
            onChange={e => onChange('restTime', parseInt(e.target.value) || 30)}
            className="w-14 bg-gray-700 rounded px-2 py-1 text-center text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-xs text-gray-500">s</span>
          <button onClick={onToggleEdit} className="text-green-400 hover:text-green-300 ml-auto">
            <Check className="w-4 h-4" />
          </button>
        </>
      ) : (
        <>
          <span className="text-sm text-white flex-1">{setLabel}</span>
          <button onClick={onToggleEdit} className="text-gray-400 hover:text-blue-400">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="text-gray-500 hover:text-red-400">
            <X className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function CustomProgramCreator({ customExercises = [], onSave, onBack }) {
  const [step, setStep] = useState('name'); // 'name' | 'build'
  const [programName, setProgramName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(muscleGroups[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [programExercises, setProgramExercises] = useState([]);
  const [quickFillEx, setQuickFillEx] = useState(null);
  const [editingSet, setEditingSet] = useState(null); // { exIdx, setIdx }
  const [nameError, setNameError] = useState('');

  const filteredExercises = getExercisesByMuscleGroup(selectedGroup, customExercises).filter(ex =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const alreadyAdded = new Set(programExercises.map(e => e.exerciseId));

  const handleQuickFillConfirm = (sets, paramType, cardioType) => {
    setProgramExercises(prev => [...prev, {
      exerciseId: quickFillEx.id,
      exerciseName: quickFillEx.name,
      muscleGroup: quickFillEx.muscleGroup,
      paramType: paramType || quickFillEx.paramType || 'weight',
      cardioType: cardioType || null,
      sets,
    }]);
    setQuickFillEx(null);
  };

  const handleDeleteExercise = (exIdx) => {
    setProgramExercises(prev => prev.filter((_, i) => i !== exIdx));
  };

  const handleAddSet = (exIdx) => {
    setProgramExercises(prev => prev.map((ex, i) => {
      if (i !== exIdx) return ex;
      const last = ex.sets[ex.sets.length - 1] || { reps: 10, weight: 50, restTime: 60 };
      return {
        ...ex,
        sets: [...ex.sets, { setNumber: ex.sets.length + 1, reps: last.reps, weight: last.weight, restTime: last.restTime }],
      };
    }));
  };

  const handleSetChange = (exIdx, setIdx, field, value) => {
    setProgramExercises(prev => prev.map((ex, i) => {
      if (i !== exIdx) return ex;
      const sets = ex.sets.map((s, si) => si === setIdx ? { ...s, [field]: value } : s);
      return { ...ex, sets };
    }));
  };

  const handleDeleteSet = (exIdx, setIdx) => {
    setProgramExercises(prev => prev.map((ex, i) => {
      if (i !== exIdx) return ex;
      const sets = ex.sets
        .filter((_, si) => si !== setIdx)
        .map((s, si) => ({ ...s, setNumber: si + 1 }));
      return { ...ex, sets };
    }));
  };

  const handleSave = () => {
    if (!programName.trim()) { setNameError('Le nom est obligatoire.'); return; }
    if (programExercises.length === 0) return;
    const program = {
      id: `prog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: programName.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      exercises: programExercises,
    };
    onSave(program);
  };

  // ── Step: Name ─────────────────────────────────────────────────────────────
  if (step === 'name') {
    return (
      <div className="p-6 pb-24 bg-gray-950 min-h-screen">
        <button onClick={onBack} className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-bold mb-6">
          <ChevronLeft className="w-5 h-5" /> Retour
        </button>
        <h1 className="text-2xl font-black text-white mb-2">Nouveau programme</h1>
        <p className="text-gray-400 text-sm mb-8">Donne un nom à ton programme.</p>

        <div className="space-y-4">
          <input
            type="text"
            value={programName}
            onChange={e => { setProgramName(e.target.value); setNameError(''); }}
            placeholder="Ex: Ma séance pecs du tonnerre"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-lg"
            autoFocus
          />
          {nameError && <p className="text-red-400 text-sm">{nameError}</p>}
          <button
            onClick={() => {
              if (!programName.trim()) { setNameError('Le nom est obligatoire.'); return; }
              setStep('build');
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-4 rounded-xl transition"
          >
            Continuer →
          </button>
        </div>
      </div>
    );
  }

  // ── Step: Build ────────────────────────────────────────────────────────────
  return (
    <div className="pb-24 bg-gray-950 min-h-screen">
      {quickFillEx && (
        <QuickFillPopup
          exercise={quickFillEx}
          onConfirm={handleQuickFillConfirm}
          onCancel={() => setQuickFillEx(null)}
        />
      )}

      {/* Header */}
      <div className="sticky top-0 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-6 py-4 z-10">
        <div className="flex items-center justify-between">
          <button onClick={() => setStep('name')} className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-bold">
            <ChevronLeft className="w-5 h-5" /> Retour
          </button>
          <h1 className="font-black text-white text-lg truncate max-w-[180px]">{programName}</h1>
          <button
            onClick={handleSave}
            disabled={programExercises.length === 0}
            className="bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition"
          >
            Sauvegarder
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Programme actuel */}
        {programExercises.length > 0 && (
          <div>
            <h2 className="text-xs font-black text-gray-400 uppercase mb-3">Programme ({programExercises.length} exercice{programExercises.length > 1 ? 's' : ''})</h2>
            <div className="space-y-4">
              {programExercises.map((ex, exIdx) => (
                <div key={exIdx} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-white text-sm">{ex.exerciseName}</p>
                      <p className="text-xs text-gray-500">{ex.muscleGroup}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteExercise(exIdx)}
                      className="text-gray-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {ex.sets.map((set, setIdx) => (
                      <SetRow
                        key={setIdx}
                        set={set}
                        paramType={ex.paramType || 'weight'}
                        isEditing={editingSet?.exIdx === exIdx && editingSet?.setIdx === setIdx}
                        onToggleEdit={() => setEditingSet(
                          editingSet?.exIdx === exIdx && editingSet?.setIdx === setIdx
                            ? null
                            : { exIdx, setIdx }
                        )}
                        onChange={(field, value) => handleSetChange(exIdx, setIdx, field, value)}
                        onDelete={() => handleDeleteSet(exIdx, setIdx)}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => handleAddSet(exIdx)}
                    className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Ajouter une série
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sélection d'exercices */}
        <div>
          <h2 className="text-xs font-black text-gray-400 uppercase mb-3">Ajouter des exercices</h2>

          {/* Filtre groupe musculaire */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
            {muscleGroups.map(g => (
              <button
                key={g}
                onClick={() => { setSelectedGroup(g); setSearchQuery(''); }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition ${
                  selectedGroup === g ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          {/* Liste exercices */}
          <div className="space-y-2">
            {filteredExercises.map(ex => {
              const added = alreadyAdded.has(ex.id);
              return (
                <button
                  key={ex.id}
                  onClick={() => !added && setQuickFillEx(ex)}
                  className={`w-full text-left p-3 rounded-xl border transition ${
                    added
                      ? 'bg-green-900/20 border-green-700/50 cursor-default'
                      : 'bg-gray-900 border-gray-800 hover:border-blue-600 hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-white">{ex.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {ex.equipment} · <span className={
                          ex.difficulty === 'Facile' ? 'text-green-400'
                          : ex.difficulty === 'Moyen' ? 'text-yellow-400'
                          : 'text-red-400'
                        }>{ex.difficulty}</span>
                        {ex.isCustom && <span className="ml-1 text-purple-400">· Perso</span>}
                      </p>
                    </div>
                    {added ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Plus className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>
              );
            })}
            {filteredExercises.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-4">Aucun exercice trouvé</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
