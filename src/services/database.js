import { openDB } from 'idb';

const DB_NAME = 'CannabisJournalDB';
const DB_VERSION = 1;

class Database {
  constructor() {
    this.db = null;
  }

  async init() {
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Products store
        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
          productStore.createIndex('name', 'name', { unique: false });
          productStore.createIndex('type', 'type', { unique: false });
          productStore.createIndex('strain', 'strain', { unique: false });
          productStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Journal entries store
        if (!db.objectStoreNames.contains('entries')) {
          const entryStore = db.createObjectStore('entries', { keyPath: 'id', autoIncrement: true });
          entryStore.createIndex('productId', 'productId', { unique: false });
          entryStore.createIndex('date', 'date', { unique: false });
          entryStore.createIndex('rating', 'rating', { unique: false });
        }

        // User preferences store
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences', { keyPath: 'key' });
        }

        // Photos store
        if (!db.objectStoreNames.contains('photos')) {
          const photoStore = db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
          photoStore.createIndex('productId', 'productId', { unique: false });
          photoStore.createIndex('entryId', 'entryId', { unique: false });
        }
      },
    });
  }

  // Products
  async addProduct(product) {
    const id = await this.db.add('products', {
      ...product,
      createdAt: new Date().toISOString()
    });
    return id;
  }

  async getProduct(id) {
    return await this.db.get('products', id);
  }

  async getAllProducts() {
    return await this.db.getAll('products');
  }

  async updateProduct(id, product) {
    return await this.db.put('products', { ...product, id });
  }

  async deleteProduct(id) {
    // Also delete associated entries and photos
    const entries = await this.db.getAllFromIndex('entries', 'productId', id);
    for (const entry of entries) {
      await this.deleteEntry(entry.id);
    }

    const photos = await this.db.getAllFromIndex('photos', 'productId', id);
    for (const photo of photos) {
      await this.db.delete('photos', photo.id);
    }

    return await this.db.delete('products', id);
  }

  // Entries
  async addEntry(entry) {
    const id = await this.db.add('entries', {
      ...entry,
      date: entry.date || new Date().toISOString()
    });
    return id;
  }

  async getEntry(id) {
    return await this.db.get('entries', id);
  }

  async getAllEntries() {
    const entries = await this.db.getAll('entries');
    return entries.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async getEntriesByProduct(productId) {
    return await this.db.getAllFromIndex('entries', 'productId', productId);
  }

  async updateEntry(id, entry) {
    return await this.db.put('entries', { ...entry, id });
  }

  async deleteEntry(id) {
    // Delete associated photos
    const photos = await this.db.getAllFromIndex('photos', 'entryId', id);
    for (const photo of photos) {
      await this.db.delete('photos', photo.id);
    }

    return await this.db.delete('entries', id);
  }

  // Photos
  async addPhoto(photo) {
    return await this.db.add('photos', {
      ...photo,
      createdAt: new Date().toISOString()
    });
  }

  async getPhoto(id) {
    return await this.db.get('photos', id);
  }

  async getPhotosByProduct(productId) {
    return await this.db.getAllFromIndex('photos', 'productId', productId);
  }

  async getPhotosByEntry(entryId) {
    return await this.db.getAllFromIndex('photos', 'entryId', entryId);
  }

  async deletePhoto(id) {
    return await this.db.delete('photos', id);
  }

  // Preferences
  async setPreference(key, value) {
    return await this.db.put('preferences', { key, value });
  }

  async getPreference(key) {
    const pref = await this.db.get('preferences', key);
    return pref?.value;
  }

  // Analytics
  async getStats() {
    const entries = await this.getAllEntries();
    const products = await this.getAllProducts();

    const effectsMap = {};
    const cannabinoidMap = {};
    const terpeneMap = {};
    const strainTypeMap = {};

    entries.forEach(entry => {
      // Count effects
      entry.effects?.forEach(effect => {
        effectsMap[effect] = (effectsMap[effect] || 0) + 1;
      });

      // Track ratings by product
      if (entry.productId) {
        const product = products.find(p => p.id === entry.productId);
        if (product) {
          // Cannabinoids
          Object.entries(product.cannabinoids || {}).forEach(([key, value]) => {
            if (value > 0) {
              if (!cannabinoidMap[key]) {
                cannabinoidMap[key] = { total: 0, count: 0, avgRating: 0 };
              }
              cannabinoidMap[key].total += entry.rating || 0;
              cannabinoidMap[key].count += 1;
            }
          });

          // Terpenes
          Object.entries(product.terpenes || {}).forEach(([key, value]) => {
            if (value > 0) {
              if (!terpeneMap[key]) {
                terpeneMap[key] = { total: 0, count: 0, avgRating: 0 };
              }
              terpeneMap[key].total += entry.rating || 0;
              terpeneMap[key].count += 1;
            }
          });

          // Strain types
          if (product.strain) {
            if (!strainTypeMap[product.strain]) {
              strainTypeMap[product.strain] = { total: 0, count: 0, avgRating: 0 };
            }
            strainTypeMap[product.strain].total += entry.rating || 0;
            strainTypeMap[product.strain].count += 1;
          }
        }
      }
    });

    // Calculate averages
    Object.keys(cannabinoidMap).forEach(key => {
      cannabinoidMap[key].avgRating = cannabinoidMap[key].total / cannabinoidMap[key].count;
    });

    Object.keys(terpeneMap).forEach(key => {
      terpeneMap[key].avgRating = terpeneMap[key].total / terpeneMap[key].count;
    });

    Object.keys(strainTypeMap).forEach(key => {
      strainTypeMap[key].avgRating = strainTypeMap[key].total / strainTypeMap[key].count;
    });

    return {
      totalEntries: entries.length,
      totalProducts: products.length,
      effects: effectsMap,
      cannabinoids: cannabinoidMap,
      terpenes: terpeneMap,
      strainTypes: strainTypeMap
    };
  }
}

const db = new Database();
export default db;
