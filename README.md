# Survivor Game

A browser-based survivor game inspired by Vampire Survivors, built with TypeScript and Vite.

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

- **z** - Move up
- **q** - Move left
- **s** - Move down
- **d** - Move right

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

