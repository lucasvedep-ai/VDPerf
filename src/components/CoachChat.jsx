import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Send } from 'lucide-react';
import { exercises } from '../data/exercises.js';
import { estimate1RM } from '../utils/calculations.js';

export default function CoachChat({ store }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: "👋 Salut! Je suis ton Coach IA personnel. Je vais t'aider avec:\n\n💪 Adapter ton programme selon ta progression\n📊 Analyser tes données d'entraînement en temps réel\n🎯 Optimiser ta progression vers tes objectifs\n🔄 Suggérer des variations d'exercices\n📈 Prédire ta progression future\n\nComment je peux t'aider aujourd'hui?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Analyser les données réelles de l'utilisateur
  const analyzeUserData = () => {
    const completed = (store.sessions || []).filter(s => s?.status === 'completed') || [];
    
    const stats = {
      totalSessions: completed.length,
      lastSession: completed[completed.length - 1] || null,
      totalVolume: completed.reduce((sum, s) => {
        return sum + (s.exercises || []).reduce((exSum, ex) => {
          return exSum + (ex.sets || []).reduce((setSum, set) => {
            return setSum + (set.weight || 0) * (set.reps || 0);
          }, 0);
        }, 0);
      }, 0),
      exerciseStats: {},
      adherence: Math.max(0, (completed.length / (completed.length + 2)) * 100),
    };

    // Calculer stats par exercice
    exercises.forEach(ex => {
      const exSets = completed
        .flatMap(s => s.exercises || [])
        .filter(e => e.exerciseId === ex.id)
        .flatMap(e => e.sets || []);
      
      if (exSets.length > 0) {
        const maxEstimate1RM = Math.max(...exSets.map(s => estimate1RM(s.weight, s.reps)));
        const avgWeight = exSets.reduce((sum, s) => sum + (s.weight || 0), 0) / exSets.length;
        stats.exerciseStats[ex.id] = {
          name: ex.name,
          sets: exSets.length,
          estimated1RM: Math.round(maxEstimate1RM),
          avgWeight: Math.round(avgWeight * 2) / 2,
          lastSet: exSets[exSets.length - 1]
        };
      }
    });

    return stats;
  };

  const generateCoachResponse = (userMessage) => {
    const stats = analyzeUserData();
    const objectives = store.objectives || {};
    const userMsg = userMessage.toLowerCase();

    // Réponses intelligentes basées sur les données
    const responses = [
      {
        keywords: ['progresser', 'augmenter', 'progression', 'améliorer'],
        generate: () => {
          if (stats.totalSessions === 0) {
            return "Je vois que tu n'as pas encore complété de séance. Lance ta première séance pour que je puisse analyser ta progression! 🚀";
          }

          const topExercise = Object.entries(stats.exerciseStats)
            .sort((a, b) => b[1].sets - a[1].sets)[0];

          return `Basé sur tes ${stats.totalSessions} séances et ${Math.round(stats.totalVolume / 1000)}k kg de volume total:\n\n📈 **Top Exercice**: ${topExercise[1].name} (${topExercise[1].sets} séries, ~${topExercise[1].estimated1RM}kg)\n\n💡 **Recommandations**:\n✅ Continue à progresser de +2.5kg par semaine\n✅ Tu as ${Math.round(stats.adherence)}% d'assiduité - excellent!\n✅ Varie les exos: essaye incline press, cable rows, Bulgarian splits\n✅ Augmente le volume progressivement\n\nTu veux des détails sur un exercice spécifique?`;
        }
      },
      {
        keywords: ['fatigue', 'fatigué', 'trop lourd', 'difficile', 'repos'],
        generate: () => {
          return `Je comprends! Écouter ton corps c'est important. Voici ce que tu peux faire:\n\n🟢 **Options**:\n1. Réduis le poids de 10-15% pour cette séance\n2. Fais une séance light (RPE 6, volume réduit)\n3. Prends un jour de repos complet\n4. Dors plus - c'est là que tu grows!\n\n⚡ **Fun fact**: 70% de la progression vient de la récupération, pas de l'entraînement!\n\nQuel niveau de fatigue (1-10)?`;
        }
      },
      {
        keywords: ['poids', 'bench', 'squat', 'deadlift', 'augment'],
        generate: () => {
          const bench = stats.exerciseStats['bench-press'];
          const squat = stats.exerciseStats['squat'];
          const deadlift = stats.exerciseStats['deadlift'];

          if (bench && squat && deadlift) {
            return `Voici ta progression actuelle:\n\n💪 **Lifts**:\n• Bench Press: ~${bench.estimated1RM}kg (der: ${bench.lastSet?.weight || '?'}kg x${bench.lastSet?.reps || '?'})\n• Squat: ~${squat.estimated1RM}kg (der: ${squat.lastSet?.weight || '?'}kg x${squat.lastSet?.reps || '?'})\n• Deadlift: ~${deadlift.estimated1RM}kg (der: ${deadlift.lastSet?.weight || '?'}kg x${deadlift.lastSet?.reps || '?'})\n\n🎯 **Prédiction (8 semaines)**:\n→ Bench: +${Math.round(bench.estimated1RM * 0.1)} kg (env. ${Math.round(bench.estimated1RM * 1.1)}kg)\n→ Squat: +${Math.round(squat.estimated1RM * 0.1)} kg (env. ${Math.round(squat.estimated1RM * 1.1)}kg)\n→ Deadlift: +${Math.round(deadlift.estimated1RM * 0.15)} kg (env. ${Math.round(deadlift.estimated1RM * 1.15)}kg)\n\nContinue comme tu le fais! 📈`;
          }
          return "Je vais besoin de plus de données. Termine quelques séances et je pourrai analyser ta progression précisément!";
        }
      },
      {
        keywords: ['objectif', 'but', 'cible', 'atteindre'],
        generate: () => {
          const bench = stats.exerciseStats['bench-press'];
          const benchObj = objectives.benchMax || 100;

          return `Je vois tes objectifs! Regardons ça ensemble:\n\n🎯 **Objectifs vs. Actuel**:\n• Bench: ${benchObj}kg (actuellement ~${bench?.estimated1RM || '?'}kg)\n• Squat: ${objectives.squatMax || 120}kg\n• Deadlift: ${objectives.deadliftMax || 150}kg\n\n⏰ **Timeline estimée** (progression linéaire):\n→ Bench en ${Math.max(4, Math.round((benchObj - (bench?.estimated1RM || 80)) / 2.5))} semaines\n→ Squat en ${Math.max(4, Math.round((objectives.squatMax - 100) / 2.5))} semaines\n→ Deadlift en ${Math.max(6, Math.round((objectives.deadliftMax - 120) / 5))} semaines\n\n💪 Tu peux le faire! Consistency > Perfection`;
        }
      },
      {
        keywords: ['nutrition', 'manger', 'calories', 'protéines', 'macro'],
        generate: () => {
          return `La nutrition c'est clé! Voici ce que je recommande:\n\n🥗 **Base Muscu**:\n✅ Protéines: 0.8-1g par kg de bodyweight\n✅ Calories: Maintenance +300 (bulk) ou -300 (cut)\n✅ Carbs: 4-6g par kg\n✅ Graisses: 1-1.5g par kg\n\n🍗 **Timing**:\n• Post-workout: Protéines + Carbs rapides (1h après)\n• Avant séance: Carbs + petite protéine (2h avant)\n\n💧 Hydrate-toi! 2-3L/jour minimum\n\nTu bulks ou tu cuts en ce moment?`;
        }
      },
      {
        keywords: ['variation', 'nouveau', 'changer', 'exercice', 'variation'],
        generate: () => {
          const exerciseCount = Object.keys(stats.exerciseStats).length;
          return `Excellente question! Les variations c'est vital pour:\n\n🔄 **Pourquoi**:\n✅ Stimuler les muscles différemment\n✅ Casser la monotonie\n✅ Prévenir les plateaux\n✅ Réduire le risque de blessure\n\n🎯 **Variations à essayer**:\n• Incline DB Press (pour le haut de chest)\n• Cable Rows (variation angle upper back)\n• Bulgarian Split Squats (unilatéral)\n• Smith Machine Bench (stabilité)\n• Paused Reps (TUT augmenté)\n\n💡 Tu as déjà ${exerciseCount} exercices différents. Tu peux en ajouter 1-2 bonus par semaine!\n\nQuel groupe musculaire tu veux améliorer?`;
        }
      },
      {
        keywords: ['récupération', 'sleep', 'dormir', 'repos'],
        generate: () => {
          return `La récupération est 50% du travail!\n\n😴 **Sommeil Optimal**:\n✅ 7-9h par nuit (c'est quand tu grows!)\n✅ Couche-toi à heure fixe\n✅ Évite les écrans 1h avant\n✅ Chambre fraîche (16-18°C idéal)\n\n💪 **Recovery Tools**:\n✅ Stretching 10min post-séance\n✅ Foam rolling (2x/semaine)\n✅ Sauna (si disponible)\n✅ Massages (optionnel mais cool)\n\n⚡ **Entre les séances**:\n✅ 48h de repos pour le même groupe musculaire\n✅ Nutrition adéquate\n✅ Stress bas (important!)\n\nTu dors bien ces jours-ci?`;
        }
      }
    ];

    const matchedResponse = responses.find(r =>
      r.keywords.some(keyword => userMsg.includes(keyword))
    );

    if (matchedResponse) {
      return matchedResponse.generate();
    }

    // Fallback response
    return `C'est une excellente question! 🤔\n\nBasé sur tes ${stats.totalSessions} séances complétées et ${Math.round(stats.totalVolume / 1000)}k kg de volume:\n\n📊 **Mon analyse**:\nTu as une bonne assiduité (${Math.round(stats.adherence)}%)! Continue comme ça.\n\nPour une réponse plus spécifique, peux-tu me dire:\n• Qu'est-ce qui te fait le plus progresser?\n• Un exercice où tu galères?\n• Comment tu te sens physiquement?\n\nPlus j'ai de détails, mieux je peux t'aider! 💪`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulated response with longer delay
    setTimeout(() => {
      const coachResponse = generateCoachResponse(input);
      const assistantMessage = {
        id: messages.length + 2,
        role: 'assistant',
        text: coachResponse
      };

      setMessages(prev => [...prev, assistantMessage]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      <div className="flex items-center p-6 border-b border-gray-800">
        <ChevronLeft className="w-6 h-6 mr-2 cursor-pointer hover:text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold">Coach IA 💪</h1>
          <p className="text-xs text-gray-400 mt-1">Analyse en temps réel de tes données</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-3 rounded-lg whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}
              style={{ wordBreak: 'break-word' }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 px-4 py-3 rounded-lg text-gray-400 flex gap-2">
              <span>Coach analyse...</span>
              <div className="flex gap-1 animate-pulse">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-800 p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pose une question... (ex: 'Augment bench?', 'Je suis fatigué', 'Comment progresser?')"
            className="flex-1 bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded px-4 py-2 transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">💡 Tip: Dis-moi ta fatigue, tes gains, tes objectifs - je m'adapterai!</p>
      </div>
    </div>
  );
}