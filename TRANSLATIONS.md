# Translation Guide

This document explains how to translate the game into different languages.

## Translation Files

All translatable strings are stored in JSON files:

- `src/game/translations.json` - English (default)
- `src/game/translations-{lang}.json` - Other languages (e.g., `translations-fr.json` for French)

## Structure

The translation file is organized into sections:

- **ui**: User interface labels (Level, Kills, XP, etc.)
- **menus**: All menu text (level up menu, pause menu, death screen, admin menu)
- **powerUps**: Power-up names
- **levelTransition**: Level transition messages
- **levels**: Level names

## Adding a New Language

1. **Create a new translation file**:

   ```bash
   cp src/game/translations.json src/game/translations-fr.json
   ```

2. **Translate all values** in the JSON file (keep the keys the same):

   ```json
   {
     "ui": {
       "level": "Niveau",  // French translation
       "kills": "Morts",
       ...
     }
   }
   ```

3. **Update `translations.ts`** to include your new language:

   ```typescript
   import frTranslations from "./translations-fr.json";

   const translations: Record<Language, Translations> = {
     en: enTranslations as Translations,
     fr: frTranslations as Translations,
   };

   export type Language = "en" | "fr";
   ```

4. **Set the language** in your game initialization:
   ```typescript
   import { setLanguage } from "./translations";
   setLanguage("fr");
   ```

## Using Translations in Code

### Basic Usage

```typescript
import { t } from "./translations";

// Get a simple string
const levelText = t().ui.level; // "Level" (or "Niveau" in French)

// Get nested values
const menuTitle = t().menus.levelUp.title; // "Level Up!"
```

### Formatting Strings with Values

For strings that need dynamic values, use the `format` function:

```typescript
import { t, format } from "./translations";

// Format a string with placeholders
const speedText = format(t().menus.admin.formats.speed, { value: 120 });
// Result: "Speed: 120 (+20)"
```

### Example: Updating UI Text

```typescript
// Before (hardcoded):
ui.killsText.text = `Kills: ${state.enemiesKilled}`;

// After (translatable):
import { t, format } from "./translations";
ui.killsText.text = `${t().ui.kills}: ${state.enemiesKilled}`;
```

## All Translatable Strings

### UI Labels

- `ui.level` - "Level"
- `ui.playerLevel` - "Player Lv."
- `ui.kills` - "Kills"
- `ui.xp` - "XP"
- `ui.gems` - "gems"
- `ui.hp` - "HP"
- `ui.stats` - "Stats"
- `ui.speed` - "Speed"
- `ui.projectiles` - "Projectiles"
- `ui.range` - "Range"
- `ui.fireRate` - "Fire Rate"
- `ui.fps` - "FPS"

### Level Up Menu

- `menus.levelUp.title` - "Level Up!"
- `menus.levelUp.options.{optionId}.title` - Option titles
- `menus.levelUp.options.{optionId}.description` - Option descriptions

### Pause Menu

- `menus.pause.title` - "PAUSED"
- `menus.pause.instruction` - "Press ESC to resume"

### Death Screen

- `menus.death.title` - "Game Over"
- `menus.death.instruction` - "Refresh the page to restart"

### Admin Menu

- `menus.admin.title` - "ADMIN MENU"
- `menus.admin.closeInstruction` - "Press F2 to close"
- `menus.admin.sections.playerUpgrades` - "PLAYER UPGRADES"
- `menus.admin.sections.levelSelection` - "LEVEL SELECTION"
- `menus.admin.buttons.*` - Button labels
- `menus.admin.formats.*` - Format strings with placeholders

### Power-ups

- `powerUps.speedBoost` - "Speed Boost"
- `powerUps.magnet` - "Magnet"
- `powerUps.invincibility` - "Invincibility"
- `powerUps.damageBoost` - "Damage Boost"

### Level Transition

- `levelTransition.complete` - "Level Complete! Next Level Starting..."

### Levels

- `levels.{number}` - Level names (e.g., "Level 1", "Level 2")

## Notes

- All keys in the JSON files must remain the same across all languages
- Only the values (strings) should be translated
- For format strings with placeholders like `{value}`, use the `format()` function
- The game defaults to English ("en") if no language is set
