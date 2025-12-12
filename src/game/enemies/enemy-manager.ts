import { Z_INDEX } from "../assets/z-index";

export type EnemyType =
  | "normal"
  | "strong"
  | "elite"
  | "swarm"
  | "charger"
  | "splitter"
  | "exploder"
  | "boss";

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
  } = () => ({ active: false, effectPercentage: 0, zoneRadius: 0 }),
  position?: { x: number; y: number },
  enemyType?: EnemyType,
  levelMultipliers?: {
    speedMultiplier: number;
    healthMultiplier: number;
  }
): void {
  // Spawn enemy at random position on the map edges
  const side = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
  let spawnX = 0;
  let spawnY = 0;

  if (position) {
    // Use provided position
    spawnX = position.x;
    spawnY = position.y;
  } else {
    // Original random edge spawning logic
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
  }

  // Determine enemy type and properties
  let enemyHealth: number;
  let enemySpriteName: string;
  let actualEnemyType: EnemyType;
  let speedMultiplier = 1;
  let sizeMultiplier = 1;

  // Apply level multipliers if provided
  const speedMultiplierFromLevel = levelMultipliers?.speedMultiplier ?? 1.0;
  const healthMultiplierFromLevel = levelMultipliers?.healthMultiplier ?? 1.0;

  if (enemyType === "boss") {
    // Boss health defaults to 50, but will be overridden by spawnBoss if specified
    enemyHealth = 50; // Default, will be set properly in spawnBoss
    enemySpriteName = "enemy-boss";
    actualEnemyType = "boss";
    sizeMultiplier = 2; // Boss is bigger
    speedMultiplier = 0.7 * speedMultiplierFromLevel; // Boss is slower, but affected by level
  } else if (enemyType === "charger") {
    enemyHealth = 1;
    enemySpriteName = "enemy-charger";
    actualEnemyType = "charger";
    speedMultiplier = 1.5; // Charger is faster (reduced from 1.8)
  } else if (enemyType === "splitter") {
    enemyHealth = 2;
    enemySpriteName = "enemy-splitter";
    actualEnemyType = "splitter";
  } else if (enemyType === "exploder") {
    enemyHealth = 1;
    enemySpriteName = "enemy-exploder";
    actualEnemyType = "exploder";
  } else if (isSwarmEnemy) {
    enemyHealth = Math.round(1 * healthMultiplierFromLevel);
    enemySpriteName = "enemy-swarm";
    actualEnemyType = "swarm";
  } else if (isEliteEnemy) {
    enemyHealth = Math.round(3 * healthMultiplierFromLevel);
    enemySpriteName = "enemy-elite";
    actualEnemyType = "elite";
  } else if (isStrongEnemy) {
    enemyHealth = Math.round(2 * healthMultiplierFromLevel);
    enemySpriteName = "enemy-strong";
    actualEnemyType = "strong";
  } else {
    enemyHealth = Math.round(1 * healthMultiplierFromLevel);
    enemySpriteName = "enemy-normal";
    actualEnemyType = "normal";
  }

  const actualSize = enemySize * sizeMultiplier;
  const actualSpeed = enemySpeed * speedMultiplier * speedMultiplierFromLevel;

  // Create enemy with sprite (scaled down to 75% of original size)
  const enemy = k.add([
    k.sprite(enemySpriteName),
    k.pos(spawnX, spawnY),
    k.anchor("center"),
    k.area({
      collisionIgnore: ["enemy", "xp", "healthPoint"],
    }),
    k.scale(0.75 * sizeMultiplier, 0.75 * sizeMultiplier),
    k.z(Z_INDEX.ENEMIES),
    "enemy",
  ]);

  // Add health tracking and enemy type
  (enemy as any).health = enemyHealth;
  (enemy as any).maxHealth = enemyHealth;
  (enemy as any).enemyType = actualEnemyType;
  (enemy as any).lastSeparationCheck = 0;
  (enemy as any).separationX = 0;
  (enemy as any).separationY = 0;
  (enemy as any).chargeCooldown = 0; // For charger enemy

  // Create health bar for boss enemies
  if (actualEnemyType === "boss") {
    const healthBarWidth = actualSize * 1.5;
    const healthBarHeight = 6;
    const healthBarOffsetY = actualSize + 10;

    // Health bar background
    const healthBarBg = k.add([
      k.rect(healthBarWidth, healthBarHeight),
      k.color(60, 60, 60),
      k.pos(enemy.pos.x, enemy.pos.y - healthBarOffsetY),
      k.anchor("center"),
      k.z(Z_INDEX.BOSS_HEALTH_BAR_BG),
      "bossHealthBar",
    ]);

    // Health bar fill
    const healthBarFill = k.add([
      k.rect(healthBarWidth, healthBarHeight),
      k.color(255, 0, 0), // Red
      k.pos(enemy.pos.x, enemy.pos.y - healthBarOffsetY),
      k.anchor("center"),
      k.z(Z_INDEX.BOSS_HEALTH_BAR_FILL),
      "bossHealthBar",
    ]);

    // Store health bar references on enemy
    (enemy as any).healthBarBg = healthBarBg;
    (enemy as any).healthBarFill = healthBarFill;

    // Update health bar position and width in enemy's update loop
    enemy.onUpdate(() => {
      if ((enemy as any).isDying) {
        healthBarBg.destroy();
        healthBarFill.destroy();
        return;
      }

      const healthPercentage = Math.max(
        0,
        (enemy as any).health / (enemy as any).maxHealth
      );

      // Update position to follow enemy
      healthBarBg.pos.x = enemy.pos.x;
      healthBarBg.pos.y = enemy.pos.y - healthBarOffsetY;
      healthBarFill.pos.x = enemy.pos.x;
      healthBarFill.pos.y = enemy.pos.y - healthBarOffsetY;

      // Update width based on health
      healthBarFill.width = healthBarWidth * healthPercentage;

      // Change color based on health (green -> yellow -> red)
      if (healthPercentage > 0.5) {
        (healthBarFill as any).color = k.color(0, 255, 0); // Green
      } else if (healthPercentage > 0.25) {
        (healthBarFill as any).color = k.color(255, 255, 0); // Yellow
      } else {
        (healthBarFill as any).color = k.color(255, 0, 0); // Red
      }
    });

    // Clean up health bar when enemy is destroyed
    enemy.onDestroy(() => {
      if (healthBarBg.exists()) healthBarBg.destroy();
      if (healthBarFill.exists()) healthBarFill.destroy();
    });
  }

  // Move enemy towards player
  // Cache slow weapon state to avoid calling function every frame
  let cachedSlowWeaponState = getSlowWeaponState();
  let slowWeaponStateUpdateTime = 0;
  const SLOW_WEAPON_STATE_CACHE_DURATION = 0.1; // Update cache every 0.1 seconds

  enemy.onUpdate(() => {
    // Don't update if game is paused or enemy is dying
    if (isPaused() || (enemy as any).isDying) {
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
    let currentSpeed = actualSpeed;
    if (cachedSlowWeaponState.active) {
      const zoneRadiusSquared =
        cachedSlowWeaponState.zoneRadius * cachedSlowWeaponState.zoneRadius;
      if (distanceSquared <= zoneRadiusSquared) {
        // Apply slow effect: reduce speed by percentage
        const slowMultiplier = 1 - cachedSlowWeaponState.effectPercentage / 100;
        currentSpeed = actualSpeed * slowMultiplier;
      }
    }

    // Add separation force to avoid overlapping with other enemies
    // Only check separation periodically to reduce performance impact
    const SEPARATION_CHECK_INTERVAL = 0.2; // Check every 0.2 seconds
    const separationForce = 50; // Force strength
    const separationDistance = actualSize * 1.5; // Minimum distance between enemies
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

  // Special behavior for charger enemy
  if (actualEnemyType === "charger") {
    enemy.onUpdate(() => {
      if (isPaused() || (enemy as any).isDying) return;

      const dx = player.pos.x - enemy.pos.x;
      const dy = player.pos.y - enemy.pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      (enemy as any).chargeCooldown -= k.dt();

      // Charge every 3 seconds if close enough
      if ((enemy as any).chargeCooldown <= 0 && distance < 200) {
        (enemy as any).chargeCooldown = 3;
        // Store charge direction
        if (distance > 0) {
          (enemy as any).chargeDirX = dx / distance;
          (enemy as any).chargeDirY = dy / distance;
          (enemy as any).isCharging = true;
          (enemy as any).chargeDuration = 0.5;
        }
      }

      // Apply charge movement
      if ((enemy as any).isCharging && (enemy as any).chargeDuration > 0) {
        (enemy as any).chargeDuration -= k.dt();
        const chargeSpeed = actualSpeed * 3;
        enemy.pos.x += (enemy as any).chargeDirX * chargeSpeed * k.dt();
        enemy.pos.y += (enemy as any).chargeDirY * chargeSpeed * k.dt();
        if ((enemy as any).chargeDuration <= 0) {
          (enemy as any).isCharging = false;
        }
      }
    });
  }
}

// Add boss spawning function
export function spawnBoss(
  k: ReturnType<typeof import("kaplay").default>,
  player: any,
  enemySpeed: number,
  enemySize: number,
  isPaused: () => boolean,
  getSlowWeaponState: () => {
    active: boolean;
    effectPercentage: number;
    zoneRadius: number;
  },
  bossHealth?: number,
  levelMultipliers?: {
    speedMultiplier: number;
    healthMultiplier: number;
  }
): void {
  // Spawn boss at center of a random edge
  const side = Math.floor(Math.random() * 4);
  let spawnX = 0;
  let spawnY = 0;

  switch (side) {
    case 0: // Top
      spawnX = k.width() / 2;
      spawnY = -enemySize * 2;
      break;
    case 1: // Right
      spawnX = k.width() + enemySize * 2;
      spawnY = k.height() / 2;
      break;
    case 2: // Bottom
      spawnX = k.width() / 2;
      spawnY = k.height() + enemySize * 2;
      break;
    case 3: // Left
      spawnX = -enemySize * 2;
      spawnY = k.height() / 2;
      break;
  }

  spawnEnemy(
    k,
    player,
    enemySpeed,
    enemySize,
    false,
    false,
    false,
    isPaused,
    getSlowWeaponState,
    { x: spawnX, y: spawnY },
    "boss",
    levelMultipliers
  );

  // Override boss health if specified
  if (bossHealth !== undefined) {
    const bossEnemies = k
      .get("enemy")
      .filter((e: any) => (e as any).enemyType === "boss");
    const latestBoss = bossEnemies[bossEnemies.length - 1];
    if (latestBoss) {
      (latestBoss as any).health = bossHealth;
      (latestBoss as any).maxHealth = bossHealth;
      // Update health bar if it exists
      if ((latestBoss as any).healthBarFill) {
        const healthBarWidth = (latestBoss as any).healthBarBg.width;
        const healthPercentage = 1.0;
        (latestBoss as any).healthBarFill.width =
          healthBarWidth * healthPercentage;
      }
    }
  }
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
  } = () => ({ active: false, effectPercentage: 0, zoneRadius: 0 }),
  levelMultipliers?: {
    speedMultiplier: number;
    healthMultiplier: number;
  }
): {
  normalController: any;
  strongController: any;
  eliteController: any;
  swarmController: any;
  chargerController: any;
  splitterController: any;
  exploderController: any;
} {
  // Spawn normal enemies periodically (always active, only normal enemies)
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
        getSlowWeaponState,
        undefined,
        "normal",
        levelMultipliers
      );
    }
  });

  // All other enemy types will be started from the game loop based on game time elapsed
  // (handled in game.ts setupGameLoop to sync with the game timer)
  const strongController: any = null; // Will be set in game loop at 30s elapsed
  const splitterController: any = null; // Will be set in game loop at 60s elapsed
  const exploderController: any = null; // Will be set in game loop at 90s elapsed
  const eliteController: any = null; // Will be set in game loop at 120s elapsed
  const chargerController: any = null; // Will be set in game loop at 150s elapsed
  const swarmController: any = null; // Will be set in game loop at 90s elapsed

  return {
    normalController,
    strongController,
    eliteController,
    swarmController,
    chargerController,
    splitterController,
    exploderController,
  };
}
