// Utility to create XP gem sprite
// Creates a glowing blue gem that represents experience points

export function createXPSprite(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext("2d")!;

  // Clear canvas with transparent background
  ctx.clearRect(0, 0, 16, 16);

  // Outer glow (light blue)
  ctx.fillStyle = "#64c8ff"; // Bright light blue
  ctx.beginPath();
  ctx.moveTo(8, 2);
  ctx.lineTo(12, 6);
  ctx.lineTo(12, 10);
  ctx.lineTo(8, 14);
  ctx.lineTo(4, 10);
  ctx.lineTo(4, 6);
  ctx.closePath();
  ctx.fill();

  // Inner gem (darker blue)
  ctx.fillStyle = "#3a9eff"; // Medium blue
  ctx.beginPath();
  ctx.moveTo(8, 4);
  ctx.lineTo(10, 6);
  ctx.lineTo(10, 9);
  ctx.lineTo(8, 12);
  ctx.lineTo(6, 9);
  ctx.lineTo(6, 6);
  ctx.closePath();
  ctx.fill();

  // Highlight (white shine)
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(8, 4);
  ctx.lineTo(9, 6);
  ctx.lineTo(8, 7);
  ctx.closePath();
  ctx.fill();

  // Center bright spot
  ctx.fillStyle = "#a0e0ff"; // Very light blue
  ctx.beginPath();
  ctx.arc(8, 8, 2, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toDataURL();
}

