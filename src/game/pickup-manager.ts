export function spawnXP(
  k: ReturnType<typeof import("kaplay").default>,
  position: { x: number; y: number }
): void {
  // Create XP point with gem sprite
  const xp = k.add([
    k.sprite("xp"),
    k.pos(position.x, position.y),
    k.anchor("center"),
    k.area(),
    k.scale(),
    "xp",
  ]);

  // Add a pulsing animation
  xp.onUpdate(() => {
    // Simple pulsing effect
    const scale = 1 + Math.sin(k.time() * 5) * 0.2;
    xp.scale = k.vec2(scale, scale);
  });
}

export function spawnHealthPoint(
  k: ReturnType<typeof import("kaplay").default>,
  position: { x: number; y: number }
): void {
  // Create health point with heart sprite
  const healthPoint = k.add([
    k.sprite("health"),
    k.pos(position.x, position.y),
    k.anchor("center"),
    k.area(),
    k.scale(),
    "healthPoint",
  ]);

  // Add a pulsing animation
  healthPoint.onUpdate(() => {
    // Simple pulsing effect
    const scale = 1 + Math.sin(k.time() * 5) * 0.2;
    healthPoint.scale = k.vec2(scale, scale);
  });
}

