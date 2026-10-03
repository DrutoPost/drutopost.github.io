export const defaultMappings: Record<string, string> = {
  'খুন': 'খু*ন',
  'খুনি': 'খু*নি',
  'খুনের': 'খু*নের',
  'খুনির': 'খু*নির',
  'খুনিদের': 'খু*নিদের',
  'খুনিরা': 'খু*নিরা',
  'হত্যা': 'হ*ত্যা',
  'হত্যার': 'হ*তার',
  'হত্যাকারী': 'হ*ত্যাকারী',
  'হত্যাকারীকে': 'হ*ত্যাকারীকে',
  'হত্যাকারীদের': 'হ*ত্যাকারীদের',
  'হত্যাকারীদেরকে': 'হ*ত্যাকারীদেরকে',
  'হত্যাকাণ্ড': 'হ*ত্যাকাণ্ড',
  'হত্যাকান্ডকে': 'হ*ত্যাকাণ্ডকে',
  'হত্যাকাণ্ডের': 'হ*ত্যাকাণ্ডের',
  'আত্মহত্যা': 'আ*ত্মহত্যা',
  'আত্মহত্যার': 'আ*ত্মহত্যার',
  'আত্মাহুতি': 'আ*ত্মাহুতি',
  'আত্মাহুতির': 'আ*ত্মাহুতির',
  'ধর্ষণ': 'ধ*র্ষণ',
  'ধর্ষণের': 'ধ*র্ষণের',
  'ধর্ষণকান্ড': 'ধ*র্ষণকান্ড',
  'ধর্ষণকান্ডকে': 'ধ*র্ষণকান্ডকে',
  'ধর্ষণকান্ডের': 'ধ*র্ষণকান্ডের',
  'ধর্ষিত': 'ধ*র্ষিত',
  'ধর্ষিতা': 'ধ*র্ষিতা',
  'ধর্ষিতারা': 'ধ*র্ষিতারা',
  'ধর্ষিতাদের': 'ধ*র্ষিতাদের',
  'ধর্ষিতাদেরকে': 'ধ*র্ষিতাদেরকে',
  'ধর্ষিতাকে': 'ধ*র্ষিতাকে',
  'ধর্ষক': 'ধর্ষক',
  'ধর্ষকেরা': 'ধ*র্ষকেরা',
  'ধর্ষককে': 'ধ*র্ষককে',
  'ধর্ষকরা': 'ধ*র্ষকরা',
  'ধর্ষণকারী': 'ধ*র্ষণকারী',
  'গণহত্যা': 'গণহ*ত্যা',
  'গণহত্যার': 'গণহ*তার',
  'গণহত্যাকারী': 'গণহ*ত্যাকারী',
  'গণধর্ষণ': 'গণধ*র্ষণ',
  'গণধর্ষণকারী': 'গণধ*র্ষণকারী',
  'গণধর্ষণকারীরা': 'গণধ*র্ষণকারীরা',
  'গণধর্ষণের': 'গণধ*',
  'গণধর্ষণকে': 'গণধ*র্ষণকে',
  'ধর্ষণকে': 'ধ*র্ষণকে',
  'গাজা': 'গা*জা',
  'গাজার': 'গা*জার',
  'গাজাবাসী': 'গা*জাবাসী',
  'ফিলিস্তিন': 'ফিলি*স্তিন',
  'ফিলিস্তিনি': 'ফিলি*স্তিনি',
  'ইসরাইল': 'ইস*রাইল',
  'ইসরাইলের': 'ইস*রাইলের',
  'ইসরায়েল': 'ইস*রায়েল',
  'ইসরায়েলের': 'ইস*রায়েলের',
  'ইসরায়েলি': 'ইস*রায়েলি',
  'ইহুদি': 'ইহু*দি',
  'ইহুদিরা': 'ইহু*দিরা',
  'ইহুদিদের': 'ইহু*দিদের',
  'ইহুদী': 'ইহু*দী',
  'ইহুদীরা': 'ইহু*দীরা',
  'ইহুদীদের': 'ইহু*দীদের',
  'ইহুদীদেরকে': 'ইহু*দীদেরকে',
  'ইহুদিদেরকে': 'ইহু*দিদেরকে',
  'জিহাদ': 'জি*হাদ',
  'জিহাদী': 'জি*হাদী',
  'জিহাদি': 'জি*হাদি',
  'জঙ্গি': 'জ*ঙ্গি',
  'জঙ্গিদের': 'জ*ঙ্গিদের',
  'জঙ্গিরা': 'জ*ঙ্গিরা',
};

/**
 * Applies the case of the original string to the replacement string.
 */
const applyCase = (original: string, replacement: string): string => {
  // 1. All uppercase
  if (original === original.toUpperCase() && original !== original.toLowerCase()) {
    return replacement.toUpperCase();
  }

  // 2. All lowercase
  if (original === original.toLowerCase() && original !== original.toUpperCase()) {
    return replacement.toLowerCase();
  }

  // 3. Capitalized (First letter upper, rest lower)
  const startsWithUpper = original[0] === original[0].toUpperCase() && original[0] !== original[0].toLowerCase();
  const restIsLower = original.slice(1) === original.slice(1).toLowerCase();
  if (startsWithUpper && restIsLower) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1).toLowerCase();
  }

  // 4. Mixed case or other: character by character mapping
  let result = '';
  let originalIndex = 0;

  for (let i = 0; i < replacement.length; i++) {
    const replacementChar = replacement[i];
    if (/[a-zA-Z]/.test(replacementChar)) {
      if (originalIndex < original.length) {
        const originalChar = original[originalIndex];
        // Apply original char's case to replacement char
        if (originalChar === originalChar.toUpperCase() && originalChar !== originalChar.toLowerCase()) {
          result += replacementChar.toUpperCase();
        } else {
          result += replacementChar.toLowerCase();
        }
        originalIndex++;
      } else {
        result += replacementChar;
      }
    } else {
      result += replacementChar;
      // If replacement has a symbol, check if original also has one to stay in sync
      if (originalIndex < original.length && !/[a-zA-Z]/.test(original[originalIndex])) {
        originalIndex++;
      }
    }
  }
  return result;
};

// Internal cache for default mappings to optimize performance
let cachedDefaultRegex: RegExp | null = null;
let cachedLowerDefaultMappings: Record<string, string> | null = null;

/**
 * Censors restricted words in a text while preserving the original case.
 * Optimized to use a single-pass regex replacement.
 */
export const censorText = (text: string, customMappings?: Record<string, string>) => {
  if (!text) return text;

  const mappings = customMappings || defaultMappings;
  if (Object.keys(mappings).length === 0) return text;

  let regex: RegExp;
  let lowerMap: Record<string, string>;

  // Use cached regex and mapping if using default restricted words
  if (!customMappings && cachedDefaultRegex && cachedLowerDefaultMappings) {
    regex = cachedDefaultRegex;
    lowerMap = cachedLowerDefaultMappings;
  } else {
    // Sort keys by length descending to ensure longest matches are prioritized in the regex alternation
    const keys = Object.keys(mappings).sort((a, b) => b.length - a.length);
    // Escape special characters to safely use words in a regular expression
    const escapedKeys = keys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    // Use Unicode-aware word boundaries (lookarounds) to avoid partial word matches
    regex = new RegExp(`(?<!\\p{L})(?:${escapedKeys.join('|')})(?!\\p{L})`, 'giu');

    // Create a lowercase-keyed map for fast replacement lookup
    lowerMap = {};
    for (const [k, v] of Object.entries(mappings)) {
      lowerMap[k.toLowerCase()] = v;
    }

    // Cache the results for default mappings
    if (!customMappings) {
      cachedDefaultRegex = regex;
      cachedLowerDefaultMappings = lowerMap;
    }
  }

  // Single-pass replacement using the combined regex
  return text.replace(regex, (match) => {
    const template = lowerMap[match.toLowerCase()];
    if (!template) return match;
    return applyCase(match, template);
  });
};