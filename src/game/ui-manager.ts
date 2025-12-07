import { GameState } from "./game-state";

export interface UIElements {
  levelText: any;
  timerText: any;
  killsText: any;
  expBar: any;
  expCounterText: any;
  lifeBar: any;
  healthCounterText: any;
  speedStatText: any;
  projectileStatText: any;
  zoneStatText: any;
  fireRateStatText: any;
  fpsText: any;
}

export function createUI(
  k: ReturnType<typeof import("kaplay").default>
): UIElements {
  // UI Layout constants
  const uiPadding = 20;
  const barWidth = 250;
  const barHeight = 18;
  const barSpacing = 8;
  let currentY = uiPadding;

  // Level display (top left)
  const levelText = k.add([
    k.text("Level: 1", { size: 24 }),
    k.color(255, 215, 0), // Gold color
    k.pos(uiPadding, currentY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(110),
  ]);
  currentY += 30;

  // Timer display (below level)
  const timerText = k.add([
    k.text("10:00", { size: 20 }),
    k.color(255, 255, 255),
    k.pos(uiPadding, currentY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(110),
  ]);
  currentY += 30;

  // Kills counter (below timer)
  const killsText = k.add([
    k.text("Kills: 0", { size: 20 }),
    k.color(255, 255, 255),
    k.pos(uiPadding, currentY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(110),
  ]);
  currentY += 35;

  // Experience bar background (gray)
  k.add([
    k.rect(barWidth, barHeight),
    k.color(60, 60, 60),
    k.pos(uiPadding, currentY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(101),
  ]);

  // Experience bar (blue) - will be updated
  const expBar = k.add([
    k.rect(0, barHeight),
    k.color(74, 158, 255), // Blue color matching player
    k.pos(uiPadding, currentY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(102),
  ]);

  // Experience label
  k.add([
    k.text("XP", { size: 14 }),
    k.color(200, 200, 200),
    k.pos(uiPadding + 5, currentY + barHeight / 2),
    k.anchor("left"),
    k.fixed(),
    k.z(103),
  ]);

  // Experience counter (right side of bar) - shows gems needed
  const expCounterText = k.add([
    k.text("0/5 gems", { size: 12 }),
    k.color(200, 200, 200),
    k.pos(uiPadding + barWidth - 5, currentY + barHeight / 2),
    k.anchor("right"),
    k.fixed(),
    k.z(103),
  ]);
  currentY += barHeight + barSpacing;

  // Life bar background (gray)
  k.add([
    k.rect(barWidth, barHeight),
    k.color(60, 60, 60),
    k.pos(uiPadding, currentY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(101),
  ]);

  // Life bar (red) - will be updated
  const lifeBar = k.add([
    k.rect(barWidth, barHeight),
    k.color(255, 0, 0), // Red color
    k.pos(uiPadding, currentY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(102),
  ]);

  // Health label
  k.add([
    k.text("HP", { size: 14 }),
    k.color(200, 200, 200),
    k.pos(uiPadding + 5, currentY + barHeight / 2),
    k.anchor("left"),
    k.fixed(),
    k.z(103),
  ]);

  // Health counter (right side of bar)
  const healthCounterText = k.add([
    k.text("2/2", { size: 12 }),
    k.color(200, 200, 200),
    k.pos(uiPadding + barWidth - 5, currentY + barHeight / 2),
    k.anchor("right"),
    k.fixed(),
    k.z(103),
  ]);
  currentY += barHeight + barSpacing + 10;

  // Player and Weapon Stats (top right)
  const statsX = k.width() - uiPadding - 200;
  let statsY = uiPadding;

  // Stats title
  k.add([
    k.text("Stats", { size: 18 }),
    k.color(255, 255, 255),
    k.pos(statsX, statsY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(110),
  ]);
  statsY += 25;

  // Speed stat
  const speedStatText = k.add([
    k.text(`Speed: 120`, { size: 14 }),
    k.color(200, 200, 200),
    k.pos(statsX, statsY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(110),
  ]);
  statsY += 20;

  // Projectile count stat
  const projectileStatText = k.add([
    k.text(`Projectiles: 1`, { size: 14 }),
    k.color(200, 200, 200),
    k.pos(statsX, statsY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(110),
  ]);
  statsY += 20;

  // Targeting zone radius stat
  const zoneStatText = k.add([
    k.text(`Range: 150`, { size: 14 }),
    k.color(200, 200, 200),
    k.pos(statsX, statsY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(110),
  ]);
  statsY += 20;

  // Fire rate stat
  const fireRateStatText = k.add([
    k.text(`Fire Rate: 1.0/s`, { size: 14 }),
    k.color(200, 200, 200),
    k.pos(statsX, statsY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(110),
  ]);
  statsY += 20;

  // FPS counter (bottom left)
  const fpsText = k.add([
    k.text("FPS: 60", { size: 16 }),
    k.color(150, 255, 150), // Light green color
    k.pos(uiPadding, k.height() - uiPadding),
    k.anchor("botleft"),
    k.fixed(),
    k.z(110),
  ]);

  return {
    levelText,
    timerText,
    killsText,
    expBar,
    expCounterText,
    lifeBar,
    healthCounterText,
    speedStatText,
    projectileStatText,
    zoneStatText,
    fireRateStatText,
    fpsText,
  };
}

export function updateUI(ui: UIElements, state: GameState): void {
  const barWidth = 250;

  // Update timer
  const minutes = Math.floor(state.gameTime / 60);
  const seconds = Math.floor(state.gameTime % 60);
  const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  ui.timerText.text = timeString;

  // Update experience bar
  const expPercentage = Math.min(
    state.playerExperience / state.maxExperience,
    1
  );
  ui.expBar.width = barWidth * expPercentage;

  // Calculate gems: each gem gives 10 XP
  const xpPerGem = 10;
  const gemsCollected = Math.floor(state.playerExperience / xpPerGem);
  const gemsNeeded = Math.ceil(state.maxExperience / xpPerGem);
  ui.expCounterText.text = `${gemsCollected}/${gemsNeeded} gems`;

  // Update life bar
  const healthPercentage = Math.max(0, state.playerHealth / state.maxHealth);
  ui.lifeBar.width = barWidth * healthPercentage;
  ui.healthCounterText.text = `${state.playerHealth}/${state.maxHealth}`;

  // Update kills counter
  ui.killsText.text = `Kills: ${state.enemiesKilled}`;

  // Update level display
  ui.levelText.text = `Level: ${state.playerLevel}`;

  // Update stats display
  ui.speedStatText.text = `Speed: ${Math.round(state.speed)}`;
  ui.projectileStatText.text = `Projectiles: ${state.projectileCount}`;
  ui.zoneStatText.text = `Range: ${state.targetingZoneRadius}`;
  ui.fireRateStatText.text = `Fire Rate: ${(1 / state.fireInterval).toFixed(
    1
  )}/s`;
}
