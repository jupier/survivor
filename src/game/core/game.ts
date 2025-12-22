import kaplay from "kaplay";
import { GameState, createInitialGameState } from "./game-state";
import { loadAllSprites, createBackground } from "../assets/sprite-loader";
import {
  createUI,
  updateUI,
  updatePowerUpDisplay,
  hideUI,
  showUI,
  UIElements,
} from "../ui/ui-manager";
import {
  createPlayer,
  setupPlayerMovement,
  setupPlayerCollisions,
} from "../player/player-manager";
import { setupEnemySpawning, spawnEnemy } from "../enemies/enemy-manager";
import { autoFireAtClosestEnemy } from "../weapons/projectile-manager";
import { setupAOEWeapon } from "../weapons/aoe-weapon-manager";
import { showLevelUpMenu } from "../menu/level-up-manager";
import {
  showPauseMenu,
  hidePauseMenu,
  showDeathScreen,
} from "../menu/menu-manager";
import { spawnXP, spawnHealthPoint } from "../pickups/pickup-manager";
import { loadSounds, SoundManager } from "../sound/sound-manager";
import { showDamageNumber } from "../ui/damage-numbers";
import { spawnPowerUp, updatePowerUps } from "../pickups/powerup-manager";
import { spawnBoss } from "../enemies/enemy-manager";
import { getLevelConfig, LevelConfig, GAME_CONFIG } from "./level-config";
import { t } from "../translation/translations";
import { Z_INDEX } from "../assets/z-index";
import {
  showAdminMenu,
  hideAdminMenu,
  updateAllButtonTexts,
} from "../menu/admin-menu-manager";

// All constants moved to GAME_CONFIG in level-config.ts

export class Game {
  private k!: ReturnType<typeof kaplay>;
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
  private isTransitioning: boolean = false;
  private isAdminMenuOpen: boolean = false;
  private gameStarted: boolean = false;

  constructor(container: HTMLElement, kInstance?: ReturnType<typeof kaplay>) {
    // Use the provided kaplay instance or create a new one
    if (kInstance) {
      this.k = kInstance;
    } else {
      const width = Math.min(window.innerWidth, 1200);
      const height = Math.min(window.innerHeight, 800);
      this.k = kaplay({
        width,
        height,
        root: container,
        background: [42, 42, 52],
      });
    }

    this.state = createInitialGameState();
    // setupGame is async, but we'll call it separately
  }

  public async initialize(): Promise<void> {
    await this.setupGame();
  }

  private enemySpeed = GAME_CONFIG.ENEMY_SPEED;
  private enemySize = GAME_CONFIG.ENEMY_SIZE;
  private currentLevelConfig!: LevelConfig;
  private initialGameTime: number = 600; // Track initial game time for current level
  private bossesKilledThisLevel: number = 0; // Track total bosses killed in current level
  private lastHordeTime: number = 0; // Track last horde spawn time
  private hordeCount: number = 0; // Track number of hordes spawned

  private getLevelMultipliers() {
    return {
      speedMultiplier: this.currentLevelConfig.enemySpeedMultiplier,
      healthMultiplier: this.currentLevelConfig.enemyHealthMultiplier,
    };
  }

  private async setupGame(): Promise<void> {
    // Load language preference from localStorage (done automatically in translations.ts)
    // Language is already loaded when translations module is imported

    // Load all sprites
    await loadAllSprites(this.k);

    // Load sounds
    this.sounds = await loadSounds();

    // Initialize level config
    this.currentLevelConfig = getLevelConfig(this.state.currentLevel);
    this.initialGameTime = this.currentLevelConfig.gameTime;

    // Create background
    createBackground(this.k, this.state.currentLevel);

    // Create player (initially hidden, will be shown when game starts)
    const playerData = createPlayer(this.k);
    this.player = playerData.player;
    this.player.opacity = 0;

    // Create UI (initially hidden, will be shown when game starts)
    this.ui = createUI(this.k);
    hideUI(this.ui);

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
      this.state.enemySpawnInterval *
        this.currentLevelConfig.enemySpawnIntervalMultiplier,
      () => this.state.isPaused,
      () => ({
        active: this.state.slowWeaponActive,
        effectPercentage: this.state.slowEffectPercentage,
        zoneRadius: this.state.targetingZoneRadius,
      }),
      {
        speedMultiplier: this.currentLevelConfig.enemySpeedMultiplier,
        healthMultiplier: this.currentLevelConfig.enemyHealthMultiplier,
      }
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
      if (this.isAdminMenuOpen) {
        return; // Don't pause if admin menu is open
      }
      this.state.isPaused = !this.state.isPaused;
      if (this.state.isPaused) {
        showPauseMenu(this.k, {
          onLanguageChange: () => {
            // Force immediate UI update when language changes
            updateUI(this.ui, this.state);
            updatePowerUpDisplay(this.k, this.ui, this.state.powerUps);
          },
        });
      } else {
        hidePauseMenu(this.k);
      }
    });

    // Handle F2 key to toggle admin menu
    this.k.onKeyPress("f2", () => {
      try {
        if (this.isAdminMenuOpen) {
          hideAdminMenu(this.k);
          this.isAdminMenuOpen = false;
          this.state.isPaused = false;
        } else {
          this.state.isPaused = true;
          this.isAdminMenuOpen = true;
          showAdminMenu(this.k, this.state, {
            onUpgrade: (upgradeType: string) => {
              this.handleAdminUpgrade(upgradeType);
            },
            onLevelChange: (levelNumber: number) => {
              this.handleAdminLevelChange(levelNumber);
            },
            onClose: () => {
              hideAdminMenu(this.k);
              this.isAdminMenuOpen = false;
              this.state.isPaused = false;
            },
          });
        }
      } catch (error) {
        console.error("Error in admin menu toggle:", error);
        // Reset state on error
        this.isAdminMenuOpen = false;
        this.state.isPaused = false;
      }
    });

    // Main game loop (will be started when user clicks start)
    this.setupGameLoop();

    // Spawn enemies of each type for testing
    // this.spawnManyEnemies(50);
  }

  public startGame(): void {
    console.log("startGame() called");
    // Show UI and player
    showUI(this.ui);
    this.player.opacity = 1;

    // Start the game
    this.gameStarted = true;
    this.state.isPaused = false;
    console.log(
      "Game started, gameStarted:",
      this.gameStarted,
      "isPaused:",
      this.state.isPaused
    );
  }

  // Unused test function - kept for potential future testing
  // private spawnManyEnemies(count: number): void {
  //   const enemyTypes = [
  //     { isStrong: false, isElite: false, isSwarm: false }, // Normal
  //     { isStrong: true, isElite: false, isSwarm: false }, // Strong
  //     { isStrong: false, isElite: true, isSwarm: false }, // Elite
  //     { isSwarm: true }, // Swarm (swarm enemies don't need isStrong/isElite)
  //   ];

  //   // Spawn 100 of each type
  //   for (const enemyType of enemyTypes) {
  //     for (let i = 0; i < count; i++) {
  //       const spawnX = Math.random() * this.k.width();
  //       const spawnY = Math.random() * this.k.height();

  //       spawnEnemy(
  //         this.k,
  //         this.player,
  //         this.enemySpeed,
  //         this.enemySize,
  //         enemyType.isStrong || false,
  //         enemyType.isElite || false,
  //         enemyType.isSwarm || false,
  //         () => this.state.isPaused,
  //         () => ({
  //           active: this.state.slowWeaponActive,
  //           effectPercentage: this.state.slowEffectPercentage,
  //           zoneRadius: this.state.targetingZoneRadius,
  //         }),
  //         { x: spawnX, y: spawnY } // Spawn at specific position
  //       );
  //     }
  //   }
  // }

  private setupTargetingZone(): void {
    const baseSpriteSize = 300; // Size of the sprite we created
    const scaleValue = (this.state.targetingZoneRadius * 2) / baseSpriteSize;
    this.targetingZone = this.k.add([
      this.k.sprite("targeting-zone"),
      this.k.pos(this.player.pos.x, this.player.pos.y),
      this.k.anchor("center"),
      this.k.z(Z_INDEX.TARGETING_ZONE),
      this.k.opacity(0.5), // Semi-transparent
      this.k.scale(this.k.vec2(scaleValue, scaleValue)), // Scale to match radius
      "targetingZone",
    ]);

    // Create overlay circle for targeting zone (for slow/AOE weapons)
    this.targetingZoneOverlay = this.k.add([
      this.k.circle(this.state.targetingZoneRadius),
      this.k.color(100, 150, 255), // Blue color for slow weapon
      this.k.pos(this.player.pos.x, this.player.pos.y),
      this.k.anchor("center"),
      this.k.z(Z_INDEX.TARGETING_ZONE_OVERLAY),
      this.k.opacity(0), // Initially invisible
      "targetingZoneOverlay",
    ]);

    // Create orange overlay circle for AOE weapon (initially hidden)
    this.aoeZoneOverlay = this.k.add([
      this.k.circle(this.state.targetingZoneRadius),
      this.k.color(255, 165, 0), // Orange color
      this.k.pos(this.player.pos.x, this.player.pos.y),
      this.k.anchor("center"),
      this.k.z(Z_INDEX.AOE_ZONE_OVERLAY),
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
      const radiusChanged = currentRadius !== lastRadius;

      // Always update positions (player moves every frame)
      this.targetingZone.pos.x = currentX;
      this.targetingZone.pos.y = currentY;

      // Update overlay positions every frame to follow player
      this.targetingZoneOverlay.pos.x = currentX;
      this.targetingZoneOverlay.pos.y = currentY;
      this.aoeZoneOverlay.pos.x = currentX;
      this.aoeZoneOverlay.pos.y = currentY;

      // Only update scale if radius changed
      if (radiusChanged) {
        const newScale = (currentRadius * 2) / baseSpriteSize;
        this.targetingZone.scale = this.k.vec2(newScale, newScale);
      }

      // Update overlay visibility and radius if weapon states or radius changed
      if (
        currentAOEActive !== lastAOEActive ||
        currentSlowActive !== lastSlowActive ||
        radiusChanged
      ) {
        // Update targeting zone - always transparent (no white line)
        this.targetingZone.opacity = 0;

        if (currentAOEActive && currentSlowActive) {
          // Both weapons active - show both overlays
          // Blue overlay (slow) on bottom
          this.targetingZoneOverlay.opacity = 0.2;
          this.targetingZoneOverlay.radius = currentRadius;
          // Orange overlay (AOE) on top
          this.aoeZoneOverlay.opacity = 0.3;
          this.aoeZoneOverlay.radius = currentRadius;
        } else if (currentAOEActive) {
          // Only AOE weapon active
          this.aoeZoneOverlay.opacity = 0.3;
          this.aoeZoneOverlay.radius = currentRadius;
          this.targetingZoneOverlay.opacity = 0;
        } else if (currentSlowActive) {
          // Only slow weapon active
          this.targetingZoneOverlay.opacity = 0.2;
          this.targetingZoneOverlay.radius = currentRadius;
          this.aoeZoneOverlay.opacity = 0;
        } else {
          // No weapons active - hide both overlays
          this.targetingZoneOverlay.opacity = 0;
          this.aoeZoneOverlay.opacity = 0;
        }
        lastAOEActive = currentAOEActive;
        lastSlowActive = currentSlowActive;
      } else {
        // Even if states haven't changed, update radius if it changed (for active overlays)
        if (radiusChanged) {
          if (currentAOEActive) {
            this.aoeZoneOverlay.radius = currentRadius;
          }
          if (currentSlowActive) {
            this.targetingZoneOverlay.radius = currentRadius;
          }
        }
      }

      if (radiusChanged) {
        lastRadius = currentRadius;
      }
    });
  }

  private applyTargetingZoneUpgrade(): void {
    const upgraded = Math.round(
      this.state.targetingZoneRadius *
        GAME_CONFIG.TARGETING_ZONE_UPGRADE_MULTIPLIER
    );
    this.state.targetingZoneRadius = Math.min(
      upgraded,
      GAME_CONFIG.TARGETING_ZONE_MAX_RADIUS
    );
  }

  private applyXPAttractUpgrade(): void {
    const upgraded =
      this.state.xpAttractRadius <= 0
        ? GAME_CONFIG.XP_ATTRACT_FIRST_RADIUS
        : Math.round(
            this.state.xpAttractRadius *
              GAME_CONFIG.XP_ATTRACT_UPGRADE_MULTIPLIER
          );

    const maxAllowed = Math.max(
      0,
      Math.min(
        GAME_CONFIG.XP_ATTRACT_MAX_RADIUS,
        Math.floor(
          this.state.targetingZoneRadius *
            GAME_CONFIG.XP_ATTRACT_MAX_FRACTION_OF_TARGETING
        )
      )
    );

    this.state.xpAttractRadius = Math.min(upgraded, maxAllowed);
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

    const damage = GAME_CONFIG.PROJECTILE_DAMAGE;
    const isCritical = Math.random() < GAME_CONFIG.CRIT_CHANCE;
    const actualDamage = isCritical
      ? damage * GAME_CONFIG.CRIT_DAMAGE_MULTIPLIER
      : damage;

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
          const offsetX = Math.cos(angle) * GAME_CONFIG.SPLITTER_SPAWN_OFFSET;
          const offsetY = Math.sin(angle) * GAME_CONFIG.SPLITTER_SPAWN_OFFSET;
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
            "normal",
            this.getLevelMultipliers()
          );
        }
      } else if (enemyType === "exploder") {
        // Damage nearby enemies
        const allEnemies = this.k.get("enemy");
        const explosionRadius = GAME_CONFIG.EXPLOSION_RADIUS;
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

      // Screen shake on enemy death (more intense for bosses)
      const shakeIntensity =
        enemyType === "boss"
          ? GAME_CONFIG.BOSS_SHAKE_INTENSITY
          : GAME_CONFIG.NORMAL_SHAKE_INTENSITY;
      const shakeDuration =
        enemyType === "boss"
          ? GAME_CONFIG.BOSS_SHAKE_DURATION
          : GAME_CONFIG.NORMAL_SHAKE_DURATION;
      this.shakeScreen(shakeIntensity, shakeDuration);

      // Spawn XP point at enemy position
      spawnXP(this.k, enemy.pos);

      // Boss drops health (chance-based) + extra XP
      if (enemyType === "boss") {
        if (Math.random() < GAME_CONFIG.BOSS_HEALTH_SPAWN_CHANCE) {
          spawnHealthPoint(this.k, enemy.pos);
        }
        // Spawn extra XP
        for (let i = 0; i < 5; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist =
            GAME_CONFIG.XP_DROP_MIN_DISTANCE +
            Math.random() *
              (GAME_CONFIG.XP_DROP_MAX_DISTANCE -
                GAME_CONFIG.XP_DROP_MIN_DISTANCE);
          spawnXP(this.k, {
            x: enemy.pos.x + Math.cos(angle) * dist,
            y: enemy.pos.y + Math.sin(angle) * dist,
          });
        }
        // Boss always drops a power-up
        if (GAME_CONFIG.BOSS_ALWAYS_DROP_POWER_UP) {
          spawnPowerUp(this.k, enemy.pos);
        }
      } else {
        // Rare chance to spawn health point
        if (Math.random() < GAME_CONFIG.HEALTH_SPAWN_CHANCE) {
          spawnHealthPoint(this.k, enemy.pos);
        }
        // Rare chance to spawn power-up
        if (Math.random() < GAME_CONFIG.POWER_UP_SPAWN_CHANCE) {
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

      // Check for boss death and level transition BEFORE untagging
      if (enemyType === "boss") {
        // Check if we should transition to next level
        // Do this before untagging so we can still find the boss in the list
        this.handleBossKilled(enemy);
      }

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
      // Skip updates if game hasn't started yet
      if (!this.gameStarted) {
        return;
      }

      // Skip updates if game is paused (but allow admin menu to stay open)
      if (this.state.isPaused && !this.isAdminMenuOpen) {
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

        // Increase enemy spawn rate every N seconds
        const gameTimeElapsed = this.initialGameTime - this.state.gameTime;
        const spawnRateIncreaseInterval =
          GAME_CONFIG.SPAWN_RATE_INCREASE_INTERVAL;

        // Start enemy types based on game time elapsed (synced with game timer)
        if (this.enemySpawnControllers) {
          // Start strong enemies after N seconds
          if (
            gameTimeElapsed >= GAME_CONFIG.STRONG_ENEMY_UNLOCK &&
            !this.enemySpawnControllers.strongController
          ) {
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
                    "strong",
                    this.getLevelMultipliers()
                  );
                }
              }
            );
          }

          // Start splitter enemies after N seconds
          if (
            gameTimeElapsed >= GAME_CONFIG.SPLITTER_ENEMY_UNLOCK &&
            !this.enemySpawnControllers.splitterController
          ) {
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
                    "splitter",
                    this.getLevelMultipliers()
                  );
                }
              }
            );
          }

          // Start exploder enemies after N seconds
          if (
            gameTimeElapsed >= GAME_CONFIG.EXPLODER_ENEMY_UNLOCK &&
            !this.enemySpawnControllers.exploderController
          ) {
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
                    "exploder",
                    this.getLevelMultipliers()
                  );
                }
              }
            );
          }

          // Start swarm enemy spawning after N seconds
          if (
            gameTimeElapsed >= GAME_CONFIG.SWARM_ENEMY_UNLOCK &&
            !this.enemySpawnControllers.swarmController
          ) {
            const swarmSpawnInterval =
              this.state.enemySpawnInterval *
              GAME_CONFIG.SWARM_SPAWN_RATE_MULTIPLIER;
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
                    }),
                    undefined,
                    undefined,
                    this.getLevelMultipliers()
                  );
                }
              }
            );
          }

          // Start elite enemies after N seconds
          if (
            gameTimeElapsed >= GAME_CONFIG.ELITE_ENEMY_UNLOCK &&
            !this.enemySpawnControllers.eliteController
          ) {
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
                    "elite",
                    this.getLevelMultipliers()
                  );
                }
              }
            );
          }

          // Start charger enemies after N seconds
          if (
            gameTimeElapsed >= GAME_CONFIG.CHARGER_ENEMY_UNLOCK &&
            !this.enemySpawnControllers.chargerController
          ) {
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
                    "charger",
                    this.getLevelMultipliers()
                  );
                }
              }
            );
          }
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
                    "normal",
                    this.getLevelMultipliers()
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
                      "strong",
                      this.getLevelMultipliers()
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
                      "splitter",
                      this.getLevelMultipliers()
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
                      "exploder",
                      this.getLevelMultipliers()
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
                      "elite",
                      this.getLevelMultipliers()
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
                      "charger",
                      this.getLevelMultipliers()
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
                      }),
                      undefined,
                      undefined,
                      this.getLevelMultipliers()
                    );
                  }
                }
              );
            }
          }
        }

        // Spawn horde every 30 seconds
        const hordeInterval = 30;
        if (gameTimeElapsed - this.lastHordeTime >= hordeInterval) {
          this.lastHordeTime = gameTimeElapsed;
          this.hordeCount++;
          this.spawnHorde();
        }

        // Spawn bosses based on level config
        // All bosses spawn at the same time: Level 1 = 1 boss, Level 2 = 2 bosses, etc.
        if (!(this as any).lastBossSpawnTime) {
          (this as any).lastBossSpawnTime = 0;
        }
        const bossSpawnInterval = this.currentLevelConfig.bossSpawnInterval;
        const bossesNeededForLevel = this.state.currentLevel; // Level 1 = 1 boss, Level 2 = 2 bosses, etc.

        // Count current alive bosses
        const allEnemies = this.k.get("enemy");
        const aliveBosses = allEnemies.filter(
          (e: any) => (e as any).enemyType === "boss" && !(e as any).isDying
        );
        const currentBossCount = aliveBosses.length;

        // Spawn all bosses at once if:
        // - No bosses are currently alive
        // - We haven't killed enough bosses yet for this level
        // - Enough time has passed
        if (
          currentBossCount === 0 &&
          this.bossesKilledThisLevel < bossesNeededForLevel &&
          gameTimeElapsed >= bossSpawnInterval &&
          gameTimeElapsed - (this as any).lastBossSpawnTime >= bossSpawnInterval
        ) {
          (this as any).lastBossSpawnTime = gameTimeElapsed;

          // Spawn all bosses for this level at the same time
          const bossesToSpawn =
            bossesNeededForLevel - this.bossesKilledThisLevel;
          for (let i = 0; i < bossesToSpawn; i++) {
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
              }),
              this.currentLevelConfig.bossHealth,
              {
                speedMultiplier: this.currentLevelConfig.enemySpeedMultiplier,
                healthMultiplier: this.currentLevelConfig.enemyHealthMultiplier,
              }
            );
          }
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
                this.ui.fpsText.text = `${t().ui.fps}: ${fps}`;
              }
              // Update enemy count
              const enemies = this.k.get("enemy");
              const enemyCount = enemies.length;
              if (this.ui && this.ui.enemyCountText) {
                this.ui.enemyCountText.text = `Enemies: ${enemyCount}`;
              }

              // Update enemies-in-range count (targets inside the AOE/targeting radius)
              const px = this.player?.pos?.x ?? 0;
              const py = this.player?.pos?.y ?? 0;
              const r = this.state.targetingZoneRadius;
              const r2 = r * r;
              let inRangeCount = 0;
              for (const e of enemies) {
                const dx = e.pos.x - px;
                const dy = e.pos.y - py;
                if (dx * dx + dy * dy <= r2) {
                  inRangeCount++;
                }
              }
              if (this.ui && this.ui.enemiesInRangeText) {
                this.ui.enemiesInRangeText.text = `In range: ${inRangeCount}`;
              }

              // Debug counts to spot which object type grows over time
              if (this.ui && this.ui.debugCountsText) {
                const projectileCount = this.k.get("projectile").length;
                const powerUpCount = this.k.get("powerUp").length;
                const healthPointCount = this.k.get("healthPoint").length;
                const damageNumberCount = this.k.get("damageNumber").length;
                this.ui.debugCountsText.text =
                  `proj: ${projectileCount}  pu: ${powerUpCount}  ` +
                  `hp: ${healthPointCount}  dmg: ${damageNumberCount}`;
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
        updateUI(this.ui, this.state, this.k.time());
        updatePowerUpDisplay(this.k, this.ui, this.state.powerUps);
        (this as any).lastUIUpdateTime = currentTime;
      }
    });
  }

  private spawnHorde(): void {
    // Calculate horde size based on horde count
    const hordeSize =
      GAME_CONFIG.HORDE_BASE_ENEMIES +
      (this.hordeCount - 1) * GAME_CONFIG.HORDE_ENEMIES_INCREMENT;

    // Spawn distance from player (far but visible)
    const spawnRadius = GAME_CONFIG.HORDE_SPAWN_RADIUS;

    // Get player position
    const playerX = this.player.pos.x;
    const playerY = this.player.pos.y;

    // Spawn mix of normal and strong enemies
    for (let i = 0; i < hordeSize; i++) {
      const isStrong = Math.random() < GAME_CONFIG.HORDE_STRONG_ENEMY_CHANCE;

      // Calculate position in circle around player
      const angle = (Math.PI * 2 * i) / hordeSize; // Evenly distribute around circle
      const spawnX = playerX + Math.cos(angle) * spawnRadius;
      const spawnY = playerY + Math.sin(angle) * spawnRadius;

      spawnEnemy(
        this.k,
        this.player,
        this.enemySpeed,
        this.enemySize,
        isStrong,
        false,
        false,
        () => this.state.isPaused,
        () => ({
          active: this.state.slowWeaponActive,
          effectPercentage: this.state.slowEffectPercentage,
          zoneRadius: this.state.targetingZoneRadius,
        }),
        { x: spawnX, y: spawnY },
        isStrong ? "strong" : "normal",
        this.getLevelMultipliers()
      );
    }

    // Optional: Show horde warning message
    // You could add a visual indicator here
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
            0.2, // Increased max fire rate (was 0.5, now 0.2 = 5 shots/sec max)
            this.state.fireInterval * 0.85 // Reduced upgrade strength (was 0.7 = 30% faster, now 0.85 = 15% faster)
          );
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
          this.applyTargetingZoneUpgrade();
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
        } else if (option === "xpMagnet") {
          // Passive XP attraction radius
          this.applyXPAttractUpgrade();
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

  private handleBossKilled(_dyingBoss: any): void {
    // Increment boss kill counter for this level
    this.bossesKilledThisLevel++;

    // Check if we've killed enough bosses to advance
    const bossesNeededForLevel = this.state.currentLevel;

    if (this.bossesKilledThisLevel >= bossesNeededForLevel) {
      // Killed enough bosses, transition to next level
      if (!this.isTransitioning) {
        this.isTransitioning = true;
        // Small delay to ensure death animation starts before transition
        this.k.wait(0.3, () => {
          this.transitionToNextLevel();
        });
      }
    }
  }

  private transitionToNextLevel(): void {
    const nextLevel = this.state.currentLevel + 1;
    const nextLevelConfig = getLevelConfig(nextLevel);

    // Check if next level exists
    if (nextLevelConfig.levelNumber === this.state.currentLevel) {
      // No more levels, stay on current level
      this.isTransitioning = false;
      return;
    }

    // Update level
    this.state.currentLevel = nextLevel;
    this.currentLevelConfig = nextLevelConfig;

    // Reset game time for new level
    this.state.gameTime = nextLevelConfig.gameTime;
    this.initialGameTime = nextLevelConfig.gameTime;
    (this as any).lastBossSpawnTime = 0;
    this.state.lastSpawnRateIncrease = 0;
    this.bossesKilledThisLevel = 0; // Reset boss kill counter for new level
    this.lastHordeTime = 0; // Reset horde timer for new level
    this.hordeCount = 0; // Reset horde count for new level

    // Reset enemy spawn interval based on level
    this.state.enemySpawnInterval =
      1 * nextLevelConfig.enemySpawnIntervalMultiplier;

    // Change background (async, but we'll continue)
    createBackground(this.k, this.state.currentLevel);

    // Clear all existing enemies
    const allEnemies = this.k.get("enemy");
    for (const enemy of allEnemies) {
      enemy.destroy();
    }

    // Clear all XP items
    const allXP = this.k.get("xp");
    for (const xp of allXP) {
      xp.destroy();
    }

    // Clear all health points
    const allHealthPoints = this.k.get("healthPoint");
    for (const healthPoint of allHealthPoints) {
      healthPoint.destroy();
    }

    // Clear all projectiles
    const allProjectiles = this.k.get("projectile");
    for (const projectile of allProjectiles) {
      projectile.destroy();
    }

    // Clear all power-ups
    const allPowerUps = this.k.get("powerUp");
    for (const powerUp of allPowerUps) {
      powerUp.destroy();
    }

    // Restart enemy spawning with new level multipliers
    if (this.enemySpawnControllers) {
      // Cancel all existing controllers
      if (this.enemySpawnControllers.normalController)
        this.enemySpawnControllers.normalController.cancel();
      if (this.enemySpawnControllers.strongController)
        this.enemySpawnControllers.strongController.cancel();
      if (this.enemySpawnControllers.eliteController)
        this.enemySpawnControllers.eliteController.cancel();
      if (this.enemySpawnControllers.swarmController)
        this.enemySpawnControllers.swarmController.cancel();
      if (this.enemySpawnControllers.chargerController)
        this.enemySpawnControllers.chargerController.cancel();
      if (this.enemySpawnControllers.splitterController)
        this.enemySpawnControllers.splitterController.cancel();
      if (this.enemySpawnControllers.exploderController)
        this.enemySpawnControllers.exploderController.cancel();
    }

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
      }),
      {
        speedMultiplier: this.currentLevelConfig.enemySpeedMultiplier,
        healthMultiplier: this.currentLevelConfig.enemyHealthMultiplier,
      }
    );

    // Show level transition message
    this.showLevelTransitionMessage(nextLevelConfig.name);

    // Reset transition flag after a delay
    this.k.wait(3, () => {
      this.isTransitioning = false;
    });
  }

  private showLevelTransitionMessage(levelName: string): void {
    // Create overlay
    const overlay = this.k.add([
      this.k.rect(this.k.width(), this.k.height()),
      this.k.color(0, 0, 0),
      this.k.opacity(0.7),
      this.k.pos(0, 0),
      this.k.anchor("topleft"),
      this.k.fixed(),
      this.k.z(Z_INDEX.LEVEL_TRANSITION_OVERLAY),
    ]);

    // Level name text
    const levelText = this.k.add([
      this.k.text(levelName, { size: 48 }),
      this.k.color(255, 215, 0), // Gold
      this.k.pos(this.k.width() / 2, this.k.height() / 2 - 30),
      this.k.anchor("center"),
      this.k.fixed(),
      this.k.z(Z_INDEX.LEVEL_TRANSITION_TEXT),
    ]);

    // Transition message
    const messageText = this.k.add([
      this.k.text(t().levelTransition.complete, { size: 24 }),
      this.k.color(255, 255, 255),
      this.k.pos(this.k.width() / 2, this.k.height() / 2 + 30),
      this.k.anchor("center"),
      this.k.fixed(),
      this.k.z(Z_INDEX.LEVEL_TRANSITION_TEXT),
    ]);

    // Fade out after 2 seconds
    this.k.wait(2, () => {
      this.k
        .tween(
          (overlay as any).opacity ?? 1,
          0,
          0.5,
          (val) => {
            (overlay as any).opacity = val;
            (levelText as any).opacity = val;
            (messageText as any).opacity = val;
          },
          this.k.easings.easeOutQuad
        )
        .onEnd(() => {
          if (overlay.exists()) overlay.destroy();
          if (levelText.exists()) levelText.destroy();
          if (messageText.exists()) messageText.destroy();
        });
    });
  }

  private handleAdminUpgrade(upgradeType: string): void {
    try {
      if (upgradeType === "speed") {
        this.state.speed = Math.round(this.state.speed * 1.2); // 20% faster
      } else if (upgradeType === "fireSpeed") {
        this.state.fireInterval = Math.max(0.2, this.state.fireInterval * 0.85); // 15% faster, max 0.2s interval
        // Cancel old loop and start new one with updated interval
        if (this.fireLoopController) {
          try {
            this.fireLoopController.cancel();
          } catch (e) {
            // Controller might already be cancelled
          }
        }
        this.setupAutoFire();
      } else if (upgradeType === "projectileCount") {
        this.state.projectileCount += 1;
      } else if (upgradeType === "targetingZone") {
        this.applyTargetingZoneUpgrade();
        // Update targeting zone visual
        if (this.targetingZone && this.targetingZone.exists()) {
          const baseSpriteSize = 300;
          const newScale =
            (this.state.targetingZoneRadius * 2) / baseSpriteSize;
          this.targetingZone.scale = this.k.vec2(newScale, newScale);
        }
      } else if (upgradeType === "increaseHealth") {
        this.state.maxHealth += 1;
        this.state.playerHealth += 1; // Also restore health
      } else if (upgradeType === "slowWeapon") {
        this.state.slowWeaponActive = !this.state.slowWeaponActive;
      } else if (upgradeType === "slowEffect") {
        if (this.state.slowWeaponActive) {
          this.state.slowEffectPercentage = Math.min(
            80,
            this.state.slowEffectPercentage + 10
          ); // Increase by 10%, max 80%
        }
      } else if (upgradeType === "aoeWeapon") {
        this.state.aoeWeaponActive = !this.state.aoeWeaponActive;
      } else if (upgradeType === "aoeSpeed") {
        this.state.aoeWeaponCooldown = Math.max(
          0.1,
          this.state.aoeWeaponCooldown * 0.8
        ); // 20% faster
      }
    } catch (error) {
      console.error("Error applying admin upgrade:", error);
    }

    // Refresh admin menu to show updated values
    // For conditional buttons (slowEffect, aoeSpeed), we need to recreate the menu
    // For other buttons, just update the text
    if (this.isAdminMenuOpen) {
      // Check if we need to recreate menu (when slow/aoe weapons are toggled)
      const needsRecreate =
        upgradeType === "slowWeapon" || upgradeType === "aoeWeapon";

      if (needsRecreate) {
        // Recreate menu to show/hide conditional buttons
        hideAdminMenu(this.k);
        this.k.wait(0.05, () => {
          if (this.isAdminMenuOpen) {
            showAdminMenu(this.k, this.state, {
              onUpgrade: (upgradeType: string) => {
                this.handleAdminUpgrade(upgradeType);
              },
              onLevelChange: (levelNumber: number) => {
                this.handleAdminLevelChange(levelNumber);
              },
              onClose: () => {
                hideAdminMenu(this.k);
                this.isAdminMenuOpen = false;
                this.state.isPaused = false;
              },
            });
          }
        });
      } else {
        // Just update button texts
        updateAllButtonTexts(this.state);
      }
    }
  }

  private handleAdminLevelChange(levelNumber: number): void {
    if (levelNumber === this.state.currentLevel) {
      return; // Already on this level
    }

    // Prevent multiple transitions
    if (this.isTransitioning) {
      return;
    }

    this.isTransitioning = true;
    this.state.currentLevel = levelNumber;
    this.currentLevelConfig = getLevelConfig(levelNumber);
    this.initialGameTime = this.currentLevelConfig.gameTime;

    // Reset game time for new level
    this.state.gameTime = this.currentLevelConfig.gameTime;
    (this as any).lastBossSpawnTime = 0;
    this.state.lastSpawnRateIncrease = 0;

    // Reset enemy spawn interval based on level
    this.state.enemySpawnInterval =
      1 * this.currentLevelConfig.enemySpawnIntervalMultiplier;

    // Change background
    createBackground(this.k, this.state.currentLevel);

    // Clear all existing enemies
    const allEnemies = this.k.get("enemy");
    for (const enemy of allEnemies) {
      enemy.destroy();
    }

    // Clear all XP items
    const allXP = this.k.get("xp");
    for (const xp of allXP) {
      xp.destroy();
    }

    // Clear all health points
    const allHealthPoints = this.k.get("healthPoint");
    for (const healthPoint of allHealthPoints) {
      healthPoint.destroy();
    }

    // Clear all projectiles
    const allProjectiles = this.k.get("projectile");
    for (const projectile of allProjectiles) {
      projectile.destroy();
    }

    // Clear all power-ups
    const allPowerUps = this.k.get("powerUp");
    for (const powerUp of allPowerUps) {
      powerUp.destroy();
    }

    // Restart enemy spawning with new level multipliers
    if (this.enemySpawnControllers) {
      // Cancel all existing controllers
      if (this.enemySpawnControllers.normalController)
        this.enemySpawnControllers.normalController.cancel();
      if (this.enemySpawnControllers.strongController)
        this.enemySpawnControllers.strongController.cancel();
      if (this.enemySpawnControllers.eliteController)
        this.enemySpawnControllers.eliteController.cancel();
      if (this.enemySpawnControllers.swarmController)
        this.enemySpawnControllers.swarmController.cancel();
      if (this.enemySpawnControllers.chargerController)
        this.enemySpawnControllers.chargerController.cancel();
      if (this.enemySpawnControllers.splitterController)
        this.enemySpawnControllers.splitterController.cancel();
      if (this.enemySpawnControllers.exploderController)
        this.enemySpawnControllers.exploderController.cancel();
    }

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
      }),
      {
        speedMultiplier: this.currentLevelConfig.enemySpeedMultiplier,
        healthMultiplier: this.currentLevelConfig.enemyHealthMultiplier,
      }
    );

    // Close admin menu and reset transition flag
    hideAdminMenu(this.k);
    this.isAdminMenuOpen = false;
    this.state.isPaused = false;
    this.isTransitioning = false;
  }

  private shakeScreen(intensity: number, duration: number): void {
    // Create screen shake effect by moving camera
    const shakeCount = Math.floor(duration * 60); // 60 updates per second
    let currentShake = 0;

    const shakeTimer = this.k.loop(1 / 60, () => {
      if (currentShake >= shakeCount) {
        shakeTimer.cancel();
        // Reset camera
        this.k.camPos(this.k.width() / 2, this.k.height() / 2);
        return;
      }

      // Random shake offset
      const shakeX = (Math.random() - 0.5) * intensity;
      const shakeY = (Math.random() - 0.5) * intensity;

      // Apply shake with decay
      const progress = currentShake / shakeCount;
      const decay = 1 - progress; // Fade out over time
      this.k.camPos(
        this.k.width() / 2 + shakeX * decay,
        this.k.height() / 2 + shakeY * decay
      );

      currentShake++;
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
