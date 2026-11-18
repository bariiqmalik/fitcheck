import React, { useState } from 'react';
import { Bookmark, Trash2, Calendar, Sparkles } from 'lucide-react';
import { useWardrobe } from '../../context/WardrobeContext';
import { SavedOutfit } from '../../types/database.types';
import { Modal } from '../common/Modal';

interface SavedOutfitsViewProps {
  onNavigateToStylist: () => void;
}

export const SavedOutfitsView: React.FC<SavedOutfitsViewProps> = ({
  onNavigateToStylist,
}) => {
  const { savedOutfits, deleteSavedOutfit } = useWardrobe();
  const [deletingOutfit, setDeletingOutfit] = useState<SavedOutfit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deletingOutfit) return;
    setIsDeleting(true);
    try {
      await deleteSavedOutfit(deletingOutfit.id);
      setDeletingOutfit(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 font-semibold">
            Curated Looks
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-1">
            Saved Outfits ({savedOutfits.length})
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Your personal lookbook of generated ensembles ready to wear.
          </p>
        </div>

        {savedOutfits.length > 0 && (
          <button
            onClick={onNavigateToStylist}
            className="px-4 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold shadow-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
            <span>Generate New Look</span>
          </button>
        )}
      </div>

      {savedOutfits.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 mx-auto flex items-center justify-center mb-4">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100">
            No saved outfits yet
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-sm mx-auto mt-1 mb-6">
            Head over to the AI Stylist, generate recommendations tailored to today's weather, and click "Save Outfit" to build your lookbook!
          </p>
          <button
            onClick={onNavigateToStylist}
            className="px-5 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold shadow-md flex items-center gap-1.5 mx-auto"
          >
            <Sparkles className="w-4 h-4 text-amber-400 dark:text-amber-600" />
            <span>Explore AI Stylist</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedOutfits.map((outfit) => {
            const dateStr = new Date(outfit.created_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={outfit.id}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px] uppercase font-semibold capitalize">
                          {outfit.occasion}
                        </span>
                        <span className="text-[11px] text-stone-400 capitalize">
                          • {outfit.weather}
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 mt-1">
                        {outfit.title}
                      </h3>
                    </div>

                    <button
                      onClick={() => setDeletingOutfit(outfit)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Outfit"
                      aria-label="Delete Outfit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Items Grid */}
                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-2">
                      {outfit.items.map((item, idx) => (
                        <div
                          key={`${item.id}-${idx}`}
                          className="aspect-square rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700/60 relative group"
                        >
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5 text-white text-[10px]">
                            <span className="line-clamp-1">{item.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Styling Rationale */}
                  <div className="px-4 pb-4">
                    <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-3 bg-stone-50 dark:bg-stone-850 p-3 rounded-xl border border-stone-100 dark:border-stone-800">
                      {outfit.rationale}
                    </p>
                  </div>
                </div>

                <div className="p-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Saved {dateStr}</span>
                  </span>
                  <span className="text-stone-600 dark:text-stone-300 font-medium">
                    {outfit.items.length} pieces
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingOutfit)}
        onClose={() => setDeletingOutfit(null)}
        title="Remove Saved Look"
        subtitle="Are you sure you want to delete this saved outfit from your lookbook?"
        maxWidth="sm"
      >
        <div className="pt-2 flex justify-end gap-2">
          <button
            onClick={() => setDeletingOutfit(null)}
            className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
          </button>
        </div>
      </Modal>
    </div>
  );
};
