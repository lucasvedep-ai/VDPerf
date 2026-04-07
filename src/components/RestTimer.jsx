export default function RestTimer({ timer }) {
  const { timeLeft, totalTime, stop, addTime } = timer;
  const progress = totalTime > 0 ? timeLeft / totalTime : 0;
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const dash = progress * circumference;

  return (
    <div className="fixed inset-0 bg-black/85 flex flex-col items-center justify-center z-50">
      <p className="text-gray-400 text-sm font-medium uppercase tracking-widest mb-8">Temps de repos</p>

      <div className="relative w-36 h-36">
        <svg className="transform -rotate-90 w-36 h-36">
          <circle cx="72" cy="72" r={r} stroke="#1f2937" strokeWidth="8" fill="none" />
          <circle
            cx="72"
            cy="72"
            r={r}
            stroke="#6366f1"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - dash}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.9s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold tabular-nums">
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="flex gap-3 mt-10">
        <button
          onClick={() => addTime(15)}
          className="bg-gray-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700"
        >
          +15s
        </button>
        <button
          onClick={stop}
          className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-500"
        >
          Passer
        </button>
        <button
          onClick={() => addTime(30)}
          className="bg-gray-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700"
        >
          +30s
        </button>
      </div>
    </div>
  );
}
