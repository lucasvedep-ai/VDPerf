import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';

export default function TrainingCalendar({ store }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const completed = (store.sessions || []).filter(s => s?.status === 'completed') || [];

  const sessionsByDate = useMemo(() => {
    const map = {};
    completed.forEach(session => {
      const date = session.date;
      if (date) map[date] = session;
    });
    return map;
  }, [completed]);

  const getSessionType = (session) => {
    if (!session) return null;
    const planId = session.planId || '';
    const planName = session.planName || '';
    if (planId.includes('upper') || planName.includes('Upper')) return 'upper';
    if (planId.includes('lower') || planName.includes('Lower')) return 'lower';
    return 'other';
  };

  const getColor = (type) => {
    switch (type) {
      case 'upper': return 'bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg shadow-blue-600/50';
      case 'lower': return 'bg-gradient-to-br from-orange-600 to-orange-500 shadow-lg shadow-orange-600/50';
      default: return 'bg-gradient-to-br from-gray-700 to-gray-600';
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

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
    <div className="p-6 pb-20 bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="flex items-center mb-8">
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-xl mr-3">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black">Calendrier</h1>
          <p className="text-xs text-gray-400">Visualise tes entraînements</p>
        </div>
      </div>

      {/* Stats du mois */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-400/10 border border-blue-500/50 rounded-xl p-4">
          <p className="text-xs text-gray-400 font-bold mb-1">Upper Body</p>
          <p className="text-3xl font-black text-blue-400">{monthStats.upperCount}</p>
          <p className="text-xs text-gray-400 mt-1">💪 séances</p>
        </div>

        <div className="bg-gradient-to-br from-orange-600/20 to-orange-400/10 border border-orange-500/50 rounded-xl p-4">
          <p className="text-xs text-gray-400 font-bold mb-1">Lower Body</p>
          <p className="text-3xl font-black text-orange-400">{monthStats.lowerCount}</p>
          <p className="text-xs text-gray-400 mt-1">🦵 séances</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-purple-400/10 border border-purple-500/50 rounded-xl p-4">
          <p className="text-xs text-gray-400 font-bold mb-1">Total</p>
          <p className="text-3xl font-black text-purple-400">{monthStats.totalSessions}</p>
          <p className="text-xs text-gray-400 mt-1">✅ complétées</p>
        </div>
      </div>

      {/* Calendrier */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
        {/* Header mois */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrevMonth}
            className="hover:bg-gray-800 p-2 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          
          <h2 className="text-xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          
          <button
            onClick={handleNextMonth}
            className="hover:bg-gray-800 p-2 rounded-lg transition"
          >
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-black text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Grille */}
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
                className={`aspect-square flex flex-col items-center justify-center rounded-lg border transition cursor-pointer hover:scale-105 ${
                  session
                    ? `${getColor(type)} text-white border-transparent font-bold`
                    : 'bg-gray-800/30 border-gray-700 text-gray-400 text-sm hover:bg-gray-800/50'
                }`}
                title={session ? session.planName : ''}
              >
                <span className="text-sm font-bold">{day}</span>
                {session && (
                  <span className="text-lg mt-0.5">
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
        <div className="flex items-center gap-2 p-3 bg-gray-900/50 rounded-lg border border-gray-800">
          <div className="w-4 h-4 bg-gradient-to-br from-blue-600 to-blue-500 rounded"></div>
          <span className="text-sm text-gray-400">Upper Body 💪</span>
        </div>
        <div className="flex items-center gap-2 p-3 bg-gray-900/50 rounded-lg border border-gray-800">
          <div className="w-4 h-4 bg-gradient-to-br from-orange-600 to-orange-500 rounded"></div>
          <span className="text-sm text-gray-400">Lower Body 🦵</span>
        </div>
      </div>

      {/* Stats détaillées */}
      <div className="mt-6 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-5">
        <h3 className="font-black mb-4 text-white flex items-center gap-2">
          📊 Détails du mois
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Séances Upper</span>
            <span className="font-black text-blue-400">{monthStats.upperCount}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1">
            <div
              className="bg-gradient-to-r from-blue-600 to-blue-400 h-1 rounded-full"
              style={{ width: monthStats.totalSessions > 0 ? `${(monthStats.upperCount / monthStats.totalSessions) * 100}%` : '0%' }}
            ></div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <span className="text-gray-400">Séances Lower</span>
            <span className="font-black text-orange-400">{monthStats.lowerCount}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1">
            <div
              className="bg-gradient-to-r from-orange-600 to-orange-400 h-1 rounded-full"
              style={{ width: monthStats.totalSessions > 0 ? `${(monthStats.lowerCount / monthStats.totalSessions) * 100}%` : '0%' }}
            ></div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-bold">Total du mois</span>
              <span className="text-2xl font-black text-purple-400">{monthStats.totalSessions}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}