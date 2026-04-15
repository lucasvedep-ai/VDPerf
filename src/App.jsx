import { useState } from 'react';
import { useWorkoutStore } from './hooks/useWorkoutStore.js';
import Navigation from './components/Navigation.jsx';
import Dashboard from './components/Dashboard.jsx';
import ActiveSession from './components/ActiveSession.jsx';
import Analytics from './components/Analytics.jsx';
import ProgramPage from './components/ProgramPage.jsx';
import SettingsPage from './components/SettingsPage.jsx';

export default function App() {
  const [view, setView] = useState('dashboard');
  const store = useWorkoutStore();

  if (store.activeSession) {
    return <ActiveSession store={store} onComplete={() => setView('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-md mx-auto pb-20">
        {view === 'dashboard' && <Dashboard store={store} />}
        {view === 'program' && <ProgramPage store={store} />}
        {view === 'analytics' && <Analytics store={store} />}
        {view === 'settings' && <SettingsPage store={store} />}
      </div>
      <Navigation view={view} setView={setView} />
    </div>
  );
}
