import { GameState } from "./game-state";
import { PowerUpState, PowerUpType } from "./powerup-manager";
import { Z_INDEX } from "./z-index";
import { t } from "./translations";

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
  playerLevelText: any;
  slowWeaponText: any;
  aoeWeaponText: any;
  powerUpContainer: any;
  powerUpTexts: Map<PowerUpType, any>;
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
    k.text(`${t().ui.level}: 1`, { size: 18 }),
    k.color(255, 215, 0), // Gold color
    k.pos(uiPadding, currentY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(Z_INDEX.UI_STATS),
  ]);
  currentY += 25;

  // Timer display (below level)
  const timerText = k.add([
    k.text("10:00", { size: 14 }),
    k.color(255, 255, 255),
    k.pos(uiPadding, currentY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(Z_INDEX.UI_STATS),
  ]);
  currentY += 20;

  // Kills counter (below timer)
  const killsText = k.add([
    k.text(`${t().ui.kills}: 0`, { size: 14 }),
    k.color(255, 255, 255),
    k.pos(uiPadding, currentY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(Z_INDEX.UI_STATS),
  ]);
  currentY += 35;

  // Experience bar background (gray)
  k.add([
    k.rect(barWidth, barHeight),
    k.color(60, 60, 60),
    k.pos(uiPadding, currentY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(Z_INDEX.UI_BACKGROUND),
  ]);

  // Experience bar (blue) - will be updated
  const expBar = k.add([
    k.rect(0, barHeight),
    k.color(74, 158, 255), // Blue color matching player
    k.pos(uiPadding, currentY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(Z_INDEX.UI_BAR),
  ]);

  // Experience label
  k.add([
    k.text(t().ui.xp, { size: 14 }),
    k.color(200, 200, 200),
    k.pos(uiPadding + 5, currentY + barHeight / 2),
    k.anchor("left"),
    k.fixed(),
    k.z(Z_INDEX.UI_TEXT),
  ]);

  // Experience counter (right side of bar) - shows gems needed
  const expCounterText = k.add([
    k.text(`0/5 ${t().ui.gems}`, { size: 12 }),
    k.color(200, 200, 200),
    k.pos(uiPadding + barWidth - 5, currentY + barHeight / 2),
    k.anchor("right"),
    k.fixed(),
    k.z(Z_INDEX.UI_TEXT),
  ]);
  currentY += barHeight + barSpacing;

  // Life bar background (gray)
  k.add([
    k.rect(barWidth, barHeight),
    k.color(60, 60, 60),
    k.pos(uiPadding, currentY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(Z_INDEX.UI_BACKGROUND),
  ]);

  // Life bar (red) - will be updated
  const lifeBar = k.add([
    k.rect(barWidth, barHeight),
    k.color(255, 0, 0), // Red color
    k.pos(uiPadding, currentY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(Z_INDEX.UI_BAR),
  ]);

  // Health label
  k.add([
    k.text(t().ui.hp, { size: 14 }),
    k.color(200, 200, 200),
    k.pos(uiPadding + 5, currentY + barHeight / 2),
    k.anchor("left"),
    k.fixed(),
    k.z(Z_INDEX.UI_TEXT),
  ]);

  // Health counter (right side of bar)
  const healthCounterText = k.add([
    k.text("2/2", { size: 12 }),
    k.color(200, 200, 200),
    k.pos(uiPadding + barWidth - 5, currentY + barHeight / 2),
    k.anchor("right"),
    k.fixed(),
    k.z(Z_INDEX.UI_TEXT),
  ]);
  currentY += barHeight + barSpacing + 10;

  // Player and Weapon Stats (top right)
  const statsX = k.width() - uiPadding - 200;
  let statsY = uiPadding;

  // Stats title
  k.add([
    k.text(t().ui.stats, { size: 18 }),
    k.color(255, 255, 255),
    k.pos(statsX, statsY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(Z_INDEX.UI_STATS),
  ]);
  statsY += 25;

  // Speed stat
  const speedStatText = k.add([
    k.text(`${t().ui.speed}: 120`, { size: 14 }),
    k.color(200, 200, 200),
    k.pos(statsX, statsY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(Z_INDEX.UI_STATS),
  ]);
  statsY += 20;

  // Projectile count stat
  const projectileStatText = k.add([
    k.text(`${t().ui.projectiles}: 1`, { size: 14 }),
    k.color(200, 200, 200),
    k.pos(statsX, statsY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(Z_INDEX.UI_STATS),
  ]);
  statsY += 20;

  // Targeting zone radius stat
  const zoneStatText = k.add([
    k.text(`${t().ui.range}: 150`, { size: 14 }),
    k.color(200, 200, 200),
    k.pos(statsX, statsY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(Z_INDEX.UI_STATS),
  ]);
  statsY += 20;

  // Fire rate stat
  const fireRateStatText = k.add([
    k.text(`${t().ui.fireRate}: 1.0/s`, { size: 14 }),
    k.color(200, 200, 200),
    k.pos(statsX, statsY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(Z_INDEX.UI_STATS),
  ]);
  statsY += 25;

  // Player Level (top right, below stats)
  const playerLevelText = k.add([
    k.text(`${t().ui.playerLevel} 1`, { size: 16 }),
    k.color(255, 215, 0), // Gold color
    k.pos(statsX, statsY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(Z_INDEX.UI_STATS),
  ]);
  statsY += 25;

  // Slow Weapon Level (if active)
  const slowWeaponText = k.add([
    k.text("", { size: 14 }),
    k.color(100, 150, 255), // Light blue
    k.pos(statsX, statsY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(Z_INDEX.UI_STATS),
  ]);
  statsY += 20;

  // AOE Weapon Level (if active)
  const aoeWeaponText = k.add([
    k.text("", { size: 14 }),
    k.color(255, 150, 50), // Orange
    k.pos(statsX, statsY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(Z_INDEX.UI_STATS),
  ]);

  // FPS counter (bottom left)
  const fpsText = k.add([
    k.text(`${t().ui.fps}: 60`, { size: 16 }),
    k.color(150, 255, 150), // Light green color
    k.pos(uiPadding, k.height() - uiPadding),
    k.anchor("botleft"),
    k.fixed(),
    k.z(Z_INDEX.UI_STATS),
  ]);

  // Power-up display will be created dynamically
  // Store the starting Y position for power-up display
  const powerUpStartY = currentY + 10;

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
    playerLevelText,
    slowWeaponText,
    aoeWeaponText,
    powerUpContainer: { pos: { x: uiPadding, y: powerUpStartY } },
    powerUpTexts: new Map(),
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
  ui.expCounterText.text = `${gemsCollected}/${gemsNeeded} ${t().ui.gems}`;

  // Update life bar
  const healthPercentage = Math.max(0, state.playerHealth / state.maxHealth);
  ui.lifeBar.width = barWidth * healthPercentage;
  ui.healthCounterText.text = `${state.playerHealth}/${state.maxHealth}`;

  // Update kills counter
  ui.killsText.text = `${t().ui.kills}: ${state.enemiesKilled}`;

  // Update level display (show game level only)
  ui.levelText.text = `${t().ui.level}: ${state.currentLevel}`;

  // Update stats display
  ui.speedStatText.text = `${t().ui.speed}: ${Math.round(state.speed)}`;
  ui.projectileStatText.text = `${t().ui.projectiles}: ${
    state.projectileCount
  }`;
  ui.zoneStatText.text = `${t().ui.range}: ${state.targetingZoneRadius}`;
  ui.fireRateStatText.text = `${t().ui.fireRate}: ${(
    1 / state.fireInterval
  ).toFixed(1)}/s`;

  // Update player level
  ui.playerLevelText.text = `${t().ui.playerLevel} ${state.playerLevel}`;

  // Update slow weapon level (only show if active)
  if (state.slowWeaponActive) {
    ui.slowWeaponText.text = `${t().ui.slowWeapon}: ${state.slowEffectPercentage}%`;
    ui.slowWeaponText.opacity = 1;
  } else {
    ui.slowWeaponText.opacity = 0;
  }

  // Update AOE weapon level (only show if active)
  if (state.aoeWeaponActive) {
    const aoeSpeed = (1 / state.aoeWeaponCooldown).toFixed(1);
    ui.aoeWeaponText.text = `${t().ui.aoeWeapon}: ${aoeSpeed}/s`;
    ui.aoeWeaponText.opacity = 1;
  } else {
    ui.aoeWeaponText.opacity = 0;
  }
}

export function updatePowerUpDisplay(
  k: ReturnType<typeof import("kaplay").default>,
  ui: UIElements,
  powerUps: PowerUpState
): void {
  const powerUpNames: Record<PowerUpType, string> = {
    speed: t().powerUps.speedBoost,
    magnet: t().powerUps.magnet,
    invincibility: t().powerUps.invincibility,
    damage: t().powerUps.damageBoost,
  };

  const powerUpColors: Record<PowerUpType, [number, number, number]> = {
    speed: [0, 255, 255], // Cyan
    magnet: [255, 0, 255], // Magenta
    invincibility: [255, 255, 0], // Yellow
    damage: [255, 0, 0], // Red
  };

  const currentTime = k.time();
  const lineHeight = 22;
  const startX = ui.powerUpContainer.pos.x;
  const startY = ui.powerUpContainer.pos.y;
  let yOffset = 0;

  // Track which power-ups are currently active
  const activeTypes: Set<PowerUpType> = new Set();

  for (const key in powerUps) {
    const powerUpType = key as PowerUpType;
    const powerUp = powerUps[powerUpType];

    if (powerUp.active && currentTime < powerUp.endTime) {
      activeTypes.add(powerUpType);
      const timeRemaining = powerUp.endTime - currentTime;
      const timeString =
        timeRemaining > 0 ? timeRemaining.toFixed(1) + "s" : "0.0s";

      // Get or create text element for this power-up
      if (!ui.powerUpTexts.has(powerUpType)) {
        const textElement = k.add([
          k.text("", { size: 16 }),
          k.color(...powerUpColors[powerUpType]),
          k.pos(startX, startY + yOffset),
          k.anchor("topleft"),
          k.fixed(),
          k.z(Z_INDEX.UI_POWER_UPS),
        ]);
        ui.powerUpTexts.set(powerUpType, textElement);
      }

      const textElement = ui.powerUpTexts.get(powerUpType);
      textElement.text = `${powerUpNames[powerUpType]}: ${timeString}`;
      textElement.pos.x = startX;
      textElement.pos.y = startY + yOffset;
      textElement.opacity = 1;
      yOffset += lineHeight;
    } else {
      // Hide inactive power-ups
      if (ui.powerUpTexts.has(powerUpType)) {
        const textElement = ui.powerUpTexts.get(powerUpType);
        textElement.opacity = 0;
      }
    }
  }

  // Clean up text elements for power-ups that are no longer active
  for (const [powerUpType, textElement] of ui.powerUpTexts.entries()) {
    if (!activeTypes.has(powerUpType)) {
      textElement.destroy();
      ui.powerUpTexts.delete(powerUpType);
    }
  }
}
