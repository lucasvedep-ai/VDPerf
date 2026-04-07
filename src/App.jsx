import { useState } from 'react';
import { useWorkoutStore } from './hooks/useWorkoutStore.js';
import Navigation from './components/Navigation.jsx';
import Dashboard from './components/Dashboard.jsx';
import ActiveSession from './components/ActiveSession.jsx';
import Analytics from './components/Analytics.jsx';
import ObjectivesPage from './components/ObjectivesPage.jsx';
import ProgramPage from './components/ProgramPage.jsx';
import CoachChat from './components/CoachChat.jsx';
import TrainingCalendar from './components/TrainingCalendar.jsx';

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
        {view === 'calendar' && <TrainingCalendar store={store} />}
        {view === 'analytics' && <Analytics store={store} />}
        {view === 'objectives' && <ObjectivesPage store={store} />}
        {view === 'program' && <ProgramPage store={store} />}
        {view === 'coach' && <CoachChat store={store} />}
      </div>
      <Navigation view={view} setView={setView} />
    </div>
  );
}