import "./style.css";
import { Game } from "./game/core/game";
import "./utils/export-logo"; // This will set the favicon automatically

const app = document.querySelector<HTMLDivElement>("#app")!;

const game = new Game(app);
game.start();
