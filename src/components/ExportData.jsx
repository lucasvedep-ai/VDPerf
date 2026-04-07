import { Download, Save } from 'lucide-react';

export default function ExportData({ store }) {
  const handleExportJSON = () => {
    const data = {
      sessions: store.sessions,
      exportDate: new Date().toISOString(),
      appVersion: '2.0'
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vdperf-backup-${new Date().getTime()}.json`;
    link.click();
  };

  const handleSaveToStorage = () => {
    localStorage.setItem('vdperf_backup', JSON.stringify({
      sessions: store.sessions,
      timestamp: new Date().toISOString()
    }));
    alert('✅ Données sauvegardées!');
  };

  const handleExportCSV = () => {
    let csv = 'Date,Programme,Exercice,Sets,Reps,Poids,RPE\n';
    
    store.sessions.forEach(session => {
      session.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
          csv += `${session.date},${session.planId},${exercise.exerciseId},${set.setNumber},${set.reps},${set.weight},${set.rpe}\n`;
        });
      });
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vdperf-export-${new Date().getTime()}.csv`;
    link.click();
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 space-y-3">
      <h3 className="font-bold text-white mb-4">📊 Exporter les données</h3>
      
      <button
        onClick={handleSaveToStorage}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded flex items-center justify-center gap-2 transition"
      >
        <Save className="w-4 h-4" /> Sauvegarder
      </button>

      <button
        onClick={handleExportJSON}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex items-center justify-center gap-2 transition"
      >
        <Download className="w-4 h-4" /> Export JSON
      </button>

      <button
        onClick={handleExportCSV}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded flex items-center justify-center gap-2 transition"
      >
        <Download className="w-4 h-4" /> Export CSV
      </button>
    </div>
  );
}