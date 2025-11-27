export interface GameState {
  // Player stats
  speed: number;
  fireInterval: number;
  projectileCount: number;
  targetingZoneRadius: number;
  projectileBounces: number;
  
  // Slow weapon (slows enemies in targeting zone)
  slowWeaponActive: boolean;
  slowEffectPercentage: number; // Percentage of speed reduction (0-100)

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
}

export function createInitialGameState(): GameState {
  return {
    speed: 120,
    fireInterval: 1,
    projectileCount: 1,
    targetingZoneRadius: 150,
    projectileBounces: 0,
    slowWeaponActive: false,
    slowEffectPercentage: 30, // 30% speed reduction by default
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
  };
}

