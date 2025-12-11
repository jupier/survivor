export interface Position {
  x: number;
  y: number;
}

export class Player {
  private position: Position;
  private readonly size: number;
  private readonly speed: number;

  constructor(
    initialX: number,
    initialY: number,
    size: number = 20,
    speed: number = 5
  ) {
    this.position = { x: initialX, y: initialY };
    this.size = size;
    this.speed = speed;
  }

  getPosition(): Position {
    return { ...this.position };
  }

  getSize(): number {
    return this.size;
  }

  moveUp(): void {
    this.position.y -= this.speed;
  }

  moveDown(): void {
    this.position.y += this.speed;
  }

  moveLeft(): void {
    this.position.x -= this.speed;
  }

  moveRight(): void {
    this.position.x += this.speed;
  }

  update(): void {
    // Future: Add any per-frame updates here
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#4a9eff";
    ctx.fillRect(
      this.position.x - this.size / 2,
      this.position.y - this.size / 2,
      this.size,
      this.size
    );
  }
}
