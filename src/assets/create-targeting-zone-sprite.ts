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

  // Return transparent sprite - no white line
  // The targeting zone will only show through overlays (blue for slow, orange for AOE)
  return canvas.toDataURL();
}
