import { Z_INDEX } from "./z-index";
import { t } from "./translations";

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

  // Menu background (height fixed for 3 options)
  const menuWidth = 400;
  const baseMenuHeight = 380;
  const optionHeight = 70; // Increased to fit title + description
  const optionSpacing = 10;
  const menuHeight = baseMenuHeight; // Fixed height for 3 options
  const menuX = (k.width() - menuWidth) / 2;
  const menuY = (k.height() - menuHeight) / 2;

  k.add([
    k.rect(menuWidth, menuHeight),
    k.color(50, 50, 50),
    k.pos(menuX, menuY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(Z_INDEX.LEVEL_UP_MENU_CONTENT),
    "levelUpMenu",
  ]);

  // Title
  k.add([
    k.text(t().menus.levelUp.title, { size: 32 }),
    k.color(255, 255, 255),
    k.pos(k.width() / 2, menuY + 40),
    k.anchor("center"),
    k.fixed(),
    k.z(Z_INDEX.LEVEL_UP_MENU_OPTIONS),
    "levelUpMenu",
  ]);

  const startY = menuY + 100;

  options.forEach((option, index) => {
    const optionY = startY + index * (optionHeight + optionSpacing);
    // All options shown are enabled (slowEffect is filtered out if weapon not active)
    const isEnabled = true;

    // Option background
    const optionBg = k.add([
      k.rect(menuWidth - 40, optionHeight),
      k.color(isEnabled ? 60 : 40, isEnabled ? 60 : 40, isEnabled ? 60 : 40),
      k.pos(menuX + 20, optionY),
      k.anchor("topleft"),
      k.fixed(),
      k.z(Z_INDEX.LEVEL_UP_MENU_OPTIONS),
      k.area(),
      `option-${option.id}`,
      "levelUpMenu",
    ]);

    // Option title text
    k.add([
      k.text(option.text, { size: 20 }),
      k.color(
        isEnabled ? 255 : 150,
        isEnabled ? 255 : 150,
        isEnabled ? 255 : 150
      ),
      k.pos(menuX + menuWidth / 2, optionY + 18),
      k.anchor("center"),
      k.fixed(),
      k.z(Z_INDEX.LEVEL_UP_MENU_HIGHLIGHT),
      "levelUpMenu",
    ]);

    // Option description text
    k.add([
      k.text(option.description, { size: 14 }),
      k.color(
        isEnabled ? 180 : 100,
        isEnabled ? 180 : 100,
        isEnabled ? 180 : 100
      ),
      k.pos(menuX + menuWidth / 2, optionY + 42),
      k.anchor("center"),
      k.fixed(),
      k.z(Z_INDEX.LEVEL_UP_MENU_HIGHLIGHT),
      "levelUpMenu",
    ]);

    // Handle click on enabled options
    if (isEnabled) {
      optionBg.onClick(() => {
        onSelect(option.id);
        // Clean up all menu elements using the tag
        const menuElements = k.get("levelUpMenu");
        menuElements.forEach((elem) => elem.destroy());
        onClose();
      });
    }
  });
}
