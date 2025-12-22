// Utility to create Christmas decoration sprites programmatically

export function createSnowflakeSprite(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext("2d")!;

  const centerX = 8;
  const centerY = 8;
  const size = 6;

  ctx.strokeStyle = "#ffffff"; // White
  ctx.lineWidth = 1.5;

  // Draw 6-pointed snowflake
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(angle) * size,
      centerY + Math.sin(angle) * size
    );
    ctx.stroke();

    // Add small branches
    const branchAngle1 = angle + Math.PI / 6;
    const branchAngle2 = angle - Math.PI / 6;
    const branchLength = size * 0.4;

    ctx.beginPath();
    ctx.moveTo(
      centerX + Math.cos(angle) * size * 0.6,
      centerY + Math.sin(angle) * size * 0.6
    );
    ctx.lineTo(
      centerX +
        Math.cos(angle) * size * 0.6 +
        Math.cos(branchAngle1) * branchLength,
      centerY +
        Math.sin(angle) * size * 0.6 +
        Math.sin(branchAngle1) * branchLength
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(
      centerX + Math.cos(angle) * size * 0.6,
      centerY + Math.sin(angle) * size * 0.6
    );
    ctx.lineTo(
      centerX +
        Math.cos(angle) * size * 0.6 +
        Math.cos(branchAngle2) * branchLength,
      centerY +
        Math.sin(angle) * size * 0.6 +
        Math.sin(branchAngle2) * branchLength
    );
    ctx.stroke();
  }

  return canvas.toDataURL();
}

export function createOrnamentSprite(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext("2d")!;

  const centerX = 8;
  const centerY = 8;
  const radius = 6;

  // Draw ornament (circle with highlight)
  ctx.fillStyle = "#dc143c"; // Red
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  // Add highlight
  ctx.fillStyle = "#ff6b6b"; // Lighter red
  ctx.beginPath();
  ctx.arc(centerX - 2, centerY - 2, radius * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Add top hook
  ctx.fillStyle = "#ffd700"; // Gold
  ctx.fillRect(centerX - 1, centerY - radius - 2, 2, 3);

  return canvas.toDataURL();
}
