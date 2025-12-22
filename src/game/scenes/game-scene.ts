import { Game } from "../core/game";

export function createGameScene(
  k: ReturnType<typeof import("kaplay").default>,
  container: HTMLElement
) {
  k.scene("game", async () => {
    // Clean up any existing game objects before creating a new game
    // This prevents duplication when re-entering the scene
    const allGameObjects = [
      ...k.get("player"),
      ...k.get("enemy"),
      ...k.get("projectile"),
      ...k.get("xp"),
      ...k.get("healthPoint"),
      ...k.get("powerUp"),
      ...k.get("ui"),
      ...k.get("targetingZone"),
      ...k.get("background"),
    ];

    for (const obj of allGameObjects) {
      try {
        if (obj && typeof obj.destroy === "function") {
          obj.destroy();
        }
      } catch (e) {
        // Ignore errors if object is already destroyed
      }
    }

    // Create the game with the kaplay instance
    const game = new Game(container, k);
    // Wait for async initialization to complete
    await game.initialize();
    // Start the game (show player and UI)
    game.startGame();
  });
}
