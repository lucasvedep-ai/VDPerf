export const bonusSessionTemplates = [
  // CHEST FOCUS (3)
  {
    id: 'focus-chest-hypertro',
    name: 'Focus Chest Hypertrophie',
    description: 'High volume, 8-12 reps, pump focus',
    duration: 60,
    difficulty: 'Intermediate',
    exercises: [
      { exerciseId: 'incline-db-press', sets: 4, reps: '8-10', rpe: '7-8', rest: 90 },
      { exerciseId: 'cable-flyes', sets: 3, reps: '10-12', rpe: '7', rest: 60 },
      { exerciseId: 'machine-press', sets: 3, reps: '8-10', rpe: '7', rest: 75 },
      { exerciseId: 'pec-deck', sets: 3, reps: '12-15', rpe: '6-7', rest: 45 },
    ]
  },
  {
    id: 'focus-chest-strength',
    name: 'Focus Chest Strength',
    description: 'Heavy compound focus, 3-5 reps',
    duration: 70,
    difficulty: 'Advanced',
    exercises: [
      { exerciseId: 'bench-press', sets: 5, reps: '3-5', rpe: '8-9', rest: 180 },
      { exerciseId: 'incline-db-press', sets: 4, reps: '5-7', rpe: '8', rest: 150 },
      { exerciseId: 'cable-flyes', sets: 3, reps: '8-10', rpe: '7', rest: 60 },
    ]
  },
  {
    id: 'focus-chest-endurance',
    name: 'Focus Chest Endurance',
    description: 'Light pump, high reps, recovery focus',
    duration: 45,
    difficulty: 'Beginner',
    exercises: [
      { exerciseId: 'dumbbell-bench-press', sets: 3, reps: '12-15', rpe: '6', rest: 45 },
      { exerciseId: 'cable-flyes', sets: 3, reps: '15-20', rpe: '5-6', rest: 30 },
      { exerciseId: 'pec-deck', sets: 2, reps: '15-20', rpe: '5', rest: 30 },
    ]
  },

  // BACK FOCUS (3)
  {
    id: 'focus-back-strength',
    name: 'Focus Back Strength',
    description: 'Heavy rows, lat focus, 4-6 reps',
    duration: 75,
    difficulty: 'Advanced',
    exercises: [
      { exerciseId: 'barbell-row', sets: 5, reps: '4-6', rpe: '8-9', rest: 180 },
      { exerciseId: 'pull-ups', sets: 4, reps: '5-8', rpe: '8', rest: 120 },
      { exerciseId: 'cable-row', sets: 3, reps: '8-10', rpe: '7', rest: 90 },
    ]
  },
  {
    id: 'focus-back-hypertro',
    name: 'Focus Back Hypertrophie',
    description: 'Lats + Thickness, 8-12 reps',
    duration: 65,
    difficulty: 'Intermediate',
    exercises: [
      { exerciseId: 'lat-pulldown', sets: 4, reps: '8-10', rpe: '7-8', rest: 90 },
      { exerciseId: 'cable-row', sets: 4, reps: '8-10', rpe: '7-8', rest: 90 },
      { exerciseId: 'machine-row', sets: 3, reps: '10-12', rpe: '7', rest: 60 },
      { exerciseId: 'reverse-flyes', sets: 3, reps: '12-15', rpe: '6-7', rest: 45 },
    ]
  },
  {
    id: 'focus-back-thickness',
    name: 'Focus Back Thickness',
    description: 'Rows + Chins, thick back builder',
    duration: 70,
    difficulty: 'Intermediate',
    exercises: [
      { exerciseId: 'barbell-row', sets: 4, reps: '6-8', rpe: '8', rest: 150 },
      { exerciseId: 'pull-ups', sets: 4, reps: '6-10', rpe: '7-8', rest: 120 },
      { exerciseId: 't-bar-row', sets: 3, reps: '8-10', rpe: '7', rest: 90 },
      { exerciseId: 'barbell-curl', sets: 3, reps: '8-10', rpe: '7', rest: 60 },
    ]
  },

  // LEGS FOCUS (3)
  {
    id: 'focus-legs-squat',
    name: 'Focus Legs - Squat Focus',
    description: 'Quad dominant, 5-8 reps',
    duration: 75,
    difficulty: 'Advanced',
    exercises: [
      { exerciseId: 'squat', sets: 5, reps: '5-8', rpe: '8-9', rest: 180 },
      { exerciseId: 'leg-press', sets: 4, reps: '8-10', rpe: '8', rest: 120 },
      { exerciseId: 'leg-extensions', sets: 3, reps: '10-12', rpe: '7', rest: 60 },
      { exerciseId: 'calf-raises', sets: 3, reps: '12-15', rpe: '7', rest: 45 },
    ]
  },
  {
    id: 'focus-legs-deadlift',
    name: 'Focus Legs - Deadlift Focus',
    description: 'Posterior chain, 3-6 reps',
    duration: 70,
    difficulty: 'Advanced',
    exercises: [
      { exerciseId: 'deadlift', sets: 4, reps: '3-6', rpe: '8-9', rest: 180 },
      { exerciseId: 'leg-curls', sets: 4, reps: '8-10', rpe: '7-8', rest: 90 },
      { exerciseId: 'split-squats', sets: 3, reps: '8-10', rpe: '7', rest: 75 },
      { exerciseId: 'calf-raises', sets: 3, reps: '12-15', rpe: '6', rest: 45 },
    ]
  },
  {
    id: 'focus-legs-endurance',
    name: 'Focus Legs - Endurance',
    description: 'Light recovery, 12-20 reps',
    duration: 50,
    difficulty: 'Beginner',
    exercises: [
      { exerciseId: 'leg-extensions', sets: 3, reps: '15-20', rpe: '6', rest: 45 },
      { exerciseId: 'leg-curls', sets: 3, reps: '15-20', rpe: '6', rest: 45 },
      { exerciseId: 'split-squats', sets: 2, reps: '12-15', rpe: '5-6', rest: 45 },
    ]
  },

  // ACCESSORIES (3)
  {
    id: 'focus-arms-pump',
    name: 'Focus Arms Pump',
    description: 'Biceps + Triceps, 8-12 reps, pump focus',
    duration: 45,
    difficulty: 'Beginner',
    exercises: [
      { exerciseId: 'barbell-curl', sets: 3, reps: '8-10', rpe: '7', rest: 60 },
      { exerciseId: 'triceps-pushdown', sets: 3, reps: '10-12', rpe: '7', rest: 60 },
      { exerciseId: 'dumbbell-curl', sets: 3, reps: '10-12', rpe: '7', rest: 45 },
      { exerciseId: 'rope-pushdown', sets: 3, reps: '12-15', rpe: '6-7', rest: 45 },
    ]
  },
  {
    id: 'focus-shoulders-mobility',
    name: 'Focus Shoulders Mobility',
    description: 'Shoulder health + mobility work',
    duration: 50,
    difficulty: 'Beginner',
    exercises: [
      { exerciseId: 'overhead-press', sets: 3, reps: '8-10', rpe: '7', rest: 90 },
      { exerciseId: 'db-lateral-raise', sets: 3, reps: '12-15', rpe: '6-7', rest: 45 },
      { exerciseId: 'reverse-flyes', sets: 3, reps: '12-15', rpe: '6-7', rest: 45 },
      { exerciseId: 'face-pulls', sets: 3, reps: '15-20', rpe: '6', rest: 30 },
    ]
  },
  {
    id: 'focus-core-stability',
    name: 'Focus Core Stability',
    description: 'Core strengthening + stability',
    duration: 40,
    difficulty: 'Beginner',
    exercises: [
      { exerciseId: 'cable-woodchops', sets: 3, reps: '10-12', rpe: '7', rest: 60 },
      { exerciseId: 'ab-wheel-rollout', sets: 3, reps: '8-10', rpe: '7', rest: 45 },
      { exerciseId: 'planks', sets: 3, reps: '45-60s', rpe: '7', rest: 45 },
      { exerciseId: 'dead-bugs', sets: 3, reps: '12-15', rpe: '6', rest: 30 },
    ]
  },

  // SPECIALTY (3)
  {
    id: 'focus-jjb-prep',
    name: 'Focus JJB Prep',
    description: 'Mobility + Grip strength + Explosivité',
    duration: 55,
    difficulty: 'Intermediate',
    exercises: [
      { exerciseId: 'pull-ups', sets: 4, reps: '6-10', rpe: '7-8', rest: 120 },
      { exerciseId: 'dead-bugs', sets: 3, reps: '15-20', rpe: '6', rest: 45 },
      { exerciseId: 'farmer-carries', sets: 3, reps: '40m', rpe: '7', rest: 60 },
      { exerciseId: 'medicine-ball-slams', sets: 3, reps: '8-10', rpe: '8', rest: 60 },
    ]
  },
  {
    id: 'focus-boxe-cardio',
    name: 'Focus Boxe Cardio',
    description: 'Cardio + Explosivité + Stamina',
    duration: 60,
    difficulty: 'Intermediate',
    exercises: [
      { exerciseId: 'medicine-ball-slams', sets: 4, reps: '10-12', rpe: '8-9', rest: 90 },
      { exerciseId: 'battle-ropes', sets: 3, reps: '30s', rpe: '8', rest: 30 },
      { exerciseId: 'box-jumps', sets: 3, reps: '5-8', rpe: '8', rest: 120 },
      { exerciseId: 'rope-jumping', sets: 3, reps: '60s', rpe: '7', rest: 45 },
    ]
  },
  {
    id: 'focus-recomp',
    name: 'Focus Recomposition',
    description: 'Full body light, caloric deficit friendly',
    duration: 50,
    difficulty: 'Intermediate',
    exercises: [
      { exerciseId: 'squat', sets: 3, reps: '8-10', rpe: '7', rest: 90 },
      { exerciseId: 'bench-press', sets: 3, reps: '8-10', rpe: '7', rest: 90 },
      { exerciseId: 'barbell-row', sets: 3, reps: '8-10', rpe: '7', rest: 90 },
      { exerciseId: 'overhead-press', sets: 2, reps: '8-10', rpe: '7', rest: 60 },
    ]
  },
];