import { LayoutDashboard, Dumbbell, BarChart2, Settings } from 'lucide-react';

export default function Navigation({ view, setView }) {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'program', label: 'Programme', icon: Dumbbell },
    { id: 'analytics', label: 'Stats', icon: BarChart2 },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex safe-area-inset-bottom max-w-md mx-auto">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = view === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex flex-col items-center justify-center py-3 flex-1 transition ${
              isActive
                ? 'text-blue-400 border-t-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
