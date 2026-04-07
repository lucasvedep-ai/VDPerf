import { LayoutDashboard, Calendar, Target, Dumbbell, BarChart2, MessageCircle } from 'lucide-react';

export default function Navigation({ view, setView }) {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendrier', icon: Calendar },
    { id: 'objectives', label: 'Objectifs', icon: Target },
    { id: 'program', label: 'Programme', icon: Dumbbell },
    { id: 'analytics', label: 'Stats', icon: BarChart2 },
    { id: 'coach', label: 'Coach', icon: MessageCircle },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex safe-area-inset-bottom max-w-md mx-auto overflow-x-auto">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = view === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex flex-col items-center justify-center py-3 px-2 transition flex-shrink-0 ${
              isActive
                ? 'text-blue-400 border-t-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-xs text-center whitespace-nowrap">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}