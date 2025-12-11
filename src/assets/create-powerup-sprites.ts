// Utility to create power-up sprites programmatically
// Creates distinct sprites for each power-up type

export function createSpeedPowerUpSprite(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 24;
  canvas.height = 24;
  const ctx = canvas.getContext("2d")!;

  // Clear canvas with transparent background
  ctx.clearRect(0, 0, 24, 24);

  // Lightning bolt shape (cyan)
  ctx.fillStyle = "#00ffff"; // Cyan
  ctx.beginPath();
  // Top part
  ctx.moveTo(12, 2);
  ctx.lineTo(8, 8);
  ctx.lineTo(10, 8);
  ctx.lineTo(6, 16);
  ctx.lineTo(12, 10);
  ctx.lineTo(10, 10);
  ctx.lineTo(16, 22);
  ctx.lineTo(14, 16);
  ctx.lineTo(18, 16);
  ctx.lineTo(12, 2);
  ctx.closePath();
  ctx.fill();

  // Inner highlight (brighter cyan)
  ctx.fillStyle = "#66ffff"; // Light cyan
  ctx.beginPath();
  ctx.moveTo(12, 4);
  ctx.lineTo(9, 8);
  ctx.lineTo(11, 8);
  ctx.lineTo(8, 14);
  ctx.lineTo(12, 9);
  ctx.lineTo(11, 9);
  ctx.lineTo(14, 18);
  ctx.lineTo(13, 15);
  ctx.lineTo(16, 15);
  ctx.lineTo(12, 4);
  ctx.closePath();
  ctx.fill();

  // Glow effect
  ctx.fillStyle = "rgba(0, 255, 255, 0.3)";
  ctx.beginPath();
  ctx.arc(12, 12, 12, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toDataURL();
}

export function createMagnetPowerUpSprite(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 24;
  canvas.height = 24;
  const ctx = canvas.getContext("2d")!;

  // Clear canvas with transparent background
  ctx.clearRect(0, 0, 24, 24);

  // Magnet shape (U-shaped, magenta)
  ctx.fillStyle = "#ff00ff"; // Magenta
  ctx.beginPath();
  // Left vertical bar
  ctx.fillRect(6, 4, 4, 16);
  // Right vertical bar
  ctx.fillRect(14, 4, 4, 16);
  // Top horizontal bar
  ctx.fillRect(6, 4, 12, 4);
  // Bottom curve (U shape)
  ctx.beginPath();
  ctx.arc(12, 16, 6, 0, Math.PI);
  ctx.fill();

  // Inner highlight
  ctx.fillStyle = "#ff66ff"; // Light magenta
  ctx.fillRect(7, 5, 2, 14);
  ctx.fillRect(15, 5, 2, 14);
  ctx.fillRect(7, 5, 10, 2);

  // Magnetic field lines (curved)
  ctx.strokeStyle = "#ff00ff";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(12, 12, 8, 0.3, Math.PI - 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(12, 12, 10, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Glow effect
  ctx.fillStyle = "rgba(255, 0, 255, 0.3)";
  ctx.beginPath();
  ctx.arc(12, 12, 12, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toDataURL();
}

export function createInvincibilityPowerUpSprite(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 24;
  canvas.height = 24;
  const ctx = canvas.getContext("2d")!;

  // Clear canvas with transparent background
  ctx.clearRect(0, 0, 24, 24);

  // Shield shape (yellow/gold)
  ctx.fillStyle = "#ffd700"; // Gold
  ctx.beginPath();
  // Top curve
  ctx.arc(12, 8, 8, Math.PI, 0, false);
  // Left side
  ctx.lineTo(4, 8);
  ctx.lineTo(6, 18);
  // Bottom point
  ctx.lineTo(12, 22);
  // Right side
  ctx.lineTo(18, 18);
  ctx.lineTo(20, 8);
  ctx.closePath();
  ctx.fill();

  // Inner shield (lighter)
  ctx.fillStyle = "#ffed4e"; // Light yellow
  ctx.beginPath();
  ctx.arc(12, 9, 6, Math.PI, 0, false);
  ctx.lineTo(6, 9);
  ctx.lineTo(7, 17);
  ctx.lineTo(12, 20);
  ctx.lineTo(17, 17);
  ctx.lineTo(18, 9);
  ctx.closePath();
  ctx.fill();

  // Cross symbol in center
  ctx.fillStyle = "#ffd700"; // Gold
  ctx.fillRect(10, 11, 4, 2);
  ctx.fillRect(11, 10, 2, 4);

  // Glow effect
  ctx.fillStyle = "rgba(255, 255, 0, 0.3)";
  ctx.beginPath();
  ctx.arc(12, 12, 12, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toDataURL();
}

export function createDamagePowerUpSprite(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 24;
  canvas.height = 24;
  const ctx = canvas.getContext("2d")!;

  // Clear canvas with transparent background
  ctx.clearRect(0, 0, 24, 24);

  // Sword shape (red)
  ctx.fillStyle = "#ff0000"; // Red
  // Blade
  ctx.beginPath();
  ctx.moveTo(12, 2);
  ctx.lineTo(10, 16);
  ctx.lineTo(14, 16);
  ctx.closePath();
  ctx.fill();

  // Hilt
  ctx.fillStyle = "#8b0000"; // Dark red
  ctx.fillRect(9, 16, 6, 3);
  // Cross guard
  ctx.fillRect(7, 14, 10, 2);
  // Pommel
  ctx.fillStyle = "#ff4444"; // Light red
  ctx.beginPath();
  ctx.arc(12, 20, 2, 0, Math.PI * 2);
  ctx.fill();

  // Blade highlight
  ctx.fillStyle = "#ff6666"; // Light red
  ctx.beginPath();
  ctx.moveTo(12, 3);
  ctx.lineTo(11, 15);
  ctx.lineTo(13, 15);
  ctx.closePath();
  ctx.fill();

  // Fire/sparks effect
  ctx.fillStyle = "#ff8800"; // Orange
  ctx.beginPath();
  ctx.arc(8, 4, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(16, 4, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(10, 6, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(14, 6, 1, 0, Math.PI * 2);
  ctx.fill();

  // Glow effect
  ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
  ctx.beginPath();
  ctx.arc(12, 12, 12, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toDataURL();
}
