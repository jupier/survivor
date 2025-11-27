import kaplay from "kaplay";
import { GameState, createInitialGameState } from "./game-state";
import { loadAllSprites, createBackground } from "./sprite-loader";
import { createUI, updateUI, UIElements } from "./ui-manager";
import {
  createPlayer,
  setupPlayerMovement,
  setupPlayerCollisions,
} from "./player-manager";
import { setupEnemySpawning, spawnEnemy } from "./enemy-manager";
import { autoFireAtClosestEnemy } from "./projectile-manager";
import { showLevelUpMenu } from "./level-up-manager";
import { showPauseMenu, hidePauseMenu, showDeathScreen } from "./menu-manager";
import { spawnXP, spawnHealthPoint } from "./pickup-manager";

export class Game {
  private k: ReturnType<typeof kaplay>;
  private state: GameState;
  private ui!: UIElements; // Initialized in setupGame
  private player: any;
  private enemySpawnControllers: {
    normalController: any;
    strongController: any;
    eliteController: any;
  } | null = null;
  private fireLoopController: any = null;
  private targetingZone: any = null;
  private targetingZoneOverlay: any = null; // Blue overlay when slow weapon is active

  constructor(container: HTMLElement) {
    const width = Math.min(window.innerWidth, 1200);
    const height = Math.min(window.innerHeight, 800);

    this.k = kaplay({
      width,
      height,
      root: container,
      background: [42, 42, 52], // Slightly darker blue-gray to match moon theme
    });

    this.state = createInitialGameState();
    this.setupGame();
  }

  private async setupGame(): Promise<void> {
    const enemySpeed = 75; // pixels per second (reduced from 100 for better playability)
    const enemySize = 24; // size of enemy sprite (24x24, scaled down from 32)

    // Load all sprites
    await loadAllSprites(this.k);

    // Create background
    createBackground(this.k);

    // Create player
    const playerData = createPlayer(this.k);
    this.player = playerData.player;

    // Create UI
    this.ui = createUI(this.k);

    // Setup player movement
    setupPlayerMovement(
      this.k,
      this.player,
      this.state.speed,
      () => this.state.isPaused
    );

    // Setup player collisions
    setupPlayerCollisions(this.k, this.player, this.state, {
      onHealthChange: (newHealth: number) => {
        this.state.playerHealth = newHealth;
      },
      onExperienceGain: () => {
        // Already handled in setupPlayerCollisions
      },
      onLevelUp: () => {
        this.handleLevelUp();
      },
      onEnemyKilled: () => {
        this.state.enemiesKilled++;
      },
      onDeath: () => {
        this.handlePlayerDeath();
      },
    });

    // Setup enemy spawning
    this.enemySpawnControllers = setupEnemySpawning(
      this.k,
      this.player,
      enemySpeed,
      enemySize,
      this.state.enemySpawnInterval,
      () => this.state.isPaused,
      () => ({
        active: this.state.slowWeaponActive,
        effectPercentage: this.state.slowEffectPercentage,
        zoneRadius: this.state.targetingZoneRadius,
      })
    );

    // Create targeting zone
    this.setupTargetingZone();

    // Setup auto-fire
    this.setupAutoFire();

    // Handle ESC key to pause/unpause
    this.k.onKeyPress("escape", () => {
      this.state.isPaused = !this.state.isPaused;
      if (this.state.isPaused) {
        showPauseMenu(this.k);
      } else {
        hidePauseMenu(this.k);
      }
    });

    // Main game loop
    this.setupGameLoop(enemySpeed, enemySize);
  }

  private setupTargetingZone(): void {
    const baseSpriteSize = 300; // Size of the sprite we created
    const scaleValue = (this.state.targetingZoneRadius * 2) / baseSpriteSize;
    this.targetingZone = this.k.add([
      this.k.sprite("targeting-zone"),
      this.k.pos(this.player.pos.x, this.player.pos.y),
      this.k.anchor("center"),
      this.k.z(50), // Above background but below most game objects
      this.k.opacity(0.5), // Semi-transparent
      this.k.scale(this.k.vec2(scaleValue, scaleValue)), // Scale to match radius
      "targetingZone",
    ]);

    // Create blue overlay circle for slow weapon (initially hidden)
    this.targetingZoneOverlay = this.k.add([
      this.k.circle(this.state.targetingZoneRadius),
      this.k.color(100, 150, 255), // Blue color
      this.k.pos(this.player.pos.x, this.player.pos.y),
      this.k.anchor("center"),
      this.k.z(49), // Just below the targeting zone sprite
      this.k.opacity(0), // Initially invisible
      "targetingZoneOverlay",
    ]);

    // Update position and scale to follow player and match current radius
    this.targetingZone.onUpdate(() => {
      this.targetingZone.pos.x = this.player.pos.x;
      this.targetingZone.pos.y = this.player.pos.y;
      // Update scale if radius changes (from upgrades)
      const newScale = (this.state.targetingZoneRadius * 2) / baseSpriteSize;
      this.targetingZone.scale = this.k.vec2(newScale, newScale);

      // Update overlay when slow weapon is active
      if (this.state.slowWeaponActive) {
        // Show blue overlay with low opacity
        this.targetingZoneOverlay.opacity = 0.2;
        this.targetingZoneOverlay.radius = this.state.targetingZoneRadius;
        this.targetingZoneOverlay.pos.x = this.player.pos.x;
        this.targetingZoneOverlay.pos.y = this.player.pos.y;
        // Reduce white zone opacity
        this.targetingZone.opacity = 0.3;
      } else {
        // Hide blue overlay
        this.targetingZoneOverlay.opacity = 0;
        // Normal white zone opacity
        this.targetingZone.opacity = 0.5;
      }
    });
  }

  private setupAutoFire(): void {
    this.fireLoopController = this.player.loop(this.state.fireInterval, () => {
      if (!this.state.isPaused) {
        autoFireAtClosestEnemy(
          this.k,
          this.player,
          this.state.targetingZoneRadius,
          this.state.projectileCount,
          this.state.projectileBounces,
          (enemy: any) => {
            this.handleEnemyHit(enemy);
          },
          () => this.state.isPaused
        );
      }
    });
  }

  private handleEnemyHit(enemy: any): void {
    // Reduce enemy health
    if (!(enemy as any).health) {
      (enemy as any).health = 1;
    }
    (enemy as any).health -= 1;

    // Check if enemy is dead
    if ((enemy as any).health <= 0) {
      // Spawn XP point at enemy position
      spawnXP(this.k, enemy.pos);

      // Rare chance to spawn health point (10% chance)
      if (Math.random() < 0.1) {
        spawnHealthPoint(this.k, enemy.pos);
      }

      // Increment kill counter
      this.state.enemiesKilled++;

      // Destroy the enemy
      enemy.destroy();
    }
  }

  private setupGameLoop(enemySpeed: number, enemySize: number): void {
    this.k.onUpdate(() => {
      // Skip updates if game is paused
      if (this.state.isPaused) {
        return;
      }

      // Update timer
      if (this.state.gameTime > 0) {
        this.state.gameTime -= this.k.dt();
        if (this.state.gameTime < 0) {
          this.state.gameTime = 0;
        }

        // Increase enemy spawn rate every 15 seconds
        const gameTimeElapsed = 600 - this.state.gameTime;
        const spawnRateIncreaseInterval = 15;
        if (
          gameTimeElapsed - this.state.lastSpawnRateIncrease >=
          spawnRateIncreaseInterval
        ) {
          this.state.lastSpawnRateIncrease = gameTimeElapsed;
          // Reduce spawn interval (spawn more frequently)
          this.state.enemySpawnInterval = Math.max(
            0.3,
            this.state.enemySpawnInterval * 0.9
          ); // 10% faster

          // Restart enemy spawn loops with new interval
          if (this.enemySpawnControllers) {
            // Normal enemies
            this.enemySpawnControllers.normalController.cancel();
            this.enemySpawnControllers.normalController = this.k.loop(
              this.state.enemySpawnInterval,
              () => {
                if (!this.state.isPaused) {
                  spawnEnemy(
                    this.k,
                    this.player,
                    enemySpeed,
                    enemySize,
                    false,
                    false,
                    () => this.state.isPaused,
                    () => ({
                      active: this.state.slowWeaponActive,
                      effectPercentage: this.state.slowEffectPercentage,
                      zoneRadius: this.state.targetingZoneRadius,
                    })
                  );
                }
              }
            );

            // Strong enemies (if they've started spawning)
            if (this.enemySpawnControllers.strongController) {
              this.enemySpawnControllers.strongController.cancel();
              this.enemySpawnControllers.strongController = this.k.loop(
                this.state.enemySpawnInterval,
                () => {
                  if (!this.state.isPaused) {
                    spawnEnemy(
                      this.k,
                      this.player,
                      enemySpeed,
                      enemySize,
                      true,
                      false,
                      () => this.state.isPaused,
                      () => ({
                        active: this.state.slowWeaponActive,
                        effectPercentage: this.state.slowEffectPercentage,
                        zoneRadius: this.state.targetingZoneRadius,
                      })
                    );
                  }
                }
              );
            }

            // Elite enemies (if they've started spawning)
            if (this.enemySpawnControllers.eliteController) {
              this.enemySpawnControllers.eliteController.cancel();
              this.enemySpawnControllers.eliteController = this.k.loop(
                this.state.enemySpawnInterval,
                () => {
                  if (!this.state.isPaused) {
                    spawnEnemy(
                      this.k,
                      this.player,
                      enemySpeed,
                      enemySize,
                      false,
                      true,
                      () => this.state.isPaused,
                      () => ({
                        active: this.state.slowWeaponActive,
                        effectPercentage: this.state.slowEffectPercentage,
                        zoneRadius: this.state.targetingZoneRadius,
                      })
                    );
                  }
                }
              );
            }
          }
        }

        // Check for time up
        if (this.state.gameTime <= 0) {
          this.handlePlayerDeath();
        }
      }

      // Update UI
      updateUI(this.ui, this.state);
    });
  }

  private handleLevelUp(): void {
    this.state.isPaused = true;
    showLevelUpMenu(
      this.k,
      () => {
        this.state.isPaused = false;
      },
      (option: string) => {
        if (option === "fireSpeed") {
          // Increase fire speed (reduce interval)
          this.state.fireInterval = Math.max(
            0.5,
            this.state.fireInterval * 0.7
          ); // 30% faster
          // Cancel old loop and start new one with updated interval
          this.fireLoopController.cancel();
          this.setupAutoFire();
        } else if (option === "projectileCount") {
          // Increase projectile count
          this.state.projectileCount += 1;
        } else if (option === "movementSpeed") {
          // Increase movement speed
          this.state.speed = Math.round(this.state.speed * 1.2); // 20% faster
        } else if (option === "targetingZone") {
          // Increase targeting zone radius
          this.state.targetingZoneRadius = Math.round(
            this.state.targetingZoneRadius * 1.3
          ); // 30% larger
        } else if (option === "projectileBounces") {
          // Increase projectile bounces
          this.state.projectileBounces += 1;
        } else if (option === "slowWeapon") {
          // Activate slow weapon
          this.state.slowWeaponActive = true;
        } else if (option === "slowEffect") {
          // Increase slow effect (if weapon is active)
          if (this.state.slowWeaponActive) {
            this.state.slowEffectPercentage = Math.min(
              80,
              this.state.slowEffectPercentage + 10
            ); // Increase by 10%, max 80%
          }
        } else if (option === "increaseHealth") {
          // Increase max health and restore current health
          this.state.maxHealth += 1;
          this.state.playerHealth += 1; // Also restore health when increasing max
        }
      },
      this.state.slowWeaponActive
    );
  }

  private handlePlayerDeath(): void {
    this.state.isPaused = true;
    showDeathScreen(this.k);
  }

  public start(): void {
    // Game is already running after kaplay initialization
  }

  public stop(): void {
    // Kaplay doesn't have a built-in stop method
    // Could destroy the canvas if needed
  }
}
