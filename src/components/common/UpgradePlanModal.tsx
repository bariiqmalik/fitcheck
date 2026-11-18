import React, { useState } from 'react';
import { Sparkles, Check, Zap, Crown, ShieldCheck, ArrowRight } from 'lucide-react';
import { Modal } from './Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import confetti from 'canvas-confetti';

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentItemsCount: number;
}

export const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({
  isOpen,
  onClose,
  currentItemsCount,
}) => {
  const { profile, updateProfile } = useAuth();
  const { success } = useToast();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [upgrading, setUpgrading] = useState(false);

  const currentPlan = profile?.plan || 'free';

  const handleSelectPlan = async (targetPlan: 'free' | 'pro' | 'unlimited') => {
    if (targetPlan === currentPlan) return;
    setUpgrading(true);

    try {
      await updateProfile({ plan: targetPlan });

      if (targetPlan !== 'free') {
        try {
          confetti({
            particleCount: 75,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}
      }

      success(
        targetPlan === 'pro' ? 'Upgraded to Pro Stylist!' : targetPlan === 'unlimited' ? 'Upgraded to VIP Haute!' : 'Switched to Free Plan',
        `Your wardrobe capacity has been expanded.`
      );
      onClose();
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Wardrobe Storage & Plans"
      subtitle="Expand your closet capacity and unlock high-end stylist features."
      maxWidth="3xl"
    >
      <div className="space-y-6 pt-2">
        {/* Billing Switch */}
        <div className="flex items-center justify-center gap-3">
          <span className={`text-xs font-semibold ${billingCycle === 'monthly' ? 'text-stone-900 dark:text-stone-100' : 'text-stone-400'}`}>
            Monthly
          </span>
          <button
            type="button"
            onClick={() => setBillingCycle(b => b === 'monthly' ? 'yearly' : 'monthly')}
            className="w-12 h-6 rounded-full bg-stone-200 dark:bg-stone-700 p-0.5 transition-colors relative"
          >
            <div
              className={`w-5 h-5 rounded-full bg-amber-500 shadow-sm transform transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-semibold ${billingCycle === 'yearly' ? 'text-stone-900 dark:text-stone-100' : 'text-stone-400'}`}>
              Yearly
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
              Save 50%
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Free Capsule */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
            currentPlan === 'free'
              ? 'border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-stone-800/80 ring-1 ring-stone-900 dark:ring-stone-100'
              : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Free Capsule</span>
                {currentPlan === 'free' && (
                  <span className="px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-700 text-[10px] font-bold text-stone-800 dark:text-stone-200">
                    Current
                  </span>
                )}
              </div>
              <div className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-1">₹0</div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
                Generous capsule wardrobe for everyday dressing.
              </p>

              <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-300 border-t border-stone-100 dark:border-stone-800 pt-3">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Up to <strong>60 clothing pieces</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>20 saved outfit looks</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>AI color &amp; garment detection</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Live GPS weather adaptation</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              disabled={currentPlan === 'free' || upgrading}
              onClick={() => handleSelectPlan('free')}
              className="mt-6 w-full py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40"
            >
              {currentPlan === 'free' ? 'Active Plan' : 'Downgrade to Free'}
            </button>
          </div>

          {/* 2. Pro Stylist (Featured) */}
          <div className={`p-5 rounded-2xl border-2 relative flex flex-col justify-between transition-all ${
            currentPlan === 'pro'
              ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30'
              : 'border-amber-500/60 bg-white dark:bg-stone-900 shadow-lg'
          }`}>
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold uppercase tracking-wider shadow-sm">
              Most Popular &bull; Affordable
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Pro Stylist
                </span>
                {currentPlan === 'pro' && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500 text-stone-950 text-[10px] font-bold">
                    Active
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                  {billingCycle === 'yearly' ? '₹49' : '₹99'}
                </span>
                <span className="text-xs text-stone-400">/ month</span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
                Affordable full wardrobe digitization with unlimited AI looks.
              </p>

              <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-300 border-t border-stone-100 dark:border-stone-800 pt-3">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Up to <strong>300 clothing pieces</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>Unlimited</strong> saved looks</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Priority Neural Vision AI</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Seasonal suitcase packing advisor</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              disabled={currentPlan === 'pro' || upgrading}
              onClick={() => handleSelectPlan('pro')}
              className="mt-6 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold shadow-sm transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              {currentPlan === 'pro' ? 'Current Active Plan' : (
                <>
                  <span>Activate Pro Access</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* 3. VIP Haute Couture */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
            currentPlan === 'unlimited'
              ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/30'
              : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" />
                  VIP Haute
                </span>
                {currentPlan === 'unlimited' && (
                  <span className="px-2 py-0.5 rounded-md bg-purple-500 text-white text-[10px] font-bold">
                    Active
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                  {billingCycle === 'yearly' ? '₹149' : '₹249'}
                </span>
                <span className="text-xs text-stone-400">/ month</span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
                Unlimited closets, seasonal storage &amp; private stylist.
              </p>

              <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-300 border-t border-stone-100 dark:border-stone-800 pt-3">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>Unlimited closet storage</strong> (1000+)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Multi-Closet tags (Home, Travel, Work)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Private AI stylist concierge</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              disabled={currentPlan === 'unlimited' || upgrading}
              onClick={() => handleSelectPlan('unlimited')}
              className="mt-6 w-full py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40"
            >
              {currentPlan === 'unlimited' ? 'Current Active Plan' : 'Select Haute Tier'}
            </button>
          </div>
        </div>

        {/* Security / Guarantee Footer */}
        <div className="pt-2 text-center text-[11px] text-stone-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Every photo is compressed on your device before upload to save space</span>
        </div>
      </div>
    </Modal>
  );
};

