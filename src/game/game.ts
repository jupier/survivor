import kaplay from "kaplay";
import { createPlayerSprite } from "../assets/create-player-sprite";

export class Game {
  private k: ReturnType<typeof kaplay>;

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
    const fireInterval = 2; // seconds

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
      this.k.timer(),
      "player",
    ]);

    // Track current direction and movement state
    let currentDirection: "up" | "down" | "left" | "right" = "down";
    let isMoving = false;

    // Start with idle animation facing down
    player.play("idle-down");

    // Fire projectiles every 2 seconds in the direction the player is facing
    player.loop(fireInterval, () => {
      this.fireProjectile(player.pos, currentDirection);
    });

    // Handle continuous movement with z/q/s/d keys
    this.k.onUpdate(() => {
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
      "projectile",
    ]);

    // Move projectile in the direction the player is facing
    projectile.onUpdate(() => {
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
