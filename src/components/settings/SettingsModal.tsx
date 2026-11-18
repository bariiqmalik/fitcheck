import React, { useState } from 'react';
import { ShieldCheck, Moon, Sun, AlertTriangle, HardDrive, Zap, Check } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useWardrobe } from '../../context/WardrobeContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToProfile: () => void;
  onOpenUpgrade?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onNavigateToProfile,
  onOpenUpgrade,
}) => {
  const { user, profile, deleteAccount } = useAuth();
  const { items } = useWardrobe();
  const { theme, toggleTheme } = useTheme();
  const { success, error: toastError } = useToast();

  const plan = profile?.plan || 'free';
  const maxItems = plan === 'unlimited' ? 1000 : plan === 'pro' ? 300 : 60;
  const percentUsed = Math.min(100, Math.round((items.length / maxItems) * 100));

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE') return;
    setIsDeleting(true);

    try {
      const { error } = await deleteAccount();
      if (error) {
        toastError('Account deletion failed', error.message);
      } else {
        success('Account Deleted', 'All your wardrobe pieces and personal data have been permanently removed.');
        setConfirmDeleteOpen(false);
        onClose();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Settings & Privacy"
        subtitle="Manage your personal data, privacy preferences, and account."
        maxWidth="md"
      >
        <div className="space-y-6 pt-2">
          {/* Account Summary */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center font-semibold text-stone-700 dark:text-stone-300">
                {profile?.name ? profile.name[0].toUpperCase() : 'U'}
              </div>
              <div className="text-xs">
                <span className="font-semibold text-stone-900 dark:text-stone-100 block">
                  {profile?.name || 'User'}
                </span>
                <span className="text-stone-500">{user?.email || 'Demo Account'}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onNavigateToProfile();
              }}
              className="px-3 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors"
            >
              Edit Body Specs
            </button>
          </div>

          {/* Wardrobe Storage & Subscription Plan */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Wardrobe Storage & Plan
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                plan === 'pro'
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                  : plan === 'unlimited'
                  ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/40'
                  : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
              }`}>
                {plan === 'free' ? 'Free Capsule' : plan === 'pro' ? 'Pro Stylist' : 'VIP Haute'}
              </span>
            </div>

            {/* Storage Progress Meter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-400">
                <span>{items.length} of {maxItems} pieces digitized</span>
                <span>{percentUsed}% capacity</span>
              </div>
              <div className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    percentUsed >= 90 ? 'bg-rose-500' : percentUsed >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${percentUsed}%` }}
                />
              </div>
            </div>

            {/* Compression & Optimization Note */}
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pt-1">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>High-efficiency WebP image compression active (~35KB/item)</span>
            </div>

            {onOpenUpgrade && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenUpgrade();
                }}
                className="w-full mt-2 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold hover:bg-stone-800 dark:hover:bg-white transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>{plan === 'free' ? 'Upgrade Plan & Storage' : 'Change / Manage Plan'}</span>
              </button>
            )}
          </div>

          {/* Theme Preference */}
          <div className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800">
            <div>
              <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 block">
                Appearance Mode
              </span>
              <span className="text-[11px] text-stone-500">
                Toggle between light aesthetic and dark mode
              </span>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-medium bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-100"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span className="capitalize">{theme}</span>
            </button>
          </div>

          {/* Privacy Note / GDPR */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-stone-900 dark:text-stone-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Privacy & Row Level Security Guarantee</span>
            </div>
            <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
              Fitting Room operates under strict PostgreSQL Row Level Security (RLS). Your body measurements, facial shape, skin undertone, and wardrobe images are stored in a dedicated user vault ({user?.id}). No other user or outside service can read or query your closet data.
            </p>
          </div>

          {/* Delete Account Danger Zone */}
          <div className="pt-4 border-t border-rose-100 dark:border-rose-950/60">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 block">
                  Delete Account & All Data
                </span>
                <span className="text-[11px] text-stone-500">
                  Permanently delete wardrobe photos, profile, and lookbook.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(true)}
                className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-semibold transition-colors"
              >
                Delete Data
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Danger Confirmation Modal */}
      <Modal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        title="Permanently Delete Account?"
        subtitle="This action is irreversible and deletes all wardrobe items, pictures, and profiles."
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <p>
              Type <strong>DELETE</strong> below to confirm that you want all your digitized clothes and style profile deleted immediately.
            </p>
          </div>

          <input
            type="text"
            value={deleteConfirmationText}
            onChange={(e) => setDeleteConfirmationText(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setConfirmDeleteOpen(false)}
              className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleteConfirmationText !== 'DELETE' || isDeleting}
              onClick={handleDeleteAccount}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs disabled:opacity-40 transition-colors"
            >
              {isDeleting ? 'Deleting Everything...' : 'Confirm Account Deletion'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
