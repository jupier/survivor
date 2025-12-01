export function spawnEnemy(
  k: ReturnType<typeof import("kaplay").default>,
  player: any,
  enemySpeed: number,
  enemySize: number,
  isStrongEnemy: boolean,
  isEliteEnemy: boolean = false,
  isSwarmEnemy: boolean = false,
  isPaused: () => boolean = () => false,
  getSlowWeaponState: () => {
    active: boolean;
    effectPercentage: number;
    zoneRadius: number;
  } = () => ({ active: false, effectPercentage: 0, zoneRadius: 0 })
): void {
  // Spawn enemy at random position on the map edges
  const side = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
  let spawnX = 0;
  let spawnY = 0;

  switch (side) {
    case 0: // Top
      spawnX = Math.random() * k.width();
      spawnY = -enemySize;
      break;
    case 1: // Right
      spawnX = k.width() + enemySize;
      spawnY = Math.random() * k.height();
      break;
    case 2: // Bottom
      spawnX = Math.random() * k.width();
      spawnY = k.height() + enemySize;
      break;
    case 3: // Left
      spawnX = -enemySize;
      spawnY = Math.random() * k.height();
      break;
  }

  // Enemy type is determined by the parameters
  let enemyHealth: number;
  let enemySpriteName: string;
  if (isSwarmEnemy) {
    enemyHealth = 1;
    enemySpriteName = "enemy-swarm";
  } else if (isEliteEnemy) {
    enemyHealth = 3;
    enemySpriteName = "enemy-elite";
  } else if (isStrongEnemy) {
    enemyHealth = 2;
    enemySpriteName = "enemy-strong";
  } else {
    enemyHealth = 1;
    enemySpriteName = "enemy-normal";
  }

  // Create enemy with sprite (scaled down to 75% of original size)
  const enemy = k.add([
    k.sprite(enemySpriteName),
    k.pos(spawnX, spawnY),
    k.anchor("center"),
    k.area(),
    k.scale(0.75, 0.75), // Scale down to 75% (24px instead of 32px)
    k.z(45), // Ensure enemies are above background but below player
    "enemy",
  ]);

  // Add health tracking to enemy
  (enemy as any).health = enemyHealth;
  (enemy as any).maxHealth = enemyHealth;
  (enemy as any).lastSeparationCheck = 0;
  (enemy as any).separationX = 0;
  (enemy as any).separationY = 0;

  // Add health bar for enemies with more than 1 HP (strong and elite)
  if (enemyHealth > 1) {
    const healthBarWidth = enemySize + 4;
    const healthBarHeight = 3;
    const healthBarOffset = -enemySize / 2 - 8;

    // Health bar background
    const healthBarBg = k.add([
      k.rect(healthBarWidth, healthBarHeight),
      k.color(60, 60, 60),
      k.pos(spawnX, spawnY + healthBarOffset),
      k.anchor("center"),
      k.z(60),
    ]);

    // Health bar fill (green)
    const healthBar = k.add([
      k.rect(healthBarWidth, healthBarHeight),
      k.color(0, 255, 0), // Green color
      k.pos(spawnX, spawnY + healthBarOffset),
      k.anchor("center"),
      k.z(61),
    ]);

    // Store health bar references on enemy
    (enemy as any).healthBarBg = healthBarBg;
    (enemy as any).healthBar = healthBar;
    (enemy as any).healthBarWidth = healthBarWidth;
    (enemy as any).healthBarOffset = healthBarOffset;

    // Update health bar position and value (only when health changes or position updates)
    // Use a separate update loop with throttling for health bars
    let lastHealth = enemyHealth;

    let lastHealthBarUpdate = 0;
    const HEALTH_BAR_UPDATE_INTERVAL = 0.05; // Update health bars every 0.05 seconds

    enemy.onUpdate(() => {
      const currentTime = k.time();
      const currentHealth = (enemy as any).health;
      const currentX = enemy.pos.x;
      const currentY = enemy.pos.y;

      // Only update health bar if health changed or enough time has passed
      const healthChanged = currentHealth !== lastHealth;
      const timeElapsed =
        currentTime - lastHealthBarUpdate >= HEALTH_BAR_UPDATE_INTERVAL;

      if (healthChanged || timeElapsed) {
        // Update position
        healthBarBg.pos.x = currentX;
        healthBarBg.pos.y = currentY + healthBarOffset;
        healthBar.pos.x = currentX;
        healthBar.pos.y = currentY + healthBarOffset;

        // Update width only if health changed
        if (healthChanged) {
          const healthPercentage = currentHealth / (enemy as any).maxHealth;
          healthBar.width = healthBarWidth * healthPercentage;
          lastHealth = currentHealth;
        }

        lastHealthBarUpdate = currentTime;
      }
    });

    // Clean up health bar when enemy is destroyed
    enemy.onDestroy(() => {
      if ((enemy as any).healthBarBg) {
        (enemy as any).healthBarBg.destroy();
      }
      if ((enemy as any).healthBar) {
        (enemy as any).healthBar.destroy();
      }
    });
  }

  // Move enemy towards player
  // Cache slow weapon state to avoid calling function every frame
  let cachedSlowWeaponState = getSlowWeaponState();
  let slowWeaponStateUpdateTime = 0;
  const SLOW_WEAPON_STATE_CACHE_DURATION = 0.1; // Update cache every 0.1 seconds

  enemy.onUpdate(() => {
    // Don't update if game is paused
    if (isPaused()) {
      return;
    }

    // Calculate direction to player (use squared distance to avoid sqrt)
    const dx = player.pos.x - enemy.pos.x;
    const dy = player.pos.y - enemy.pos.y;
    const distanceSquared = dx * dx + dy * dy;
    const distance = Math.sqrt(distanceSquared);

    // Update slow weapon state cache periodically (not every frame)
    const currentTime = k.time();
    if (
      currentTime - slowWeaponStateUpdateTime >=
      SLOW_WEAPON_STATE_CACHE_DURATION
    ) {
      cachedSlowWeaponState = getSlowWeaponState();
      slowWeaponStateUpdateTime = currentTime;
    }

    // Check if slow weapon is active and enemy is in targeting zone
    let currentSpeed = enemySpeed;
    if (cachedSlowWeaponState.active) {
      const zoneRadiusSquared =
        cachedSlowWeaponState.zoneRadius * cachedSlowWeaponState.zoneRadius;
      if (distanceSquared <= zoneRadiusSquared) {
        // Apply slow effect: reduce speed by percentage
        const speedMultiplier =
          1 - cachedSlowWeaponState.effectPercentage / 100;
        currentSpeed = enemySpeed * speedMultiplier;
      }
    }

    // Add separation force to avoid overlapping with other enemies
    // Only check separation periodically to reduce performance impact
    const SEPARATION_CHECK_INTERVAL = 0.1; // Check every 0.1 seconds
    const separationForce = 30; // Force strength
    const separationDistance = enemySize * 1.5; // Minimum distance between enemies
    const separationDistanceSquared = separationDistance * separationDistance;

    if (
      currentTime - (enemy as any).lastSeparationCheck >=
      SEPARATION_CHECK_INTERVAL
    ) {
      let separationX = 0;
      let separationY = 0;
      const allEnemies = k.get("enemy");
      let nearbyCount = 0;

      // Only check nearby enemies (within separation distance * 2 for efficiency)
      const checkRadiusSquared = separationDistanceSquared * 4;

      for (const otherEnemy of allEnemies) {
        if (otherEnemy === enemy) continue;

        const otherDx = enemy.pos.x - otherEnemy.pos.x;
        const otherDy = enemy.pos.y - otherEnemy.pos.y;
        const otherDistanceSquared = otherDx * otherDx + otherDy * otherDy;

        // Only process if within check radius
        if (
          otherDistanceSquared < checkRadiusSquared &&
          otherDistanceSquared > 0
        ) {
          if (otherDistanceSquared < separationDistanceSquared) {
            const otherDistance = Math.sqrt(otherDistanceSquared);
            const invOtherDistance = 1 / otherDistance;
            // Push away from nearby enemy
            separationX += otherDx * invOtherDistance;
            separationY += otherDy * invOtherDistance;
            nearbyCount++;
          }
        }
      }

      // Normalize separation force if there are nearby enemies
      if (nearbyCount > 0) {
        const separationLength = Math.sqrt(
          separationX * separationX + separationY * separationY
        );
        if (separationLength > 0) {
          const invSeparationLength = 1 / separationLength;
          (enemy as any).separationX =
            separationX * invSeparationLength * separationForce;
          (enemy as any).separationY =
            separationY * invSeparationLength * separationForce;
        } else {
          (enemy as any).separationX = 0;
          (enemy as any).separationY = 0;
        }
      } else {
        (enemy as any).separationX = 0;
        (enemy as any).separationY = 0;
      }

      (enemy as any).lastSeparationCheck = currentTime;
    }

    // Apply stored separation force
    const separationX = (enemy as any).separationX;
    const separationY = (enemy as any).separationY;

    // Normalize direction and move towards player
    // Only calculate sqrt once and reuse for both movement and normalization
    if (distance > 0) {
      const invDistance = 1 / distance; // Inverse distance for normalization
      let moveX = dx * invDistance * currentSpeed * k.dt();
      let moveY = dy * invDistance * currentSpeed * k.dt();

      // Apply separation force (reduces movement towards player when enemies are close)
      moveX += separationX * k.dt();
      moveY += separationY * k.dt();

      enemy.pos.x += moveX;
      enemy.pos.y += moveY;
    }
  });
}

export function setupEnemySpawning(
  k: ReturnType<typeof import("kaplay").default>,
  player: any,
  enemySpeed: number,
  enemySize: number,
  spawnInterval: number,
  isPaused: () => boolean,
  getSlowWeaponState: () => {
    active: boolean;
    effectPercentage: number;
    zoneRadius: number;
  } = () => ({ active: false, effectPercentage: 0, zoneRadius: 0 })
): {
  normalController: any;
  strongController: any;
  eliteController: any;
  swarmController: any;
} {
  // Spawn normal enemies periodically (always active)
  let normalController = k.loop(spawnInterval, () => {
    if (!isPaused()) {
      spawnEnemy(
        k,
        player,
        enemySpeed,
        enemySize,
        false,
        false,
        false,
        isPaused,
        getSlowWeaponState
      );
    }
  });

  // Spawn strong enemies after 30 seconds
  let strongController: any = null;
  k.wait(30, () => {
    strongController = k.loop(spawnInterval, () => {
      if (!isPaused()) {
        spawnEnemy(
          k,
          player,
          enemySpeed,
          enemySize,
          true,
          false,
          false,
          isPaused,
          getSlowWeaponState
        ); // true = strong enemy (2 HP)
      }
    });
  });

  // Spawn elite enemies after 60 seconds (1 minute)
  let eliteController: any = null;
  k.wait(60, () => {
    eliteController = k.loop(spawnInterval, () => {
      if (!isPaused()) {
        spawnEnemy(
          k,
          player,
          enemySpeed,
          enemySize,
          false,
          true,
          false,
          isPaused,
          getSlowWeaponState
        ); // elite enemy (3 HP)
      }
    });
  });

  // Swarm enemies will be started from the game loop based on game time elapsed
  // (handled in game.ts setupGameLoop)
  const swarmController: any = null; // Will be set in game loop

  return {
    normalController,
    strongController,
    eliteController,
    swarmController,
  };
}
