// Utility to create a game logo programmatically
// Creates a bold, action-themed logo for the Mini Survivor game

export function createLogo(): string {
  const canvas = document.createElement("canvas");
  // Create a larger canvas for the logo (suitable for display)
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  // Clear canvas with transparent background
  ctx.clearRect(0, 0, 512, 256);

  // Background gradient (dark, menacing)
  const gradient = ctx.createLinearGradient(0, 0, 512, 256);
  gradient.addColorStop(0, "#1a1a2e");
  gradient.addColorStop(0.5, "#16213e");
  gradient.addColorStop(1, "#0f3460");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 256);

  // Add some subtle texture/dots in background
  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw "MINI SURVIVOR" text with bold, game-style font
  ctx.font = "bold 72px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Text shadow for depth
  ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 4;

  // Main text gradient (red to orange, menacing)
  const textGradient = ctx.createLinearGradient(100, 100, 412, 156);
  textGradient.addColorStop(0, "#ef4444"); // Red
  textGradient.addColorStop(0.5, "#f97316"); // Orange
  textGradient.addColorStop(1, "#dc2626"); // Dark red
  ctx.fillStyle = textGradient;
  ctx.fillText("MINI SURVIVOR", 256, 128);

  // Add outline/stroke for emphasis
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.strokeText("MINI SURVIVOR", 256, 128);

  // Reset shadow
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Add decorative elements - monster eyes on sides
  // Left eye
  ctx.fillStyle = "#ef4444"; // Red
  ctx.beginPath();
  ctx.arc(80, 128, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(80, 128, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(75, 123, 4, 0, Math.PI * 2);
  ctx.fill();

  // Right eye
  ctx.fillStyle = "#ef4444"; // Red
  ctx.beginPath();
  ctx.arc(432, 128, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(432, 128, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(427, 123, 4, 0, Math.PI * 2);
  ctx.fill();

  // Add some particle effects or sparks around the text
  ctx.fillStyle = "#fbbf24"; // Gold/yellow
  for (let i = 0; i < 20; i++) {
    const angle = (Math.PI * 2 * i) / 20;
    const radius = 180;
    const x = 256 + Math.cos(angle) * radius;
    const y = 128 + Math.sin(angle) * radius;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Add a subtle border/frame
  ctx.strokeStyle = "rgba(255, 200, 0, 0.3)";
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, 492, 236);

  return canvas.toDataURL();
}

// Create a smaller icon version (for favicon, etc.)
export function createLogoIcon(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;

  // Clear canvas
  ctx.clearRect(0, 0, 128, 128);

  // Background
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "#1a1a2e");
  gradient.addColorStop(1, "#0f3460");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  // Draw "S" in the center
  ctx.font = "bold 80px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Text gradient
  const textGradient = ctx.createLinearGradient(30, 30, 98, 98);
  textGradient.addColorStop(0, "#ef4444");
  textGradient.addColorStop(1, "#f97316");
  ctx.fillStyle = textGradient;
  ctx.fillText("S", 64, 64);

  // Outline
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3;
  ctx.strokeText("S", 64, 64);

  // Add monster eye above
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(64, 30, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(64, 30, 5, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toDataURL();
}
