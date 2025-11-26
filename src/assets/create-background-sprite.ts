// Utility to create simple background pattern
// Creates a simple, clean background

export function createBackgroundPattern(): string {
  // Create a simple tile pattern (64x64 tile that can be repeated)
  const tileSize = 64;
  const canvas = document.createElement("canvas");
  canvas.width = tileSize;
  canvas.height = tileSize;
  const ctx = canvas.getContext("2d")!;

  // Simple dark background color
  ctx.fillStyle = "#2a2a3a"; // Dark gray-blue
  ctx.fillRect(0, 0, tileSize, tileSize);

  // Add subtle grid lines for texture (very subtle)
  ctx.strokeStyle = "#1a1a2a"; // Very dark, almost invisible
  ctx.lineWidth = 1;
  
  // Horizontal line
  ctx.beginPath();
  ctx.moveTo(0, tileSize / 2);
  ctx.lineTo(tileSize, tileSize / 2);
  ctx.stroke();
  
  // Vertical line
  ctx.beginPath();
  ctx.moveTo(tileSize / 2, 0);
  ctx.lineTo(tileSize / 2, tileSize);
  ctx.stroke();

  return canvas.toDataURL();
}

