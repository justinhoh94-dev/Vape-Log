import { useState, useEffect } from 'react';
import { useProducts } from '../hooks/useDatabase';
import recommendationService from '../services/recommendations';
import { CANNABINOIDS, TERPENES, STRAIN_TYPES } from '../data/constants';

export default function Insights() {
  const { products } = useProducts();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    const data = await recommendationService.getRecommendations();
    setRecommendations(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-2 animate-bounce">🧠</div>
          <p className="text-gray-600">Analyzing your data...</p>
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.recommendations.length === 0) {
    return (
      <div className="p-4">
        <div className="card text-center py-8">
          <div className="text-5xl mb-4">📊</div>
          <h2 className="text-xl font-semibold mb-2">Not Enough Data Yet</h2>
          <p className="text-gray-600">
            {recommendations?.message || 'Keep logging your experiences to get personalized insights!'}
          </p>
        </div>
      </div>
    );
  }

  const idealProfile = recommendationService.getIdealProfile(recommendations.preferences);

  return (
    <div className="p-4 space-y-4">
      {/* Tabs */}
      <div className="card">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Your Profile
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'recommendations'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Recommendations
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Overview */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-3">Your Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-primary-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">
                  {recommendations.stats.totalEntries}
                </div>
                <div className="text-xs text-gray-600">Total Entries</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {recommendations.stats.totalProducts}
                </div>
                <div className="text-xs text-gray-600">Products Tried</div>
              </div>
            </div>
          </div>

          {/* Favorite Effects */}
          {Object.keys(recommendations.preferences.favoriteEffects).length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-3">Your Most Common Effects</h2>
              <div className="space-y-2">
                {Object.entries(recommendations.preferences.favoriteEffects).map(([effect, count]) => (
                  <div key={effect} className="flex items-center justify-between">
                    <span className="text-gray-700 capitalize">{effect.replace('_', ' ')}</span>
                    <span className="text-sm bg-primary-100 text-primary-700 px-2 py-1 rounded">
                      {count} times
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Favorite Strain Type */}
          {recommendations.preferences.favoriteStrain && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-3">Favorite Strain Type</h2>
              <div className="text-center p-4">
                {(() => {
                  const strain = STRAIN_TYPES.find(s => s.id === recommendations.preferences.favoriteStrain);
                  return strain ? (
                    <>
                      <div
                        className="text-2xl font-bold mb-1 capitalize"
                        style={{ color: strain.color }}
                      >
                        {strain.name}
                      </div>
                      <div className="text-sm text-gray-600">{strain.description}</div>
                    </>
                  ) : null;
                })()}
              </div>
            </div>
          )}
        </>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <>
          <div className="card">
            <h2 className="text-lg font-semibold mb-3">Your Ideal Profile</h2>
            <p className="text-sm text-gray-600 mb-4">
              Based on your journal entries, here's what works best for you:
            </p>

            {/* Preferred Cannabinoids */}
            {idealProfile.cannabinoids.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Top Cannabinoids</h3>
                <div className="space-y-2">
                  {idealProfile.cannabinoids.map(cannabinoid => (
                    <div key={cannabinoid.id} className="border-l-4 border-primary-500 pl-3">
                      <div className="font-medium">{cannabinoid.name}</div>
                      <div className="text-xs text-gray-600">{cannabinoid.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preferred Terpenes */}
            {idealProfile.terpenes.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Top Terpenes</h3>
                <div className="space-y-2">
                  {idealProfile.terpenes.map(terpene => (
                    <div key={terpene.id} className="border-l-4 border-purple-500 pl-3">
                      <div className="font-medium">{terpene.name}</div>
                      <div className="text-xs text-gray-600">{terpene.aroma}</div>
                      <div className="text-xs text-gray-500">
                        {terpene.effects.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preferred Effects */}
            {idealProfile.effects.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Favorite Effects</h3>
                <div className="flex flex-wrap gap-2">
                  {idealProfile.effects.map(effect => (
                    <span
                      key={effect.id}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                    >
                      {effect.icon} {effect.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* What to Look For */}
          <div className="card bg-primary-50 border-primary-200">
            <h3 className="text-sm font-semibold text-primary-900 mb-2">💡 What to Look For</h3>
            <p className="text-sm text-primary-800">
              When shopping for new products, look for items that contain{' '}
              {idealProfile.cannabinoids.length > 0 && (
                <>
                  <strong>{idealProfile.cannabinoids.map(c => c.name).join(', ')}</strong>
                  {idealProfile.terpenes.length > 0 && ' and '}
                </>
              )}
              {idealProfile.terpenes.length > 0 && (
                <>
                  <strong>{idealProfile.terpenes.map(t => t.name).join(', ')}</strong>
                </>
              )}
              {idealProfile.strain && (
                <>
                  {'. Consider '}
                  <strong className="capitalize">{idealProfile.strain}</strong> strains.
                </>
              )}
            </p>
          </div>
        </>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <>
          <div className="card">
            <h2 className="text-lg font-semibold mb-2">Recommended Products</h2>
            <p className="text-sm text-gray-600 mb-4">
              Based on your preferences and past experiences
            </p>

            {recommendations.recommendations.slice(0, 5).map(({ product, score }) => {
              const productType = product.type;
              const strain = STRAIN_TYPES.find(s => s.id === product.strain);

              return (
                <div key={product.id} className="mb-3 p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold">{product.name}</h3>
                      {product.brand && (
                        <div className="text-xs text-gray-600">{product.brand}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-600">Match Score</div>
                      <div className="text-lg font-bold text-primary-600">
                        {Math.round((score / 50) * 100)}%
                      </div>
                    </div>
                  </div>

                  {strain && (
                    <span
                      className="inline-block px-2 py-1 rounded text-xs font-medium text-white mb-2"
                      style={{ backgroundColor: strain.color }}
                    >
                      {strain.name}
                    </span>
                  )}

                  {/* Cannabinoids */}
                  {product.cannabinoids && Object.keys(product.cannabinoids).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Object.entries(product.cannabinoids).map(([key, value]) => (
                        value > 0 && (
                          <span
                            key={key}
                            className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs"
                          >
                            {key.toUpperCase()}: {value}%
                          </span>
                        )
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="card bg-blue-50 border-blue-200">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">ℹ️ How Recommendations Work</h3>
            <p className="text-sm text-blue-800">
              Recommendations are based on your rating history, preferred cannabinoid and terpene
              profiles, and the effects you've enjoyed most. Keep logging entries to improve accuracy!
            </p>
          </div>
        </>
      )}
    </div>
  );
}
