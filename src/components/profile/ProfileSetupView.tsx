import React, { useState, useRef } from 'react';
import { User, Sparkles, Check, Camera, Ruler, Weight, Calendar, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { BodyType, FaceShape, Undertone, Profile } from '../../types/database.types';
import { compressImage } from '../../lib/imageCompressor';
import { supabase } from '../../lib/supabase';

interface ProfileSetupProps {
  onCompleted?: () => void;
  isInitialSetup?: boolean;
}

export const ProfileSetupView: React.FC<ProfileSetupProps> = ({
  onCompleted,
  isInitialSetup = false,
}) => {
  const { profile, updateProfile, isDemoMode, user } = useAuth();
  const { success, error: toastError } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState(profile?.name || '');
  const [age, setAge] = useState<number | ''>(profile?.age || '');
  const [heightCm, setHeightCm] = useState<number | ''>(profile?.height_cm || '');
  const [weightKg, setWeightKg] = useState<number | ''>(profile?.weight_kg || '');
  const [bodyType, setBodyType] = useState<BodyType | null>(profile?.body_type || null);
  const [faceShape, setFaceShape] = useState<FaceShape | null>(profile?.face_shape || null);
  const [skinTone, setSkinTone] = useState<string>(profile?.skin_tone || 'Medium Olive');
  const [undertone, setUndertone] = useState<Undertone | null>(profile?.undertone || null);
  const [avatarUrl, setAvatarUrl] = useState<string>(profile?.avatar_url || '');

  const BODY_TYPES: { type: BodyType; label: string; desc: string }[] = [
    {
      type: 'hourglass',
      label: 'Hourglass',
      desc: 'Bust and hips are balanced with a distinctly defined waistline.',
    },
    {
      type: 'pear',
      label: 'Pear / Triangle',
      desc: 'Hips and thighs are wider than shoulders; slender upper body.',
    },
    {
      type: 'inverted_triangle',
      label: 'Inverted Triangle',
      desc: 'Shoulders and chest are wider than hips with a straight waist.',
    },
    {
      type: 'rectangle',
      label: 'Rectangle',
      desc: 'Shoulders, waist, and hips are of similar proportion; athletic lean.',
    },
    {
      type: 'round',
      label: 'Round / Apple',
      desc: 'Fuller bust and midsection with shapely legs and arms.',
    },
    {
      type: 'athletic',
      label: 'Athletic',
      desc: 'Well-proportioned, muscular definition with broader frame.',
    },
  ];

  const FACE_SHAPES: { shape: FaceShape; label: string; desc: string }[] = [
    {
      shape: 'oval',
      label: 'Oval',
      desc: 'Length is about 1.5x width with soft curved chin and balanced forehead.',
    },
    {
      shape: 'round',
      label: 'Round',
      desc: 'Width and length are nearly equal with rounded jawline and cheeks.',
    },
    {
      shape: 'square',
      label: 'Square',
      desc: 'Strong, defined jawline with forehead and jaw of equal width.',
    },
    {
      shape: 'heart',
      label: 'Heart',
      desc: 'Broader forehead and cheekbones tapering to a pointed, delicate chin.',
    },
    {
      shape: 'oblong',
      label: 'Oblong',
      desc: 'Longer than it is wide, with straight sides and gentle chin curve.',
    },
    {
      shape: 'diamond',
      label: 'Diamond',
      desc: 'High prominent cheekbones with narrow forehead and narrow jaw.',
    },
  ];

  const SKIN_TONES = [
    { name: 'Fair Porcelain', color: '#fbe7d5' },
    { name: 'Light Ivory', color: '#f3d3b4' },
    { name: 'Warm Beige', color: '#e8be99' },
    { name: 'Medium Olive', color: '#d09f7a' },
    { name: 'Golden Tan', color: '#b97f56' },
    { name: 'Deep Caramel', color: '#8d5635' },
    { name: 'Rich Espresso', color: '#4d2a1b' },
  ];

  const UNDERTONES: { tone: Undertone; label: string; desc: string; guide: string }[] = [
    {
      tone: 'warm',
      label: 'Warm',
      desc: 'Golden, peach, yellow, or olive cast.',
      guide: 'Veins appear greenish; gold jewelry flatters your skin best.',
    },
    {
      tone: 'cool',
      label: 'Cool',
      desc: 'Rose, red, pink, or bluish hues.',
      guide: 'Veins appear blue/purple; silver jewelry makes your skin glow.',
    },
    {
      tone: 'neutral',
      label: 'Neutral',
      desc: 'Balanced mix of warm and cool undertones.',
      guide: 'Both gold and silver look equally radiant on you.',
    },
  ];

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    try {
      const compressed = await compressImage(file, 600, 600, 0.85);

      if (isDemoMode) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatarUrl(reader.result as string);
          setUploadingAvatar(false);
          success('Photo updated!');
        };
        reader.readAsDataURL(compressed.file);
        return;
      }

      const fileExt = compressed.file.name.split('.').pop() || 'webp';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, compressed.file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
      success('Photo uploaded successfully');
    } catch (err: any) {
      toastError('Avatar upload failed', err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toastError('Missing Information', 'Please enter your name.');
      return;
    }

    if (!bodyType) {
      toastError('Select Body Type', 'Please select your body silhouette so our engine can tailor fits.');
      return;
    }

    if (!faceShape) {
      toastError('Select Face Shape', 'Please select your face shape for neckline recommendations.');
      return;
    }

    if (!undertone) {
      toastError('Select Undertone', 'Please choose your skin undertone for color harmony analysis.');
      return;
    }

    setSubmitting(true);

    try {
      const updates: Partial<Profile> = {
        name: name.trim(),
        age: age ? Number(age) : null,
        height_cm: heightCm ? Number(heightCm) : null,
        weight_kg: weightKg ? Number(weightKg) : null,
        body_type: bodyType,
        face_shape: faceShape,
        skin_tone: skinTone,
        undertone: undertone,
        avatar_url: avatarUrl || null,
        profile_completed: true,
      };

      const { error } = await updateProfile(updates);

      if (error) {
        toastError('Failed to save profile', error.message);
      } else {
        // Trigger celebratory confetti if this completed their profile!
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}

        success('Styling Profile Saved!', 'Your personalized fitting room is fully customized.');
        if (onCompleted) {
          onCompleted();
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Title Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs font-semibold text-amber-800 dark:text-amber-300 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          {isInitialSetup ? 'Step 1 of 1: Personal Silhouette Analysis' : 'Personal Style Profile'}
        </div>
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100">
          {isInitialSetup ? 'Welcome to Your Personal Fitting Room' : 'Edit Your Styling Profile'}
        </h1>
        <p className="text-sm sm:text-base text-stone-500 dark:text-stone-400 max-w-xl mx-auto mt-2">
          Our stylist algorithm combines your body geometry, face shape, and undertone to suggest outfits tailored specifically to you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Section 1: Basic Identity & Optional Photo */}
        <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            1. Personal Details & Photo
          </h2>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 pb-8 border-b border-stone-100 dark:border-stone-800">
            {/* Avatar Uploader */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 flex items-center justify-center shadow-inner">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-stone-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-md hover:scale-105 transition-transform"
                title="Upload Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
            </div>

            <div className="text-center sm:text-left flex-1">
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Face or Full-Length Photo (Optional)
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm">
                A photo helps personalize your Fitting Room avatar. Photos are compressed on your device and kept private in your personal storage folder.
              </p>
              {uploadingAvatar && (
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium inline-block mt-2">
                  Optimizing & uploading...
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Camille Laurent"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Age
              </label>
              <input
                type="number"
                min="12"
                max="110"
                value={age}
                onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 28"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5" />
                Height (cm)
              </label>
              <input
                type="number"
                min="100"
                max="240"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 170"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5 flex items-center gap-1.5">
                <Weight className="w-3.5 h-3.5" />
                Weight (kg)
              </label>
              <input
                type="number"
                min="30"
                max="250"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 62"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Body Type Geometry */}
        <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                2. Body Silhouette *
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Select the shape that most closely reflects your natural body contours.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {BODY_TYPES.map((item) => {
              const isSelected = bodyType === item.type;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setBodyType(item.type)}
                  className={`p-4 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? 'border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-stone-800/90 shadow-sm ring-1 ring-stone-900 dark:ring-stone-100'
                      : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                      {item.label}
                    </span>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                    {item.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Face Shape (Neckline Advisor) */}
        <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="mb-4">
            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              3. Face Shape (For Neckline Advice) *
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Different collars and necklines frame each facial structure differently.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {FACE_SHAPES.map((item) => {
              const isSelected = faceShape === item.shape;
              return (
                <button
                  key={item.shape}
                  type="button"
                  onClick={() => setFaceShape(item.shape)}
                  className={`p-4 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? 'border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-stone-800/90 shadow-sm ring-1 ring-stone-900 dark:ring-stone-100'
                      : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                      {item.label}
                    </span>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                    {item.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 4: Skin Tone & Undertone (Color Harmonization) */}
        <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="mb-6">
            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              4. Skin Tone & Undertone *
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Determines whether warm earthy hues, cool crisp tones, or neutral palettes make your skin pop.
            </p>
          </div>

          {/* Skin Tone Palette Swatches */}
          <div className="mb-8">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-3">
              Surface Tone: <span className="text-stone-900 dark:text-stone-100 font-medium normal-case">{skinTone}</span>
            </label>
            <div className="flex flex-wrap gap-2.5">
              {SKIN_TONES.map((st) => (
                <button
                  key={st.name}
                  type="button"
                  onClick={() => setSkinTone(st.name)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                    skinTone === st.name
                      ? 'border-stone-900 dark:border-stone-100 bg-stone-100 dark:bg-stone-800 font-semibold ring-1 ring-stone-900 dark:ring-stone-100'
                      : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: st.color }}
                  />
                  <span>{st.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Undertone Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-3">
              Sub-Surface Undertone (Crucial for Color Season) *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {UNDERTONES.map((ut) => {
                const isSelected = undertone === ut.tone;
                return (
                  <button
                    key={ut.tone}
                    type="button"
                    onClick={() => setUndertone(ut.tone)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-stone-800/90 shadow-sm ring-1 ring-stone-900 dark:ring-stone-100'
                        : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                        {ut.label} Undertone
                      </span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 font-medium mb-1.5">
                      {ut.desc}
                    </p>
                    <p className="text-[11px] text-stone-400 leading-relaxed italic">
                      💡 {ut.guide}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Dimensions & style parameters are kept strictly confidential</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-medium text-sm flex items-center gap-2 hover:bg-stone-800 dark:hover:bg-white transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white dark:border-stone-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isInitialSetup ? 'Enter Fitting Room' : 'Save Style Profile'}</span>
                <Sparkles className="w-4 h-4 text-amber-400 dark:text-amber-600" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
