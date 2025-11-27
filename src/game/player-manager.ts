export function createPlayer(k: ReturnType<typeof import("kaplay").default>): {
  player: any;
  collisionZone: any;
} {
  const player = k.add([
    k.sprite("player"),
    k.pos(k.width() / 2, k.height() / 2),
    k.anchor("center"),
    k.area(),
    k.opacity(1),
    k.scale(0.75, 0.75), // Scale down to 75% (24px instead of 32px)
    k.timer(),
    "player",
  ]);

  // Start with idle animation facing down
  player.play("idle-down");

  // Create collision zone indicator for player (circle outline)
  const playerSize = 24; // Approximate player sprite size (scaled down from 32)
  const collisionRadius = playerSize / 2;
  const collisionZone = k.add([
    k.circle(collisionRadius),
    k.outline(1, k.rgb(100, 150, 255)), // Blue outline, 1px width
    k.pos(k.width() / 2, k.height() / 2),
    k.anchor("center"),
    k.z(40), // Below player sprite but above background
    k.opacity(0.25), // Discrete - low opacity
    "playerCollisionZone",
  ]);

  // Update collision zone position to follow player
  player.onUpdate(() => {
    collisionZone.pos.x = player.pos.x;
    collisionZone.pos.y = player.pos.y;
  });

  return { player, collisionZone };
}

export function setupPlayerMovement(
  k: ReturnType<typeof import("kaplay").default>,
  player: any,
  speed: number,
  isPaused: () => boolean
): void {
  // Track current direction and movement state
  let currentDirection: "up" | "down" | "left" | "right" = "down";
  let isMoving = false;

  k.onUpdate(() => {
    // Skip updates if game is paused
    if (isPaused()) {
      return;
    }

    const moveSpeed = speed * k.dt();
    let moveX = 0;
    let moveY = 0;

    // Check for vertical movement (z/s or arrow up/down)
    const upPressed = k.isKeyDown("z") || k.isKeyDown("up");
    const downPressed = k.isKeyDown("s") || k.isKeyDown("down");
    // Check for horizontal movement (q/d or arrow left/right)
    const leftPressed = k.isKeyDown("q") || k.isKeyDown("left");
    const rightPressed = k.isKeyDown("d") || k.isKeyDown("right");

    // Allow diagonal movement - combine both axes
    if (upPressed) {
      moveY -= 1;
    }
    if (downPressed) {
      moveY += 1;
    }
    if (leftPressed) {
      moveX -= 1;
    }
    if (rightPressed) {
      moveX += 1;
    }

    // Normalize movement vector to maintain consistent speed in all directions
    if (moveX !== 0 || moveY !== 0) {
      const length = Math.sqrt(moveX * moveX + moveY * moveY);
      // Normalize to unit vector, then scale by moveSpeed
      moveX = (moveX / length) * moveSpeed;
      moveY = (moveY / length) * moveSpeed;
    }

    // Determine direction based on movement (prioritize vertical, then horizontal)
    let newDirection: "up" | "down" | "left" | "right" = currentDirection;
    if (Math.abs(moveY) > Math.abs(moveX)) {
      // Vertical movement is dominant
      if (moveY < 0) {
        newDirection = "up";
      } else if (moveY > 0) {
        newDirection = "down";
      }
    } else {
      // Horizontal movement is dominant or equal
      if (moveX < 0) {
        newDirection = "left";
      } else if (moveX > 0) {
        newDirection = "right";
      }
    }

    const wasMoving = isMoving;
    isMoving = moveX !== 0 || moveY !== 0;

    // Update animation based on direction and movement state
    if (newDirection !== currentDirection || (isMoving && !wasMoving)) {
      currentDirection = newDirection;
      if (isMoving) {
        player.play(`walk-${currentDirection}`);
      } else {
        player.play(`idle-${currentDirection}`);
      }
    } else if (!isMoving && wasMoving) {
      player.play(`idle-${currentDirection}`);
    }

    if (isMoving) {
      player.pos.x += moveX;
      player.pos.y += moveY;
    }
  });
}

export function setupPlayerCollisions(
  k: ReturnType<typeof import("kaplay").default>,
  player: any,
  state: {
    playerHealth: number;
    maxHealth: number;
    playerExperience: number;
    maxExperience: number;
    playerLevel: number;
    enemiesKilled: number;
    isPaused: boolean;
  },
  callbacks: {
    onHealthChange: (newHealth: number) => void;
    onExperienceGain: () => void;
    onLevelUp: () => void;
    onEnemyKilled: () => void;
    onDeath: () => void;
  }
): void {
  let isInvulnerable = false; // Prevent multiple hits in quick succession

  // Handle player collision with enemies
  player.onCollide("enemy", (enemy: any) => {
    if (state.isPaused || isInvulnerable) {
      return;
    }

    state.playerHealth -= 1;
    callbacks.onHealthChange(state.playerHealth);
    enemy.destroy(); // Destroy enemy on contact

    // Hit animation: flash opacity and scale shake
    isInvulnerable = true;
    const originalOpacity = player.opacity ?? 1;
    const originalScale = player.scale ?? k.vec2(1, 1);

    // Flash and shake animation
    let flashCount = 0;
    const flashDuration = 0.5; // seconds
    const flashInterval = 0.05; // flash every 0.05 seconds

    const flashTimer = k.loop(flashInterval, () => {
      flashCount++;
      const flashProgress = (flashCount * flashInterval) / flashDuration;

      if (flashProgress >= 1) {
        // Animation complete
        player.opacity = originalOpacity;
        player.scale = originalScale;
        flashTimer.cancel();
        isInvulnerable = false;
      } else {
        // Flash opacity between 0.3 and 1.0
        const opacity = flashCount % 2 === 0 ? 0.3 : 1.0;
        player.opacity = opacity;

        // Slight scale shake
        const shakeAmount = 0.1;
        const shakeX = (Math.random() - 0.5) * shakeAmount;
        const shakeY = (Math.random() - 0.5) * shakeAmount;
        player.scale = k.vec2(1 + shakeX, 1 + shakeY);
      }
    });

    // Check if player is dead
    if (state.playerHealth <= 0) {
      callbacks.onDeath();
    }
  });

  // Handle player collision with XP points
  player.onCollide("xp", (xp: any) => {
    state.playerExperience += 10; // Gain 10 XP per point
    callbacks.onExperienceGain();
    xp.destroy();

    // Check for level up
    if (state.playerExperience >= state.maxExperience) {
      state.playerExperience = 0; // Reset XP
      state.playerLevel++;
      // Scale XP requirements with level: base 50 + (level - 1) * 15
      // Level 1: 50 XP, Level 2: 65 XP, Level 3: 80 XP, etc.
      state.maxExperience = 50 + (state.playerLevel - 1) * 15;
      callbacks.onLevelUp();
    }
  });

  // Handle player collision with health points
  player.onCollide("healthPoint", (healthPoint: any) => {
    if (state.playerHealth < state.maxHealth) {
      state.playerHealth = Math.min(state.maxHealth, state.playerHealth + 1);
      callbacks.onHealthChange(state.playerHealth);
    }
    healthPoint.destroy();
  });
}
