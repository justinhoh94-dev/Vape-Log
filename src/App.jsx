import { useState, useEffect } from 'react';
import { useDatabase } from './hooks/useDatabase';
import Home from './components/Home';
import Products from './components/Products';
import Journal from './components/Journal';
import Insights from './components/Insights';
import BottomNav from './components/BottomNav';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const isReady = useDatabase();

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      <header className="bg-primary-600 text-white sticky top-0 z-10 shadow-lg">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>🌿</span>
            <span>Cannabis Journal</span>
          </h1>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        {currentView === 'home' && <Home />}
        {currentView === 'products' && <Products />}
        {currentView === 'journal' && <Journal />}
        {currentView === 'insights' && <Insights />}
      </main>

      <BottomNav currentView={currentView} onNavigate={setCurrentView} />
    </div>
  );
}

export default App;
