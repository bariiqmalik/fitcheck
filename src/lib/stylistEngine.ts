import {
  Profile,
  WardrobeItem,
  OutfitRecommendation,
  Occasion,
  WeatherType,
  BodyType,
  FaceShape,
  Undertone,
} from '../types/database.types';

// Color categorizations for undertone pairing
const WARM_COLORS = ['camel', 'beige', 'cream', 'terracotta', 'rust', 'olive', 'mustard', 'coral', 'peach', 'brown', 'gold', 'khaki', 'tan', 'orange', 'yellow', 'warm red'];
const COOL_COLORS = ['cobalt', 'navy', 'grey', 'gray', 'charcoal', 'white', 'black', 'lavender', 'emerald', 'silver', 'magenta', 'icy blue', 'ruby', 'purple', 'cool pink'];
const NEUTRAL_COLORS = ['black', 'white', 'navy', 'grey', 'gray', 'beige', 'denim', 'cream', 'olive'];

export function generatePersonalizedStyleNotes(profile: Profile): string[] {
  const notes: string[] = [];

  // 1. Body Type Advice
  if (profile.body_type) {
    const bodyAdvice: Record<BodyType, string> = {
      hourglass: 'Your silhouette has naturally balanced proportions with a defined waist. Highlight your waist with tailored cuts, high-waisted trousers, belted coats, and wrap tops.',
      pear: 'To bring harmony to your hips and thighs, draw attention upwards with statement necklines, structured shoulders, lighter tops, and streamlined straight-leg or wide-leg bottoms in darker tones.',
      inverted_triangle: 'Soften broader shoulders by choosing V-necks and unbuttoned collars, while adding volume to your lower half with wide-leg trousers, pleated pants, or A-line skirts.',
      rectangle: 'Create the illusion of curves and dimension by layering textures, tucking in tops, choosing belted pieces, and pairing structured jackets with soft, fluid bottoms.',
      round: 'Elongate your torso and highlight your collarbones with graceful V-necks, empire waists, open longline cardigans, and monochromatic styling that creates a tall vertical visual line.',
      athletic: 'Add softness and movement to your defined physique with drape fabrics, scoop necks, cropped jackets paired with fluid pants, and subtle texturing.',
    };
    notes.push(bodyAdvice[profile.body_type]);
  }

  // 2. Face Shape & Neckline Advice
  if (profile.face_shape) {
    const faceAdvice: Record<FaceShape, string> = {
      oval: 'Your oval face shape is remarkably versatile — you can rock everything from sweetheart and halter to crisp button-downs and classic crew necks with ease.',
      round: 'Elongating necklines are your best friend: opt for sharp V-necks, open camp collars, and scoop necklines that draw the eye downward and sculpt your jawline.',
      square: 'Balance an angular jaw with curved, fluid necklines such as soft scoops, cowl necks, rounded collars, and sweetheart cuts.',
      heart: 'Wider necklines like boat necks, off-the-shoulder, and wide scoop cuts beautifully balance a broader forehead and narrower, delicate chin.',
      oblong: 'High and horizontal necklines like mock necks, turtlenecks, and crew cuts add gentle width to balance face length.',
      diamond: 'Celebrate your prominent cheekbones with open boat necks, off-shoulder cuts, and soft V-necks that broaden the forehead and jawline.',
    };
    notes.push(faceAdvice[profile.face_shape]);
  }

  // 3. Undertone & Color Palette Advice
  if (profile.undertone) {
    const toneAdvice: Record<Undertone, string> = {
      warm: 'With warm undertones, you radiate in golden creams, rich camel, olive green, warm rust, terracotta, and warm corals. Choose gold jewelry to complement your natural glow.',
      cool: 'With cool undertones, you look commanding in crisp pure white, cobalt blue, emerald green, slate grey, and berry hues. Silver and platinum accessories enhance your radiance.',
      neutral: 'You have the ultimate color flexibility! Both warm and cool palettes suit you well; soft muted shades like sage, dusty rose, champagne, and soft navy look especially chic.',
    };
    notes.push(toneAdvice[profile.undertone]);
  }

  // 4. Height & Proportion Advice
  if (profile.height_cm) {
    if (profile.height_cm < 162) {
      notes.push('Proportion Tip: High-waisted silhouettes and tonal (monochrome) outfits create an uninterrupted vertical line, making legs look endless.');
    } else if (profile.height_cm > 175) {
      notes.push('Proportion Tip: Your tall frame effortlessly carries dramatic long coats, statement wide trousers, and bold color blocking without feeling overwhelmed.');
    } else {
      notes.push('Proportion Tip: Maintain the golden 1/3 to 2/3 ratio by tucking your tops into mid-to-high rise bottoms to create balanced leg-to-torso harmony.');
    }
  }

  return notes;
}

function scoreItemOccasion(item: WardrobeItem, targetOccasion: Occasion): number {
  if (item.occasion && item.occasion.includes(targetOccasion)) return 20;
  if (targetOccasion === 'casual') return 12;
  if (targetOccasion === 'work' && (item.category === 'outerwear' || item.color.toLowerCase().includes('black') || item.color.toLowerCase().includes('white'))) return 10;
  return 4;
}

function scoreItemWeather(item: WardrobeItem, targetWeather: WeatherType): number {
  if (item.weather_suitability && item.weather_suitability.includes(targetWeather)) return 15;
  if (targetWeather === 'cold' && item.category === 'outerwear') return 20;
  if (targetWeather === 'cool' && (item.category === 'outerwear' || item.category === 'bottom')) return 15;
  if (targetWeather === 'hot' && item.category === 'top') return 15;
  return 8;
}

function scoreColorUndertone(colorName: string, undertone: Undertone | null): number {
  if (!undertone) return 10;
  const col = colorName.toLowerCase();

  if (NEUTRAL_COLORS.some(n => col.includes(n))) return 14;
  if (undertone === 'warm' && WARM_COLORS.some(w => col.includes(w))) return 15;
  if (undertone === 'cool' && COOL_COLORS.some(c => col.includes(c))) return 15;
  if (undertone === 'neutral') return 14;

  return 8;
}

/**
 * Intelligent categorization normalizer: Ensures jackets, coats, and blazers
 * are treated as outerwear even if uploaded under top.
 */
function normalizeItemCategory(item: WardrobeItem): 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'accessory' {
  const name = (item.name || '').toLowerCase();
  const sub = (item.subcategory || '').toLowerCase();
  const cat = item.category;

  if (/jacket|coat|blazer|leather|biker|trench|cardigan|overcoat|parka|puffer/i.test(name) || /jacket|coat|blazer|leather/i.test(sub)) {
    return 'outerwear';
  }
  if (/jeans|denim|pant|pants|trouser|trousers|skirt|shorts|slacks/i.test(name)) {
    return 'bottom';
  }
  if (/dress|gown/i.test(name)) {
    return 'dress';
  }
  if (/shoe|shoes|sneaker|sneakers|boots|boot|loafer|loafers|heels/i.test(name)) {
    return 'shoes';
  }
  if (/bag|tote|purse|belt|accessory|accessories/i.test(name)) {
    return 'accessory';
  }

  return cat;
}

export function recommendOutfits(
  wardrobe: WardrobeItem[],
  profile: Profile,
  occasion: Occasion,
  weather: WeatherType
): OutfitRecommendation[] {
  if (!wardrobe || wardrobe.length === 0) {
    return [];
  }

  // Re-classify items cleanly with smart normalizer
  const tops = wardrobe.filter(i => normalizeItemCategory(i) === 'top');
  const bottoms = wardrobe.filter(i => normalizeItemCategory(i) === 'bottom');
  const dresses = wardrobe.filter(i => normalizeItemCategory(i) === 'dress');
  const outerwears = wardrobe.filter(i => normalizeItemCategory(i) === 'outerwear');
  const shoes = wardrobe.filter(i => normalizeItemCategory(i) === 'shoes');
  const accessories = wardrobe.filter(i => normalizeItemCategory(i) === 'accessory');

  // Fallback: If no top exists but an outerwear exists and bottoms exist, allow outerwear as top
  const effectiveTops = tops.length > 0 ? tops : outerwears;

  interface Candidate {
    top?: WardrobeItem;
    bottom?: WardrobeItem;
    dress?: WardrobeItem;
    outerwear?: WardrobeItem;
    shoes?: WardrobeItem;
    accessory?: WardrobeItem;
    score: number;
    title: string;
    vibe: string;
    styleTag: string;
  }

  const candidates: Candidate[] = [];

  // Formula 1: Full Layered Trio (Top + Bottom + Outerwear) -> Highest fashion aesthetic!
  if (tops.length > 0 && bottoms.length > 0 && outerwears.length > 0) {
    for (const top of tops) {
      for (const bottom of bottoms) {
        for (const out of outerwears) {
          let score = 75; // base bonus for complete layered look

          score += scoreItemOccasion(top, occasion);
          score += scoreItemOccasion(bottom, occasion);
          score += scoreItemOccasion(out, occasion) * 1.2;

          score += scoreItemWeather(top, weather);
          score += scoreItemWeather(bottom, weather);
          score += scoreItemWeather(out, weather) * 1.3;

          score += scoreColorUndertone(top.color, profile.undertone);
          score += scoreColorUndertone(bottom.color, profile.undertone);
          score += scoreColorUndertone(out.color, profile.undertone);

          // Contrast bonus (e.g. white top + black jacket)
          const topC = top.color.toLowerCase();
          const outC = out.color.toLowerCase();
          if ((topC.includes('white') && outC.includes('black')) || (topC.includes('black') && outC.includes('white'))) {
            score += 15; // Timeless high contrast
          }

          const matchingShoe = shoes.find(s => s.occasion?.includes(occasion)) || shoes[0];
          const selectedAccessory = accessories.find(a => a.occasion?.includes(occasion)) || accessories[0];

          const isLeather = out.name.toLowerCase().includes('leather') || (out.subcategory || '').toLowerCase().includes('leather');
          const isDenim = bottom.name.toLowerCase().includes('jean') || bottom.name.toLowerCase().includes('denim');

          const vibe = isLeather && isDenim
            ? 'The Iconic Biker Chic'
            : occasion === 'work'
            ? 'Polished Executive'
            : occasion === 'party'
            ? 'Chic Evening Layer'
            : 'Effortless Modern Layer';

          candidates.push({
            top,
            bottom,
            outerwear: out,
            shoes: matchingShoe,
            accessory: selectedAccessory,
            score,
            title: `${out.name} over ${top.name} with ${bottom.name}`,
            vibe,
            styleTag: '3-Piece Layered Ensemble',
          });
        }
      }
    }
  }

  // Formula 2: Clean Two-Piece (Top + Bottom)
  for (const top of effectiveTops) {
    for (const bottom of bottoms) {
      let score = 55;

      score += scoreItemOccasion(top, occasion);
      score += scoreItemOccasion(bottom, occasion);
      score += scoreItemWeather(top, weather);
      score += scoreItemWeather(bottom, weather);
      score += scoreColorUndertone(top.color, profile.undertone);
      score += scoreColorUndertone(bottom.color, profile.undertone);

      const matchingShoe = shoes.find(s => s.occasion?.includes(occasion)) || shoes[0];
      const selectedAccessory = accessories.find(a => a.occasion?.includes(occasion)) || accessories[0];

      candidates.push({
        top,
        bottom,
        shoes: matchingShoe,
        accessory: selectedAccessory,
        score,
        title: `${top.name} with ${bottom.name}`,
        vibe: occasion === 'work' ? 'Smart Casual' : 'Clean Minimalist',
        styleTag: 'Classic Two-Piece',
      });
    }
  }

  // Formula 3: One-Piece (Dress)
  for (const dress of dresses) {
    let score = 65;
    score += scoreItemOccasion(dress, occasion) * 1.4;
    score += scoreItemWeather(dress, weather);
    score += scoreColorUndertone(dress.color, profile.undertone);

    const out = outerwears.length > 0 ? outerwears[0] : undefined;
    const matchingShoe = shoes.find(s => s.occasion?.includes(occasion)) || shoes[0];
    const selectedAccessory = accessories.find(a => a.occasion?.includes(occasion)) || accessories[0];

    candidates.push({
      dress,
      outerwear: out,
      shoes: matchingShoe,
      accessory: selectedAccessory,
      score,
      title: `${dress.name} Ensemble`,
      vibe: occasion === 'formal' ? 'Grand Gala' : 'Graceful Silhouette',
      styleTag: 'Statement One-Piece',
    });
  }

  // Sort by score descending
  candidates.sort((a, b) => b.score - a.score);

  // Pick top 3 diverse candidates
  const selected: Candidate[] = [];
  for (const cand of candidates) {
    if (selected.length >= 3) break;

    // Avoid exact duplicate pieces in top 3
    const isDup = selected.some(s => {
      const sameTop = cand.top?.id === s.top?.id;
      const sameBot = cand.bottom?.id === s.bottom?.id;
      const sameOut = cand.outerwear?.id === s.outerwear?.id;
      return sameTop && sameBot && sameOut;
    });

    if (!isDup || candidates.length <= 3) {
      selected.push(cand);
    }
  }

  // Build recommendation objects with realistic normalized scores (88% - 99%)
  const titles = [
    'Look 1: The Curated Signature',
    'Look 2: Effortless Symmetry',
    'Look 3: Relaxed Sophistication',
  ];

  return selected.map((c, idx) => {
    // Normalize score to clean realistic percentage (between 86% and 99%)
    const normalizedScore = Math.min(99, Math.max(86, Math.round(84 + (c.score / 220) * 15) - idx * 2));

    let bodyAdvice = 'Harmonizes your silhouette with clean lines and balanced proportions.';
    if (profile.body_type === 'hourglass') {
      bodyAdvice = c.outerwear
        ? 'The cropped jacket hem frames your natural waistline, accentuating balanced bust and hip contours.'
        : 'Accentuates your natural waistline while maintaining balanced upper and lower proportions.';
    } else if (profile.body_type === 'pear') {
      bodyAdvice = c.outerwear
        ? 'The structured jacket lapels draw visual focus upward to balance your hips and create symmetry.'
        : 'Draws focus upwards while providing a clean, elongated line over the hips.';
    } else if (profile.body_type === 'inverted_triangle') {
      bodyAdvice = 'Unzipped vertical jacket line slims shoulder breadth while relaxing the lower silhouette.';
    } else if (profile.body_type === 'rectangle') {
      bodyAdvice = 'Layering creates depth and dimension, defining visual waist curvature.';
    } else if (profile.body_type === 'round') {
      bodyAdvice = 'Open front layering creates a continuous lengthening vertical visual column.';
    } else if (profile.body_type === 'athletic') {
      bodyAdvice = 'Structured outerwear gives definition and sleek movement to your athletic frame.';
    }

    let necklineAdvice = 'A versatile collar line that frames your face harmoniously.';
    if (profile.face_shape === 'round') {
      necklineAdvice = 'The open collar / neckline draws the eye downward, naturally elongating your jawline.';
    } else if (profile.face_shape === 'square') {
      necklineAdvice = 'Softened contours and relaxed lapels soften angular jaw features.';
    } else if (profile.face_shape === 'heart') {
      necklineAdvice = 'Balanced shoulder lapels harmonize broad foreheads with delicate chins.';
    } else if (profile.face_shape === 'oval') {
      necklineAdvice = 'Frames your naturally symmetrical oval facial structure effortlessly.';
    }

    const itemsSummary = [c.outerwear?.name, c.top?.name, c.bottom?.name, c.dress?.name].filter(Boolean).join(' + ');
    const colorSummary = [c.outerwear?.color, c.top?.color, c.bottom?.color].filter(Boolean).join(', ');

    const rationale = `Curated for ${occasion} conditions. Combines ${itemsSummary}. ${bodyAdvice} The ${colorSummary} palette harmonizes cleanly with your ${profile.undertone || 'natural'} undertones.`;

    const weatherAdvice = weather === 'cold' || weather === 'cool'
      ? 'Layered protection keeps you warm while maintaining a sharp, tailored silhouette.'
      : 'Breathable, temperature-adaptive styling ideal for the climate.';

    const colorHarmonyAdvice = profile.undertone === 'warm'
      ? 'Warm and neutral tones create an inviting, sunlit glow that flatters your undertone.'
      : profile.undertone === 'cool'
      ? 'High-contrast monochromatic tones pop sharply against your cool undertones.'
      : 'Harmonious neutral palette that flatters your flexible undertone balance.';

    const styleTips = [
      c.outerwear
        ? 'Wear the jacket unzipped over the tee to create an effortless vertical slimming line.'
        : 'Tuck the front hem slightly into the waistband for an instant leg-lengthening effect.',
      `Accessorize with ${profile.undertone === 'warm' ? 'delicate gold' : 'silver or minimalist'} accents.`,
      `Perfect for ${occasion} wear in ${weather} conditions.`,
    ];

    return {
      id: `rec-${idx + 1}-${Date.now()}`,
      title: titles[idx] || `Look ${idx + 1}`,
      vibe: c.vibe,
      items: {
        top: c.top,
        bottom: c.bottom,
        dress: c.dress,
        outerwear: c.outerwear,
        shoes: c.shoes,
        accessory: c.accessory,
      },
      score: normalizedScore,
      rationale,
      necklineAdvice,
      bodyShapeAdvice: bodyAdvice,
      colorHarmonyAdvice,
      weatherAdvice,
      styleTips,
    };
  });
}
