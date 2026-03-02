# Specification

## Summary
**Goal:** Add visual effects and graphical enhancements to the 3D fighting game to make combat feel more dynamic and impactful.

**Planned changes:**
- Add a muzzle flash effect at UG's gun muzzle position that appears for 2–4 frames when a projectile is fired
- Add an explosion effect at the point of projectile impact on Sukuna using fiery/cursed-energy colors (orange, red, gold) that scales up and fades over ~0.4 seconds
- Add a persistent pulsing cursed-energy aura around Sukuna using deep crimson/dark magenta emissive coloring that subtly scales in and out in a loop
- Add a ground shockwave disc effect when either character lands from a jump, expanding radially and fading over ~0.3 seconds (blue for UG, red for Sukuna)
- Add animated energy trails behind gun projectiles using electric gold/cyan emissive particles that fade within 0.2 seconds
- Add a red screen-edge vignette flash overlay in the DOM layer that appears when UG takes damage and fades within ~0.5 seconds

**User-visible outcome:** Players will see richer visual feedback during combat — muzzle flashes when shooting, explosions on hit, Sukuna's pulsing aura, landing shockwaves, projectile energy trails, and a red screen flash when UG takes damage.
