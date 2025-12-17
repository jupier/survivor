import { GAME_CONFIG } from "../core/level-config";

export function spawnXP(
  k: ReturnType<typeof import("kaplay").default>,
  position: { x: number; y: number }
): void {
  // Create XP point with gem sprite (scaled down to 75% of original size)
  const xp = k.add([
    k.sprite("xp"),
    k.pos(position.x, position.y),
    k.anchor("center"),
    k.area({
      collisionIgnore: [
        "enemy",
        "projectile",
        "xp",
        "targetingZone",
        "targetingZoneOverlay",
        "aoeZoneOverlay",
      ],
    }),
    k.offscreen({ destroy: true }),
    k.scale(0.75, 0.75), // Scale down to 75% (12px instead of 16px)
    "xp",
  ]);

  k.wait(GAME_CONFIG.XP_LIFETIME_SECONDS, () => {
    if (xp.exists()) {
      xp.destroy();
    }
  });
}

export function spawnHealthPoint(
  k: ReturnType<typeof import("kaplay").default>,
  position: { x: number; y: number }
): void {
  // Prevent health points from accumulating forever (performance)
  // Keep only the most recent health points, and auto-despawn after a short time.
  const HEALTH_POINT_LIFETIME_SECONDS =
    GAME_CONFIG.HEALTH_POINT_LIFETIME_SECONDS;

  // Create health point with heart sprite (scaled down to 75% of original size)
  const healthPoint = k.add([
    k.sprite("health"),
    k.pos(position.x, position.y),
    k.anchor("center"),
    k.area({
      collisionIgnore: [
        "enemy",
        "projectile",
        "xp",
        "targetingZone",
        "targetingZoneOverlay",
        "aoeZoneOverlay",
      ],
    }),
    k.offscreen({ destroy: true }),
    k.scale(0.75, 0.75), // Scale down to 75% (12px instead of 16px)
    "healthPoint",
  ]);

  // Auto-despawn after lifetime expires
  k.wait(HEALTH_POINT_LIFETIME_SECONDS, () => {
    if (healthPoint.exists()) {
      healthPoint.destroy();
    }
  });
}
