import React from 'react';
import { Sparkles, Palette } from 'lucide-react';
import { Profile } from '../../types/database.types';
import { generatePersonalizedStyleNotes } from '../../lib/stylistEngine';

interface StyleNotesDrawerProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
}

export const StyleNotesDrawer: React.FC<StyleNotesDrawerProps> = ({ profile, isOpen, onClose }) => {
  if (!isOpen) return null;

  const notes = generatePersonalizedStyleNotes(profile);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white dark:bg-stone-900 shadow-2xl border-l border-stone-200 dark:border-stone-800 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-semibold">
                Personalized Blueprint
              </span>
              <h3 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100">
                Your Style Notes
              </h3>
            </div>
            <button
              onClick={onClose}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900"
            >
              Close
            </button>
          </div>

          {/* Quick Summary Pill Box */}
          <div className="my-5 p-4 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-stone-400 uppercase text-[10px] font-semibold block">Body Shape</span>
              <span className="font-semibold text-stone-900 dark:text-stone-100 capitalize">
                {profile.body_type?.replace('_', ' ') || 'Not Set'}
              </span>
            </div>
            <div>
              <span className="text-stone-400 uppercase text-[10px] font-semibold block">Face Shape</span>
              <span className="font-semibold text-stone-900 dark:text-stone-100 capitalize">
                {profile.face_shape || 'Not Set'}
              </span>
            </div>
            <div>
              <span className="text-stone-400 uppercase text-[10px] font-semibold block">Undertone</span>
              <span className="font-semibold text-stone-900 dark:text-stone-100 capitalize">
                {profile.undertone || 'Not Set'}
              </span>
            </div>
            <div>
              <span className="text-stone-400 uppercase text-[10px] font-semibold block">Height</span>
              <span className="font-semibold text-stone-900 dark:text-stone-100">
                {profile.height_cm ? `${profile.height_cm} cm` : 'Not Set'}
              </span>
            </div>
          </div>

          {/* Personalized Fashion Rules List */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase font-semibold tracking-wider text-stone-500 dark:text-stone-400">
              Stylist Rules Tailored to You
            </h4>

            {notes.map((note, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-xs text-stone-800 dark:text-stone-200"
              >
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{note}</p>
              </div>
            ))}
          </div>

          {/* Quick Color Season Card */}
          <div className="mt-6 p-4 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs">
            <h5 className="font-semibold text-stone-900 dark:text-stone-100 mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-500" />
              Recommended Palette Anchors
            </h5>
            <p className="text-stone-600 dark:text-stone-400 mb-3 text-[11px] leading-relaxed">
              {profile.undertone === 'warm'
                ? 'Camel, warm ivory, olive, terracotta, chocolate, coral, and antique gold jewelry.'
                : profile.undertone === 'cool'
                ? 'Crisp pure white, charcoal slate, cobalt navy, emerald, ruby red, and silver jewelry.'
                : 'Blush rose, muted sage, dove grey, taupe, soft navy, and mixed metals.'}
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-100 dark:border-stone-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold shadow-xs"
          >
            Got it, back to Outfits
          </button>
        </div>
      </div>
    </div>
  );
};
