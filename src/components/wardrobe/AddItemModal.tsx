import React, { useState, useRef } from 'react';
import { Upload, Check, AlertCircle, ChevronDown, ChevronUp, Sparkles, Wand2, Zap, HardDrive, AlertTriangle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useWardrobe } from '../../context/WardrobeContext';
import { useAuth } from '../../context/AuthContext';
import { ClothingCategory, Occasion, WeatherType } from '../../types/database.types';
import { compressImage, CompressionResult } from '../../lib/imageCompressor';
import { detectClothingFromImage, DetectionResult } from '../../lib/clothingDetector';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUpgrade?: () => void;
}

const CATEGORIES: { cat: ClothingCategory; label: string; icon: string }[] = [
  { cat: 'top', label: 'Top', icon: '👕' },
  { cat: 'bottom', label: 'Bottom', icon: '👖' },
  { cat: 'dress', label: 'Dress', icon: '👗' },
  { cat: 'outerwear', label: 'Outerwear', icon: '🧥' },
  { cat: 'shoes', label: 'Shoes', icon: '👟' },
  { cat: 'accessory', label: 'Accessory', icon: '👜' },
];

const POPULAR_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Navy', hex: '#1e3a8a' },
  { name: 'Charcoal', hex: '#374151' },
  { name: 'Beige', hex: '#d4b996' },
  { name: 'Camel', hex: '#c19a6b' },
  { name: 'Olive', hex: '#556b2f' },
  { name: 'Emerald', hex: '#046307' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Blue', hex: '#4682b4' },
];

const QUICK_DEMO_PRESETS = [
  {
    name: 'White Classic T-Shirt',
    category: 'top' as ClothingCategory,
    color: 'White',
    colorHex: '#ffffff',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Straight Leg Denim Jeans',
    category: 'bottom' as ClothingCategory,
    color: 'Navy',
    colorHex: '#1e3a8a',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Tailored Black Blazer',
    category: 'outerwear' as ClothingCategory,
    color: 'Black',
    colorHex: '#000000',
    image: 'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Minimal White Sneakers',
    category: 'shoes' as ClothingCategory,
    color: 'White',
    colorHex: '#ffffff',
    image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=80',
  },
];

export const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onOpenUpgrade }) => {
  const { items, addItem } = useWardrobe();
  const { profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const plan = profile?.plan || 'free';
  const maxItems = plan === 'unlimited' ? 1000 : plan === 'pro' ? 300 : 60;
  const isAtCapacity = items.length >= maxItems;

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [compressionInfo, setCompressionInfo] = useState<CompressionResult | null>(null);
  const [compressing, setCompressing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState<boolean>(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);

  // Simplified Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ClothingCategory>('top');
  const [color, setColor] = useState('Black');
  const [colorHex, setColorHex] = useState('#000000');

  // Optional Advanced Fields (hidden by default for extreme simplicity)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [subcategory, setSubcategory] = useState('');
  const [selectedOccasions, setSelectedOccasions] = useState<Occasion[]>(['casual', 'work']);
  const [selectedWeather, setSelectedWeather] = useState<WeatherType[]>(['warm', 'cool']);
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const processFile = async (selectedFile: File) => {
    setErrorMsg(null);
    setCompressing(true);

    try {
      // High-efficiency compression to max 800px & 0.74 WebP (~35KB)
      const result = await compressImage(selectedFile, 800, 800, 0.74);
      setFile(result.file);
      setPreviewUrl(result.previewUrl);
      setCompressionInfo(result);
      setCompressing(false);

      // 🪄 Run Instant AI Neural Vision Garment & Color Detection!
      setIsAnalyzingAI(true);
      const detected = await detectClothingFromImage(selectedFile, result.canvas);
      setDetectionResult(detected);
      setName(detected.name);
      setCategory(detected.category);
      setColor(detected.color);
      setColorHex(detected.colorHex);
      setSubcategory(detected.subcategory);
    } catch {
      setErrorMsg('Failed to process image. Please try another file.');
    } finally {
      setCompressing(false);
      setIsAnalyzingAI(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    await processFile(selectedFile);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      await processFile(droppedFile);
    } else {
      setErrorMsg('Please drop a valid image file (JPG, PNG, WEBP).');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleSelectPreset = (preset: typeof QUICK_DEMO_PRESETS[0]) => {
    setName(preset.name);
    setCategory(preset.category);
    setColor(preset.color);
    setColorHex(preset.colorHex);
    setPreviewUrl(preset.image);
    setFile(null);
    setCompressionInfo(null);
    setDetectionResult({
      name: preset.name,
      category: preset.category,
      subcategory: preset.name.split(' ').slice(1).join(' '),
      color: preset.color,
      colorHex: preset.colorHex,
      confidence: 0.99,
    });
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!file && !previewUrl) {
      setErrorMsg('Please upload a photo or pick a quick demo item above.');
      return;
    }

    if (!name.trim()) {
      setErrorMsg('Please enter a name for this piece.');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await addItem(
        {
          name: name.trim(),
          category,
          subcategory: subcategory.trim() || undefined,
          color,
          color_hex: colorHex,
          occasion: selectedOccasions.length > 0 ? selectedOccasions : ['casual', 'work'],
          weather_suitability: selectedWeather.length > 0 ? selectedWeather : ['warm', 'cool'],
          image_url: previewUrl,
          notes: notes.trim() || undefined,
        },
        file
      );

      if (error) {
        setErrorMsg(error.message);
      } else {
        // Reset and close
        setName('');
        setSubcategory('');
        setNotes('');
        setFile(null);
        setPreviewUrl('');
        setCompressionInfo(null);
        setShowAdvanced(false);
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Clothing Piece"
      subtitle="Quickly snap or upload a piece to your closet."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Capacity / Storage Status Banner */}
        {isAtCapacity ? (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide text-amber-700 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{plan === 'free' ? 'Free Capsule Limit Reached' : 'Closet Limit Reached'} ({items.length}/{maxItems})</span>
              </div>
              {onOpenUpgrade && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenUpgrade();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs transition-colors flex items-center gap-1 shadow-xs"
                >
                  <Zap className="w-3 h-3" />
                  <span>Upgrade</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
              You have reached your {plan === 'free' ? 'free 60-item' : `${maxItems}-item`} wardrobe capacity. Upgrade to store up to 1,000 items and save database storage.
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-400">
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-stone-400" />
              <span>Closet Capacity: <strong>{items.length} / {maxItems}</strong> items</span>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {maxItems - items.length} slots available
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ⚡ Quick Demo Fill Row */}
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Quick Test: Tap any preset to auto-fill</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_DEMO_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-850 hover:bg-stone-100 dark:hover:bg-stone-800 border border-amber-200 dark:border-amber-700/60 text-[11px] font-medium text-stone-800 dark:text-stone-200 shadow-2xs transition-colors"
              >
                + {p.name.split(' ')[0]} {p.name.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        {/* 1. Photo Upload (Clean, Drag & Drop, Auto-compressed) */}
        <div>
          {previewUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 group h-44">
              <img
                src={previewUrl}
                alt="Clothing Preview"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-white text-stone-900 text-xs font-semibold shadow-md"
                >
                  Change Photo
                </button>
              </div>

              {compressionInfo && (
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-stone-900/85 backdrop-blur-xs text-[10px] text-white flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Compressed: {compressionInfo.originalSizeKb} KB &rarr; {compressionInfo.compressedSizeKb} KB</span>
                  <span className="text-emerald-400 font-bold">({compressionInfo.savingsPercent}% saved)</span>
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30'
                  : 'border-stone-300 dark:border-stone-700 hover:border-amber-500 bg-stone-50 dark:bg-stone-850 hover:bg-stone-100'
              }`}
            >
              <Upload className={`w-6 h-6 mx-auto mb-1.5 ${isDragging ? 'text-amber-500' : 'text-stone-400'}`} />
              <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                {compressing ? 'Compressing photo on device...' : isDragging ? 'Drop photo to compress & upload' : 'Click or drop clothing photo here'}
              </p>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Supports JPG, PNG, WEBP &bull; Auto-compressed to ~35KB with zero quality loss
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* 🪄 AI Vision Analyzing Feedback */}
        {isAnalyzingAI && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-xs flex items-center gap-2.5 animate-pulse">
            <div className="w-4 h-4 border-2 border-amber-600 dark:border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
            <div>
              <span className="font-semibold text-amber-900 dark:text-amber-200 block">
                Running Neural Vision Classifier...
              </span>
              <span className="text-[11px] text-amber-700 dark:text-amber-400">
                Examining leather textures, front zipper line, and garment category
              </span>
            </div>
          </div>
        )}

        {/* 🪄 AI Detection Banner */}
        {detectionResult && !isAnalyzingAI && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-emerald-500/10 border border-emerald-500/30 dark:border-emerald-500/20 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Wand2 className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <span>Neural Vision AI</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 rounded">
                    {Math.round(detectionResult.confidence * 100)}% Match
                  </span>
                </span>
                <span className="text-[11px] text-stone-600 dark:text-stone-400 capitalize">
                  {detectionResult.color} • {detectionResult.category} ({detectionResult.name})
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
              <span
                className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs inline-block"
                style={{ backgroundColor: detectionResult.colorHex }}
              />
              <span className="text-[10px] font-semibold text-stone-700 dark:text-stone-300">
                {detectionResult.color}
              </span>
            </div>
          </div>
        )}

        {/* 2. Item Name */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Item Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Linen Button-Down Shirt"
            className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* 3. Category (6 simple clean buttons) */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
            Category *
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c.cat}
                type="button"
                onClick={() => setCategory(c.cat)}
                className={`py-2 px-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  category === c.cat
                    ? 'border-stone-900 dark:border-stone-100 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-semibold shadow-xs'
                    : 'border-stone-200 dark:border-stone-750 bg-stone-50 dark:bg-stone-850 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                }`}
              >
                <span>{c.icon}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Color Palette (Compact Dots) */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
            Main Color: <span className="font-normal text-stone-500">{color}</span>
          </label>
          <div className="flex flex-wrap gap-2 items-center">
            {POPULAR_COLORS.map((pc) => (
              <button
                key={pc.name}
                type="button"
                onClick={() => {
                  setColor(pc.name);
                  setColorHex(pc.hex);
                }}
                className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                  color === pc.name
                    ? 'ring-2 ring-stone-900 dark:ring-stone-100 scale-110 shadow-sm'
                    : 'border-black/20 hover:scale-105'
                }`}
                style={{ backgroundColor: pc.hex }}
                title={pc.name}
              >
                {color === pc.name && (
                  <Check className={`w-3.5 h-3.5 ${pc.hex === '#ffffff' ? 'text-stone-900' : 'text-white'}`} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Optional: Collapsible More Options */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-amber-700 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>{showAdvanced ? '− Hide optional details' : '+ More options (occasions, notes)'}</span>
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showAdvanced && (
            <div className="mt-3 p-3.5 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  Cut or Style Description
                </label>
                <input
                  type="text"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  placeholder="e.g. Slim Fit, A-line, Oversized"
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  Fabric or Care Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 100% Cotton, Dry clean only"
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 text-xs font-semibold"
          >
            Cancel
          </button>
          {isAtCapacity ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenUpgrade?.();
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Upgrade Plan to Add Clothes</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold shadow-md hover:bg-stone-800 dark:hover:bg-white transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {submitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white dark:border-stone-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Save to Closet</span>
                  <Check className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
};
