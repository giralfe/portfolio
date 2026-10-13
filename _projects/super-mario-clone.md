---
layout: project
title: Super Mario Bros Clone
period: "2020"
year: 2020
sort_date: "2020-11"
tags: [Gameplay, Physics, C++, Solo]
image: /assets/super-mario-clone/polished-gameplay-poster.jpg
role: Solo Developer
platform: Windows · C++ · framebuffer template
priority: 20
summary: "Five weeks of first-year block A at BUas: a solo Super Mario Bros clone on the same framebuffer template as the Asteroids Clone. A Tiled CSV tilemap, a forward-only camera with sub-tile scrolling, impulse-and-gravity jumps, tile-grid and AABB collision, a fixed-pool entity manager and four levels. Peer review found that jump height depended on the monitor's refresh rate."
---

Weeks four to eight of block A in my first year at BUas (2020) went into a minimum viable Super Mario Bros clone built around World 1-1, following three weeks on the [Asteroids Clone]({{ '/asteroids-clone/' | relative_url }}). The work was solo. The template ("Tmpl8") provided a framebuffer surface, a sprite class and a 2D vector type, and the STL was not permitted, so the tilemap, camera, physics, collision and entity management were written for this project. The brief required switching between four levels.

<div class="video-showcase">
  <video width="640" height="540" data-autoplay loop muted playsinline preload="none" poster="{{ '/assets/super-mario-clone/polished-gameplay-poster.jpg' | relative_url }}" aria-label="The opening of World 1-1 with scrolling, a ? block, a goomba and a lives counter"><source src="{{ '/assets/super-mario-clone/polished-gameplay.mp4' | relative_url }}" type="video/mp4"></video>
  <p class="video-caption">End of block: the opening of World 1-1, with scrolling, the ? blocks, a goomba and the lives counter.</p>
</div>

---

## Iterations

Week four produced no runnable build. I spent it on research, a feature document and a first code structure, and skipped that week's peer review, judging that feedback on research notes would be of little use. The first level format was JSON, which I could not parse in the form I wanted; Tiled's CSV export replaced it.

Week five drew the first tilemap from the tile sheet. A lecturer (Brian) pointed out in review that a sprite object per static tile costs more than drawing tiles directly from the sheet, since sprites carry features such as movement, so I switched to drawing from the sheet. Week six added player movement with acceleration and friction on a shared `baseEntity` class. Collision was deliberately limited to the downward case so that movement work could start; the week-six review (Martijn) observed that only downward collision was present and that the game crashed when Mario left the screen, both of which were known issues. The same week a classmate spotted a memory leak that I had missed while debugging.

<div class="media-row">
  <figure>
    <img width="1280" height="260" loading="lazy" decoding="async" src="{{ "/assets/super-mario-clone/w5-first-tilemap.png" | relative_url }}" alt="Week-five render: ground, brick and ? block tiles drawn from the tile sheet on a black background">
    <p class="video-caption">Week five: tiles drawn from the tile sheet according to the CSV tilemap, before sky, player or scrolling.</p>
  </figure>
  <figure>
    <video width="1070" height="316" poster="{{ '/assets/super-mario-clone/w6-movement-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Week-six build: Mario walking and jumping on a static, non-scrolling screen with a black background">
      <source src="{{ "/assets/super-mario-clone/w6-movement.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Week six: walking with acceleration and friction, and jumping, on a static screen. Thin vertical lines in the hill tiles are the tile-drawing artefacts noted in the week-six log.</p>
  </figure>
</div>

<div class="feature-grid">
  <div class="feature-media">
    <video width="480" height="420" poster="{{ '/assets/super-mario-clone/closeup-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline preload="none" aria-label="Week-seven build scrolling through World 1-1">
      <source src="{{ "/assets/super-mario-clone/closeup.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Week seven: scrolling through World 1-1. The dark strip along the right edge is one of the two texture bugs a reviewer reported that week.</p>
  </div>
  <div class="feature-text">
    <h3>Week seven: scrolling and the MVP review</h3>
    <p>Week seven fixed the tile artefacts, which were caused by the tile draw routine (the week-six log suspected its scaling method), along with other small bugs, and used Visual Studio's call stack to trace their causes. The level now scrolled, Mario ran and jumped, and the ? blocks were animated, but there were no enemies and no interaction with blocks.</p>
    <p>Martijn's review that Friday described the build as close to a minimum viable product, missing "a few of the essentials such as enemies and/or interaction". He also noted that the jump always reached the same height, that the controls looked fast with no distinction between walking and running, and two texture bugs (the right screen edge and the pipes). I set enemies and player death as the priority for week eight.</p>
  </div>
</div>

Week eight implemented goombas, player death and lives, item drops from ? blocks, the size change from mushrooms, and level switching across four levels. Reaching this minimum viable product required overtime in the final week; the block total was 280.75 hours against the 280-hour limit I had set as a goal.

<div class="media-row">
  <figure>
    <video width="640" height="540" poster="{{ '/assets/super-mario-clone/w8-powerup-and-death-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Mario bumps a ? block, collects the mushroom, flattens a goomba, shrinks, falls into a pit and respawns with one life fewer">
      <source src="{{ "/assets/super-mario-clone/w8-powerup-and-death.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Bumping a ? block releases a mushroom that makes Mario big. He flattens one goomba by landing on it and shrinks after touching another; falling into a pit then costs a life (LIVES 3 to 2) and restarts the level.</p>
  </figure>
  <figure>
    <video width="640" height="540" poster="{{ '/assets/super-mario-clone/w8-level-switch-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="End of World 1-1 at the flagpole and castle, then the second level loading and a ? block releasing a mushroom">
      <source src="{{ "/assets/super-mario-clone/w8-level-switch.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Reaching the flagpole at the end of World 1-1 loads the second level, where a ? block releases a mushroom that moves along the ground.</p>
  </figure>
  <figure>
    <video width="640" height="540" poster="{{ '/assets/super-mario-clone/w8-end-of-game-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="End of the third level, the short fourth level and the END OF GAME screen">
      <source src="{{ "/assets/super-mario-clone/w8-end-of-game.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">The end of the third level, the short fourth level, and the end-of-game screen after its flagpole.</p>
  </figure>
</div>

---

## Level data and rendering

<div class="feature-grid">
  <div class="feature-text">
    <p>Levels are authored in Tiled and exported as CSV. Each level has two layers: a foreground tile layer and an entity layer whose cells mark spawn points. A small parser of my own reads the file into a 16,000-byte character buffer, scans the first 10,000 characters, splits on commas and newlines, and converts each field (up to four characters) with <code>atoi</code> into a 2D integer array <code>map[y][x]</code>. Functions such as <code>getTileType(x, y)</code> on this array serve the collision checks. The fixed buffer is the parser's main flaw, which I accepted because memory use was not a constraint for this project.</p>
    <p>The draw routine covers a window of 17 by 14 tiles of 32&nbsp;px: the 512&nbsp;px screen holds 16 columns, and the extra column covers the partially visible tile at the scroll offset. Each non-empty tile index is converted into a row and column of the tile sheet and copied to the framebuffer at its screen position minus the sub-tile offset.</p>
  </div>
  <div class="feature-media">
    <img width="1600" height="531" loading="lazy" decoding="async" src="{{ "/assets/super-mario-clone/tiled-editor.png" | relative_url }}" alt="Tiled editor with a level containing a row of ? blocks and a stepped pyramid, next to the tile sheet">
    <img width="1140" height="311" loading="lazy" decoding="async" src="{{ "/assets/super-mario-clone/level-csv.png" | relative_url }}" alt="World 1-1 foreground CSV open in a text editor">
  </div>
</div>

<div class="feature-grid reverse">
  <div class="feature-media">
    <img width="642" height="580" loading="lazy" decoding="async" src="{{ "/assets/super-mario-clone/coord-system.png" | relative_url }}" alt="Annotated screenshot showing world-space and screen-space coordinates around Mario, with screenX at 260 and Mario at world x 500">
  </div>
  <div class="feature-text">
    <h3>Camera: world space and screen space</h3>
    <p>Mario's world x determines <code>screenX</code>, the world x of the window's left edge: <code>screenX = x + 16 - SCRWIDTH / 2</code>, where 16 is half of Mario's 32&nbsp;px width. With Mario at world x&nbsp;=&nbsp;500 and a 512&nbsp;px screen, screenX&nbsp;=&nbsp;500&nbsp;+&nbsp;16&nbsp;&minus;&nbsp;256&nbsp;=&nbsp;260, and his screen x is 500&nbsp;&minus;&nbsp;260&nbsp;=&nbsp;240, which centres his 32&nbsp;px sprite on pixel 256.</p>
    <p><code>Xoffset = screenX % 32</code> is the sub-tile pixel offset passed to the draw routine, so the map scrolls one pixel at a time instead of one tile at a time. As in the original game, the camera only moves forward: screenX is updated only while Mario's x velocity is positive, and is clamped to its previous value. The camera does not follow vertically (<code>screenY = 0</code>) on the 432&nbsp;px high screen. In week seven I advised a classmate against tracking the player's y position with the camera, on the grounds that it causes motion sickness.</p>
  </div>
</div>

---

## Movement and gravity

<div class="feature-grid">
  <div class="feature-text">
    <p>Every entity inherits position, velocity and acceleration vectors (the template's <code>vec2</code>) from <code>baseEntity</code>, together with an <code>updatePosition</code> method that receives the level data (a <code>LevelParser</code> pointer) for collision checks. Holding a direction adds <code>RATE_OF_ACCELERATION</code> to the x velocity on each update while it is below <code>MAX_WALK_SPEED</code>, and friction reduces it.</p>
    <p>The jump does not use the acceleration vector. Pressing jump applies a single upward impulse to the y velocity, and <code>addyVel(GRAVITY)</code> runs on every update, so the upward velocity decreases to zero at the apex and the downward velocity then grows until the ground check sets it to zero. The candidate position is <code>newPosition = position + velocity * deltaTime</code>, an explicit Euler step, and the trajectory is a parabola. The velocity increments for gravity and walking contain no <code>deltaTime</code>; the consequence is described under Evaluation.</p>
  </div>
  <div class="feature-media">
    <img width="654" height="430" loading="lazy" decoding="async" src="{{ "/assets/super-mario-clone/gravity-diagram.png" | relative_url }}" alt="Hand-drawn diagram of a parabolic jump arc with a constant downward gravity vector at each point">
  </div>
</div>

---

## Collision and entities

<div class="feature-grid reverse">
  <div class="feature-media">
    <img width="1057" height="893" loading="lazy" decoding="async" src="{{ "/assets/super-mario-clone/tile-collision-diagram.png" | relative_url }}" alt="Tile collision diagram: the player's current box, the candidate box after moving right, and the two probe points at the top corner and 30 pixels below it">
    <img width="1387" height="1039" loading="lazy" decoding="async" src="{{ "/assets/super-mario-clone/aabb-diagram.png" | relative_url }}" alt="AABB overlap diagram between the player's green box and an entity's red box">
  </div>
  <div class="feature-text">
    <h3>Tiles</h3>
    <p>Tile collision tests the candidate position against the map before it is accepted. For a move to the right, the candidate x divided by 32 gives a tile column; the check looks at the next column at two heights, the entity's top edge and a point 30&nbsp;px lower. The second probe stops 2&nbsp;px short of the full 32&nbsp;px tile height so that walking along the floor does not register as a wall. On a hit the move is cancelled, the x velocity is set to zero and a right-collision flag is set. The log documents the right-hand case in detail.</p>
    <h3>Entities</h3>
    <p>Player-to-entity collision is an axis-aligned bounding box (AABB) overlap test. The player box is 32&nbsp;px high, or 64&nbsp;px when Mario is big. The <code>EntityManager</code> holds fixed arrays of 50 goombas and 10 mushrooms, so nothing is allocated at runtime. A flag marks entities that are not yet spawned; <code>initEntities</code> assigns them spawn positions from the entity layer, and <code>updateAllEntities</code>, called once per frame, updates and collision-tests only entities near the visible window (the mushroom loop, for example, requires screenX&nbsp;&lt;&nbsp;x&nbsp;&lt;&nbsp;screenX&nbsp;+&nbsp;SCRWIDTH&nbsp;&minus;&nbsp;32). A mushroom that is out of its block and overlaps the player stops updating and calls <code>setBig()</code> on the player.</p>
    <p>Level switching is a <code>switch</code> statement over the four levels, which met the brief; supporting more levels would need a level index mapped to a file path.</p>
  </div>
</div>

<div class="video-showcase wide">
  <img width="1350" height="1094" loading="lazy" decoding="async" src="{{ "/assets/super-mario-clone/class-diagram.png" | relative_url }}" alt="UML class diagram: Goomba, Mushroom and Player extend baseEntity; EntityManager owns goomba and mushroom arrays; Game owns the player, the entity manager and two LevelParser instances">
  <p class="video-caption">UML class diagram from the learning log. Goomba, Mushroom and Player extend <code>baseEntity</code>; <code>Game</code> owns the player, the <code>EntityManager</code> and two <code>LevelParser</code> instances (foreground and entity layers).</p>
</div>

<div class="media-row">
  <figure>
    <img width="1125" height="651" loading="lazy" decoding="async" src="{{ "/assets/super-mario-clone/mushroom-flowchart.jpg" | relative_url }}" alt="Flowchart of mushroom behaviour: on-screen check, in-block check, movement with collision, player collision making the player big, and stopping updates">
    <p class="video-caption">Mushroom update logic.</p>
  </figure>
  <figure>
    <img width="542" height="484" loading="lazy" decoding="async" src="{{ "/assets/super-mario-clone/game-state-flowchart.jpg" | relative_url }}" alt="Hand-drawn flowchart of game states: start screen, levels in sequence, death screen, lives check, game over or return to the start of the level">
    <p class="video-caption">Game states: start screen, levels in sequence, and the death and game-over flow.</p>
  </figure>
  <figure>
    <img width="1034" height="552" loading="lazy" decoding="async" src="{{ "/assets/super-mario-clone/entity-manager.png" | relative_url }}" alt="EntityManager class header with fixed arrays of 50 goombas and 10 mushrooms">
    <p class="video-caption">The <code>EntityManager</code> header with its fixed entity pools.</p>
  </figure>
</div>

---

## Evaluation

### Refresh-rate dependence

The week-eight peer review reported: "At a 120&nbsp;Hz refresh rate, my jump height is barely above 3 blocks." The same review found that the goomba walked fast, that Mario fell through a goomba instead of bouncing off it, that holding A and D together flipped Mario's sprite every frame and produced a ghost image, and suggested halving the walking and running speeds. In the review I gave Martijn the same week I had found a related problem in his game: on a 165&nbsp;Hz monitor several blocks could be broken at once and the player could stick to them, which he had not seen on his 60&nbsp;Hz monitor.

The cause in my code is the mismatch described under Movement and gravity. Position is integrated with <code>deltaTime</code>, but gravity and walking acceleration are added to the velocity once per update. With a per-update gravity increment &Delta;v and an update rate f, the effective acceleration is a&nbsp;=&nbsp;&Delta;v&middot;f, and a jump launched at v<sub>0</sub> peaks at h&nbsp;=&nbsp;v<sub>0</sub><sup>2</sup>/(2a)&nbsp;=&nbsp;v<sub>0</sub><sup>2</sup>/(2&Delta;v&middot;f). The jump height is therefore inversely proportional to the refresh rate: at 120&nbsp;Hz it is half the height at 60&nbsp;Hz. Walking acceleration reaches the speed cap sooner for the same reason, and I attributed the movement-speed reports to the same cause.

The fix I recorded at the time was to skip updates whenever the frame time was below 16.666&nbsp;ms, limiting the game to 60 updates per second. This hides the problem on faster displays but leaves the game dependent on frame rate below 60&nbsp;Hz. Scaling the velocity increments by <code>deltaTime</code> as well, or stepping the simulation at a fixed rate with an accumulator (Fiedler, 2004), removes the dependence. The block ended with the fix, the goomba's walking speed and the missing bounce still on the list of changes, and the A-and-D sprite bug was left as a known visual issue.

### Tools

<div class="feature-grid">
  <div class="feature-text">
    <p>Debugging used breakpoints and the call stack in Visual Studio. After the week-six memory leak, Visual Studio's diagnostic tools were used to confirm that process memory neither fluctuated nor grew: a 97-second session shows a constant 27&nbsp;MB, with <code>Surface::Clear</code>, <code>LevelParser::drawLevel</code> and <code>Sprite::DrawScaled</code> among the top functions by CPU. Code analysis ran without warnings in debug and release, and the project was checked out from Perforce and built on classmates' machines.</p>
  </div>
  <div class="feature-media">
    <img width="666" height="670" loading="lazy" decoding="async" src="{{ "/assets/super-mario-clone/memory-diagnostics.png" | relative_url }}" alt="Visual Studio diagnostics session of 1 minute 37 seconds showing flat process memory at 27 MB and low CPU usage, with top functions listed">
  </div>
</div>

---

## Key takeaways

- **Scale every per-update increment by the elapsed time, and test at more than one refresh rate.** Gravity and walking acceleration were added once per update, so the jump height at 120&nbsp;Hz was half that at 60&nbsp;Hz. The fault went unnoticed until a reviewer played the week-eight build at 120&nbsp;Hz (see Evaluation).
- **Reach the minimum viable product before secondary features.** At the week-seven review the ? blocks were animated, but the game had no enemies and no block interaction, and reaching the minimum viable product took overtime in week eight. The block B log records the principle as only partly applied: the [ray tracer]({{ '/cpp-raytracer/' | relative_url }}) gained model loading and a dynamic array although neither was fundamental to its minimum viable product.
- **Size weekly goals so that each can be finished within the week.** From week four to week seven, 3 of the 11 weekly goals were completed in full. The week-five action point was to set smaller, more manageable goals, and the end-of-block evaluation notes that the goals were often too ambitious.
- **Accept a simpler implementation when it meets the current requirement.** Collision was first written for the downward case only so that movement work could start, the level parser reads into a fixed buffer, and level switching is a `switch` over the four levels the brief required. The week-six action point notes that a simpler method can save considerable time even when it is not the best one.
- **Record design decisions when they are made.** At the end of this block, evidence and the reasons behind design decisions had to be reconstructed in the final week. In block B I kept notes of decisions during the block, and that log describes them as an effective record of why each choice was made.

{% include youtube.html id="osGmfM-WX8Q" title="Super Mario Bros. C++ clone" caption="Gameplay from the finished clone." %}
