export function autoFireAtClosestEnemy(
  k: ReturnType<typeof import("kaplay").default>,
  player: any,
  zoneRadius: number,
  projectileCount: number,
  onEnemyHit: (enemy: any) => void,
  isPaused: () => boolean = () => false,
  onProjectileFire?: () => void
): void {
  // Find all enemies
  const enemies = k.get("enemy");

  if (enemies.length === 0) {
    return; // No enemies to target
  }

  // Calculate distances to all enemies within zone and sort them
  // Use squared distance to avoid sqrt calculations
  const zoneRadiusSquared = zoneRadius * zoneRadius;
  const enemiesInRange: Array<{ enemy: any; distanceSquared: number }> = [];

  for (const enemy of enemies) {
    const dx = enemy.pos.x - player.pos.x;
    const dy = enemy.pos.y - player.pos.y;
    const distanceSquared = dx * dx + dy * dy;

    if (distanceSquared <= zoneRadiusSquared) {
      enemiesInRange.push({ enemy, distanceSquared });
    }
  }

  // Sort enemies by distance (closest first) - only calculate sqrt for sorting
  enemiesInRange.sort((a, b) => a.distanceSquared - b.distanceSquared);

  // Fire projectiles at the X closest enemies (where X is the minimum of projectileCount and enemiesInRange.length)
  // Only fire as many projectiles as there are enemies in range
  const targetsToFire = Math.min(projectileCount, enemiesInRange.length);

  // Play projectile fire sound once per volley (only if firing at least one projectile)
  if (targetsToFire > 0 && onProjectileFire) {
    onProjectileFire();
  }

  for (let i = 0; i < targetsToFire; i++) {
    const target = enemiesInRange[i];
    const dx = target.enemy.pos.x - player.pos.x;
    const dy = target.enemy.pos.y - player.pos.y;
    const distance = Math.sqrt(target.distanceSquared); // Only calculate sqrt when needed

    if (distance > 0) {
      // Normalize direction
      const directionX = dx / distance;
      const directionY = dy / distance;

      // Fire one projectile at this enemy (don't pass sound callback to avoid duplicate sounds)
      fireProjectile(
        k,
        player.pos,
        directionX,
        directionY,
        onEnemyHit,
        isPaused
      );
    }
  }
}

export function fireProjectile(
  k: ReturnType<typeof import("kaplay").default>,
  startPos: { x: number; y: number },
  directionX: number,
  directionY: number,
  onEnemyHit: (enemy: any) => void,
  isPaused: () => boolean = () => false
): void {
  const projectileSpeed = 300; // pixels per second
  const projectileSize = 6; // Scaled down from 8

  // Calculate rotation angle in degrees (Kaplay uses degrees)
  const angle = Math.atan2(directionY, directionX) * (180 / Math.PI);

  // Create projectile with sprite (scaled down to 75% of original size)
  const projectile = k.add([
    k.sprite("projectile"),
    k.pos(startPos.x, startPos.y),
    k.anchor("center"),
    k.area(),
    k.scale(0.75, 0.75), // Scale down to 75% (12px instead of 16px)
    k.rotate(angle), // Rotate projectile to face direction
    "projectile",
  ]);

  // Store direction and track hit enemies
  (projectile as any).directionX = directionX;
  (projectile as any).directionY = directionY;
  (projectile as any).hitEnemies = new Set(); // Track enemies already hit

  // Handle collision with enemies
  projectile.onCollide("enemy", (enemy: any) => {
    // Skip if we've already hit this enemy (prevents multiple hits)
    if ((projectile as any).hitEnemies.has(enemy)) {
      return;
    }

    // Mark this enemy as hit
    (projectile as any).hitEnemies.add(enemy);

    // Call the callback to handle enemy hit
    onEnemyHit(enemy);

    // Destroy projectile on hit (no bounces)
    projectile.destroy();
  });

  // Move projectile in the direction it's traveling
  projectile.onUpdate(() => {
    // Don't update if game is paused
    if (isPaused()) {
      return;
    }

    // Use stored direction
    const currentDirX = (projectile as any).directionX || directionX;
    const currentDirY = (projectile as any).directionY || directionY;

    projectile.pos.x += currentDirX * projectileSpeed * k.dt();
    projectile.pos.y += currentDirY * projectileSpeed * k.dt();

    // Remove projectile when it goes off screen
    // Cache screen dimensions to avoid repeated calls
    const screenWidth = k.width();
    const screenHeight = k.height();
    if (
      projectile.pos.x < -projectileSize ||
      projectile.pos.x > screenWidth + projectileSize ||
      projectile.pos.y < -projectileSize ||
      projectile.pos.y > screenHeight + projectileSize
    ) {
      projectile.destroy();
    }
  });
}

