import { describe, it, expect } from 'vitest';
import { Player } from './player';

describe('Player', () => {
  it('should initialize with correct position and size', () => {
    const player = new Player(100, 200, 20, 5);
    const position = player.getPosition();

    expect(position.x).toBe(100);
    expect(position.y).toBe(200);
    expect(player.getSize()).toBe(20);
  });

  it('should move up when moveUp is called', () => {
    const player = new Player(100, 200, 20, 5);
    const initialY = player.getPosition().y;

    player.moveUp();

    expect(player.getPosition().y).toBe(initialY - 5);
    expect(player.getPosition().x).toBe(100);
  });

  it('should move down when moveDown is called', () => {
    const player = new Player(100, 200, 20, 5);
    const initialY = player.getPosition().y;

    player.moveDown();

    expect(player.getPosition().y).toBe(initialY + 5);
    expect(player.getPosition().x).toBe(100);
  });

  it('should move left when moveLeft is called', () => {
    const player = new Player(100, 200, 20, 5);
    const initialX = player.getPosition().x;

    player.moveLeft();

    expect(player.getPosition().x).toBe(initialX - 5);
    expect(player.getPosition().y).toBe(200);
  });

  it('should move right when moveRight is called', () => {
    const player = new Player(100, 200, 20, 5);
    const initialX = player.getPosition().x;

    player.moveRight();

    expect(player.getPosition().x).toBe(initialX + 5);
    expect(player.getPosition().y).toBe(200);
  });

  it('should return a copy of position, not the original', () => {
    const player = new Player(100, 200, 20, 5);
    const position1 = player.getPosition();
    const position2 = player.getPosition();

    expect(position1).not.toBe(position2);
    expect(position1).toEqual(position2);
  });
});

