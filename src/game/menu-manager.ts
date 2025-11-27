export function showPauseMenu(
  k: ReturnType<typeof import("kaplay").default>
): void {
  // Create pause overlay
  k.add([
    k.rect(k.width(), k.height()),
    k.color(0, 0, 0),
    k.opacity(0.7),
    k.pos(0, 0),
    k.anchor("topleft"),
    k.fixed(),
    k.z(250),
    "pause",
  ]);

  // Pause text
  k.add([
    k.text("PAUSED", { size: 48 }),
    k.color(255, 255, 255),
    k.pos(k.width() / 2, k.height() / 2),
    k.anchor("center"),
    k.fixed(),
    k.z(251),
    "pause",
  ]);

  // Instruction text
  k.add([
    k.text("Press ESC to resume", { size: 20 }),
    k.color(200, 200, 200),
    k.pos(k.width() / 2, k.height() / 2 + 60),
    k.anchor("center"),
    k.fixed(),
    k.z(251),
    "pause",
  ]);
}

export function hidePauseMenu(k: ReturnType<typeof import("kaplay").default>): void {
  // Remove all pause menu elements
  const pauseElements = k.get("pause");
  pauseElements.forEach((elem) => elem.destroy());
}

export function showDeathScreen(k: ReturnType<typeof import("kaplay").default>): void {
  // Create death screen overlay
  k.add([
    k.rect(k.width(), k.height()),
    k.color(0, 0, 0),
    k.opacity(0.8),
    k.pos(0, 0),
    k.anchor("topleft"),
    k.fixed(),
    k.z(300),
  ]);

  // Death message
  k.add([
    k.text("Game Over", { size: 48 }),
    k.color(255, 0, 0),
    k.pos(k.width() / 2, k.height() / 2 - 50),
    k.anchor("center"),
    k.fixed(),
    k.z(301),
  ]);

  // Restart instruction
  k.add([
    k.text("Refresh the page to restart", { size: 24 }),
    k.color(255, 255, 255),
    k.pos(k.width() / 2, k.height() / 2 + 50),
    k.anchor("center"),
    k.fixed(),
    k.z(301),
  ]);
}

