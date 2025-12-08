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

export function createSwarmEnemySprite(): string {
  // Create a sprite for swarm enemy (smaller, faster-looking enemy, cyan/teal color)
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;

  // Clear canvas
  ctx.clearRect(0, 0, 32, 32);

  // Monster body (cyan/teal, smaller and more compact)
  ctx.fillStyle = "#06b6d4"; // Cyan
  ctx.beginPath();
  ctx.ellipse(16, 18, 8, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Monster head (lighter cyan)
  ctx.fillStyle = "#67e8f9"; // Light cyan
  ctx.beginPath();
  ctx.ellipse(16, 10, 6, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (bright yellow, alert)
  ctx.fillStyle = "#fbbf24"; // Yellow
  ctx.beginPath();
  ctx.arc(13, 9, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(19, 9, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Eye pupils (black)
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(13, 9, 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(19, 9, 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Mouth (dark cyan, smaller)
  ctx.fillStyle = "#0891b2"; // Dark cyan
  ctx.beginPath();
  ctx.ellipse(16, 13, 3, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Small spikes on top (dark cyan)
  ctx.fillStyle = "#0891b2";
  ctx.beginPath();
  ctx.moveTo(11, 4);
  ctx.lineTo(12, 7);
  ctx.lineTo(11, 7);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(21, 4);
  ctx.lineTo(20, 7);
  ctx.lineTo(21, 7);
  ctx.closePath();
  ctx.fill();

  // Small wings/appendages on sides (for speed look)
  ctx.fillStyle = "#06b6d4";
  ctx.beginPath();
  ctx.moveTo(6, 16);
  ctx.lineTo(10, 14);
  ctx.lineTo(10, 18);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(26, 16);
  ctx.lineTo(22, 14);
  ctx.lineTo(22, 18);
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

export function createEliteEnemySprite(): string {
  // Create a sprite for elite enemy (red/purple monster, 3 HP)
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;

  // Clear canvas
  ctx.clearRect(0, 0, 32, 32);

  // Monster body (red/purple, larger and more menacing)
  ctx.fillStyle = "#dc2626"; // Bright red
  ctx.beginPath();
  ctx.moveTo(16, 4);
  ctx.lineTo(26, 14);
  ctx.lineTo(26, 24);
  ctx.lineTo(6, 24);
  ctx.lineTo(6, 14);
  ctx.closePath();
  ctx.fill();

  // Darker red overlay for depth
  ctx.fillStyle = "#991b1b"; // Darker red
  ctx.beginPath();
  ctx.moveTo(16, 4);
  ctx.lineTo(26, 14);
  ctx.lineTo(16, 18);
  ctx.closePath();
  ctx.fill();

  // Head (larger, more angular)
  ctx.fillStyle = "#ef4444"; // Light red
  ctx.beginPath();
  ctx.moveTo(8, 2);
  ctx.lineTo(24, 2);
  ctx.lineTo(22, 10);
  ctx.lineTo(10, 10);
  ctx.closePath();
  ctx.fill();

  // Eyes (glowing red, larger)
  ctx.fillStyle = "#7c2d12"; // Dark red-orange
  ctx.beginPath();
  ctx.arc(11, 6, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(21, 6, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Eye pupils (black, larger)
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(11, 6, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(21, 6, 2, 0, Math.PI * 2);
  ctx.fill();

  // Eye glow (red)
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.arc(11, 5, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(21, 5, 1, 0, Math.PI * 2);
  ctx.fill();

  // Mouth (larger, more menacing)
  ctx.fillStyle = "#1f2937"; // Dark gray/black
  ctx.beginPath();
  ctx.ellipse(16, 13, 6, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Teeth (larger, more prominent)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(12, 12, 1.5, 4);
  ctx.fillRect(15, 12, 1.5, 4);
  ctx.fillRect(18, 12, 1.5, 4);
  ctx.fillRect(21, 12, 1.5, 4);

  // Spikes/horns on top (larger, more menacing)
  ctx.fillStyle = "#7c2d12"; // Dark red
  ctx.beginPath();
  ctx.moveTo(6, 0);
  ctx.lineTo(9, 4);
  ctx.lineTo(6, 4);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(26, 0);
  ctx.lineTo(23, 4);
  ctx.lineTo(26, 4);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(14, 0);
  ctx.lineTo(16, 3);
  ctx.lineTo(18, 0);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(22, 0);
  ctx.lineTo(24, 3);
  ctx.lineTo(26, 0);
  ctx.closePath();
  ctx.fill();

  // Claws/appendages on sides (larger)
  ctx.fillStyle = "#991b1b";
  ctx.fillRect(2, 18, 4, 6);
  ctx.fillRect(26, 18, 4, 6);

  // Add some purple accents for elite look
  ctx.fillStyle = "#9333ea"; // Purple
  ctx.beginPath();
  ctx.arc(16, 20, 2, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toDataURL();
}

export function createChargerEnemySprite(): string {
  // Create a sprite for charger enemy (orange/red, fast-looking with speed lines)
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;

  // Clear canvas
  ctx.clearRect(0, 0, 32, 32);

  // Monster body (orange, streamlined for speed)
  ctx.fillStyle = "#f97316"; // Orange
  ctx.beginPath();
  ctx.ellipse(16, 18, 9, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  // Streamlined head (pointed forward)
  ctx.fillStyle = "#fb923c"; // Light orange
  ctx.beginPath();
  ctx.moveTo(16, 6);
  ctx.lineTo(22, 12);
  ctx.lineTo(16, 14);
  ctx.lineTo(10, 12);
  ctx.closePath();
  ctx.fill();

  // Eyes (bright red, alert)
  ctx.fillStyle = "#dc2626"; // Red
  ctx.beginPath();
  ctx.arc(13, 10, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(19, 10, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Eye pupils (black)
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(13, 10, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(19, 10, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Speed lines (behind the enemy)
  ctx.strokeStyle = "#f97316";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(4, 14);
  ctx.lineTo(8, 16);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(4, 18);
  ctx.lineTo(8, 18);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(4, 22);
  ctx.lineTo(8, 20);
  ctx.stroke();

  // Legs/appendages (streamlined)
  ctx.fillStyle = "#ea580c"; // Dark orange
  ctx.fillRect(12, 24, 2, 4);
  ctx.fillRect(18, 24, 2, 4);

  return canvas.toDataURL();
}

export function createSplitterEnemySprite(): string {
  // Create a sprite for splitter enemy (blue/cyan with visible segments/cracks)
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;

  // Clear canvas
  ctx.clearRect(0, 0, 32, 32);

  // Monster body (blue, segmented appearance)
  ctx.fillStyle = "#3b82f6"; // Blue
  ctx.beginPath();
  ctx.ellipse(16, 18, 10, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Segmentation lines (cracks showing it can split)
  ctx.strokeStyle = "#1e40af"; // Dark blue
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(16, 8);
  ctx.lineTo(16, 28);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(10, 16);
  ctx.lineTo(22, 16);
  ctx.stroke();

  // Head (two segments)
  ctx.fillStyle = "#60a5fa"; // Light blue
  ctx.beginPath();
  ctx.ellipse(12, 10, 5, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(20, 10, 5, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (one on each segment)
  ctx.fillStyle = "#1e40af"; // Dark blue
  ctx.beginPath();
  ctx.arc(12, 10, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(20, 10, 2, 0, Math.PI * 2);
  ctx.fill();

  // Eye pupils (black)
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(12, 10, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(20, 10, 1, 0, Math.PI * 2);
  ctx.fill();

  // Small cracks/segments on body
  ctx.strokeStyle = "#1e40af";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(8, 20);
  ctx.lineTo(12, 22);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(24, 20);
  ctx.lineTo(20, 22);
  ctx.stroke();

  return canvas.toDataURL();
}

export function createExploderEnemySprite(): string {
  // Create a sprite for exploder enemy (yellow/red, unstable-looking with warning patterns)
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;

  // Clear canvas
  ctx.clearRect(0, 0, 32, 32);

  // Monster body (yellow, unstable blob)
  ctx.fillStyle = "#eab308"; // Yellow
  ctx.beginPath();
  ctx.ellipse(16, 18, 10, 12, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Warning stripes (red)
  ctx.fillStyle = "#dc2626"; // Red
  ctx.fillRect(10, 14, 12, 2);
  ctx.fillRect(10, 18, 12, 2);
  ctx.fillRect(10, 22, 12, 2);

  // Head (slightly off-center for unstable look)
  ctx.fillStyle = "#fde047"; // Light yellow
  ctx.beginPath();
  ctx.ellipse(17, 10, 7, 7, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (red, wide open - warning)
  ctx.fillStyle = "#dc2626"; // Red
  ctx.beginPath();
  ctx.arc(13, 9, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(21, 9, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Eye pupils (black, small - scared/warning look)
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(13, 9, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(21, 9, 1, 0, Math.PI * 2);
  ctx.fill();

  // Explosion sparks/particles around it
  ctx.fillStyle = "#f97316"; // Orange
  ctx.beginPath();
  ctx.arc(6, 12, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(26, 12, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(8, 24, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(24, 24, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Unstable energy lines
  ctx.strokeStyle = "#dc2626";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(4, 16);
  ctx.lineTo(8, 18);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(28, 16);
  ctx.lineTo(24, 18);
  ctx.stroke();

  return canvas.toDataURL();
}

export function createBossEnemySprite(): string {
  // Create a sprite for boss enemy (large, menacing, purple/dark with multiple features)
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;

  // Clear canvas
  ctx.clearRect(0, 0, 32, 32);

  // Main body (large, dark purple)
  ctx.fillStyle = "#7c3aed"; // Purple
  ctx.beginPath();
  ctx.moveTo(16, 2);
  ctx.lineTo(28, 12);
  ctx.lineTo(28, 26);
  ctx.lineTo(4, 26);
  ctx.lineTo(4, 12);
  ctx.closePath();
  ctx.fill();

  // Darker purple overlay for depth
  ctx.fillStyle = "#5b21b6"; // Dark purple
  ctx.beginPath();
  ctx.moveTo(16, 2);
  ctx.lineTo(28, 12);
  ctx.lineTo(16, 16);
  ctx.closePath();
  ctx.fill();

  // Head (large, menacing)
  ctx.fillStyle = "#a78bfa"; // Light purple
  ctx.beginPath();
  ctx.moveTo(6, 0);
  ctx.lineTo(26, 0);
  ctx.lineTo(24, 8);
  ctx.lineTo(8, 8);
  ctx.closePath();
  ctx.fill();

  // Multiple eyes (boss has 3 eyes)
  ctx.fillStyle = "#1e293b"; // Dark gray
  ctx.beginPath();
  ctx.arc(10, 4, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(16, 4, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(22, 4, 3, 0, Math.PI * 2);
  ctx.fill();

  // Eye glows (purple)
  ctx.fillStyle = "#9333ea"; // Bright purple
  ctx.beginPath();
  ctx.arc(10, 3, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(16, 3, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(22, 3, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Large mouth (menacing)
  ctx.fillStyle = "#1f2937"; // Dark gray/black
  ctx.beginPath();
  ctx.ellipse(16, 12, 7, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Large teeth
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(11, 11, 2, 4);
  ctx.fillRect(14, 11, 2, 4);
  ctx.fillRect(17, 11, 2, 4);
  ctx.fillRect(20, 11, 2, 4);

  // Multiple spikes/horns on top
  ctx.fillStyle = "#5b21b6"; // Dark purple
  ctx.beginPath();
  ctx.moveTo(4, 0);
  ctx.lineTo(7, 3);
  ctx.lineTo(4, 3);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(12, 0);
  ctx.lineTo(14, 2);
  ctx.lineTo(12, 2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(20, 0);
  ctx.lineTo(18, 2);
  ctx.lineTo(20, 2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(28, 0);
  ctx.lineTo(25, 3);
  ctx.lineTo(28, 3);
  ctx.closePath();
  ctx.fill();

  // Large claws/appendages on sides
  ctx.fillStyle = "#5b21b6";
  ctx.fillRect(0, 18, 4, 8);
  ctx.fillRect(28, 18, 4, 8);

  // Energy core/glow in center
  ctx.fillStyle = "#c084fc"; // Bright purple
  ctx.beginPath();
  ctx.arc(16, 20, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e879f9"; // Pink-purple
  ctx.beginPath();
  ctx.arc(16, 20, 1.5, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toDataURL();
}
