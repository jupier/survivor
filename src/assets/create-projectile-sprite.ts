// Utility to create projectile sprite
// Creates an energy bolt/magic missile sprite

export function createProjectileSprite(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext("2d")!;

  // Clear canvas with transparent background
  ctx.clearRect(0, 0, 16, 16);

  // Outer glow (bright yellow/orange)
  ctx.fillStyle = "#ffaa00"; // Bright orange-yellow
  ctx.beginPath();
  ctx.ellipse(8, 8, 6, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Middle core (brighter yellow)
  ctx.fillStyle = "#ffdd44"; // Bright yellow
  ctx.beginPath();
  ctx.ellipse(8, 8, 4, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Inner core (white hot center)
  ctx.fillStyle = "#ffffff"; // White
  ctx.beginPath();
  ctx.ellipse(8, 8, 2, 1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Add trailing particles/sparks (small dots)
  ctx.fillStyle = "#ffaa00";
  ctx.beginPath();
  ctx.arc(4, 8, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(12, 8, 1, 0, Math.PI * 2);
  ctx.fill();

  // Add glow effect (semi-transparent outer ring)
  ctx.fillStyle = "rgba(255, 200, 0, 0.3)"; // Semi-transparent yellow
  ctx.beginPath();
  ctx.ellipse(8, 8, 7, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toDataURL();
}
