import { Z_INDEX } from "../assets/z-index";

export function showDamageNumber(
  k: ReturnType<typeof import("kaplay").default>,
  position: { x: number; y: number },
  damage: number,
  isCritical: boolean = false
): void {
  const damageText = k.add([
    k.text(damage.toString(), { size: isCritical ? 24 : 18 }),
    k.color(
      isCritical ? 255 : 255,
      isCritical ? 200 : 255,
      isCritical ? 0 : 255
    ),
    k.pos(position.x, position.y),
    k.anchor("center"),
    k.opacity(1),
    k.scale(1, 1),
    k.z(Z_INDEX.DAMAGE_NUMBERS),
    "damageNumber",
  ]);

  // Animate: move up and fade out
  const startY = position.y;
  const endY = startY - 40;
  const duration = 0.8;

  k.tween(
    damageText.pos.y,
    endY,
    duration,
    (val) => {
      damageText.pos.y = val;
      const progress = (val - startY) / (endY - startY);
      damageText.opacity = 1 - progress;
      if (isCritical) {
        damageText.scale = k.vec2(1 + progress * 0.5, 1 + progress * 0.5);
      }
    },
    k.easings.easeOutQuad
  ).onEnd(() => {
    damageText.destroy();
  });
}
