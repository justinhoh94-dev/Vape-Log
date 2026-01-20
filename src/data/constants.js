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

// Effects categories
export const EFFECTS = [
  { id: 'relaxed', name: 'Relaxed', category: 'positive', icon: '😌' },
  { id: 'euphoric', name: 'Euphoric', category: 'positive', icon: '😊' },
  { id: 'happy', name: 'Happy', category: 'positive', icon: '😄' },
  { id: 'uplifted', name: 'Uplifted', category: 'positive', icon: '🚀' },
  { id: 'energetic', name: 'Energetic', category: 'positive', icon: '⚡' },
  { id: 'focused', name: 'Focused', category: 'positive', icon: '🎯' },
  { id: 'creative', name: 'Creative', category: 'positive', icon: '🎨' },
  { id: 'sleepy', name: 'Sleepy', category: 'neutral', icon: '😴' },
  { id: 'hungry', name: 'Hungry', category: 'neutral', icon: '🍕' },
  { id: 'talkative', name: 'Talkative', category: 'positive', icon: '💬' },
  { id: 'giggly', name: 'Giggly', category: 'positive', icon: '😂' },
  { id: 'anxious', name: 'Anxious', category: 'negative', icon: '😰' },
  { id: 'paranoid', name: 'Paranoid', category: 'negative', icon: '😨' },
  { id: 'dry_mouth', name: 'Dry Mouth', category: 'negative', icon: '👄' },
  { id: 'dry_eyes', name: 'Dry Eyes', category: 'negative', icon: '👁️' },
  { id: 'dizzy', name: 'Dizzy', category: 'negative', icon: '😵' }
];

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
