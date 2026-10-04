// Cannabinoids
export const CANNABINOIDS = [
  { id: 'thc', name: 'THC', fullName: 'Delta-9-tetrahydrocannabinol', description: 'Primary psychoactive compound' },
  { id: 'cbd', name: 'CBD', fullName: 'Cannabidiol', description: 'Non-psychoactive, therapeutic' },
  { id: 'cbn', name: 'CBN', fullName: 'Cannabinol', description: 'Mildly psychoactive, sedating' },
  { id: 'cbg', name: 'CBG', fullName: 'Cannabigerol', description: 'Non-psychoactive, antibacterial' },
  { id: 'thcv', name: 'THCV', fullName: 'Tetrahydrocannabivarin', description: 'Appetite suppressant' },
  { id: 'cbc', name: 'CBC', fullName: 'Cannabichromene', description: 'Anti-inflammatory' }
];

// Terpenes
export const TERPENES = [
  { id: 'myrcene', name: 'Myrcene', aroma: 'Earthy, musky, herbal', effects: ['Relaxing', 'Sedating'] },
  { id: 'limonene', name: 'Limonene', aroma: 'Citrus, lemon', effects: ['Uplifting', 'Stress relief'] },
  { id: 'caryophyllene', name: 'Caryophyllene', aroma: 'Spicy, peppery', effects: ['Anti-inflammatory', 'Pain relief'] },
  { id: 'pinene', name: 'Pinene', aroma: 'Pine, fresh', effects: ['Alertness', 'Memory retention'] },
  { id: 'linalool', name: 'Linalool', aroma: 'Floral, lavender', effects: ['Calming', 'Anti-anxiety'] },
  { id: 'humulene', name: 'Humulene', aroma: 'Earthy, woody', effects: ['Appetite suppressant', 'Anti-inflammatory'] },
  { id: 'terpinolene', name: 'Terpinolene', aroma: 'Floral, herbal', effects: ['Uplifting', 'Sedating'] },
  { id: 'ocimene', name: 'Ocimene', aroma: 'Sweet, herbal', effects: ['Energizing', 'Anti-inflammatory'] }
];

// Effects. `domain` is where you feel it (mind = cerebral, body = physical).
// `category` drives the colour of the chip in the journal.
export const EFFECTS = [
  // Mind
  { id: 'lucid', name: 'Lucid', domain: 'mind', category: 'positive', icon: '💡' },
  { id: 'clear_headed', name: 'Clear-headed', domain: 'mind', category: 'positive', icon: '🧠' },
  { id: 'focused', name: 'Focused', domain: 'mind', category: 'positive', icon: '🎯' },
  { id: 'creative', name: 'Creative', domain: 'mind', category: 'positive', icon: '🎨' },
  { id: 'social', name: 'Social', domain: 'mind', category: 'positive', icon: '🫂' },
  { id: 'talkative', name: 'Talkative', domain: 'mind', category: 'positive', icon: '💬' },
  { id: 'confident', name: 'Confident', domain: 'mind', category: 'positive', icon: '😎' },
  { id: 'happy', name: 'Happy', domain: 'mind', category: 'positive', icon: '😄' },
  { id: 'euphoric', name: 'Euphoric', domain: 'mind', category: 'positive', icon: '😊' },
  { id: 'uplifted', name: 'Uplifted', domain: 'mind', category: 'positive', icon: '🚀' },
  { id: 'giggly', name: 'Giggly', domain: 'mind', category: 'positive', icon: '😂' },
  { id: 'self_conscious', name: 'Self-conscious', domain: 'mind', category: 'negative', icon: '😳' },
  { id: 'anxious', name: 'Anxious', domain: 'mind', category: 'negative', icon: '😰' },
  { id: 'paranoid', name: 'Paranoid', domain: 'mind', category: 'negative', icon: '😨' },
  { id: 'racing_thoughts', name: 'Racing thoughts', domain: 'mind', category: 'negative', icon: '🌀' },
  { id: 'foggy', name: 'Foggy', domain: 'mind', category: 'negative', icon: '🌫️' },
  // Body
  { id: 'relaxed', name: 'Relaxed', domain: 'body', category: 'positive', icon: '😌' },
  { id: 'energetic', name: 'Energetic', domain: 'body', category: 'positive', icon: '⚡' },
  { id: 'pain_relief', name: 'Pain relief', domain: 'body', category: 'positive', icon: '🩹' },
  { id: 'sleepy', name: 'Sleepy', domain: 'body', category: 'neutral', icon: '😴' },
  { id: 'hungry', name: 'Hungry', domain: 'body', category: 'neutral', icon: '🍕' },
  { id: 'couch_lock', name: 'Couch-lock', domain: 'body', category: 'negative', icon: '🛋️' },
  { id: 'dry_mouth', name: 'Dry mouth', domain: 'body', category: 'negative', icon: '👄' },
  { id: 'dry_eyes', name: 'Dry eyes', domain: 'body', category: 'negative', icon: '👁️' },
  { id: 'congestion', name: 'Clogged sinus', domain: 'body', category: 'negative', icon: '🤧' },
  { id: 'headache', name: 'Headache', domain: 'body', category: 'negative', icon: '🤕' },
  { id: 'rapid_heart', name: 'Racing heart', domain: 'body', category: 'negative', icon: '💓' },
  { id: 'dizzy', name: 'Dizzy', domain: 'body', category: 'negative', icon: '😵' }
];

// How strongly an effect was felt. Tapping an effect chip cycles through these.
export const INTENSITY_LEVELS = [
  { value: 1, name: 'Mild' },
  { value: 2, name: 'Moderate' },
  { value: 3, name: 'Strong' }
];

// Starting goal: lucid, clear thinking and social, without anxiety or physical side effects.
// Editable from the Insights > Goal tab.
export const DEFAULT_GOAL = {
  want: ['lucid', 'clear_headed', 'focused', 'social', 'talkative'],
  avoid: ['self_conscious', 'anxious', 'paranoid', 'dry_mouth', 'dry_eyes', 'congestion']
};

// Product types
export const PRODUCT_TYPES = [
  { id: 'flower', name: 'Flower', icon: '🌿' },
  { id: 'concentrate', name: 'Concentrate', icon: '💎' },
  { id: 'vape', name: 'Vape', icon: '💨' },
  { id: 'edible', name: 'Edible', icon: '🍫' },
  { id: 'tincture', name: 'Tincture', icon: '💧' },
  { id: 'topical', name: 'Topical', icon: '🧴' },
  { id: 'preroll', name: 'Pre-roll', icon: '🚬' }
];

// Consumption methods
export const CONSUMPTION_METHODS = [
  { id: 'smoking', name: 'Smoking', icon: '🔥' },
  { id: 'vaping', name: 'Vaping', icon: '💨' },
  { id: 'edible', name: 'Edible', icon: '🍴' },
  { id: 'sublingual', name: 'Sublingual', icon: '💧' },
  { id: 'topical', name: 'Topical', icon: '🧴' },
  { id: 'dabbing', name: 'Dabbing', icon: '💎' }
];

// Strains
export const STRAIN_TYPES = [
  { id: 'sativa', name: 'Sativa', description: 'Energizing, uplifting', color: '#f59e0b' },
  { id: 'indica', name: 'Indica', description: 'Relaxing, sedating', color: '#8b5cf6' },
  { id: 'hybrid', name: 'Hybrid', description: 'Balanced effects', color: '#10b981' }
];
