# Specification

## Summary
**Goal:** Add a multi-level progression system and a sword weapon for UG to the existing 3D fighting game.

**Planned changes:**
- Implement at least 3 levels with increasing difficulty (more/faster/stronger Sukuna enemies per level)
- Show a level-transition screen between levels displaying the current level number
- Show a final victory screen after completing all levels
- Display the current level number in the HUD alongside existing health bars
- Add a sword weapon for UG, activated via the `E` key and a new on-screen SWORD button
- Render a 3D sword mesh visibly held in UG's hand when the sword is active
- Show a sword slash arc/sweep emissive visual effect during sword attack animation
- Sword attack deals increased damage and/or range compared to default melee; integrates with existing combatSystem.ts hit-detection
- SWORD button in OnScreenControls follows existing mousedown/mouseup and touchstart/touchend pattern
- Extend TypeScript types in `game.ts`: add `sword` boolean to KeyState, `currentLevel` to GameState, and `swordActive` flag to Character interface

**User-visible outcome:** Players can fight through 3 progressively harder levels, see level-transition and victory screens, and use UG's sword (via `E` key or on-screen button) to deal extra damage with a visible slash effect.
