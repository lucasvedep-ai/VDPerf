import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import ExportData from './ExportData.jsx';

export default function ObjectivesPage({ store }) {
  const [objectives, setObjectives] = useState(() => {
    const saved = localStorage.getItem('vdperf_objectives');
    return saved ? JSON.parse(saved) : {
      benchPress: { current: 75, target: 100, unit: 'kg' },
      squat: { current: 90, target: 140, unit: 'kg' },
      deadlift: { current: 130, target: 180, unit: 'kg' },
      bodyweight: { current: 82, target: 80, unit: 'kg' },
    };
  });

  const handleUpdate = (key, field, value) => {
    const updated = {
      ...objectives,
      [key]: { ...objectives[key], [field]: parseFloat(value) || 0 }
    };
    setObjectives(updated);
    localStorage.setItem('vdperf_objectives', JSON.stringify(updated));
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <ChevronLeft className="w-6 h-6 mr-2 cursor-pointer" />
        <h1 className="text-3xl font-bold">Objectifs</h1>
      </div>

      <div className="space-y-6">
        {Object.entries(objectives).map(([key, obj]) => (
          <div key={key} className="bg-gray-900 rounded-lg p-5 border border-gray-800">
            <h3 className="text-lg font-bold mb-4 capitalize">
              {key.replace(/([A-Z])/g, ' $1')}
            </h3>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs text-gray-400">Actuel</label>
                <input
                  type="number"
                  step="0.5"
                  value={obj.current}
                  onChange={(e) => handleUpdate(key, 'current', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Cible</label>
                <input
                  type="number"
                  step="0.5"
                  value={obj.target}
                  onChange={(e) => handleUpdate(key, 'target', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Restant</label>
                <div className="bg-blue-600 rounded px-3 py-2 mt-1 text-white font-bold text-center">
                  +{(obj.target - obj.current).toFixed(1)}
                </div>
              </div>
            </div>

            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((obj.current / obj.target) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              {((obj.current / obj.target) * 100).toFixed(0)}% d'avancement
            </div>
          </div>
        ))}
      </div>

      {/* Export section */}
      <div className="mt-8">
        <ExportData store={store} />
      </div>
    </div>
  );
}