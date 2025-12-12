/**
 * Z-Index Configuration
 *
 * This file centralizes all z-index values used in the game to ensure
 * proper rendering order and easy maintenance.
 *
 * Rendering order (lowest to highest):
 * - Background layers (0-39)
 * - Game objects (40-99)
 * - UI elements (100-199)
 * - Menus and overlays (200-299)
 * - Death screen (300+)
 */

export const Z_INDEX = {
  // Background layers
  BACKGROUND: 0,

  // Game objects - lower layer
  PLAYER_COLLISION_ZONE: 40,
  ENEMIES: 45,
  POWER_UPS: 46,
  BOSS_HEALTH_BAR_BG: 46,
  BOSS_HEALTH_BAR_FILL: 47,
  TARGETING_ZONE_OVERLAY: 48, // Blue overlay (slow weapon) - lower layer
  AOE_ZONE_OVERLAY: 49, // Orange overlay (AOE weapon) - upper layer
  TARGETING_ZONE: 50,
  PLAYER: 50,

  // Effects
  DAMAGE_NUMBERS: 100,

  // UI elements
  UI_BACKGROUND: 101,
  UI_BAR: 102,
  UI_TEXT: 103,
  UI_STATS: 110,
  UI_POWER_UPS: 111,
  LOW_HEALTH_BORDER: 112,

  // Menus and overlays
  LEVEL_TRANSITION_OVERLAY: 200,
  LEVEL_TRANSITION_TEXT: 201,
  LEVEL_UP_MENU_BG: 200,
  LEVEL_UP_MENU_CONTENT: 201,
  LEVEL_UP_MENU_OPTIONS: 202,
  LEVEL_UP_MENU_HIGHLIGHT: 203,
  HOME_SCREEN_OVERLAY: 240,
  HOME_SCREEN_TEXT: 241,
  PAUSE_MENU_OVERLAY: 250,
  PAUSE_MENU_TEXT: 251,

  // Death screen
  DEATH_SCREEN_OVERLAY: 300,
  DEATH_SCREEN_TEXT: 301,
} as const;

/**
 * Helper function to get z-index value
 * Usage: k.z(Z_INDEX.PLAYER)
 */
export function getZIndex(key: keyof typeof Z_INDEX): number {
  return Z_INDEX[key];
}
