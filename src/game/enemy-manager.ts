export function spawnEnemy(
  k: ReturnType<typeof import("kaplay").default>,
  player: any,
  enemySpeed: number,
  enemySize: number,
  isStrongEnemy: boolean,
  isEliteEnemy: boolean = false,
  isPaused: () => boolean = () => false
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
  if (isEliteEnemy) {
    enemyHealth = 3;
    enemySpriteName = "enemy-elite";
  } else if (isStrongEnemy) {
    enemyHealth = 2;
    enemySpriteName = "enemy-strong";
  } else {
    enemyHealth = 1;
    enemySpriteName = "enemy-normal";
  }

  // Create enemy with sprite
  const enemy = k.add([
    k.sprite(enemySpriteName),
    k.pos(spawnX, spawnY),
    k.anchor("center"),
    k.area(),
    "enemy",
  ]);

  // Add health tracking to enemy
  (enemy as any).health = enemyHealth;
  (enemy as any).maxHealth = enemyHealth;

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

      const healthPercentage =
        (enemy as any).health / (enemy as any).maxHealth;
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
    });
  }

  // Move enemy towards player
  enemy.onUpdate(() => {
    // Don't update if game is paused
    if (isPaused()) {
      return;
    }

    // Calculate direction to player
    const dx = player.pos.x - enemy.pos.x;
    const dy = player.pos.y - enemy.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Normalize direction and move towards player
    if (distance > 0) {
      const moveX = (dx / distance) * enemySpeed * k.dt();
      const moveY = (dy / distance) * enemySpeed * k.dt();
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
  isPaused: () => boolean
): {
  normalController: any;
  strongController: any;
  eliteController: any;
} {
  // Spawn normal enemies periodically (always active)
  let normalController = k.loop(spawnInterval, () => {
    if (!isPaused()) {
      spawnEnemy(k, player, enemySpeed, enemySize, false, false, isPaused);
    }
  });

  // Spawn strong enemies after 30 seconds
  let strongController: any = null;
  k.wait(30, () => {
    strongController = k.loop(spawnInterval, () => {
      if (!isPaused()) {
        spawnEnemy(k, player, enemySpeed, enemySize, true, false, isPaused); // true = strong enemy (2 HP)
      }
    });
  });

  // Spawn elite enemies after 60 seconds (1 minute)
  let eliteController: any = null;
  k.wait(60, () => {
    eliteController = k.loop(spawnInterval, () => {
      if (!isPaused()) {
        spawnEnemy(k, player, enemySpeed, enemySize, false, true, isPaused); // elite enemy (3 HP)
      }
    });
  });

  return {
    normalController,
    strongController,
    eliteController,
  };
}

