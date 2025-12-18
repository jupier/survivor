import { showHomeScreen } from "../menu/home-screen";
import { loadAllSprites, createBackground } from "../assets/sprite-loader";

export function createMenuScene(
  k: ReturnType<typeof import("kaplay").default>
) {
  k.scene("menu", async () => {
    // Load sprites
    await loadAllSprites(k);

    // Get first level config for background
    createBackground(k, 1);

    // Show home screen
    await showHomeScreen(k, {
      onStart: () => {
        // Switch to game scene
        k.go("game");
      },
    });
  });
}
