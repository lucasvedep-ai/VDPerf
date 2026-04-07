import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { planMap, planOrder } from '../data/workoutPlans.js';
import { bonusSessionTemplates } from '../data/bonusTemplates.js';
import SessionPreview from './SessionPreview.jsx';

export default function SessionSelector({ store, onSessionStart }) {
  const [selectedSession, setSelectedSession] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  if (showPreview && selectedSession) {
    return (
      <SessionPreview
        session={selectedSession}
        onStart={(session) => {
          store.startSession(session.id, session);
          onSessionStart();
        }}
        onBack={() => setShowPreview(false)}
      />
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Sélectionne ta séance</h2>

      {/* Standard Sessions */}
      <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Programmes Standards</h3>
      <div className="space-y-3 mb-8">
        {planOrder.map((planId) => {
          const plan = planMap[planId];
          return (
            <button
              key={planId}
              onClick={() => {
                setSelectedSession(plan);
                setShowPreview(true);
              }}
              className="w-full bg-gray-900 border-l-4 border-blue-600 p-4 rounded text-left hover:bg-gray-800 transition flex items-center justify-between"
            >
              <div>
                <div className="font-bold">{plan.name}</div>
                <div className="text-xs text-gray-400">{plan.focus}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          );
        })}
      </div>

      {/* Bonus Sessions */}
      <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Bonus ({bonusSessionTemplates.length})</h3>
      <div className="space-y-3">
        {bonusSessionTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => {
              setSelectedSession(template);
              setShowPreview(true);
            }}
            className="w-full bg-gray-900 border-l-4 border-amber-600 p-4 rounded text-left hover:bg-gray-800 transition flex items-center justify-between"
          >
            <div>
              <div className="font-bold">{template.name}</div>
              <div className="text-xs text-gray-400">{template.description}</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );
}