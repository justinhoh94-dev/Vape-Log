import { useState, useEffect } from 'react';
import { useEntries, useProducts } from '../hooks/useDatabase';
import { EFFECTS, CONSUMPTION_METHODS } from '../data/constants';
import ProductForm from './ProductForm';

export default function AddEntryModal({ entry, onClose }) {
  const { addEntry, updateEntry } = useEntries();
  const { products, refresh: refreshProducts } = useProducts();
  const [showProductForm, setShowProductForm] = useState(false);
  const [formData, setFormData] = useState({
    productId: null,
    date: new Date().toISOString().slice(0, 16),
    rating: 3,
    effects: [],
    method: 'smoking',
    dosage: '',
    notes: ''
  });

  useEffect(() => {
    if (entry) {
      setFormData({
        productId: entry.productId,
        date: entry.date ? new Date(entry.date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        rating: entry.rating || 3,
        effects: entry.effects || [],
        method: entry.method || 'smoking',
        dosage: entry.dosage || '',
        notes: entry.notes || ''
      });
    }
  }, [entry]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.productId) {
      alert('Please select a product');
      return;
    }

    const entryData = {
      ...formData,
      date: new Date(formData.date).toISOString()
    };

    if (entry?.id) {
      await updateEntry(entry.id, entryData);
    } else {
      await addEntry(entryData);
    }

    onClose();
  };

  const toggleEffect = (effectId) => {
    setFormData(prev => ({
      ...prev,
      effects: prev.effects.includes(effectId)
        ? prev.effects.filter(e => e !== effectId)
        : [...prev.effects, effectId]
    }));
  };

  const handleProductFormClose = async (newProductId) => {
    setShowProductForm(false);
    if (newProductId) {
      await refreshProducts();
      setFormData(prev => ({ ...prev, productId: newProductId }));
    }
  };

  const effectsByCategory = {
    positive: EFFECTS.filter(e => e.category === 'positive'),
    neutral: EFFECTS.filter(e => e.category === 'neutral'),
    negative: EFFECTS.filter(e => e.category === 'negative')
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {entry ? 'Edit Entry' : 'New Journal Entry'}
          </h2>
          <button onClick={onClose} className="text-2xl">✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product *
            </label>
            {products.length === 0 ? (
              <div className="space-y-2">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                  No products yet. Create your first product to start journaling!
                </div>
                <button
                  type="button"
                  onClick={() => setShowProductForm(true)}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <span>➕</span>
                  <span>Create New Product</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <select
                  value={formData.productId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, productId: parseInt(e.target.value) }))}
                  className="input-field"
                  required
                >
                  <option value="">Select a product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowProductForm(true)}
                  className="w-full btn-secondary text-sm flex items-center justify-center gap-2"
                >
                  <span>➕</span>
                  <span>Create New Product</span>
                </button>
              </div>
            )}
          </div>

          {/* Date/Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="input-field"
              required
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating: {formData.rating}/5
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, rating }))}
                  className="text-4xl transition-transform hover:scale-110"
                >
                  {rating <= formData.rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>

          {/* Consumption Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Consumption Method
            </label>
            <select
              value={formData.method}
              onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value }))}
              className="input-field"
            >
              {CONSUMPTION_METHODS.map(method => (
                <option key={method.id} value={method.id}>
                  {method.icon} {method.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dosage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dosage (optional)
            </label>
            <input
              type="text"
              value={formData.dosage}
              onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
              className="input-field"
              placeholder="e.g., 1 puff, 10mg, 0.5g"
            />
          </div>

          {/* Effects */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Effects
            </label>

            {/* Positive Effects */}
            <div className="mb-3">
              <div className="text-xs text-green-600 font-medium mb-1">Positive</div>
              <div className="flex flex-wrap gap-2">
                {effectsByCategory.positive.map(effect => (
                  <button
                    key={effect.id}
                    type="button"
                    onClick={() => toggleEffect(effect.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      formData.effects.includes(effect.id)
                        ? 'bg-green-600 text-white'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {effect.icon} {effect.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Neutral Effects */}
            <div className="mb-3">
              <div className="text-xs text-gray-600 font-medium mb-1">Neutral</div>
              <div className="flex flex-wrap gap-2">
                {effectsByCategory.neutral.map(effect => (
                  <button
                    key={effect.id}
                    type="button"
                    onClick={() => toggleEffect(effect.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      formData.effects.includes(effect.id)
                        ? 'bg-gray-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {effect.icon} {effect.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Negative Effects */}
            <div className="mb-3">
              <div className="text-xs text-red-600 font-medium mb-1">Negative</div>
              <div className="flex flex-wrap gap-2">
                {effectsByCategory.negative.map(effect => (
                  <button
                    key={effect.id}
                    type="button"
                    onClick={() => toggleEffect(effect.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      formData.effects.includes(effect.id)
                        ? 'bg-red-600 text-white'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {effect.icon} {effect.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="input-field"
              rows="4"
              placeholder="How are you feeling? Any observations?"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
            >
              {entry ? 'Update' : 'Save'} Entry
            </button>
          </div>
        </form>
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductForm
          onClose={handleProductFormClose}
        />
      )}
    </div>
  );
}
