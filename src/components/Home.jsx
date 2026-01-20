import { useState, useEffect } from 'react';
import { useProducts, useEntries } from '../hooks/useDatabase';
import db from '../services/database';
import AddEntryModal from './AddEntryModal';

export default function Home() {
  const { products } = useProducts();
  const { entries } = useEntries();
  const [stats, setStats] = useState(null);
  const [showAddEntry, setShowAddEntry] = useState(false);

  useEffect(() => {
    loadStats();
  }, [entries]);

  const loadStats = async () => {
    const data = await db.getStats();
    setStats(data);
  };

  const recentEntries = entries.slice(0, 5);
  const topEffects = stats?.effects
    ? Object.entries(stats.effects)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
    : [];

  return (
    <div className="p-4 space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-600">{entries.length}</div>
          <div className="text-sm text-gray-600">Journal Entries</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-600">{products.length}</div>
          <div className="text-sm text-gray-600">Products Tracked</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="space-y-2">
          <button
            onClick={() => setShowAddEntry(true)}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <span>📝</span>
            <span>New Journal Entry</span>
          </button>
        </div>
      </div>

      {/* Top Effects */}
      {topEffects.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-3">Your Most Common Effects</h2>
          <div className="space-y-2">
            {topEffects.map(([effect, count]) => (
              <div key={effect} className="flex items-center justify-between">
                <span className="text-gray-700 capitalize">{effect.replace('_', ' ')}</span>
                <span className="text-sm text-gray-500">{count} times</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Entries */}
      {recentEntries.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-3">Recent Entries</h2>
          <div className="space-y-3">
            {recentEntries.map(entry => {
              const product = products.find(p => p.id === entry.productId);
              return (
                <div key={entry.id} className="border-l-4 border-primary-500 pl-3">
                  <div className="font-medium">{product?.name || 'Unknown Product'}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(entry.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-lg">
                        {i < (entry.rating || 0) ? '⭐' : '☆'}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Welcome message if no entries */}
      {entries.length === 0 && (
        <div className="card text-center py-8">
          <div className="text-5xl mb-4">🌿</div>
          <h2 className="text-xl font-semibold mb-2">Welcome to Cannabis Journal!</h2>
          <p className="text-gray-600 mb-4">
            Start tracking your cannabis journey by adding your first journal entry.
          </p>
          <button
            onClick={() => setShowAddEntry(true)}
            className="btn-primary"
          >
            Create First Entry
          </button>
        </div>
      )}

      {showAddEntry && (
        <AddEntryModal onClose={() => setShowAddEntry(false)} />
      )}
    </div>
  );
}
