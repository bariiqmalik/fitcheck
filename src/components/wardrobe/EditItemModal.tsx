import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useWardrobe } from '../../context/WardrobeContext';
import { WardrobeItem, ClothingCategory, Occasion } from '../../types/database.types';
import { Check } from 'lucide-react';

interface EditItemModalProps {
  item: WardrobeItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: { cat: ClothingCategory; label: string }[] = [
  { cat: 'top', label: 'Top / Blouse / Shirt' },
  { cat: 'bottom', label: 'Bottom / Pants / Skirt' },
  { cat: 'dress', label: 'Dress / Jumpsuit' },
  { cat: 'outerwear', label: 'Outerwear / Jacket / Coat' },
  { cat: 'shoes', label: 'Shoes / Boots / Heels' },
  { cat: 'accessory', label: 'Accessory / Bag / Belt' },
];

const OCCASIONS: { occ: Occasion; label: string }[] = [
  { occ: 'casual', label: 'Casual' },
  { occ: 'work', label: 'Work / Business' },
  { occ: 'formal', label: 'Formal / Gala' },
  { occ: 'party', label: 'Party / Evening' },
  { occ: 'sport', label: 'Sport / Athleisure' },
];

interface EditItemFormProps {
  item: WardrobeItem;
  onClose: () => void;
}

const EditItemForm: React.FC<EditItemFormProps> = ({ item, onClose }) => {
  const { updateItem } = useWardrobe();

  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState<ClothingCategory>(item.category);
  const [subcategory, setSubcategory] = useState(item.subcategory || '');
  const [color, setColor] = useState(item.color);
  const [selectedOccasions, setSelectedOccasions] = useState<Occasion[]>(item.occasion);
  const [notes, setNotes] = useState(item.notes || '');
  const [saving, setSaving] = useState(false);

  const toggleOccasion = (occ: Occasion) => {
    setSelectedOccasions((prev) =>
      prev.includes(occ) ? (prev.length > 1 ? prev.filter((o) => o !== occ) : prev) : [...prev, occ]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateItem(item.id, {
        name: name.trim(),
        category,
        subcategory: subcategory.trim() || undefined,
        color,
        occasion: selectedOccasions,
        notes: notes.trim() || undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="flex items-center gap-4 p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
        <img
          src={item.image_url}
          alt={item.name}
          className="w-16 h-16 rounded-lg object-cover"
        />
        <div className="text-xs">
          <span className="font-semibold text-stone-900 dark:text-stone-100 block">{item.name}</span>
          <span className="text-stone-500 dark:text-stone-400 capitalize">{item.category} • {item.color}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
            Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
            Style / Subcategory
          </label>
          <input
            type="text"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            placeholder="e.g. Silk, Denim, Knit"
            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ClothingCategory)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          {CATEGORIES.map((c) => (
            <option key={c.cat} value={c.cat}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
          Dominant Colour
        </label>
        <input
          type="text"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-2">
          Occasions
        </label>
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((o) => {
            const selected = selectedOccasions.includes(o.occ);
            return (
              <button
                key={o.occ}
                type="button"
                onClick={() => toggleOccasion(o.occ)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  selected
                    ? 'border-stone-900 dark:border-stone-100 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                    : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800'
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
          Notes
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 text-xs font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold shadow-xs flex items-center gap-1.5"
        >
          {saving ? 'Saving...' : 'Update Piece'}
          <Check className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};

export const EditItemModal: React.FC<EditItemModalProps> = ({ item, isOpen, onClose }) => {
  if (!item || !isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Clothing Piece"
      subtitle={`Update the styling tags for ${item.name}`}
      maxWidth="lg"
    >
      <EditItemForm item={item} onClose={onClose} />
    </Modal>
  );
};
