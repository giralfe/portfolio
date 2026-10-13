---
layout: project
title: Sporadic
period: "2023"
year: 2023
sort_date: "2023-02"
tags: [Gameplay, Graphics, Unreal, Team]
image: /assets/sporadic/logo-card.jpg
repo: https://alucardt.itch.io/sporadic
role: Gameplay programmer (student jam team)
platform: PC (Unreal Engine 5)
priority: 19
summary: "A Global Game Jam 2023 puzzle-platformer built in seven days by a student team. The player controls a fungus that escapes a laboratory by taking over a mouse and a bird. I implemented the drop shadows, the take-over presentation, wall climbing, grid-locked pushable boxes, the mouse's dash with movement VFX, and an outline post-process for occluded characters."
trailer: _rQ8wNwwWUA
trailer_caption: "Global Game Jam 2023 trailer, created by team member Luca Yavuzok."
---

Sporadic was made for **Global Game Jam 2023**, from Monday 30 January to Sunday 5 February 2023, in the self-study weeks at the end of block B of my third year at BUas (the [S.P.L.I.C.E.D.]({{ '/spliced/' | relative_url }}) year). The game is a puzzle-platformer in which the player controls a fungus that can take over other creatures, and leaves a laboratory by possessing a mouse and a bird. I worked as a gameplay programmer in Unreal Engine 5. The sections below cover the six features I documented in my learning log for that period; three of them went through a second version during the week.

---

## Implementation

<div class="feature-grid">
  <div class="feature-text">
    <h3>Drop shadows</h3>
    <p>The level design included platforming, and in a 3D view without a ground reference the player cannot judge where a jump will land. The first version used a <strong>line trace</strong> straight down from the character; a decal is projected onto the floor at the hit point and shrinks as the distance between the character and the ground increases. Every character received the same decal shape.</p>
    <p>The second version replaced the decal with an <strong>orthographic scene capture</strong> that renders the characters from above into a 2D render target. I masked the render target to the characters' silhouettes and used the result as the shadow, so the shadows are dynamic and each character's shadow has its own shape. The capture renders the characters a second time; its cost was not measured, as no feature was profiled during the jam.</p>
    <h3>Take-over presentation</h3>
    <p>Taking over another creature is the core mechanic. The first version switched control directly from the fungus to the target, with no transition. I extended it with a camera blend from the current camera to the new character's camera, mushroom parts that grow on the mouse, the mouse's possession animation, and two VFX: purple particles and a dissolve on the fungus character. The same sequence applies when the fungus takes over the bird.</p>
  </div>
  <div class="feature-media">
    <video width="1100" height="594" poster="{{ '/assets/sporadic/drop-shadow-linetrace-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The first drop shadow: a decal under a test mannequin, scaled by a downward line trace, in a grey blockout level">
      <source src="{{ "/assets/sporadic/drop-shadow-linetrace.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">First version in the grey blockout: one downward trace and one decal, scaled by distance to the ground.</p>
    <video width="886" height="540" poster="{{ '/assets/sporadic/drop-shadows-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Test scene where the fungus character casts a silhouette drop shadow from the render-target capture, then takes over the mouse in a burst of purple particles" style="margin-top:1rem">
      <source src="{{ "/assets/sporadic/drop-shadows.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Second version: silhouette shadows from the orthographic capture. The clip also shows the revised take-over of the mouse (purple particles, fungus dissolve).</p>
    <video width="1100" height="594" poster="{{ '/assets/sporadic/take-over-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The first take-over in a test map: a grey, untextured fungus model stays in place while control switches to the mouse with no transition effects" style="margin-top:1rem">
      <source src="{{ "/assets/sporadic/take-over.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">First take-over: control switches from the untextured fungus to the mouse without a camera blend or effects.</p>
  </div>
</div>

<div class="feature-grid reverse">
  <div class="feature-media">
    <video width="860" height="540" poster="{{ '/assets/sporadic/wall-climb-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The mouse climbing a slanted fence onto a white platform in the test scene">
      <source src="{{ "/assets/sporadic/wall-climb.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">The mouse climbing a slanted fence in the test scene.</p>
    <video width="1100" height="758" poster="{{ '/assets/sporadic/wall-climb-angles-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The mouse climbing slanted orange walls in the test level, with an On Wall debug message printed while it is attached" style="margin-top:1rem">
      <source src="{{ "/assets/sporadic/wall-climb-angles.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Revised climb on walls at different angles. The "On Wall" text is a debug print of the climb state.</p>
    <video width="796" height="540" poster="{{ '/assets/sporadic/push-box-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The fungus takes over the mouse, which then pushes a white box that moves along the grid" style="margin-top:1rem">
      <source src="{{ "/assets/sporadic/push-box.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Take-over of the mouse, followed by a grid-constrained push.</p>
  </div>
  <div class="feature-text">
    <h3>Wall climbing</h3>
    <p>The first version aimed only at being functional: impulses push the mouse up the wall when the player times the inputs correctly. This did not match what the level designers had planned, so I revised it. In the second version the mouse rotates to align with the wall while climbing, and climbing works on walls at any angle, so designers can place slanted walls.</p>
    <h3>Pushable boxes</h3>
    <p>Boxes can be pushed only by the mouse, and they move only along the game's grid. A smoke VFX plays when a box lands on the ground.</p>
  </div>
</div>

<div class="feature-grid">
  <div class="feature-text">
    <h3>Movement VFX and dash</h3>
    <p>I used the movement feedback in <em>Super Mario 3D Land</em> (Nintendo, 2011) as a reference for adding smoke-puff VFX to character movement, and added one new mechanic with them: a <strong>dash</strong> for the mouse.</p>
    <h3>Outline post-process</h3>
    <p>Level geometry can sit between the camera and a player character. I wrote an outline post-process shader that draws the player characters' silhouettes through occluding geometry, so the player can locate them behind walls.</p>
  </div>
  <div class="feature-media">
    <video width="768" height="540" poster="{{ '/assets/sporadic/dash-vfx-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The possessed mouse running, jumping and dashing in a test map, leaving smoke puffs and a ring of dust on landing">
      <source src="{{ "/assets/sporadic/dash-vfx.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Smoke puffs on running and landing, and the dash, in a test map.</p>
    <video width="1100" height="594" poster="{{ '/assets/sporadic/outline-editor-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The outline post-process in the editor: character silhouettes drawn in cyan through a solid white wall" style="margin-top:1rem">
      <source src="{{ "/assets/sporadic/outline-editor.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">The outline effect in an editor test: character silhouettes drawn in cyan through a solid wall.</p>
  </div>
</div>

---

## The systems in the jam build

The clips above are from test maps. The clips below are cut from the team trailer (created by Luca Yavuzok) and show the same systems in the final levels; the level art, characters and animation are the team's.

<div class="media-row">
  <figure>
    <video width="960" height="540" poster="{{ '/assets/sporadic/jam-wall-climb-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The possessed mouse climbing two fence-covered blocks in a lab room, with a ring of dust where it lands">
      <source src="{{ "/assets/sporadic/jam-wall-climb.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Wall climbing on fence-covered blocks, with the landing dust ring.</p>
  </figure>
  <figure>
    <video width="960" height="540" poster="{{ '/assets/sporadic/jam-movement-puffs-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The yellow fungus character walking along a lab bench past a vent, leaving small smoke puffs">
      <source src="{{ "/assets/sporadic/jam-movement-puffs.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">The fungus on a lab bench, with movement puffs.</p>
  </figure>
  <figure>
    <video width="960" height="540" poster="{{ '/assets/sporadic/jam-push-box-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The possessed mouse pushing a white box along a corridor in a maze of grey blocks">
      <source src="{{ "/assets/sporadic/jam-push-box.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">A grid-locked box pushed through a block maze.</p>
  </figure>
  <figure>
    <video width="960" height="540" poster="{{ '/assets/sporadic/jam-dash-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The possessed mouse jumping off a fence-covered block and dashing across a gap, leaving a trail of smoke, next to a green vent and a Green Switches objective">
      <source src="{{ "/assets/sporadic/jam-dash.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">The mouse's dash across a gap, with its smoke trail.</p>
  </figure>
</div>

<div class="media-row">
  <figure>
    <img width="720" height="405" loading="lazy" decoding="async" src="{{ "/assets/sporadic/screenshot1.png" | relative_url }}" alt="Sporadic: the yellow fungus character on a lab bench next to a red vent, with a small dust puff behind it">
    <p class="video-caption">The fungus on a lab bench.</p>
  </figure>
  <figure>
    <img width="720" height="405" loading="lazy" decoding="async" src="{{ "/assets/sporadic/screenshot2.png" | relative_url }}" alt="Sporadic: the possessed bird over a pool of green goo in the rain, with the mouse lying on a dark crate below">
    <p class="video-caption">The possessed bird over the goo, with the mouse on a crate below.</p>
  </figure>
</div>

---

## Iterations

Three features were implemented twice within the seven days:

- **Drop shadow:** a single line-trace decal gave every character the same shape; the scene-capture version gives each character its own silhouette.
- **Take-over:** the direct control switch had no visual transition; the revised version adds the camera blend, mesh growth, possession animation and VFX.
- **Wall climb:** the timed-impulse climb did not match the level designers' intent; the revised version aligns the mouse to the surface and supports walls at any angle.

## Key takeaways

- **Reach a functional version first, then revise it against the team's intent.** The wall climb was deliberately built to function first, and each of the three revisions above replaced a working first version within the seven days.
- **Give the player spatial references in a 3D view.** The drop shadow shows where a jump will land, and the outline post-process shows a character's position behind level geometry.
- **Treat visual feedback as part of a mechanic.** Besides the take-over revision above, I added smoke puffs on movement and landing and a landing smoke for pushed boxes to mechanics that already worked, with the movement feedback of *Super Mario 3D Land* as the reference for the puffs.

The jam build is available on [itch.io](https://alucardt.itch.io/sporadic) and on the [Global Game Jam site](https://globalgamejam.org/2023/games/sporadic-6).
