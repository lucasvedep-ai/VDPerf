# 📱 VDPerf - Liste des Fonctionnalités v2

## ✅ FONCTIONNALITÉS ACTUELLES

### 1️⃣ **Dashboard (Page d'accueil)**
- Affiche 4 KPIs: Séances complètes, Volume total, Moyenne/séance, Total séries
- Sélecteur de séance (Standard ou Bonus)
- Aperçu de la séance avant lancement
- Bouton "Lancer l'entraînement" → écran ActiveSession
- Player Apple Music intégré (play/pause/skip/volume, timer qui défile)
- Export données (JSON/CSV)

### 2️⃣ **Lancement de Séance (SessionPreview → ActiveSession)**
- Visualise les exercices de la séance
- Bouton "Modifier" pour ajouter/supprimer exercices (mode édition)
- Lancement effectif de la séance ✅
- Écran ActiveSession avec:
  - Timer chrono de la séance
  - Onglets exercices (avec statut ✓ si complétés)
  - Historique de la dernière séance pour chaque exercice
  - Input Poids/Reps/RPE par série
  - Affichage du 1RM estimé (Epley)
  - Bouton "Enregistrer la série"
  - Suppression de séries
  - Timer de repos (countdown)
  - Boutons Terminer/Annuler

### 3️⃣ **Onglet Programme**
- 2 onglets: Standard (4 plans) et Bonus (15 templates)
- Chaque plan affiche:
  - Nom et focus
  - Liste des exercices (sets x reps @ RPE)
  - Bouton "Lancer" → SessionPreview
- Plans Standard: Upper A/B, Lower A/B (locked)
- Bonus templates: Chest, Back, Legs, Arms/Core, Specialty

### 4️⃣ **Onglet Objectifs**
- Visualise et modifie objectifs (Bench, Squat, Deadlift, Bodyweight)
- Barre de progression pour chaque lift
- Affiche écart objectif - actuel
- Boutons d'export (JSON/CSV)
- ✅ FONCTIONNE BIEN

### 5️⃣ **Onglet Stats**
- 2 onglets: Global et Par exercice
- **Global**: 4 cartes (total séances, volume, moy, séries)
- **Par exercice**: 
  - Sélecteur exercice
  - Graphique LineChart: évolution 1RM par semaine
  - Graphique BarChart: volume par semaine
  - 3 cartes (meilleur 1RM, séries, progression)
  - Prédiction 1RM future (🔮)
  - Export données

### 6️⃣ **Onglet Coach (Chat IA)**
- Interface chat moderne (user en bleu, coach en gris)
- Questions/réponses sur:
  - Progresser, fatigue, augmenter poids
  - Variations d'exercices, objectifs
  - Récupération, sommeil, nutrition
- Réponses simulées (pas encore connecté Claude API)
- Temps de réponse: 1.2s
- ⚠️ Réponses complètes mais génériques

### 7️⃣ **Stockage & Données**
- localStorage (~10MB max)
- Structure: sessions[], activeSession, objectives, bonusSessionsCustom
- Historique exercices par séance
- Export JSON/CSV disponible

### 8️⃣ **Navigation**
- Navigation bottom bar (5 onglets)
- Transitions fluides entre pages
- Gestion activeSession automatique (App.jsx reroute vers ActiveSession)

---

## ⚠️ PROBLÈMES CONNUS / À AMÉLIORER

### Coach Chat
- [ ] Réponses trop génériques et répétitives
- [ ] Pas d'utilisation des données réelles de l'user
- [ ] Pas encore connecté à Claude API
- [ ] Pas d'historique persistant du chat

### UX/Design
- [ ] Music player UI seulement (pas de vraie intégration Apple Music)
- [ ] Pas de dark mode
- [ ] Pas de notifications
- [ ] Pas de badges/streaks

### Features manquantes
- [ ] Authentification/accounts
- [ ] Sync multi-appareils
- [ ] Vraie intégration Apple Music
- [ ] PDF export des séances
- [ ] Graphiques plus avancés (heatmap, progression trends)

---

## 🚀 PROCHAINES ÉTAPES (V3)

1. Améliorer Coach Chat (plus intelligent)
2. Déployer sur Vercel (lien stable pour iPhone)
3. Connecter Claude API pour réponses réelles
4. Ajouter authentification
5. Badges & streaks (gamification)

---

## 📊 STATS GLOBALES

- **Composants**: 13 (Dashboard, ActiveSession, Analytics, etc.)
- **Hooks custom**: 4 (useWorkoutStore, useLocalStorage, useRestTimer, useCoachAI)
- **Fichiers données**: 3 (exercises, workoutPlans, bonusTemplates)
- **Exercices**: 21 disponibles
- **Plans standard**: 4 (Upper A/B, Lower A/B)
- **Bonus templates**: 15

---

**QU'EST-CE QUE TU VEUX AMÉLIORER/CHANGER?** 👇