---
layout: project
title: SUB NIVIS
period: "2022"
year: 2022
sort_date: "2022-06"
tags: [Engine, AI, Gameplay, Graphics, C++, Team]
image: /assets/sub-nivis/screenshot1-card.jpg
repo: https://buas.itch.io/sub-nivis
role: Gameplay & engine programmer · Product Owner in block D
platform: PC + PlayStation 4 · custom C++ engine
priority: 10
summary: "A retro first-person shooter developed over two eight-week blocks on a C++ engine the team wrote alongside it. I implemented Quake BSP and WAD loading so that levels could be authored in TrenchBroom, the turret and chaser enemies, animated sprites and the PlayStation 4 build, and profiled the chasers' raycast cost. In the second block I was Product Owner."
trailer: OIPGUdnljAQ
trailer_caption: "Official gameplay trailer for the itch.io release."
---

SUB NIVIS was developed at Breda University of Applied Sciences in blocks C and D of the second year (2021-22), eight weeks each. In block C a team of programmers built a custom C++ engine and a playable prototype on it, targeting PC and PlayStation 4. In block D designers, artists and a QA team joined, and the game was published on itch.io in early access, followed by two updates, a patch and a release.

In block C my work covered both gameplay and graphics: loading levels from Quake's file formats, the sprite system, the enemies and the PlayStation 4 build setup. In block D the team chose me as Product Owner (the holder of the game's vision), and I continued as a gameplay programmer on the enemies and hit feedback.

---

## Levels from Quake's file formats

<div class="feature-grid">
  <div class="feature-text">
    <h3>BSP loading</h3>
    <p>The team chose Quake as the reference game, and its level layout and textures were the look to reproduce. Supporting Quake's level format (BSP) and texture archives (WAD) in the engine meant that levels could be authored in an existing Quake editor, TrenchBroom, instead of an editor the team would have had to write.</p>
    <p>In week 2 of block C I loaded .bsp files into memory and first drew the parsed geometry as debug lines, to check it before any texturing. I then passed the data the renderer needed to my teammate Hana, and together we mapped textures onto the surfaces. In the same week I set up TrenchBroom with the tools needed to make a Quake map and wrote a short guide for the team.</p>
    <p>These first textures were PNG files extracted from a WAD and renamed by hand to match the texture names stored in the BSP. This made custom texture sets impractical; the WAD parser described below replaced the workflow.</p>
  </div>
  <div class="feature-media">
    <div class="video-container yt-embed" style="margin-bottom:1rem"><iframe src="https://www.youtube-nocookie.com/embed/jGtIfDk3hX0?rel=0" title="BSP map drawn as debug lines" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>
    <p class="video-caption">Stage one (week 2): the parsed BSP drawn as debug lines.</p>
    <video width="952" height="540" poster="{{ '/assets/sub-nivis/bsp-textured-quake-map-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="A Quake map rendered in the team's engine with textures on walls, floor and arches" style="margin-top:1rem">
      <source src="{{ "/assets/sub-nivis/bsp-textured-quake-map.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Stage two (week 2): a Quake map with textures, still from PNGs extracted from a WAD and renamed by hand.</p>
  </div>
</div>

### WAD parser

In week 3 I wrote a parser for WAD, Quake's indexed-colour texture archive, reading its header (magic bytes, entry count and directory offset), its palette and its mip textures. In week 5 I extended it to convert each mip texture to RGBA and register it as a texture resource in the engine, so that a map could be textured directly from a WAD.

The first attempt to texture our own level from a custom WAD rendered noise: the texture data I passed to the renderer had already gone out of scope, so the renderer read invalid memory. I continued testing on a Quake map with a known-good WAD, to separate parser errors from errors in our data. I also found that our custom WAD contained no palette, used the original Quake palette as a temporary substitute, and reworked the parser to output RGBA texture resources.

<div class="media-row">
  <figure>
    <img width="1200" height="720" loading="lazy" decoding="async" src="{{ "/assets/sub-nivis/wad-first-attempt.jpg" | relative_url }}" alt="The team's custom level rendered with corrupted textures: dense black, red and green streaks across every surface">
    <p class="video-caption">First attempt with our custom WAD (week 5): texture data read after going out of scope.</p>
  </figure>
  <figure>
    <video width="900" height="540" poster="{{ '/assets/sub-nivis/wad-fallback-green-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="A Quake map in which floors and a lava channel are textured while the remaining surfaces are flat green">
      <source src="{{ "/assets/sub-nivis/wad-fallback-green.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Test on a Quake map with a known-good WAD. Green surfaces use textures that the loaded WAD does not contain.</p>
  </figure>
  <figure>
    <video width="900" height="540" poster="{{ '/assets/sub-nivis/trenchbroom-map-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The team's first custom level, built in TrenchBroom, running in the engine with textures from the team's own WAD: an orange tiled floor, brick walls, stairs and turrets">
      <source src="{{ "/assets/sub-nivis/trenchbroom-map.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">The team's first custom level, built in TrenchBroom and textured from our own WAD with the Quake palette.</p>
  </figure>
</div>

<div class="feature-grid">
  <div class="feature-text">
    <h3>Missing textures and the editor workflow</h3>
    <p>I added a fallback so that a texture absent from the WAD renders as a flat placeholder surface instead of crashing the engine (week 5). In week 7 the team feedback named hard crashes on missing textures as an engine-stability problem, and I removed further crashes of this kind that week.</p>
    <p>With the parser in place, my teammate Joey built a level in TrenchBroom, generated a WAD for it with an external tool and placed both directly in the project files. In block D the level designers continued to produce maps in this format. One of my block D hotfixes raised a Quake-era limit on the number of lightmaps, which the designers' maps exceeded; it took precedence over other work because it blocked level design.</p>
  </div>
  <div class="feature-media">
    <video width="1144" height="540" poster="{{ '/assets/sub-nivis/missing-texture-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="A test level in which surfaces whose textures are missing from the WAD render as flat magenta blocks next to textured brick walls">
      <source src="{{ "/assets/sub-nivis/missing-texture.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Fallback surfaces (magenta) for textures that the WAD does not contain.</p>
  </div>
</div>

<div class="feature-grid reverse">
  <div class="feature-media">
    <img width="1202" height="759" loading="lazy" decoding="async" src="{{ "/assets/sub-nivis/wad-pixel-quads.png" | relative_url }}" alt="Textures parsed from a WAD drawn as a tall column of individually coloured quads, one quad per pixel">
    <p class="video-caption">Week 3 check: every decoded pixel drawn as its own quad.</p>
    <img width="1054" height="924" loading="lazy" decoding="async" src="{{ "/assets/sub-nivis/wad-unit-tests.png" | relative_url }}" alt="Unit tests for the WAD parser asserting on the header magic bytes, the palette entries and the first mip texture's name, size and pixel buffer" style="margin-top:1rem">
    <p class="video-caption">Week 7 unit tests: header, palette entries, and the first mip texture's name, size, channels and first pixel.</p>
  </div>
  <div class="feature-text">
    <h3>Testing the parser</h3>
    <p>Before the engine had a pipeline from WAD entries to texture resources, I verified the parser by drawing every decoded pixel as an individual quad. The method is slow, but it shows directly whether the palette and pixel data decode correctly.</p>
    <p>In week 7 I replaced this check with unit tests in the Visual Studio C++ unit-test framework. One test asserts the header's <code>WAD2</code> magic bytes, entry count and directory offset; one asserts the first two palette colours; one asserts the first mip texture's name, width, height, channel count and the RGBA value of its first pixel. The Jenkins pipeline, set up by my teammate Tim, ran the unit tests as one of its stages, so the parser was checked on each build.</p>
  </div>
</div>

<div class="video-showcase">
  <img width="1200" height="720" loading="lazy" decoding="async" src="{{ "/assets/sub-nivis/lightmaps.png" | relative_url }}" alt="The level rendered with parsed lightmap data, which washes the surfaces out because the mapping onto them is wrong">
  <p class="video-caption">Lightmap data parsed from the BSP and rendered, but not mapped onto the correct surfaces.</p>
</div>

Feedback in week 6 was that the engine's lighting looked too modern for the reference game. In week 7 I parsed Quake's precomputed lightmaps from the BSP. The data was extracted, but at the end of the block the lightmaps were still not mapped onto the correct surfaces, and the feature was not completed.

---

## Sprites and particles

<div class="feature-grid">
  <div class="feature-text">
    <h3>Animated sprites</h3>
    <p>Enemies and effects use animated sprites, the approach of Doom (1993) rather than Quake's animated 3D models, because sprites were simpler to set up than 3D animation. The first version (week 5) drew screen-space sprites, comparable to the face on Quake's status bar: the displayed frame can be set by the code using the sprite, transparent pixels are alpha-clipped, and the sprite scales with the window's aspect ratio. A second version renders the same animated sprites in world space as camera-facing quads.</p>
    <h3>Sprite particles</h3>
    <p>In the week 4 review the lecturers asked for particles. In week 6 I built them on the world-space sprites: an EnTT component spawns camera-facing animated sprites, and each one carries the team's <code>Lifetime</code> component, which destroys the entity after a set time. This was the particle system of block C. In block D the engine also had a separate particle system written by Hana, which the block D blood effect uses.</p>
  </div>
  <div class="feature-media">
    <video width="900" height="540" poster="{{ '/assets/sub-nivis/sprite-world-space-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="A large placeholder face sprite rendered in the level facing the camera, with a small screen-space face in the lower-left corner">
      <source src="{{ "/assets/sub-nivis/sprite-world-space.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">World-space sprite in the level (placeholder Doom face), with the screen-space version in the lower-left corner.</p>
    <video width="870" height="540" poster="{{ '/assets/sub-nivis/sprite-particle-emitter-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Hundreds of camera-facing face sprites spreading outward from a single emitter point" style="margin-top:1rem">
      <source src="{{ "/assets/sub-nivis/sprite-particle-emitter.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Sprite particles from a single emitter, with a placeholder texture.</p>
  </div>
</div>

---

## Enemies in block C

<div class="feature-grid reverse">
  <div class="feature-media">
    <img width="1600" height="1012" loading="lazy" decoding="async" src="{{ "/assets/sub-nivis/optick-stress.png" | relative_url }}" alt="512 chaser enemies packed into an arena in the engine, seen from above, for the Optick stress test">
    <img width="1600" height="867" loading="lazy" decoding="async" src="{{ "/assets/sub-nivis/optick-capture.png" | relative_url }}" alt="An Optick capture of one 7.4 ms stress-test frame: the game tick is a dense run of send_ray calls totalling 2.83 ms, followed by Bullet's collision pass and rendering" style="margin-top:1rem">
    <p class="video-caption">The 512-chaser stress test and its Optick capture.</p>
  </div>
  <div class="feature-text">
    <h3>Turret (week 4)</h3>
    <p>The turret checks line of sight to the player and fires while it has it. It was my first enemy behaviour written purely in C++, after working in Unreal Engine in the previous block, and the first I wrote as EnTT components and systems instead of an inheritance hierarchy. A code review in week 6 identified where it did not follow the ECS structure and the team's coding standard (for example, the turret-state enum had to become an <code>enum class</code> with snake_case values), and I refactored it accordingly.</p>
    <h3>Chaser (week 6)</h3>
    <p>The chaser reuses the turret's line-of-sight check and moves towards the player while it has line of sight. Raycasts against the level let it walk up and down slopes and stairs. It has idle and attack states, and a switch over the state selects the sprite animation. In the same week I connected player death to the game-over screen.</p>
    <h3>Profiling</h3>
    <p>To test scalability I spawned 512 chasers and profiled a frame with Optick on an Intel i7-11800H. The frame took 7.4 ms, of which 2.83 ms was spent in the collision world's <code>send_ray</code>, because every chaser tested its line of sight every tick; most of the remaining time went to Bullet's collision detection and to rendering. I distributed the checks over four ticks, so that each chaser casts its ray every fourth tick and a quarter of the chasers update on any given tick. With all 512 chasers active the frame time dropped to 5.3 ms.</p>
  </div>
</div>

<div class="media-row">
  <figure>
    <video width="1000" height="600" poster="{{ '/assets/sub-nivis/turret-game-over-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="A turret at the end of a raised walkway shooting the player from 40 health down to 0, then the game-over screen and the engine's main menu">
      <source src="{{ "/assets/sub-nivis/turret-game-over.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">The turret firing until the player's health reaches 0, followed by the game-over screen.</p>
  </figure>
  <figure>
    <video width="1000" height="600" poster="{{ '/assets/sub-nivis/chaser-line-of-sight-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The block C chaser, with a Doom imp sprite as placeholder art, running at the player with its raycasts drawn as red debug lines">
      <source src="{{ "/assets/sub-nivis/chaser-line-of-sight.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">The chaser with a placeholder imp sprite animated by state. Red lines are debug draws of its raycasts.</p>
  </figure>
  <figure>
    <video width="900" height="540" poster="{{ '/assets/sub-nivis/chaser-ramp-stairs-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="A placeholder face sprite following the player over a ramp and down a flight of stairs, with red debug lines">
      <source src="{{ "/assets/sub-nivis/chaser-ramp-stairs.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">An earlier chaser build (placeholder face sprite) following the player over a ramp and stairs.</p>
  </figure>
</div>

---

## Enemies in block D

<div class="feature-grid">
  <div class="feature-text">
    <h3>Behaviour from a state diagram</h3>
    <p>In block D the chaser received animations drawn by Jesse, the team's visual artist. In week 7 I rebuilt its behaviour from a diagram made with my teammate Stefanos, in which I drew the state panels shown here. The states are idle (the player is outside detection range and the chaser wanders), detection, pursuit towards a circle around the player (from outside or from inside it; the inside approach is slower to leave room for melee kills), engage (circling and strafing the player, reversing direction when the strafe would hit a wall), shooting (standing still briefly while firing) and hurt (a short stun when hit).</p>
    <p>I implemented the random idle walk, the state transitions, strafing, and ledge detection, so that chasers do not walk off platforms while idling or strafing. Ledge avoidance was not in the sprint plan and was added as an unplanned task.</p>
  </div>
  <div class="feature-media">
    <img width="701" height="681" loading="lazy" decoding="async" src="{{ "/assets/sub-nivis/chaser-state-diagram.png" | relative_url }}" alt="State panels for the chaser: idle, detection, pursue from outside the circle, pursue from inside the circle, engage, shooting and hurt, each drawn as the enemy, the player and range circles with short notes">
    <p class="video-caption">My part of the chaser behaviour diagram: one panel per state.</p>
  </div>
</div>

<div class="media-row">
  <figure>
    <video width="900" height="540" poster="{{ '/assets/sub-nivis/chaser-idle-walk-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Several chasers with a placeholder humanoid sprite wandering in different directions across an open floor">
      <source src="{{ "/assets/sub-nivis/chaser-idle-walk.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Random idle walk (placeholder sprite). Magenta lines are debug output.</p>
  </figure>
  <figure>
    <video width="900" height="540" poster="{{ '/assets/sub-nivis/chaser-keep-distance-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Collision debug view: chasers inside wireframe capsules with a wireframe sphere around each head, approaching the player and stopping at a distance">
      <source src="{{ "/assets/sub-nivis/chaser-keep-distance.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Collision debug view: a capsule for the body and a sphere for the head. Chasers approach and hold a distance from the player.</p>
  </figure>
  <figure>
    <video width="900" height="540" poster="{{ '/assets/sub-nivis/chaser-strafe-ledge-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="A group of robot chasers moving sideways on a raised platform at the end of a walkway while the player fires at them, staying on the platform">
      <source src="{{ "/assets/sub-nivis/chaser-strafe-ledge.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Chasers strafing on a raised platform without walking off its edges.</p>
  </figure>
</div>

### Hit feedback

Feedback in week 2, and playtest feedback in week 4, was that it was hard for the player to tell when they had been hit or had hit something. In week 6 I made enemies flash red and play a hurt-stun animation when damaged, and added a headshot mechanic on request, which I completed in week 7. Jesse's headshot and body-shot animations were finished late on the Thursday of week 7; I integrated them on the self-study day, because the final deadline was the Tuesday of week 8. During this work Jesse and I exchanged short work-in-progress videos: I commented on his animations, and he reviewed how I had implemented them in the engine. Following a brainstorm with my teammate Attila, I also added a fire-and-smoke particle effect to the chaser.

<div class="media-row">
  <figure>
    <video width="980" height="540" poster="{{ '/assets/sub-nivis/hit-flash-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The player shooting at a group of placeholder humanoid enemies; the enemy that is hit turns red">
      <source src="{{ "/assets/sub-nivis/hit-flash.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Week 6: enemies flash red when shot (placeholder sprites).</p>
  </figure>
  <figure>
    <video width="900" height="540" poster="{{ '/assets/sub-nivis/headshot-animation-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="A robot chaser shot in the head: its red head separates and the body breaks apart, while a second chaser turns red when hit">
      <source src="{{ "/assets/sub-nivis/headshot-animation.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Week 7: Jesse's headshot animation in the engine. The head separates and the body breaks apart; a second chaser flashes red when hit.</p>
  </figure>
  <figure>
    <video width="900" height="540" poster="{{ '/assets/sub-nivis/chaser-fire-smoke-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Close view from below of a robot chaser hovering on a jet that emits sparks and orange fire particles">
      <source src="{{ "/assets/sub-nivis/chaser-fire-smoke.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Week 7: the fire-and-smoke particle effect under the chaser.</p>
  </figure>
</div>

### Gibbing in three iterations

Feedback in week 2 suggested the gibbing systems of Quake and Doom as a model for kill feedback. The first iteration (week 4) was a spawner function for the enemy behaviour that places debris when an enemy is killed. The second (week 5) attached the spawner to the enemy's death state and launched placeholder pieces with random velocities. At that point the engine had no collision channels, so the debris could not collide with the level while ignoring the player; I requested the feature from the programmer responsible for collision. The third iteration put the debris on the new channels, added a blood-splatter effect using Hana's particle system and replaced the downloaded placeholder textures with simple ones I drew.

<div class="media-row">
  <figure>
    <video width="1200" height="720" poster="{{ '/assets/sub-nivis/gibbing-v1-spawner-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The engine editor with its panels open; red placeholder boxes are spawned and fall onto the floor of a blue room">
      <source src="{{ "/assets/sub-nivis/gibbing-v1-spawner.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">First iteration: the spawner tested in the engine editor with placeholder boxes.</p>
  </figure>
  <figure>
    <video width="900" height="540" poster="{{ '/assets/sub-nivis/gibbing-v2-death-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="An enemy in a dark corridor is shot and breaks into placeholder pieces that fly outward">
      <source src="{{ "/assets/sub-nivis/gibbing-v2-death.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Second iteration: debris spawned from the death state with random velocities.</p>
  </figure>
  <figure>
    <video width="900" height="540" poster="{{ '/assets/sub-nivis/gibbing-v3-channels-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="An enemy is shot and its debris pieces scatter and come to rest on the floor of a blue corridor">
      <source src="{{ "/assets/sub-nivis/gibbing-v3-channels.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Third iteration: debris on its own collision channel, colliding with the level but not with the player.</p>
  </figure>
</div>

---

## Engine structure, PlayStation 4 and build quality

The solution separates the engine, `TheOtherEngine` (a static library in namespace `toe`), from the game, `Sandbox` (an executable in its own namespace that links the engine statically). The game registers its tick function with the engine, which runs the main loop. Platform-specific code follows a convention from the team contract: a shared header with one source file per platform, and per-configuration file exclusion, so that each platform compiles only its own sources.

In week 3 of block C I set up the PlayStation 4 build so that the graphics programmer could start on the console renderer. Several third-party libraries, Bullet Physics among them, did not compile for the console until I added platform preprocessor guards around the incompatible code. In week 5 I helped Hana get WAD loading working on the console. At the end of block C the PlayStation 4 build ran at a roughly stable 16 ms per frame with minor stutters, and the PC build at 3.8 ms per frame on my hardware.

Jenkins checked that a push did not break any build configuration, and ran the unit tests. Teammates often pushed changes that broke the console build and relied on Jenkins to detect this after the fact. I batch-built all configurations in Visual Studio before submitting, and none of the broken console builds came from my submissions. In block D I set up googletest for the project in sprint 1 with basic engine tests, and used Optick whenever performance dropped, reporting findings to the programmer responsible for that code.

---

## Product Owner (block D)

The project had no pre-production phase, so in the first two weeks I produced the material the team lacked: a presentation of the engine's existing features for the new team members, a planning and risk-assessment document, a scope and game-direction presentation for the teaching staff, and a game-direction concept iterated with Attila. In week 4 I ran the poll that gave the game its name.

The recurring tasks were grooming and prioritising the Jira backlog; writing user stories, subtasks linked by their blocking dependencies, and definitions of done; reviewing every card in testing against its definition of done, with a custom Jira filter that also showed each card's remaining estimate; chairing sprint reviews and producing most of their presentations; and publishing the change lists on itch.io. After a rescoping meeting in week 5 concluded that the planned scope could not be delivered, I reworked the sprint backlog around player feedback. Around seven playtest sessions with players from outside the team, held in the university's esports lab, fed into sprint planning in this way.

The sprint reflections record one recurring problem in my own work: unplanned tasks. In sprint 2 I completed one of my planned tasks; most of my time went to unplanned product-owner work, smoke tests, builds and the asset list. For sprint 3 the producer, Tim, changed the planning method: each team member assigned and estimated their own cards within a 15-hour budget, and the QA team took over smoke tests, builds and the asset list. My development time increased, and the sprint's burndown followed the guideline more closely. Peer review stated that my steering of the project could have been firmer. The assessors' advice was to give clearer guidance, balancing setting expectations with checking on progress, rather than to be more possessive about the direction.

---

## Outcome

- The game was published on itch.io in early access, received two updates and a patch, and was released at the end of block D. In 2023 I demonstrated it to the public at *Night of the Nerds*.
- The block D assessment noted that the product ended up quite complete, that I carried the Product Owner role well and that playtest feedback had been applied promptly, and that my individual contribution would have benefited from a more ambitious feature.

## Key takeaways

- **Agree the engine architecture before writing systems.** Engine code from week 1 of block C was written before the structure had been discussed, and part of it was reworked or discarded when the team adopted an ECS (EnTT) in week 2.
- **Configure every target platform from the first build.** The PlayStation 4 configuration was added in week 3, so the library incompatibilities, Bullet Physics among them, had to be resolved together instead of one at a time as they appeared.
- **Track the lifetime of data handed to another system.** The first render from a custom WAD showed noise because the texture data passed to the renderer had already gone out of scope, and the block C log notes that the cause took longer to find than it should have.
- **Compose enemy behaviour from a small set of rules.** The block D chaser combines a few states with local rules, such as reversing the strafe at walls and avoiding ledges, and the week-7 log records emergent behaviour arising from this ruleset.
- **Write unit tests together with each feature.** In block C the WAD parser's tests ran in the Jenkins pipeline on every build. In block D the googletest suite covered basic engine functionality, but new features were largely added without tests, a point made both in my block reflection and in the assessment.

Play it: [SUB NIVIS on itch.io](https://buas.itch.io/sub-nivis).
