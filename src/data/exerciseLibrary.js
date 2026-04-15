export const exerciseLibrary = [
  // PECTORAUX (13) — paramType: weight
  { id: 'lib-bench-press', name: 'Développé couché', muscleGroup: 'Pectoraux', difficulty: 'Moyen', equipment: 'Barre', paramType: 'weight' },
  { id: 'lib-db-bench-press', name: 'Développé couché aux haltères', muscleGroup: 'Pectoraux', difficulty: 'Moyen', equipment: 'Haltères', paramType: 'weight' },
  { id: 'lib-incline-bench-press', name: 'Développé incliné (Barre)', muscleGroup: 'Pectoraux', difficulty: 'Moyen', equipment: 'Barre', paramType: 'weight' },
  { id: 'lib-incline-smith-press', name: 'Développé incliné à la Smith Machine', muscleGroup: 'Pectoraux', difficulty: 'Moyen', equipment: 'Smith Machine', paramType: 'weight' },
  { id: 'lib-incline-db-press', name: 'Développé incliné aux haltères', muscleGroup: 'Pectoraux', difficulty: 'Moyen', equipment: 'Haltères', paramType: 'weight' },
  { id: 'lib-push-ups', name: 'Pompes', muscleGroup: 'Pectoraux', difficulty: 'Facile', equipment: 'Poids du corps', paramType: 'reps' },
  { id: 'lib-dips', name: 'Dips', muscleGroup: 'Pectoraux', difficulty: 'Moyen', equipment: 'Barres parallèles', paramType: 'reps' },
  { id: 'lib-smith-bench-press', name: 'Développé couché à la Smith Machine', muscleGroup: 'Pectoraux', difficulty: 'Facile', equipment: 'Smith Machine', paramType: 'weight' },
  { id: 'lib-db-flyes', name: 'Écartés aux haltères', muscleGroup: 'Pectoraux', difficulty: 'Moyen', equipment: 'Haltères', paramType: 'weight' },
  { id: 'lib-machine-flyes', name: 'Écartés papillons à la machine', muscleGroup: 'Pectoraux', difficulty: 'Facile', equipment: 'Machine', paramType: 'weight' },
  { id: 'lib-cable-flyes-low', name: 'Écartés à la poulie (position basse)', muscleGroup: 'Pectoraux', difficulty: 'Moyen', equipment: 'Poulie', paramType: 'weight' },
  { id: 'lib-cable-flyes-mid', name: 'Écartés à la poulie (position moyenne)', muscleGroup: 'Pectoraux', difficulty: 'Moyen', equipment: 'Poulie', paramType: 'weight' },
  { id: 'lib-cable-flyes-high', name: 'Écartés à la poulie (position haute)', muscleGroup: 'Pectoraux', difficulty: 'Moyen', equipment: 'Poulie', paramType: 'weight' },

  // DOS (11)
  { id: 'lib-barbell-row', name: 'Tirage barre', muscleGroup: 'Dos', difficulty: 'Moyen', equipment: 'Barre', paramType: 'weight' },
  { id: 'lib-pull-ups', name: 'Tractions', muscleGroup: 'Dos', difficulty: 'Difficile', equipment: 'Barre de traction', paramType: 'reps' },
  { id: 'lib-deadlift', name: 'Soulevé de terre', muscleGroup: 'Dos', difficulty: 'Difficile', equipment: 'Barre', paramType: 'weight' },
  { id: 'lib-romanian-deadlift', name: 'Soulevé de terre roumain', muscleGroup: 'Dos', difficulty: 'Moyen', equipment: 'Barre', paramType: 'weight' },
  { id: 'lib-db-row', name: 'Rowing bûcheron (haltère)', muscleGroup: 'Dos', difficulty: 'Facile', equipment: 'Haltère', paramType: 'weight' },
  { id: 'lib-barbell-row-bent', name: 'Rowing bûcheron (barre)', muscleGroup: 'Dos', difficulty: 'Moyen', equipment: 'Barre', paramType: 'weight' },
  { id: 'lib-shrugs', name: 'Shrugs (trapèzes)', muscleGroup: 'Dos', difficulty: 'Facile', equipment: 'Barre', paramType: 'weight' },
  { id: 'lib-incline-shrugs', name: 'Shrugs incliné (trapèzes)', muscleGroup: 'Dos', difficulty: 'Facile', equipment: 'Haltères', paramType: 'weight' },
  { id: 'lib-lat-pulldown', name: 'Tirage vertical', muscleGroup: 'Dos', difficulty: 'Facile', equipment: 'Poulie', paramType: 'weight' },
  { id: 'lib-superman', name: 'Superman (lombaires)', muscleGroup: 'Dos', difficulty: 'Facile', equipment: 'Poids du corps', paramType: 'reps' },
  { id: 'lib-seated-row', name: 'Tirage horizontal (Rameur)', muscleGroup: 'Dos', difficulty: 'Facile', equipment: 'Poulie', paramType: 'weight' },

  // ÉPAULES (6)
  { id: 'lib-military-press', name: 'Développé militaire', muscleGroup: 'Épaules', difficulty: 'Difficile', equipment: 'Barre', paramType: 'weight' },
  { id: 'lib-lateral-raises', name: 'Élévation latérale aux haltères', muscleGroup: 'Épaules', difficulty: 'Facile', equipment: 'Haltères', paramType: 'weight' },
  { id: 'lib-machine-shoulder-press', name: 'Développé épaules à la machine', muscleGroup: 'Épaules', difficulty: 'Facile', equipment: 'Machine', paramType: 'weight' },
  { id: 'lib-db-shoulder-press', name: 'Développé épaules aux haltères', muscleGroup: 'Épaules', difficulty: 'Moyen', equipment: 'Haltères', paramType: 'weight' },
  { id: 'lib-reverse-flyes-machine', name: 'Écartés inversés à la machine', muscleGroup: 'Épaules', difficulty: 'Facile', equipment: 'Machine', paramType: 'weight' },
  { id: 'lib-upright-row', name: 'Upright Row', muscleGroup: 'Épaules', difficulty: 'Moyen', equipment: 'Barre', paramType: 'weight' },

  // BICEPS (6)
  { id: 'lib-barbell-curl', name: 'Curl barre', muscleGroup: 'Biceps', difficulty: 'Facile', equipment: 'Barre', paramType: 'weight' },
  { id: 'lib-db-curl', name: 'Curl haltères', muscleGroup: 'Biceps', difficulty: 'Facile', equipment: 'Haltères', paramType: 'weight' },
  { id: 'lib-hammer-curl', name: 'Curl marteau', muscleGroup: 'Biceps', difficulty: 'Facile', equipment: 'Haltères', paramType: 'weight' },
  { id: 'lib-cable-curl', name: 'Curl à la poulie', muscleGroup: 'Biceps', difficulty: 'Facile', equipment: 'Poulie', paramType: 'weight' },
  { id: 'lib-machine-curl', name: 'Curl à la machine', muscleGroup: 'Biceps', difficulty: 'Facile', equipment: 'Machine', paramType: 'weight' },
  { id: 'lib-preacher-curl', name: 'Curl pupitre', muscleGroup: 'Biceps', difficulty: 'Moyen', equipment: 'Barre / Machine', paramType: 'weight' },

  // TRICEPS (6)
  { id: 'lib-cable-pushdown', name: 'Extensions à la poulie', muscleGroup: 'Triceps', difficulty: 'Facile', equipment: 'Poulie', paramType: 'weight' },
  { id: 'lib-close-grip-bench', name: 'Développé couché prise étroite', muscleGroup: 'Triceps', difficulty: 'Moyen', equipment: 'Barre', paramType: 'weight' },
  { id: 'lib-overhead-triceps-ext', name: 'Extension verticale aux haltères', muscleGroup: 'Triceps', difficulty: 'Facile', equipment: 'Haltère', paramType: 'weight' },
  { id: 'lib-skull-crusher', name: 'Skull crusher', muscleGroup: 'Triceps', difficulty: 'Moyen', equipment: 'Barre', paramType: 'weight' },
  { id: 'lib-machine-dips-triceps', name: 'Dips triceps à la machine', muscleGroup: 'Triceps', difficulty: 'Facile', equipment: 'Machine', paramType: 'weight' },
  { id: 'lib-kickback', name: 'Extension arrière haltères', muscleGroup: 'Triceps', difficulty: 'Facile', equipment: 'Haltère', paramType: 'weight' },

  // JAMBES (10)
  { id: 'lib-squat', name: 'Squat', muscleGroup: 'Jambes', difficulty: 'Difficile', equipment: 'Barre', paramType: 'weight' },
  { id: 'lib-leg-press', name: 'Leg press', muscleGroup: 'Jambes', difficulty: 'Facile', equipment: 'Machine', paramType: 'weight' },
  { id: 'lib-leg-extension', name: 'Extension de jambes', muscleGroup: 'Jambes', difficulty: 'Facile', equipment: 'Machine', paramType: 'weight' },
  { id: 'lib-leg-curl', name: 'Flexion de jambes', muscleGroup: 'Jambes', difficulty: 'Facile', equipment: 'Machine', paramType: 'weight' },
  { id: 'lib-bulgarian-split-squat', name: 'Squat bulgare', muscleGroup: 'Jambes', difficulty: 'Difficile', equipment: 'Haltères', paramType: 'weight' },
  { id: 'lib-calf-raises', name: 'Relevé de mollets', muscleGroup: 'Jambes', difficulty: 'Facile', equipment: 'Machine', paramType: 'weight' },
  { id: 'lib-front-squat', name: 'Squat avant', muscleGroup: 'Jambes', difficulty: 'Difficile', equipment: 'Barre', paramType: 'weight' },
  { id: 'lib-hack-squat', name: 'Hack squat', muscleGroup: 'Jambes', difficulty: 'Moyen', equipment: 'Machine', paramType: 'weight' },
  { id: 'lib-smith-squat', name: 'Squat à la Smith Machine', muscleGroup: 'Jambes', difficulty: 'Facile', equipment: 'Smith Machine', paramType: 'weight' },
  { id: 'lib-nordic-curl', name: 'Flexion nordique', muscleGroup: 'Jambes', difficulty: 'Difficile', equipment: 'Poids du corps', paramType: 'reps' },

  // ABDOMINAUX (10)
  { id: 'lib-cable-crunch', name: 'Crunch à la poulie', muscleGroup: 'Abdominaux', difficulty: 'Facile', equipment: 'Poulie', paramType: 'weight' },
  { id: 'lib-ab-wheel', name: 'Rouleau abdominal', muscleGroup: 'Abdominaux', difficulty: 'Moyen', equipment: 'Rouleau', paramType: 'reps' },
  { id: 'lib-hanging-leg-raises', name: 'Relevé de jambes suspendu', muscleGroup: 'Abdominaux', difficulty: 'Difficile', equipment: 'Barre de traction', paramType: 'reps' },
  { id: 'lib-machine-crunch', name: 'Crunch à la machine', muscleGroup: 'Abdominaux', difficulty: 'Facile', equipment: 'Machine', paramType: 'weight' },
  { id: 'lib-plank', name: 'Planche', muscleGroup: 'Abdominaux', difficulty: 'Moyen', equipment: 'Poids du corps', paramType: 'time' },
  { id: 'lib-sit-ups', name: 'Abdominaux classiques', muscleGroup: 'Abdominaux', difficulty: 'Facile', equipment: 'Poids du corps', paramType: 'reps' },
  { id: 'lib-stair-climber', name: 'Marche escaliers', muscleGroup: 'Abdominaux', difficulty: 'Facile', equipment: 'Machine', paramType: 'cardio' },
  { id: 'lib-knee-raises', name: 'Montée de genoux', muscleGroup: 'Abdominaux', difficulty: 'Facile', equipment: 'Poids du corps', paramType: 'reps' },
  { id: 'lib-jump-squats', name: 'Squat sautés', muscleGroup: 'Abdominaux', difficulty: 'Moyen', equipment: 'Poids du corps', paramType: 'reps' },
  { id: 'lib-jump-lunges', name: 'Fentes sautées', muscleGroup: 'Abdominaux', difficulty: 'Moyen', equipment: 'Poids du corps', paramType: 'reps' },

  // CARDIO (6)
  { id: 'lib-treadmill', name: 'Tapis de course', muscleGroup: 'Cardio', difficulty: 'Facile', equipment: 'Machine', paramType: 'cardio' },
  { id: 'lib-rowing-machine', name: 'Rameur', muscleGroup: 'Cardio', difficulty: 'Moyen', equipment: 'Machine', paramType: 'cardio' },
  { id: 'lib-stationary-bike', name: 'Vélo stationnaire', muscleGroup: 'Cardio', difficulty: 'Facile', equipment: 'Machine', paramType: 'cardio' },
  { id: 'lib-elliptical', name: 'Elliptique', muscleGroup: 'Cardio', difficulty: 'Facile', equipment: 'Machine', paramType: 'cardio' },
  { id: 'lib-jump-rope', name: 'Corde à sauter', muscleGroup: 'Cardio', difficulty: 'Moyen', equipment: 'Corde', paramType: 'cardio' },
  { id: 'lib-burpees', name: 'Burpees', muscleGroup: 'Cardio', difficulty: 'Difficile', equipment: 'Poids du corps', paramType: 'reps' },

  // POIDS DU CORPS (4)
  { id: 'lib-chin-ups', name: 'Tractions prise neutre (Chin-ups)', muscleGroup: 'Poids du corps', difficulty: 'Difficile', equipment: 'Barre de traction', paramType: 'reps' },
  { id: 'lib-pistol-squat', name: 'Squat pistol (une jambe)', muscleGroup: 'Poids du corps', difficulty: 'Difficile', equipment: 'Poids du corps', paramType: 'reps' },
  { id: 'lib-handstand-push-ups', name: 'Pompes en appui facial (Handstand)', muscleGroup: 'Poids du corps', difficulty: 'Difficile', equipment: 'Poids du corps', paramType: 'reps' },
  { id: 'lib-muscle-up', name: 'Muscle up', muscleGroup: 'Poids du corps', difficulty: 'Difficile', equipment: 'Barre de traction', paramType: 'reps' },
];

export const muscleGroups = [
  'Pectoraux',
  'Dos',
  'Épaules',
  'Biceps',
  'Triceps',
  'Jambes',
  'Abdominaux',
  'Cardio',
  'Poids du corps',
];

export function getExercisesByMuscleGroup(group, customExercises = []) {
  const fromLib = exerciseLibrary.filter(ex => ex.muscleGroup === group);
  const fromCustom = customExercises.filter(ex => ex.muscleGroup === group);
  return [...fromLib, ...fromCustom];
}

export function getExerciseById(id, customExercises = []) {
  return exerciseLibrary.find(ex => ex.id === id)
    || customExercises.find(ex => ex.id === id)
    || null;
}

export function getAllExercises(customExercises = []) {
  return [...exerciseLibrary, ...customExercises];
}
