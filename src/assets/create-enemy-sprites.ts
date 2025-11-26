// Utility to create enemy sprites programmatically
// Creates different monster sprites for normal and strong enemies

export function createNormalEnemySprite(): string {
  // Create a sprite for normal enemy (green monster)
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;

  // Clear canvas
  ctx.clearRect(0, 0, 32, 32);

  // Monster body (green, rounded blob shape)
  ctx.fillStyle = "#4ade80"; // Bright green
  ctx.beginPath();
  ctx.ellipse(16, 18, 10, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Monster head (slightly lighter green)
  ctx.fillStyle = "#86efac"; // Light green
  ctx.beginPath();
  ctx.ellipse(16, 10, 8, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (red, menacing)
  ctx.fillStyle = "#ef4444"; // Red
  ctx.beginPath();
  ctx.arc(12, 9, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(20, 9, 2, 0, Math.PI * 2);
  ctx.fill();

  // Eye pupils (black)
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(12, 9, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(20, 9, 1, 0, Math.PI * 2);
  ctx.fill();

  // Mouth (dark green, open)
  ctx.fillStyle = "#16a34a"; // Dark green
  ctx.beginPath();
  ctx.ellipse(16, 13, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Teeth (white)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(14, 12, 1, 2);
  ctx.fillRect(17, 12, 1, 2);

  // Spikes/horns on top (dark green)
  ctx.fillStyle = "#16a34a";
  ctx.beginPath();
  ctx.moveTo(10, 4);
  ctx.lineTo(12, 8);
  ctx.lineTo(10, 8);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(22, 4);
  ctx.lineTo(20, 8);
  ctx.lineTo(22, 8);
  ctx.closePath();
  ctx.fill();

  return canvas.toDataURL();
}

export function createStrongEnemySprite(): string {
  // Create a sprite for strong enemy (yellow monster, larger and more menacing)
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;

  // Clear canvas
  ctx.clearRect(0, 0, 32, 32);

  // Monster body (yellow/orange, larger and more angular)
  ctx.fillStyle = "#fbbf24"; // Golden yellow
  ctx.beginPath();
  ctx.moveTo(16, 6);
  ctx.lineTo(24, 16);
  ctx.lineTo(24, 26);
  ctx.lineTo(8, 26);
  ctx.lineTo(8, 16);
  ctx.closePath();
  ctx.fill();

  // Darker yellow overlay for depth
  ctx.fillStyle = "#f59e0b"; // Darker yellow
  ctx.beginPath();
  ctx.moveTo(16, 6);
  ctx.lineTo(24, 16);
  ctx.lineTo(16, 20);
  ctx.closePath();
  ctx.fill();

  // Head (larger, more angular)
  ctx.fillStyle = "#fde047"; // Light yellow
  ctx.beginPath();
  ctx.moveTo(10, 4);
  ctx.lineTo(22, 4);
  ctx.lineTo(20, 12);
  ctx.lineTo(12, 12);
  ctx.closePath();
  ctx.fill();

  // Eyes (glowing orange, larger)
  ctx.fillStyle = "#ea580c"; // Orange-red
  ctx.beginPath();
  ctx.arc(12, 8, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(20, 8, 3, 0, Math.PI * 2);
  ctx.fill();

  // Eye pupils (black, larger)
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(12, 8, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(20, 8, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Mouth (larger, more menacing)
  ctx.fillStyle = "#dc2626"; // Red
  ctx.beginPath();
  ctx.ellipse(16, 14, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Teeth (larger, more prominent)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(13, 13, 1.5, 3);
  ctx.fillRect(16, 13, 1.5, 3);
  ctx.fillRect(19, 13, 1.5, 3);

  // Spikes/horns on top (larger, more menacing)
  ctx.fillStyle = "#dc2626"; // Red spikes
  ctx.beginPath();
  ctx.moveTo(8, 2);
  ctx.lineTo(11, 6);
  ctx.lineTo(8, 6);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(24, 2);
  ctx.lineTo(21, 6);
  ctx.lineTo(24, 6);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(16, 0);
  ctx.lineTo(18, 5);
  ctx.lineTo(14, 5);
  ctx.closePath();
  ctx.fill();

  // Claws/appendages on sides
  ctx.fillStyle = "#dc2626";
  ctx.fillRect(4, 20, 3, 4);
  ctx.fillRect(25, 20, 3, 4);

  return canvas.toDataURL();
}
