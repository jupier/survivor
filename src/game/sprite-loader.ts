import { createPlayerSprite } from "../assets/create-player-sprite";
import {
  createNormalEnemySprite,
  createStrongEnemySprite,
  createEliteEnemySprite,
  createSwarmEnemySprite,
} from "../assets/create-enemy-sprites";
import { createBackgroundPattern } from "../assets/create-background-sprite";
import { createXPSprite } from "../assets/create-xp-sprite";
import { createHealthSprite } from "../assets/create-health-sprite";
import { createProjectileSprite } from "../assets/create-projectile-sprite";
import { createTargetingZoneSprite } from "../assets/create-targeting-zone-sprite";

export async function loadAllSprites(
  k: ReturnType<typeof import("kaplay").default>
): Promise<void> {
  // Load player sprite with directional animations
  const spriteDataUrl = createPlayerSprite();
  await k.loadSprite("player", spriteDataUrl, {
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

  // Load enemy sprites
  const normalEnemySpriteUrl = createNormalEnemySprite();
  await k.loadSprite("enemy-normal", normalEnemySpriteUrl);

  const strongEnemySpriteUrl = createStrongEnemySprite();
  await k.loadSprite("enemy-strong", strongEnemySpriteUrl);

  const eliteEnemySpriteUrl = createEliteEnemySprite();
  await k.loadSprite("enemy-elite", eliteEnemySpriteUrl);

  const swarmEnemySpriteUrl = createSwarmEnemySprite();
  await k.loadSprite("enemy-swarm", swarmEnemySpriteUrl);

  // Load other sprites
  const backgroundPatternUrl = createBackgroundPattern();
  await k.loadSprite("background", backgroundPatternUrl);

  const xpSpriteUrl = createXPSprite();
  await k.loadSprite("xp", xpSpriteUrl);

  const healthSpriteUrl = createHealthSprite();
  await k.loadSprite("health", healthSpriteUrl);

  const projectileSpriteUrl = createProjectileSprite();
  await k.loadSprite("projectile", projectileSpriteUrl);

  const targetingZoneSpriteUrl = createTargetingZoneSprite();
  await k.loadSprite("targeting-zone", targetingZoneSpriteUrl);
}

export function createBackground(k: ReturnType<typeof import("kaplay").default>): void {
  const tileSize = 64;
  const tilesX = Math.ceil(k.width() / tileSize) + 1;
  const tilesY = Math.ceil(k.height() / tileSize) + 1;
  for (let x = 0; x < tilesX; x++) {
    for (let y = 0; y < tilesY; y++) {
      k.add([
        k.sprite("background"),
        k.pos(x * tileSize, y * tileSize),
        k.anchor("topleft"),
        k.z(0),
      ]);
    }
  }
}

