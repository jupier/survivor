import kaplay from "kaplay";
import { createPlayerSprite } from "../assets/create-player-sprite";

export class Game {
  private k: ReturnType<typeof kaplay>;
  private isPaused = false;

  constructor(container: HTMLElement) {
    const width = Math.min(window.innerWidth, 1200);
    const height = Math.min(window.innerHeight, 800);

    this.k = kaplay({
      width,
      height,
      root: container,
      background: [42, 42, 42],
    });

    this.setupGame();
  }

  private async setupGame(): Promise<void> {
    const speed = 120; // pixels per second
    let fireInterval = 2; // seconds (mutable for upgrades)
    const enemySpawnInterval = 3; // seconds
    const enemySpeed = 50; // pixels per second
    const enemySize = 16; // size of enemy square

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

    // Create player with sprite
    const player = this.k.add([
      this.k.sprite("player"),
      this.k.pos(this.k.width() / 2, this.k.height() / 2),
      this.k.anchor("center"),
      this.k.area(),
      this.k.timer(),
      "player",
    ]);

    // Player experience tracking
    let playerExperience = 0;
    let playerLevel = 1;
    const maxExperience = 20; // Experience needed to level up (reduced)

    // Create experience bar UI at the top
    const expBarWidth = 300;
    const expBarHeight = 20;
    const expBarX = 20;
    const expBarY = 20;

    // Experience bar (blue) - will be updated
    const expBar = this.k.add([
      this.k.rect(0, expBarHeight),
      this.k.color(74, 158, 255), // Blue color matching player
      this.k.pos(expBarX, expBarY),
      this.k.anchor("topleft"),
      this.k.fixed(),
      this.k.z(101),
    ]);

    // Spawn enemies periodically
    this.k.loop(enemySpawnInterval, () => {
      this.spawnEnemy(player, enemySpeed, enemySize);
    });

    // Track current direction and movement state
    let currentDirection: "up" | "down" | "left" | "right" = "down";
    let isMoving = false;

    // Start with idle animation facing down
    player.play("idle-down");

    // Fire projectiles every 2 seconds in the direction the player is facing
    let fireLoopController = player.loop(fireInterval, () => {
      this.fireProjectile(player.pos, currentDirection);
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

      // Check for vertical movement
      const upPressed = this.k.isKeyDown("z");
      const downPressed = this.k.isKeyDown("s");
      // Check for horizontal movement
      const leftPressed = this.k.isKeyDown("q");
      const rightPressed = this.k.isKeyDown("d");

      // Prevent diagonal movement: prioritize vertical over horizontal
      if (upPressed || downPressed) {
        // Only allow vertical movement
        if (upPressed) {
          moveY -= moveSpeed;
        }
        if (downPressed) {
          moveY += moveSpeed;
        }
      } else {
        // Only allow horizontal movement if no vertical keys are pressed
        if (leftPressed) {
          moveX -= moveSpeed;
        }
        if (rightPressed) {
          moveX += moveSpeed;
        }
      }

      // Determine direction based on movement (no diagonal possible now)
      let newDirection: "up" | "down" | "left" | "right" = currentDirection;
      if (moveY < 0) {
        newDirection = "up";
      } else if (moveY > 0) {
        newDirection = "down";
      } else if (moveX < 0) {
        newDirection = "left";
      } else if (moveX > 0) {
        newDirection = "right";
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

      // Update experience bar
      const expPercentage = Math.min(playerExperience / maxExperience, 1);
      expBar.width = expBarWidth * expPercentage;
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
                this.fireProjectile(player.pos, currentDirection);
              });
            }
            // Other options will be added in the future
          }
        );
      }
    });
  }

  private showLevelUpMenu(
    onClose: () => void,
    onSelect: (option: string) => void
  ): void {
    // Create semi-transparent overlay
    const overlay = this.k.add([
      this.k.rect(this.k.width(), this.k.height()),
      this.k.color(0, 0, 0),
      this.k.opacity(0.7),
      this.k.pos(0, 0),
      this.k.anchor("topleft"),
      this.k.fixed(),
      this.k.z(200),
    ]);

    // Menu background
    const menuWidth = 400;
    const menuHeight = 300;
    const menuX = (this.k.width() - menuWidth) / 2;
    const menuY = (this.k.height() - menuHeight) / 2;

    const menuBg = this.k.add([
      this.k.rect(menuWidth, menuHeight),
      this.k.color(50, 50, 50),
      this.k.pos(menuX, menuY),
      this.k.anchor("topleft"),
      this.k.fixed(),
      this.k.z(201),
    ]);

    // Title
    const title = this.k.add([
      this.k.text("Level Up!", { size: 32 }),
      this.k.color(255, 255, 255),
      this.k.pos(this.k.width() / 2, menuY + 40),
      this.k.anchor("center"),
      this.k.fixed(),
      this.k.z(202),
    ]);

    // Menu options
    const options = [
      { id: "fireSpeed", text: "Increase Fire Speed" },
      { id: "placeholder1", text: "Coming Soon..." },
      { id: "placeholder2", text: "Coming Soon..." },
    ];

    const optionHeight = 50;
    const optionSpacing = 10;
    const startY = menuY + 100;

    options.forEach((option, index) => {
      const optionY = startY + index * (optionHeight + optionSpacing);
      const isEnabled = option.id === "fireSpeed";

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
      ]);

      // Option text
      const optionText = this.k.add([
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
      ]);

      // Handle click on enabled options
      if (isEnabled) {
        optionBg.onClick(() => {
          onSelect(option.id);
          // Clean up menu
          overlay.destroy();
          menuBg.destroy();
          title.destroy();
          optionBg.destroy();
          optionText.destroy();
          onClose();
        });
      }
    });
  }

  private spawnXP(position: { x: number; y: number }): void {
    const xpSize = 8;
    const xpColor = [100, 200, 255]; // Light blue color

    // Create XP point
    const xp = this.k.add([
      this.k.rect(xpSize, xpSize),
      this.k.color(xpColor[0], xpColor[1], xpColor[2]),
      this.k.pos(position.x, position.y),
      this.k.anchor("center"),
      this.k.area(),
      this.k.scale(),
      "xp",
    ]);

    // Optional: Add a pulsing animation
    xp.onUpdate(() => {
      // Simple pulsing effect
      const scale = 1 + Math.sin(this.k.time() * 5) * 0.2;
      xp.scale = this.k.vec2(scale, scale);
    });
  }

  private spawnEnemy(player: any, enemySpeed: number, enemySize: number): void {
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

    // Create enemy as red square
    const enemy = this.k.add([
      this.k.rect(enemySize, enemySize),
      this.k.color(255, 0, 0), // Red color
      this.k.pos(spawnX, spawnY),
      this.k.anchor("center"),
      this.k.area(),
      "enemy",
    ]);

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

  private fireProjectile(
    startPos: { x: number; y: number },
    direction: "up" | "down" | "left" | "right"
  ): void {
    const projectileSpeed = 300; // pixels per second
    const projectileSize = 8;

    // Calculate direction vector based on player direction
    let directionX = 0;
    let directionY = 0;

    switch (direction) {
      case "up":
        directionY = -1;
        break;
      case "down":
        directionY = 1;
        break;
      case "left":
        directionX = -1;
        break;
      case "right":
        directionX = 1;
        break;
    }

    // Create projectile
    const projectile = this.k.add([
      this.k.rect(projectileSize, projectileSize),
      this.k.color(255, 200, 0), // Yellow/orange color
      this.k.pos(startPos.x, startPos.y),
      this.k.anchor("center"),
      this.k.area(),
      "projectile",
    ]);

    // Handle collision with enemies
    projectile.onCollide("enemy", (enemy) => {
      // Spawn XP point at enemy position
      this.spawnXP(enemy.pos);

      // Destroy both the enemy and the projectile
      enemy.destroy();
      projectile.destroy();
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

  public stop(): void {
    // Kaplay doesn't have a built-in stop method
    // Could destroy the canvas if needed
  }
}
