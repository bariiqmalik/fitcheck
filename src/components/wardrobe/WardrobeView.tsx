import React, { useState, useMemo } from 'react';
import { Plus, Search, Sparkles, Shirt, Trash2 } from 'lucide-react';
import { useWardrobe } from '../../context/WardrobeContext';
import { WardrobeItem, Occasion } from '../../types/database.types';
import { ItemCard } from './ItemCard';
import { EditItemModal } from './EditItemModal';
import { Modal } from '../common/Modal';
import { StorageUsageBar } from '../common/StorageUsageBar';

interface WardrobeViewProps {
  onOpenAddItem: () => void;
  onOpenUpgrade?: () => void;
}

export const WardrobeView: React.FC<WardrobeViewProps> = ({
  onOpenAddItem,
  onOpenUpgrade,
}) => {
  const { items, loading, deleteItem, seedSampleWardrobe } = useWardrobe();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');

  // Modal States
  const [editingItem, setEditingItem] = useState<WardrobeItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<WardrobeItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'top', label: 'Tops' },
    { id: 'bottom', label: 'Bottoms' },
    { id: 'dress', label: 'Dresses' },
    { id: 'outerwear', label: 'Outerwear' },
    { id: 'shoes', label: 'Shoes' },
    { id: 'accessory', label: 'Accessories' },
  ];

  const occasions = [
    { id: 'all', label: 'All Occasions' },
    { id: 'casual', label: 'Casual' },
    { id: 'work', label: 'Work' },
    { id: 'formal', label: 'Formal' },
    { id: 'party', label: 'Party' },
    { id: 'sport', label: 'Sport' },
  ];

  // Extract unique colors for filter
  const availableColors = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => {
      if (it.color) set.add(it.color.toLowerCase());
    });
    return Array.from(set).sort();
  }, [items]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesSub = item.subcategory?.toLowerCase().includes(query);
        const matchesColor = item.color.toLowerCase().includes(query);
        if (!matchesName && !matchesSub && !matchesColor) return false;
      }

      // Category
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Occasion
      if (selectedOccasion !== 'all' && !item.occasion.includes(selectedOccasion as Occasion)) {
        return false;
      }

      // Color
      if (selectedColor !== 'all' && item.color.toLowerCase() !== selectedColor) {
        return false;
      }

      return true;
    });
  }, [items, searchQuery, selectedCategory, selectedOccasion, selectedColor]);

  const confirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await deleteItem(deletingItem.id);
      setDeletingItem(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedSampleWardrobe();
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 font-semibold">
            Digital Wardrobe Vault
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-1">
            Your Clothes ({items.length})
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Digitize your personal collection to unlock custom AI styling recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {items.length < 5 && (
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="px-4 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700/80 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSeeding ? 'Seeding...' : 'Load Sample Capsule'}</span>
            </button>
          )}

          <button
            onClick={onOpenAddItem}
            className="px-4 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold shadow-sm hover:bg-stone-800 dark:hover:bg-white transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Clothes</span>
          </button>
        </div>
      </div>

      {/* Wardrobe Closet Storage & Plan Usage Bar */}
      <StorageUsageBar
        currentCount={items.length}
        onOpenUpgrade={onOpenUpgrade || (() => {})}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs mb-8 space-y-4">
        {/* Search & Select dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, fabric, or color..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedOccasion}
              onChange={(e) => setSelectedOccasion(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            >
              {occasions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs capitalize focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            >
              <option value="all">All Colours</option>
              {availableColors.map((c) => (
                <option key={c} value={c} className="capitalize">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-stone-100 dark:border-stone-800 pt-3">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === c.id
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-semibold shadow-xs'
                  : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-750'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Wardrobe Photo Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="aspect-3/4 rounded-2xl bg-stone-200 dark:bg-stone-800 animate-pulse"
            />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onEdit={(it) => setEditingItem(it)}
              onDelete={(it) => setDeletingItem(it)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400 mx-auto flex items-center justify-center mb-4">
            <Shirt className="w-8 h-8" />
          </div>
          <h3 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100">
            {items.length === 0 ? 'Your closet is waiting' : 'No matching clothes found'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto mt-1 mb-6">
            {items.length === 0
              ? 'Upload photos of your favorite shirts, trousers, dresses, and jackets to start receiving intelligent outfit recommendations.'
              : 'Try clearing your category or colour filters to see more pieces.'}
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            {items.length === 0 ? (
              <>
                <button
                  onClick={onOpenAddItem}
                  className="px-5 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Piece</span>
                </button>
                <button
                  onClick={handleSeed}
                  disabled={isSeeding}
                  className="px-5 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isSeeding ? 'Loading Capsule...' : 'Load Sample Wardrobe'}</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedOccasion('all');
                  setSelectedColor('all');
                }}
                className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-semibold"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      <EditItemModal
        item={editingItem}
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
      />

      {/* Delete Item Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        title="Remove Clothing Piece"
        subtitle="Are you sure you want to remove this piece from your closet?"
        maxWidth="sm"
      >
        <div className="py-2">
          {deletingItem && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800 mb-6">
              <img
                src={deletingItem.image_url}
                alt={deletingItem.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="text-xs">
                <span className="font-semibold text-stone-900 dark:text-stone-100 block">
                  {deletingItem.name}
                </span>
                <span className="text-stone-500 capitalize">{deletingItem.category}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeletingItem(null)}
              className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={confirmDelete}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeleting ? 'Removing...' : 'Delete Piece'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
