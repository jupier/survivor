export function setupAOEWeapon(
  k: ReturnType<typeof import("kaplay").default>,
  player: any,
  getState: () => {
    aoeWeaponActive: boolean;
    aoeWeaponCooldown: number;
    targetingZoneRadius: number;
    isPaused: boolean;
  },
  onEnemyHit: (enemy: any) => void,
  onHitAnimation?: () => void
): { update: () => void; triggerAnimation: () => void } {
  let lastHitTime = 0;
  let hitEnemies = new Set<any>();

  const triggerAnimation = () => {
    if (onHitAnimation) {
      onHitAnimation();
    }
  };

  const update = () => {
    const state = getState();
    
    if (!state.aoeWeaponActive || state.isPaused) {
      return;
    }

    const currentTime = k.time();
    
    // Check if cooldown has passed
    if (currentTime - lastHitTime >= state.aoeWeaponCooldown) {
      const enemies = k.get("enemy");
      let hitAny = false;

      // Find all enemies in targeting zone
      for (const enemy of enemies) {
        // Skip if already hit in this cycle
        if (hitEnemies.has(enemy)) {
          continue;
        }

        // Calculate distance from player to enemy
        const dx = enemy.pos.x - player.pos.x;
        const dy = enemy.pos.y - player.pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check if enemy is within targeting zone
        if (distance <= state.targetingZoneRadius) {
          // Hit the enemy
          onEnemyHit(enemy);
          hitEnemies.add(enemy);
          hitAny = true;
        }
      }

      // If we hit any enemies, reset cooldown, trigger animation, and clear hit set
      if (hitAny) {
        lastHitTime = currentTime;
        hitEnemies.clear();
        triggerAnimation();
      }
    }
  };

  return { update, triggerAnimation };
}

