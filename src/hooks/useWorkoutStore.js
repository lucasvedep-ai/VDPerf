import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage.js';

const STORAGE_KEY = 'vdperf_data';
const initialState = { 
  sessions: [], 
  activeSession: null,
  bonusSessionsCustom: [],
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
    
    // Crée un objet plan simple directement dans la session
    const session = {
      id: sessionId || Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      planId: planId,
      planName: finalData.name,
      planFocus: finalData.focus,
      planExercises: finalData.exercises || [],
      name: finalData.name || 'Session',
      type: finalData.type || 'standard',
      status: 'in_progress',
      startTime: Date.now(),
      endTime: null,
      exercises: (finalData.exercises || []).map(e => ({ 
        exerciseId: e.exerciseId,
        exerciseName: e.name,
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
      const existing = prev.bonusSessionsCustom.findIndex(s => s.id === bonusSession.id);
      if (existing !== -1) {
        const updated = [...prev.bonusSessionsCustom];
        updated[existing] = bonusSession;
        return { ...prev, bonusSessionsCustom: updated };
      }
      return { ...prev, bonusSessionsCustom: [...prev.bonusSessionsCustom, bonusSession] };
    });
  }, [setData]);

  const getCustomBonusSessions = useCallback(() => {
    return data.bonusSessionsCustom;
  }, [data.bonusSessionsCustom]);

  const updateObjectives = useCallback((objectives) => {
    setData(prev => ({ ...prev, objectives: { ...prev.objectives, ...objectives } }));
  }, [setData]);

  return {
    sessions: data.sessions,
    activeSession: data.activeSession,
    bonusSessionsCustom: data.bonusSessionsCustom,
    objectives: data.objectives,
    startSession,
    logSet,
    removeSet,
    completeSession,
    cancelSession,
    getExerciseHistory,
    saveCustomBonusSession,
    getCustomBonusSessions,
    updateObjectives,
  };
}