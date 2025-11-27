export function showLevelUpMenu(
  k: ReturnType<typeof import("kaplay").default>,
  onClose: () => void,
  onSelect: (option: string) => void
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

  // Menu background
  const menuWidth = 400;
  const menuHeight = 350; // Increased for 5 options
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

  // Menu options
  const options = [
    { id: "fireSpeed", text: "Increase Fire Speed" },
    { id: "projectileCount", text: "Increase Projectile Count" },
    { id: "movementSpeed", text: "Increase Movement Speed" },
    { id: "targetingZone", text: "Increase Targeting Range" },
    { id: "projectileBounces", text: "Add Projectile Bounce" },
  ];

  const optionHeight = 50;
  const optionSpacing = 10;
  const startY = menuY + 100;

  options.forEach((option, index) => {
    const optionY = startY + index * (optionHeight + optionSpacing);
    const isEnabled = true; // All options are enabled

    // Option background
    const optionBg = k.add([
      k.rect(menuWidth - 40, optionHeight),
      k.color(
        isEnabled ? 60 : 40,
        isEnabled ? 60 : 40,
        isEnabled ? 60 : 40
      ),
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

