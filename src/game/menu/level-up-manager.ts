import { Z_INDEX } from "../assets/z-index";
import { t } from "../translation/translations";

// Helper function to randomly select N items from an array
function randomSelect<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
}

export function showLevelUpMenu(
  k: ReturnType<typeof import("kaplay").default>,
  onClose: () => void,
  onSelect: (option: string) => void,
  isSlowWeaponActive: boolean = false,
  isAOEWeaponActive: boolean = false
): void {
  // Create semi-transparent overlay
  k.add([
    k.rect(k.width(), k.height()),
    k.color(0, 0, 0),
    k.opacity(0.7),
    k.pos(0, 0),
    k.anchor("topleft"),
    k.fixed(),
    k.z(Z_INDEX.LEVEL_UP_MENU_BG),
    "levelUpMenu",
  ]);

  // Menu options with descriptions - use translations
  const allOptions = [
    {
      id: "fireSpeed",
      text: t().menus.levelUp.options.fireSpeed.title,
      description: t().menus.levelUp.options.fireSpeed.description,
    },
    {
      id: "projectileCount",
      text: t().menus.levelUp.options.projectileCount.title,
      description: t().menus.levelUp.options.projectileCount.description,
    },
    {
      id: "movementSpeed",
      text: t().menus.levelUp.options.movementSpeed.title,
      description: t().menus.levelUp.options.movementSpeed.description,
    },
    {
      id: "targetingZone",
      text: t().menus.levelUp.options.targetingZone.title,
      description: t().menus.levelUp.options.targetingZone.description,
    },
    {
      id: "slowWeapon",
      text: t().menus.levelUp.options.slowWeapon.title,
      description: t().menus.levelUp.options.slowWeapon.description,
    },
    {
      id: "slowEffect",
      text: t().menus.levelUp.options.slowEffect.title,
      description: t().menus.levelUp.options.slowEffect.description,
    },
    {
      id: "aoeWeapon",
      text: t().menus.levelUp.options.aoeWeapon.title,
      description: t().menus.levelUp.options.aoeWeapon.description,
    },
    {
      id: "aoeSpeed",
      text: t().menus.levelUp.options.aoeSpeed.title,
      description: t().menus.levelUp.options.aoeSpeed.description,
    },
    {
      id: "increaseHealth",
      text: t().menus.levelUp.options.increaseHealth.title,
      description: t().menus.levelUp.options.increaseHealth.description,
    },
    {
      id: "xpMagnet",
      text: t().menus.levelUp.options.xpMagnet.title,
      description: t().menus.levelUp.options.xpMagnet.description,
    },
  ];

  // Filter out options based on weapon states:
  // - Remove "slowWeapon" if already active
  // - Remove "slowEffect" if slow weapon is not active
  // - Remove "aoeWeapon" if already active
  // - Remove "aoeSpeed" if AOE weapon is not active
  const filteredOptions = allOptions.filter((opt) => {
    if (opt.id === "slowWeapon") {
      return !isSlowWeaponActive; // Only show if not already active
    }
    if (opt.id === "slowEffect") {
      return isSlowWeaponActive; // Only show if slow weapon is active
    }
    if (opt.id === "aoeWeapon") {
      return !isAOEWeaponActive; // Only show if not already active
    }
    if (opt.id === "aoeSpeed") {
      return isAOEWeaponActive; // Only show if AOE weapon is active
    }
    return true; // Show all other options
  });

  // Randomly select 3 options from the filtered list
  const options = randomSelect(filteredOptions, 3);

  // Handle keyboard shortcuts (1, 2, 3) to select options
  // Also support AZERTY keyboard (&, é, ") which produce 1, 2, 3 when shifted
  let isMenuClosed = false; // Flag to prevent multiple selections

  const handleKeyPress = (keyNum: number) => {
    // Prevent multiple selections
    if (isMenuClosed) {
      return;
    }

    if (keyNum >= 1 && keyNum <= 3 && options[keyNum - 1]) {
      isMenuClosed = true; // Set flag immediately to prevent duplicate calls

      // Cancel all key handlers before processing selection
      keyControllers.forEach((controller) => {
        try {
          controller.cancel();
        } catch (e) {
          // Handler might already be cancelled, ignore
        }
      });

      onSelect(options[keyNum - 1].id);
      // Clean up all menu elements using the tag
      const menuElements = k.get("levelUpMenu");
      menuElements.forEach((elem) => elem.destroy());
      onClose();
    }
  };

  // Store event controllers so we can cancel them
  const keyControllers: any[] = [];

  // Subscribe to number key presses (QWERTY and numeric keypad)
  // onKeyPress returns a controller that we can cancel later
  keyControllers.push(k.onKeyPress("1", () => handleKeyPress(1)));
  keyControllers.push(k.onKeyPress("2", () => handleKeyPress(2)));
  keyControllers.push(k.onKeyPress("3", () => handleKeyPress(3)));

  // Subscribe to AZERTY keyboard keys (&, é, ") which produce 1, 2, 3 when shifted
  keyControllers.push(k.onKeyPress("&", () => handleKeyPress(1)));
  keyControllers.push(k.onKeyPress("é", () => handleKeyPress(2)));
  keyControllers.push(k.onKeyPress('"', () => handleKeyPress(3)));

  // Menu dimensions for horizontal layout
  const menuPadding = 40;
  const optionWidth = 220;
  const optionHeight = 280;
  const optionSpacing = 20;
  const totalMenuWidth =
    options.length * optionWidth +
    (options.length - 1) * optionSpacing +
    menuPadding * 2;
  const menuHeight = optionHeight + menuPadding * 2 + 80; // Extra space for title
  const menuX = (k.width() - totalMenuWidth) / 2;
  const menuY = (k.height() - menuHeight) / 2;

  // Menu background
  k.add([
    k.rect(totalMenuWidth, menuHeight),
    k.color(50, 50, 50),
    k.pos(menuX, menuY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(Z_INDEX.LEVEL_UP_MENU_CONTENT),
    "levelUpMenu",
  ]);

  // Title
  k.add([
    k.text(t().menus.levelUp.title, { size: 36 }),
    k.color(255, 255, 255),
    k.pos(k.width() / 2, menuY + 30),
    k.anchor("center"),
    k.fixed(),
    k.z(Z_INDEX.LEVEL_UP_MENU_OPTIONS),
    "levelUpMenu",
  ]);

  const startX = menuX + menuPadding;
  const startY = menuY + 90;

  // Helper function to create upgrade icon with visual representation
  function createUpgradeIcon(optionId: string, x: number, y: number): any {
    const iconSize = 70;
    const iconX = x + optionWidth / 2;
    const iconY = y + 40;

    // Create icon based on upgrade type with distinct colors and shapes
    let iconColor: [number, number, number] = [100, 100, 200];
    let iconElements: any[] = [];

    switch (optionId) {
      case "fireSpeed": {
        // Fire/Speed icon - orange-red with upward arrows
        iconColor = [255, 120, 50];
        const fireBg = k.add([
          k.circle(iconSize / 2),
          k.color(iconColor[0] * 0.2, iconColor[1] * 0.2, iconColor[2] * 0.2),
          k.pos(iconX, iconY),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_OPTIONS),
          "levelUpMenu",
        ]);
        const fireCircle = k.add([
          k.circle(iconSize / 2 - 6),
          k.color(iconColor[0], iconColor[1], iconColor[2]),
          k.pos(iconX, iconY),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_HIGHLIGHT),
          "levelUpMenu",
        ]);
        // Upward arrow symbol using text
        const fireArrow = k.add([
          k.text("⚡", { size: 32 }),
          k.color(255, 255, 200),
          k.pos(iconX, iconY),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_HIGHLIGHT + 1),
          "levelUpMenu",
        ]);
        iconElements = [fireBg, fireCircle, fireArrow];
        break;
      }

      case "projectileCount": {
        // Projectiles icon - blue with bullet shapes
        iconColor = [80, 180, 255];
        const projBg = k.add([
          k.circle(iconSize / 2),
          k.color(iconColor[0] * 0.2, iconColor[1] * 0.2, iconColor[2] * 0.2),
          k.pos(iconX, iconY),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_OPTIONS),
          "levelUpMenu",
        ]);
        const projCircle = k.add([
          k.circle(iconSize / 2 - 6),
          k.color(iconColor[0], iconColor[1], iconColor[2]),
          k.pos(iconX, iconY),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_HIGHLIGHT),
          "levelUpMenu",
        ]);
        const projSymbol = k.add([
          k.text("●", { size: 24 }),
          k.color(255, 255, 255),
          k.pos(iconX - 8, iconY - 5),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_HIGHLIGHT + 1),
          "levelUpMenu",
        ]);
        const projSymbol2 = k.add([
          k.text("●", { size: 20 }),
          k.color(255, 255, 255),
          k.pos(iconX + 8, iconY + 5),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_HIGHLIGHT + 1),
          "levelUpMenu",
        ]);
        iconElements = [projBg, projCircle, projSymbol, projSymbol2];
        break;
      }

      case "movementSpeed": {
        // Speed icon - green with running symbol
        iconColor = [80, 255, 120];
        const speedBg = k.add([
          k.circle(iconSize / 2),
          k.color(iconColor[0] * 0.2, iconColor[1] * 0.2, iconColor[2] * 0.2),
          k.pos(iconX, iconY),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_OPTIONS),
          "levelUpMenu",
        ]);
        const speedCircle = k.add([
          k.circle(iconSize / 2 - 6),
          k.color(iconColor[0], iconColor[1], iconColor[2]),
          k.pos(iconX, iconY),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_HIGHLIGHT),
          "levelUpMenu",
        ]);
        const speedSymbol = k.add([
          k.text("▶", { size: 28 }),
          k.color(255, 255, 255),
          k.pos(iconX, iconY),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_HIGHLIGHT + 1),
          "levelUpMenu",
        ]);
        iconElements = [speedBg, speedCircle, speedSymbol];
        break;
      }

      case "targetingZone": {
        // Range icon - yellow with crosshair
        iconColor = [255, 220, 80];
        const rangeBg = k.add([
          k.circle(iconSize / 2),
          k.color(iconColor[0] * 0.2, iconColor[1] * 0.2, iconColor[2] * 0.2),
          k.pos(iconX, iconY),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_OPTIONS),
          "levelUpMenu",
        ]);
        const rangeCircle = k.add([
          k.circle(iconSize / 2 - 6),
          k.color(iconColor[0], iconColor[1], iconColor[2]),
          k.pos(iconX, iconY),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_HIGHLIGHT),
          "levelUpMenu",
        ]);
        const rangeSymbol = k.add([
          k.text("⊕", { size: 32 }),
          k.color(255, 255, 255),
          k.pos(iconX, iconY),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_HIGHLIGHT + 1),
          "levelUpMenu",
        ]);
        iconElements = [rangeBg, rangeCircle, rangeSymbol];
        break;
      }

      case "slowWeapon": {
        // Slow weapon icon - blue with snowflake
        iconColor = [100, 150, 255];
        const slowBg = k.add([
          k.circle(iconSize / 2),
          k.color(iconColor[0] * 0.2, iconColor[1] * 0.2, iconColor[2] * 0.2),
          k.pos(iconX, iconY),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_OPTIONS),
          "levelUpMenu",
        ]);
        const slowCircle = k.add([
          k.circle(iconSize / 2 - 6),
          k.color(iconColor[0], iconColor[1], iconColor[2]),
          k.pos(iconX, iconY),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_HIGHLIGHT),
          "levelUpMenu",
        ]);
        const slowSymbol = k.add([
          k.text("❄", { size: 28 }),
          k.color(255, 255, 255),
          k.pos(iconX, iconY),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_HIGHLIGHT + 1),
          "levelUpMenu",
        ]);
        iconElements = [slowBg, slowCircle, slowSymbol];
        break;
      }

      case "slowEffect": {
        // Slow effect icon - light blue
        iconColor = [150, 180, 255];
        const slowEffBg = k.add([
          k.circle(iconSize / 2),
          k.color(iconColor[0] * 0.2, iconColor[1] * 0.2, iconColor[2] * 0.2),
          k.pos(iconX, iconY),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_OPTIONS),
          "levelUpMenu",
        ]);
        const slowEffCircle = k.add([
          k.circle(iconSize / 2 - 6),
          k.color(iconColor[0], iconColor[1], iconColor[2]),
          k.pos(iconX, iconY),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_HIGHLIGHT),
          "levelUpMenu",
        ]);
        const slowEffSymbol = k.add([
          k.text("+", { size: 36 }),
          k.color(255, 255, 255),
          k.pos(iconX, iconY),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_HIGHLIGHT + 1),
          "levelUpMenu",
        ]);
        iconElements = [slowEffBg, slowEffCircle, slowEffSymbol];
        break;
      }

      case "aoeWeapon": {
        // AOE icon - orange with explosion
        iconColor = [255, 150, 50];
        const aoeBg = k.add([
          k.circle(iconSize / 2),
          k.color(iconColor[0] * 0.2, iconColor[1] * 0.2, iconColor[2] * 0.2),
          k.pos(iconX, iconY),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_OPTIONS),
          "levelUpMenu",
        ]);
        const aoeCircle = k.add([
          k.circle(iconSize / 2 - 6),
          k.color(iconColor[0], iconColor[1], iconColor[2]),
          k.pos(iconX, iconY),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_HIGHLIGHT),
          "levelUpMenu",
        ]);
        const aoeSymbol = k.add([
          k.text("★", { size: 32 }),
          k.color(255, 255, 200),
          k.pos(iconX, iconY),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_HIGHLIGHT + 1),
          "levelUpMenu",
        ]);
        iconElements = [aoeBg, aoeCircle, aoeSymbol];
        break;
      }

      case "aoeSpeed": {
        // AOE speed icon - light orange
        iconColor = [255, 180, 80];
        const aoeSpeedBg = k.add([
          k.circle(iconSize / 2),
          k.color(iconColor[0] * 0.2, iconColor[1] * 0.2, iconColor[2] * 0.2),
          k.pos(iconX, iconY),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_OPTIONS),
          "levelUpMenu",
        ]);
        const aoeSpeedCircle = k.add([
          k.circle(iconSize / 2 - 6),
          k.color(iconColor[0], iconColor[1], iconColor[2]),
          k.pos(iconX, iconY),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_HIGHLIGHT),
          "levelUpMenu",
        ]);
        const aoeSpeedSymbol = k.add([
          k.text("+", { size: 36 }),
          k.color(255, 255, 255),
          k.pos(iconX, iconY),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_HIGHLIGHT + 1),
          "levelUpMenu",
        ]);
        iconElements = [aoeSpeedBg, aoeSpeedCircle, aoeSpeedSymbol];
        break;
      }

      case "increaseHealth": {
        // Health icon - red with heart
        iconColor = [255, 100, 100];
        const healthBg = k.add([
          k.circle(iconSize / 2),
          k.color(iconColor[0] * 0.2, iconColor[1] * 0.2, iconColor[2] * 0.2),
          k.pos(iconX, iconY),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_OPTIONS),
          "levelUpMenu",
        ]);
        const healthCircle = k.add([
          k.circle(iconSize / 2 - 6),
          k.color(iconColor[0], iconColor[1], iconColor[2]),
          k.pos(iconX, iconY),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_HIGHLIGHT),
          "levelUpMenu",
        ]);
        const healthSymbol = k.add([
          k.text("♥", { size: 32 }),
          k.color(255, 255, 255),
          k.pos(iconX, iconY),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_HIGHLIGHT + 1),
          "levelUpMenu",
        ]);
        iconElements = [healthBg, healthCircle, healthSymbol];
        break;
      }

      case "xpMagnet": {
        // XP attract icon - magenta
        iconColor = [255, 0, 255];
        const magnetBg = k.add([
          k.circle(iconSize / 2),
          k.color(iconColor[0] * 0.2, iconColor[1] * 0.2, iconColor[2] * 0.2),
          k.pos(iconX, iconY),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_OPTIONS),
          "levelUpMenu",
        ]);
        const magnetCircle = k.add([
          k.circle(iconSize / 2 - 6),
          k.color(iconColor[0], iconColor[1], iconColor[2]),
          k.pos(iconX, iconY),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_HIGHLIGHT),
          "levelUpMenu",
        ]);
        const magnetSymbol = k.add([
          k.text("U", { size: 28 }),
          k.color(255, 255, 255),
          k.pos(iconX, iconY),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_HIGHLIGHT + 1),
          "levelUpMenu",
        ]);
        iconElements = [magnetBg, magnetCircle, magnetSymbol];
        break;
      }

      default: {
        // Default icon
        const defaultBg = k.add([
          k.circle(iconSize / 2),
          k.color(100, 100, 100),
          k.pos(iconX, iconY),
          k.anchor("center"),
          k.fixed(),
          k.z(Z_INDEX.LEVEL_UP_MENU_OPTIONS),
          "levelUpMenu",
        ]);
        iconElements = [defaultBg];
        break;
      }
    }

    // Add pulsing animation to the main shape (usually the circle)
    if (iconElements.length > 1) {
      const mainShape = iconElements[1]; // Usually the colored circle
      mainShape.onUpdate(() => {
        const pulse = 1 + Math.sin(k.time() * 4) * 0.08;
        mainShape.scale = k.vec2(pulse, pulse);
      });
    }

    return iconElements;
  }

  options.forEach((option, index) => {
    const optionX = startX + index * (optionWidth + optionSpacing);
    const isEnabled = true;

    // Option card background
    k.add([
      k.rect(optionWidth, optionHeight),
      k.color(isEnabled ? 70 : 40, isEnabled ? 70 : 40, isEnabled ? 70 : 40),
      k.pos(optionX, startY),
      k.anchor("topleft"),
      k.fixed(),
      k.z(Z_INDEX.LEVEL_UP_MENU_OPTIONS),
      k.area(),
      `option-${option.id}`,
      "levelUpMenu",
    ]);

    // Create visual icon
    createUpgradeIcon(option.id, optionX, startY);

    // Option title text (below icon) - split into multiple lines if needed
    const titleY = startY + 130;
    const titleMaxLineLength = 20; // Characters per line for title
    const titleLines: string[] = [];
    const titleWords = option.text.split(" ");
    let currentTitleLine = "";

    titleWords.forEach((word) => {
      if ((currentTitleLine + " " + word).length <= titleMaxLineLength) {
        currentTitleLine = currentTitleLine
          ? currentTitleLine + " " + word
          : word;
      } else {
        if (currentTitleLine) titleLines.push(currentTitleLine);
        currentTitleLine = word;
      }
    });
    if (currentTitleLine) titleLines.push(currentTitleLine);

    // Display title lines - centered
    titleLines.forEach((line, lineIndex) => {
      k.add([
        k.text(line, { size: 16 }),
        k.color(
          isEnabled ? 255 : 150,
          isEnabled ? 255 : 150,
          isEnabled ? 255 : 150
        ),
        k.pos(optionX + optionWidth / 2, titleY + lineIndex * 18), // Line spacing for title
        k.anchor("center"),
        k.fixed(),
        k.z(Z_INDEX.LEVEL_UP_MENU_HIGHLIGHT),
        "levelUpMenu",
      ]);
    });

    // Calculate title height based on actual number of lines
    const titleHeight = titleLines.length * 18; // Line height for title

    // Option description text (below title)
    // Split description into multiple lines if needed
    // Position description below title with proper spacing to avoid overlap
    const descriptionSpacing = 8; // Space between title and description
    const descriptionY = titleY + titleHeight + descriptionSpacing;
    const maxLineLength = 22; // Reduced to ensure text fits within card
    const descriptionLines: string[] = [];
    const words = option.description.split(" ");
    let currentLine = "";

    words.forEach((word) => {
      if ((currentLine + " " + word).length <= maxLineLength) {
        currentLine = currentLine ? currentLine + " " + word : word;
      } else {
        if (currentLine) descriptionLines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) descriptionLines.push(currentLine);

    // Limit to 3 lines max to prevent overflow
    const maxLines = 3;
    const displayLines = descriptionLines.slice(0, maxLines);
    if (descriptionLines.length > maxLines) {
      // Truncate last line if needed
      const lastLine = displayLines[maxLines - 1];
      if (lastLine.length > maxLineLength - 3) {
        displayLines[maxLines - 1] =
          lastLine.substring(0, maxLineLength - 3) + "...";
      }
    }

    // Display description lines - centered
    displayLines.forEach((line, lineIndex) => {
      k.add([
        k.text(line, { size: 11 }), // Slightly smaller
        k.color(
          isEnabled ? 200 : 100,
          isEnabled ? 200 : 100,
          isEnabled ? 200 : 100
        ),
        k.pos(optionX + optionWidth / 2, descriptionY + lineIndex * 15), // Tighter line spacing, centered
        k.anchor("center"),
        k.fixed(),
        k.z(Z_INDEX.LEVEL_UP_MENU_HIGHLIGHT),
        "levelUpMenu",
      ]);
    });

    // Display key number at the bottom of each card
    const keyNumber = index + 1;
    const keyY = startY + optionHeight - 25;
    k.add([
      k.text(`${keyNumber}`, { size: 20 }),
      k.color(180, 180, 200), // Light gray color
      k.pos(optionX + optionWidth / 2, keyY),
      k.anchor("center"),
      k.fixed(),
      k.z(Z_INDEX.LEVEL_UP_MENU_HIGHLIGHT),
      "levelUpMenu",
    ]);
  });

  // Add instruction text at the bottom of the menu
  const instructionY = startY + optionHeight + 30;
  k.add([
    k.text('Press 1/2/3 or &/é/"', { size: 16 }),
    k.color(200, 200, 200),
    k.pos(k.width() / 2, instructionY),
    k.anchor("center"),
    k.fixed(),
    k.z(Z_INDEX.LEVEL_UP_MENU_HIGHLIGHT),
    "levelUpMenu",
  ]);
}
