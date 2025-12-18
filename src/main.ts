import "./style.css";
import kaplay from "kaplay";
import { createMenuScene } from "./game/scenes/menu-scene";
import { createGameScene } from "./game/scenes/game-scene";
import "./utils/export-logo"; // This will set the favicon automatically

const app = document.querySelector<HTMLDivElement>("#app")!;

// Initialize Kaplay
const k = kaplay({
  width: Math.min(window.innerWidth, 1200),
  height: Math.min(window.innerHeight, 800),
  root: app,
  background: [42, 42, 52], // Slightly darker blue-gray to match moon theme
});

// Create scenes
createMenuScene(k);
createGameScene(k, app);

// Start with menu scene
k.go("menu");
