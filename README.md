# Survivor Game

<div align="center">
  <img src="survivor-icon.png" alt="Survivor Game Logo" width="128" height="128">
</div>

A browser-based survivor game inspired by Vampire Survivors, built with TypeScript and Vite.

## 🎮 Play the Game

**[Play Survivor Game](https://jupier.github.io/survivor/)**

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

Start the development server with hot reloading:

```bash
npm run dev
```

The game will open in your browser at `http://localhost:3000`.

### Controls

- **z** or **↑** - Move up
- **q** or **←** - Move left
- **s** or **↓** - Move down
- **d** or **→** - Move right
- **ESC** - Pause/Unpause

### Testing

Run unit tests:

```bash
npm test
```

Run tests with UI:

```bash
npm run test:ui
```

### Build

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

### Deployment

The game is automatically deployed to GitHub Pages when you push to the `main` branch.

**Manual setup (first time only):**

1. Go to your repository settings on GitHub
2. Navigate to "Pages" in the left sidebar
3. Under "Source", select "GitHub Actions"
4. The workflow will automatically deploy on every push to `main`

The game will be available at: `https://jupier.github.io/survivor/`

## 💡 Future Ideas

Here are some ideas for future improvements and features:

### Performance Optimization

- Implement object pooling for enemies and projectiles
- Optimize sprite rendering with sprite batching
- Add level-of-detail (LOD) system for distant objects
- Implement spatial partitioning for collision detection
- Optimize particle effects and animations

### New Characters

- Add character selection screen with different playable characters
- Each character could have unique starting stats or abilities
- Unlockable characters with different playstyles

### Improve Menu and Level Up

- Better visual design for level-up menu
- Add descriptions for each upgrade option
- Show stat changes before/after selection
- Add sound effects for menu interactions
- Improve pause menu with more options (settings, restart, etc.)

### New Weapons

- Melee weapons (swords, axes) with different attack patterns
- Area-of-effect weapons (explosions, chain lightning)
- Defensive weapons (shields, barriers)
- Support weapons (healing aura, speed boost)
- Weapon combinations and synergies
- **Balance adjustment**: Reduce the power of the slow weapon (currently too strong)

### More Enemies

- Flying enemies with different movement patterns
- Ranged enemies that shoot projectiles
- Enemies with special abilities (teleportation, shields)
- Mini-boss enemies with unique mechanics
- Enemy variants with different behaviors

### Boss Enemies

- Spawn boss enemies every X minutes (e.g., every 2-3 minutes)
- Each boss has unique attack patterns and phases
- Boss health bars and visual indicators
- Special rewards for defeating bosses
- Progressive difficulty with stronger bosses over time

## Project Structure

```
src/
  game/
    engine.ts    # Game engine and rendering loop
    player.ts    # Player character logic
    game.ts      # Main game class
  main.ts        # Application entry point
  style.css      # Global styles
```
