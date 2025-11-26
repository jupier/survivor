import kaplay from "kaplay";

export class Game {
  private k: ReturnType<typeof kaplay>;

  constructor(container: HTMLElement) {
    const width = Math.min(window.innerWidth, 1200);
    const height = Math.min(window.innerHeight, 800);

    this.k = kaplay({
      width,
      height,
      root: container,
      background: [42, 42, 42],
    });

    this.setupGame();
  }

  private setupGame(): void {
    const speed = 200; // pixels per second

    // Create player
    const player = this.k.add([
      this.k.rect(20, 20),
      this.k.color(74, 158, 255),
      this.k.pos(this.k.width() / 2, this.k.height() / 2),
      this.k.anchor("center"),
      "player",
    ]);

    // Handle continuous movement with z/q/s/d keys
    this.k.onUpdate(() => {
      const moveSpeed = speed * this.k.dt();
      let moveX = 0;
      let moveY = 0;

      if (this.k.isKeyDown("z")) {
        moveY -= moveSpeed;
      }
      if (this.k.isKeyDown("s")) {
        moveY += moveSpeed;
      }
      if (this.k.isKeyDown("q")) {
        moveX -= moveSpeed;
      }

      if (this.k.isKeyDown("d")) {
        moveX += moveSpeed;
      }

      if (moveX !== 0 || moveY !== 0) {
        player.pos.x += moveX;
        player.pos.y += moveY;

        // Keep player in bounds
        player.pos.x = this.k.clamp(player.pos.x, 10, this.k.width() - 10);
        player.pos.y = this.k.clamp(player.pos.y, 10, this.k.height() - 10);
      }
    });
  }

  public start(): void {
    // Game is already running after kaplay initialization
  }

  public stop(): void {
    // Kaplay doesn't have a built-in stop method
    // Could destroy the canvas if needed
  }
}
