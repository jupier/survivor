import { Game } from "../core/game";

export function createGameScene(
  k: ReturnType<typeof import("kaplay").default>,
  container: HTMLElement
) {
  k.scene("game", async () => {
    // Create the game with the kaplay instance
    const game = new Game(container, k);
    // Wait for async initialization to complete
    await game.initialize();
    // Start the game (show player and UI)
    game.startGame();
  });
}
