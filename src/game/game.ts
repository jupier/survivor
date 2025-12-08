import kaplay from "kaplay";
import { GameState, createInitialGameState } from "./game-state";
import { loadAllSprites, createBackground } from "./sprite-loader";
import {
  createUI,
  updateUI,
  updatePowerUpDisplay,
  UIElements,
} from "./ui-manager";
import {
  createPlayer,
  setupPlayerMovement,
  setupPlayerCollisions,
} from "./player-manager";
import { setupEnemySpawning, spawnEnemy } from "./enemy-manager";
import { autoFireAtClosestEnemy } from "./projectile-manager";
import { setupAOEWeapon } from "./aoe-weapon-manager";
import { showLevelUpMenu } from "./level-up-manager";
import { showPauseMenu, hidePauseMenu, showDeathScreen } from "./menu-manager";
import { spawnXP, spawnHealthPoint } from "./pickup-manager";
import { loadSounds, SoundManager } from "./sound-manager";
import { showDamageNumber } from "./damage-numbers";
import { spawnPowerUp, updatePowerUps } from "./powerup-manager";
import { spawnBoss } from "./enemy-manager";

export class Game {
  private k: ReturnType<typeof kaplay>;
  private state: GameState;
  private ui!: UIElements; // Initialized in setupGame
  private player: any;
  private enemySpawnControllers: {
    normalController: any;
    strongController: any;
    eliteController: any;
    swarmController: any;
    chargerController: any;
    splitterController: any;
    exploderController: any;
  } | null = null;
  private fireLoopController: any = null;
  private targetingZone: any = null;
  private targetingZoneOverlay: any = null; // Blue overlay when slow weapon is active
  private aoeZoneOverlay: any = null; // Orange overlay when AOE weapon is active
  private aoeWeapon: {
    update: () => void;
    triggerAnimation: () => void;
  } | null = null;
  private sounds!: SoundManager;

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

  private enemySpeed = 45; // pixels per second (reduced for better playability)
  private enemySize = 24; // size of enemy sprite (24x24, scaled down from 32)

  private async setupGame(): Promise<void> {
    // Load all sprites
    await loadAllSprites(this.k);

    // Load sounds
    this.sounds = await loadSounds();

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
      () => this.state.isPaused,
      this.state.powerUps
    );

    // Setup player collisions
    setupPlayerCollisions(
      this.k,
      this.player,
      this.state,
      {
        onHealthChange: (newHealth: number) => {
          this.state.playerHealth = newHealth;
        },
        onExperienceGain: () => {
          // Sound is played in collision handler
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
      },
      {
        onPlayerHit: () => {
          this.sounds.playPlayerHit();
        },
        onXPCollect: () => {
          this.sounds.playXPCollect();
        },
        onHealthCollect: () => {
          this.sounds.playHealthCollect();
        },
      },
      this.state.powerUps
    );

    // Setup enemy spawning
    this.enemySpawnControllers = setupEnemySpawning(
      this.k,
      this.player,
      this.enemySpeed,
      this.enemySize,
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

    // Setup AOE weapon
    this.aoeWeapon = setupAOEWeapon(
      this.k,
      this.player,
      () => ({
        aoeWeaponActive: this.state.aoeWeaponActive,
        aoeWeaponCooldown: this.state.aoeWeaponCooldown,
        targetingZoneRadius: this.state.targetingZoneRadius,
        isPaused: this.state.isPaused,
      }),
      (enemy: any) => {
        this.handleEnemyHit(enemy);
      },
      () => {
        // Trigger animation when AOE weapon hits
        this.animateAOEHit();
      },
      () => {
        // Play AOE activate sound
        this.sounds.playAOEActivate();
      }
    );

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
    this.setupGameLoop();

    // Spawn enemies of each type for testing
    // this.spawnManyEnemies(50);
  }

  private spawnManyEnemies(count: number): void {
    const enemyTypes = [
      { isStrong: false, isElite: false, isSwarm: false }, // Normal
      { isStrong: true, isElite: false, isSwarm: false }, // Strong
      { isStrong: false, isElite: true, isSwarm: false }, // Elite
      { isSwarm: true }, // Swarm (swarm enemies don't need isStrong/isElite)
    ];

    // Spawn 100 of each type
    for (const enemyType of enemyTypes) {
      for (let i = 0; i < count; i++) {
        const spawnX = Math.random() * this.k.width();
        const spawnY = Math.random() * this.k.height();

        spawnEnemy(
          this.k,
          this.player,
          this.enemySpeed,
          this.enemySize,
          enemyType.isStrong || false,
          enemyType.isElite || false,
          enemyType.isSwarm || false,
          () => this.state.isPaused,
          () => ({
            active: this.state.slowWeaponActive,
            effectPercentage: this.state.slowEffectPercentage,
            zoneRadius: this.state.targetingZoneRadius,
          }),
          { x: spawnX, y: spawnY } // Spawn at specific position
        );
      }
    }
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

    // Create orange overlay circle for AOE weapon (initially hidden)
    this.aoeZoneOverlay = this.k.add([
      this.k.circle(this.state.targetingZoneRadius),
      this.k.color(255, 165, 0), // Orange color
      this.k.pos(this.player.pos.x, this.player.pos.y),
      this.k.anchor("center"),
      this.k.z(48), // Just below the blue overlay
      this.k.opacity(0), // Initially invisible
      "aoeZoneOverlay",
    ]);

    // Update position and scale to follow player and match current radius
    // Cache values to avoid recalculating every frame
    let lastRadius = this.state.targetingZoneRadius;
    let lastAOEActive = this.state.aoeWeaponActive;
    let lastSlowActive = this.state.slowWeaponActive;

    this.targetingZone.onUpdate(() => {
      const currentX = this.player.pos.x;
      const currentY = this.player.pos.y;
      const currentRadius = this.state.targetingZoneRadius;
      const currentAOEActive = this.state.aoeWeaponActive;
      const currentSlowActive = this.state.slowWeaponActive;

      // Always update positions (player moves every frame)
      this.targetingZone.pos.x = currentX;
      this.targetingZone.pos.y = currentY;

      // Update overlay positions every frame to follow player
      this.targetingZoneOverlay.pos.x = currentX;
      this.targetingZoneOverlay.pos.y = currentY;
      this.aoeZoneOverlay.pos.x = currentX;
      this.aoeZoneOverlay.pos.y = currentY;

      // Only update scale if radius changed
      if (currentRadius !== lastRadius) {
        const newScale = (currentRadius * 2) / baseSpriteSize;
        this.targetingZone.scale = this.k.vec2(newScale, newScale);
        lastRadius = currentRadius;
      }

      // Update overlay visibility and radius if weapon states or radius changed
      if (
        currentAOEActive !== lastAOEActive ||
        currentSlowActive !== lastSlowActive ||
        currentRadius !== lastRadius
      ) {
        if (currentAOEActive) {
          // Show orange overlay for AOE weapon
          this.aoeZoneOverlay.opacity = 0.15;
          this.aoeZoneOverlay.radius = currentRadius;
          // Hide blue overlay
          this.targetingZoneOverlay.opacity = 0;
          // Reduce white zone opacity
          this.targetingZone.opacity = 0.3;
        } else if (currentSlowActive) {
          // Show blue overlay for slow weapon
          this.targetingZoneOverlay.opacity = 0.2;
          this.targetingZoneOverlay.radius = currentRadius;
          // Hide orange overlay
          this.aoeZoneOverlay.opacity = 0;
          // Reduce white zone opacity
          this.targetingZone.opacity = 0.3;
        } else {
          // Hide both overlays
          this.targetingZoneOverlay.opacity = 0;
          this.aoeZoneOverlay.opacity = 0;
          // Normal white zone opacity
          this.targetingZone.opacity = 0.5;
        }
        lastAOEActive = currentAOEActive;
        lastSlowActive = currentSlowActive;
      } else {
        // Even if states haven't changed, update radius if it changed (for active overlays)
        if (currentRadius !== lastRadius) {
          if (currentAOEActive) {
            this.aoeZoneOverlay.radius = currentRadius;
          } else if (currentSlowActive) {
            this.targetingZoneOverlay.radius = currentRadius;
          }
        }
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
          (enemy: any) => {
            this.handleEnemyHit(enemy);
          },
          () => this.state.isPaused,
          () => this.sounds.playProjectileFire()
        );
      }
    });
  }

  private handleEnemyHit(enemy: any): void {
    // Reduce enemy health
    if (!(enemy as any).health) {
      (enemy as any).health = 1;
    }

    const damage = 1;
    const isCritical = Math.random() < 0.1; // 10% crit chance
    const actualDamage = isCritical ? 2 : damage;

    (enemy as any).health -= actualDamage;

    // Show damage number
    showDamageNumber(this.k, enemy.pos, actualDamage, isCritical);

    // Play hit sound
    if ((enemy as any).health > 0) {
      this.sounds.playEnemyHit();
    }

    // Check if enemy is dead
    if ((enemy as any).health <= 0) {
      // Handle special enemy types
      const enemyType = (enemy as any).enemyType;

      if (enemyType === "splitter") {
        // Spawn 2 smaller enemies
        for (let i = 0; i < 2; i++) {
          const angle = (Math.PI * 2 * i) / 2;
          const offsetX = Math.cos(angle) * 30;
          const offsetY = Math.sin(angle) * 30;
          spawnEnemy(
            this.k,
            this.player,
            this.enemySpeed,
            this.enemySize,
            false,
            false,
            false,
            () => this.state.isPaused,
            () => ({
              active: this.state.slowWeaponActive,
              effectPercentage: this.state.slowEffectPercentage,
              zoneRadius: this.state.targetingZoneRadius,
            }),
            { x: enemy.pos.x + offsetX, y: enemy.pos.y + offsetY },
            "normal"
          );
        }
      } else if (enemyType === "exploder") {
        // Damage nearby enemies
        const allEnemies = this.k.get("enemy");
        const explosionRadius = 60;
        for (const otherEnemy of allEnemies) {
          if (otherEnemy === enemy) continue;
          const dx = otherEnemy.pos.x - enemy.pos.x;
          const dy = otherEnemy.pos.y - enemy.pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < explosionRadius) {
            (otherEnemy as any).health -= 1;
            showDamageNumber(this.k, otherEnemy.pos, 1, false);
          }
        }
      }

      // Play death sound
      this.sounds.playEnemyDeath();

      // Spawn XP point at enemy position
      spawnXP(this.k, enemy.pos);

      // Boss drops guaranteed health + extra XP
      if (enemyType === "boss") {
        spawnHealthPoint(this.k, enemy.pos);
        // Spawn extra XP
        for (let i = 0; i < 5; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 20 + Math.random() * 30;
          spawnXP(this.k, {
            x: enemy.pos.x + Math.cos(angle) * dist,
            y: enemy.pos.y + Math.sin(angle) * dist,
          });
        }
        // Boss always drops a power-up
        spawnPowerUp(this.k, enemy.pos);
      } else {
        // Rare chance to spawn health point (10% chance)
        if (Math.random() < 0.1) {
          spawnHealthPoint(this.k, enemy.pos);
        }
        // 5% chance to spawn power-up
        if (Math.random() < 0.05) {
          spawnPowerUp(this.k, enemy.pos);
        }
      }

      // Increment kill counter
      this.state.enemiesKilled++;

      // Simple death animation: fade out and scale down
      const deathDuration = 0.2; // 0.2 seconds
      const originalScale = enemy.scale.x;
      const originalOpacity = enemy.opacity ?? 1;

      // Disable enemy movement during death animation
      // Don't remove area component as it causes collision system errors
      (enemy as any).isDying = true;

      // Remove enemy tag to prevent collisions during death animation
      enemy.untag("enemy");

      // Animate scale down and fade out
      this.k
        .tween(
          enemy.scale.x,
          0,
          deathDuration,
          (val) => {
            enemy.scale = this.k.vec2(val, val);
            const progress = 1 - val / originalScale;
            enemy.opacity = originalOpacity * (1 - progress);
          },
          this.k.easings.easeInQuad
        )
        .onEnd(() => {
          enemy.destroy();
        });
    }
  }

  private setupGameLoop(): void {
    this.k.onUpdate(() => {
      // Skip updates if game is paused
      if (this.state.isPaused) {
        return;
      }

      // Update AOE weapon
      if (this.aoeWeapon) {
        this.aoeWeapon.update();
      }

      // Update power-ups
      updatePowerUps(this.k, this.state.powerUps);

      // Update timer
      if (this.state.gameTime > 0) {
        this.state.gameTime -= this.k.dt();
        if (this.state.gameTime < 0) {
          this.state.gameTime = 0;
        }

        // Increase enemy spawn rate every 15 seconds
        const gameTimeElapsed = 600 - this.state.gameTime;
        const spawnRateIncreaseInterval = 15;

        // Start swarm enemy spawning after 90 seconds
        if (
          gameTimeElapsed >= 90 &&
          this.enemySpawnControllers &&
          !this.enemySpawnControllers.swarmController
        ) {
          const swarmSpawnInterval = this.state.enemySpawnInterval / 2; // Double the spawn rate
          this.enemySpawnControllers.swarmController = this.k.loop(
            swarmSpawnInterval,
            () => {
              if (!this.state.isPaused) {
                spawnEnemy(
                  this.k,
                  this.player,
                  this.enemySpeed,
                  this.enemySize,
                  false,
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
            // Normal enemies (only normal type)
            this.enemySpawnControllers.normalController.cancel();
            this.enemySpawnControllers.normalController = this.k.loop(
              this.state.enemySpawnInterval,
              () => {
                if (!this.state.isPaused) {
                  spawnEnemy(
                    this.k,
                    this.player,
                    this.enemySpeed,
                    this.enemySize,
                    false,
                    false,
                    false,
                    () => this.state.isPaused,
                    () => ({
                      active: this.state.slowWeaponActive,
                      effectPercentage: this.state.slowEffectPercentage,
                      zoneRadius: this.state.targetingZoneRadius,
                    }),
                    undefined,
                    "normal"
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
                      this.enemySpeed,
                      this.enemySize,
                      true,
                      false,
                      false,
                      () => this.state.isPaused,
                      () => ({
                        active: this.state.slowWeaponActive,
                        effectPercentage: this.state.slowEffectPercentage,
                        zoneRadius: this.state.targetingZoneRadius,
                      }),
                      undefined,
                      "strong"
                    );
                  }
                }
              );
            }

            // Splitter enemies (if they've started spawning)
            if (this.enemySpawnControllers.splitterController) {
              this.enemySpawnControllers.splitterController.cancel();
              this.enemySpawnControllers.splitterController = this.k.loop(
                this.state.enemySpawnInterval * 2,
                () => {
                  if (!this.state.isPaused) {
                    spawnEnemy(
                      this.k,
                      this.player,
                      this.enemySpeed,
                      this.enemySize,
                      false,
                      false,
                      false,
                      () => this.state.isPaused,
                      () => ({
                        active: this.state.slowWeaponActive,
                        effectPercentage: this.state.slowEffectPercentage,
                        zoneRadius: this.state.targetingZoneRadius,
                      }),
                      undefined,
                      "splitter"
                    );
                  }
                }
              );
            }

            // Exploder enemies (if they've started spawning)
            if (this.enemySpawnControllers.exploderController) {
              this.enemySpawnControllers.exploderController.cancel();
              this.enemySpawnControllers.exploderController = this.k.loop(
                this.state.enemySpawnInterval * 2,
                () => {
                  if (!this.state.isPaused) {
                    spawnEnemy(
                      this.k,
                      this.player,
                      this.enemySpeed,
                      this.enemySize,
                      false,
                      false,
                      false,
                      () => this.state.isPaused,
                      () => ({
                        active: this.state.slowWeaponActive,
                        effectPercentage: this.state.slowEffectPercentage,
                        zoneRadius: this.state.targetingZoneRadius,
                      }),
                      undefined,
                      "exploder"
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
                      this.enemySpeed,
                      this.enemySize,
                      false,
                      true,
                      false,
                      () => this.state.isPaused,
                      () => ({
                        active: this.state.slowWeaponActive,
                        effectPercentage: this.state.slowEffectPercentage,
                        zoneRadius: this.state.targetingZoneRadius,
                      }),
                      undefined,
                      "elite"
                    );
                  }
                }
              );
            }

            // Charger enemies (if they've started spawning)
            if (this.enemySpawnControllers.chargerController) {
              this.enemySpawnControllers.chargerController.cancel();
              this.enemySpawnControllers.chargerController = this.k.loop(
                this.state.enemySpawnInterval * 1.5,
                () => {
                  if (!this.state.isPaused) {
                    spawnEnemy(
                      this.k,
                      this.player,
                      this.enemySpeed,
                      this.enemySize,
                      false,
                      false,
                      false,
                      () => this.state.isPaused,
                      () => ({
                        active: this.state.slowWeaponActive,
                        effectPercentage: this.state.slowEffectPercentage,
                        zoneRadius: this.state.targetingZoneRadius,
                      }),
                      undefined,
                      "charger"
                    );
                  }
                }
              );
            }

            // Swarm enemies (if they've started spawning)
            if (this.enemySpawnControllers.swarmController) {
              this.enemySpawnControllers.swarmController.cancel();
              const swarmSpawnInterval = this.state.enemySpawnInterval / 2; // Double the spawn rate
              this.enemySpawnControllers.swarmController = this.k.loop(
                swarmSpawnInterval,
                () => {
                  if (!this.state.isPaused) {
                    spawnEnemy(
                      this.k,
                      this.player,
                      this.enemySpeed,
                      this.enemySize,
                      false,
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

        // Spawn boss every 2 minutes (120 seconds)
        if (!(this as any).lastBossSpawnTime) {
          (this as any).lastBossSpawnTime = 0;
        }
        if (
          gameTimeElapsed >= 120 &&
          gameTimeElapsed - (this as any).lastBossSpawnTime >= 120
        ) {
          (this as any).lastBossSpawnTime = gameTimeElapsed;
          spawnBoss(
            this.k,
            this.player,
            this.enemySpeed,
            this.enemySize,
            () => this.state.isPaused,
            () => ({
              active: this.state.slowWeaponActive,
              effectPercentage: this.state.slowEffectPercentage,
              zoneRadius: this.state.targetingZoneRadius,
            })
          );
        }

        // Check for time up
        if (this.state.gameTime <= 0) {
          this.handlePlayerDeath();
        }
      }

      // Update FPS counter
      const currentTime = this.k.time();
      if (!(this as any).lastFPSUpdateTime) {
        (this as any).lastFPSUpdateTime = currentTime;
        (this as any).fpsFrameCount = 0;
        (this as any).fpsAccumulator = 0;
      }

      const dt = this.k.dt();
      if (dt > 0) {
        (this as any).fpsFrameCount++;
        (this as any).fpsAccumulator += dt;

        // Update FPS display every 0.1 seconds
        if (currentTime - (this as any).lastFPSUpdateTime >= 0.1) {
          const frameCount = (this as any).fpsFrameCount;
          if (frameCount > 0) {
            const avgFrameTime = (this as any).fpsAccumulator / frameCount;
            if (avgFrameTime > 0) {
              const fps = Math.round(1 / avgFrameTime);
              if (this.ui && this.ui.fpsText) {
                this.ui.fpsText.text = `FPS: ${fps}`;
              }
            }
          }
          (this as any).fpsFrameCount = 0;
          (this as any).fpsAccumulator = 0;
          (this as any).lastFPSUpdateTime = currentTime;
        }
      }

      // Update UI (throttle to every 0.1 seconds for better performance)
      if (!(this as any).lastUIUpdateTime) {
        (this as any).lastUIUpdateTime = currentTime;
      }
      if (currentTime - (this as any).lastUIUpdateTime >= 0.1) {
        updateUI(this.ui, this.state);
        updatePowerUpDisplay(this.k, this.ui, this.state.powerUps);
        (this as any).lastUIUpdateTime = currentTime;
      }
    });
  }

  private handleLevelUp(): void {
    // Play level up sound
    this.sounds.playLevelUp();

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
        } else if (option === "aoeWeapon") {
          // Activate AOE weapon
          this.state.aoeWeaponActive = true;
        } else if (option === "aoeSpeed") {
          // Reduce AOE cooldown (increase attack speed)
          this.state.aoeWeaponCooldown = Math.max(
            0.5,
            this.state.aoeWeaponCooldown * 0.8
          ); // 20% faster
        }
      },
      this.state.slowWeaponActive,
      this.state.aoeWeaponActive
    );
  }

  private animateAOEHit(): void {
    if (!this.aoeZoneOverlay) {
      return;
    }

    // Create a pulse animation: scale up and fade out
    const originalRadius = this.state.targetingZoneRadius;
    const originalOpacity = this.aoeZoneOverlay.opacity;

    // Pulse effect: scale up to 1.2x and increase opacity, then return
    this.k
      .tween(
        this.aoeZoneOverlay.radius,
        originalRadius * 1.2,
        0.1,
        (val) => {
          this.aoeZoneOverlay.radius = val;
          this.aoeZoneOverlay.opacity = Math.min(0.8, originalOpacity + 0.3);
        },
        this.k.easings.easeOutQuad
      )
      .onEnd(() => {
        // Return to original size and opacity
        this.k.tween(
          this.aoeZoneOverlay.radius,
          originalRadius,
          0.2,
          (val) => {
            this.aoeZoneOverlay.radius = val;
            this.aoeZoneOverlay.opacity = originalOpacity;
          },
          this.k.easings.easeInQuad
        );
      });
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
