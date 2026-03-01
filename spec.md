# Specification

## Summary
**Goal:** Convert the existing 2D canvas-based fighting game into a fully 3D game using Three.js and React Three Fiber.

**Planned changes:**
- Replace the 2D HTML5 canvas `FightingGame` component with a React Three Fiber `Canvas` scene
- Add a 3D battle arena with a visible ground plane and stage boundaries
- Represent UG and Sukuna as distinct 3D character meshes (procedural geometries with distinct colors/materials)
- Add dynamic lighting (ambient + directional/point lights) with noticeable shading
- Position camera in a fixed side-view (third-person) perspective keeping both characters in frame
- Port all game logic (movement, jumping, gravity, attack hitboxes, enemy AI, health, combat, game status) to use 3D positions (X, Y, Z)
- Retain all keyboard controls (WASD/arrows, Z/X) and the existing OnScreenControls touch overlay without changes
- Keep health bars and game-over/victory screens as HTML overlay UI
- Replace the 2D particle system with 3D particle effects (instanced meshes or sprite points) in fiery orange/red or cursed-energy purple, fading out within ~0.5 seconds on hit

**User-visible outcome:** The fighting game runs as a fully 3D side-view brawler with 3D character meshes, a lit arena, and particle hit effects, while all existing controls and UI overlays continue to work as before.
