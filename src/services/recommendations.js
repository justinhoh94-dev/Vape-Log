import db from './database';
import { EFFECTS, CANNABINOIDS, TERPENES } from '../data/constants';

class RecommendationService {
  async getRecommendations() {
    const stats = await db.getStats();
    const products = await db.getAllProducts();
    const entries = await db.getAllEntries();

    if (entries.length < 3) {
      return {
        message: 'Keep logging your experiences! We need at least 3 entries to provide personalized recommendations.',
        recommendations: []
      };
    }

    // Analyze user preferences
    const preferences = this.analyzePreferences(entries, products);

    // Score all products
    const scoredProducts = products.map(product => ({
      product,
      score: this.scoreProduct(product, preferences, entries)
    }));

    // Sort by score
    scoredProducts.sort((a, b) => b.score - a.score);

    return {
      preferences,
      recommendations: scoredProducts.slice(0, 5),
      stats
    };
  }

  analyzePreferences(entries, products) {
    const preferences = {
      favoriteEffects: {},
      favoriteCannabinoids: {},
      favoriteTerpenes: {},
      favoriteStrain: null,
      avgRating: 0
    };

    let totalRating = 0;
    const effectCounts = {};
    const cannabinoidScores = {};
    const terpeneScores = {};
    const strainScores = {};

    entries.forEach(entry => {
      totalRating += entry.rating || 0;

      // Count positive effects from high-rated entries
      if (entry.rating >= 4) {
        entry.effects?.forEach(effect => {
          const effectInfo = EFFECTS.find(e => e.id === effect);
          if (effectInfo?.category === 'positive') {
            effectCounts[effect] = (effectCounts[effect] || 0) + 1;
          }
        });

        // Score cannabinoids and terpenes from high-rated entries
        const product = products.find(p => p.id === entry.productId);
        if (product) {
          Object.entries(product.cannabinoids || {}).forEach(([key, value]) => {
            if (value > 0) {
              cannabinoidScores[key] = (cannabinoidScores[key] || 0) + (entry.rating * value);
            }
          });

          Object.entries(product.terpenes || {}).forEach(([key, value]) => {
            if (value > 0) {
              terpeneScores[key] = (terpeneScores[key] || 0) + (entry.rating * value);
            }
          });

          if (product.strain) {
            strainScores[product.strain] = (strainScores[product.strain] || 0) + entry.rating;
          }
        }
      }
    });

    preferences.avgRating = totalRating / entries.length;
    preferences.favoriteEffects = Object.entries(effectCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});

    preferences.favoriteCannabinoids = Object.entries(cannabinoidScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});

    preferences.favoriteTerpenes = Object.entries(terpeneScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});

    // Determine favorite strain
    const sortedStrains = Object.entries(strainScores).sort((a, b) => b[1] - a[1]);
    if (sortedStrains.length > 0) {
      preferences.favoriteStrain = sortedStrains[0][0];
    }

    return preferences;
  }

  scoreProduct(product, preferences, entries) {
    let score = 0;

    // Check if already tried
    const productEntries = entries.filter(e => e.productId === product.id);
    const alreadyTried = productEntries.length > 0;

    if (alreadyTried) {
      // If already tried, score based on past ratings
      const avgProductRating = productEntries.reduce((sum, e) => sum + (e.rating || 0), 0) / productEntries.length;
      score += avgProductRating * 10;
    }

    // Score cannabinoid match
    Object.entries(preferences.favoriteCannabinoids).forEach(([cannabinoid, prefScore]) => {
      const productValue = product.cannabinoids?.[cannabinoid] || 0;
      if (productValue > 0) {
        score += prefScore * 0.3;
      }
    });

    // Score terpene match
    Object.entries(preferences.favoriteTerpenes).forEach(([terpene, prefScore]) => {
      const productValue = product.terpenes?.[terpene] || 0;
      if (productValue > 0) {
        score += prefScore * 0.5;
      }
    });

    // Score strain match
    if (product.strain === preferences.favoriteStrain) {
      score += 5;
    }

    return score;
  }

  getIdealProfile(preferences) {
    const profile = {
      cannabinoids: [],
      terpenes: [],
      strain: preferences.favoriteStrain,
      effects: []
    };

    // Top cannabinoids
    Object.keys(preferences.favoriteCannabinoids).forEach(key => {
      const cannabinoid = CANNABINOIDS.find(c => c.id === key);
      if (cannabinoid) {
        profile.cannabinoids.push(cannabinoid);
      }
    });

    // Top terpenes
    Object.keys(preferences.favoriteTerpenes).forEach(key => {
      const terpene = TERPENES.find(t => t.id === key);
      if (terpene) {
        profile.terpenes.push(terpene);
      }
    });

    // Favorite effects
    Object.keys(preferences.favoriteEffects).forEach(key => {
      const effect = EFFECTS.find(e => e.id === key);
      if (effect) {
        profile.effects.push(effect);
      }
    });

    return profile;
  }
}

const recommendationService = new RecommendationService();
export default recommendationService;
