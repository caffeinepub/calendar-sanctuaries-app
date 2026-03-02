# Specification

## Summary
**Goal:** Add new playable and enemy characters to the existing 3D fighting game, along with a character selection screen before gameplay begins.

**Planned changes:**
- Add a `characterType` field (string or enum) to the `Character` interface in `frontend/src/types/game.ts` to differentiate character variants (e.g., `'ug'`, `'newPlayer'`, `'sukuna'`, `'newEnemy1'`, `'newEnemy2'`).
- Update `LEVEL_CONFIGS` (or equivalent constants) to specify which enemy types appear in each level, with new enemies appearing in later or mixed levels.
- Add at least 2 new enemy character types (beyond Sukuna), each with a unique name, distinct 3D multi-part articulated mesh, unique color scheme and emissive materials, and their own stats (health, speed, attack damage, attack range).
- Add at least 1 new playable character (beyond UG) with a unique name, distinct 3D mesh, and different base stats.
- Update `Character3D.tsx` to render the correct 3D mesh based on `characterType` for all characters.
- Add a character selection screen displayed before the game starts, showing all available playable characters with their names and stats.
- Ensure new enemies use existing AI logic (move toward player, attack at close range).
- Ensure HUD correctly reflects the active player's and enemy's name and health bar for all character types.

**User-visible outcome:** Before starting a game session, the player can choose from at least 2 playable characters. During gameplay, new distinct enemy types appear in later levels alongside or instead of Sukuna, each visually unique with their own stats and health bars shown in the HUD.
