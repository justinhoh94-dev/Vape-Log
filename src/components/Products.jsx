import { useState } from 'react';
import { useProducts } from '../hooks/useDatabase';
import { PRODUCT_TYPES, STRAIN_TYPES } from '../data/constants';
import ProductForm from './ProductForm';
import CameraCapture from './CameraCapture';

export default function Products() {
  const { products, deleteProduct } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filter, setFilter] = useState('all');

  const filteredProducts = filter === 'all'
    ? products
    : products.filter(p => p.type === filter);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this product? This will also delete all associated journal entries.')) {
      await deleteProduct(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleCameraCapture = (productData) => {
    setEditingProduct(productData);
    setShowCamera(false);
    setShowForm(true);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          <span>➕</span>
          <span>Add Product</span>
        </button>
        <button
          onClick={() => setShowCamera(true)}
          className="btn-secondary flex items-center justify-center gap-2 px-3"
          title="Scan Label"
        >
          <span className="text-xl">📷</span>
        </button>
      </div>

      {/* Filter */}
      <div className="card">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            All
          </button>
          {PRODUCT_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setFilter(type.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                filter === type.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {type.icon} {type.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <div className="card text-center py-8">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-gray-600">No products yet. Add your first product!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map(product => {
            const strain = STRAIN_TYPES.find(s => s.id === product.strain);
            const productType = PRODUCT_TYPES.find(t => t.id === product.type);

            return (
              <div key={product.id} className="card">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      {productType && (
                        <span className="flex items-center gap-1">
                          {productType.icon} {productType.name}
                        </span>
                      )}
                      {strain && (
                        <span
                          className="px-2 py-1 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: strain.color }}
                        >
                          {strain.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Cannabinoids */}
                {product.cannabinoids && Object.keys(product.cannabinoids).length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs font-medium text-gray-600 mb-1">Cannabinoids</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(product.cannabinoids).map(([key, value]) => (
                        value > 0 && (
                          <span
                            key={key}
                            className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium"
                          >
                            {key.toUpperCase()}: {value}%
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Terpenes */}
                {product.terpenes && Object.keys(product.terpenes).length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs font-medium text-gray-600 mb-1">Terpenes</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(product.terpenes).map(([key, value]) => (
                        value > 0 && (
                          <span
                            key={key}
                            className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium capitalize"
                          >
                            {key}
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleFormClose}
        />
      )}

      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
