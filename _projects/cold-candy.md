---
layout: project
title: Cold Candy
period: "2021"
year: 2021
sort_date: "2021-06"
tags: [Graphics, Gameplay, Unreal, Team]
image: /assets/cold-candy/in-game.jpg
role: Graphics & gameplay programmer, build manager
platform: PC (Unreal Engine 4)
priority: 17
summary: "A first-year Unreal Engine 4 project in a multidisciplinary team: a third-person puzzle platformer with candy-and-ice levels. I developed the physics-based sticky block from a week-one prototype to the designers' specification, wrote the materials the artists requested and managed the weekly builds."
---

Cold Candy was the block D project of the first year at BUas (2020-2021, eight weeks, the first of which had three working days). It was my first project in a game engine and my first in a team with designers and visual artists. The game is a third-person puzzle platformer in which an Inuit protagonist, restricted to movement in one plane, crosses candy-and-ice levels by carrying and placing blocks.

My planned role split was 90 % programming (40 % graphics and tools, 20 % systems, 20 % gameplay) and 5 % each for design and art. The work I delivered was the sticky-block mechanic, the materials the artists asked for, the seal cursor and a level transition, and build management. My two block goals were "make games look pretty", re-scoped in week six to helping the artists get their intended look into the game, and improving my documentation.

<div class="video-showcase">
  <video width="764" height="462" poster="{{ '/assets/cold-candy/in-game-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The protagonist carrying a chocolate block in a candy level, with a green seal circling the block and a light trail between player and block">
      <source src="{{ "/assets/cold-candy/in-game.mp4" | relative_url }}" type="video/mp4">
    </video>
  <p class="video-caption">Final-sprint build. While the player carries a block, the seal (green) circles it and a light trail links it to the player; with nothing carried, the cursor is a glowing orb. The trail is the aurora effect made by another programmer; the seal and cursor behaviour is mine.</p>
</div>

---

## The sticky block

<div class="feature-grid">
  <div class="feature-text">
    <p>The designers' specification defined two block types. A <strong>sticky block</strong> sticks to designated stickable surfaces (certain floors, walls, ceilings and moving platforms) when the player releases it, and detaches when the player picks it up again. Normal blocks can be attached to a sticky block and carried with it as one unit, and a sticky block wedged between a moving platform and a stickable surface stops the platform. The player must not be able to interact with a block while carrying it, to prevent riding on it ("prop surfing").</p>
    <p>On the sprint-two Trello card the programming half of the work was mine (sticky-to-normal behaviour, carrying several objects, the moving-platform behaviour) and the art half (model, UVs, rig, texture, import) was an artist's. The stretch goal on that card, a "sticky feel", was not completed.</p>
    <p>The first version was a prototype the designers requested in week one for the pitch demo. It checked whether the block had hit a <code>BP_StickyWall</code> and, if so, switched off the block's own physics simulation. In week two I added a jiggle effect: a skeletal-mesh cube, rigged in Blender, whose bones are driven by physics constraints so that the mesh deforms as it moves.</p>
  </div>
  <div class="feature-media">
    <video width="788" height="612" poster="{{ '/assets/cold-candy/sticky-prototype-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The first sticky block prototype: blocks shot at a wall stop on contact and stay there">
      <source src="{{ "/assets/cold-candy/sticky-prototype.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Week 1 prototype: blocks that hit the sticky wall disable their own physics. The black trail on the floor is the visible stamp of the first snow test in the same project.</p>
    <video width="882" height="452" poster="{{ '/assets/cold-candy/jiggle-prototype-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Skeletal-mesh cubes dropping onto a floor in a lighting test scene">
      <source src="{{ "/assets/cold-candy/jiggle-prototype.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Week 2 jiggle test: cubes using my first Blender skeleton, with physics-driven bones, dropped onto the floor. The result was not what I wanted, and an artist rebuilt the mesh the following week.</p>
  </div>
</div>

### Week 3: the artist's mesh and the first in-level version

I described the bone structure I needed and asked for rounded edges, and an artist rebuilt the mesh to that structure. I set up its physics asset in Unreal and built the first version of the block in the team's showcase level. Feedback from a teammate that week named two problems: the player could prop-surf, and the block "doesn't always sit flush/flat" against the surface it sticks to. A block at an arbitrary angle is unreliable as a platform.

<div class="media-row">
  <figure>
    <img width="1400" height="784" loading="lazy" decoding="async" src="{{ "/assets/cold-candy/physics-asset-constraints.jpg" | relative_url }}" alt="Unreal physics asset editor showing a pink cube with collision bodies and the constraint settings panel">
    <p class="video-caption">The artist's cube in Unreal's physics asset editor: seven bodies (the root and bones for front, back, left, right, top and ground) joined by six constraints. The selected Bone_Top constraint has limited linear motion (limit 8), limited swing (12&deg;) and free twist.</p>
  </figure>
  <figure>
    <video width="960" height="472" poster="{{ '/assets/cold-candy/sticky-angles-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/cold-candy/sticky-angles.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Week 3, first version in the showcase level: the block sticks to the wall at whatever angle it arrives.</p>
  </figure>
</div>

### Week 4: snapping flush to the surface

I sketched two approaches on paper. The first placed collision spheres on the cube's corners and made the cube stick once its corners touched the same sticky volume. The second placed a collider on each face; when a face collider overlaps a sticky surface, the cube finds the surface normal at the contact point and interpolates its rotation until that face is parallel to the surface, with no other transformation. I implemented the second approach in Blueprint with box colliders.

The snap was partly a workaround. I had spent much of week four on problems with UE4's built-in physics materials, including an engine bug; after I discussed it with a teacher, he advised finding a workaround instead of continuing to adjust the same settings.

In the same week I wrote *The Art of Sticking*, a step-by-step guide to setting up the mechanic in a level. By the end of the sprint four designers had used it instead of asking me. It did not mention that the snap colliders were editable, so the designers did not know they could tune them.

<div class="media-row">
  <figure>
    <img width="760" height="1014" loading="lazy" decoding="async" src="{{ "/assets/cold-candy/snap-sketch-corner-spheres.jpg" | relative_url }}" alt="Notebook sketch of a cube with collision spheres on its corners touching a sticky volume">
    <p class="video-caption">First sketch: collision spheres on the corners; the cube sticks once they touch the same sticky volume.</p>
  </figure>
  <figure>
    <img width="760" height="654" loading="lazy" decoding="async" src="{{ "/assets/cold-candy/snap-sketch-face-colliders.jpg" | relative_url }}" alt="Notebook sketch of a cube with a collider on each face, with notes on finding the surface normal and interpolating to its angle">
    <p class="video-caption">Second sketch: one collider per face; find the normal at the collision point and interpolate the rotation to match it.</p>
  </figure>
  <figure>
    <video width="676" height="432" poster="{{ '/assets/cold-candy/sticky-snap-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/cold-candy/sticky-snap.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Week 4 implementation with the debug volumes visible: the face colliders detect the red sticky surfaces and the cube rotates flush with them.</p>
  </figure>
</div>

### Weeks 5 and 6: attaching blocks and stopping platforms

In week five I implemented attaching normal blocks to a sticky block with Unreal's attach system. The main difficulty was the attached block's collision settings, so that it does not collide with the player while carried. Team feedback that week described the collisions as "really buggy"; one teammate suggested letting the player push a carried block away instead of disabling collision, which could also prevent prop surfing.

The last behaviour, in week six, was stopping a moving platform with a sticky block between the platform and a stickable surface. The moving platform already had a stop function, so the work consisted of determining the conditions under which to call it. The same week a teammate reported that the cubes felt "a bit tighter" but were "still a bit buggy".

<div class="media-row">
  <figure>
    <video width="576" height="314" poster="{{ '/assets/cold-candy/block-on-block-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/cold-candy/block-on-block.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Week 5: the red sticky block is stuck to a sticky wall, then a chocolate-textured normal block is attached to it.</p>
  </figure>
  <figure>
    <video width="716" height="440" poster="{{ '/assets/cold-candy/sticky-platform-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/cold-candy/sticky-platform.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Week 6: a sticky block between the moving platform and the floor stops the platform until the player picks the block up.</p>
  </figure>
</div>

---

## Materials requested by the artists

<div class="feature-grid">
  <div class="feature-text">
    <p><strong>Chocolate river.</strong> In week six an artist asked for different kinds of molten chocolate swirling together in a river. After research on Shadertoy, I built it with sinusoidal <strong>UV distortion</strong> and exposed the shape controls (<code>a</code>, <code>b</code>, loop count, time and UV multipliers, specular, colour) as material parameters, so that the artists set the final look.</p>
    <p><strong>Ice and sugar.</strong> In week two I made a procedural ice material from Perlin noise. An art student outside BUas suggested a bluer sub-surface colour; instead of choosing it myself I exposed the noise textures, the sub-surface colour, the spikiness and the "spike map" as parameters and left the choice to our artist. Alongside it I made a first-pass sugar-crystal material that I intended to redo with an artist.</p>
    <p><strong>Dynamic snow.</strong> Snow that deforms around the player, using <strong>runtime virtual textures</strong>, was my week-one demo. In the first version the stamp was visible to the player as a black area; in week two I found I was rendering the stamp into the wrong buffer. The designers could not build a mechanic on it, so it was cut during concepting. I reused the technique the following year for the environmental transformation in <a href="{{ '/biome/' | relative_url }}">Biome</a>.</p>
  </div>
  <div class="feature-media">
    <img width="591" height="373" loading="lazy" decoding="async" src="{{ "/assets/cold-candy/chocolate-params.png" | relative_url }}" alt="Unreal material instance panel exposing a, b, loops, specular, time and UV multipliers and a colour for the chocolate shader">
    <p class="video-caption">The parameters as the artist set them: a = 2.20, b = 3.45, loops = 20, time multiplier 0.08, UV multiplier 4.</p>
  </div>
</div>

<div class="media-row">
  <figure>
    <video width="822" height="540" poster="{{ '/assets/cold-candy/chocolate-test-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/cold-candy/chocolate-test.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Week 6: the chocolate shader on a test plane before the artist's parameters, with swirls from sinusoidal UV distortion.</p>
  </figure>
  <figure>
    <video width="1004" height="540" poster="{{ '/assets/cold-candy/chocolate-river-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/cold-candy/chocolate-river.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">The same shader in the level with the artist's parameters, as the chocolate river.</p>
  </figure>
</div>

<div class="media-row">
  <figure>
    <video width="532" height="540" poster="{{ '/assets/cold-candy/ice-shader-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/cold-candy/ice-shader.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Week 2: the procedural ice material on a sphere.</p>
  </figure>
  <figure>
    <video width="502" height="526" poster="{{ '/assets/cold-candy/sugar-shader-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/cold-candy/sugar-shader.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Week 2: the first-pass sugar-crystal material on a cube.</p>
  </figure>
  <figure>
    <video width="858" height="524" poster="{{ '/assets/cold-candy/snow_demo-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/cold-candy/snow_demo.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Week 1 snow test: the deformation stamp is rendered visibly as a black area following the player.</p>
  </figure>
  <figure>
    <video width="768" height="540" poster="{{ '/assets/cold-candy/snow-working-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/cold-candy/snow-working.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Week 2, after the buffer fix: the player leaves a trench in the snow.</p>
  </figure>
</div>

---

## Seal cursor, level transition and level streaming

In the final sprint I worked in a feature team with another programmer and an artist on the "Seal & Cursor" sprint goal: the seal hovering around a carried block, a pointer effect, a brief increase in the intensity of the aurora effect when the player picks something up, and the transition from seal to pointer. I implemented the seal behaviour in Blueprint on the artist's animation: it circles whichever block the player picks up and turns to look between the block and the player. The other programmer joined because they had made the aurora effect; my evaluation at the time was that technical documentation of the effect would have made that unnecessary.

In week eight I added a camera transition between sections of a level, one of the team's stretch goals. Earlier, after finishing my sprint tasks, I had tested Unreal's level streaming and proposed it to the designers as an optimisation; by then production was too far along and the proposal was declined.

<div class="media-row">
  <figure>
    <video width="824" height="470" poster="{{ '/assets/cold-candy/seal-cursor-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/cold-candy/seal-cursor.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Week 7: when the player picks up a block, the seal (the artist's animated model) circles it.</p>
  </figure>
  <figure>
    <video width="966" height="540" poster="{{ '/assets/cold-candy/level-transition-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/cold-candy/level-transition.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Week 8: the camera moves from one section of the candy level, through the gap in the wall, to the next.</p>
  </figure>
  <figure>
    <img width="1400" height="628" loading="lazy" decoding="async" src="{{ "/assets/cold-candy/level-streaming-test.jpg" | relative_url }}" alt="Unreal editor with a level loaded as a persistent level and two streamed sub-levels listed in the Levels panel">
    <p class="video-caption">Level-streaming test: a persistent level with two streamed sub-levels.</p>
  </figure>
</div>

---

## Build management

From the first build I acted as build manager: I collected everyone's work on Thursdays so that a build existed by the end of the day, smoke-tested it before playtests, and either hot-fixed or reverted to a working revision whatever broke. For a playtest at 1 o'clock on 23 June I planned an hour beforehand to build and smoke-test. From week five I also fixed the major bugs before each build was uploaded to itch.io. One example of a build issue: a teammate reported in week four that the build launched SteamVR on machines where it was installed, so I disabled the unused SteamVR plugin for the next build. Submits followed the Perforce and Unreal naming conventions in the team contract.

## Team process

The team planned three sprints on Trello with story-point estimates (a large task was 8 points). The first sprint's goals were multidisciplinary and too large: a goal could only be closed once every discipline's part was done, and the burndown chart shows about 34 of 130 points completed. For the second sprint we split work into smaller tasks and formed feature teams, and about 130 of 175 points were completed. For the third sprint, which also had to fit the documentation, we planned about half the points of the first sprint, and about 60 of 68 were completed. (Values read from the team's burndown charts.)

## Feedback and evaluation

- **Peer reviews.** The week-six review said I had done "an excellent job of getting some crazy ideas like the sticky block behaviours or the chocolate effects working in game" by asking people what they meant and checking back once it was built. Both the week-three and week-six reviews asked me to speak up more in meetings ("you have smart things to say, it would be a pity to miss them"); my action was to raise my hand in Teams calls.
- **Goal evaluation.** In week eight I asked each artist on the team whether my work had helped bring their artistic vision into the game. The four answers referred to specific work: the seal, the sticky block, the chocolate river and the ending sequence, and, from one artist, help with a clothing simulation that was not used in the end, the chocolate shader, the sticky block matching the concept art, and the early snow shader. Four self-solicited answers are a limited measure, but each names specific features.

## Key takeaways

- **Evaluate engine features during concepting.** Level streaming was proposed as an optimisation too late in production to be adopted, and the end-of-block evaluation concluded that the programmers should have researched Unreal's built-in features and suitable data structures for optimisation in the concepting phase.
- **Set a cut-off between new features and polish.** The last mechanic went in during week six, which left about one week to polish everything, and the week-seven reflection judged that some late work would have been better spent on testing and polishing existing features. The week-six peer review suggested declining requests that could not be finished in time, and the resulting plan was a fixed point after which no new content is started.
- **Document a feature's implementation as well as its use.** Four designers set up the sticky block from *The Art of Sticking* without asking me, but the guide did not cover the tunable snap colliders, and the aurora effect's author had to join the final feature team to change that effect, which technical documentation would have made unnecessary. The end-of-block evaluation recommended technical documentation for every feature so that other team members can adjust it or take it over.
- **Leave artistic choices to the artists, through parameters and clear specifications.** I specified the bone structure I needed so that an artist could rebuild the sticky-block mesh, and exposed the ice and chocolate materials' textures, colours and shape controls as parameters for the artists to set. In the next team project, [Nuts N' Found]({{ '/nuts-n-found/' | relative_url }}) (year two, block B), teammates' peer reviews named the same practice, exposing the values designers would want to tweak, as a strength.
