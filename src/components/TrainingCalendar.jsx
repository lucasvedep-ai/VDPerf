import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function TrainingCalendar({ store }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Récupère les sessions complétées
  const completed = (store.sessions || []).filter(s => s?.status === 'completed') || [];

  // Crée une map: YYYY-MM-DD → session
  const sessionsByDate = useMemo(() => {
    const map = {};
    completed.forEach(session => {
      const date = session.date; // Format: YYYY-MM-DD
      if (date) {
        map[date] = session;
      }
    });
    return map;
  }, [completed]);

  // Détermine le type d'entraînement (Upper/Lower)
  const getSessionType = (session) => {
    if (!session) return null;
    
    const planId = session.planId || '';
    const planName = session.planName || '';
    
    // Check planId
    if (planId.includes('upper') || planName.includes('Upper')) return 'upper';
    if (planId.includes('lower') || planName.includes('Lower')) return 'lower';
    
    return 'other';
  };

  // Couleurs
  const getColor = (type) => {
    switch (type) {
      case 'upper': return 'bg-blue-600 text-white'; // Bleu pour Upper
      case 'lower': return 'bg-orange-600 text-white'; // Orange pour Lower
      default: return 'bg-gray-700 text-white';
    }
  };

  const getDayLabel = (type) => {
    switch (type) {
      case 'upper': return '💪 Upper';
      case 'lower': return '🦵 Lower';
      default: return '🏋️';
    }
  };

  // Calcule les jours du mois
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];

  // Jours vides avant le début du mois
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Jours du mois
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  // Statistiques du mois
  const monthStats = useMemo(() => {
    let upperCount = 0;
    let lowerCount = 0;
    let totalSessions = 0;

    Object.values(sessionsByDate).forEach(session => {
      const type = getSessionType(session);
      totalSessions++;
      if (type === 'upper') upperCount++;
      if (type === 'lower') lowerCount++;
    });

    return { upperCount, lowerCount, totalSessions };
  }, [sessionsByDate]);

  return (
    <div className="p-6 pb-20">
      <div className="flex items-center mb-6">
        <ChevronLeft className="w-6 h-6 mr-2 cursor-pointer hover:text-blue-400" />
        <h1 className="text-3xl font-bold">📅 Calendrier</h1>
      </div>

      {/* Statistiques du mois */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-3">
          <p className="text-xs text-gray-400">Upper</p>
          <p className="text-2xl font-bold text-blue-400">{monthStats.upperCount}</p>
        </div>
        <div className="bg-orange-900/30 border border-orange-600 rounded-lg p-3">
          <p className="text-xs text-gray-400">Lower</p>
          <p className="text-2xl font-bold text-orange-400">{monthStats.lowerCount}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
          <p className="text-xs text-gray-400">Total</p>
          <p className="text-2xl font-bold text-white">{monthStats.totalSessions}</p>
        </div>
      </div>

      {/* Calendrier */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        {/* Header mois */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrevMonth}
            className="hover:bg-gray-800 p-2 rounded transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h2 className="text-xl font-bold">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          
          <button
            onClick={handleNextMonth}
            className="hover:bg-gray-800 p-2 rounded transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-bold text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Grille des jours */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="aspect-square" />;
            }

            const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const session = sessionsByDate[dateStr];
            const type = session ? getSessionType(session) : null;

            return (
              <div
                key={day}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg border-2 transition cursor-pointer hover:scale-105 ${
                  session
                    ? `${getColor(type)} border-transparent font-bold shadow-lg`
                    : 'bg-gray-800 border-gray-700 text-gray-400 text-sm'
                }`}
                title={session ? session.planName : ''}
              >
                <span className="text-sm">{day}</span>
                {session && (
                  <span className="text-xs mt-0.5 font-bold">
                    {type === 'upper' ? '💪' : type === 'lower' ? '🦵' : '🏋️'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Légende */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <span className="text-sm text-gray-400">Upper Body</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-600 rounded"></div>
          <span className="text-sm text-gray-400">Lower Body</span>
        </div>
      </div>

      {/* Stats détaillées */}
      <div className="mt-6 bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h3 className="font-bold mb-4 text-white">📊 Détails du mois</h3>
        <div className="space-y-2 text-sm">
          <p className="text-gray-400">
            <span className="font-bold text-blue-400">{monthStats.upperCount}</span> séances Upper Body
          </p>
          <p className="text-gray-400">
            <span className="font-bold text-orange-400">{monthStats.lowerCount}</span> séances Lower Body
          </p>
          <p className="text-gray-400">
            Ratio: <span className="font-bold text-white">
              {monthStats.totalSessions > 0 
                ? `${Math.round((monthStats.upperCount / monthStats.totalSessions) * 100)}% Upper / ${Math.round((monthStats.lowerCount / monthStats.totalSessions) * 100)}% Lower`
                : 'N/A'
              }
            </span>
          </p>
          <p className="text-gray-400 mt-3">
            Total du mois: <span className="font-bold text-white text-lg">{monthStats.totalSessions}</span> séances
          </p>
        </div>
      </div>
    </div>
  );
}