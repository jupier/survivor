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
    k.z(200),
    "levelUpMenu",
  ]);

  // Menu options
  const allOptions = [
    { id: "fireSpeed", text: "Increase Fire Speed" },
    { id: "projectileCount", text: "Increase Projectile Count" },
    { id: "movementSpeed", text: "Increase Movement Speed" },
    { id: "targetingZone", text: "Increase Targeting Range" },
    { id: "slowWeapon", text: "Activate Slow Weapon" },
    { id: "slowEffect", text: "Increase Slow Effect" },
    { id: "aoeWeapon", text: "Activate AOE Weapon" },
    { id: "aoeSpeed", text: "Increase AOE Speed" },
    { id: "increaseHealth", text: "Increase Max Health" },
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
  const baseMenuHeight = 350;
  const optionHeight = 50;
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
    k.z(201),
    "levelUpMenu",
  ]);

  // Title
  k.add([
    k.text("Level Up!", { size: 32 }),
    k.color(255, 255, 255),
    k.pos(k.width() / 2, menuY + 40),
    k.anchor("center"),
    k.fixed(),
    k.z(202),
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
      k.z(202),
      k.area(),
      `option-${option.id}`,
      "levelUpMenu",
    ]);

    // Option text
    k.add([
      k.text(option.text, { size: 20 }),
      k.color(
        isEnabled ? 255 : 150,
        isEnabled ? 255 : 150,
        isEnabled ? 255 : 150
      ),
      k.pos(menuX + menuWidth / 2, optionY + optionHeight / 2),
      k.anchor("center"),
      k.fixed(),
      k.z(203),
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
