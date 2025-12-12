export function spawnXP(
  k: ReturnType<typeof import("kaplay").default>,
  position: { x: number; y: number }
): void {
  // Create XP point with gem sprite (scaled down to 75% of original size)
  // No animation for performance
  k.add([
    k.sprite("xp"),
    k.pos(position.x, position.y),
    k.anchor("center"),
    k.area({
      collisionIgnore: ["enemy", "projectile", "xp"],
    }),
    k.scale(0.75, 0.75), // Scale down to 75% (12px instead of 16px)
    "xp",
  ]);
}

export function spawnHealthPoint(
  k: ReturnType<typeof import("kaplay").default>,
  position: { x: number; y: number }
): void {
  // Create health point with heart sprite (scaled down to 75% of original size)
  const healthPoint = k.add([
    k.sprite("health"),
    k.pos(position.x, position.y),
    k.anchor("center"),
    k.area({
      collisionIgnore: ["enemy", "projectile", "xp"],
    }),
    k.scale(0.75, 0.75), // Scale down to 75% (12px instead of 16px)
    "healthPoint",
  ]);

  // Add a pulsing animation (relative to base scale of 0.75)
  healthPoint.onUpdate(() => {
    // Simple pulsing effect
    const baseScale = 0.75;
    const pulseScale = baseScale + Math.sin(k.time() * 5) * 0.15;
    healthPoint.scale = k.vec2(pulseScale, pulseScale);
  });
}
