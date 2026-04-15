// ─────────────────────────────────────────────────────────────────────────────
// dataManager.js — Migration, validation, export, import
// ─────────────────────────────────────────────────────────────────────────────

const CURRENT_VERSION = '2.0';
const BACKUP_KEY = 'vdperf_auto_backup';

// Detect paramType from exerciseId
function detectParamType(exerciseId = '') {
  const cardioIds = [
    'lib-treadmill', 'lib-rowing-machine', 'lib-stationary-bike',
    'lib-elliptical', 'lib-jump-rope',
  ];
  const timeIds = ['lib-plank'];
  const repsIds = [
    'lib-pull-ups', 'lib-push-ups', 'lib-dips', 'lib-superman',
    'lib-chin-ups', 'lib-pistol-squat', 'lib-handstand-push-ups', 'lib-muscle-up',
    'lib-ab-wheel', 'lib-hanging-leg-raises', 'lib-sit-ups', 'lib-knee-raises',
    'lib-jump-squats', 'lib-jump-lunges', 'lib-nordic-curl', 'lib-burpees',
    'pull-ups', 'dips', 'nordic-curl',
  ];
  if (cardioIds.includes(exerciseId)) return 'cardio';
  if (timeIds.includes(exerciseId)) return 'time';
  if (repsIds.includes(exerciseId)) return 'reps';
  return 'weight';
}

// ── Migration v1 → v2 ────────────────────────────────────────────────────────
export function migrateData(data) {
  if (!data || typeof data !== 'object') return data;

  let changed = false;
  const result = { ...data };

  // Ensure required arrays/objects exist
  if (!Array.isArray(result.sessions)) { result.sessions = []; changed = true; }
  if (!Array.isArray(result.customPrograms)) { result.customPrograms = []; changed = true; }
  if (!Array.isArray(result.customExercises)) { result.customExercises = []; changed = true; }
  if (!Array.isArray(result.bonusSessionsCustom)) { result.bonusSessionsCustom = []; changed = true; }
  if (!Array.isArray(result.bodyWeight)) { result.bodyWeight = []; changed = true; }

  // Migrate objectives: old format {benchMax, squatMax, ...} → new {exerciseId: weight}
  const obj = result.objectives;
  if (obj && (obj.benchMax !== undefined || obj.squatMax !== undefined)) {
    const newObj = {};
    if (obj.benchMax) newObj['bench-press'] = obj.benchMax;
    if (obj.squatMax) newObj['squat'] = obj.squatMax;
    if (obj.deadliftMax) newObj['deadlift'] = obj.deadliftMax;
    result.objectives = newObj;
    changed = true;
  } else if (!result.objectives || typeof result.objectives !== 'object') {
    result.objectives = {};
    changed = true;
  }

  // Migrate sessions: add missing startTime/endTime, paramType on exercises
  result.sessions = result.sessions.map(session => {
    if (!session || typeof session !== 'object') return session;
    let s = { ...session };

    // Add startTime/endTime if missing
    if (!s.startTime) {
      s.startTime = (s.date || new Date().toISOString().split('T')[0]) + 'T00:00:00';
      changed = true;
    }
    if (!s.endTime && s.status === 'completed') {
      s.endTime = (s.date || new Date().toISOString().split('T')[0]) + 'T01:00:00';
      changed = true;
    }

    // Add paramType to exercises if missing
    if (Array.isArray(s.exercises)) {
      s.exercises = s.exercises.map(ex => {
        if (!ex || ex.paramType) return ex;
        return { ...ex, paramType: detectParamType(ex.exerciseId) };
      });
    }
    return s;
  });

  if (changed) {
    console.log('✅ Migration des données complétée');
  }
  return result;
}

// ── Validation ────────────────────────────────────────────────────────────────
export function validateData(data) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    errors.push('Structure de données invalide');
    return { valid: false, errors };
  }
  if (!Array.isArray(data.sessions)) errors.push('sessions manquant');
  if (typeof data.objectives !== 'object') errors.push('objectives invalide');

  // Check for corrupted sessions
  if (Array.isArray(data.sessions)) {
    data.sessions.forEach((s, i) => {
      if (!s || typeof s !== 'object') errors.push(`Session ${i} corrompue`);
    });
  }
  return { valid: errors.length === 0, errors };
}

// ── Export ────────────────────────────────────────────────────────────────────
export function exportData(data) {
  const exportObj = {
    version: CURRENT_VERSION,
    exportDate: new Date().toISOString(),
    appVersion: '2.0.0',
    data: {
      sessions: data.sessions || [],
      customPrograms: data.customPrograms || [],
      customExercises: data.customExercises || [],
      objectives: data.objectives || {},
      bodyWeight: data.bodyWeight || [],
    },
  };
  const json = JSON.stringify(exportObj, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `VDPerf_export_${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Import (merge, no deletion) ───────────────────────────────────────────────
export function importData(jsonString, currentData) {
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    return { success: false, error: 'Fichier JSON invalide' };
  }

  // Support both wrapped format {version, data: {...}} and flat format
  const incoming = parsed.data || parsed;

  if (!incoming || typeof incoming !== 'object') {
    return { success: false, error: 'Format de données invalide' };
  }

  // Merge sessions (deduplicate by id)
  const existingIds = new Set((currentData.sessions || []).map(s => s.id));
  const newSessions = (incoming.sessions || []).filter(s => s?.id && !existingIds.has(s.id));

  // Merge custom programs (deduplicate by id)
  const existingProgramIds = new Set((currentData.customPrograms || []).map(p => p.id));
  const newPrograms = (incoming.customPrograms || []).filter(p => p?.id && !existingProgramIds.has(p.id));

  // Merge custom exercises
  const existingExIds = new Set((currentData.customExercises || []).map(e => e.id));
  const newExercises = (incoming.customExercises || []).filter(e => e?.id && !existingExIds.has(e.id));

  // Merge objectives (incoming overrides if present)
  const mergedObjectives = { ...(currentData.objectives || {}), ...(incoming.objectives || {}) };

  // Merge bodyWeight (deduplicate by date)
  const existingDates = new Set((currentData.bodyWeight || []).map(b => b.date));
  const newBodyWeight = (incoming.bodyWeight || []).filter(b => b?.date && !existingDates.has(b.date));

  const merged = {
    ...currentData,
    sessions: [...(currentData.sessions || []), ...newSessions],
    customPrograms: [...(currentData.customPrograms || []), ...newPrograms],
    customExercises: [...(currentData.customExercises || []), ...newExercises],
    objectives: mergedObjectives,
    bodyWeight: [...(currentData.bodyWeight || []), ...newBodyWeight].sort((a, b) => new Date(b.date) - new Date(a.date)),
  };

  // Run migration on imported data
  const migrated = migrateData(merged);

  return {
    success: true,
    data: migrated,
    stats: {
      sessions: newSessions.length,
      programs: newPrograms.length,
      exercises: newExercises.length,
    },
  };
}

// ── Auto-backup to localStorage ───────────────────────────────────────────────
export function saveAutoBackup(data) {
  try {
    const backup = {
      date: new Date().toISOString(),
      sessionCount: (data.sessions || []).length,
      data,
    };
    // Keep last 3 backups
    const existing = JSON.parse(localStorage.getItem(BACKUP_KEY) || '[]');
    const updated = [backup, ...existing].slice(0, 3);
    localStorage.setItem(BACKUP_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Auto-backup failed:', e);
  }
}

export function loadAutoBackups() {
  try {
    return JSON.parse(localStorage.getItem(BACKUP_KEY) || '[]');
  } catch {
    return [];
  }
}

export function restoreFromBackup(backup) {
  return backup?.data || null;
}
