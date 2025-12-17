import { PowerUpState, createPowerUpState } from "../pickups/powerup-manager";
import { GAME_CONFIG } from "./level-config";

export interface GameState {
  // Player stats
  speed: number;
  fireInterval: number;
  projectileCount: number;
  targetingZoneRadius: number;
  xpAttractRadius: number;

  // Slow weapon (slows enemies in targeting zone)
  slowWeaponActive: boolean;
  slowEffectPercentage: number; // Percentage of speed reduction (0-100)

  // AOE weapon (hits all enemies in targeting zone)
  aoeWeaponActive: boolean;
  aoeWeaponCooldown: number; // Cooldown between attacks (in seconds)

  // Player progression
  playerExperience: number;
  playerLevel: number;
  maxExperience: number;
  playerHealth: number;
  maxHealth: number;

  // Game timing
  gameTime: number;
  enemySpawnInterval: number;
  lastSpawnRateIncrease: number;

  // Game status
  isPaused: boolean;
  enemiesKilled: number;

  // Level system
  currentLevel: number;

  // Power-ups
  powerUps: PowerUpState;
}

export function createInitialGameState(): GameState {
  return {
    speed: GAME_CONFIG.PLAYER_START_SPEED,
    fireInterval: GAME_CONFIG.PLAYER_START_FIRE_INTERVAL,
    projectileCount: GAME_CONFIG.PLAYER_START_PROJECTILE_COUNT,
    targetingZoneRadius: GAME_CONFIG.PLAYER_START_TARGETING_ZONE_RADIUS,
    xpAttractRadius: GAME_CONFIG.PLAYER_START_XP_ATTRACT_RADIUS,
    slowWeaponActive: false,
    slowEffectPercentage: GAME_CONFIG.SLOW_EFFECT_START_PERCENTAGE,
    aoeWeaponActive: false,
    aoeWeaponCooldown: GAME_CONFIG.AOE_WEAPON_START_COOLDOWN,
    playerExperience: 0,
    playerLevel: 1,
    maxExperience: GAME_CONFIG.XP_LEVEL_UP_BASE,
    playerHealth: GAME_CONFIG.PLAYER_START_HEALTH,
    maxHealth: GAME_CONFIG.PLAYER_START_MAX_HEALTH,
    gameTime: 600, // 10 minutes (from level config)
    enemySpawnInterval: GAME_CONFIG.PLAYER_START_ENEMY_SPAWN_INTERVAL,
    lastSpawnRateIncrease: 0,
    isPaused: false,
    enemiesKilled: 0,
    currentLevel: 1,
    powerUps: createPowerUpState(),
  };
}
