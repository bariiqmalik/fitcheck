export type BodyType = 'rectangle' | 'pear' | 'inverted_triangle' | 'hourglass' | 'round' | 'athletic';
export type FaceShape = 'oval' | 'round' | 'square' | 'heart' | 'oblong' | 'diamond';
export type Undertone = 'warm' | 'cool' | 'neutral';

export type ClothingCategory = 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'accessory';
export type Occasion = 'casual' | 'work' | 'formal' | 'party' | 'sport';
export type WeatherType = 'hot' | 'warm' | 'cool' | 'cold' | 'rainy';

export type UserPlan = 'free' | 'pro' | 'unlimited';

export interface Profile {
  id: string;
  name: string;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  body_type: BodyType | null;
  face_shape: FaceShape | null;
  skin_tone: string | null;
  undertone: Undertone | null;
  avatar_url: string | null;
  profile_completed: boolean;
  plan?: UserPlan;
  created_at?: string;
  updated_at?: string;
}

export interface WardrobeItem {
  id: string;
  user_id: string;
  name: string;
  category: ClothingCategory;
  subcategory?: string;
  color: string;
  color_hex?: string;
  occasion: Occasion[];
  weather_suitability: WeatherType[];
  image_url: string;
  storage_path?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SavedOutfit {
  id: string;
  user_id: string;
  title: string;
  occasion: Occasion;
  weather: WeatherType;
  items: WardrobeItem[];
  rationale: string;
  style_tips: string[];
  created_at: string;
}

export interface OutfitRecommendation {
  id: string;
  title: string;
  vibe: string;
  items: {
    top?: WardrobeItem;
    bottom?: WardrobeItem;
    dress?: WardrobeItem;
    outerwear?: WardrobeItem;
    shoes?: WardrobeItem;
    accessory?: WardrobeItem;
  };
  score: number;
  rationale: string;
  necklineAdvice: string;
  bodyShapeAdvice: string;
  colorHarmonyAdvice: string;
  weatherAdvice: string;
  styleTips: string[];
}

