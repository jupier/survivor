/**
 * Translation system for the game
 *
 * To add a new language:
 * 1. Create a new file: translations-{lang}.json (e.g., translations-fr.json)
 * 2. Copy the structure from translations.json and translate all values
 * 3. Import it here and add it to the translations object
 * 4. Set the default language or allow user selection
 */

import enTranslations from "./translations.json";
import frTranslations from "./translations-fr.json";

export type Language = "en" | "fr";

export interface Translations {
  ui: {
    level: string;
    playerLevel: string;
    kills: string;
    xp: string;
    gems: string;
    hp: string;
    stats: string;
    speed: string;
    projectiles: string;
    range: string;
    fireRate: string;
    fps: string;
  };
  menus: {
    levelUp: {
      title: string;
      options: {
        [key: string]: {
          title: string;
          description: string;
        };
      };
    };
    pause: {
      title: string;
      instruction: string;
    };
    death: {
      title: string;
      instruction: string;
    };
    admin: {
      title: string;
      closeInstruction: string;
      sections: {
        playerUpgrades: string;
        levelSelection: string;
      };
      buttons: {
        [key: string]: string;
      };
      formats: {
        [key: string]: string;
      };
    };
  };
  powerUps: {
    speedBoost: string;
    magnet: string;
    invincibility: string;
    damageBoost: string;
  };
  levelTransition: {
    complete: string;
  };
  levels: {
    [key: string]: string;
  };
  language: {
    select: string;
    english: string;
    french: string;
  };
}

const translations: Record<Language, Translations> = {
  en: enTranslations as Translations,
  fr: frTranslations as Translations,
};

const LANGUAGE_STORAGE_KEY = "survivor_game_language";

// Load language from localStorage or default to "en"
function loadLanguageFromStorage(): Language {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && translations[saved as Language]) {
      return saved as Language;
    }
  } catch (e) {
    // localStorage might not be available
    console.warn("Could not load language from localStorage:", e);
  }
  return "en";
}

let currentLanguage: Language = loadLanguageFromStorage();

export function setLanguage(lang: Language): void {
  if (translations[lang]) {
    currentLanguage = lang;
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (e) {
      console.warn("Could not save language to localStorage:", e);
    }
  }
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function getAvailableLanguages(): Language[] {
  return Object.keys(translations) as Language[];
}

export function t(): Translations {
  return translations[currentLanguage];
}

/**
 * Helper function to format strings with placeholders
 * Example: format("Speed: {value} (+20)", { value: 120 }) => "Speed: 120 (+20)"
 */
export function format(
  template: string,
  values: Record<string, string | number>
): string {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
  }
  return result;
}
