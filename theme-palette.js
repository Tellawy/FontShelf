const THEME_VAR_KEYS = [
  '--bg',
  '--shell',
  '--panel',
  '--panel-soft',
  '--card',
  '--card-hover',
  '--card-selected',
  '--search-bg',
  '--sample-edit-bg',
  '--family-child-bg',
  '--family-child-hover',
  '--family-child-selected',
  '--line',
  '--line-strong',
  '--text',
  '--muted',
  '--dim',
  '--accent',
  '--accent-ink',
  '--accent-soft',
  '--blue',
  '--select-all-color',
  '--select-partial-color',
  '--brand-ink',
  '--hover-bg',
  '--hover-bg-strong',
  '--selection-bg',
  '--chip-bg',
  '--overlay-backdrop',
  '--shadow-popover',
  '--crop-scrim',
  '--crop-border',
  '--crop-handle-bg',
  '--crop-handle-border',
  '--scroll-track',
  '--scroll-thumb',
  '--scroll-thumb-hover',
  '--switch-track',
  '--switch-thumb'
];

const clamp01 = v => Math.min(1, Math.max(0, v));
const clamp255 = v => Math.min(255, Math.max(0, Math.round(v)));

export function parseHexColor(input) {
  const clean = String(input || '').trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(clean)) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16)
    };
  }
  if (/^[0-9a-f]{6}$/i.test(clean)) {
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16)
    };
  }
  return null;
}

export function rgbToHex({ r, g, b }) {
  const hex = n => clamp255(n).toString(16).padStart(2, '0');
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

function rgba({ r, g, b }, alpha) {
  return `rgba(${clamp255(r)}, ${clamp255(g)}, ${clamp255(b)}, ${Number(alpha.toFixed(3))})`;
}

export function mixRgb(a, b, t) {
  const k = clamp01(t);
  return {
    r: a.r + (b.r - a.r) * k,
    g: a.g + (b.g - a.g) * k,
    b: a.b + (b.b - a.b) * k
  };
}

export function relativeLuminance({ r, g, b }) {
  const lin = v => {
    const s = clamp01(v / 255);
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

export function rgbToHsl({ r, g, b }) {
  const rn = clamp01(r / 255);
  const gn = clamp01(g / 255);
  const bn = clamp01(b / 255);
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return { h: h / 6, s, l };
}

export function hslToRgb({ h, s, l }) {
  const hue = ((h % 1) + 1) % 1;
  const sat = clamp01(s);
  const lig = clamp01(l);
  if (sat === 0) {
    const v = clamp255(lig * 255);
    return { r: v, g: v, b: v };
  }
  const q = lig < 0.5 ? lig * (1 + sat) : lig + sat - lig * sat;
  const p = 2 * lig - q;
  const hue2rgb = t => {
    let tt = ((t % 1) + 1) % 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  return {
    r: clamp255(hue2rgb(hue + 1 / 3) * 255),
    g: clamp255(hue2rgb(hue) * 255),
    b: clamp255(hue2rgb(hue - 1 / 3) * 255)
  };
}

function adjustLightnessForContrast(fgRgb, bgRgb, minRatio, preferLighter) {
  if (contrastRatio(fgRgb, bgRgb) >= minRatio) return fgRgb;
  const hsl = rgbToHsl(fgRgb);
  let lo = preferLighter ? hsl.l : 0;
  let hi = preferLighter ? 1 : hsl.l;
  let best = hslToRgb({ h: hsl.h, s: hsl.s, l: preferLighter ? 0.98 : 0.02 });
  for (let i = 0; i < 14; i++) {
    const mid = (lo + hi) / 2;
    const probe = hslToRgb({ h: hsl.h, s: hsl.s, l: mid });
    if (contrastRatio(probe, bgRgb) >= minRatio) {
      best = probe;
      if (preferLighter) hi = mid;
      else lo = mid;
    } else {
      if (preferLighter) lo = mid;
      else hi = mid;
    }
  }
  if (contrastRatio(best, bgRgb) < minRatio) {
    return preferLighter ? { r: 245, g: 246, b: 248 } : { r: 18, g: 19, b: 21 };
  }
  return best;
}

function colorDistSq(a, b) {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return 2 * dr * dr + 4 * dg * dg + 3 * db * db;
}

function clampSurfaceSaturation(rgb, maxSat) {
  const hsl = rgbToHsl(rgb);
  return hsl.s <= maxSat ? rgb : hslToRgb({ h: hsl.h, s: maxSat, l: hsl.l });
}

function setLightness(rgb, targetL, maxSat = null) {
  const hsl = rgbToHsl(rgb);
  const sat = maxSat !== null ? Math.min(hsl.s, maxSat) : hsl.s;
  return hslToRgb({ h: hsl.h, s: sat, l: clamp01(targetL) });
}

/**
 * Quantizes pixel data into up to `maxColors` (7 max) diverse representative hex colors,
 * sorted from darkest to lightest by relative luminance.
 */
export function extractPaletteFromImageData(imageData, maxColors = 7) {
  const cap = Math.max(1, Math.min(7, Number(maxColors) || 7));
  const data = imageData?.data;
  if (!data?.length) return [];

  const bucketsMap = new Map();
  const totalPixels = data.length / 4;
  const step = Math.max(1, Math.floor(totalPixels / 14000));
  let sampledCount = 0;
  for (let p = 0; p < totalPixels; p += step) {
    const i = p * 4;
    if (data[i + 3] < 128) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    let slot = bucketsMap.get(key);
    if (!slot) {
      slot = { rSum: 0, gSum: 0, bSum: 0, count: 0 };
      bucketsMap.set(key, slot);
    }
    slot.rSum += r;
    slot.gSum += g;
    slot.bSum += b;
    slot.count++;
    sampledCount++;
  }

  const buckets = [];
  for (const s of bucketsMap.values()) {
    buckets.push({
      r: s.rSum / s.count,
      g: s.gSum / s.count,
      b: s.bSum / s.count,
      count: s.count
    });
  }
  if (!buckets.length) return [];

  const boxStats = list => {
    let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
    let total = 0;
    for (const item of list) {
      if (item.r < minR) minR = item.r;
      if (item.r > maxR) maxR = item.r;
      if (item.g < minG) minG = item.g;
      if (item.g > maxG) maxG = item.g;
      if (item.b < minB) minB = item.b;
      if (item.b > maxB) maxB = item.b;
      total += item.count;
    }
    const rSpan = maxR - minR;
    const gSpan = maxG - minG;
    const bSpan = maxB - minB;
    const span = Math.max(rSpan, gSpan, bSpan);
    const channel = gSpan >= rSpan && gSpan >= bSpan ? 'g' : (rSpan >= bSpan ? 'r' : 'b');
    return { list, total, span, channel };
  };

  // Over-segment into up to 16 clusters first so smaller cool/warm color islands stay distinct
  const fineTarget = Math.min(buckets.length, Math.max(cap * 2, 14));
  let boxes = [boxStats(buckets)];
  while (boxes.length < fineTarget) {
    boxes.sort((a, b) => (b.span * Math.sqrt(b.total)) - (a.span * Math.sqrt(a.total)));
    const target = boxes.find(bx => bx.list.length > 1 && bx.span >= 10);
    if (!target) break;
    const sorted = [...target.list].sort((a, b) => a[target.channel] - b[target.channel]);
    const halfWeight = target.total / 2;
    let running = 0;
    let splitIdx = 1;
    for (let i = 0; i < sorted.length - 1; i++) {
      running += sorted[i].count;
      if (running >= halfWeight) {
        splitIdx = Math.max(1, i + 1);
        break;
      }
    }
    boxes = boxes.filter(b => b !== target);
    boxes.push(boxStats(sorted.slice(0, splitIdx)), boxStats(sorted.slice(splitIdx)));
  }

  let centroids = boxes.map(bx => {
    let r = 0, g = 0, b = 0;
    for (const item of bx.list) {
      r += item.r * item.count;
      g += item.g * item.count;
      b += item.b * item.count;
    }
    return { r: r / bx.total, g: g / bx.total, b: b / bx.total, weight: bx.total };
  });

  for (let pass = 0; pass < 2; pass++) {
    const sums = centroids.map(() => ({ r: 0, g: 0, b: 0, w: 0 }));
    for (const pt of buckets) {
      let bestIdx = 0;
      let bestDist = Infinity;
      for (let k = 0; k < centroids.length; k++) {
        const d = colorDistSq(pt, centroids[k]);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = k;
        }
      }
      sums[bestIdx].r += pt.r * pt.count;
      sums[bestIdx].g += pt.g * pt.count;
      sums[bestIdx].b += pt.b * pt.count;
      sums[bestIdx].w += pt.count;
    }
    centroids = centroids
      .map((c, idx) =>
        sums[idx].w > 0
          ? { r: sums[idx].r / sums[idx].w, g: sums[idx].g / sums[idx].w, b: sums[idx].b / sums[idx].w, weight: sums[idx].w }
          : null
      )
      .filter(Boolean);
  }

  // Deduplicate ultra-close centroids while keeping stronger clusters
  centroids.sort((a, b) => relativeLuminance(a) - relativeLuminance(b));
  const pool = [];
  for (const c of centroids) {
    const close = pool.find(p => colorDistSq(p, c) < 550);
    if (!close) pool.push({ ...c, hex: rgbToHex(c), lum: relativeLuminance(c), hsl: rgbToHsl(c) });
  }
  if (!pool.length) return [];

  // Select up to `cap` maximally diverse colors: anchor darkest + lightest, then farthest perceptual/chroma spread
  const minSignificant = Math.max(2, sampledCount * 0.004);
  const significant = pool.filter(c => c.weight >= minSignificant);
  const candidates = significant.length >= Math.min(cap, 3) ? significant : pool;

  const picked = [];
  const addPick = item => {
    if (item && !picked.includes(item)) picked.push(item);
  };
  addPick(candidates[0]);
  addPick(candidates[candidates.length - 1]);

  while (picked.length < cap && picked.length < pool.length) {
    let bestItem = null;
    let bestScore = -1;
    for (const cand of pool) {
      if (picked.includes(cand)) continue;
      let minDist = Infinity;
      for (const p of picked) {
        const d = colorDistSq(cand, p);
        if (d < minDist) minDist = d;
      }
      if (minDist < 900) continue;
      const weightFrac = Math.max(0.005, cand.weight / Math.max(1, sampledCount));
      const score = Math.sqrt(minDist) * (0.65 + 0.65 * cand.hsl.s) * Math.pow(weightFrac, 0.16);
      if (score > bestScore) {
        bestScore = score;
        bestItem = cand;
      }
    }
    if (!bestItem) break;
    addPick(bestItem);
  }

  return [...new Set(
    picked
      .slice(0, cap)
      .sort((a, b) => a.lum - b.lum)
      .map(c => c.hex)
  )];
}

/**
 * Loads an image File/Blob/URL offscreen in the background and extracts up to 7 palette hex colors.
 */
export async function extractImagePalette(source, { maxColors = 7, yieldToUi = null } = {}) {
  const objectUrl = source instanceof Blob ? URL.createObjectURL(source) : null;
  const imgUrl = objectUrl || String(source || '');
  if (!imgUrl) return [];

  try {
    if (yieldToUi) await yieldToUi();
    let drawable = null;
    let width = 0;
    let height = 0;
    if (source instanceof Blob && typeof createImageBitmap === 'function') {
      drawable = await createImageBitmap(source);
      width = drawable.width;
      height = drawable.height;
    } else {
      const img = new Image();
      img.decoding = 'async';
      img.src = imgUrl;
      await img.decode();
      drawable = img;
      width = img.naturalWidth || img.width;
      height = img.naturalHeight || img.height;
    }
    if (!width || !height) return [];

    if (yieldToUi) await yieldToUi();
    const scale = Math.min(1, 96 / Math.max(width, height));
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(drawable, 0, 0, w, h);
    if (typeof drawable?.close === 'function') drawable.close();

    const imageData = ctx.getImageData(0, 0, w, h);
    if (yieldToUi) await yieldToUi();
    return extractPaletteFromImageData(imageData, maxColors);
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

export function normalizePaletteHexes(list) {
  if (!Array.isArray(list)) return [];
  const valid = [];
  const seen = new Set();
  for (const raw of list) {
    const parsed = parseHexColor(raw);
    if (!parsed) continue;
    const hex = rgbToHex(parsed);
    if (seen.has(hex)) continue;
    seen.add(hex);
    valid.push({ hex, rgb: parsed, lum: relativeLuminance(parsed) });
    if (valid.length >= 7) break;
  }
  valid.sort((a, b) => a.lum - b.lum);
  return valid.map(v => v.hex);
}

/**
 * Computes multi-toned CSS theme variables for Dark or Light mode using up to 7 palette colors
 * (mixing calm neutrals, warm/cool layer contrast, readable crisp text, and distinct accents),
 * plus switch thumb/track colors where the 70% thumb represents the current mode and the track
 * represents the opposite mode.
 */
export function buildThemeVariables(mode, paletteHexes = []) {
  const isLight = mode === 'light';
  const palette = normalizePaletteHexes(paletteHexes);
  if (!palette.length) {
    return {
      vars: {},
      switchTrack: isLight ? '#1d1e22' : '#c4c6cc',
      switchThumb: isLight ? '#f5f6f8' : '#161719',
      isCustom: false,
      palette: []
    };
  }

  const parsed = palette.map(hex => {
    const rgb = parseHexColor(hex);
    return { hex, rgb, hsl: rgbToHsl(rgb), lum: relativeLuminance(rgb) };
  });

  const darkest = parsed[0];
  const lightest = parsed[parsed.length - 1];

  // Primary vivid accent from palette (prefers saturated balanced mid-tones)
  const byChroma = [...parsed].sort((a, b) => {
    const scoreA = a.hsl.s * (1.25 - Math.abs(a.lum - 0.40));
    const scoreB = b.hsl.s * (1.25 - Math.abs(b.lum - 0.40));
    return scoreB - scoreA;
  });
  const vividAccent = byChroma[0];

  // Pick a distinct secondary palette tone (cool charcoal vs warm wood, etc.) for layer richness
  const byDistanceFromAccent = [...parsed].sort((a, b) => {
    const scoreA = Math.sqrt(colorDistSq(a.rgb, vividAccent.rgb)) * (0.8 + (a.hsl.s < 0.35 ? 0.35 : 0.1));
    const scoreB = Math.sqrt(colorDistSq(b.rgb, vividAccent.rgb)) * (0.8 + (b.hsl.s < 0.35 ? 0.35 : 0.1));
    return scoreB - scoreA;
  });
  const altTone = byDistanceFromAccent.find(c => c !== lightest && c !== darkest) || byDistanceFromAccent[0] || darkest;

  // Pick a calm base tone for canvas/panels (prefers lower-saturation dark or light anchor so chrome isn't muddy)
  const lowLumCandidates = parsed.filter(c => c.lum <= 0.18);
  const calmDarkAnchor = lowLumCandidates.length
    ? [...lowLumCandidates].sort((a, b) => a.hsl.s - b.hsl.s || a.lum - b.lum)[0]
    : darkest;

  const midTones = parsed.slice(1, Math.max(2, parsed.length - 1));
  const cardCharacter = midTones.find(c => c !== calmDarkAnchor) || altTone || vividAccent;

  let bgRgb, shellRgb, panelRgb, panelSoftRgb, cardRgb, cardHoverRgb, cardSelectedRgb, searchRgb;
  let childRgb, childHoverRgb, childSelectedRgb;
  let textRgb, mutedRgb, dimRgb, accentRgb, chipBg, activeItemBg;

  if (!isLight) {
    // Rich Dark Mode: calm deep palette-anchored panels + distinct subtle card warmth/elevation + crisp off-white type
    const panelBase = clampSurfaceSaturation(
      setLightness(calmDarkAnchor.rgb, Math.min(0.105, Math.max(0.068, calmDarkAnchor.hsl.l * 0.8 + 0.03))),
      0.16
    );
    bgRgb = setLightness(panelBase, Math.max(0.048, rgbToHsl(panelBase).l - 0.022), 0.15);
    shellRgb = setLightness(panelBase, Math.max(0.056, rgbToHsl(panelBase).l - 0.012), 0.15);
    panelRgb = panelBase;
    panelSoftRgb = setLightness(panelBase, rgbToHsl(panelBase).l + 0.015, 0.16);

    const cardTint = mixRgb(panelBase, clampSurfaceSaturation(cardCharacter.rgb, 0.24), 0.26);
    const panelL = rgbToHsl(panelBase).l;
    cardRgb = setLightness(cardTint, Math.min(0.145, panelL + 0.028), 0.19);
    cardHoverRgb = setLightness(mixRgb(cardRgb, vividAccent.rgb, 0.09), Math.min(0.185, panelL + 0.054), 0.24);
    cardSelectedRgb = setLightness(mixRgb(cardRgb, vividAccent.rgb, 0.20), Math.min(0.245, panelL + 0.096), 0.30);
    searchRgb = bgRgb;

    childRgb = setLightness(mixRgb(cardRgb, altTone.rgb, 0.14), Math.min(0.165, panelL + 0.042), 0.22);
    childHoverRgb = setLightness(mixRgb(childRgb, vividAccent.rgb, 0.10), Math.min(0.20, panelL + 0.066), 0.25);
    childSelectedRgb = setLightness(mixRgb(childRgb, vividAccent.rgb, 0.22), Math.min(0.26, panelL + 0.106), 0.32);

    // Crisp luminous text kissed softly with palette's lightest shade (never murky pink/tan)
    textRgb = adjustLightnessForContrast(mixRgb({ r: 235, g: 236, b: 238 }, lightest.rgb, 0.20), cardRgb, 11.2, true);
    mutedRgb = adjustLightnessForContrast(
      mixRgb({ r: 152, g: 156, b: 162 }, mixRgb(lightest.rgb, cardCharacter.rgb, 0.35), 0.36),
      cardRgb,
      4.9,
      true
    );
    dimRgb = adjustLightnessForContrast(mixRgb(mutedRgb, panelRgb, 0.38), panelRgb, 3.1, true);

    const rawHero = vividAccent.hsl.s >= 0.14
      ? vividAccent.rgb
      : hslToRgb({ h: rgbToHsl(panelBase).h, s: 0.45, l: 0.68 });
    accentRgb = adjustLightnessForContrast(rawHero, cardRgb, 4.7, true);
    chipBg = rgba(mixRgb(cardCharacter.rgb, vividAccent.rgb, 0.35), 0.18);
    activeItemBg = cardSelectedRgb;
  } else {
    // Rich Light Mode: airy sunlit palette-kissed panels + crisp lifted cards + deep contrasting ink + rich burnt accent
    const warmLightBase = mixRgb({ r: 244, g: 245, b: 247 }, lightest.rgb, 0.26);
    panelRgb = setLightness(warmLightBase, 0.942, 0.14);
    bgRgb = setLightness(mixRgb(panelRgb, altTone.rgb, 0.10), 0.895, 0.16);
    shellRgb = setLightness(mixRgb(panelRgb, calmDarkAnchor.rgb, 0.12), 0.865, 0.16);
    panelSoftRgb = setLightness(warmLightBase, 0.918, 0.15);

    cardRgb = setLightness(mixRgb({ r: 255, g: 255, b: 255 }, lightest.rgb, 0.16), 0.985, 0.12);
    cardHoverRgb = setLightness(mixRgb(panelRgb, vividAccent.rgb, 0.08), 0.908, 0.22);
    cardSelectedRgb = setLightness(mixRgb(panelRgb, vividAccent.rgb, 0.20), 0.835, 0.30);
    searchRgb = setLightness(mixRgb(panelRgb, altTone.rgb, 0.08), 0.905, 0.14);

    childRgb = setLightness(mixRgb(cardRgb, altTone.rgb, 0.08), 0.945, 0.16);
    childHoverRgb = setLightness(mixRgb(childRgb, vividAccent.rgb, 0.10), 0.892, 0.22);
    childSelectedRgb = setLightness(mixRgb(childRgb, vividAccent.rgb, 0.22), 0.820, 0.30);

    textRgb = adjustLightnessForContrast(mixRgb({ r: 22, g: 23, b: 26 }, calmDarkAnchor.rgb, 0.36), cardRgb, 11.5, false);
    mutedRgb = adjustLightnessForContrast(
      mixRgb({ r: 90, g: 94, b: 102 }, mixRgb(darkest.rgb, cardCharacter.rgb, 0.45), 0.38),
      cardRgb,
      5.0,
      false
    );
    dimRgb = adjustLightnessForContrast(mixRgb(mutedRgb, panelRgb, 0.40), panelRgb, 3.1, false);

    const rawHero = vividAccent.hsl.s >= 0.14
      ? vividAccent.rgb
      : hslToRgb({ h: rgbToHsl(panelRgb).h, s: 0.48, l: 0.38 });
    accentRgb = adjustLightnessForContrast(rawHero, cardRgb, 4.7, false);
    chipBg = rgba(mixRgb(cardCharacter.rgb, vividAccent.rgb, 0.42), 0.12);
    activeItemBg = cardSelectedRgb;
  }

  const accentInkRgb = relativeLuminance(accentRgb) > 0.42 ? { r: 18, g: 19, b: 21 } : { r: 248, g: 249, b: 250 };
  const partialSource = (altTone && altTone !== vividAccent && altTone.hsl.s >= 0.12)
    ? altTone.rgb
    : hslToRgb({ h: (rgbToHsl(accentRgb).h + 0.14) % 1, s: 0.72, l: isLight ? 0.45 : 0.68 });
  const partialAccentRgb = adjustLightnessForContrast(partialSource, panelSoftRgb, 4.3, !isLight);
  const brandInkRgb = adjustLightnessForContrast(mixRgb(textRgb, vividAccent.rgb, 0.28), panelRgb, 5.2, !isLight);

  // Switch rule: 70% thumb shows CURRENT mode (darkest palette color in Dark mode, lightest in Light mode),
  // switch background track shows OPPOSITE mode (light palette tone in Dark mode, dark palette tone in Light mode).
  const switchThumbRgb = isLight ? lightest.rgb : darkest.rgb;
  const switchThumbHex = isLight ? lightest.hex : darkest.hex;
  const oppositeExtreme = isLight ? darkest.rgb : lightest.rgb;
  const switchTrackRgb = contrastRatio(switchThumbRgb, oppositeExtreme) >= 3.0
    ? oppositeExtreme
    : adjustLightnessForContrast(
        isLight ? mixRgb(darkest.rgb, panelRgb, 0.1) : mixRgb(lightest.rgb, panelRgb, 0.1),
        switchThumbRgb,
        3.4,
        !isLight
      );

  const shadowBase = isLight ? mixRgb({ r: 20, g: 22, b: 26 }, calmDarkAnchor.rgb, 0.4) : { r: 8, g: 9, b: 12 };
  const cropFrame = adjustLightnessForContrast(accentRgb, shadowBase, 4.5, true);

  return {
    vars: {
      '--bg': rgbToHex(bgRgb),
      '--shell': rgbToHex(shellRgb),
      '--panel': rgbToHex(panelRgb),
      '--panel-soft': rgbToHex(panelSoftRgb),
      '--card': rgbToHex(cardRgb),
      '--card-hover': rgbToHex(cardHoverRgb),
      '--card-selected': rgbToHex(activeItemBg),
      '--search-bg': rgbToHex(searchRgb),
      '--sample-edit-bg': rgbToHex(isLight ? cardRgb : bgRgb),
      '--family-child-bg': rgbToHex(childRgb),
      '--family-child-hover': rgbToHex(childHoverRgb),
      '--family-child-selected': rgbToHex(childSelectedRgb),
      '--line': rgba(mixRgb(textRgb, vividAccent.rgb, 0.25), isLight ? 0.095 : 0.09),
      '--line-strong': rgba(mixRgb(textRgb, accentRgb, 0.45), isLight ? 0.20 : 0.20),
      '--text': rgbToHex(textRgb),
      '--muted': rgbToHex(mutedRgb),
      '--dim': rgbToHex(dimRgb),
      '--accent': rgbToHex(accentRgb),
      '--accent-ink': rgbToHex(accentInkRgb),
      '--accent-soft': rgba(accentRgb, isLight ? 0.12 : 0.15),
      '--blue': rgbToHex(accentRgb),
      '--select-all-color': rgbToHex(accentRgb),
      '--select-partial-color': rgbToHex(partialAccentRgb),
      '--brand-ink': rgbToHex(brandInkRgb),
      '--hover-bg': rgba(mixRgb(textRgb, accentRgb, 0.3), 0.07),
      '--hover-bg-strong': rgba(accentRgb, 0.18),
      '--selection-bg': rgba(accentRgb, isLight ? 0.22 : 0.26),
      '--chip-bg': chipBg,
      '--overlay-backdrop': rgba(shadowBase, isLight ? 0.42 : 0.74),
      '--shadow-popover': rgba(shadowBase, isLight ? 0.16 : 0.50),
      '--crop-scrim': rgba(shadowBase, isLight ? 0.54 : 0.68),
      '--crop-border': rgbToHex(cropFrame),
      '--crop-handle-bg': rgbToHex(cropFrame),
      '--crop-handle-border': rgbToHex(panelRgb),
      '--scroll-track': rgba(textRgb, isLight ? 0.06 : 0.05),
      '--scroll-thumb': rgba(mixRgb(mutedRgb, accentRgb, 0.35), isLight ? 0.26 : 0.24),
      '--scroll-thumb-hover': rgba(mixRgb(mutedRgb, accentRgb, 0.45), isLight ? 0.42 : 0.40),
      '--switch-track': rgbToHex(switchTrackRgb),
      '--switch-thumb': switchThumbHex
    },
    switchTrack: rgbToHex(switchTrackRgb),
    switchThumb: switchThumbHex,
    isCustom: true,
    palette
  };
}

export function clearThemeVariables(targetStyle = document.documentElement?.style) {
  if (!targetStyle) return;
  for (const key of THEME_VAR_KEYS) {
    targetStyle.removeProperty(key);
  }
}

export function applyThemeVariablesToRoot(mode, paletteHexes = [], rootEl = document.documentElement) {
  if (!rootEl) return null;
  const resolvedMode = mode === 'light' ? 'light' : 'dark';
  const result = buildThemeVariables(resolvedMode, paletteHexes);
  rootEl.dataset.theme = resolvedMode;
  rootEl.dataset.customTheme = result.isCustom ? 'true' : 'false';
  rootEl.style.colorScheme = resolvedMode;

  clearThemeVariables(rootEl.style);
  for (const [k, v] of Object.entries(result.vars)) {
    rootEl.style.setProperty(k, v);
  }
  if (!result.isCustom) {
    rootEl.style.setProperty('--switch-track', result.switchTrack);
    rootEl.style.setProperty('--switch-thumb', result.switchThumb);
  }

  const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
  if (metaColorScheme) metaColorScheme.setAttribute('content', resolvedMode);
  return result;
}
