import { Game } from "../core/game";

// Store the current game instance to prevent duplication
let currentGameInstance: Game | null = null;

export function createGameScene(
  k: ReturnType<typeof import("kaplay").default>,
  container: HTMLElement
) {
  k.scene("game", async () => {
    // Clean up any existing game instance first
    if (currentGameInstance) {
      // Clean up the previous game instance's objects
      const allGameObjects = [
        ...k.get("player"),
        ...k.get("christmasHat"),
        ...k.get("playerCollisionZone"),
        ...k.get("enemy"),
        ...k.get("projectile"),
        ...k.get("xp"),
        ...k.get("healthPoint"),
        ...k.get("powerUp"),
        ...k.get("ui"),
        ...k.get("targetingZone"),
        ...k.get("background"),
        ...k.get("christmasDecoration"),
        ...k.get("menuDecoration"),
      ];

      for (const obj of allGameObjects) {
        try {
          if (obj && typeof obj.destroy === "function") {
            obj.destroy();
          }
        } catch (_e) {
          // Ignore errors if object is already destroyed
        }
      }
      currentGameInstance = null;
    }

    // Clean up any existing game objects before creating a new game
    // This prevents duplication when re-entering the scene
    const allGameObjects = [
      ...k.get("player"),
      ...k.get("christmasHat"),
      ...k.get("playerCollisionZone"),
      ...k.get("enemy"),
      ...k.get("projectile"),
      ...k.get("xp"),
      ...k.get("healthPoint"),
      ...k.get("powerUp"),
      ...k.get("ui"),
      ...k.get("targetingZone"),
      ...k.get("background"),
      ...k.get("christmasDecoration"),
      ...k.get("menuDecoration"),
    ];

    for (const obj of allGameObjects) {
      try {
        if (obj && typeof obj.destroy === "function") {
          obj.destroy();
        }
      } catch (_e) {
        // Ignore errors if object is already destroyed
      }
    }

    // Create the game with the kaplay instance
    const game = new Game(container, k);
    currentGameInstance = game;
    // Wait for async initialization to complete
    await game.initialize();
    // Start the game (show player and UI)
    game.startGame();
  });
}
