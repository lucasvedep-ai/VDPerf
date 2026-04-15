import { useState } from 'react';
import { ArrowLeft, Eye, Trash2, Edit2, Search, X, Check, Plus } from 'lucide-react';

function formatDuration(startTime, endTime) {
  if (!startTime || !endTime) return null;
  const ms = new Date(endTime) - new Date(startTime);
  if (ms <= 0) return null;
  const mins = Math.round(ms / 60000);
  return `${mins} min`;
}

function getSessionLabel(session) {
  const d = new Date(session.date);
  return `${d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} · ${session.planName || 'Séance'}`;
}

// ── Session Detail / Edit Modal ───────────────────────────────────────────────
function SessionModal({ session, onClose, onSave, onDelete }) {
  const [editMode, setEditMode] = useState(false);
  const [editedExercises, setEditedExercises] = useState(
    (session.exercises || []).map(ex => ({
      ...ex,
      sets: (ex.sets || []).map(s => ({ ...s })),
    }))
  );

  const duration = formatDuration(session.startTime, session.endTime);

  const handleSetChange = (exIdx, setIdx, field, value) => {
    setEditedExercises(prev => prev.map((ex, i) => {
      if (i !== exIdx) return ex;
      const sets = ex.sets.map((s, si) => si === setIdx ? { ...s, [field]: value } : s);
      return { ...ex, sets };
    }));
  };

  const handleDeleteSet = (exIdx, setIdx) => {
    setEditedExercises(prev => prev.map((ex, i) => {
      if (i !== exIdx) return ex;
      return { ...ex, sets: ex.sets.filter((_, si) => si !== setIdx).map((s, si) => ({ ...s, setNumber: si + 1 })) };
    }));
  };

  const handleAddSet = (exIdx) => {
    setEditedExercises(prev => prev.map((ex, i) => {
      if (i !== exIdx) return ex;
      const last = ex.sets[ex.sets.length - 1] || { reps: 10, weight: 50 };
      return { ...ex, sets: [...ex.sets, { ...last, setNumber: ex.sets.length + 1 }] };
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-4 flex items-center justify-between">
        <div>
          <p className="font-bold text-white text-lg">{session.planName || 'Séance'}</p>
          <p className="text-xs text-gray-400">
            {new Date(session.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
            {duration && ` · ${duration}`}
          </p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {editMode ? (
          <>
            {editedExercises.map((ex, exIdx) => (
              <div key={exIdx} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="font-bold text-white mb-3">{ex.exerciseName || ex.exerciseId}</p>
                <div className="space-y-2">
                  {(ex.sets || []).map((set, setIdx) => (
                    <div key={setIdx} className="flex items-center gap-2 bg-gray-800/60 rounded-lg px-3 py-2">
                      <span className="text-xs text-gray-500 w-5">#{setIdx + 1}</span>
                      {set.weight !== undefined && (
                        <>
                          <input
                            type="number"
                            value={set.weight}
                            onChange={e => handleSetChange(exIdx, setIdx, 'weight', parseFloat(e.target.value) || 0)}
                            className="w-16 bg-gray-700 rounded px-2 py-1 text-center text-sm text-white focus:outline-none"
                          />
                          <span className="text-xs text-gray-500">kg</span>
                        </>
                      )}
                      {set.reps !== undefined && (
                        <>
                          <input
                            type="number"
                            value={set.reps}
                            onChange={e => handleSetChange(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                            className="w-14 bg-gray-700 rounded px-2 py-1 text-center text-sm text-white focus:outline-none"
                          />
                          <span className="text-xs text-gray-500">reps</span>
                        </>
                      )}
                      {set.duration !== undefined && (
                        <>
                          <input
                            type="number"
                            value={set.duration}
                            onChange={e => handleSetChange(exIdx, setIdx, 'duration', parseInt(e.target.value) || 0)}
                            className="w-16 bg-gray-700 rounded px-2 py-1 text-center text-sm text-white focus:outline-none"
                          />
                          <span className="text-xs text-gray-500">sec</span>
                        </>
                      )}
                      {set.value !== undefined && (
                        <>
                          <input
                            type="number"
                            value={set.value}
                            onChange={e => handleSetChange(exIdx, setIdx, 'value', parseFloat(e.target.value) || 0)}
                            className="w-16 bg-gray-700 rounded px-2 py-1 text-center text-sm text-white focus:outline-none"
                          />
                          <span className="text-xs text-gray-500">
                            {set.cardioType === 'distance' ? 'km' : set.cardioType === 'duration' ? 'min' : 'reps'}
                          </span>
                        </>
                      )}
                      <button onClick={() => handleDeleteSet(exIdx, setIdx)} className="text-gray-500 hover:text-red-400 ml-auto">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleAddSet(exIdx)}
                  className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Ajouter une série
                </button>
              </div>
            ))}
          </>
        ) : (
          <>
            {(session.exercises || []).map((ex, exIdx) => (
              <div key={exIdx} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="font-bold text-white mb-2">{ex.exerciseName || ex.exerciseId}</p>
                {(ex.sets || []).length === 0 ? (
                  <p className="text-xs text-gray-500 italic">Aucune série enregistrée</p>
                ) : (
                  <div className="space-y-1">
                    {(ex.sets || []).map((set, setIdx) => {
                      let label = '';
                      if (set.weight !== undefined && set.reps !== undefined) {
                        label = `${set.weight}kg × ${set.reps}${set.rpe ? ` · RPE ${set.rpe}` : ''}`;
                      } else if (set.reps !== undefined) {
                        label = `× ${set.reps} reps`;
                      } else if (set.duration !== undefined) {
                        label = `${Math.floor(set.duration / 60)}:${String(set.duration % 60).padStart(2, '0')}`;
                      } else if (set.value !== undefined) {
                        const suf = set.cardioType === 'distance' ? 'km' : set.cardioType === 'duration' ? 'min' : 'reps';
                        label = `${set.value} ${suf}`;
                      }
                      return (
                        <div key={setIdx} className="flex items-center gap-2 text-sm text-gray-300 px-2 py-1 bg-gray-800/40 rounded-lg">
                          <span className="text-gray-600 w-5">#{setIdx + 1}</span>
                          <span>{label || '—'}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 p-4 flex gap-3">
        {editMode ? (
          <>
            <button
              onClick={() => setEditMode(false)}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition"
            >
              Annuler
            </button>
            <button
              onClick={() => { onSave({ ...session, exercises: editedExercises }); onClose(); }}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition"
            >
              <Check className="w-4 h-4" /> Enregistrer
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                if (confirm('Supprimer cette séance ? Cette action est irréversible.')) {
                  onDelete();
                  onClose();
                }
              }}
              className="bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-400 px-4 py-3 rounded-xl transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setEditMode(true)}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition"
            >
              <Edit2 className="w-4 h-4" /> Modifier
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const PAGE_SIZE = 15;

const FILTER_OPTIONS = [
  { value: 'all', label: 'Toutes' },
  { value: 'custom', label: 'Perso' },
  { value: 'standard', label: 'Standard' },
  { value: 'bonus', label: 'Bonus' },
];

export default function FullSessionHistory({ store, onBack }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [selectedSession, setSelectedSession] = useState(null);

  const allSessions = [...(store.sessions || [])]
    .filter(s => s?.status === 'completed')
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const filtered = allSessions.filter(s => {
    const matchesSearch = !search || (s.planName || '').toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'custom' && s.type === 'custom') ||
      (filter === 'standard' && s.planId && !s.type) ||
      (filter === 'bonus' && s.type === 'bonus');
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSave = (updated) => {
    store.updateSession(updated.id, updated);
    setSelectedSession(null);
  };

  return (
    <div className="bg-gray-950 min-h-screen pb-24">
      {selectedSession && (
        <SessionModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onSave={handleSave}
          onDelete={() => {
            store.deleteSession(selectedSession.id);
            setSelectedSession(null);
          }}
        />
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-950 border-b border-gray-800 px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="text-gray-400 hover:text-white p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-black text-white">Historique complet</h1>
          <span className="ml-auto text-sm text-gray-500">{allSessions.length} séances</span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Rechercher par programme..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(0); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setFilter(opt.value); setPage(0); }}
              className={`px-3 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition ${
                filter === opt.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Session list */}
      <div className="p-4 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Aucune séance trouvée</p>
            {search && <p className="text-sm mt-1">Essaie un autre terme de recherche</p>}
          </div>
        ) : (
          paginated.map((session, i) => {
            const duration = formatDuration(session.startTime, session.endTime);
            const exerciseCount = (session.exercises || []).length;
            const dateStr = new Date(session.date).toLocaleDateString('fr-FR', {
              day: '2-digit', month: 'short', year: 'numeric',
            });
            const timeStr = session.startTime
              ? new Date(session.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
              : null;

            return (
              <div key={session.id || i} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm truncate">{session.planName || 'Séance'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {dateStr}{timeStr ? ` ${timeStr}` : ''}
                    {duration && ` · ${duration}`}
                    {exerciseCount > 0 && ` · ${exerciseCount} ex.`}
                  </p>
                </div>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => setSelectedSession(session)}
                    className="text-gray-500 hover:text-blue-400 p-1.5 rounded-lg hover:bg-gray-800 transition"
                    title="Afficher / Modifier"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Supprimer cette séance ?')) store.deleteSession(session.id);
                    }}
                    className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-gray-800 transition"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 bg-gray-800 rounded-lg text-sm text-white disabled:opacity-30 hover:bg-gray-700 transition"
            >
              ← Précédent
            </button>
            <span className="text-sm text-gray-400">{page + 1} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="px-4 py-2 bg-gray-800 rounded-lg text-sm text-white disabled:opacity-30 hover:bg-gray-700 transition"
            >
              Suivant →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
