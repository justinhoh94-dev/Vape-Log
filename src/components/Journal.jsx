import { useState } from 'react';
import { useEntries, useProducts } from '../hooks/useDatabase';
import AddEntryModal from './AddEntryModal';
import { EFFECTS } from '../data/constants';

export default function Journal() {
  const { entries, deleteEntry } = useEntries();
  const { products } = useProducts();
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [filterRating, setFilterRating] = useState(0);

  const filteredEntries = filterRating > 0
    ? entries.filter(e => e.rating >= filterRating)
    : entries;

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setShowAddEntry(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this journal entry?')) {
      await deleteEntry(id);
    }
  };

  const handleModalClose = () => {
    setShowAddEntry(false);
    setEditingEntry(null);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowAddEntry(true)}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          <span>➕</span>
          <span>New Entry</span>
        </button>
      </div>

      {/* Filter */}
      <div className="card">
        <div className="text-sm font-medium text-gray-700 mb-2">Filter by rating</div>
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4, 5].map(rating => (
            <button
              key={rating}
              onClick={() => setFilterRating(rating)}
              className={`px-3 py-1 rounded text-sm ${
                filterRating === rating
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {rating === 0 ? 'All' : `${rating}+⭐`}
            </button>
          ))}
        </div>
      </div>

      {/* Entries */}
      {filteredEntries.length === 0 ? (
        <div className="card text-center py-8">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-gray-600">
            {entries.length === 0
              ? 'No journal entries yet. Start tracking your experiences!'
              : 'No entries match the selected filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map(entry => {
            const product = products.find(p => p.id === entry.productId);
            const entryDate = new Date(entry.date);

            return (
              <div key={entry.id} className="card">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {product?.name || 'Unknown Product'}
                    </h3>
                    <div className="text-sm text-gray-600">
                      {entryDate.toLocaleDateString()} at {entryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="text-blue-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-gray-600">Rating:</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-lg">
                        {i < (entry.rating || 0) ? '⭐' : '☆'}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Effects */}
                {entry.effects && entry.effects.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs font-medium text-gray-600 mb-1">Effects</div>
                    <div className="flex flex-wrap gap-2">
                      {entry.effects.map(effectId => {
                        const effect = EFFECTS.find(e => e.id === effectId);
                        return effect ? (
                          <span
                            key={effectId}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              effect.category === 'positive'
                                ? 'bg-green-100 text-green-700'
                                : effect.category === 'negative'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {effect.icon} {effect.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Consumption Method */}
                {entry.method && (
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Method:</span> {entry.method}
                  </div>
                )}

                {/* Dosage */}
                {entry.dosage && (
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Dosage:</span> {entry.dosage}
                  </div>
                )}

                {/* Notes */}
                {entry.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs font-medium text-gray-600 mb-1">Notes</div>
                    <p className="text-sm text-gray-700">{entry.notes}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showAddEntry && (
        <AddEntryModal
          entry={editingEntry}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
