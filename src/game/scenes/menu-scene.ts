import { showHomeScreen } from "../menu/home-screen";
import { loadAllSprites, createBackground } from "../assets/sprite-loader";
import { Z_INDEX } from "../assets/z-index";

export function createMenuScene(
  k: ReturnType<typeof import("kaplay").default>
) {
  k.scene("menu", async () => {
    // Load sprites
    await loadAllSprites(k);

    // Get first level config for background
    createBackground(k, 1);

    // Add Christmas decorations to menu
    addMenuChristmasDecorations(k);

    // Show home screen
    await showHomeScreen(k, {
      onStart: () => {
        // Switch to game scene
        k.go("game");
      },
    });
  });
}

function addMenuChristmasDecorations(
  k: ReturnType<typeof import("kaplay").default>
): void {
  // Add ornaments around the menu
  const numOrnaments = 12;
  for (let i = 0; i < numOrnaments; i++) {
    const startAngle = Math.random() * Math.PI * 2;
    const swingSpeed = 0.6 + Math.random() * 0.4;
    const swingAmount = 0.15;

    const ornament = k.add([
      k.sprite("ornament"),
      k.pos(Math.random() * k.width(), Math.random() * k.height()),
      k.anchor("center"),
      k.z(Z_INDEX.HOME_SCREEN_OVERLAY - 1), // Behind menu overlay
      k.opacity(0.6),
      k.scale(0.9 + Math.random() * 0.3),
      k.fixed(),
      k.rotate(startAngle),
      "menuDecoration",
    ]);

    // Animate ornament gently swinging
    ornament.onUpdate(() => {
      const time = k.time();
      ornament.angle = startAngle + Math.sin(time * swingSpeed) * swingAmount;
    });
  }
}
