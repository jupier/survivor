import kaplay from "kaplay";
import { createPlayerSprite } from "../assets/create-player-sprite";
import {
  createNormalEnemySprite,
  createStrongEnemySprite,
  createEliteEnemySprite,
} from "../assets/create-enemy-sprites";
import { createBackgroundPattern } from "../assets/create-background-sprite";
import { createXPSprite } from "../assets/create-xp-sprite";
import { createHealthSprite } from "../assets/create-health-sprite";
import { createProjectileSprite } from "../assets/create-projectile-sprite";
import { createTargetingZoneSprite } from "../assets/create-targeting-zone-sprite";

export class Game {
  private k: ReturnType<typeof kaplay>;
  private isPaused = false;
  private enemiesKilled = 0;
  private pauseOverlay: any = null;

  constructor(container: HTMLElement) {
    const width = Math.min(window.innerWidth, 1200);
    const height = Math.min(window.innerHeight, 800);

    this.k = kaplay({
      width,
      height,
      root: container,
      background: [42, 42, 52], // Slightly darker blue-gray to match moon theme
    });

    this.setupGame();
  }

  private async setupGame(): Promise<void> {
    let speed = 120; // pixels per second (mutable for upgrades)
    let fireInterval = 1; // seconds (mutable for upgrades) - faster for auto-targeting
    let enemySpawnInterval = 1; // seconds (mutable - increases every 15 seconds)
    const enemySpeed = 100; // pixels per second
    const enemySize = 32; // size of enemy sprite (32x32)
    let targetingZoneRadius = 150; // Configurable targeting zone radius (mutable for upgrades)
    let projectileCount = 1; // Number of projectiles fired at once (mutable for upgrades)

    // Enemy scaling
    let enemySpawnController: any = null; // Controller for normal enemy spawn loop
    let strongEnemySpawnController: any = null; // Controller for strong enemy spawn loop
    let eliteEnemySpawnController: any = null; // Controller for elite enemy spawn loop
    let lastSpawnRateIncrease = 0; // Track when we last increased spawn rate

    // Create and load player sprite with directional animations
    const spriteDataUrl = createPlayerSprite();
    await this.k.loadSprite("player", spriteDataUrl, {
      sliceX: 3, // 3 frames horizontally (idle, walk1, walk2)
      sliceY: 4, // 4 frames vertically (up, down, left, right)
      anims: {
        // Up direction (back view)
        "idle-up": { from: 0, to: 0, loop: true },
        "walk-up": { from: 1, to: 2, loop: true, speed: 8 },
        // Down direction (front view)
        "idle-down": { from: 3, to: 3, loop: true },
        "walk-down": { from: 4, to: 5, loop: true, speed: 8 },
        // Left direction (side view)
        "idle-left": { from: 6, to: 6, loop: true },
        "walk-left": { from: 7, to: 8, loop: true, speed: 8 },
        // Right direction (side view)
        "idle-right": { from: 9, to: 9, loop: true },
        "walk-right": { from: 10, to: 11, loop: true, speed: 8 },
      },
    });

    // Create and load enemy sprites
    const normalEnemySpriteUrl = createNormalEnemySprite();
    await this.k.loadSprite("enemy-normal", normalEnemySpriteUrl);

    const strongEnemySpriteUrl = createStrongEnemySprite();
    await this.k.loadSprite("enemy-strong", strongEnemySpriteUrl);

    const eliteEnemySpriteUrl = createEliteEnemySprite();
    await this.k.loadSprite("enemy-elite", eliteEnemySpriteUrl);

    // Create and load background, XP, health, and projectile sprites
    const backgroundPatternUrl = createBackgroundPattern();
    await this.k.loadSprite("background", backgroundPatternUrl);

    const xpSpriteUrl = createXPSprite();
    await this.k.loadSprite("xp", xpSpriteUrl);

    const healthSpriteUrl = createHealthSprite();
    await this.k.loadSprite("health", healthSpriteUrl);

    const projectileSpriteUrl = createProjectileSprite();
    await this.k.loadSprite("projectile", projectileSpriteUrl);

    const targetingZoneSpriteUrl = createTargetingZoneSprite();
    await this.k.loadSprite("targeting-zone", targetingZoneSpriteUrl);

    // Create tiled simple background
    const tileSize = 64;
    const tilesX = Math.ceil(this.k.width() / tileSize) + 1;
    const tilesY = Math.ceil(this.k.height() / tileSize) + 1;
    for (let x = 0; x < tilesX; x++) {
      for (let y = 0; y < tilesY; y++) {
        this.k.add([
          this.k.sprite("background"),
          this.k.pos(x * tileSize, y * tileSize),
          this.k.anchor("topleft"),
          this.k.z(0),
        ]);
      }
    }

    // Create player with sprite
    const player = this.k.add([
      this.k.sprite("player"),
      this.k.pos(this.k.width() / 2, this.k.height() / 2),
      this.k.anchor("center"),
      this.k.area(),
      this.k.opacity(1),
      this.k.scale(),
      this.k.timer(),
      "player",
    ]);

    // Player experience tracking
    let playerExperience = 0;
    let playerLevel = 1;
    const maxExperience = 50; // Experience needed to level up (increased)

    // Player health tracking
    let playerHealth = 2;
    const maxHealth = 2;

    // Game timer (10 minutes = 600 seconds)
    let gameTime = 600; // seconds

    // UI Layout constants
    const uiPadding = 20;
    const barWidth = 250;
    const barHeight = 18;
    const barSpacing = 8;
    let currentY = uiPadding;

    // Level display (top left)
    const levelText = this.k.add([
      this.k.text("Level: 1", { size: 24 }),
      this.k.color(255, 215, 0), // Gold color
      this.k.pos(uiPadding, currentY),
      this.k.anchor("topleft"),
      this.k.fixed(),
      this.k.z(110),
    ]);
    currentY += 30;

    // Timer display (below level)
    const timerText = this.k.add([
      this.k.text("10:00", { size: 20 }),
      this.k.color(255, 255, 255),
      this.k.pos(uiPadding, currentY),
      this.k.anchor("topleft"),
      this.k.fixed(),
      this.k.z(110),
    ]);
    currentY += 30;

    // Kills counter (below timer)
    const killsText = this.k.add([
      this.k.text("Kills: 0", { size: 20 }),
      this.k.color(255, 255, 255),
      this.k.pos(uiPadding, currentY),
      this.k.anchor("topleft"),
      this.k.fixed(),
      this.k.z(110),
    ]);
    currentY += 35;

    // Experience bar background (gray)
    this.k.add([
      this.k.rect(barWidth, barHeight),
      this.k.color(60, 60, 60),
      this.k.pos(uiPadding, currentY),
      this.k.anchor("topleft"),
      this.k.fixed(),
      this.k.z(101),
    ]);

    // Experience bar (blue) - will be updated
    const expBar = this.k.add([
      this.k.rect(0, barHeight),
      this.k.color(74, 158, 255), // Blue color matching player
      this.k.pos(uiPadding, currentY),
      this.k.anchor("topleft"),
      this.k.fixed(),
      this.k.z(102),
    ]);

    // Experience label
    this.k.add([
      this.k.text("XP", { size: 14 }),
      this.k.color(200, 200, 200),
      this.k.pos(uiPadding + 5, currentY + barHeight / 2),
      this.k.anchor("left"),
      this.k.fixed(),
      this.k.z(103),
    ]);
    currentY += barHeight + barSpacing;

    // Life bar background (gray)
    this.k.add([
      this.k.rect(barWidth, barHeight),
      this.k.color(60, 60, 60),
      this.k.pos(uiPadding, currentY),
      this.k.anchor("topleft"),
      this.k.fixed(),
      this.k.z(101),
    ]);

    // Life bar (red) - will be updated
    const lifeBar = this.k.add([
      this.k.rect(barWidth, barHeight),
      this.k.color(255, 0, 0), // Red color
      this.k.pos(uiPadding, currentY),
      this.k.anchor("topleft"),
      this.k.fixed(),
      this.k.z(102),
    ]);

    // Health label
    this.k.add([
      this.k.text("HP", { size: 14 }),
      this.k.color(200, 200, 200),
      this.k.pos(uiPadding + 5, currentY + barHeight / 2),
      this.k.anchor("left"),
      this.k.fixed(),
      this.k.z(103),
    ]);
    currentY += barHeight + barSpacing + 10;

    // Player and Weapon Stats (top right)
    const statsX = this.k.width() - uiPadding - 200;
    let statsY = uiPadding;

    // Stats title
    this.k.add([
      this.k.text("Stats", { size: 18 }),
      this.k.color(255, 255, 255),
      this.k.pos(statsX, statsY),
      this.k.anchor("topleft"),
      this.k.fixed(),
      this.k.z(110),
    ]);
    statsY += 25;

    // Speed stat
    const speedStatText = this.k.add([
      this.k.text(`Speed: ${speed}`, { size: 14 }),
      this.k.color(200, 200, 200),
      this.k.pos(statsX, statsY),
      this.k.anchor("topleft"),
      this.k.fixed(),
      this.k.z(110),
    ]);
    statsY += 20;

    // Projectile count stat
    const projectileStatText = this.k.add([
      this.k.text(`Projectiles: ${projectileCount}`, { size: 14 }),
      this.k.color(200, 200, 200),
      this.k.pos(statsX, statsY),
      this.k.anchor("topleft"),
      this.k.fixed(),
      this.k.z(110),
    ]);
    statsY += 20;

    // Targeting zone radius stat
    const zoneStatText = this.k.add([
      this.k.text(`Range: ${targetingZoneRadius}`, { size: 14 }),
      this.k.color(200, 200, 200),
      this.k.pos(statsX, statsY),
      this.k.anchor("topleft"),
      this.k.fixed(),
      this.k.z(110),
    ]);
    statsY += 20;

    // Fire rate stat
    const fireRateStatText = this.k.add([
      this.k.text(`Fire Rate: ${(1 / fireInterval).toFixed(1)}/s`, {
        size: 14,
      }),
      this.k.color(200, 200, 200),
      this.k.pos(statsX, statsY),
      this.k.anchor("topleft"),
      this.k.fixed(),
      this.k.z(110),
    ]);

    // Spawn normal enemies periodically (always active)
    enemySpawnController = this.k.loop(enemySpawnInterval, () => {
      this.spawnEnemy(player, enemySpeed, enemySize, false); // false = normal enemy
    });

    // Spawn strong enemies after 30 seconds
    this.k.wait(30, () => {
      // Start spawning strong enemies after 30 seconds
      strongEnemySpawnController = this.k.loop(enemySpawnInterval, () => {
        this.spawnEnemy(player, enemySpeed, enemySize, true); // true = strong enemy (2 HP)
      });
    });

    // Spawn elite enemies after 60 seconds (1 minute)
    this.k.wait(60, () => {
      // Start spawning elite enemies after 60 seconds
      eliteEnemySpawnController = this.k.loop(enemySpawnInterval, () => {
        this.spawnEnemy(player, enemySpeed, enemySize, false, true); // elite enemy (3 HP)
      });
    });

    // Track current direction and movement state
    let currentDirection: "up" | "down" | "left" | "right" = "down";
    let isMoving = false;

    // Start with idle animation facing down
    player.play("idle-down");

    // Draw targeting zone circle (white dotted line) using sprite
    const baseSpriteSize = 300; // Size of the sprite we created
    const scaleValue = (targetingZoneRadius * 2) / baseSpriteSize;
    const zoneCircle = this.k.add([
      this.k.sprite("targeting-zone"),
      this.k.pos(player.pos.x, player.pos.y),
      this.k.anchor("center"),
      this.k.z(50), // Above background but below most game objects
      this.k.opacity(0.5), // Semi-transparent
      this.k.scale(this.k.vec2(scaleValue, scaleValue)), // Scale to match radius
      "targetingZone",
    ]);

    // Update position and scale to follow player and match current radius
    zoneCircle.onUpdate(() => {
      zoneCircle.pos.x = player.pos.x;
      zoneCircle.pos.y = player.pos.y;
      // Update scale if radius changes (from upgrades)
      const newScale = (targetingZoneRadius * 2) / baseSpriteSize;
      zoneCircle.scale = this.k.vec2(newScale, newScale);
    });

    // Auto-fire at closest enemy within zone
    let fireLoopController = player.loop(fireInterval, () => {
      if (!this.isPaused) {
        this.autoFireAtClosestEnemy(
          player,
          targetingZoneRadius,
          projectileCount
        );
      }
    });

    // Handle ESC key to pause/unpause (check outside of paused check)
    this.k.onKeyPress("escape", () => {
      this.isPaused = !this.isPaused;
      // Show/hide pause overlay
      if (this.isPaused) {
        this.showPauseMenu();
      } else {
        this.hidePauseMenu();
      }
    });

    // Handle continuous movement with z/q/s/d keys
    this.k.onUpdate(() => {
      // Skip updates if game is paused
      if (this.isPaused) {
        return;
      }

      const moveSpeed = speed * this.k.dt();
      let moveX = 0;
      let moveY = 0;

      // Check for vertical movement (z/s or arrow up/down)
      const upPressed = this.k.isKeyDown("z") || this.k.isKeyDown("up");
      const downPressed = this.k.isKeyDown("s") || this.k.isKeyDown("down");
      // Check for horizontal movement (q/d or arrow left/right)
      const leftPressed = this.k.isKeyDown("q") || this.k.isKeyDown("left");
      const rightPressed = this.k.isKeyDown("d") || this.k.isKeyDown("right");

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

        // Keep player in bounds
        //player.pos.x = this.k.clamp(player.pos.x, 10, this.k.width() - 10);
        //player.pos.y = this.k.clamp(player.pos.y, 10, this.k.height() - 10);
      }

      // Update timer (only if not paused)
      if (!this.isPaused && gameTime > 0) {
        gameTime -= this.k.dt();
        if (gameTime < 0) {
          gameTime = 0;
        }

        // Format timer as MM:SS
        const minutes = Math.floor(gameTime / 60);
        const seconds = Math.floor(gameTime % 60);
        const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;
        timerText.text = timeString;

        // Increase enemy spawn rate every 15 seconds
        const gameTimeElapsed = 600 - gameTime;
        const spawnRateIncreaseInterval = 15;
        if (
          gameTimeElapsed - lastSpawnRateIncrease >=
          spawnRateIncreaseInterval
        ) {
          lastSpawnRateIncrease = gameTimeElapsed;
          // Reduce spawn interval (spawn more frequently)
          enemySpawnInterval = Math.max(0.3, enemySpawnInterval * 0.9); // 10% faster
          // Restart normal enemy spawn loop with new interval
          enemySpawnController.cancel();
          enemySpawnController = this.k.loop(enemySpawnInterval, () => {
            this.spawnEnemy(player, enemySpeed, enemySize, false); // false = normal enemy
          });
          // Also update strong enemy spawn loop if it exists (after 30 seconds)
          if (strongEnemySpawnController) {
            strongEnemySpawnController.cancel();
            strongEnemySpawnController = this.k.loop(enemySpawnInterval, () => {
              this.spawnEnemy(player, enemySpeed, enemySize, true); // true = strong enemy (2 HP)
            });
          }
          // Also update elite enemy spawn loop if it exists (after 60 seconds)
          if (eliteEnemySpawnController) {
            eliteEnemySpawnController.cancel();
            eliteEnemySpawnController = this.k.loop(enemySpawnInterval, () => {
              this.spawnEnemy(player, enemySpeed, enemySize, false, true); // elite enemy (3 HP)
            });
          }
        }

        // Check for time up
        if (gameTime <= 0) {
          this.handlePlayerDeath();
        }
      }

      // Update experience bar
      const expPercentage = Math.min(playerExperience / maxExperience, 1);
      expBar.width = barWidth * expPercentage;

      // Update life bar
      const healthPercentage = Math.max(0, playerHealth / maxHealth);
      lifeBar.width = barWidth * healthPercentage;

      // Update kills counter
      killsText.text = `Kills: ${this.enemiesKilled}`;

      // Update level display
      levelText.text = `Level: ${playerLevel}`;

      // Update stats display
      speedStatText.text = `Speed: ${Math.round(speed)}`;
      projectileStatText.text = `Projectiles: ${projectileCount}`;
      zoneStatText.text = `Range: ${targetingZoneRadius}`;
      fireRateStatText.text = `Fire Rate: ${(1 / fireInterval).toFixed(1)}/s`;
    });

    // Handle player collision with enemies
    let isInvulnerable = false; // Prevent multiple hits in quick succession
    player.onCollide("enemy", (enemy) => {
      if (!this.isPaused && !isInvulnerable) {
        playerHealth -= 1;
        enemy.destroy(); // Destroy enemy on contact

        // Hit animation: flash opacity and scale shake
        isInvulnerable = true;
        const originalOpacity = player.opacity ?? 1;
        const originalScale = player.scale ?? this.k.vec2(1, 1);

        // Flash and shake animation
        let flashCount = 0;
        const flashDuration = 0.5; // seconds
        const flashInterval = 0.05; // flash every 0.05 seconds

        const flashTimer = this.k.loop(flashInterval, () => {
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
            player.scale = this.k.vec2(1 + shakeX, 1 + shakeY);
          }
        });

        // Check if player is dead
        if (playerHealth <= 0) {
          this.handlePlayerDeath();
        }
      }
    });

    // Handle player collision with XP points
    player.onCollide("xp", (xp) => {
      playerExperience += 10; // Gain 10 XP per point
      xp.destroy();

      // Check for level up
      if (playerExperience >= maxExperience) {
        playerExperience = 0; // Reset XP
        playerLevel++;
        this.isPaused = true;
        this.showLevelUpMenu(
          () => {
            this.isPaused = false;
          },
          (option: string) => {
            if (option === "fireSpeed") {
              // Increase fire speed (reduce interval)
              fireInterval = Math.max(0.5, fireInterval * 0.7); // 30% faster
              // Cancel old loop and start new one with updated interval
              fireLoopController.cancel();
              fireLoopController = player.loop(fireInterval, () => {
                if (!this.isPaused) {
                  this.autoFireAtClosestEnemy(
                    player,
                    targetingZoneRadius,
                    projectileCount
                  );
                }
              });
            } else if (option === "projectileCount") {
              // Increase projectile count
              projectileCount += 1;
            } else if (option === "movementSpeed") {
              // Increase movement speed
              speed = Math.round(speed * 1.2); // 20% faster
            } else if (option === "targetingZone") {
              // Increase targeting zone radius
              targetingZoneRadius = Math.round(targetingZoneRadius * 1.3); // 30% larger
            }
          }
        );
      }
    });

    // Handle player collision with health points
    player.onCollide("healthPoint", (healthPoint) => {
      if (playerHealth < maxHealth) {
        playerHealth = Math.min(maxHealth, playerHealth + 1); // Restore 1 health point
      }
      healthPoint.destroy();
    });
  }

  private showLevelUpMenu(
    onClose: () => void,
    onSelect: (option: string) => void
  ): void {
    // Create semi-transparent overlay
    this.k.add([
      this.k.rect(this.k.width(), this.k.height()),
      this.k.color(0, 0, 0),
      this.k.opacity(0.7),
      this.k.pos(0, 0),
      this.k.anchor("topleft"),
      this.k.fixed(),
      this.k.z(200),
      "levelUpMenu",
    ]);

    // Menu background
    const menuWidth = 400;
    const menuHeight = 300; // Back to original size for 4 options
    const menuX = (this.k.width() - menuWidth) / 2;
    const menuY = (this.k.height() - menuHeight) / 2;

    this.k.add([
      this.k.rect(menuWidth, menuHeight),
      this.k.color(50, 50, 50),
      this.k.pos(menuX, menuY),
      this.k.anchor("topleft"),
      this.k.fixed(),
      this.k.z(201),
      "levelUpMenu",
    ]);

    // Title
    this.k.add([
      this.k.text("Level Up!", { size: 32 }),
      this.k.color(255, 255, 255),
      this.k.pos(this.k.width() / 2, menuY + 40),
      this.k.anchor("center"),
      this.k.fixed(),
      this.k.z(202),
      "levelUpMenu",
    ]);

    // Menu options
    const options = [
      { id: "fireSpeed", text: "Increase Fire Speed" },
      { id: "projectileCount", text: "Increase Projectile Count" },
      { id: "movementSpeed", text: "Increase Movement Speed" },
      { id: "targetingZone", text: "Increase Targeting Range" },
    ];

    const optionHeight = 50;
    const optionSpacing = 10;
    const startY = menuY + 100;

    options.forEach((option, index) => {
      const optionY = startY + index * (optionHeight + optionSpacing);
      const isEnabled = true; // All options are enabled

      // Option background
      const optionBg = this.k.add([
        this.k.rect(menuWidth - 40, optionHeight),
        this.k.color(
          isEnabled ? 60 : 40,
          isEnabled ? 60 : 40,
          isEnabled ? 60 : 40
        ),
        this.k.pos(menuX + 20, optionY),
        this.k.anchor("topleft"),
        this.k.fixed(),
        this.k.z(202),
        this.k.area(),
        `option-${option.id}`,
        "levelUpMenu",
      ]);

      // Option text
      this.k.add([
        this.k.text(option.text, { size: 20 }),
        this.k.color(
          isEnabled ? 255 : 150,
          isEnabled ? 255 : 150,
          isEnabled ? 255 : 150
        ),
        this.k.pos(menuX + menuWidth / 2, optionY + optionHeight / 2),
        this.k.anchor("center"),
        this.k.fixed(),
        this.k.z(203),
        "levelUpMenu",
      ]);

      // Handle click on enabled options
      if (isEnabled) {
        optionBg.onClick(() => {
          onSelect(option.id);
          // Clean up all menu elements using the tag
          const menuElements = this.k.get("levelUpMenu");
          menuElements.forEach((elem) => elem.destroy());
          onClose();
        });
      }
    });
  }

  private spawnXP(position: { x: number; y: number }): void {
    // Create XP point with gem sprite
    const xp = this.k.add([
      this.k.sprite("xp"),
      this.k.pos(position.x, position.y),
      this.k.anchor("center"),
      this.k.area(),
      this.k.scale(),
      "xp",
    ]);

    // Add a pulsing animation
    xp.onUpdate(() => {
      // Simple pulsing effect
      const scale = 1 + Math.sin(this.k.time() * 5) * 0.2;
      xp.scale = this.k.vec2(scale, scale);
    });
  }

  private spawnHealthPoint(position: { x: number; y: number }): void {
    // Create health point with heart sprite
    const healthPoint = this.k.add([
      this.k.sprite("health"),
      this.k.pos(position.x, position.y),
      this.k.anchor("center"),
      this.k.area(),
      this.k.scale(),
      "healthPoint",
    ]);

    // Add a pulsing animation
    healthPoint.onUpdate(() => {
      // Simple pulsing effect
      const scale = 1 + Math.sin(this.k.time() * 5) * 0.2;
      healthPoint.scale = this.k.vec2(scale, scale);
    });
  }

  private spawnEnemy(
    player: any,
    enemySpeed: number,
    enemySize: number,
    isStrongEnemy: boolean,
    isEliteEnemy: boolean = false
  ): void {
    // Spawn enemy at random position on the map edges
    const side = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
    let spawnX = 0;
    let spawnY = 0;

    switch (side) {
      case 0: // Top
        spawnX = Math.random() * this.k.width();
        spawnY = -enemySize;
        break;
      case 1: // Right
        spawnX = this.k.width() + enemySize;
        spawnY = Math.random() * this.k.height();
        break;
      case 2: // Bottom
        spawnX = Math.random() * this.k.width();
        spawnY = this.k.height() + enemySize;
        break;
      case 3: // Left
        spawnX = -enemySize;
        spawnY = Math.random() * this.k.height();
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
    const enemy = this.k.add([
      this.k.sprite(enemySpriteName),
      this.k.pos(spawnX, spawnY),
      this.k.anchor("center"),
      this.k.area(),
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
      const healthBarBg = this.k.add([
        this.k.rect(healthBarWidth, healthBarHeight),
        this.k.color(60, 60, 60),
        this.k.pos(spawnX, spawnY + healthBarOffset),
        this.k.anchor("center"),
        this.k.z(60),
      ]);

      // Health bar fill (green)
      const healthBar = this.k.add([
        this.k.rect(healthBarWidth, healthBarHeight),
        this.k.color(0, 255, 0), // Green color
        this.k.pos(spawnX, spawnY + healthBarOffset),
        this.k.anchor("center"),
        this.k.z(61),
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
      if (this.isPaused) {
        return;
      }

      // Calculate direction to player
      const dx = player.pos.x - enemy.pos.x;
      const dy = player.pos.y - enemy.pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Normalize direction and move towards player
      if (distance > 0) {
        const moveX = (dx / distance) * enemySpeed * this.k.dt();
        const moveY = (dy / distance) * enemySpeed * this.k.dt();
        enemy.pos.x += moveX;
        enemy.pos.y += moveY;
      }
    });
  }

  private autoFireAtClosestEnemy(
    player: any,
    zoneRadius: number,
    projectileCount: number
  ): void {
    // Find all enemies
    const enemies = this.k.get("enemy");

    if (enemies.length === 0) {
      return; // No enemies to target
    }

    // Calculate distances to all enemies within zone and sort them
    const enemiesInRange: Array<{ enemy: any; distance: number }> = [];

    for (const enemy of enemies) {
      const dx = enemy.pos.x - player.pos.x;
      const dy = enemy.pos.y - player.pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= zoneRadius) {
        enemiesInRange.push({ enemy, distance });
      }
    }

    // Sort enemies by distance (closest first)
    enemiesInRange.sort((a, b) => a.distance - b.distance);

    // Fire projectiles at the X closest enemies (where X is the minimum of projectileCount and enemiesInRange.length)
    // Only fire as many projectiles as there are enemies in range
    const targetsToFire = Math.min(projectileCount, enemiesInRange.length);

    for (let i = 0; i < targetsToFire; i++) {
      const target = enemiesInRange[i];
      const dx = target.enemy.pos.x - player.pos.x;
      const dy = target.enemy.pos.y - player.pos.y;
      const distance = target.distance;

      if (distance > 0) {
        // Normalize direction
        const directionX = dx / distance;
        const directionY = dy / distance;

        // Fire one projectile at this enemy
        this.fireProjectile(player.pos, directionX, directionY);
      }
    }
  }

  private fireProjectile(
    startPos: { x: number; y: number },
    directionX: number,
    directionY: number
  ): void {
    const projectileSpeed = 300; // pixels per second
    const projectileSize = 8;

    // Calculate rotation angle in degrees (Kaplay uses degrees)
    const angle = Math.atan2(directionY, directionX) * (180 / Math.PI);

    // Create projectile with sprite
    const projectile = this.k.add([
      this.k.sprite("projectile"),
      this.k.pos(startPos.x, startPos.y),
      this.k.anchor("center"),
      this.k.area(),
      this.k.rotate(angle), // Rotate projectile to face direction
      "projectile",
    ]);

    // Handle collision with enemies
    projectile.onCollide("enemy", (enemy) => {
      // Reduce enemy health
      if (!(enemy as any).health) {
        (enemy as any).health = 1;
      }
      (enemy as any).health -= 1;

      // Destroy projectile
      projectile.destroy();

      // Check if enemy is dead
      if ((enemy as any).health <= 0) {
        // Spawn XP point at enemy position
        this.spawnXP(enemy.pos);

        // Rare chance to spawn health point (10% chance)
        if (Math.random() < 0.1) {
          this.spawnHealthPoint(enemy.pos);
        }

        // Increment kill counter
        this.enemiesKilled++;

        // Destroy the enemy
        enemy.destroy();
      }
    });

    // Move projectile in the direction the player is facing
    projectile.onUpdate(() => {
      // Don't update if game is paused
      if (this.isPaused) {
        return;
      }

      projectile.pos.x += directionX * projectileSpeed * this.k.dt();
      projectile.pos.y += directionY * projectileSpeed * this.k.dt();

      // Remove projectile when it goes off screen
      if (
        projectile.pos.x < -projectileSize ||
        projectile.pos.x > this.k.width() + projectileSize ||
        projectile.pos.y < -projectileSize ||
        projectile.pos.y > this.k.height() + projectileSize
      ) {
        projectile.destroy();
      }
    });
  }

  public start(): void {
    // Game is already running after kaplay initialization
  }

  private showPauseMenu(): void {
    // Create pause overlay
    this.pauseOverlay = this.k.add([
      this.k.rect(this.k.width(), this.k.height()),
      this.k.color(0, 0, 0),
      this.k.opacity(0.7),
      this.k.pos(0, 0),
      this.k.anchor("topleft"),
      this.k.fixed(),
      this.k.z(250),
      "pause",
    ]);

    // Pause text
    this.k.add([
      this.k.text("PAUSED", { size: 48 }),
      this.k.color(255, 255, 255),
      this.k.pos(this.k.width() / 2, this.k.height() / 2),
      this.k.anchor("center"),
      this.k.fixed(),
      this.k.z(251),
      "pause",
    ]);

    // Instruction text
    this.k.add([
      this.k.text("Press ESC to resume", { size: 20 }),
      this.k.color(200, 200, 200),
      this.k.pos(this.k.width() / 2, this.k.height() / 2 + 60),
      this.k.anchor("center"),
      this.k.fixed(),
      this.k.z(251),
      "pause",
    ]);
  }

  private hidePauseMenu(): void {
    // Remove all pause menu elements
    const pauseElements = this.k.get("pause");
    pauseElements.forEach((elem) => elem.destroy());

    if (this.pauseOverlay) {
      this.pauseOverlay.destroy();
      this.pauseOverlay = null;
    }
  }

  private handlePlayerDeath(): void {
    this.isPaused = true;

    // Create death screen overlay
    this.k.add([
      this.k.rect(this.k.width(), this.k.height()),
      this.k.color(0, 0, 0),
      this.k.opacity(0.8),
      this.k.pos(0, 0),
      this.k.anchor("topleft"),
      this.k.fixed(),
      this.k.z(300),
    ]);

    // Death message
    this.k.add([
      this.k.text("Game Over", { size: 48 }),
      this.k.color(255, 0, 0),
      this.k.pos(this.k.width() / 2, this.k.height() / 2 - 50),
      this.k.anchor("center"),
      this.k.fixed(),
      this.k.z(301),
    ]);

    // Restart instruction
    this.k.add([
      this.k.text("Refresh the page to restart", { size: 24 }),
      this.k.color(255, 255, 255),
      this.k.pos(this.k.width() / 2, this.k.height() / 2 + 50),
      this.k.anchor("center"),
      this.k.fixed(),
      this.k.z(301),
    ]);
  }

  public stop(): void {
    // Kaplay doesn't have a built-in stop method
    // Could destroy the canvas if needed
  }
}
