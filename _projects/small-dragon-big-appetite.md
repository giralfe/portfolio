---
layout: project
title: Small Dragon Big Appetite
period: "2024"
year: 2024
sort_date: "2024-06"
tags: [AI, Gameplay, Unreal, Solo]
image: /assets/small-dragon/screenshot3.jpg
repo: https://store.steampowered.com/app/3198260/Small_Dragon_Big_Appetite/
role: Programmer (jam) · Sole programmer (graduation quarter)
platform: PC (Unreal Engine 5.3) · released on Steam
priority: 8
summary: "A 48-hour Climax Game Jam entry that became my final graduation project at BUas and was later released free on Steam. As sole programmer for a seven-week quarter I profiled and optimised the bunny AI crowd in Blueprint (full level from 77 ms to 12.5 ms per frame), compared four fireball motion models and built an ability-unlock system tested with recruited playtesters."
trailer: 6WMaO1kycoo
trailer_caption: "The official trailer for the Steam release."
---

*Small Dragon Big Appetite* is a third-person action game in Unreal Engine 5 in which a small dragon hunts bunnies during the day and must return by night. It began as a **Climax Game Jam 2024** entry, made in 48 hours by a team of BUas and Swedish students and published on itch.io, with me as one of its two programmers. After I left the studio team I had worked with for three quarters ([dungeon generation]({{ '/procedural-dungeon-generation/' | relative_url }})), it became the project for my final graduation quarter at BUas: seven weeks in which I was the **only programmer**. All gameplay code is Blueprint. The quarter had three goals from my project plan: reduce the cost of the AI crowd to a measurable target, add player progression, and test each change with players.

<div class="video-showcase">
  <div class="video-container">
    <video width="1280" height="732" poster="{{ '/assets/small-dragon/flame-platter-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/small-dragon/flame-platter.mp4" | relative_url }}" type="video/mp4">
    </video>
  </div>
  <p class="video-caption">The flame ability with the silver-platter kill presentation, which playtesters preferred to the earlier version. Fireball kills use the same presentation.</p>
</div>

---

## Game jam

The jam theme was *periodic*, so the player hunts during the day and must return by night. My contributions during the jam weekend:

- the day timer, which rotates the directional light to produce the day-night cycle and ends the hunting phase;
- the bunny AI: white bunnies eaten in one bite; armoured bunnies, first with armour that had to be bitten off and then, after the designers found that unsatisfying, killable only from behind; and wizard bunnies, which the designers specified as pushing the player away at close range and to which I added a ranged attack when the player is far away, which the team kept;
- a **flee-on-witness** rule: a bunny that sees another bunny being eaten nearby flees from the player for a while before returning to wandering;
- player controls and camera after the dragon model arrived (the dragon faces the input direction; the camera can also be tilted), health and a game-over screen with the score, and attack targeting that locks input, turns the dragon toward the nearest bunny and moves the bunny into its mouth in time with the animation;
- a pause menu built so that artists could replace its placeholder look, with volume settings bound to the audio designer's sound classes, controller input for gameplay, and a one-time "Press E to pet bunny" prompt;
- Nanite on all assets so that Lumen could replace screen-space global illumination, which had produced noisy shadows;
- the first optimisation: bunnies beyond a set range from the player hide their skeletal mesh, leaving only the hat visible.

After the jam the team added a leaderboard and a second island.

<div class="video-showcase">
  <video width="1000" height="540" poster="{{ '/assets/small-dragon/jam-flee-on-witness-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Jam prototype seen from above: white placeholder bunnies with red exclamation marks running away from a red placeholder player">
    <source src="{{ "/assets/small-dragon/jam-flee-on-witness.mp4" | relative_url }}" type="video/mp4">
  </video>
  <p class="video-caption">Jam prototype of flee-on-witness with placeholder art: bunnies that saw another bunny being eaten (red exclamation marks) run from the player (red pillar).</p>
</div>

---

## AI crowd optimisation

The target in my project plan, sharpened after feedback from my supervisor that it should state a number of enemies at a frame rate, was twenty bunnies on screen at 60 fps on a test system with an i5 CPU and a GTX 1050 Ti. I researched optimisation techniques for AI agents in Unreal Engine 5.3, measured each one, and wrote the results up in a research document that I presented at the year's Comeback Day.

<div class="feature-grid">
  <div class="feature-text">
    <h3>Method and baseline</h3>
    <p>All measurements were made with <strong>Unreal Insights</strong>. The test scenes were copied from parts of the game level and kept its obstacles, so the agents compute navmesh paths as they do in the game. The player was removed from the test scenes to reduce randomness, which also means player-triggered reactions, death animations and effects are not part of the measurements. The number of agents was increased in steps from 0 to 80.</p>
    <p><strong>Test 1</strong> used a small set-dressed scene of one landscape tile, 3,000 by 3,000 units (the game level is 30,000 by 30,000). Average frame time rose from 11.4 ms without agents to 12.8 ms with 20, 19.9 ms with 40 and 33.1 ms with 80. On my development machine (i7, RTX 3080, high scalability) the unoptimised game stayed within the 16.7 ms budget up to about 30 agents. The full level, with every bunny spawned, ran at 77 ms per frame.</p>
    <p>My supervisor's review of the research document asked for a statement of when these techniques are worth applying. The document therefore opens with this baseline: with about five agents the AI accounts for roughly 1 ms of a 12 ms frame and no optimisation is needed, while the cost rises steeply beyond 20 agents.</p>
  </div>
  <div class="feature-media">
    <img width="1400" height="575" loading="lazy" decoding="async" src="{{ "/assets/small-dragon/ai-test1-frametime.jpg" | relative_url }}" alt="Line chart of average frame time in milliseconds against number of AI agents for test 1, rising from about 11 ms at 0 agents to 33 ms at 80">
    <p class="video-caption">Test 1: average frame time against number of agents in the small test scene (chart from my Comeback Day presentation).</p>
  </div>
</div>

<div class="feature-grid reverse">
  <div class="feature-media">
    <video width="1280" height="298" poster="{{ '/assets/small-dragon/unreal-insights-capture-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Unreal Insights timing view of a 22.2 millisecond frame with per-bunny movement, skeletal mesh and behaviour tree ticks">
      <source src="{{ "/assets/small-dragon/unreal-insights-capture.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Unreal Insights timing view of a 22.2 ms frame during the investigation: per-bunny character-movement, skeletal-mesh and behaviour-tree ticks on the game thread, and cloth simulation for the bunny mesh on a worker thread.</p>
    <img width="1600" height="900" loading="lazy" decoding="async" src="{{ "/assets/small-dragon/ai-test3-setup.jpg" | relative_url }}" alt="Presentation slide for test 3: a medium test level with houses and trees, a white spline track and a red wireframe sphere for the player's activation range, above an Unreal Insights timing view with a tooltip for USkeletalMeshComponent_TickAnimation" style="margin-top:1rem">
    <p class="video-caption">Test 3 setup: the red sphere is the player's activation range and moves along the white track, so every run follows the same path.</p>
  </div>
  <div class="feature-text">
    <h3>Distance culling</h3>
    <p>The jam version already hid the skeletal mesh of distant bunnies. Insights showed that this was not enough: hidden bunnies still ticked their <strong>animation Blueprint</strong>, AI controller, behaviour tree and character movement component. I changed the culling to disable all of these components for bunnies outside a <strong>2,000-unit radius</strong> around the player, and to enable them again when the bunny comes back into range. For a culled bunny, the skeletal-mesh tick dropped from 0.0087 ms to 0.0004 ms.</p>
    <p>I chose distance culling after comparing the culling methods that UE5 provides (Epic Games, n.d.-b). Precomputed visibility applies only to static actors, which enemies are not; view-frustum culling and hardware occlusion queries are already enabled by default; hierarchical Z-buffer occlusion works like hardware occlusion queries but more conservatively, so it offers no additional gain here.</p>
    <p><strong>Test 3</strong> measured the effect in a medium-sized scene. A sphere standing in for the player's activation range follows a fixed spline track, enemies are spawned at random positions, and each measurement starts one minute after the simulation starts so that the agents have spread out. With up to 20 agents both configurations stay between about 12 and 13.5 ms; with 80 agents the frame time is 20.6 ms with culling and 36.0 ms without.</p>
  </div>
</div>

<div class="media-row">
  <figure>
    <img width="1400" height="673" loading="lazy" decoding="async" src="{{ "/assets/small-dragon/ai-test3-frametime.jpg" | relative_url }}" alt="Line chart for test 3 comparing average frame time with and without culling against number of AI agents; at 80 agents about 20.6 ms with culling and 36 ms without">
    <p class="video-caption">Test 3: average frame time against number of agents in the medium scene, with culling (orange) and without (teal).</p>
  </figure>
</div>

<div class="feature-grid">
  <div class="feature-text">
    <h3>Skeletal-mesh LODs</h3>
    <p>I generated three reduced levels of detail for the bunny mesh with Unreal's skeletal mesh reduction tool (Epic Games, n.d.-a), from 6,822 triangles at LOD0 to roughly 430 at LOD3. <strong>Test 2</strong> isolated rendering and animation cost in a minimal scene with a fixed number of bunnies and each LOD locked in turn. In the game level, measured over the same route with and without LODs, the average skeletal-mesh frame time per bunny fell from 0.0225 ms to 0.0192 ms, a reduction of 14.6%. For 100 bunnies this corresponds to an estimated 2.25 ms against 1.92 ms. The document notes that the lower LODs can reduce visual fidelity and that the gain depends on the reduction settings.</p>
    <h3>Result in the game level</h3>
    <p>With all bunnies present in the level from the start, measured in the editor at high scalability on the development machine:</p>
  </div>
  <div class="feature-media">
    <table>
      <thead><tr><th>Configuration (full game level)</th><th>Average frame time</th></tr></thead>
      <tbody>
        <tr><td>No optimisation</td><td>77.1 ms</td></tr>
        <tr><td>Distance culling</td><td>14.1 ms</td></tr>
        <tr><td>Distance culling and LODs</td><td>12.5 ms</td></tr>
      </tbody>
    </table>
    <table>
      <thead><tr><th>Skeletal mesh, per bunny (game level)</th><th>Average frame time</th></tr></thead>
      <tbody>
        <tr><td>Without LODs</td><td>0.0225 ms</td></tr>
        <tr><td>With LODs</td><td>0.0192 ms</td></tr>
      </tbody>
    </table>
  </div>
</div>

<div class="technical-block">
  <h3>Further work on the optimisation study</h3>
  <ul>
    <li>Measurements on the target configuration from the project plan (i5, GTX 1050 Ti). All recorded measurements were taken in the editor on the development machine.</li>
    <li>Additional series for Test 3, which has one series per configuration; the research document states that more data would be needed to confirm the trend.</li>
    <li>The further candidates identified in the research document: navmesh optimisation, behaviour-tree optimisation and tick management, and conversion of the AI to native code with additional Insights timers.</li>
  </ul>
</div>

---

## Fireball: four motion models

The fireball was the first ability prototype. Its motion went through four implementations before one was kept:

1. **Physics-simulated ball.** It did not travel straight even on a flat test floor, because the hit normal was not upright. Since the game level is built on landscapes, I judged this approach too unpredictable to aim.
2. **Analytic curve.** A damped sine: x&middot;sin&nbsp;x oscillates between the lines y&nbsp;=&nbsp;x and y&nbsp;=&nbsp;&minus;x, so a sine under a decreasing envelope produces bounces of decreasing height. The curve I used is &#124;5/(x+1)&nbsp;&middot;&nbsp;sin&nbsp;2x&#124; for x&nbsp;&ge;&nbsp;0; the shift by one removes the first arc, which rose too high. The path was predictable but passed straight through any terrain that was not flat.
3. **Curve with a raycast ground offset.** It followed the ground but failed when the ball left an edge, and it still did not react to the environment.
4. **Unreal's projectile movement component**, tuned for bounciness and friction. This version was kept. A playtester noted that its ricochets could allow skilled shots, but also that it bounced off trees and foliage; I did not exclude those surfaces, because a rule about what the ball bounces off would then be inconsistent.

<div class="media-row">
  <figure>
    <video width="824" height="540" poster="{{ '/assets/small-dragon/fireball-physics-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="A white physics ball fired by the dragon on a flat tiled test floor, with yellow debug lines">
      <source src="{{ "/assets/small-dragon/fireball-physics.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">1. Physics simulation: the ball drifts off its line; yellow lines are debug traces.</p>
  </figure>
  <figure>
    <video width="1000" height="540" poster="{{ '/assets/small-dragon/fireball-curve-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="White balls following a bouncing curve on a flat floor in the editor">
      <source src="{{ "/assets/small-dragon/fireball-curve.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">2. Analytic curve on flat ground.</p>
  </figure>
  <figure>
    <video width="822" height="540" poster="{{ '/assets/small-dragon/fireball-raycast-offset-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="A ball following a curve with red raycast debug lines over a ramp">
      <source src="{{ "/assets/small-dragon/fireball-raycast-offset.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">3. Curve with raycast ground offset (red debug traces): correct on surfaces, wrong past an edge.</p>
  </figure>
  <figure>
    <video width="828" height="540" poster="{{ '/assets/small-dragon/fireball-projectile-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Fireballs with fire and smoke effects fired by the dragon, bouncing across a tiled floor and ramps">
      <source src="{{ "/assets/small-dragon/fireball-projectile.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">4. Projectile movement component with the final effects.</p>
  </figure>
</div>

<div class="feature-grid">
  <div class="feature-text">
    <h3>Around the fireball</h3>
    <ul>
      <li>A shooting animation that I re-keyed in the engine from an existing upward fire-breath animation.</li>
      <li>Niagara fire and smoke as two separately timed systems, built on an erosion material. The fireball Blueprint drives the particle radius and spawn rate, so the effect shrinks as the ball burns out. The ball's own material uses time-based displacement and interpolated noise.</li>
      <li>A keyframed death animation for burning bunnies, played before they switch to ragdoll.</li>
      <li>A carrot crate intended to block a path until a fireball breaks it; modelling it was my first use of the project's colour atlas and of UV unwrapping in Blender.</li>
    </ul>
  </div>
  <div class="feature-media">
    <img width="1869" height="894" loading="lazy" decoding="async" src="{{ "/assets/small-dragon/fireball-function.png" | relative_url }}" alt="Desmos plot of the absolute value of 5 over x plus 1 times sin 2x, a row of shrinking bounces, with the envelope 5 over x plus 1 drawn above it">
    <p class="video-caption">The curve of attempt two in Desmos: |5/(x+1) &middot; sin&nbsp;2x| in red under its envelope 5/(x+1) in blue; the fireball uses the part from x&nbsp;=&nbsp;0.</p>
    <video width="826" height="540" poster="{{ '/assets/small-dragon/crowd-test-arena-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="A walled test arena with many bunnies; bunnies hit by fireballs play a death animation and then ragdoll" style="margin-top:1rem">
      <source src="{{ "/assets/small-dragon/crowd-test-arena.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">A test arena with many bunnies, where fireball hits trigger the keyframed death animation followed by ragdoll.</p>
  </div>
</div>

---

## Kill presentation and progression

<div class="feature-grid reverse">
  <div class="feature-media">
    <video width="828" height="540" poster="{{ '/assets/small-dragon/fireball-gore-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Fireball kills with blood effects and bunnies fleeing">
      <source src="{{ "/assets/small-dragon/fireball-gore.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">The earlier kill presentation: the fireball triggers the same reaction as a bunny being eaten, with blood effects. Playtesters found it too violent.</p>
  </div>
  <div class="feature-text">
    <h3>Kill presentation</h3>
    <p>The flamethrower was prototyped after playtester requests, with its own breath animation, adapted flame effects and kill logic. Playtesters judged its kills, like the fireball's, too gruesome for the game, which matched an earlier comment that the violence should be comical. I changed the presentation rather than the mechanic. Burned bunnies receive an <strong>overlay material</strong> (a feature added in UE 5.1) for a cooked appearance and effects spawned on their skeletal meshes, and are then served on a silver platter whose lid the dragon throws off, using an animation adapted from an existing one and a platter I modelled. Fireball kills use the same presentation. A playtester described the new kills as "a lot better fit in the game".</p>
  </div>
</div>

<div class="feature-grid">
  <div class="feature-text">
    <h3>Ability unlocks</h3>
    <p>Progression was one of the main requests from playtesters of the jam build. In the first week I listed candidate abilities (growing each night, spending points to become stronger, flight or a double jump, fireballs, a hunter mode, attacking from bushes, a roar that stuns) and prototyped the fireball, flamethrower, jump and growth. Unlocks are bought with points through a screen with two categories, Traversal and Flame. I drew its elements in Krita with a mouse, added a hover wiggle and a lock-opening animation rendered through a 3D viewport, and reused the banner and back button from the game's menus. One playtester reported that the unlocks added replay value.</p>
    <p>The <strong>growth</strong> prototype, in which the dragon becomes larger each night, was cut after testing: it changed the player's dimensions enough that the dragon could get stuck or fail to pass areas that should be passable. The <strong>jump</strong> was kept as an unlock, limited to a single jump so that it cannot bypass the level's progression. A playtester found the first version unresponsive; its animation was also looping, so frames of the jump replayed before landing. I rebuilt it with animation curves and added a smoke-ring effect.</p>
  </div>
  <div class="feature-media">
    <video width="908" height="540" poster="{{ '/assets/small-dragon/ability-unlock-ui-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Ability screen with Flame and Traversal cards, a back button and a lock-opening animation">
      <source src="{{ "/assets/small-dragon/ability-unlock-ui.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">The ability screen: hover feedback on the Flame and Traversal cards and the lock animation on purchase.</p>
    <video width="956" height="540" poster="{{ '/assets/small-dragon/growth-prototype-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The growth prototype: a grey placeholder cube is eaten and the dragon grows slightly" style="margin-top:1rem">
      <source src="{{ "/assets/small-dragon/growth-prototype.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">The growth prototype that was cut: eating a placeholder cube scales the dragon up.</p>
  </div>
</div>

<div class="media-row">
  <figure>
    <video width="944" height="540" poster="{{ '/assets/small-dragon/jump-first-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="First jump prototype: the dragon jumps on open ground in a test area">
      <source src="{{ "/assets/small-dragon/jump-first.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">First jump prototype.</p>
  </figure>
  <figure>
    <video width="792" height="540" poster="{{ '/assets/small-dragon/jump-rework-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Reworked jump in the forest level with a white smoke ring around the dragon">
      <source src="{{ "/assets/small-dragon/jump-rework.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Reworked jump with animation curves and the smoke ring, after playtester feedback.</p>
  </figure>
</div>

---

## Reactive grass

The grass bends away from nearby objects through its material: the world-position offset reads the **mesh distance field**, which Nanite meshes write to. A vertex-colour gradient on the blade mesh, white at the root and darker toward the tip, is meant to keep the base fixed while the rest bends. I found two defects:

- **Blades floated** above the ground, because one term of the offset could never reach zero at the base. I fixed it by interpolating between a zero offset and the distance-field offset with the vertex-colour mask.
- **The grass did not react to the dragon**, because the player generated no distance field at all; the distance-field view showed nothing at the dragon's position. An invisible sphere at the player's base that does generate a distance field fixed it.

<div class="media-row">
  <figure>
    <video width="736" height="540" poster="{{ '/assets/small-dragon/grass-bug-before-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The dragon moving through grass that does not bend around it">
      <source src="{{ "/assets/small-dragon/grass-bug-before.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Before the fix: the grass does not respond to the dragon.</p>
  </figure>
  <figure>
    <video width="1022" height="540" poster="{{ '/assets/small-dragon/distance-field-view-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Top-down editor view of the test character in grass, switching to the mesh distance field visualisation">
      <source src="{{ "/assets/small-dragon/distance-field-view.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">The editor's mesh distance field visualisation around the test character, the buffer the grass material reads.</p>
  </figure>
  <figure>
    <video width="1280" height="690" poster="{{ '/assets/small-dragon/grass-distance-field-fix-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The dragon moving through grass that bends around it after the invisible distance-field sphere was added">
      <source src="{{ "/assets/small-dragon/grass-distance-field-fix.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">After the fix: with the sphere at the player's base the grass bends around the dragon.</p>
  </figure>
</div>

---

## Process

- **Playtesting.** In weeks 3 and 4 I created a Discord server for playtesting, recruited testers through Reddit and among friends, and brought in new testers for each round of prototypes.
- **Conventions.** I kept the folder structure, naming conventions and Perforce submission conventions I had set up during the jam, so any file could be rolled back.
- **Engine version.** Upgrading the project to Unreal Engine 5.4 caused a crash when loading the main level. Breakpoints and a debug build did not reveal the cause, so I rolled the project back to 5.3.
- **Supervision.** I had regular progress meetings with my supervisor; his feedback shaped the project plan's performance target and the structure of the research document.

<div class="technical-block">
  <h3>Outcome</h3>
  <ul>
    <li>The full level runs at 12.5 ms per frame with every bunny present from the start, against 77 ms without culling or LODs, measured on the development machine.</li>
    <li>The fireball, flamethrower, jump and ability-unlock screen were implemented and playtested; the growth prototype was cut.</li>
    <li>Without an artist on the project that quarter, I made the animations, effects, models and 2D icons for these features myself, outside my specialisation.</li>
  </ul>
</div>

## Key takeaways

- **Base the plan of a solo project on a written analysis of its current state.** In the first week I wrote an analysis of the jam build to decide and justify the quarter's work; the AI performance research and the progression prototypes both came from it, and the deadlines I set myself for the prototype playtest and the research document were met.
- **Profile before choosing an optimisation, and verify each one with measurements.** Unreal Insights showed that the jam build's optimisation, hiding the meshes of distant bunnies, left their animation Blueprints, behaviour trees and movement components ticking. Distance culling and LODs were each tested in dedicated scenes before being applied to the game level, which made every reported gain a measured one.
- **Compare several implementations of a gameplay feature before settling on one.** The fireball's motion went through a physics simulation, an analytic curve and a raycast-corrected curve before the projectile movement component was kept. The end-of-quarter reflection notes that exploring beyond the first approach that works can lead to a better implementation.
- **Check design decisions against outside playtesters, particularly when working alone.** As the only developer, my own preferences could skew the game toward what one person likes. Feedback from fresh testers in each round led to the flamethrower, the change in kill presentation and the jump rework.

<div class="technical-block">
  <h3>References</h3>
  <p>Epic Games. (n.d.-a). <em>Skeletal Mesh LODs</em>. Unreal Engine 5.3 Documentation.<br>
  Epic Games. (n.d.-b). <em>Visibility and Occlusion Culling</em>. Unreal Engine 5.4 Documentation.</p>
</div>

Play it: [Small Dragon Big Appetite on Steam](https://store.steampowered.com/app/3198260/Small_Dragon_Big_Appetite/) (free; the team released it in October 2024). The original jam build is still on [itch.io](https://mo-dev.itch.io/climaxgamejamteam5).
