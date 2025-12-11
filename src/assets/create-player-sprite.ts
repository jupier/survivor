// Utility to create a simple player sprite programmatically
// This creates a sprite sheet with 4 directions × 3 frames (idle, walk1, walk2)

type Direction = "up" | "down" | "left" | "right";

function drawPlayerFrame(
  ctx: CanvasRenderingContext2D,
  frameX: number,
  frameY: number,
  direction: Direction,
  legOffset: number,
  armOffset: number
): void {
  const x = frameX * 32;
  const y = frameY * 32;
  const centerX = x + 16; // Center of each 32x32 frame
  const centerY = y + 16; // Center vertically in 32x32 frame

  if (direction === "up") {
    // Back view - no eyes, show back of head and body
    // Draw back of head (hair/head from behind)
    ctx.fillStyle = "#8b4513"; // Brown hair
    ctx.beginPath();
    ctx.arc(centerX, centerY - 6, 6, 0, Math.PI * 2);
    ctx.fill();

    // Draw body from behind (more rounded)
    ctx.fillStyle = "#4a9eff"; // Blue body
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 4, 7, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw arms from behind (swinging, more rounded)
    ctx.fillStyle = "#ffdbac"; // Skin color
    ctx.beginPath();
    ctx.ellipse(centerX - 8, centerY + 2 + armOffset, 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(centerX + 8, centerY + 2 - armOffset, 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw legs from behind (alternating, more rounded)
    ctx.fillStyle = "#2a5a9f"; // Darker blue for legs
    ctx.beginPath();
    ctx.ellipse(centerX - 4, centerY + 13 + legOffset, 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(centerX + 4, centerY + 13 - legOffset, 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (direction === "down") {
    // Front view - with eyes
    // Draw head
    ctx.fillStyle = "#ffdbac"; // Skin color
    ctx.beginPath();
    ctx.arc(centerX, centerY - 6, 6, 0, Math.PI * 2);
    ctx.fill();

    // Draw eyes
    ctx.fillStyle = "#000000";
    ctx.fillRect(centerX - 3, centerY - 8, 2, 2);
    ctx.fillRect(centerX + 1, centerY - 8, 2, 2);

    // Draw body (more rounded)
    ctx.fillStyle = "#4a9eff"; // Blue body
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 4, 7, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw arms (swinging, more rounded)
    ctx.fillStyle = "#ffdbac"; // Skin color
    ctx.beginPath();
    ctx.ellipse(centerX - 8, centerY + 2 + armOffset, 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(centerX + 8, centerY + 2 - armOffset, 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw legs (alternating, more rounded)
    ctx.fillStyle = "#2a5a9f"; // Darker blue for legs
    ctx.beginPath();
    ctx.ellipse(centerX - 4, centerY + 13 + legOffset, 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(centerX + 4, centerY + 13 - legOffset, 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (direction === "left") {
    // Side view - profile facing left
    // Draw head (profile)
    ctx.fillStyle = "#ffdbac"; // Skin color
    ctx.beginPath();
    ctx.arc(centerX - 2, centerY - 6, 6, 0, Math.PI * 2);
    ctx.fill();

    // Draw eye (one eye visible in profile)
    ctx.fillStyle = "#000000";
    ctx.fillRect(centerX - 4, centerY - 8, 2, 2);

    // Draw body (side view, more rounded)
    ctx.fillStyle = "#4a9eff"; // Blue body
    ctx.beginPath();
    ctx.ellipse(centerX - 2, centerY + 4, 5, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw arm (one arm visible, more rounded)
    ctx.fillStyle = "#ffdbac"; // Skin color
    ctx.beginPath();
    ctx.ellipse(centerX - 8, centerY + 2 + armOffset, 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw legs (one in front, more rounded)
    ctx.fillStyle = "#2a5a9f"; // Darker blue for legs
    ctx.beginPath();
    ctx.ellipse(centerX - 4, centerY + 13 + legOffset, 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 13 - legOffset, 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Right - side view - profile facing right
    // Draw head (profile)
    ctx.fillStyle = "#ffdbac"; // Skin color
    ctx.beginPath();
    ctx.arc(centerX + 2, centerY - 6, 6, 0, Math.PI * 2);
    ctx.fill();

    // Draw eye (one eye visible in profile)
    ctx.fillStyle = "#000000";
    ctx.fillRect(centerX + 2, centerY - 8, 2, 2);

    // Draw body (side view, more rounded)
    ctx.fillStyle = "#4a9eff"; // Blue body
    ctx.beginPath();
    ctx.ellipse(centerX + 2, centerY + 4, 5, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw arm (one arm visible, more rounded)
    ctx.fillStyle = "#ffdbac"; // Skin color
    ctx.beginPath();
    ctx.ellipse(centerX + 8, centerY + 2 - armOffset, 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw legs (one in front, more rounded)
    ctx.fillStyle = "#2a5a9f"; // Darker blue for legs
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 13 + legOffset, 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(centerX + 4, centerY + 13 - legOffset, 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function createPlayerSprite(): string {
  // Create a sprite sheet: 3 columns (idle, walk1, walk2) × 4 rows (up, down, left, right)
  const canvas = document.createElement("canvas");
  canvas.width = 96; // 3 frames * 32 pixels
  canvas.height = 128; // 4 directions * 32 pixels
  const ctx = canvas.getContext("2d")!;

  const directions: Direction[] = ["up", "down", "left", "right"];

  directions.forEach((direction, row) => {
    // Frame 0: Idle (no offset)
    drawPlayerFrame(ctx, 0, row, direction, 0, 0);

    // Frame 1: Walk animation - left leg forward, right arm forward
    drawPlayerFrame(ctx, 1, row, direction, -2, -2);

    // Frame 2: Walk animation - right leg forward, left arm forward
    drawPlayerFrame(ctx, 2, row, direction, 2, 2);
  });

  return canvas.toDataURL();
}
