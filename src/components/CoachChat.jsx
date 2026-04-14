import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Send, Zap } from 'lucide-react';
import { exercises } from '../data/exercises.js';
import { estimate1RM } from '../utils/calculations.js';

export default function CoachChat({ store }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: "🔥 Yo! Je suis ton Coach IA. Je vais analyser tes données et t'aider à progresser!\n\nJe peux:\n💪 Analyser ta progression\n🎯 Adapter ton programme\n📈 Prédire tes futurs lifts\n🔄 Suggérer des variations\n\nPose-moi une question! 🏋️"
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

  const analyzeUserData = () => {
    const completed = (store.sessions || []).filter(s => s?.status === 'completed') || [];
    
    const stats = {
      totalSessions: completed.length,
      totalVolume: completed.reduce((sum, s) => {
        return sum + (s.exercises || []).reduce((exSum, ex) => {
          return exSum + (ex.sets || []).reduce((setSum, set) => {
            return setSum + (set.weight || 0) * (set.reps || 0);
          }, 0);
        }, 0);
      }, 0),
      exerciseStats: {},
    };

    exercises.forEach(ex => {
      const exSets = completed
        .flatMap(s => s.exercises || [])
        .filter(e => e.exerciseId === ex.id)
        .flatMap(e => e.sets || []);
      
      if (exSets.length > 0) {
        const maxEstimate1RM = Math.max(...exSets.map(s => estimate1RM(s.weight, s.reps)));
        stats.exerciseStats[ex.id] = {
          name: ex.name,
          sets: exSets.length,
          estimated1RM: Math.round(maxEstimate1RM)
        };
      }
    });

    return stats;
  };

  const generateCoachResponse = (userMessage) => {
    const stats = analyzeUserData();
    const userMsg = userMessage.toLowerCase();

    if (userMsg.includes('progress') || userMsg.includes('augment') || userMsg.includes('améliorer')) {
      return `📊 Tu as ${stats.totalSessions} séances complétées avec ${Math.round(stats.totalVolume / 1000)}k kg levés!\n\n💪 Continue progressivement +2.5kg/semaine. Consistency = clé du succès! 🔥`;
    }

    if (userMsg.includes('fatigué') || userMsg.includes('fatigue') || userMsg.includes('repos')) {
      return `🛑 Prends du repos! Dors 8-9h, hydrate-toi bien, et reviens plus fort! 💪`;
    }

    if (userMsg.includes('bench') || userMsg.includes('squat') || userMsg.includes('deadlift')) {
      return `📈 Tes Big 3:\n${Object.values(stats.exerciseStats).filter(e => e.name.includes('Bench') || e.name.includes('Squat') || e.name.includes('Deadlift')).map(e => `• ${e.name}: ~${e.estimated1RM}kg`).join('\n')}\n\nTu progresseras! Keep grinding! 🏋️`;
    }

    return `💭 Bonne question!\n\nTu as ${stats.totalSessions} séances. Dis-moi:\n• Veux-tu progresser?\n• Tu es fatigué?\n• Question sur un lift?\n• Nutrition?\n\nJe suis là pour t'aider! 🎯`;
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
      <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-gray-800 p-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-xl">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black">Coach IA 🔥</h1>
            <p className="text-xs text-gray-400">Analyse temps réel</p>
          </div>
        </div>
      </div>

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

      <div className="border-t border-gray-800 p-4 bg-gray-900/50 backdrop-blur">
        <div className="flex gap-3 mb-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pose ta question..."
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
      </div>
    </div>
  );
}