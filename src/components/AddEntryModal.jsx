import { useState, useEffect } from 'react';
import { useEntries, useProducts } from '../hooks/useDatabase';
import { EFFECTS, CONSUMPTION_METHODS, INTENSITY_LEVELS } from '../data/constants';

export default function AddEntryModal({ entry, onClose }) {
  const { addEntry, updateEntry } = useEntries();
  const { products } = useProducts();
  const [formData, setFormData] = useState({
    productId: null,
    date: new Date().toISOString().slice(0, 16),
    rating: 3,
    effects: [],
    effectIntensity: {},
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
        effectIntensity: entry.effectIntensity || {},
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

  // Tap cycles: off -> mild -> moderate -> strong -> off.
  const cycleEffect = (effectId) => {
    setFormData(prev => {
      const current = prev.effects.includes(effectId) ? (prev.effectIntensity[effectId] ?? 2) : 0;
      const next = current >= INTENSITY_LEVELS.length ? 0 : current + 1;
      const effectIntensity = { ...prev.effectIntensity };
      if (next) {
        effectIntensity[effectId] = next;
      } else {
        delete effectIntensity[effectId];
      }
      return {
        ...prev,
        effects: next
          ? [...new Set([...prev.effects, effectId])]
          : prev.effects.filter(e => e !== effectId),
        effectIntensity
      };
    });
  };

  const chipStyles = {
    positive: ['bg-green-100 text-green-700', 'bg-green-600 text-white'],
    neutral: ['bg-gray-100 text-gray-700', 'bg-gray-600 text-white'],
    negative: ['bg-red-100 text-red-700', 'bg-red-600 text-white']
  };

  const effectGroups = [
    { title: 'Head (cerebral)', effects: EFFECTS.filter(e => e.domain === 'mind') },
    { title: 'Body (physical)', effects: EFFECTS.filter(e => e.domain === 'body') }
  ];

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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Effects
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Tap to log an effect; tap again for stronger (mild → moderate → strong → off).
            </p>

            {effectGroups.map(group => (
              <div key={group.title} className="mb-3">
                <div className="text-xs text-gray-600 font-medium mb-1">{group.title}</div>
                <div className="flex flex-wrap gap-2">
                  {group.effects.map(effect => {
                    const selected = formData.effects.includes(effect.id);
                    const intensity = selected ? (formData.effectIntensity[effect.id] ?? 2) : 0;
                    return (
                      <button
                        key={effect.id}
                        type="button"
                        onClick={() => cycleEffect(effect.id)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          chipStyles[effect.category][selected ? 1 : 0]
                        }`}
                      >
                        {effect.icon} {effect.name}
                        {selected && (
                          <span className="ml-1 text-xs opacity-90">
                            {'●'.repeat(intensity)}{'○'.repeat(INTENSITY_LEVELS.length - intensity)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
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
    </div>
  );
}
