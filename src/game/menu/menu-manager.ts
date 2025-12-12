import { Z_INDEX } from "../assets/z-index";
import {
  t,
  setLanguage,
  getLanguage,
  getAvailableLanguages,
} from "../translation/translations";

export interface PauseMenuCallbacks {
  onLanguageChange?: () => void;
}

let pauseMenuCallbacks: PauseMenuCallbacks | null = null;

export function showPauseMenu(
  k: ReturnType<typeof import("kaplay").default>,
  callbacks?: PauseMenuCallbacks
): void {
  pauseMenuCallbacks = callbacks || null;

  // Create pause overlay
  k.add([
    k.rect(k.width(), k.height()),
    k.color(0, 0, 0),
    k.opacity(0.7),
    k.pos(0, 0),
    k.anchor("topleft"),
    k.fixed(),
    k.z(Z_INDEX.PAUSE_MENU_OVERLAY),
    "pause",
  ]);

  const centerX = k.width() / 2;
  let currentY = k.height() / 2 - 80;

  // Pause text
  k.add([
    k.text(t().menus.pause.title, { size: 48 }),
    k.color(255, 255, 255),
    k.pos(centerX, currentY),
    k.anchor("center"),
    k.fixed(),
    k.z(Z_INDEX.PAUSE_MENU_TEXT),
    "pause",
  ]);
  currentY += 70;

  // Instruction text
  k.add([
    k.text(t().menus.pause.instruction, { size: 20 }),
    k.color(200, 200, 200),
    k.pos(centerX, currentY),
    k.anchor("center"),
    k.fixed(),
    k.z(Z_INDEX.PAUSE_MENU_TEXT),
    "pause",
  ]);
  currentY += 50;

  // Language selection section
  k.add([
    k.text(t().language.select, { size: 18 }),
    k.color(200, 200, 200),
    k.pos(centerX, currentY),
    k.anchor("center"),
    k.fixed(),
    k.z(Z_INDEX.PAUSE_MENU_TEXT),
    "pause",
  ]);
  currentY += 35;

  const buttonWidth = 150;
  const buttonHeight = 35;
  const buttonSpacing = 10;
  const currentLang = getLanguage();
  const availableLanguages = getAvailableLanguages();

  // Language name mapping
  const languageNames: Record<string, string> = {
    en: t().language.english,
    fr: t().language.french,
  };

  // Language buttons
  availableLanguages.forEach((lang, index) => {
    const isSelected = lang === currentLang;
    const buttonX =
      centerX -
      (availableLanguages.length * (buttonWidth + buttonSpacing)) / 2 +
      index * (buttonWidth + buttonSpacing) +
      buttonWidth / 2;

    const buttonBg = k.add([
      k.rect(buttonWidth, buttonHeight),
      k.color(
        isSelected ? 100 : 60,
        isSelected ? 150 : 60,
        isSelected ? 200 : 60
      ),
      k.pos(buttonX, currentY),
      k.anchor("center"),
      k.fixed(),
      k.z(Z_INDEX.PAUSE_MENU_TEXT),
      k.area(),
      "pause",
    ]);

    const langName = languageNames[lang] || lang.toUpperCase();
    k.add([
      k.text(langName, { size: 16 }),
      k.color(255, 255, 255),
      k.pos(buttonX, currentY),
      k.anchor("center"),
      k.fixed(),
      k.z(Z_INDEX.PAUSE_MENU_TEXT + 1),
      "pause",
    ]);

    if (!isSelected) {
      buttonBg.onClick(() => {
        setLanguage(lang);
        // Refresh the pause menu to show updated language
        hidePauseMenu(k);
        showPauseMenu(k, callbacks);
        // Notify callback if provided
        if (pauseMenuCallbacks?.onLanguageChange) {
          pauseMenuCallbacks.onLanguageChange();
        }
      });
    }
  });
}

export function hidePauseMenu(
  k: ReturnType<typeof import("kaplay").default>
): void {
  // Remove all pause menu elements
  const pauseElements = k.get("pause");
  pauseElements.forEach((elem) => elem.destroy());
}

export function showDeathScreen(
  k: ReturnType<typeof import("kaplay").default>
): void {
  // Create death screen overlay
  k.add([
    k.rect(k.width(), k.height()),
    k.color(0, 0, 0),
    k.opacity(0.8),
    k.pos(0, 0),
    k.anchor("topleft"),
    k.fixed(),
    k.z(Z_INDEX.DEATH_SCREEN_OVERLAY),
  ]);

  // Death message
  k.add([
    k.text("Game Over", { size: 48 }),
    k.color(255, 0, 0),
    k.pos(k.width() / 2, k.height() / 2 - 50),
    k.anchor("center"),
    k.fixed(),
    k.z(Z_INDEX.DEATH_SCREEN_TEXT),
  ]);

  // Restart instruction
  k.add([
    k.text("Refresh the page to restart", { size: 24 }),
    k.color(255, 255, 255),
    k.pos(k.width() / 2, k.height() / 2 + 50),
    k.anchor("center"),
    k.fixed(),
    k.z(Z_INDEX.DEATH_SCREEN_TEXT),
  ]);
}
