// Utility to create health heart sprite
// Creates a red pulsing heart that represents health points

export function createHealthSprite(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext("2d")!;

  // Clear canvas with transparent background
  ctx.clearRect(0, 0, 16, 16);

  // Heart shape - draw two circles and a triangle
  ctx.fillStyle = "#ff4444"; // Bright red
  ctx.beginPath();

  // Left circle (top left of heart)
  ctx.arc(5, 5, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Right circle (top right of heart)
  ctx.beginPath();
  ctx.arc(11, 5, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Bottom triangle (point of heart)
  ctx.beginPath();
  ctx.moveTo(8, 13);
  ctx.lineTo(2, 8);
  ctx.lineTo(14, 8);
  ctx.closePath();
  ctx.fill();

  // Add highlight (lighter red on top)
  ctx.fillStyle = "#ff6666"; // Lighter red
  ctx.beginPath();
  ctx.arc(5, 5, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(11, 5, 2, 0, Math.PI * 2);
  ctx.fill();

  // Add shine (white highlight)
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(5, 4, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(11, 4, 1, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toDataURL();
}
