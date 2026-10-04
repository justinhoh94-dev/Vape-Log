// Goal-based taste profile.
//
// Every session is scored against the user's goal (effects they want vs. effects they
// want to avoid). Each cannabinoid/terpene is then compared across sessions: do sessions
// with more of it score better or worse, and which effects show up more often with it?
//
// Compound amounts are normalised per compound (amount / highest amount seen in logged
// products), so 25% THC and 0.8% limonene are on the same 0–1 scale.

import { EFFECTS, CANNABINOIDS, TERPENES } from '../data/constants.js';

export const MIN_ENTRIES = 3;
const DEFAULT_INTENSITY = 2;
const MAX_INTENSITY = 3;
// Pseudo-sessions used to shrink associations toward zero when evidence is thin.
const SHRINK = 3;
// Lifts below this are treated as noise when listing links.
const NOTABLE_LIFT = 0.15;

const COMPOUND_GROUPS = [
  { key: 'cannabinoids', list: CANNABINOIDS },
  { key: 'terpenes', list: TERPENES }
];

// 0..1 strength of each effect in an entry. Older entries have no intensity, so count
// them as moderate.
export function effectLevels(entry) {
  const levels = {};
  (entry.effects || []).forEach(id => {
    const intensity = entry.effectIntensity?.[id] ?? DEFAULT_INTENSITY;
    levels[id] = Math.min(intensity, MAX_INTENSITY) / MAX_INTENSITY;
  });
  return levels;
}

// -1 (all avoided effects at full strength, nothing wanted) .. +1 (the opposite).
export function goalScore(entry, goal) {
  const levels = effectLevels(entry);
  const avg = ids => (ids.length ? ids.reduce((s, id) => s + (levels[id] || 0), 0) / ids.length : 0);
  return avg(goal.want) - avg(goal.avoid);
}

function hasData(values) {
  return Object.values(values || {}).some(v => v > 0);
}

// Per compound, the highest amount among products that report it.
function compoundMaxima(products) {
  const maxima = {};
  products.forEach(product => {
    COMPOUND_GROUPS.forEach(({ key }) => {
      Object.entries(product[key] || {}).forEach(([id, value]) => {
        const v = Number(value) || 0;
        if (v > (maxima[id] || 0)) maxima[id] = v;
      });
    });
  });
  return maxima;
}

// Normalised 0..1 amounts for a product. A whole group (e.g. terpenes) is left out when
// the product has no lab data for it, so "unknown" is not mistaken for "none".
function normalisedAmounts(product, maxima) {
  const amounts = {};
  COMPOUND_GROUPS.forEach(({ key, list }) => {
    if (!hasData(product[key])) return;
    list.forEach(({ id }) => {
      if (!maxima[id]) return;
      amounts[id] = (Number(product[key][id]) || 0) / maxima[id];
    });
  });
  return amounts;
}

function confidenceLabel(n) {
  if (n >= 6) return 'high';
  if (n >= 3) return 'medium';
  return 'low';
}

// Weighted mean of y using weight w minus weighted mean using (1 - w): how much higher y
// tends to be when the compound is high vs. low. Shrunk toward 0 when evidence is thin.
function contrast(samples, getY) {
  let hiW = 0, hiY = 0, loW = 0, loY = 0;
  samples.forEach(s => {
    const y = getY(s);
    hiW += s.amount; hiY += s.amount * y;
    loW += 1 - s.amount; loY += (1 - s.amount) * y;
  });
  if (hiW === 0 || loW === 0) return { lift: 0, evidence: 0 };
  const evidence = Math.min(hiW, loW);
  const raw = hiY / hiW - loY / loW;
  return { lift: raw * (evidence / (evidence + SHRINK)), evidence };
}

export function buildProfile(entries, products, goal) {
  const productById = Object.fromEntries(products.map(p => [p.id, p]));
  const maxima = compoundMaxima(products);
  const trackedEffects = [...new Set([...goal.want, ...goal.avoid])];

  const sessions = entries
    .filter(e => productById[e.productId])
    .map(entry => ({
      entry,
      product: productById[entry.productId],
      score: goalScore(entry, goal),
      levels: effectLevels(entry),
      amounts: normalisedAmounts(productById[entry.productId], maxima)
    }));

  const baseline = {
    score: mean(sessions.map(s => s.score)),
    effects: Object.fromEntries(trackedEffects.map(id => [id, mean(sessions.map(s => s.levels[id] || 0))]))
  };

  const compounds = [];
  COMPOUND_GROUPS.forEach(({ key, list }) => {
    list.forEach(info => {
      const samples = sessions
        .filter(s => s.amounts[info.id] !== undefined)
        .map(s => ({ ...s, amount: s.amounts[info.id] }));
      const { lift, evidence } = contrast(samples, s => s.score);
      if (evidence === 0) return;

      const effectLinks = trackedEffects
        .map(effectId => ({
          effectId,
          kind: goal.want.includes(effectId) ? 'want' : 'avoid',
          ...contrast(samples, s => s.levels[effectId] || 0)
        }))
        .filter(link => Math.abs(link.lift) >= NOTABLE_LIFT);

      compounds.push({
        id: info.id,
        name: info.name,
        group: key,
        info,
        goalLift: lift,
        evidence,
        confidence: confidenceLabel(evidence),
        sessions: samples.length,
        // Effects this compound tends to bring on / reduce for you.
        brings: effectLinks.filter(l => l.lift > 0).sort((a, b) => b.lift - a.lift),
        reduces: effectLinks.filter(l => l.lift < 0).sort((a, b) => a.lift - b.lift)
      });
    });
  });
  compounds.sort((a, b) => b.goalLift - a.goalLift);
  const compoundById = Object.fromEntries(compounds.map(c => [c.id, c]));

  const productSummaries = products.map(product => {
    const own = sessions.filter(s => s.product.id === product.id);
    const amounts = normalisedAmounts(product, maxima);
    const predicted = predictFromCompounds(amounts, compoundById, baseline.score, c => c.goalLift);

    // Trust the product's own track record more as sessions accumulate.
    const w = own.length / (own.length + 2);
    const actual = own.length ? mean(own.map(s => s.score)) : null;
    const expected = actual === null ? predicted : w * actual + (1 - w) * predicted;

    const avoidRisks = goal.avoid
      .map(effectId => {
        const observed = own.length ? mean(own.map(s => s.levels[effectId] || 0)) : null;
        const predictedRisk = clamp01(predictFromCompounds(amounts, compoundById, baseline.effects[effectId] || 0,
          c => c.brings.concat(c.reduces).find(l => l.effectId === effectId)?.lift || 0));
        const risk = observed === null ? predictedRisk : w * observed + (1 - w) * predictedRisk;
        return { effectId, risk };
      })
      .filter(r => r.risk >= 0.25)
      .sort((a, b) => b.risk - a.risk);

    return {
      product,
      sessions: own.length,
      actualScore: actual,
      expectedScore: expected,
      basis: own.length ? 'history' : Object.keys(amounts).length ? 'lab' : 'none',
      avoidRisks
    };
  });
  productSummaries.sort((a, b) => b.expectedScore - a.expectedScore);

  return {
    enoughData: sessions.length >= MIN_ENTRIES,
    sessionCount: sessions.length,
    baseline,
    compounds,
    helpers: compounds.filter(c => c.goalLift >= NOTABLE_LIFT / 2),
    triggers: compounds.filter(c => c.goalLift <= -NOTABLE_LIFT / 2).reverse(),
    products: productSummaries,
    avoidFrequency: goal.avoid
      .map(effectId => ({ effectId, rate: sessions.filter(s => s.levels[effectId]).length / (sessions.length || 1) }))
      .filter(f => f.rate > 0)
      .sort((a, b) => b.rate - a.rate)
  };
}

// Baseline plus the amount-weighted average lift of the compounds the product contains.
function predictFromCompounds(amounts, compoundById, base, getLift) {
  let weight = 0, total = 0;
  Object.entries(amounts).forEach(([id, amount]) => {
    const c = compoundById[id];
    if (!c || amount === 0) return;
    const w = amount * (c.evidence / (c.evidence + SHRINK));
    weight += w;
    total += w * getLift(c);
  });
  return weight ? base + total / weight : base;
}

export function effectInfo(id) {
  return EFFECTS.find(e => e.id === id);
}

function mean(values) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}
