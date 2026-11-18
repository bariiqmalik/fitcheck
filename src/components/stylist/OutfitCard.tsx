import React, { useState } from 'react';
import { Bookmark, Sparkles, Check, ChevronDown, ChevronUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { OutfitRecommendation, Occasion, WeatherType } from '../../types/database.types';
import { useWardrobe } from '../../context/WardrobeContext';

interface OutfitCardProps {
  outfit: OutfitRecommendation;
  targetOccasion: Occasion;
  targetWeather: WeatherType;
  isSaved?: boolean;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({
  outfit,
  targetOccasion,
  targetWeather,
  isSaved: initialIsSaved = false,
}) => {
  const { saveOutfit } = useWardrobe();
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isSaving, setIsSaving] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Collect active items with their outfit role
  const itemsWithRoles = [
    outfit.items.outerwear ? { item: outfit.items.outerwear, role: 'Outerwear' } : null,
    outfit.items.top ? { item: outfit.items.top, role: 'Top' } : null,
    outfit.items.bottom ? { item: outfit.items.bottom, role: 'Bottom' } : null,
    outfit.items.dress ? { item: outfit.items.dress, role: 'Dress' } : null,
    outfit.items.shoes ? { item: outfit.items.shoes, role: 'Shoes' } : null,
    outfit.items.accessory ? { item: outfit.items.accessory, role: 'Accessory' } : null,
  ].filter(Boolean) as { item: any; role: string }[];

  const itemsList = itemsWithRoles.map(i => i.item);

  const handleSave = async () => {
    if (isSaved || isSaving) return;
    setIsSaving(true);

    try {
      await saveOutfit({
        title: outfit.title,
        occasion: targetOccasion,
        weather: targetWeather,
        items: itemsList as any,
        rationale: outfit.rationale,
        style_tips: outfit.styleTips,
      });

      setIsSaved(true);

      // Trigger celebratory mini confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {}
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Header Bar */}
        <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[11px] font-semibold uppercase tracking-wider">
                {outfit.vibe}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                ★ {outfit.score}% Stylist Match
              </span>
            </div>
            <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900 dark:text-stone-100 mt-1">
              {outfit.title}
            </h3>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaved || isSaving}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isSaved
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white shadow-xs'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                <span>Save Outfit</span>
              </>
            )}
          </button>
        </div>

        {/* Clothing Items Visual Showcase */}
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {itemsWithRoles.map(({ item, role }, idx) => {
              if (!item) return null;
              return (
                <div
                  key={`${item.id}-${idx}`}
                  className="group relative rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 aspect-3/4 border border-stone-200/80 dark:border-stone-700/80"
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent flex flex-col justify-end p-2.5 text-white">
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                      {role}
                    </span>
                    <span className="text-xs font-semibold line-clamp-1">
                      {item.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Stylist Rationale Section */}
        <div className="px-5 pb-5">
          <div className="p-4 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-stone-900 dark:text-stone-100 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Why this suits you</span>
            </div>
            <p className="text-stone-700 dark:text-stone-200 leading-relaxed font-normal">
              {outfit.rationale}
            </p>

            {/* Expandable Pro Styling Details */}
            {showDetails && (
              <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-700 space-y-2 text-[11px]">
                <div>
                  <strong className="text-stone-900 dark:text-stone-100 block">Facial & Neckline Harmony:</strong>
                  <span className="text-stone-600 dark:text-stone-300">{outfit.necklineAdvice}</span>
                </div>
                <div>
                  <strong className="text-stone-900 dark:text-stone-100 block">Color Season & Undertone:</strong>
                  <span className="text-stone-600 dark:text-stone-300">{outfit.colorHarmonyAdvice}</span>
                </div>
                <div>
                  <strong className="text-stone-900 dark:text-stone-100 block">Weather Adaptation:</strong>
                  <span className="text-stone-600 dark:text-stone-300">{outfit.weatherAdvice}</span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="mt-2.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>{showDetails ? 'Hide styling breakdown' : 'View full styling breakdown'}</span>
              {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* Style Tips Footer */}
      {outfit.styleTips && outfit.styleTips.length > 0 && (
        <div className="px-5 py-3 bg-stone-100 dark:bg-stone-800/90 border-t border-stone-200 dark:border-stone-700 text-[11px] text-stone-600 dark:text-stone-300 flex items-center justify-between">
          <span className="font-semibold text-stone-900 dark:text-stone-100 shrink-0">Stylist Pro Tip:</span>
          <span className="truncate ml-2 text-right">{outfit.styleTips[0]}</span>
        </div>
      )}
    </div>
  );
};
