import React, { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { WardrobeItem } from '../../types/database.types';

interface ItemCardProps {
  item: WardrobeItem;
  onEdit: (item: WardrobeItem) => void;
  onDelete: (item: WardrobeItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onEdit, onDelete }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="group relative bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col">
      {/* Photo Container */}
      <div className="relative aspect-3/4 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-stone-200 dark:bg-stone-800 animate-pulse" />
        )}
        <img
          src={item.image_url}
          alt={item.name}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
          <span className="px-2.5 py-1 rounded-md bg-stone-900/80 backdrop-blur-xs text-white text-[10px] uppercase font-semibold tracking-wider">
            {item.category}
          </span>
          {item.color_hex && (
            <span
              className="w-4 h-4 rounded-full border border-white/40 shadow-xs"
              style={{ backgroundColor: item.color_hex }}
              title={item.color}
            />
          )}
        </div>

        {/* Hover Quick Action Buttons */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 rounded-lg bg-white/90 dark:bg-stone-900/90 hover:bg-white dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 shadow-md backdrop-blur-xs transition-colors"
            title="Edit Item"
            aria-label="Edit Item"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="p-1.5 rounded-lg bg-white/90 dark:bg-stone-900/90 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 text-stone-700 dark:text-stone-300 shadow-md backdrop-blur-xs transition-colors"
            title="Delete Item"
            aria-label="Delete Item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Info Container */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 line-clamp-1">
            {item.name}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 capitalize">
            {item.subcategory ? `${item.subcategory} • ${item.color}` : item.color}
          </p>
        </div>

        <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
          <div className="flex items-center gap-1 flex-wrap">
            {item.occasion.slice(0, 2).map((occ) => (
              <span
                key={occ}
                className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium capitalize"
              >
                {occ}
              </span>
            ))}
            {item.occasion.length > 2 && (
              <span className="text-[10px] text-stone-400">
                +{item.occasion.length - 2}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
