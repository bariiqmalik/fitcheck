import React from 'react';
import { HardDrive, Zap, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface StorageUsageBarProps {
  currentCount: number;
  onOpenUpgrade: () => void;
  compact?: boolean;
}

export const StorageUsageBar: React.FC<StorageUsageBarProps> = ({
  currentCount,
  onOpenUpgrade,
  compact = false,
}) => {
  const { profile } = useAuth();
  const plan = profile?.plan || 'free';

  const maxItems = plan === 'unlimited' ? 1000 : plan === 'pro' ? 300 : 60;
  const percentUsed = Math.min(100, Math.round((currentCount / maxItems) * 100));

  // Approx 40KB per compressed WebP image
  const estimatedKb = currentCount * 42;
  const estimatedMb = (estimatedKb / 1024).toFixed(1);

  const getBarColor = () => {
    if (percentUsed >= 90) return 'bg-rose-500';
    if (percentUsed >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={onOpenUpgrade}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-xs text-left"
        title="View Wardrobe Storage & Plans"
      >
        <div className="w-16 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${getBarColor()} transition-all duration-300`}
            style={{ width: `${percentUsed}%` }}
          />
        </div>
        <span className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">
          {currentCount}/{maxItems} items
        </span>
        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">
          {plan}
        </span>
      </button>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 flex items-center justify-center">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                Wardrobe Closet Storage
              </span>
              <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                plan === 'pro'
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  : plan === 'unlimited'
                  ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
              }`}>
                {plan === 'free' ? 'Free Capsule' : plan === 'pro' ? 'Pro Stylist' : 'VIP Haute'}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              {currentCount} of {maxItems} pieces stored &bull; ~{estimatedMb} MB used with WebP compression
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenUpgrade}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>{plan === 'free' ? 'Upgrade Capacity' : 'Manage Plan'}</span>
          <ArrowUpRight className="w-3 h-3 text-stone-400" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${getBarColor()} transition-all duration-500 rounded-full`}
          style={{ width: `${percentUsed}%` }}
        />
      </div>

      {percentUsed >= 85 && (
        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Closet nearly full ({currentCount}/{maxItems}). Upgrade to Pro to add unlimited clothes without hitting database limits!</span>
        </div>
      )}
    </div>
  );
};

