import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WardrobeProvider, useWardrobe } from './context/WardrobeContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthView } from './components/auth/AuthView';
import { Navbar } from './components/common/Navbar';
import { ProfileSetupView } from './components/profile/ProfileSetupView';
import { WardrobeView } from './components/wardrobe/WardrobeView';
import { StylistView } from './components/stylist/StylistView';
import { SavedOutfitsView } from './components/stylist/SavedOutfitsView';
import { AddItemModal } from './components/wardrobe/AddItemModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { ConnectSupabaseModal } from './components/common/ConnectSupabaseModal';
import { UpgradePlanModal } from './components/common/UpgradePlanModal';
import { Shirt } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const { items } = useWardrobe();

  const [activeTab, setActiveTab] = useState<'wardrobe' | 'stylist' | 'saved' | 'profile'>('wardrobe');
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // 1. Loading Initial State
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
        <div className="w-12 h-12 rounded-2xl bg-stone-900 dark:bg-stone-100 text-amber-500 dark:text-stone-900 flex items-center justify-center shadow-lg animate-pulse mb-4">
          <Shirt className="w-6 h-6" />
        </div>
        <p className="font-serif tracking-widest uppercase text-sm font-semibold">Fitting Room</p>
        <span className="text-xs text-stone-400 mt-1">Preparing your wardrobe vault...</span>
      </div>
    );
  }

  // 2. Unauthenticated State -> Show Page 1: Login / Sign Up
  if (!user) {
    return <AuthView />;
  }

  // 3. Profile Incomplete -> Show Page 2: Profile Setup (Locked until complete)
  const isProfileComplete = Boolean(
    profile &&
    profile.profile_completed &&
    profile.name &&
    profile.body_type &&
    profile.face_shape &&
    profile.undertone
  );

  if (!isProfileComplete) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-16">
        <header className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 py-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-stone-900 dark:bg-stone-100 text-amber-500 dark:text-stone-900 flex items-center justify-center">
              <Shirt className="w-4 h-4" />
            </div>
            <span className="font-serif font-bold text-sm uppercase tracking-wider">Fitting Room</span>
          </div>
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Step 1 of 1: Shape & Tone Calibration</span>
        </header>

        <ProfileSetupView
          isInitialSetup={true}
          onCompleted={() => {
            setActiveTab('wardrobe');
          }}
        />
      </div>
    );
  }

  // 4. Main App Pages: Wardrobe, Stylist, Saved, Profile (editable)
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 pb-20 md:pb-12 transition-colors">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddItem={() => setAddItemModalOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onOpenConnectSupabase={() => setConnectModalOpen(true)}
        onOpenUpgrade={() => setUpgradeModalOpen(true)}
      />

      <main>
        {activeTab === 'wardrobe' && (
          <WardrobeView
            onOpenAddItem={() => setAddItemModalOpen(true)}
            onOpenUpgrade={() => setUpgradeModalOpen(true)}
          />
        )}

        {activeTab === 'stylist' && (
          <StylistView
            onOpenAddItem={() => setAddItemModalOpen(true)}
          />
        )}

        {activeTab === 'saved' && (
          <SavedOutfitsView
            onNavigateToStylist={() => setActiveTab('stylist')}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileSetupView
            isInitialSetup={false}
            onCompleted={() => setActiveTab('wardrobe')}
          />
        )}
      </main>

      {/* Global Add Item Modal */}
      <AddItemModal
        isOpen={addItemModalOpen}
        onClose={() => setAddItemModalOpen(false)}
        onOpenUpgrade={() => setUpgradeModalOpen(true)}
      />

      {/* Settings & Privacy Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        onNavigateToProfile={() => setActiveTab('profile')}
        onOpenUpgrade={() => setUpgradeModalOpen(true)}
      />

      {/* Wardrobe Capacity & Subscription Plans Modal */}
      <UpgradePlanModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        currentItemsCount={items.length}
      />

      {/* Connect Supabase Cloud Modal */}
      <ConnectSupabaseModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <WardrobeProvider>
            <MainApp />
          </WardrobeProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
