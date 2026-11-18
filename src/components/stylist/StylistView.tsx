import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Sun,
  CloudSun,
  Wind,
  Snowflake,
  CloudRain,
  Briefcase,
  Coffee,
  Wine,
  PartyPopper,
  Dumbbell,
  BookOpen,
  RefreshCw,
  Plus,
  MapPin,
  Navigation,
  AlertCircle,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWardrobe } from '../../context/WardrobeContext';
import { Occasion, WeatherType, OutfitRecommendation } from '../../types/database.types';
import { recommendOutfits } from '../../lib/stylistEngine';
import { fetchLiveLocationWeather, getCachedWeather, LiveWeatherData } from '../../lib/weatherService';
import { OutfitCard } from './OutfitCard';
import { StyleNotesDrawer } from './StyleNotesDrawer';

interface StylistViewProps {
  onOpenAddItem: () => void;
}

export const StylistView: React.FC<StylistViewProps> = ({
  onOpenAddItem,
}) => {
  const { profile } = useAuth();
  const { items, seedSampleWardrobe } = useWardrobe();

  // Generator parameters
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion>('casual');
  const [selectedWeather, setSelectedWeather] = useState<WeatherType>('warm');
  const [recommendations, setRecommendations] = useState<OutfitRecommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showStyleNotes, setShowStyleNotes] = useState(false);

  // Live Location Weather states
  const [liveWeather, setLiveWeather] = useState<LiveWeatherData | null>(() => getCachedWeather());
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [showManualWeather, setShowManualWeather] = useState(false);

  const OCCASIONS: { id: Occasion; label: string; icon: React.ReactNode }[] = [
    { id: 'casual', label: 'Casual / Everyday', icon: <Coffee className="w-4 h-4" /> },
    { id: 'work', label: 'Work / Business', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'formal', label: 'Formal / Gala', icon: <Wine className="w-4 h-4" /> },
    { id: 'party', label: 'Party / Evening', icon: <PartyPopper className="w-4 h-4" /> },
    { id: 'sport', label: 'Sport / Athleisure', icon: <Dumbbell className="w-4 h-4" /> },
  ];

  const WEATHERS: { id: WeatherType; label: string; temp: string; icon: React.ReactNode }[] = [
    { id: 'hot', label: 'Hot / Summer', temp: '> 27°C', icon: <Sun className="w-4 h-4" /> },
    { id: 'warm', label: 'Warm / Mild', temp: '20°–26°C', icon: <CloudSun className="w-4 h-4" /> },
    { id: 'cool', label: 'Cool / Chilly', temp: '12°–19°C', icon: <Wind className="w-4 h-4" /> },
    { id: 'cold', label: 'Cold / Winter', temp: '< 12°C', icon: <Snowflake className="w-4 h-4" /> },
    { id: 'rainy', label: 'Rainy', temp: 'Wet Weather', icon: <CloudRain className="w-4 h-4" /> },
  ];

  const handleGenerate = (occ = selectedOccasion, weath = selectedWeather) => {
    if (!profile) return;
    setIsGenerating(true);

    setTimeout(() => {
      const results = recommendOutfits(items, profile, occ, weath);
      setRecommendations(results);
      setIsGenerating(false);
    }, 200);
  };

  const handleSelectOccasion = (occ: Occasion) => {
    setSelectedOccasion(occ);
    handleGenerate(occ, selectedWeather);
  };

  const handleSelectWeather = (weath: WeatherType) => {
    setSelectedWeather(weath);
    handleGenerate(selectedOccasion, weath);
  };

  const requestLocationWeather = async () => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const data = await fetchLiveLocationWeather();
      setLiveWeather(data);
      setSelectedWeather(data.weatherType);
      handleGenerate(selectedOccasion, data.weatherType);
    } catch (err: any) {
      setWeatherError(err.message || 'Could not detect location weather.');
    } finally {
      setWeatherLoading(false);
    }
  };

  // Generate on first mount or when items change, and check location weather
  useEffect(() => {
    const cached = getCachedWeather();
    if (cached) {
      setLiveWeather(cached);
      setSelectedWeather(cached.weatherType);
      if (items.length > 0 && profile) {
        handleGenerate(selectedOccasion, cached.weatherType);
      }
    } else {
      requestLocationWeather();
    }
  }, [items, profile]);

  const hasEnoughPieces = items.length >= 2;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Wardrobe Stylist</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100">
            What Should I Wear Today?
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Calculated against your <span className="font-semibold text-stone-800 dark:text-stone-200 capitalize">{profile?.body_type?.replace('_', ' ') || 'silhouette'}</span> frame,{' '}
            <span className="font-semibold text-stone-800 dark:text-stone-200 capitalize">{profile?.face_shape || 'face shape'}</span> neckline, and{' '}
            <span className="font-semibold text-stone-800 dark:text-stone-200 capitalize">{profile?.undertone || 'skin undertone'}</span> palette.
          </p>
        </div>

        {profile && (
          <button
            onClick={() => setShowStyleNotes(true)}
            className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors self-start md:self-auto"
          >
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>Your Style Notes</span>
          </button>
        )}
      </div>

      {/* Control Panel: Occasion & Live Location Weather */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs mb-10 space-y-5">
        {/* Top Header: Occasion Title + Live GPS Weather Widget */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-0.5">
              Personalized Curation
            </span>
            <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
              Where Are You Going Today?
            </h2>
          </div>

          {/* Live Weather Indicator via Location Permission */}
          <div className="flex items-center gap-2 flex-wrap">
            {weatherLoading ? (
              <div className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-xs flex items-center gap-2 text-amber-900 dark:text-amber-200 animate-pulse">
                <div className="w-3.5 h-3.5 border-2 border-amber-600 dark:border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
                <span>Reading GPS &amp; local temperature...</span>
              </div>
            ) : liveWeather ? (
              <div className="flex items-center gap-2.5 p-1.5 px-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-stone-100">
                    <span>{liveWeather.city}</span>
                    <span className="text-amber-600 dark:text-amber-400">&bull; {liveWeather.temperatureC}&deg;C</span>
                    <span className="text-[11px] font-normal text-stone-500 dark:text-stone-400">({liveWeather.conditionText})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-stone-500 dark:text-stone-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Live GPS Weather &bull; Auto-adapting to {liveWeather.weatherType.toUpperCase()}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={requestLocationWeather}
                  title="Refresh GPS Weather"
                  className="ml-1 p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={requestLocationWeather}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Enable Location for Live Weather</span>
              </button>
            )}

            {/* Discreet Manual Override Toggle */}
            <button
              type="button"
              onClick={() => setShowManualWeather(!showManualWeather)}
              className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 transition-colors text-xs flex items-center gap-1"
              title="Change weather manually"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{showManualWeather ? 'Hide' : 'Override'}</span>
            </button>
          </div>
        </div>

        {/* Occasion Selection Buttons (Click any to instantly update looks) */}
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {OCCASIONS.map((occ) => {
              const isSelected = selectedOccasion === occ.id;
              return (
                <button
                  key={occ.id}
                  type="button"
                  onClick={() => handleSelectOccasion(occ.id)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-xs font-semibold transition-all text-left ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500 text-stone-950 ring-2 ring-amber-500/40 shadow-sm'
                      : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                  }`}
                >
                  <span className={isSelected ? 'text-stone-950' : 'text-stone-400'}>
                    {occ.icon}
                  </span>
                  <span>{occ.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Manual Weather Override (shown only if user clicks override or if location blocked) */}
        {(showManualWeather || (weatherError && !liveWeather)) && (
          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wide">
                Manual Weather Override
              </span>
              {weatherError && (
                <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{weatherError}</span>
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {WEATHERS.map((weath) => {
                const isSelected = selectedWeather === weath.id;
                return (
                  <button
                    key={weath.id}
                    type="button"
                    onClick={() => handleSelectWeather(weath.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500 text-stone-950'
                        : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <span>{weath.icon}</span>
                    <span>{weath.label.split(' / ')[0]}</span>
                    <span className="text-[10px] opacity-75">{weath.temp}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Generate CTA Button */}
        <div className="pt-2 flex items-center justify-between border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
            <span>Intelligent combinations across all {items.length} items in your closet</span>
            {liveWeather && (
              <span className="hidden sm:inline text-amber-700 dark:text-amber-400 font-medium">
                &bull; Matched to {liveWeather.city} ({liveWeather.temperatureC}&deg;C {liveWeather.conditionText})
              </span>
            )}
          </div>
          <button
            type="button"
            disabled={isGenerating || !hasEnoughPieces}
            onClick={() => handleGenerate()}
            className="px-6 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold shadow-md hover:bg-stone-800 dark:hover:bg-white transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-white dark:border-stone-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400 dark:text-amber-600" />
                <span>Re-Curate Outfits</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Outfit Recommendations Section */}
      {!hasEnoughPieces ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 mx-auto flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100">
            Need at least 2 pieces in your closet
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-sm mx-auto mt-1 mb-6">
            Add at least two clothing pieces (or load the sample wardrobe) to engineer complete outfit combinations.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onOpenAddItem}
              className="px-4 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Clothes</span>
            </button>
            <button
              onClick={() => seedSampleWardrobe()}
              className="px-4 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 text-xs font-semibold flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Sample Wardrobe</span>
            </button>
          </div>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
              Top 3 Outfits For You
            </h2>
            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating}
              className="px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-xs text-amber-600 dark:text-amber-400 font-semibold hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Shuffle Looks</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {recommendations.map((rec) => (
              <OutfitCard
                key={rec.id}
                outfit={rec}
                targetOccasion={selectedOccasion}
                targetWeather={selectedWeather}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* Style Notes Drawer */}
      {profile && (
        <StyleNotesDrawer
          profile={profile}
          isOpen={showStyleNotes}
          onClose={() => setShowStyleNotes(false)}
        />
      )}
    </div>
  );
};
