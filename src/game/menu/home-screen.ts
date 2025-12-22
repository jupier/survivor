import { Z_INDEX } from "../assets/z-index";
import { createLogo } from "../../assets/create-logo";
import { VERSION } from "../../version";

export interface HomeScreenCallbacks {
  onStart: () => void;
}

let homeScreenCallbacks: HomeScreenCallbacks | null = null;
let homeScreenElements: any[] = [];

export async function showHomeScreen(
  k: ReturnType<typeof import("kaplay").default>,
  callbacks: HomeScreenCallbacks
): Promise<void> {
  homeScreenCallbacks = callbacks;
  console.log("showHomeScreen called with callbacks:", callbacks);

  // Clear any existing home screen elements
  hideHomeScreen(k);

  // Create background overlay (no area so it doesn't block clicks)
  const overlay = k.add([
    k.rect(k.width(), k.height()),
    k.color(0, 0, 0),
    k.opacity(0.9),
    k.pos(0, 0),
    k.anchor("topleft"),
    k.fixed(),
    k.z(Z_INDEX.HOME_SCREEN_OVERLAY),
    "homeScreen",
    // No k.area() - overlay should not block clicks
  ]);
  homeScreenElements.push(overlay);

  const centerX = k.width() / 2;
  let currentY = k.height() / 2 - 200;

  // Load and display logo
  const logoDataUrl = createLogo();
  await k.loadSprite("home-logo", logoDataUrl);
  const logo = k.add([
    k.sprite("home-logo"),
    k.pos(centerX, currentY),
    k.anchor("center"),
    k.fixed(),
    k.z(Z_INDEX.HOME_SCREEN_TEXT),
    k.scale(0.6), // Scale down the logo to fit better
    "homeScreen",
  ]);
  homeScreenElements.push(logo);
  currentY += 180;

  // Game name (if you want to show it separately, or use logo text)
  const gameName = k.add([
    k.text("Mini Survivor", { size: 36 }),
    k.color(255, 215, 0), // Gold color
    k.pos(centerX, currentY),
    k.anchor("center"),
    k.fixed(),
    k.z(Z_INDEX.HOME_SCREEN_TEXT),
    "homeScreen",
  ]);
  homeScreenElements.push(gameName);
  currentY += 50;

  // Version
  const versionText = k.add([
    k.text(`v${VERSION}`, { size: 18 }),
    k.color(200, 200, 200), // Light gray
    k.pos(centerX, currentY),
    k.anchor("center"),
    k.fixed(),
    k.z(Z_INDEX.HOME_SCREEN_TEXT),
    "homeScreen",
  ]);
  homeScreenElements.push(versionText);
  currentY += 80;

  // Start button
  const buttonWidth = 200;
  const buttonHeight = 50;
  const buttonX = centerX - buttonWidth / 2;
  const buttonY = currentY;

  // Button background (with higher z-index to be above everything)
  const buttonBg = k.add([
    k.rect(buttonWidth, buttonHeight),
    k.color(74, 158, 255), // Blue color matching player
    k.pos(buttonX, buttonY),
    k.anchor("topleft"),
    k.fixed(),
    k.z(Z_INDEX.HOME_SCREEN_TEXT + 10), // Much higher z-index
    k.area(),
    "homeScreen",
    "startButton",
  ]);
  homeScreenElements.push(buttonBg);

  // Button text (above button bg but no area so clicks go through to button)
  const buttonText = k.add([
    k.text("Start Game", { size: 24 }),
    k.color(255, 255, 255),
    k.pos(centerX, buttonY + buttonHeight / 2),
    k.anchor("center"),
    k.fixed(),
    k.z(Z_INDEX.HOME_SCREEN_TEXT + 11), // Above button bg so it's visible
    "homeScreen",
    // No k.area() so clicks pass through to button
  ]);
  homeScreenElements.push(buttonText);

  // Button hover effect
  buttonBg.onHover(() => {
    buttonBg.color = k.rgb(94, 178, 255); // Lighter blue
  });

  buttonBg.onHoverEnd(() => {
    buttonBg.color = k.rgb(74, 158, 255); // Original blue
  });

  // Store callback directly on button for easier access
  (buttonBg as any).startCallback = callbacks.onStart;

  // Flag to prevent multiple calls
  let isStarting = false;

  // Button click handler - use the stored callback directly
  const handleStart = () => {
    // Prevent multiple calls
    if (isStarting) {
      return;
    }
    isStarting = true;

    console.log("handleStart called");
    const callback =
      (buttonBg as any).startCallback || homeScreenCallbacks?.onStart;
    if (callback) {
      console.log("Calling start callback");
      callback();
    } else {
      console.log("No callback available!");
      isStarting = false; // Reset if callback not available
    }
  };

  // Use onClick on the button (primary handler)
  buttonBg.onClick(() => {
    console.log("Button onClick triggered");
    handleStart();
  });

  // Also allow Enter key to start
  const enterKeyHandler = k.onKeyPress("enter", () => {
    console.log("Enter key pressed");
    handleStart();
  });
  homeScreenElements.push({ cancel: enterKeyHandler.cancel } as any);

  console.log("Home screen setup complete");
}

export function hideHomeScreen(
  _k: ReturnType<typeof import("kaplay").default>
): void {
  // Remove all home screen elements
  homeScreenElements.forEach((element) => {
    if (element) {
      // Check if it's a cancel handler (object with cancel method)
      if (
        typeof element === "object" &&
        "cancel" in element &&
        typeof element.cancel === "function"
      ) {
        element.cancel();
      }
      // Check if it's a game object with destroy method
      else if (typeof element.destroy === "function") {
        // Check if it's already destroyed (only if isDestroyed exists)
        if (typeof element.isDestroyed === "function") {
          if (!element.isDestroyed()) {
            element.destroy();
          }
        } else {
          // If isDestroyed doesn't exist, just try to destroy
          try {
            element.destroy();
          } catch (_e) {
            // Ignore errors if already destroyed
          }
        }
      }
    }
  });
  homeScreenElements = [];
  homeScreenCallbacks = null;
}
