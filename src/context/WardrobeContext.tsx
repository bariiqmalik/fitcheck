import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { WardrobeItem, SavedOutfit } from '../types/database.types';
import { compressImage } from '../lib/imageCompressor';
import { SAMPLE_WARDROBE_ITEMS } from '../lib/demoData';

interface WardrobeContextType {
  items: WardrobeItem[];
  savedOutfits: SavedOutfit[];
  loading: boolean;
  addItem: (itemData: Omit<WardrobeItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>, file?: File | null) => Promise<{ error: Error | null; item?: WardrobeItem }>;
  updateItem: (id: string, updates: Partial<WardrobeItem>) => Promise<{ error: Error | null }>;
  deleteItem: (id: string) => Promise<{ error: Error | null }>;
  saveOutfit: (outfit: Omit<SavedOutfit, 'id' | 'user_id' | 'created_at'>) => Promise<{ error: Error | null; outfit?: SavedOutfit }>;
  deleteSavedOutfit: (id: string) => Promise<{ error: Error | null }>;
  seedSampleWardrobe: () => Promise<void>;
  refreshWardrobe: () => Promise<void>;
}

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

export const WardrobeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, isDemoMode } = useAuth();
  const { success, error: toastError } = useToast();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchItems = useCallback(async () => {
    if (!user) {
      setItems([]);
      setSavedOutfits([]);
      setLoading(false);
      return;
    }

    try {
      if (isDemoMode) {
        const localItems = localStorage.getItem(`fitting_room_wardrobe_${user.id}`);
        if (localItems) {
          setItems(JSON.parse(localItems));
        } else {
          // Initialize with demo capsule wardrobe for the user
          const initialItems: WardrobeItem[] = SAMPLE_WARDROBE_ITEMS.map((sample, idx) => ({
            ...sample,
            id: `demo-item-${idx + 1}`,
            user_id: user.id,
            created_at: new Date(Date.now() - idx * 3600000).toISOString(),
            updated_at: new Date().toISOString(),
          }));
          setItems(initialItems);
          localStorage.setItem(`fitting_room_wardrobe_${user.id}`, JSON.stringify(initialItems));
        }

        const localOutfits = localStorage.getItem(`fitting_room_outfits_${user.id}`);
        if (localOutfits) {
          setSavedOutfits(JSON.parse(localOutfits));
        } else {
          setSavedOutfits([]);
        }

        setLoading(false);
        return;
      }

      // Fetch from Supabase
      const [itemsRes, outfitsRes] = await Promise.all([
        supabase
          .from('wardrobe_items')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('saved_outfits')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      if (itemsRes.error) {
        console.error('Error fetching wardrobe items:', itemsRes.error);
      } else {
        setItems(itemsRes.data as WardrobeItem[]);
      }

      if (outfitsRes.error) {
        console.error('Error fetching saved outfits:', outfitsRes.error);
      } else {
        setSavedOutfits(outfitsRes.data as SavedOutfit[]);
      }
    } catch (err) {
      console.error('Wardrobe fetch exception:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isDemoMode]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async (
    itemData: Omit<WardrobeItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
    file?: File | null
  ) => {
    if (!user) return { error: new Error('User not authenticated') };

    // Enforce Plan Capacity Limits to safeguard Supabase free-tier storage
    const plan = profile?.plan || 'free';
    const maxItems = plan === 'unlimited' ? 1000 : plan === 'pro' ? 300 : 60;

    if (items.length >= maxItems) {
      const planTitle = plan === 'unlimited' ? 'VIP Haute' : plan === 'pro' ? 'Pro Stylist' : 'Free Capsule';
      const msg = `Your ${planTitle} closet has reached its capacity of ${maxItems} items. Please upgrade your plan to add more pieces.`;
      toastError('Closet Limit Reached', msg);
      return { error: new Error(msg) };
    }

    let finalImageUrl = itemData.image_url;
    let storagePath: string | undefined = undefined;

    try {
      // If a file is uploaded, aggressively compress it on client first (~35KB WebP)
      if (file) {
        const compressed = await compressImage(file, 800, 800, 0.74);

        if (isDemoMode) {
          // Convert to base64 data URL for local storage demo persistence
          finalImageUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(compressed.file);
          });
        } else {
          // Upload to Supabase Storage: {user_id}/{filename}
          const fileExt = compressed.file.name.split('.').pop() || 'webp';
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
          storagePath = `${user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('wardrobe-images')
            .upload(storagePath, compressed.file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) {
            console.error('Storage upload error:', uploadError);
            throw new Error(`Image upload failed: ${uploadError.message}`);
          }

          const { data: publicUrlData } = supabase.storage
            .from('wardrobe-images')
            .getPublicUrl(storagePath);

          finalImageUrl = publicUrlData.publicUrl;
        }
      }

      const newItem: WardrobeItem = {
        ...itemData,
        id: isDemoMode ? `item-${Date.now()}` : undefined as any,
        user_id: user.id,
        image_url: finalImageUrl,
        storage_path: storagePath,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (isDemoMode) {
        const updated = [newItem, ...items];
        setItems(updated);
        localStorage.setItem(`fitting_room_wardrobe_${user.id}`, JSON.stringify(updated));
        success('Item Added!', `${newItem.name} has been added to your wardrobe.`);
        return { error: null, item: newItem };
      }

      const { data, error } = await supabase
        .from('wardrobe_items')
        .insert(newItem)
        .select()
        .single();

      if (error) throw error;

      setItems((prev) => [data as WardrobeItem, ...prev]);
      success('Item Added!', `${newItem.name} added to your wardrobe.`);
      return { error: null, item: data as WardrobeItem };
    } catch (err: any) {
      console.error('Error adding wardrobe item:', err);
      toastError('Could not add item', err.message);
      return { error: err };
    }
  };

  const updateItem = async (id: string, updates: Partial<WardrobeItem>) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      if (isDemoMode) {
        const updated = items.map((it) => (it.id === id ? { ...it, ...updates, updated_at: new Date().toISOString() } : it));
        setItems(updated);
        localStorage.setItem(`fitting_room_wardrobe_${user.id}`, JSON.stringify(updated));
        success('Item updated', 'Your changes have been saved.');
        return { error: null };
      }

      const { error } = await supabase
        .from('wardrobe_items')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...updates } : it)));
      success('Item updated', 'Your changes have been saved.');
      return { error: null };
    } catch (err: any) {
      toastError('Update failed', err.message);
      return { error: err };
    }
  };

  const deleteItem = async (id: string) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const itemToDelete = items.find((it) => it.id === id);

      if (isDemoMode) {
        const updated = items.filter((it) => it.id !== id);
        setItems(updated);
        localStorage.setItem(`fitting_room_wardrobe_${user.id}`, JSON.stringify(updated));
        success('Item removed', 'Piece removed from your closet.');
        return { error: null };
      }

      // If stored in supabase storage, delete file
      if (itemToDelete?.storage_path) {
        await supabase.storage.from('wardrobe-images').remove([itemToDelete.storage_path]);
      }

      const { error } = await supabase
        .from('wardrobe_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setItems((prev) => prev.filter((it) => it.id !== id));
      success('Item removed', 'Piece removed from your closet.');
      return { error: null };
    } catch (err: any) {
      toastError('Delete failed', err.message);
      return { error: err };
    }
  };

  const saveOutfit = async (outfitData: Omit<SavedOutfit, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const newSaved: SavedOutfit = {
        ...outfitData,
        id: isDemoMode ? `saved-${Date.now()}` : undefined as any,
        user_id: user.id,
        created_at: new Date().toISOString(),
      };

      if (isDemoMode) {
        const updated = [newSaved, ...savedOutfits];
        setSavedOutfits(updated);
        localStorage.setItem(`fitting_room_outfits_${user.id}`, JSON.stringify(updated));
        success('Outfit Saved!', `Saved to your collection for ${outfitData.occasion}.`);
        return { error: null, outfit: newSaved };
      }

      const { data, error } = await supabase
        .from('saved_outfits')
        .insert(newSaved)
        .select()
        .single();

      if (error) throw error;

      setSavedOutfits((prev) => [data as SavedOutfit, ...prev]);
      success('Outfit Saved!', `Saved to your collection.`);
      return { error: null, outfit: data as SavedOutfit };
    } catch (err: any) {
      toastError('Save failed', err.message);
      return { error: err };
    }
  };

  const deleteSavedOutfit = async (id: string) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      if (isDemoMode) {
        const updated = savedOutfits.filter((o) => o.id !== id);
        setSavedOutfits(updated);
        localStorage.setItem(`fitting_room_outfits_${user.id}`, JSON.stringify(updated));
        success('Outfit removed', 'Removed from saved collection.');
        return { error: null };
      }

      const { error } = await supabase
        .from('saved_outfits')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setSavedOutfits((prev) => prev.filter((o) => o.id !== id));
      success('Outfit removed', 'Removed from saved collection.');
      return { error: null };
    } catch (err: any) {
      toastError('Delete failed', err.message);
      return { error: err };
    }
  };

  const seedSampleWardrobe = async () => {
    if (!user) return;
    setLoading(true);

    try {
      if (isDemoMode) {
        const newItems: WardrobeItem[] = SAMPLE_WARDROBE_ITEMS.map((sample, idx) => ({
          ...sample,
          id: `sample-${Date.now()}-${idx}`,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        const merged = [...newItems, ...items];
        setItems(merged);
        localStorage.setItem(`fitting_room_wardrobe_${user.id}`, JSON.stringify(merged));
        success('Wardrobe Seeded!', `${SAMPLE_WARDROBE_ITEMS.length} high-fashion capsule pieces added.`);
        setLoading(false);
        return;
      }

      const toInsert = SAMPLE_WARDROBE_ITEMS.map((sample) => ({
        ...sample,
        user_id: user.id,
      }));

      const { data, error } = await supabase
        .from('wardrobe_items')
        .insert(toInsert)
        .select();

      if (error) throw error;

      if (data) {
        setItems((prev) => [...(data as WardrobeItem[]), ...prev]);
        success('Wardrobe Seeded!', `${data.length} sample items added.`);
      }
    } catch (err: any) {
      toastError('Seeding failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WardrobeContext.Provider
      value={{
        items,
        savedOutfits,
        loading,
        addItem,
        updateItem,
        deleteItem,
        saveOutfit,
        deleteSavedOutfit,
        seedSampleWardrobe,
        refreshWardrobe: fetchItems,
      }}
    >
      {children}
    </WardrobeContext.Provider>
  );
};

export const useWardrobe = () => {
  const context = useContext(WardrobeContext);
  if (!context) {
    throw new Error('useWardrobe must be used within a WardrobeProvider');
  }
  return context;
};
