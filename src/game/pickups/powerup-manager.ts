export type PowerUpType = "speed" | "magnet" | "invincibility" | "damage";

import { Z_INDEX } from "../assets/z-index";

export function spawnPowerUp(
  k: ReturnType<typeof import("kaplay").default>,
  position: { x: number; y: number },
  type?: PowerUpType
): void {
  // Prevent power-ups from accumulating forever (performance)
  // Keep only the most recent power-ups, and auto-despawn after a short time.
  const POWER_UP_LIFETIME_SECONDS = 20;

  // Random type if not specified
  const powerUpType =
    type ||
    (["speed", "magnet", "invincibility", "damage"][
      Math.floor(Math.random() * 4)
    ] as PowerUpType);

  const spriteNames: Record<PowerUpType, string> = {
    speed: "powerup-speed",
    magnet: "powerup-magnet",
    invincibility: "powerup-invincibility",
    damage: "powerup-damage",
  };

  const powerUp = k.add([
    k.sprite(spriteNames[powerUpType]),
    k.pos(position.x, position.y),
    k.anchor("center"),
    k.scale(1, 1),
    k.area({
      collisionIgnore: ["enemy", "projectile", "xp"],
    }),
    k.z(Z_INDEX.POWER_UPS),
    "powerUp",
  ]);

  // Store type
  (powerUp as any).powerUpType = powerUpType;

  // Auto-despawn after lifetime expires
  k.wait(POWER_UP_LIFETIME_SECONDS, () => {
    if (powerUp.exists()) {
      powerUp.destroy();
    }
  });
}

export interface PowerUpState {
  speed: { active: boolean; endTime: number };
  magnet: { active: boolean; endTime: number };
  invincibility: { active: boolean; endTime: number };
  damage: { active: boolean; endTime: number };
}

export function createPowerUpState(): PowerUpState {
  return {
    speed: { active: false, endTime: 0 },
    magnet: { active: false, endTime: 0 },
    invincibility: { active: false, endTime: 0 },
    damage: { active: false, endTime: 0 },
  };
}

export function activatePowerUp(
  k: ReturnType<typeof import("kaplay").default>,
  state: PowerUpState,
  type: PowerUpType,
  duration: number
): void {
  const currentTime = k.time();
  state[type].active = true;
  state[type].endTime = currentTime + duration;
}

export function updatePowerUps(
  k: ReturnType<typeof import("kaplay").default>,
  state: PowerUpState
): void {
  const currentTime = k.time();
  for (const key in state) {
    const powerUp = state[key as PowerUpType];
    if (powerUp.active && currentTime >= powerUp.endTime) {
      powerUp.active = false;
    }
  }
}
