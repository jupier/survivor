import { GameState } from "../core/game-state";
import { Z_INDEX } from "../assets/z-index";
import { LEVEL_CONFIGS } from "../core/level-config";

export interface AdminMenuCallbacks {
  onUpgrade: (upgradeType: string, value?: number) => void;
  onLevelChange: (levelNumber: number) => void;
  onClose: () => void;
}

interface ButtonRef {
  bg: any;
  text: any;
  updateText: (state: GameState) => string;
  upgradeType?: string;
  levelNumber?: number;
}

let adminMenuElements: any[] = [];
let buttonRefs: ButtonRef[] = [];
let isMenuOpen = false;
let menuCallbacks: AdminMenuCallbacks | null = null;

export function showAdminMenu(
  k: ReturnType<typeof import("kaplay").default>,
  state: GameState,
  callbacks: AdminMenuCallbacks
): void {
  // Prevent double-opening
  if (isMenuOpen) {
    return;
  }

  // Hide any existing admin menu first
  hideAdminMenu(k);
  isMenuOpen = true;
  menuCallbacks = callbacks;

  // Create semi-transparent overlay
  const overlay = k.add([
    k.rect(k.width(), k.height()),
    k.color(0, 0, 0),
    k.opacity(0.85),
    k.pos(0, 0),
    k.anchor("topleft"),
    k.fixed(),
    k.z(Z_INDEX.LEVEL_UP_MENU_BG),
    "adminMenu",
  ]);
  adminMenuElements.push(overlay);

  // Menu container
  const menuWidth = 600;
  const menuHeight = 700;
  const menuX = (k.width() - menuWidth) / 2;
  const menuY = (k.height() - menuHeight) / 2;

  const menuBg = k.add([
    k.rect(menuWidth, menuHeight),
    k.color(30, 30, 40),
    k.pos(menuX, menuY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(Z_INDEX.LEVEL_UP_MENU_CONTENT),
    "adminMenu",
  ]);
  adminMenuElements.push(menuBg);

  // Title
  const title = k.add([
    k.text("ADMIN MENU", { size: 36 }),
    k.color(255, 215, 0), // Gold
    k.pos(k.width() / 2, menuY + 30),
    k.anchor("center"),
    k.fixed(),
    k.z(Z_INDEX.LEVEL_UP_MENU_OPTIONS),
    "adminMenu",
  ]);
  adminMenuElements.push(title);

  // Close instruction
  const instruction = k.add([
    k.text("Press F2 to close", { size: 14 }),
    k.color(200, 200, 200),
    k.pos(k.width() / 2, menuY + 70),
    k.anchor("center"),
    k.fixed(),
    k.z(Z_INDEX.LEVEL_UP_MENU_OPTIONS),
    "adminMenu",
  ]);
  adminMenuElements.push(instruction);

  let currentY = menuY + 110;
  const sectionSpacing = 20;
  const buttonHeight = 35;
  const buttonSpacing = 8;
  const buttonWidth = menuWidth - 80;
  const buttonX = menuX + 40;

  // Player Upgrades Section
  const upgradesTitle = k.add([
    k.text("PLAYER UPGRADES", { size: 20 }),
    k.color(100, 200, 255),
    k.pos(buttonX, currentY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(Z_INDEX.LEVEL_UP_MENU_OPTIONS),
    "adminMenu",
  ]);
  adminMenuElements.push(upgradesTitle);
  currentY += 30;

  // Speed upgrade
  createUpgradeButton(
    k,
    buttonX,
    currentY,
    buttonWidth,
    buttonHeight,
    (s) => `Speed: ${Math.round(s.speed)} (+20)`,
    "speed",
    false,
    "adminMenu"
  );
  currentY += buttonHeight + buttonSpacing;

  // Fire Rate upgrade
  createUpgradeButton(
    k,
    buttonX,
    currentY,
    buttonWidth,
    buttonHeight,
    (s) => `Fire Rate: ${(1 / s.fireInterval).toFixed(1)}/s (+30%)`,
    "fireSpeed",
    false,
    "adminMenu"
  );
  currentY += buttonHeight + buttonSpacing;

  // Projectile Count upgrade
  createUpgradeButton(
    k,
    buttonX,
    currentY,
    buttonWidth,
    buttonHeight,
    (s) => `Projectiles: ${s.projectileCount} (+1)`,
    "projectileCount",
    false,
    "adminMenu"
  );
  currentY += buttonHeight + buttonSpacing;

  // Targeting Zone upgrade
  createUpgradeButton(
    k,
    buttonX,
    currentY,
    buttonWidth,
    buttonHeight,
    (s) => `Range: ${s.targetingZoneRadius} (+30%)`,
    "targetingZone",
    false,
    "adminMenu"
  );
  currentY += buttonHeight + buttonSpacing;

  // Health upgrade
  createUpgradeButton(
    k,
    buttonX,
    currentY,
    buttonWidth,
    buttonHeight,
    (s) => `Max Health: ${s.maxHealth} (+1)`,
    "increaseHealth",
    false,
    "adminMenu"
  );
  currentY += buttonHeight + buttonSpacing;

  // Slow Weapon toggle
  createUpgradeButton(
    k,
    buttonX,
    currentY,
    buttonWidth,
    buttonHeight,
    (s) =>
      `Slow Weapon: ${s.slowWeaponActive ? "ACTIVE" : "INACTIVE"} (Toggle)`,
    "slowWeapon",
    false,
    "adminMenu"
  );
  currentY += buttonHeight + buttonSpacing;

  // Slow Effect upgrade (only if weapon is active)
  if (state.slowWeaponActive) {
    createUpgradeButton(
      k,
      buttonX,
      currentY,
      buttonWidth,
      buttonHeight,
      (s) => `Slow Effect: ${s.slowEffectPercentage}% (+10%)`,
      "slowEffect",
      false,
      "adminMenu"
    );
    currentY += buttonHeight + buttonSpacing;
  }

  // AOE Weapon toggle
  createUpgradeButton(
    k,
    buttonX,
    currentY,
    buttonWidth,
    buttonHeight,
    (s) => `AOE Weapon: ${s.aoeWeaponActive ? "ACTIVE" : "INACTIVE"} (Toggle)`,
    "aoeWeapon",
    false,
    "adminMenu"
  );
  currentY += buttonHeight + buttonSpacing;

  // AOE Speed upgrade (only if weapon is active)
  if (state.aoeWeaponActive) {
    createUpgradeButton(
      k,
      buttonX,
      currentY,
      buttonWidth,
      buttonHeight,
      (s) => `AOE Speed: ${(1 / s.aoeWeaponCooldown).toFixed(1)}/s (+20%)`,
      "aoeSpeed",
      false,
      "adminMenu"
    );
    currentY += buttonHeight + buttonSpacing;
  }

  currentY += sectionSpacing;

  // Level Selection Section
  const levelTitle = k.add([
    k.text("LEVEL SELECTION", { size: 20 }),
    k.color(255, 150, 100),
    k.pos(buttonX, currentY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(Z_INDEX.LEVEL_UP_MENU_OPTIONS),
    "adminMenu",
  ]);
  adminMenuElements.push(levelTitle);
  currentY += 30;

  // Level buttons
  LEVEL_CONFIGS.forEach((levelConfig) => {
    const isCurrentLevel = levelConfig.levelNumber === state.currentLevel;
    createUpgradeButton(
      k,
      buttonX,
      currentY,
      buttonWidth,
      buttonHeight,
      (s) =>
        `Level ${levelConfig.levelNumber}: ${levelConfig.name}${
          levelConfig.levelNumber === s.currentLevel ? " (CURRENT)" : ""
        }`,
      undefined,
      isCurrentLevel,
      "adminMenu",
      levelConfig.levelNumber
    );
    currentY += buttonHeight + buttonSpacing;
  });

  // Update all button texts
  updateAllButtonTexts(state);
}

function createUpgradeButton(
  k: ReturnType<typeof import("kaplay").default>,
  x: number,
  y: number,
  width: number,
  height: number,
  updateText: (state: GameState) => string,
  upgradeType: string | undefined,
  isHighlighted: boolean,
  tag: string,
  levelNumber?: number
): void {
  const initialColor = isHighlighted ? [80, 80, 100] : [60, 60, 60];

  const buttonBg = k.add([
    k.rect(width, height),
    k.color(initialColor[0], initialColor[1], initialColor[2]),
    k.pos(x, y),
    k.anchor("topleft"),
    k.fixed(),
    k.z(Z_INDEX.LEVEL_UP_MENU_OPTIONS),
    k.area(),
    tag,
  ]);
  // Store k instance for later color updates
  (buttonBg as any)._kInstance = k;
  adminMenuElements.push(buttonBg);

  const buttonText = k.add([
    k.text("", { size: 16 }),
    k.color(
      isHighlighted ? 255 : 255,
      isHighlighted ? 255 : 200,
      isHighlighted ? 200 : 200
    ),
    k.pos(x + width / 2, y + height / 2),
    k.anchor("center"),
    k.fixed(),
    k.z(Z_INDEX.LEVEL_UP_MENU_HIGHLIGHT),
    tag,
  ]);
  adminMenuElements.push(buttonText);

  // Store reference for updates
  buttonRefs.push({
    bg: buttonBg,
    text: buttonText,
    updateText,
    upgradeType,
    levelNumber,
  });

  // Click handler
  buttonBg.onClick(() => {
    if (buttonBg.exists() && menuCallbacks) {
      try {
        if (upgradeType) {
          menuCallbacks.onUpgrade(upgradeType);
        } else if (levelNumber !== undefined) {
          menuCallbacks.onLevelChange(levelNumber);
        }
      } catch (error) {
        console.error("Error in admin menu click handler:", error);
      }
    }
  });
}

export function updateAllButtonTexts(state: GameState): void {
  buttonRefs.forEach((ref) => {
    if (ref.text && ref.text.exists()) {
      try {
        // Update button text
        ref.text.text = ref.updateText(state);

        // Update highlight for level buttons
        if (ref.levelNumber !== undefined && ref.bg && ref.bg.exists()) {
          const isCurrentLevel = ref.levelNumber === state.currentLevel;
          const newColor = isCurrentLevel ? [80, 80, 100] : [60, 60, 60];
          // Store k reference when creating buttons for later use
          const kInstance = (ref.bg as any)._kInstance;
          if (kInstance && kInstance.color) {
            ref.bg.color = kInstance.color(
              newColor[0],
              newColor[1],
              newColor[2]
            );
          }
        }
      } catch (error) {
        // Ignore errors for destroyed elements
      }
    }
  });
}

export function hideAdminMenu(
  k: ReturnType<typeof import("kaplay").default>
): void {
  isMenuOpen = false;
  menuCallbacks = null;

  // Clear the tracking array first
  adminMenuElements.forEach((elem) => {
    try {
      if (elem && elem.exists && elem.exists()) {
        elem.destroy();
      }
    } catch (error) {
      // Element might already be destroyed, ignore
    }
  });
  adminMenuElements = [];
  buttonRefs = [];

  // Also get by tag as backup
  try {
    const menuElements = k.get("adminMenu");
    menuElements.forEach((elem) => {
      try {
        if (elem && elem.exists && elem.exists()) {
          elem.destroy();
        }
      } catch (error) {
        // Element might already be destroyed, ignore
      }
    });
  } catch (error) {
    // Menu might not exist, ignore
  }
}
