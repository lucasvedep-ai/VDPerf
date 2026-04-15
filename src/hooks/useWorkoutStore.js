import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage.js';
import { migrateData, saveAutoBackup } from '../utils/dataManager.js';

const STORAGE_KEY = 'vdperf_data';

const initialState = {
  sessions: [],
  activeSession: null,
  bonusSessionsCustom: [],
  customPrograms: [],
  customExercises: [],
  bodyWeight: [],
  objectives: {},
};

// Transform applied once when reading from localStorage (migration)
function transformOnLoad(parsed) {
  if (!parsed) return initialState;
  return migrateData({ ...initialState, ...parsed });
}

export function useWorkoutStore() {
  const [data, setData] = useLocalStorage(STORAGE_KEY, initialState, transformOnLoad);

  const startSession = useCallback((sessionId, sessionData) => {
    console.log('🚀 Starting session:', { sessionId, sessionData });
    const finalData = sessionData || {};
    const planId = finalData.id || finalData.planId || sessionId;
    const session = {
      id: sessionId || Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      startTime: new Date().toISOString(),
      endTime: null,
      planId,
      planName: finalData.name,
      planFocus: finalData.focus || finalData.type || '',
      planExercises: finalData.exercises || [],
      name: finalData.name || 'Session',
      type: finalData.type || 'standard',
      status: 'in_progress',
      exercises: (finalData.exercises || []).map(e => ({
        exerciseId: e.exerciseId,
        exerciseName: e.name || e.exerciseName || '',
        paramType: e.paramType || 'weight',
        cardioType: e.cardioType || null,
        plannedSets: e.sets,
        plannedReps: e.reps,
        plannedRPE: e.rpe,
        plannedRest: e.rest,
        sets: [],
      })),
    };
    console.log('✅ Session created:', session);
    setData(prev => ({ ...prev, activeSession: session }));
  }, [setData]);

  const startCustomProgram = useCallback((program) => {
    const sessionData = {
      id: program.id,
      name: program.name,
      type: 'custom',
      focus: 'Personnalisé',
      exercises: program.exercises.map(ex => ({
        exerciseId: ex.exerciseId,
        name: ex.exerciseName,
        paramType: ex.paramType || 'weight',
        cardioType: ex.cardioType || null,
        sets: ex.sets.length,
        reps: ex.sets[0]?.reps || 10,
        rpe: null,
        rest: ex.sets[0]?.restTime || 60,
      })),
    };
    startSession(`${program.id}-${Date.now()}`, sessionData);
  }, [startSession]);

  const logSet = useCallback((exerciseId, set) => {
    setData(prev => {
      if (!prev.activeSession) return prev;
      const exercises = prev.activeSession.exercises.map(e => {
        if (e.exerciseId !== exerciseId) return e;
        return { ...e, sets: [...e.sets, { ...set, setNumber: e.sets.length + 1 }] };
      });
      return { ...prev, activeSession: { ...prev.activeSession, exercises } };
    });
  }, [setData]);

  const removeSet = useCallback((exerciseId, setIndex) => {
    setData(prev => {
      if (!prev.activeSession) return prev;
      const exercises = prev.activeSession.exercises.map(e => {
        if (e.exerciseId !== exerciseId) return e;
        const sets = e.sets
          .filter((_, i) => i !== setIndex)
          .map((s, i) => ({ ...s, setNumber: i + 1 }));
        return { ...e, sets };
      });
      return { ...prev, activeSession: { ...prev.activeSession, exercises } };
    });
  }, [setData]);

  const completeSession = useCallback(() => {
    setData(prev => {
      if (!prev.activeSession) return prev;
      const completed = {
        ...prev.activeSession,
        status: 'completed',
        endTime: new Date().toISOString(),
      };
      const newData = {
        ...prev,
        sessions: [...(prev.sessions || []), completed],
        activeSession: null,
      };
      setTimeout(() => saveAutoBackup(newData), 200);
      return newData;
    });
  }, [setData]);

  const cancelSession = useCallback(() => {
    setData(prev => ({ ...prev, activeSession: null }));
  }, [setData]);

  const getExerciseHistory = useCallback((exerciseId) => {
    return (data.sessions || [])
      .filter(s => s?.status === 'completed')
      .flatMap(s => {
        const ex = s?.exercises?.find(e => e.exerciseId === exerciseId);
        if (!ex || !ex.sets?.length) return [];
        return [{ date: s.date, sets: ex.sets }];
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [data.sessions]);

  const saveCustomBonusSession = useCallback((bonusSession) => {
    setData(prev => {
      const list = prev.bonusSessionsCustom || [];
      const idx = list.findIndex(s => s.id === bonusSession.id);
      if (idx !== -1) {
        const updated = [...list];
        updated[idx] = bonusSession;
        return { ...prev, bonusSessionsCustom: updated };
      }
      return { ...prev, bonusSessionsCustom: [...list, bonusSession] };
    });
  }, [setData]);

  const getCustomBonusSessions = useCallback(() => data.bonusSessionsCustom || [], [data.bonusSessionsCustom]);

  // ── Custom Programs ───────────────────────────────────────────────────────
  const saveCustomProgram = useCallback((program) => {
    setData(prev => {
      const programs = prev.customPrograms || [];
      const idx = programs.findIndex(p => p.id === program.id);
      if (idx !== -1) {
        const updated = [...programs];
        updated[idx] = program;
        return { ...prev, customPrograms: updated };
      }
      return { ...prev, customPrograms: [...programs, program] };
    });
  }, [setData]);

  const deleteCustomProgram = useCallback((programId) => {
    setData(prev => ({
      ...prev,
      customPrograms: (prev.customPrograms || []).filter(p => p.id !== programId),
    }));
  }, [setData]);

  // ── Custom Exercises ──────────────────────────────────────────────────────
  const saveCustomExercise = useCallback((exercise) => {
    setData(prev => {
      const exs = prev.customExercises || [];
      const idx = exs.findIndex(e => e.id === exercise.id);
      if (idx !== -1) {
        const updated = [...exs];
        updated[idx] = exercise;
        return { ...prev, customExercises: updated };
      }
      return { ...prev, customExercises: [...exs, exercise] };
    });
  }, [setData]);

  // ── Objectives { [exerciseId]: targetWeight } ─────────────────────────────
  const updateObjective = useCallback((exerciseId, weight) => {
    setData(prev => ({
      ...prev,
      objectives: { ...(prev.objectives || {}), [exerciseId]: weight },
    }));
  }, [setData]);

  const deleteObjective = useCallback((exerciseId) => {
    setData(prev => {
      const { [exerciseId]: _removed, ...rest } = prev.objectives || {};
      return { ...prev, objectives: rest };
    });
  }, [setData]);

  // ── Body Weight ───────────────────────────────────────────────────────────
  const logBodyWeight = useCallback((entry) => {
    setData(prev => {
      const bw = prev.bodyWeight || [];
      const idx = bw.findIndex(b => b.date === entry.date);
      let updated;
      if (idx !== -1) {
        updated = [...bw];
        updated[idx] = entry;
      } else {
        updated = [entry, ...bw];
      }
      return {
        ...prev,
        bodyWeight: updated.sort((a, b) => new Date(b.date) - new Date(a.date)),
      };
    });
  }, [setData]);

  // ── Import ────────────────────────────────────────────────────────────────
  const importStoreData = useCallback((mergedData) => {
    setData(mergedData);
  }, [setData]);

  return {
    sessions: data.sessions || [],
    activeSession: data.activeSession,
    bonusSessionsCustom: data.bonusSessionsCustom || [],
    customPrograms: data.customPrograms || [],
    customExercises: data.customExercises || [],
    bodyWeight: data.bodyWeight || [],
    objectives: data.objectives || {},
    startSession,
    startCustomProgram,
    logSet,
    removeSet,
    completeSession,
    cancelSession,
    getExerciseHistory,
    saveCustomBonusSession,
    getCustomBonusSessions,
    saveCustomProgram,
    deleteCustomProgram,
    saveCustomExercise,
    updateObjective,
    deleteObjective,
    logBodyWeight,
    importStoreData,
  };
}
