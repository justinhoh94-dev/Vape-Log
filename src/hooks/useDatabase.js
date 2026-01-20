import { useState, useEffect, useCallback } from 'react';
import db from '../services/database';

export function useDatabase() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    db.init().then(() => setIsReady(true));
  }, []);

  return isReady;
}

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const data = await db.getAllProducts();
    setProducts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const addProduct = useCallback(async (product) => {
    const id = await db.addProduct(product);
    await loadProducts();
    return id;
  }, [loadProducts]);

  const updateProduct = useCallback(async (id, product) => {
    await db.updateProduct(id, product);
    await loadProducts();
  }, [loadProducts]);

  const deleteProduct = useCallback(async (id) => {
    await db.deleteProduct(id);
    await loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    refresh: loadProducts
  };
}

export function useEntries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    const data = await db.getAllEntries();
    setEntries(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const addEntry = useCallback(async (entry) => {
    const id = await db.addEntry(entry);
    await loadEntries();
    return id;
  }, [loadEntries]);

  const updateEntry = useCallback(async (id, entry) => {
    await db.updateEntry(id, entry);
    await loadEntries();
  }, [loadEntries]);

  const deleteEntry = useCallback(async (id) => {
    await db.deleteEntry(id);
    await loadEntries();
  }, [loadEntries]);

  return {
    entries,
    loading,
    addEntry,
    updateEntry,
    deleteEntry,
    refresh: loadEntries
  };
}
