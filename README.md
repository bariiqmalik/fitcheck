# 👗 Fitting Room — Personal AI Stylist & Smart Wardrobe

A responsive, high-fashion web application that curates and recommends personalized outfits based on your unique body type, face shape, skin undertone, and digitized closet pieces.

Built with **React**, **Vite**, **Tailwind CSS**, and **Supabase** (Auth, PostgreSQL with Row Level Security, and Storage).

---

## ✨ Features

### 1. Page 1: Authentication & Onboarding
- **Email & Password Authentication**: Full sign-up, sign-in, and email confirmation flows with Supabase Auth.
- **Social Auth**: Optional 1-click Google OAuth authentication.
- **Password Reset**: Forgot-password recovery dialog sending secure password reset tokens.
- **Persistent Sessions**: Automatic session renewal and route guarding. Logged-out users are redirected to authentication.
- **Interactive Demo Mode**: One-click preview mode with a curated French capsule wardrobe so you can test all features immediately without Supabase credentials.

### 2. Page 2: Shape & Tone Calibration (Profile Setup)
- **Gated Entry**: Users cannot access the wardrobe or stylist until their personal styling profile is complete.
- **Measurements**: Name, age, height (cm), and weight (kg).
- **Body Silhouettes**:
  - *Hourglass* (balanced bust/hips with defined waist)
  - *Pear / Triangle* (wider hips/thighs than shoulders)
  - *Inverted Triangle* (broader shoulders/chest, narrower hips)
  - *Rectangle* (shoulders, waist, and hips in uniform proportion)
  - *Round / Apple* (fuller midsection, slender legs and arms)
  - *Athletic* (defined muscle structure and straight lines)
- **Facial Architecture (Neckline Advisor)**:
  - *Oval*, *Round*, *Square*, *Heart*, *Oblong*, *Diamond*.
- **Color Season & Undertone**:
  - Surface Tone: Fair Porcelain, Light Ivory, Warm Beige, Medium Olive, Golden Tan, Deep Caramel, Rich Espresso.
  - Sub-surface Undertones: Warm, Cool, Neutral with jewelry & fabric pairing guidelines.
- **Photo Upload**: Optional face/body portrait with client-side compression.

### 3. Page 3: Digitized Closet (Wardrobe Management)
- **Add Clothes Modal**:
  - Client-side image compression before upload (resizes to 1200px max, converts to WebP, reduces 5MB–10MB camera shots down to ~150KB).
  - Categorization: *Top, Bottom, Dress, Outerwear, Shoes, Accessory*.
  - Specific cut/style (e.g., Poplin Button-Down, Pleated Trouser).
  - Color palette selection with visual swatches.
  - Multi-select occasions (*Casual, Work, Formal, Party, Sport*).
  - Weather suitability (*Hot, Warm, Cool, Cold, Rainy*).
- **Interactive Grid**: Filter by category, occasion, and colour; live search by keyword; edit piece tags; delete pieces with confirmation.
- **Capsule Seeding**: 1-click "Load Sample Wardrobe" adds 13 curated luxury essentials with high-resolution fashion photography.

### 4. Page 4: The AI Stylist Engine & Lookbook
- **Interactive Selectors**: Choose between 5 occasions and 5 weather conditions.
- **Algorithmic Styling Matrix**:
  - Evaluates combinations of tops + bottoms (or dresses) + outerwear + footwear + accessories.
  - Weights weather appropriateness and temperature layers.
  - Incorporates face shape for necklines (e.g. V-neck / open collars for round faces; scoop / sweetheart for square jaws; boat neck for heart shapes).
  - Synchronizes colors with warm/cool undertones (e.g. camel & terracotta for warm undertones; cobalt & emerald for cool undertones).
  - Provides a detailed *"Why this suits you"* rationale for each outfit.
- **"Your Style Notes" Drawer**: Personalized fashion rules derived from your height proportions, body geometry, and color season.
- **Saved Looks Lookbook**: Save favorite outfits with 1 click (triggers celebratory confetti), view date saved, and manage saved looks.

### 5. Extra Professional Polish
- **Mobile-First Responsive Layout**: Bottom bar navigation on mobile devices; desktop navigation on wider screens.
- **Dark Mode Toggle**: Persistent dark/light theme switchable from the navbar.
- **Privacy & Security Guarantee**: Supabase Row Level Security (RLS) ensures users can strictly read and write only their own wardrobe and profile records.
- **Account Deletion**: GDPR-compliant "Delete my account and data" action with typed safety confirmation.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React icons, Canvas Confetti.
- **Backend**: Supabase (GoTrue Auth, PostgreSQL, Storage).
- **Client Processing**: HTML5 Canvas client-side image compression (`imageCompressor.ts`).

---

## 🚀 Step-by-Step Setup Instructions

### Step 1: Clone and Install Dependencies

```bash
git clone <repository-url>
cd code
npm install
```

### Step 2: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in (free tier is sufficient).
2. Click **New Project**, choose an organization, choose a database password, and select your nearest region.
3. Wait ~1 minute for the database to provision.

### Step 3: Run the Database Schema & Storage Policies

1. In your Supabase Dashboard, navigate to the **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open `supabase/schema.sql` from this repository, copy its entire contents, paste them into the SQL editor, and click **Run**.
4. This script automatically:
   - Creates the `profiles`, `wardrobe_items`, and `saved_outfits` tables.
   - Enables **Row Level Security (RLS)** on all tables.
   - Configures strict security policies (users can only access their own data via `auth.uid() = user_id`).
   - Creates the `wardrobe-images` and `avatars` storage buckets with user-isolated upload/delete policies (`{user_id}/*`).
   - Sets up an automatic trigger to create a profile entry whenever a new user signs up.
   - Creates a secure `delete_user_account()` RPC procedure to allow users to permanently delete their account and uploaded files.

### Step 4: Configure Supabase Auth

1. In Supabase Dashboard, navigate to **Authentication** -> **Providers**.
2. **Email**: Ensure Email provider is enabled. (Optional: You can disable "Confirm email" under **Auth Settings** if you want instant login during development).
3. **Google (Optional)**:
   - If you wish to enable Google login, create credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
   - Add the Supabase Redirect URL (`https://<project-id>.supabase.co/auth/v1/callback`) to your authorized redirect URIs in Google Cloud Console.
   - Paste your Google Client ID and Secret in Supabase.

### Step 5: Configure Environment Variables

1. In Supabase Dashboard, go to **Project Settings** -> **API**.
2. Copy your **Project URL** and **anon public key**.
3. Create or update `.env` in the root of the project:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### Step 6: Start the Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

> 💡 **Tip:** If you do not enter Supabase credentials into `.env`, Fitting Room will automatically run in **Interactive Demo Mode**, utilizing browser local storage so you can explore all features immediately.

---

## 📂 Project Architecture

```
code/
├── supabase/
│   └── schema.sql              # Complete PostgreSQL schema, RLS policies & storage rules
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthView.tsx    # Page 1: Sign In, Sign Up, Google OAuth, Reset Password
│   │   ├── common/
│   │   │   ├── Navbar.tsx      # Desktop & Mobile navigation, theme toggle, profile pill
│   │   │   └── Modal.tsx       # Reusable accessible dialog modal
│   │   ├── profile/
│   │   │   └── ProfileSetupView.tsx  # Page 2: Body shape, face shape, undertone setup
│   │   ├── settings/
│   │   │   └── SettingsModal.tsx     # Privacy notice, dark mode, GDPR delete account
│   │   ├── stylist/
│   │   │   ├── OutfitCard.tsx        # Recommendation card with match score & rationale
│   │   │   ├── SavedOutfitsView.tsx  # Lookbook of bookmarked outfits
│   │   │   ├── StyleNotesDrawer.tsx  # Drawer with personal styling blueprint
│   │   │   └── StylistView.tsx       # Page 4: AI Outfit recommendation dashboard
│   │   └── wardrobe/
│   │       ├── AddItemModal.tsx      # Page 3: Photo upload, compression, category tags
│   │       ├── EditItemModal.tsx     # Edit clothing details
│   │       ├── ItemCard.tsx          # Closet piece card with hover actions
│   │       └── WardrobeView.tsx      # Wardrobe photo grid with search & multi-filters
│   ├── context/
│   │   ├── AuthContext.tsx           # Authentication state, session, demo mode
│   │   ├── ThemeContext.tsx          # Light / Dark mode management
│   │   ├── ToastContext.tsx          # Toast notification alerts
│   │   └── WardrobeContext.tsx       # Wardrobe items, saved outfits, storage upload
│   ├── lib/
│   │   ├── demoData.ts               # 13 curated sample capsule pieces with Unsplash photos
│   │   ├── imageCompressor.ts        # Client-side HTML5 canvas image resizer/compressor
│   │   ├── stylistEngine.ts          # Core AI recommendation engine & rules
│   │   └── supabase.ts               # Supabase client initialization & fallback check
│   ├── types/
│   │   └── database.types.ts         # TypeScript definitions for profiles, items, outfits
│   ├── App.tsx                       # Main application state machine & tab router
│   ├── index.css                     # Tailwind CSS & custom styling
│   └── main.tsx                      # React root entry
├── .env.example
├── index.html
├── package.json
└── vite.config.ts
```

---

## 🎨 Color Palette & Fashion Aesthetic

Fitting Room uses a minimalist modern luxury palette:
- **Primary Accent**: Warm Terracotta / Amber (`#C5705D` / `amber-600`)
- **Backgrounds**: Editorial Warm Stone (`#FAF9F6` light / `#0C0A09` dark)
- **Typography**: Playfair Display (editorial serif) paired with Plus Jakarta Sans (clean geometric sans-serif)

---

## 🔒 Security & Privacy Notes

- **Row Level Security (RLS)** is enabled on all tables.
- Storage objects are partitioned into folders named with the user's UUID (`auth.uid()`).
- The `delete_user_account()` database function cascades deletions across all profile records, wardrobe items, saved outfits, and storage files.
