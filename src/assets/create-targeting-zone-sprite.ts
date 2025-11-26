// Utility to create targeting zone circle sprite
// Creates a simple white circle outline

export function createTargetingZoneSprite(): string {
  const canvas = document.createElement("canvas");
  // Make it large enough to scale down, or we'll scale it in the game
  const size = 300; // Large size for better quality when scaled
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Clear canvas with transparent background
  ctx.clearRect(0, 0, size, size);

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 2; // Leave some margin

  // Draw dotted circle outline
  const segments = 64; // Number of segments for smooth circle
  const dashLength = 8; // Length of each dash
  const gapLength = 6; // Length of gap between dashes
  const dashPattern = dashLength + gapLength;

  ctx.strokeStyle = "#ffffff"; // White color
  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  for (let i = 0; i < segments; i++) {
    const angle1 = (i / segments) * Math.PI * 2;
    const angle2 = ((i + 1) / segments) * Math.PI * 2;

    const dashIndex = Math.floor((i * dashPattern) / segments);
    const isDash = (dashIndex * dashPattern) % dashPattern < dashLength;

    if (isDash) {
      const x1 = centerX + Math.cos(angle1) * radius;
      const y1 = centerY + Math.sin(angle1) * radius;
      const x2 = centerX + Math.cos(angle2) * radius;
      const y2 = centerY + Math.sin(angle2) * radius;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  return canvas.toDataURL();
}

