import React from 'react';
import { Shirt, Sparkles, Bookmark, User, Moon, Sun, LogOut, ShieldCheck, Plus, Database } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWardrobe } from '../../context/WardrobeContext';
import { useTheme } from '../../context/ThemeContext';
import { StorageUsageBar } from './StorageUsageBar';

interface NavbarProps {
  activeTab: 'wardrobe' | 'stylist' | 'saved' | 'profile';
  setActiveTab: (tab: 'wardrobe' | 'stylist' | 'saved' | 'profile') => void;
  onOpenAddItem: () => void;
  onOpenSettings: () => void;
  onOpenConnectSupabase: () => void;
  onOpenUpgrade?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddItem,
  onOpenSettings,
  onOpenConnectSupabase,
  onOpenUpgrade,
}) => {
  const { profile, signOut, isDemoMode } = useAuth();
  const { items } = useWardrobe();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      {/* Optional Demo Mode Notice */}
      {isDemoMode && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2 mx-auto flex-wrap justify-center">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Running in <strong>Interactive Demo Mode</strong> with local storage.</span>
            <button
              onClick={onOpenConnectSupabase}
              className="ml-1 underline font-semibold text-amber-900 dark:text-amber-200 hover:text-amber-950 inline-flex items-center gap-1"
            >
              <Database className="w-3 h-3" />
              <span>Connect Supabase Cloud</span>
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveTab('wardrobe')}
              className="flex items-center gap-3 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-stone-900 to-stone-700 dark:from-stone-100 dark:to-stone-300 text-stone-100 dark:text-stone-900 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Shirt className="w-5 h-5 text-amber-500 dark:text-stone-900" />
              </div>
              <div>
                <span className="font-serif tracking-widest text-lg sm:text-xl font-bold uppercase text-stone-900 dark:text-stone-100 block leading-tight">
                  Fitting Room
                </span>
                <span className="text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500 font-medium">
                  AI Wardrobe & Stylist
                </span>
              </div>
            </button>

            {/* Main Navigation Desktop */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('wardrobe')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'wardrobe'
                    ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <Shirt className="w-4 h-4" />
                Wardrobe
              </button>

              <button
                onClick={() => setActiveTab('stylist')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'stylist'
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400 dark:text-amber-600" />
                Outfit Stylist
              </button>

              <button
                onClick={() => setActiveTab('saved')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'saved'
                    ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                Saved Outfits
              </button>
            </nav>
          </div>

          {/* Action buttons & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Storage Usage Pill (Desktop) */}
            {onOpenUpgrade && (
              <div className="hidden xl:block">
                <StorageUsageBar
                  currentCount={items.length}
                  onOpenUpgrade={onOpenUpgrade}
                  compact={true}
                />
              </div>
            )}

            <button
              onClick={onOpenAddItem}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white text-xs sm:text-sm font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Clothes</span>
              <span className="sm:hidden">Add</span>
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Profile Avatar & menu trigger */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-lg border transition-all ${
                activeTab === 'profile'
                  ? 'border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-stone-800'
                  : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800/60'
              }`}
              title="Edit Profile & Body Details"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="w-7 h-7 rounded-full object-cover border border-stone-300 dark:border-stone-600"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 flex items-center justify-center text-xs font-semibold">
                  {profile?.name ? profile.name[0].toUpperCase() : <User className="w-3.5 h-3.5" />}
                </div>
              )}
              <span className="hidden lg:inline text-xs font-medium text-stone-800 dark:text-stone-200 max-w-[100px] truncate">
                {profile?.name || 'My Profile'}
              </span>
            </button>

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Settings & Privacy"
              aria-label="Settings"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

            {/* Sign out */}
            <button
              onClick={() => signOut()}
              className="p-2 rounded-lg text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 px-4 py-2 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('wardrobe')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 ${
            activeTab === 'wardrobe'
              ? 'text-stone-900 dark:text-stone-100 font-semibold'
              : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <Shirt className="w-5 h-5" />
          <span>Wardrobe</span>
        </button>

        <button
          onClick={() => setActiveTab('stylist')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 ${
            activeTab === 'stylist'
              ? 'text-amber-600 dark:text-amber-400 font-semibold'
              : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>AI Stylist</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 ${
            activeTab === 'saved'
              ? 'text-stone-900 dark:text-stone-100 font-semibold'
              : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <Bookmark className="w-5 h-5" />
          <span>Saved</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 ${
            activeTab === 'profile'
              ? 'text-stone-900 dark:text-stone-100 font-semibold'
              : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </button>
      </div>
    </header>
  );
};

