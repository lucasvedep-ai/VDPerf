import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Send, Zap } from 'lucide-react';
import { exercises } from '../data/exercises.js';
import { estimate1RM } from '../utils/calculations.js';

export default function CoachChat({ store }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: "🔥 Yo Lucas! Je suis ton Coach IA. Je vois que tu as complété " + ((store.sessions || []).filter(s => s?.status === 'completed').length) + " séances. Impressionnant!\n\nJe peux:\n💪 Analyser ta progression en temps réel\n🎯 Adapter ton programme selon tes données\n📈 Prédire tes futurs lifts\n🔄 Suggérer des variations d'exos\n🚀 Te motiver quand ça compte!\n\nC'est parti? Pose-moi une question! 🏋️"
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

  // Analyse RÉELLE des données
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
    };

    // Stats par exercice avec données RÉELLES
    exercises.forEach(ex => {
      const exSets = completed
        .flatMap(s => s.exercises || [])
        .filter(e => e.exerciseId === ex.id)
        .flatMap(e => e.sets || []);
      
      if (exSets.length > 0) {
        const maxEstimate1RM = Math.max(...exSets.map(s => estimate1RM(s.weight, s.reps)));
        const avgWeight = exSets.reduce((sum, s) => sum + (s.weight || 0), 0) / exSets.length;
        const lastSet = exSets[exSets.length - 1];
        stats.exerciseStats[ex.id] = {
          name: ex.name,
          sets: exSets.length,
          estimated1RM: Math.round(maxEstimate1RM),
          avgWeight: Math.round(avgWeight * 2) / 2,
          lastSet: lastSet,
          progression: exSets.length > 1 ? 
            Math.round(maxEstimate1RM - estimate1RM(exSets[0].weight, exSets[0].reps)) : 0
        };
      }
    });

    return stats;
  };

  const generateCoachResponse = (userMessage) => {
    const stats = analyzeUserData();
    const objectives = store.objectives || {};
    const userMsg = userMessage.toLowerCase();

    const responses = [
      {
        keywords: ['progress', 'augment', 'plus', 'améliorer', 'progresser'],
        generate: () => {
          if (stats.totalSessions < 3) {
            return "🚀 Excellente question! Tu es encore en début de parcours. Pour voir une vraie progression, il faut:\n\n✅ Faire au moins 3-4 séances/semaine\n✅ Progresser de +2.5kg par semaine\n✅ Garder un bon sommeil (7-9h)\n✅ Manger assez de protéines (0.8g/kg)\n\nTu as fait " + stats.totalSessions + " séances. Continue comme ça! 💪 Reviens-moi dans 2 semaines avec plus de données!";
          }

          const topEx = Object.entries(stats.exerciseStats)
            .filter(([_, v]) => v.sets > 0)
            .sort((a, b) => b[1].estimated1RM - a[1].estimated1RM)[0];

          return `📊 ANALYSE DE TA PROGRESSION:\n\nTu as ${stats.totalSessions} séances (${Math.round(stats.totalVolume / 1000)}k kg levés)\n\n🏋️ TOP EXERCICE: ${topEx[1].name}\n• Estimé 1RM: ${topEx[1].estimated1RM}kg\n• ${topEx[1].sets} séries enregistrées\n• Progression: +${topEx[1].progression}kg\n\n💡 RECOMMANDATIONS:\n✅ Vas-y progressivement (+2.5kg/semaine max)\n✅ Augmente le volume (ajoute une série)\n✅ Essaye une variation (incline, cable, etc)\n✅ Consistency > intensity\n\nTu progresseras garantie si tu follows ça! 🔥`;
        }
      },
      {
        keywords: ['fatigué', 'fatigue', 'lourd', 'difficile', 'déco', 'repos'],
        generate: () => {
          return `🛑 Je comprends! L'overtraining tue la progression. Voici quoi faire:\n\n🟢 OPTION 1 - Light Workout:\n→ Réduis poids de 30%\n→ Même nombre de séries mais RPE 6\n→ Focalise sur la forme\n\n🟢 OPTION 2 - Deload Week:\n→ Tous les poids -20%\n→ Volume -30%\n→ Stretch + mobility focus\n\n🟢 OPTION 3 - Rest Day:\n→ Dors 9h+\n→ Zinc + Magnésium\n→ Hydrate-toi bien\n\n⚡ PRO TIP: 70% gains vient de la RÉCUPÉRATION, pas du training!\n\nLe repos c'est quand tu GROWS! 💪`;
        }
      },
      {
        keywords: ['bench', 'squat', 'deadlift', 'poids', 'max', 'lift'],
        generate: () => {
          const bench = stats.exerciseStats['bench-press'];
          const squat = stats.exerciseStats['squat'];
          const deadlift = stats.exerciseStats['deadlift'];

          if (!bench && !squat && !deadlift) {
            return "Je vois que tu n'as pas encore log ces lifts. Lance une séance et enregistre des séries! Après je pourrai te donner une vraie analyse. 💪";
          }

          let response = `📈 TES BIG 3 LIFTS:\n`;
          if (bench) response += `\n🔴 BENCH: ~${bench.estimated1RM}kg (${bench.sets} séries)\n→ Progression: +${bench.progression}kg`;
          if (squat) response += `\n🔵 SQUAT: ~${squat.estimated1RM}kg (${squat.sets} séries)\n→ Progression: +${squat.progression}kg`;
          if (deadlift) response += `\n⚫ DEADLIFT: ~${deadlift.estimated1RM}kg (${deadlift.sets} séries)\n→ Progression: +${deadlift.progression}kg`;

          response += `\n\n🎯 NEXT TARGETS:\n${bench ? `• Bench: +${Math.round(bench.estimated1RM * 0.05)}kg (5%) possible en 6 semaines` : ''}${squat ? `\n• Squat: +${Math.round(squat.estimated1RM * 0.1)}kg (10%) possible en 8 semaines` : ''}${deadlift ? `\n• Deadlift: +${Math.round(deadlift.estimated1RM * 0.1)}kg (10%) possible en 6-8 semaines` : ''}\n\nPour atteindre ça:\n→ Consistency: 4 séances/semaine\n→ Progression linéaire: +2.5kg/séance\n→ Sleep: 8h minimum\n\nT'es sur la bonne route! 🚀`;

          return response;
        }
      },
      {
        keywords: ['variation', 'nouveau', 'exercice', 'changer', 'ennuyé', 'monotone'],
        generate: () => {
          return `🔄 OUI! Les variations c'est VITAL! Ça:\n\n✅ Stimule les muscles différemment\n✅ Casse les plateaux\n✅ Prévient les blessures\n✅ Tue la monotonie!\n\n💪 VARIATIONS À ESSAYER:\n\nPOUR CHEST:\n• Incline DB Press (+force haut chest)\n• Floor Press (core engagement)\n• Close-Grip Bench (+triceps)\n\nPOUR BACK:\n• Cable Rows (angle different)\n• T-Bar Rows (isolation)\n• Pendulum Rows (moins lourd, plus safe)\n\nPOUR LEGS:\n• Bulgarian Split Squats (unilatéral)\n• Leg Press (moins technique)\n• Front Squat (quad focus)\n\n🎯 HACK:\nAjoute 1 variation par semaine. Change tous les 4-6 semaines!\n\nLe muscle s'adapte = besoin de le surprendre! 🔥`;
        }
      },
      {
        keywords: ['objectif', 'but', 'cible', 'viser', 'atteindre'],
        generate: () => {
          const benchObj = objectives.benchMax || 100;
          const squatObj = objectives.squatMax || 120;
          const deadliftObj = objectives.deadliftMax || 150;
          const bench = stats.exerciseStats['bench-press'];

          return `🎯 TES OBJECTIFS:\n\n💪 BENCH: ${benchObj}kg${bench ? ` (actuellement ${bench.estimated1RM}kg)` : ''}\n🦵 SQUAT: ${squatObj}kg\n⚫ DEADLIFT: ${deadliftObj}kg\n\n⏰ TIMELINE RÉALISTE:\n${bench ? `• Bench: ${Math.max(2, Math.round((benchObj - bench.estimated1RM) / 2.5))} semaines` : '• Bench: 6-8 semaines'}\n• Squat: 8-12 semaines\n• Deadlift: 6-10 semaines\n\n(Avec progression +2.5kg/semaine)\n\n🔑 LA FORMULE:\n1. Séances régulières (4/semaine)\n2. Progression linéaire (+2.5kg)\n3. Sleep 8h+\n4. Protéines 1g/kg\n5. Patience\n\nTu les VAS atteindre! Juste sois consistent! 💪🔥`;
        }
      },
      {
        keywords: ['nutrition', 'manger', 'protéine', 'calories', 'diet'],
        generate: () => {
          return `🥗 NUTRITION = 50% DE TA PROGRESSION!\n\n📊 MACROS DE BASE:\n• Protéines: 1g par kg bodyweight\n• Carbs: 4-6g par kg (pré/post workout)\n• Graisses: 1-1.5g par kg\n• Calories: Maintenance +300 (bulk) ou -300 (cut)\n\n🍗 SOURCES PRO:\n✅ Chicken, beef, fish, eggs, greek yogurt\n✅ Riz, pâtes, avoine (carbs)\n✅ Olive oil, nuts, avocado (fats)\n\n⏰ TIMING CLÉS:\n• PRE: Carbs + petite protéine (-2h)\n• POST: Protéines + carbs rapides (+1h)\n• BEFORE BED: Casein ou cottage cheese\n\n💧 HYDRATION:\n2-3L eau/jour MINIMUM\nAjoute electrolytes si tu sues beaucoup\n\n💡 PRO TIP:\nNutrition beats supplements EVERY TIME!\nNo magic pills, just consistency. 🔥`;
        }
      }
    ];

    const matchedResponse = responses.find(r =>
      r.keywords.some(keyword => userMsg.includes(keyword))
    );

    if (matchedResponse) {
      return matchedResponse.generate();
    }

    return `💭 Bonne question!\n\nJ'ai analysé tes ${stats.totalSessions} séances (${Math.round(stats.totalVolume / 1000)}k kg).\n\n🤔 Pour mieux t'aider, dis-moi:\n• Tu veux progresser plus vite?\n• Tu te sens fatigué?\n• Un exercice où tu galères?\n• Tu veux changer tes lifts?\n• Question nutrition?\n\nPlus de détails = meilleur coaching! 🎯`;
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

    setTimeout(() => {
      const coachResponse = generateCoachResponse(input);
      const assistantMessage = {
        id: messages.length + 2,
        role: 'assistant',
        text: coachResponse
      };

      setMessages(prev => [...prev, assistantMessage]);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-gray-800 p-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-xl">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black">Coach IA 🔥</h1>
            <p className="text-xs text-gray-400">Analyse temps réel de tes données</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-3 rounded-xl whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                  : 'bg-gray-800/50 border border-gray-700 text-gray-100'
              }`}
              style={{ wordBreak: 'break-word' }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800/50 border border-gray-700 px-4 py-3 rounded-xl text-gray-400 flex gap-2">
              <span>Coach analyse...</span>
              <div className="flex gap-1 animate-pulse">
                <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 p-4 bg-gray-900/50 backdrop-blur">
        <div className="flex gap-3 mb-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pose ta question (progresser, fatigue, lifts, nutrition...)"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-lg px-4 py-3 transition font-bold"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500">💡 Sois spécifique pour un meilleur coaching!</p>
      </div>
    </div>
  );
}