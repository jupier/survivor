// Level configuration system for easy extensibility

export interface LevelConfig {
  levelNumber: number;
  name: string;
  backgroundColor: [number, number, number]; // RGB color for background
  backgroundPatternColor: string; // Hex color for background pattern
  enemySpeedMultiplier: number; // Multiplier for base enemy speed
  enemyHealthMultiplier: number; // Multiplier for enemy health
  enemySpawnIntervalMultiplier: number; // Multiplier for spawn intervals (lower = faster)
  bossHealth: number; // Boss health for this level
  bossSpawnInterval: number; // Seconds between boss spawns
  gameTime: number; // Game time in seconds for this level
}

export const LEVEL_CONFIGS: LevelConfig[] = [
  {
    levelNumber: 1,
    name: "Level 1",
    backgroundColor: [42, 42, 52], // Dark blue-gray
    backgroundPatternColor: "#2a2a3a", // Dark gray-blue
    enemySpeedMultiplier: 1.0,
    enemyHealthMultiplier: 1.0,
    enemySpawnIntervalMultiplier: 1.0,
    bossHealth: 50,
    bossSpawnInterval: 120, // 2 minutes
    gameTime: 600, // 10 minutes
  },
  {
    levelNumber: 2,
    name: "Level 2",
    backgroundColor: [52, 32, 32], // Darker red-gray
    backgroundPatternColor: "#3a2a2a", // Darker red-gray pattern
    enemySpeedMultiplier: 1.2, // 20% faster
    enemyHealthMultiplier: 1.5, // 50% more health
    enemySpawnIntervalMultiplier: 0.8, // Spawn 20% faster
    bossHealth: 75, // Stronger boss
    bossSpawnInterval: 90, // 1.5 minutes (more frequent)
    gameTime: 600, // 10 minutes
  },
  {
    levelNumber: 3,
    name: "Level 3",
    backgroundColor: [32, 32, 52], // Dark purple-gray
    backgroundPatternColor: "#2a2a3a", // Dark purple-gray pattern
    enemySpeedMultiplier: 1.5, // 50% faster
    enemyHealthMultiplier: 2.0, // 100% more health
    enemySpawnIntervalMultiplier: 0.6, // Spawn 40% faster
    bossHealth: 100, // Even stronger boss
    bossSpawnInterval: 60, // 1 minute (more frequent)
    gameTime: 600, // 10 minutes
  },
  // Future levels can be added here easily
];

export function getLevelConfig(levelNumber: number): LevelConfig {
  const config = LEVEL_CONFIGS.find((l) => l.levelNumber === levelNumber);
  if (!config) {
    // Return last level config if level doesn't exist
    return LEVEL_CONFIGS[LEVEL_CONFIGS.length - 1];
  }
  return config;
}
