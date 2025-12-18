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

// Game-wide configuration constants
export const GAME_CONFIG = {
  // Upgrade System
  TARGETING_ZONE_UPGRADE_MULTIPLIER: 1.1, // was 1.3 (30%)
  TARGETING_ZONE_MAX_RADIUS: 225,
  XP_ATTRACT_UPGRADE_MULTIPLIER: 1.25,
  XP_ATTRACT_MAX_RADIUS: 200, // always smaller than targeting zone max
  XP_ATTRACT_MAX_FRACTION_OF_TARGETING: 0.8, // keep attraction smaller than targeting zone
  XP_ATTRACT_FIRST_RADIUS: 50,

  // Enemy Configuration
  ENEMY_SPEED: 45, // pixels per second (reduced for better playability)
  ENEMY_SIZE: 24, // size of enemy sprite (24x24, scaled down from 32)

  // Spawn System
  SPAWN_RATE_INCREASE_INTERVAL: 20, // Seconds between spawn rate increases
  HORDE_INTERVAL: 30, // Seconds between horde spawns
  HORDE_BASE_ENEMIES: 15, // Base number of enemies in first horde
  HORDE_ENEMIES_INCREMENT: 5, // Additional enemies per subsequent horde
  HORDE_SPAWN_RADIUS: 400, // Distance from player for horde spawns (circular)
  HORDE_STRONG_ENEMY_CHANCE: 0.3, // 30% chance for strong enemies in horde

  // Combat
  PROJECTILE_DAMAGE: 1, // Base projectile damage
  CRIT_CHANCE: 0.1, // Critical hit chance (10%)
  CRIT_DAMAGE_MULTIPLIER: 2, // Critical hit damage multiplier

  // Player Starting Stats
  PLAYER_START_SPEED: 120,
  PLAYER_START_FIRE_INTERVAL: 0.8, // Faster starting fire rate (was 1.0)
  PLAYER_START_PROJECTILE_COUNT: 1,
  PLAYER_START_TARGETING_ZONE_RADIUS: 110, // Slightly larger starting range (was 100)
  PLAYER_START_XP_ATTRACT_RADIUS: 0,
  PLAYER_START_HEALTH: 2,
  PLAYER_START_MAX_HEALTH: 2,
  PLAYER_START_ENEMY_SPAWN_INTERVAL: 1.5, // Slower initial spawn rate (was 1.0)

  // Weapon Starting Stats
  SLOW_EFFECT_START_PERCENTAGE: 15, // 15% speed reduction by default (reduced from 30%)
  AOE_WEAPON_START_COOLDOWN: 1.5, // Cooldown between AOE attacks (1.5 seconds)

  // XP System
  XP_PER_GEM: 10, // XP gained per gem collected
  XP_LEVEL_UP_BASE: 40, // Base XP for first level-up
  XP_LEVEL_UP_INCREMENT: 15, // XP increment per level (formula: base + (level - 1) * increment)

  // Boss Collision
  BOSS_PUSH_DISTANCE: 50, // Distance boss is pushed back when hitting player

  // Magnet Power-up
  MAGNET_RADIUS: 150, // Magnet power-up attraction radius
  MAGNET_SPEED: 200, // Magnet power-up attraction speed
  XP_ATTRACT_BASE_SPEED: 120, // Base XP attraction speed (passive)

  // Projectile Stats
  PROJECTILE_SPEED: 300, // Projectile speed (pixels per second)
  PROJECTILE_SIZE: 6, // Projectile sprite size

  // Pickup Lifetimes
  HEALTH_POINT_LIFETIME_SECONDS: 20, // Health point despawn time
  XP_LIFETIME_SECONDS: 5, // XP gem despawn time
  POWER_UP_LIFETIME_SECONDS: 20, // Power-up despawn time

  // Pickup Spawn Chances
  HEALTH_SPAWN_CHANCE: 0.01, // 1% chance for normal enemies to drop health
  POWER_UP_SPAWN_CHANCE: 0.02, // 2% chance for normal enemies to drop power-up
  BOSS_HEALTH_SPAWN_CHANCE: 0.5, // 50% chance for bosses to drop health (not guaranteed)
  BOSS_ALWAYS_DROP_POWER_UP: true, // Bosses always drop power-up

  // Enemy Behavior
  BOSS_SPEED_MULTIPLIER: 0.7, // Boss speed multiplier (relative to normal enemies)
  BOSS_SIZE_MULTIPLIER: 2, // Boss size multiplier
  CHARGER_SPEED_MULTIPLIER: 1.5, // Charger enemy speed multiplier
  SEPARATION_FORCE: 50, // Enemy separation force
  SEPARATION_DISTANCE_MULTIPLIER: 1.5, // Separation distance as multiple of enemy size
  CHARGE_SPEED_MULTIPLIER: 3, // Charger charge speed multiplier

  // Visual/Animation Constants
  BOSS_SHAKE_INTENSITY: 8, // Screen shake intensity for boss deaths
  NORMAL_SHAKE_INTENSITY: 3, // Screen shake intensity for normal enemy deaths
  BOSS_SHAKE_DURATION: 0.3, // Screen shake duration for boss deaths
  NORMAL_SHAKE_DURATION: 0.15, // Screen shake duration for normal enemy deaths
  EXPLOSION_RADIUS: 60, // Exploder enemy explosion radius
  SPLITTER_SPAWN_OFFSET: 30, // Distance splitter children spawn from parent
  XP_DROP_MIN_DISTANCE: 20, // Minimum distance for XP drop from enemy
  XP_DROP_MAX_DISTANCE: 50, // Maximum distance for XP drop from enemy

  // Enemy Type Unlocks (seconds elapsed)
  STRONG_ENEMY_UNLOCK: 30, // When strong enemies start spawning
  SPLITTER_ENEMY_UNLOCK: 60, // When splitter enemies start spawning
  EXPLODER_ENEMY_UNLOCK: 90, // When exploder enemies start spawning
  SWARM_ENEMY_UNLOCK: 90, // When swarm enemies start spawning
  ELITE_ENEMY_UNLOCK: 120, // When elite enemies start spawning
  CHARGER_ENEMY_UNLOCK: 150, // When charger enemies start spawning

  // Spawn Rate Multipliers
  SWARM_SPAWN_RATE_MULTIPLIER: 0.5, // Swarm enemies spawn at 2x rate (interval / 2)

  // Screen/Window
  MAX_WINDOW_WIDTH: 1200,
  MAX_WINDOW_HEIGHT: 800,
} as const;

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
    enemySpawnIntervalMultiplier: 0.7, // Spawn 30% faster (was 0.8 = 20% faster)
    bossHealth: 75, // Stronger boss
    bossSpawnInterval: 120, // 1.5 minutes (more frequent)
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
    bossSpawnInterval: 120, // 1 minute (more frequent)
    gameTime: 600, // 10 minutes
  },
  {
    levelNumber: 4,
    name: "Level 4",
    backgroundColor: [22, 44, 34], // Dark teal-green
    backgroundPatternColor: "#1a2f28", // Dark green pattern
    enemySpeedMultiplier: 1.8, // 80% faster
    enemyHealthMultiplier: 2.7, // 170% more health
    enemySpawnIntervalMultiplier: 0.5, // Spawn 50% faster
    bossHealth: 130,
    bossSpawnInterval: 120,
    gameTime: 600, // 10 minutes
  },
  {
    levelNumber: 5,
    name: "Level 5",
    backgroundColor: [52, 42, 24], // Dark amber-brown
    backgroundPatternColor: "#2f2616", // Dark amber pattern
    enemySpeedMultiplier: 2.1, // 110% faster
    enemyHealthMultiplier: 3.5, // 250% more health
    enemySpawnIntervalMultiplier: 0.45, // Spawn 55% faster
    bossHealth: 160,
    bossSpawnInterval: 120,
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
