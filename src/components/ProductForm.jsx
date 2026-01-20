import { useState, useEffect } from 'react';
import { useProducts } from '../hooks/useDatabase';
import { PRODUCT_TYPES, STRAIN_TYPES, CANNABINOIDS, TERPENES } from '../data/constants';

export default function ProductForm({ product, onClose }) {
  const { addProduct, updateProduct } = useProducts();
  const [formData, setFormData] = useState({
    name: '',
    type: 'flower',
    strain: 'hybrid',
    brand: '',
    cannabinoids: {},
    terpenes: {},
    notes: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        type: product.type || 'flower',
        strain: product.strain || 'hybrid',
        brand: product.brand || '',
        cannabinoids: product.cannabinoids || {},
        terpenes: product.terpenes || {},
        notes: product.notes || ''
      });
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Please enter a product name');
      return;
    }

    let productId;
    if (product?.id) {
      await updateProduct(product.id, formData);
      productId = product.id;
    } else {
      productId = await addProduct(formData);
    }

    onClose(productId);
  };

  const handleCannabinoidChange = (id, value) => {
    setFormData(prev => ({
      ...prev,
      cannabinoids: {
        ...prev.cannabinoids,
        [id]: parseFloat(value) || 0
      }
    }));
  };

  const handleTerpeneChange = (id, value) => {
    setFormData(prev => ({
      ...prev,
      terpenes: {
        ...prev.terpenes,
        [id]: parseFloat(value) || 0
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {product ? 'Edit Product' : 'Add Product'}
          </h2>
          <button onClick={() => onClose(null)} className="text-2xl">✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input-field"
              placeholder="e.g., Blue Dream"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              className="input-field"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="input-field"
            >
              {PRODUCT_TYPES.map(type => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Strain Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {STRAIN_TYPES.map(strain => (
                <button
                  key={strain.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, strain: strain.id }))}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.strain === strain.id
                      ? 'text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                  style={{
                    backgroundColor: formData.strain === strain.id ? strain.color : undefined
                  }}
                >
                  {strain.name}
                </button>
              ))}
            </div>
          </div>

          {/* Cannabinoids */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cannabinoids (%)
            </label>
            <div className="space-y-2">
              {CANNABINOIDS.map(cannabinoid => (
                <div key={cannabinoid.id} className="flex items-center gap-2">
                  <label className="w-16 text-sm font-medium">
                    {cannabinoid.name}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.cannabinoids[cannabinoid.id] || ''}
                    onChange={(e) => handleCannabinoidChange(cannabinoid.id, e.target.value)}
                    className="input-field flex-1"
                    placeholder="0.0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Terpenes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terpenes (%)
            </label>
            <div className="space-y-2">
              {TERPENES.slice(0, 5).map(terpene => (
                <div key={terpene.id} className="flex items-center gap-2">
                  <label className="w-24 text-sm">
                    {terpene.name}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.terpenes[terpene.id] || ''}
                    onChange={(e) => handleTerpeneChange(terpene.id, e.target.value)}
                    className="input-field flex-1"
                    placeholder="0.0"
                  />
                </div>
              ))}
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
              rows="3"
              placeholder="Any additional notes about this product..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => onClose(null)}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
            >
              {product ? 'Update' : 'Add'} Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
