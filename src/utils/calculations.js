// Epley formula: 1RM = weight * (1 + reps / 30)
export function estimate1RM(weight, reps) {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

// Adherence over last N weeks (4 sessions/week expected)
export function calculateAdherence(sessions, weeks = 4) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - weeks * 7);
  const recent = sessions.filter(
    s => s.status === 'completed' && new Date(s.date) >= cutoff
  );
  return Math.min(100, Math.round((recent.length / (weeks * 4)) * 100));
}

// Predict max for a specific exercise
export function predictNextMax(sessions, exerciseId) {
  const completed = sessions.filter(s => s?.status === 'completed') || [];
  
  // Extract all 1RM estimates for this exercise
  const values = completed
    .flatMap(s => {
      const sessionDate = s?.date || new Date().toISOString();
      return (s?.exercises || [])
        .filter(e => e?.exerciseId === exerciseId)
        .flatMap(e => 
          (e?.sets || []).map(set => ({
            week: getWeekNumber(new Date(sessionDate)),
            estimate1RM: estimate1RM(set?.weight || 0, set?.reps || 0)
          }))
        );
    });

  if (values.length < 2) return null;

  // Get max per week
  const weekMap = {};
  values.forEach(v => {
    if (!weekMap[v.week]) weekMap[v.week] = [];
    weekMap[v.week].push(v.estimate1RM);
  });

  const weekValues = Object.values(weekMap).map(week => Math.max(...week));

  // Linear regression
  const n = weekValues.length;
  const xMean = (n - 1) / 2;
  const yMean = weekValues.reduce((s, v) => s + v, 0) / n;
  let num = 0, den = 0;
  
  weekValues.forEach((y, x) => {
    num += (x - xMean) * (y - yMean);
    den += (x - xMean) ** 2;
  });

  const slope = den !== 0 ? num / den : 0;
  const intercept = yMean - slope * xMean;
  const predictedMax = Math.round(intercept + slope * (n + 1));
  const weeksToGoal = Math.max(1, Math.round((predictedMax - weekValues[weekValues.length - 1]) / Math.max(0.1, slope)));

  return {
    predictedMax: isFinite(predictedMax) ? predictedMax : weekValues[weekValues.length - 1],
    weeks: isFinite(weeksToGoal) ? weeksToGoal : 4
  };
}

export function getNextPlanId(sessions, planOrder) {
  const completed = sessions.filter(s => s?.status === 'completed') || [];
  if (completed.length === 0) return planOrder[0];
  const last = completed[completed.length - 1]?.planId;
  const idx = planOrder.indexOf(last);
  return planOrder[(idx + 1) % planOrder.length];
}

export function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}