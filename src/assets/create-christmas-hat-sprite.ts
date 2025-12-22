// Utility to create a Christmas hat sprite programmatically

export function createChristmasHatSprite(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;

  const centerX = 16;
  const hatTopY = 4;
  const hatBottomY = 16;

  // Draw red hat base (cone shape)
  ctx.fillStyle = "#dc143c"; // Crimson red
  ctx.beginPath();
  ctx.moveTo(centerX, hatTopY);
  ctx.lineTo(centerX - 10, hatBottomY);
  ctx.lineTo(centerX + 10, hatBottomY);
  ctx.closePath();
  ctx.fill();

  // Draw white fur trim at bottom
  ctx.fillStyle = "#ffffff"; // White
  ctx.fillRect(centerX - 10, hatBottomY - 2, 20, 4);

  // Draw white pom-pom at top
  ctx.beginPath();
  ctx.arc(centerX, hatTopY, 3, 0, Math.PI * 2);
  ctx.fill();

  // Add some sparkle/glitter effect (small white dots)
  ctx.fillStyle = "#ffff00"; // Yellow for sparkle
  ctx.beginPath();
  ctx.arc(centerX - 4, hatTopY + 4, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(centerX + 4, hatTopY + 6, 1, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toDataURL();
}
