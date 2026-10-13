---
layout: project
title: "Graph-Driven Dungeon Generation"
period: "2023 - 2024"
year: 2024
sort_date: "2024-04"
tags: [Tools, Gameplay, Unreal, C++, Team]
image: /assets/dungeon-generation/delaunay-card.jpg
role: Lead programmer & procedural generation (Verdant Games)
platform: Unreal Engine 5 · C++
priority: 9
summary: "Procedural dungeon generation for a rogue-like at Verdant Games, a BUas student studio, over three quarters of my graduation year; lead programmer on the core team until the middle of the second quarter. The work covers room separation, Delaunay triangulation, Prim's spanning tree, depth-first composite extraction, a room-graph node editor, and depth-first room assignment over level-streamed rooms."
---

For three of the four quarters of my fourth year at BUas (2023-24) I worked at **Verdant Games**, a student studio in the university's game incubator with a five-person core team. The game was a rogue-like that combined dungeon crawling with a haunted-mansion management layer; the team's reference games were *Enter the Gungeon* for level generation and *Hades* for combat. My main feature was the dungeon: how a level designer describes the structure of a run, and how the game turns that description into a connected set of streamed rooms. The game itself is under NDA, so this page shows only algorithms, editor tools and debug views.

<div class="video-showcase">
  <img width="1200" height="1092" loading="lazy" decoding="async" src="{{ "/assets/dungeon-generation/delaunay.png" | relative_url }}" alt="Top-down grid of separated blue room rectangles with a Delaunay triangulation drawn between their centres">
  <p class="video-caption">Debug view of the first generator: rooms after the separation pass, with the Delaunay triangulation of their centres.</p>
</div>

---

## Role and team process

Until I stepped down from the core team in week 5 of the second quarter I was its **lead programmer**. In that period I:

- held a programmers' meeting every sprint on project state, technical problems and Unreal-specific implementation questions (one outcome was a native C++ helper for casting to the player pawn and controller, which replaced repeated Blueprint casts);
- wrote the C++ code conventions and the Unreal asset naming conventions;
- drafted the studio's NDA;
- set up the code-review pipeline: the author shelves the changelist while keeping the files checked out, posts a review request with test steps in a Discord forum, and submits to Perforce only after a reviewer accepts it. It started with the three programmers and, after a presentation I gave in week 9 of the first quarter, applied to the whole team. A two-day cleanup of all project Blueprints followed, with programmers reviewing the result. I did most of the reviews in the first two quarters;
- with another programmer, set up a manually integrated stable branch in Perforce and had the build server upload builds to Google Drive through the Google Cloud API.

In the second quarter I also traced a frame-time regression in Unreal Insights to Slate, caused by the way part of the game's UI was implemented, and resolved it with the programmer who had written it.

---

## Generation pipeline

The design I worked towards follows the composite approach of *Enter the Gungeon*. My research document compared it with the generator of *Unexplored*, which is considerably more complex; given my lack of experience with procedural generation and my other responsibilities, the team chose the simpler approach. The steps, as written in my notes and in the handover document I started in the third quarter:

1. A designer authors a set of room graphs per stage and a set of rooms per room type.
2. A room graph is picked at random and decomposed into **composites**, defined in my notes as the "smallest loops and trees in graph".
3. Rooms that are not combat rooms (shops, fireplaces) are injected.
4. Each composite is laid out separately on its own dynamic world grid, which rejects placements on occupied tiles, and the exits that must connect to another composite are recorded.
5. The composites are joined, and the entrance room and its neighbours are streamed in.

Laying out each composite in isolation was meant to keep each layout problem small. This full version was not completed; the version that produced a playable dungeon is described under [Room assignment and streaming](#room-assignment-and-streaming).

<div class="feature-grid">
  <div class="feature-text">
    <h3>Stage 1: authoring the room graph</h3>
    <p>A room graph is a directed graph whose nodes carry a room type (entrance, exit, combat, exploration, event, vendor, connector, boss, treasure/ability and others requested by level design) and a difficulty. It is stored as an adjacency matrix.</p>
    <p>The first authoring surface was a data asset in which the designer filled in that matrix through nested dropdown menus: one entry per room, and per room a relationship value for every other room. It was slow to edit and did not show the structure of the graph. In the second quarter I extended the open-source <em>Generic Graph</em> plugin into a <strong>node editor</strong> for room graphs, placed in a separate editor-only module so that none of it is compiled into game builds. A graph drawn in the editor is converted to the adjacency matrix and passed to the composite extractor.</p>
  </div>
  <div class="feature-media">
    <video width="1332" height="720" poster="{{ '/assets/dungeon-generation/room-graph-matrix-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="A data asset in the Unreal editor where room relationships are set through rows of dropdown menus">
      <source src="{{ "/assets/dungeon-generation/room-graph-matrix.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Before: the adjacency matrix edited as a data asset, one dropdown per room pair.</p>
    <video width="1332" height="720" poster="{{ '/assets/dungeon-generation/room-graph-authoring-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Building a room graph in the node editor by adding nodes, setting their room type and difficulty, and connecting them" style="margin-top:1rem">
      <source src="{{ "/assets/dungeon-generation/room-graph-authoring.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">After: building a room graph in the node editor, with room type and difficulty set per node (130 s recording shown at 6x speed).</p>
  </div>
</div>

<div class="feature-grid reverse">
  <div class="feature-media">
    <img width="1600" height="1060" loading="lazy" decoding="async" src="{{ "/assets/dungeon-generation/algorithm-notes.jpg" | relative_url }}" alt="Notebook page with a room graph drawn as boxes from Dungeon Entrance to Boss, composites circled in green, and the generation steps written out beside it">
    <p class="video-caption">Notes from the first quarter: a room graph with its composites circled in green, and the planned generation steps.</p>
    <img width="1200" height="739" loading="lazy" decoding="async" src="{{ "/assets/dungeon-generation/composites.png" | relative_url }}" alt="Editor viewport printing the extracted composites of a room graph as lists of room indices, followed by counts per room type" style="margin-top:1rem">
    <p class="video-caption">First extractor output for the graph in the notes: the cycles 3, 4, 5 and 8, 9, 10 are found and printed first, followed by the linear sections.</p>
  </div>
  <div class="feature-text">
    <h3>Stage 2: composite extraction</h3>
    <p>The extractor runs a depth-first search over the adjacency matrix and sorts the graph into three kinds of composite:</p>
    <ul>
      <li><strong>cycles</strong>: node sequences that form a loop, identified during the search and extracted first;</li>
      <li><strong>linear sections</strong>: chains of single parent-child relationships;</li>
      <li><strong>forks</strong>: nodes with more than one child, where the graph branches.</li>
    </ul>
    <p>Two defects became visible once graphs were quick to draw in the node editor. Loops connected to other loops were detected incorrectly, and a loop nested inside another loop was merged with the outer one into a single cycle. I fixed both in the second quarter by changing how the search marks loops, so designers can connect and nest loops without restriction. The test graphs below were built to reproduce each case.</p>
  </div>
</div>

<div class="media-row">
  <figure>
    <img width="1018" height="753" loading="lazy" decoding="async" src="{{ "/assets/dungeon-generation/loop-test-graph.png" | relative_url }}" alt="Room graph in the node editor with several loops that share nodes, built from Entrance through Exploration, GhostSave, Event, Treasure/Ability, Connector, Locked and Vendor rooms to Boss and Exit">
    <p class="video-caption">Test graph with loops attached to other loops.</p>
  </figure>
  <figure>
    <img width="756" height="358" loading="lazy" decoding="async" src="{{ "/assets/dungeon-generation/loop-test-log.png" | relative_url }}" alt="Output log of the depth-first search listing visited rooms in order and four loop-detected warnings with the rooms of each loop">
    <p class="video-caption">Search output for that graph: visit order and the four loops it detects.</p>
  </figure>
  <figure>
    <img width="1400" height="668" loading="lazy" decoding="async" src="{{ "/assets/dungeon-generation/graph-editor.png" | relative_url }}" alt="Unreal editor showing a larger room graph in the node editor next to the log output listing the extracted cycles, linear sections and forks">
    <p class="video-caption">A larger graph with nested loops and the extractor's cycles, linear sections and forks in the log.</p>
  </figure>
</div>

<div class="feature-grid">
  <div class="feature-text">
    <h3>Stage 3: layout on a grid</h3>
    <p>The layout stage, built in C++ in the first quarter, runs four passes on a 2D grid:</p>
    <ol>
      <li><strong>Placement.</strong> Rooms are placed with sizes read from a data asset that defines the room types.</li>
      <li><strong>Separation.</strong> Overlap is tested with axis-aligned bounding boxes on the grid, and each overlapping pair is steered in opposite directions until the rooms no longer intersect, a separation steering behaviour in the sense of Reynolds (1999). I also wrote the inverse, a cohesion pass that moves selected rooms toward a chosen point, intended to close gaps that would otherwise need long corridors.</li>
      <li><strong>Candidate connections.</strong> A Delaunay triangulation (Delaunay, 1934) of the room centres.</li>
      <li><strong>Connectivity.</strong> Prim's algorithm (Prim, 1957) on the triangulation edges, weighted by distance, gives a minimum spanning tree that connects every room.</li>
    </ol>
    <p>The world grid was first fixed in size. Large room graphs could run out of space, so I rewrote it to be resizable at runtime without moving rooms already placed.</p>
  </div>
  <div class="feature-media">
    <img width="1200" height="998" loading="lazy" decoding="async" src="{{ "/assets/dungeon-generation/mst.png" | relative_url }}" alt="A separated room layout with only the minimum spanning tree edges remaining, computed with Prim's algorithm">
    <p class="video-caption">Another layout after Prim's algorithm: only the spanning-tree edges remain.</p>
  </div>
</div>

<div class="media-row">
  <figure>
    <video width="1008" height="540" poster="{{ '/assets/dungeon-generation/room-separation-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Debug view of overlapping blue room rectangles being pushed apart step by step">
      <source src="{{ "/assets/dungeon-generation/room-separation.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">The separation pass with its debug drawing updated on a fixed time step, so each iteration is visible.</p>
  </figure>
  <figure>
    <video width="796" height="540" poster="{{ '/assets/dungeon-generation/dynamic-grid-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="A red grid growing by one row and one column per update while a green room stays in place">
      <source src="{{ "/assets/dungeon-generation/dynamic-grid.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">The runtime-resizable grid growing by one row and one column per update while a placed room (green) keeps its position.</p>
  </figure>
</div>

<div class="feature-grid reverse">
  <div class="feature-media">
    <video width="1280" height="686" poster="{{ '/assets/dungeon-generation/level-design-buddy-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The LevelDesignBuddy actor in the Unreal editor writing bounds and passages into a room metadata data asset">
      <source src="{{ "/assets/dungeon-generation/level-design-buddy.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">The LevelDesignBuddy in a test room, writing to the room-metadata asset the generator reads.</p>
    <video width="1280" height="674" poster="{{ '/assets/dungeon-generation/passage-direction-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Unreal output log printing each passage's angle and the direction it was classified as" style="margin-top:1rem">
      <source src="{{ "/assets/dungeon-generation/passage-direction.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Passage classification in the log: an angle of 3.6 degrees resolves to <code>Right</code>, 170.1 to <code>Left</code>, and the two passages near 90 degrees to <code>Down</code> and <code>Up</code>.</p>
  </div>
  <div class="feature-text">
    <h3>Room metadata</h3>
    <p>Every stage after the room graph needs each room's bounds, passages, enemy spawns, difficulty and type. Streaming a room in to read this data would be expensive, so the data is extracted once in the editor. The <strong>LevelDesignBuddy</strong> is an actor that a designer places in a room: it takes the room bounds from its box extents, exports passage and enemy locations, and writes them with the difficulty and room type into the room-metadata asset. At generation time the generator reads only this asset, and only the rooms the player can reach next need to be loaded.</p>
    <p>In the third quarter I extended it to classify each passage as up, down, left or right from its angle relative to the buddy's centre, so that designers no longer enter directions by hand. The four directions correspond to 90-degree sectors bounded by the diagonals through the buddy, which I explained to the level designer with a diagram after a misunderstanding about how directions were assigned.</p>
  </div>
</div>

---

## Room assignment and streaming

In the third quarter the core team dropped the requirement that rooms must not overlap in world space. Without it, generation reduces to choosing a valid room for each node of the room graph and connecting the rooms correctly. Two rooms can therefore occupy the same world space, which works because each room is streamed separately; this version does not use the grid layout stage (separation, triangulation, spanning tree). I implemented this as a **depth-first traversal** of the room graph. For each node, a room of the node's type is selected from the pool in the room-metadata asset whose passage directions fit those of the parent room. Because the traversal assigns a parent before its children, each child's candidates are filtered only by the passage directions of its already assigned parent, and connected rooms fit together by construction. A randomly chosen entrance room is streamed into an empty persistent level first, and the remaining rooms follow the graph.

<div class="video-showcase">
  <img width="1440" height="570" loading="lazy" decoding="async" src="{{ "/assets/dungeon-generation/dfs-room-assignment.png" | relative_url }}" alt="Output log next to a tree-shaped room graph in the node editor; the log lists the composite categories and then the order 0, 1, 2, 3, 4, 7, 8, 5, 6 in which the generator visits the nodes">
  <p class="video-caption">Test graph for the room assignment. The log first prints the composite categories (no cycles; forks at nodes 1, 3 and 4), then the depth-first visit order 0, 1, 2, 3, 4, 7, 8, 5, 6 in which rooms are assigned.</p>
</div>

Around the generator I implemented the systems needed to play a generated dungeon from start to finish:

- **Level streaming in C++** for the rooms, with a fade that hides loading, and a research document for the team on how level streaming works in UE5.
- **Doors** that lock when the player enters a room and unlock when its encounter is cleared, and traps that switch off at the same moment.
- **Persistent per-room state** in the dungeon game mode: a cleared room stays cleared on backtracking (traps stay off and the enemy spawner does not start a new wave), and an opened chest stays opened, so chests cannot be farmed.
- A **teleporter** and door portals that close behind the player (horizontal and vertical variants, both requested by level design), built on the room-transition system, and a hub-to-dungeon transition whose fade-in waits until the entrance room has loaded. Before that change the player fell until the room arrived.
- A **debug cheat** that runs the game at 2.5x speed and kills all enemies, used to play through a complete generated dungeon after each fix.
- A bug-fixing cycle with the level designer that resolved, among others, a soft-lock during traversal, a traversal bug caused by Unreal garbage collection, and vendor items that were spawned in the persistent level and remained visible after the player left the room.

At the end of the third quarter a generated dungeon could be played through completely. Because the work was handed over when I left, I also started documentation of the generator's structure for the programmers and level designers who would continue with it.

---

## Interactive foliage

In the second quarter, while the dungeon was on hold and playtesters had described the environments as "lifeless", I was assigned interactive foliage. I wrote a research document comparing a physics-based method (rigged meshes with physics bodies) with render-target deformation, and concluded that small, dense foliage such as grass should use render-target deformation. To test that conclusion I implemented the physics-based method on both kinds of foliage. Both tests used the *Physical Interactive Foliage System* plugin, which replaces instanced static meshes with simulated versions only within a set range of the player and swaps them back outside it.

- **Grass.** I modelled and rigged a grass blade. With about 400 blades simulating at once, the simulation took **7.6 ms** per frame, close to half of the 16.7 ms budget of the team's 60 fps target. This confirmed the conclusion of the document for dense ground cover.
- **Bushes.** I modelled and rigged a bush with sphere physics bodies along its bone chain, using a swap range of 150 units. Sixteen bushes cost **22.9 µs** in total, and a scene with about 32 active bushes cost **71 µs**. Swap range and check interval were not yet tuned and could reduce this further.

The recommendation was therefore split: physics-based interaction for sparse foliage such as bushes, and render-target deformation for dense ground cover ([Cold Candy]({{ '/cold-candy/' | relative_url }}) uses a related runtime-virtual-texture approach for its snow).

<div class="media-row">
  <figure>
    <img width="364" height="553" loading="lazy" decoding="async" src="{{ "/assets/dungeon-generation/grass-blade-rig.jpg" | relative_url }}" alt="A single grass blade mesh in Blender with a bone chain running up its centre">
    <p class="video-caption">The grass blade and its bone chain in Blender.</p>
  </figure>
  <figure>
    <img width="933" height="722" loading="lazy" decoding="async" src="{{ "/assets/dungeon-generation/bush-rig.jpg" | relative_url }}" alt="A low-poly bush mesh in Blender with a vertical chain of bones">
    <p class="video-caption">The bush mesh and its rig.</p>
  </figure>
  <figure>
    <video width="806" height="540" poster="{{ '/assets/dungeon-generation/bush-physics-test-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="A green bush in a grey test level with three sphere physics bodies, bending when pushed and returning to rest">
      <source src="{{ "/assets/dungeon-generation/bush-physics-test.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">The bush's physics bodies in a test level: it bends when pushed and returns to rest.</p>
  </figure>
</div>

<div class="media-row">
  <figure>
    <video width="1000" height="570" poster="{{ '/assets/dungeon-generation/foliage-grass-insights-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Unreal Insights timing view of the grass test; a tooltip shows TickCompletionEvents at 7.6 milliseconds inclusive">
      <source src="{{ "/assets/dungeon-generation/foliage-grass-insights.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Unreal Insights capture of the grass test: the 7.6 ms reported in the log appears as <code>TickCompletionEvents</code> in a 20.5 ms game-thread frame.</p>
  </figure>
  <figure>
    <img width="896" height="240" loading="lazy" decoding="async" src="{{ "/assets/dungeon-generation/bush-insights.png" | relative_url }}" alt="Unreal Insights timers and callers panels showing BP_Bush_C with 22.9 microseconds inclusive time">
    <p class="video-caption">Unreal Insights timers for the 16-bush test: the bush Blueprint totals 22.9 µs in the selected time range.</p>
  </figure>
</div>

---

## Process

- **Schedule.** The publisher-build milestones planned a functional generator by week 3 of the second quarter; by the end of the first quarter its deadline had already been moved several times. The dungeon was on hold for the second half of the second quarter while the team focused on the build, and a playable version existed at the end of the third quarter.

Two process points from this project concern the team rather than the code. After a guest lecture by the indie studio Phantom Coast, I raised with the core team that the game had no design pillars and no vision holder, the vision being shared by all five core members; the team then defined pillars and appointed two vision holders. I stepped down from the core team in week 5 of the second quarter because I was applying for the computer science pre-master at TU/e and would not have the time for a core role in the following year. I remained a programmer until the end of the third quarter; the fourth quarter became [Small Dragon Big Appetite]({{ '/small-dragon-big-appetite/' | relative_url }}).

## Key takeaways

- **Build the simplest version that works, then extend it.** A first-quarter peer review asked whether a usable generator could have come first and been improved afterwards, and a basic working version became my action point. The playable dungeon of the third quarter came from a simplification, dropping the overlap constraint, rather than from completing the composite pipeline, and the C++ code I had written for moving sublevels at runtime was not needed in it.
- **Estimate unfamiliar work from a breakdown of the systems it needs, with a wide margin.** Being new to procedural generation, I could not foresee which systems and algorithms the generator would require, one of the reasons its deadline moved (see Process). A peer review recommended a deeper breakdown of what the generator needed, and the producer advised doubling my estimates for tasks similar to ones I had underestimated.
- **Review every change before it reaches the shared branch, designer Blueprints included.** Before the review pipeline the project had broken builds, files missing from the depot and random crashes. In the second quarter reviews caught several broken changes before they reached the development branch, so faults did not have to be traced back through later submits; Blueprints were included on my supervisor's advice that unreviewed scripts become "skeletons in the closet".
- **Document a system while building it.** Documentation of the generator was started only for the handover in the third quarter; the end-of-quarter reflection records that documentation written alongside the code would also have served as my own reference to the system.

<div class="technical-block">
  <h3>References</h3>
  <p>Delaunay, B. (1934). Sur la sphère vide. <em>Bulletin de l'Académie des Sciences de l'URSS</em>, 6, 793-800.<br>
  Prim, R. C. (1957). Shortest connection networks and some generalizations. <em>Bell System Technical Journal</em>, 36(6), 1389-1401.<br>
  Reynolds, C. W. (1999). Steering behaviors for autonomous characters. <em>Proceedings of the Game Developers Conference</em>, 763-782.</p>
</div>
