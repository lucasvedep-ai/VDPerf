import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage.js';

const STORAGE_KEY = 'vdperf_data';
const initialState = {
  sessions: [],
  activeSession: null,
  bonusSessionsCustom: [],
  customPrograms: [],
  customExercises: [],
  objectives: {
    benchMax: 100,
    squatMax: 120,
    deadliftMax: 150,
    focusArea: 'strength',
    target6Weeks: {},
  },
};

export function useWorkoutStore() {
  const [data, setData] = useLocalStorage(STORAGE_KEY, initialState);

  const startSession = useCallback((sessionId, sessionData) => {
    console.log('🚀 Starting session:', { sessionId, sessionData });

    const finalData = sessionData || {};
    const planId = finalData.id || finalData.planId || sessionId;

    const session = {
      id: sessionId || Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      planId: planId,
      planName: finalData.name,
      planFocus: finalData.focus || finalData.type || '',
      planExercises: finalData.exercises || [],
      name: finalData.name || 'Session',
      type: finalData.type || 'standard',
      status: 'in_progress',
      startTime: Date.now(),
      endTime: null,
      exercises: (finalData.exercises || []).map(e => ({
        exerciseId: e.exerciseId,
        exerciseName: e.name || e.exerciseName || '',
        plannedSets: e.sets,
        plannedReps: e.reps,
        plannedRPE: e.rpe,
        plannedRest: e.rest,
        sets: []
      })),
    };

    console.log('✅ Session created:', session);
    setData(prev => ({ ...prev, activeSession: session }));
  }, [setData]);

  // Lance un programme personnalisé (converti dans le bon format)
  const startCustomProgram = useCallback((program) => {
    const sessionData = {
      id: program.id,
      name: program.name,
      type: 'custom',
      focus: 'Personnalisé',
      exercises: program.exercises.map(ex => ({
        exerciseId: ex.exerciseId,
        name: ex.exerciseName,
        sets: ex.sets.length,
        reps: ex.sets[0]?.reps || 10,
        rpe: null,
        rest: ex.sets[0]?.restTime || 60,
      })),
    };
    const sessionId = `${program.id}-${Date.now()}`;
    startSession(sessionId, sessionData);
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
        endTime: Date.now()
      };
      return {
        ...prev,
        sessions: [...prev.sessions, completed],
        activeSession: null
      };
    });
  }, [setData]);

  const cancelSession = useCallback(() => {
    setData(prev => ({ ...prev, activeSession: null }));
  }, [setData]);

  const getExerciseHistory = useCallback((exerciseId) => {
    return data.sessions
      .filter(s => s?.status === 'completed')
      .flatMap(s => {
        const ex = s?.exercises?.find(e => e.exerciseId === exerciseId);
        if (!ex || ex.sets.length === 0) return [];
        return [{ date: s.date, sets: ex.sets }];
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [data.sessions]);

  const saveCustomBonusSession = useCallback((bonusSession) => {
    setData(prev => {
      const existing = (prev.bonusSessionsCustom || []).findIndex(s => s.id === bonusSession.id);
      if (existing !== -1) {
        const updated = [...prev.bonusSessionsCustom];
        updated[existing] = bonusSession;
        return { ...prev, bonusSessionsCustom: updated };
      }
      return { ...prev, bonusSessionsCustom: [...(prev.bonusSessionsCustom || []), bonusSession] };
    });
  }, [setData]);

  const getCustomBonusSessions = useCallback(() => {
    return data.bonusSessionsCustom || [];
  }, [data.bonusSessionsCustom]);

  // ── Programmes personnalisés ──────────────────────────────────────────────

  const saveCustomProgram = useCallback((program) => {
    setData(prev => {
      const programs = prev.customPrograms || [];
      const existingIdx = programs.findIndex(p => p.id === program.id);
      if (existingIdx !== -1) {
        const updated = [...programs];
        updated[existingIdx] = program;
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

  // ── Exercices personnalisés ───────────────────────────────────────────────

  const saveCustomExercise = useCallback((exercise) => {
    setData(prev => {
      const exercises = prev.customExercises || [];
      const existingIdx = exercises.findIndex(e => e.id === exercise.id);
      if (existingIdx !== -1) {
        const updated = [...exercises];
        updated[existingIdx] = exercise;
        return { ...prev, customExercises: updated };
      }
      return { ...prev, customExercises: [...exercises, exercise] };
    });
  }, [setData]);

  const updateObjectives = useCallback((objectives) => {
    setData(prev => ({ ...prev, objectives: { ...prev.objectives, ...objectives } }));
  }, [setData]);

  return {
    sessions: data.sessions || [],
    activeSession: data.activeSession,
    bonusSessionsCustom: data.bonusSessionsCustom || [],
    customPrograms: data.customPrograms || [],
    customExercises: data.customExercises || [],
    objectives: data.objectives,
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
    updateObjectives,
  };
}
