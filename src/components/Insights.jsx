import { useState, useEffect, useCallback } from 'react';
import db from '../services/database';
import { buildProfile, effectInfo, MIN_ENTRIES } from '../services/profile';
import { EFFECTS, DEFAULT_GOAL, STRAIN_TYPES } from '../data/constants';

const TABS = [
  { id: 'goal', name: 'My Goal' },
  { id: 'profile', name: 'Profile' },
  { id: 'products', name: 'Products' }
];

function EffectChip({ id, tone = 'gray' }) {
  const effect = effectInfo(id);
  if (!effect) return null;
  const tones = {
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    gray: 'bg-gray-100 text-gray-700'
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tones[tone]}`}>
      {effect.icon} {effect.name}
    </span>
  );
}

function ConfidenceBadge({ level }) {
  const styles = {
    high: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-gray-100 text-gray-600'
  };
  return <span className={`px-2 py-0.5 rounded text-xs ${styles[level]}`}>{level} confidence</span>;
}

function matchLabel(score) {
  if (score >= 0.3) return { text: 'Great match', className: 'text-green-600' };
  if (score >= 0.1) return { text: 'Good match', className: 'text-green-500' };
  if (score > -0.1) return { text: 'Mixed', className: 'text-yellow-600' };
  return { text: 'Poor match', className: 'text-red-600' };
}

export default function Insights() {
  const [goal, setGoal] = useState(null);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  const load = useCallback(async () => {
    const [savedGoal, entries, products] = await Promise.all([
      db.getPreference('goal'),
      db.getAllEntries(),
      db.getAllProducts()
    ]);
    const currentGoal = savedGoal || DEFAULT_GOAL;
    setGoal(currentGoal);
    setData({ entries, products, profile: buildProfile(entries, products, currentGoal) });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Tap cycles an effect: neutral -> want -> avoid -> neutral.
  const cycleGoalEffect = async (effectId) => {
    const want = goal.want.filter(id => id !== effectId);
    const avoid = goal.avoid.filter(id => id !== effectId);
    if (goal.want.includes(effectId)) avoid.push(effectId);
    else if (!goal.avoid.includes(effectId)) want.push(effectId);
    const next = { want, avoid };
    setGoal(next);
    setData(prev => ({ ...prev, profile: buildProfile(prev.entries, prev.products, next) }));
    await db.setPreference('goal', next);
  };

  if (!data) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-2 animate-bounce">🧠</div>
          <p className="text-gray-600">Analyzing your data...</p>
        </div>
      </div>
    );
  }

  const { profile } = data;

  return (
    <div className="p-4 space-y-4">
      <div className="card">
        <div className="flex gap-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'goal' && <GoalTab goal={goal} onCycle={cycleGoalEffect} />}

      {activeTab !== 'goal' && !profile.enoughData && (
        <div className="card text-center py-8">
          <div className="text-5xl mb-4">📊</div>
          <h2 className="text-xl font-semibold mb-2">Not Enough Data Yet</h2>
          <p className="text-gray-600">
            Log at least {MIN_ENTRIES} sessions ({profile.sessionCount} so far). Record the bad sessions
            too: they show what to avoid.
          </p>
        </div>
      )}

      {activeTab === 'profile' && profile.enoughData && <ProfileTab profile={profile} />}
      {activeTab === 'products' && profile.enoughData && <ProductsTab profile={profile} />}
    </div>
  );
}

function GoalTab({ goal, onCycle }) {
  const groups = [
    { title: 'Head (cerebral)', effects: EFFECTS.filter(e => e.domain === 'mind') },
    { title: 'Body (physical)', effects: EFFECTS.filter(e => e.domain === 'body') }
  ];
  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-1">What do you want to feel?</h2>
      <p className="text-sm text-gray-600 mb-4">
        Tap an effect to mark it <span className="text-green-700 font-medium">want</span>, tap again
        for <span className="text-red-700 font-medium">avoid</span>, and once more to clear it. Every
        session is scored against this goal.
      </p>
      {groups.map(group => (
        <div key={group.title} className="mb-4">
          <div className="text-xs text-gray-600 font-medium mb-1">{group.title}</div>
          <div className="flex flex-wrap gap-2">
            {group.effects.map(effect => {
              const state = goal.want.includes(effect.id) ? 'want' : goal.avoid.includes(effect.id) ? 'avoid' : null;
              return (
                <button
                  key={effect.id}
                  type="button"
                  onClick={() => onCycle(effect.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    state === 'want'
                      ? 'bg-green-600 text-white'
                      : state === 'avoid'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {state === 'want' ? '✓ ' : state === 'avoid' ? '✕ ' : ''}
                  {effect.icon} {effect.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function CompoundRow({ compound, positive }) {
  const width = Math.min(100, Math.round(Math.abs(compound.goalLift) * 150));
  // Helpers: the wanted effects they bring and avoided effects they reduce.
  // Triggers: the avoided effects they bring.
  const links = compound.brings.filter(l => l.kind === (positive ? 'want' : 'avoid'));
  const relief = positive ? compound.reduces.filter(l => l.kind === 'avoid') : [];
  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between mb-1">
        <div>
          <span className="font-medium">{compound.name}</span>
          <span className="text-xs text-gray-500 ml-2">
            {compound.group === 'terpenes' ? compound.info.aroma : compound.info.description}
          </span>
        </div>
        <ConfidenceBadge level={compound.confidence} />
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full ${positive ? 'bg-green-500' : 'bg-red-500'}`}
          style={{ width: `${width}%` }}
        />
      </div>
      {links.length > 0 && (
        <div className="flex flex-wrap gap-1 items-center">
          <span className="text-xs text-gray-500">{positive ? 'Brings:' : 'Linked to:'}</span>
          {links.map(l => (
            <EffectChip key={l.effectId} id={l.effectId} tone={positive ? 'green' : 'red'} />
          ))}
        </div>
      )}
      {relief.length > 0 && (
        <div className="flex flex-wrap gap-1 items-center mt-1">
          <span className="text-xs text-gray-500">Fewer:</span>
          {relief.map(l => <EffectChip key={l.effectId} id={l.effectId} />)}
        </div>
      )}
      <div className="text-xs text-gray-400 mt-1">Seen in {compound.sessions} sessions</div>
    </div>
  );
}

function ProfileTab({ profile }) {
  const { helpers, triggers, avoidFrequency, sessionCount } = profile;
  return (
    <>
      <div className="card bg-primary-50 border-primary-200">
        <h3 className="text-sm font-semibold text-primary-900 mb-2">🛒 At the dispensary</h3>
        <p className="text-sm text-primary-800">
          {helpers.length > 0 ? (
            <>Look for <strong>{helpers.slice(0, 3).map(c => c.name).join(', ')}</strong>-forward products. </>
          ) : (
            <>No compound clearly helps yet. </>
          )}
          {triggers.length > 0 && (
            <>Go easy on <strong>{triggers.slice(0, 3).map(c => c.name).join(', ')}</strong>.</>
          )}
        </p>
        <p className="text-xs text-primary-700 mt-2">
          Based on {sessionCount} sessions. Ask for lab results (COA) so new products can be matched.
        </p>
      </div>

      {avoidFrequency.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-3">How often you get what you avoid</h2>
          <div className="space-y-2">
            {avoidFrequency.map(({ effectId, rate }) => (
              <div key={effectId} className="flex items-center gap-2">
                <div className="w-32 text-sm"><EffectChip id={effectId} tone="red" /></div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400" style={{ width: `${Math.round(rate * 100)}%` }} />
                </div>
                <span className="text-xs text-gray-600 w-10 text-right">{Math.round(rate * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold mb-1">✅ Works for you</h2>
        <p className="text-xs text-gray-500 mb-2">Sessions with more of these scored better against your goal.</p>
        {helpers.length ? helpers.map(c => <CompoundRow key={c.id} compound={c} positive />) : (
          <p className="text-sm text-gray-500">Nothing stands out yet.</p>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-1">⚠️ Your triggers</h2>
        <p className="text-xs text-gray-500 mb-2">Sessions with more of these scored worse, and the effects they're linked to.</p>
        {triggers.length ? triggers.map(c => <CompoundRow key={c.id} compound={c} positive={false} />) : (
          <p className="text-sm text-gray-500">Nothing stands out yet.</p>
        )}
      </div>

      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">ℹ️ How this works</h3>
        <p className="text-sm text-blue-800">
          Each session is scored by how strongly you felt the effects you want minus the ones you
          avoid. Each cannabinoid and terpene is compared across sessions with more versus less of it,
          relative to the highest amount you've logged, so terpenes are not drowned out by THC. Few
          sessions means low confidence: these are patterns in your own logs, not medical advice.
        </p>
      </div>
    </>
  );
}

function ProductsTab({ profile }) {
  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-1">Products ranked for your goal</h2>
      <p className="text-sm text-gray-600 mb-4">
        Products you've used are ranked mostly on your sessions; untried ones are predicted from their lab profile.
      </p>
      {profile.products.map(({ product, sessions, expectedScore, basis, avoidRisks }) => {
        const label = matchLabel(expectedScore);
        const strain = STRAIN_TYPES.find(s => s.id === product.strain);
        return (
          <div key={product.id} className="mb-3 p-3 border border-gray-200 rounded-lg">
            <div className="flex items-start justify-between mb-1">
              <div className="flex-1">
                <h3 className="font-semibold">{product.name}</h3>
                {product.brand && <div className="text-xs text-gray-600">{product.brand}</div>}
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold ${basis === 'none' ? 'text-gray-400' : label.className}`}>
                  {basis === 'none' ? 'Unknown' : label.text}
                </div>
                <div className="text-xs text-gray-500">
                  {basis === 'history'
                    ? `${sessions} session${sessions === 1 ? '' : 's'}`
                    : basis === 'lab'
                    ? 'Predicted from lab data'
                    : 'Add lab data to predict'}
                </div>
              </div>
            </div>
            {strain && (
              <span
                className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white mb-1"
                style={{ backgroundColor: strain.color }}
              >
                {strain.name}
              </span>
            )}
            {avoidRisks.length > 0 && (
              <div className="flex flex-wrap gap-1 items-center mt-1">
                <span className="text-xs text-gray-500">May cause:</span>
                {avoidRisks.map(r => <EffectChip key={r.effectId} id={r.effectId} tone="red" />)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
