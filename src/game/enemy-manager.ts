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

  // Create collision zone indicator (circle outline) - more discrete
  const collisionRadius = enemySize / 2;
  const collisionZone = k.add([
    k.circle(collisionRadius),
    k.outline(1, k.rgb(200, 100, 100)), // Lighter red outline, 1px width
    k.pos(spawnX, spawnY),
    k.anchor("center"),
    k.z(40), // Below enemy sprite but above background
    k.opacity(0.25), // More discrete - very low opacity
    "enemyCollisionZone",
  ]);

  // Store collision zone reference on enemy for cleanup
  (enemy as any).collisionZone = collisionZone;

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

    // Update health bar position and value
    enemy.onUpdate(() => {
      healthBarBg.pos.x = enemy.pos.x;
      healthBarBg.pos.y = enemy.pos.y + healthBarOffset;
      healthBar.pos.x = enemy.pos.x;
      healthBar.pos.y = enemy.pos.y + healthBarOffset;

      const healthPercentage = (enemy as any).health / (enemy as any).maxHealth;
      healthBar.width = healthBarWidth * healthPercentage;
    });

    // Clean up health bar when enemy is destroyed
    enemy.onDestroy(() => {
      if ((enemy as any).healthBarBg) {
        (enemy as any).healthBarBg.destroy();
      }
      if ((enemy as any).healthBar) {
        (enemy as any).healthBar.destroy();
      }
      // Also clean up collision zone
      if ((enemy as any).collisionZone) {
        (enemy as any).collisionZone.destroy();
      }
    });
  } else {
    // For enemies with 1 HP, still need to clean up collision zone
    enemy.onDestroy(() => {
      if ((enemy as any).collisionZone) {
        (enemy as any).collisionZone.destroy();
      }
    });
  }

  // Move enemy towards player
  enemy.onUpdate(() => {
    // Don't update if game is paused
    if (isPaused()) {
      return;
    }

    // Update collision zone position to follow enemy
    if ((enemy as any).collisionZone) {
      (enemy as any).collisionZone.pos.x = enemy.pos.x;
      (enemy as any).collisionZone.pos.y = enemy.pos.y;
    }

    // Calculate direction to player
    const dx = player.pos.x - enemy.pos.x;
    const dy = player.pos.y - enemy.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if slow weapon is active and enemy is in targeting zone
    let currentSpeed = enemySpeed;
    const slowWeaponState = getSlowWeaponState();
    if (slowWeaponState.active && distance <= slowWeaponState.zoneRadius) {
      // Apply slow effect: reduce speed by percentage
      const speedMultiplier = 1 - slowWeaponState.effectPercentage / 100;
      currentSpeed = enemySpeed * speedMultiplier;
    }

    // Normalize direction and move towards player
    if (distance > 0) {
      const moveX = (dx / distance) * currentSpeed * k.dt();
      const moveY = (dy / distance) * currentSpeed * k.dt();
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
