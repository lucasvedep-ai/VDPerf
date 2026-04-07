import { useState } from 'react';
import { ChevronLeft, Play } from 'lucide-react';
import { planMap, planOrder } from '../data/workoutPlans.js';
import { exerciseMap } from '../data/exercises.js';
import { bonusSessionTemplates } from '../data/bonusTemplates.js';
import SessionPreview from './SessionPreview.jsx';

export default function ProgramPage({ store }) {
  const [activeTab, setActiveTab] = useState('standard');
  const [previewSession, setPreviewSession] = useState(null);

  if (!store) {
    console.error('ProgramPage: store is undefined!');
    return <div className="p-6 text-red-400">Erreur: store non disponible</div>;
  }

  if (previewSession) {
    return (
      <SessionPreview
        session={previewSession}
        store={store}
        onStart={(session) => {
          console.log('📱 ProgramPage onStart called with:', session);
          try {
            const sessionId = session.id || session.planId || `session-${Date.now()}`;
            store.startSession(sessionId, session);
            console.log('✅ Session started successfully');
          } catch (error) {
            console.error('❌ Error starting session:', error);
          }
        }}
        onBack={() => setPreviewSession(null)}
      />
    );
  }

  return (
    <div className="p-6 pb-20">
      <div className="flex items-center mb-6">
        <ChevronLeft className="w-6 h-6 mr-2 cursor-pointer hover:text-blue-400" />
        <h1 className="text-3xl font-bold">Mon Programme</h1>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setActiveTab('standard')}
          className={`flex-1 py-2 rounded font-bold transition ${
            activeTab === 'standard'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Standard
        </button>
        <button
          onClick={() => setActiveTab('bonus')}
          className={`flex-1 py-2 rounded font-bold transition ${
            activeTab === 'bonus'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Bonus ({bonusSessionTemplates.length})
        </button>
      </div>

      {activeTab === 'standard' && (
        <div className="space-y-4">
          {planOrder.map((planId) => {
            const plan = planMap[planId];
            return (
              <div key={planId} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <h3 className="text-lg font-bold mb-1 text-white">{plan.name}</h3>
                <p className="text-sm text-gray-400 mb-4">Focus: {plan.focus}</p>
                
                <div className="space-y-2 mb-4">
                  {plan.exercises.map((ex, idx) => {
                    const exercise = exerciseMap[ex.exerciseId];
                    return (
                      <div key={idx} className="bg-gray-800 rounded px-3 py-2 text-sm">
                        <div className="font-bold text-white">{exercise?.name}</div>
                        <div className="text-gray-400">
                          {ex.sets}x{ex.reps} @ RPE {ex.rpe}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPreviewSession(plan)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex items-center justify-center gap-2 transition font-bold"
                >
                  <Play className="w-4 h-4" /> Lancer
                </button>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'bonus' && (
        <div className="space-y-4">
          {bonusSessionTemplates.map((template) => (
            <div key={template.id} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <h3 className="text-lg font-bold mb-1 text-white">{template.name}</h3>
              <p className="text-xs text-gray-400 mb-4">{template.description}</p>
              
              <div className="space-y-2 mb-4">
                {template.exercises.map((ex, idx) => {
                  const exercise = exerciseMap[ex.exerciseId];
                  return (
                    <div key={idx} className="bg-gray-800 rounded px-3 py-2 text-sm">
                      <div className="font-bold text-white">{exercise?.name}</div>
                      <div className="text-gray-400">
                        {ex.sets}x{ex.reps} @ RPE {ex.rpe}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setPreviewSession(template)}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded flex items-center justify-center gap-2 transition font-bold"
              >
                <Play className="w-4 h-4" /> Lancer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}