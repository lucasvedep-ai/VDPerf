export const workoutPlans = [
  {
    id: 'upper-a',
    name: 'Upper A',
    type: 'upper',
    focus: 'Force',
    exercises: [
      { exerciseId: 'bench-press', sets: 4, reps: '4-6', rpe: '8-9', rest: 180 },
      { exerciseId: 'barbell-row', sets: 4, reps: '4-6', rpe: '8-9', rest: 180 },
      { exerciseId: 'overhead-press', sets: 3, reps: '6-8', rpe: '8', rest: 120 },
      { exerciseId: 'pull-ups', sets: 3, reps: '6-8', rpe: '8', rest: 120 },
      { exerciseId: 'triceps-pushdown', sets: 3, reps: '10-12', rpe: '7-8', rest: 90 },
      { exerciseId: 'barbell-curl', sets: 3, reps: '10-12', rpe: '7-8', rest: 90 },
    ],
  },
  {
    id: 'lower-a',
    name: 'Lower A',
    type: 'lower',
    focus: 'Force',
    exercises: [
      { exerciseId: 'squat', sets: 4, reps: '4-6', rpe: '8-9', rest: 180 },
      { exerciseId: 'romanian-deadlift', sets: 3, reps: '8-10', rpe: '8', rest: 120 },
      { exerciseId: 'leg-press', sets: 3, reps: '10-12', rpe: '7-8', rest: 90 },
      { exerciseId: 'leg-curl', sets: 3, reps: '10-12', rpe: '7-8', rest: 90 },
      { exerciseId: 'calf-raise', sets: 4, reps: '12-15', rpe: '8', rest: 60 },
    ],
  },
  {
    id: 'upper-b',
    name: 'Upper B',
    type: 'upper',
    focus: 'Hypertrophie',
    exercises: [
      { exerciseId: 'incline-db-press', sets: 4, reps: '8-12', rpe: '8', rest: 120 },
      { exerciseId: 'cable-row', sets: 4, reps: '8-12', rpe: '8', rest: 120 },
      { exerciseId: 'db-lateral-raise', sets: 3, reps: '12-15', rpe: '8', rest: 90 },
      { exerciseId: 'face-pull', sets: 3, reps: '12-15', rpe: '7-8', rest: 90 },
      { exerciseId: 'dips', sets: 3, reps: '8-12', rpe: '8', rest: 90 },
      { exerciseId: 'hammer-curl', sets: 3, reps: '12-15', rpe: '7-8', rest: 90 },
    ],
  },
  {
    id: 'lower-b',
    name: 'Lower B',
    type: 'lower',
    focus: 'Hypertrophie',
    exercises: [
      { exerciseId: 'deadlift', sets: 4, reps: '4-6', rpe: '8-9', rest: 180 },
      { exerciseId: 'bulgarian-split-squat', sets: 3, reps: '8-10', rpe: '8', rest: 120 },
      { exerciseId: 'leg-extension', sets: 3, reps: '12-15', rpe: '7-8', rest: 90 },
      { exerciseId: 'nordic-curl', sets: 3, reps: '8-10', rpe: '8', rest: 90 },
      { exerciseId: 'calf-raise', sets: 4, reps: '15-20', rpe: '8', rest: 60 },
    ],
  },
];

export const planMap = Object.fromEntries(workoutPlans.map(p => [p.id, p]));
export const planOrder = ['upper-a', 'lower-a', 'upper-b', 'lower-b'];
