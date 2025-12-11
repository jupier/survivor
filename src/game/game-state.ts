import { PowerUpState, createPowerUpState } from "./powerup-manager";

export interface GameState {
  // Player stats
  speed: number;
  fireInterval: number;
  projectileCount: number;
  targetingZoneRadius: number;

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
    speed: 120,
    fireInterval: 1,
    projectileCount: 1,
    targetingZoneRadius: 100,
    slowWeaponActive: false,
    slowEffectPercentage: 30, // 30% speed reduction by default
    aoeWeaponActive: false,
    aoeWeaponCooldown: 1.5, // Cooldown between AOE attacks (1.5 seconds)
    playerExperience: 0,
    playerLevel: 1,
    maxExperience: 50,
    playerHealth: 2,
    maxHealth: 2,
    gameTime: 600, // 10 minutes
    enemySpawnInterval: 1,
    lastSpawnRateIncrease: 0,
    isPaused: false,
    enemiesKilled: 0,
    currentLevel: 1,
    powerUps: createPowerUpState(),
  };
}
