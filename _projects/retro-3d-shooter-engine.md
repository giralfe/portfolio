---
layout: project
title: "Retro 3D Shooter Engine (PS4 + PC)"
period: "2021"
year: 2021
sort_date: "2021-11"
tags: [Engine, Graphics, C++, Team]
image: /assets/retro-3d-shooter/gameplay.jpg
role: Graphics programmer & console build owner
platform: Windows (DirectX 12) + PlayStation 4 · The Forge
priority: 11
summary: "Eight-week team project at BUas: a custom engine for a Quake-style shooter on The Forge, with one C++ codebase for Windows and PlayStation 4. I was one of two graphics programmers, set up the cross-platform shader translation, wrote the JSON actor and asset layer, and was the main person keeping the console build running."
---

First block of the second year at BUas (autumn 2021), eight weeks. The team consisted only of programmers, and the brief was to build our own engine technology plus a retro 3D shooter prototype on top of it, with PlayStation 4 as a target alongside PC. The engine was designed so that an end user could make a shooter by editing JSON files and supplying assets, without changing code.

The engine is built on **The Forge** (The Forge Interactive) as the rendering and platform layer, with our own resource management, a JSON-driven actor and asset layer, and a Quake-style **BSP** world. I was one of the two graphics programmers. In practice I also did a large share of the engine and gameplay work, and I was the main person on the team getting the project to build and run on the console.

<div class="video-showcase">
  <video width="940" height="530" poster="{{ '/assets/retro-3d-shooter/bsp-level-walk-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="First-person walk through a textured Quake-format level, with billboard enemies on the walls and The Forge's timing overlay and profiler window visible">
    <source src="{{ "/assets/retro-3d-shooter/bsp-level-walk.mp4" | relative_url }}" type="video/mp4">
  </video>
  <p class="video-caption">BSP traversal on Windows: walking through a Quake-format level with billboard enemies. Top left, the overlay lists CPU frame time and per-pass GPU times (BSP, models, debug lines, UI).</p>
</div>

**My contributions, by week** (from the block's learning log):

- Weeks 1 to 2: technical design document (introduction, graphics section with the other graphics programmer, sprite-rendering and debug-drawing outlines); architecture design with the team.
- Weeks 3 to 4: integration of The Forge, FSL shader translation, first camera, first actor class and model resource; first console build in week 4.
- Week 5: JSON model and actor definitions, asset folder restructure, AABB debug drawing, per-platform asset copy rules, actor gravity.
- Week 6: model and billboard actors, console shader and compiler fixes, input bindings, player camera, cursor lock, crosshair.
- Week 7: restoring the console build after texture-loading regressions.

---

## Architecture and technical design

<img width="1651" height="522" loading="lazy" decoding="async" src="{{ "/assets/retro-3d-shooter/architecture-brainstorm.png" | relative_url }}" alt="Mind map with three branches: Rendering (Direct3D 12, The Forge or a DX12 framework), Engine (input, debugging, audio, physics world, resource system, memory management with stack and pool allocators, glTF loader, BSP) and AI (movement, waypoints, attack)">
<p class="video-caption">Week 1: team brainstorm of the subsystems, with the choice of graphics framework still open.</p>

<div class="media-row">
  <figure>
    <img width="1000" height="941" loading="lazy" decoding="async" src="{{ "/assets/retro-3d-shooter/architecture-whiteboard.jpg" | relative_url }}" alt="Whiteboard drawing of the engine architecture: Engine owning Config, World, Renderer, Physics and Input, a GameData folder of BSP levels, JSON actors and configs, singleton Debug and Input classes, and PS4 and PC renderers under a common Renderer">
    <p class="video-caption">Week 1: whiteboard draft. Game data (BSP levels, JSON actors, configs) is loaded from a folder.</p>
  </figure>
  <figure>
    <img width="1050" height="562" loading="lazy" decoding="async" src="{{ "/assets/retro-3d-shooter/architecture-draft-week2.png" | relative_url }}" alt="UML class diagram translating the whiteboard draft: Engine, GameManager, GameState, World, Physics, Renderer with PS4Renderer and PCRenderer subclasses, Debug, Input and Config">
    <p class="video-caption">Week 2: the whiteboard draft as UML.</p>
  </figure>
</div>

The architecture was designed as a team over the first two weeks, in three steps: a brainstorm of subsystems, a whiteboard class diagram, and then a UML diagram that was revised once more for the technical design document (TDD). The final version adds a resource manager with typed resources and handles, CPU and GPU stack allocators, a service locator, an actor class with a sprite sheet and a bounding volume, and a camera.

<img width="1800" height="694" loading="lazy" decoding="async" src="{{ "/assets/retro-3d-shooter/engine-uml.png" | relative_url }}" alt="Final UML class diagram of the engine from the technical design document, including ResourceManager, Memory with stack allocators, Locator, Actor, BoundingVolume subclasses, World, Renderer, Physics and Engine">
<p class="video-caption">Final architecture UML from the TDD (end of week 2).</p>

<div class="feature-grid">
  <div class="feature-text">
    <h3>My parts of the TDD</h3>
    <p>I wrote the introduction with input from the team and co-wrote the graphics section with the other graphics programmer. My part of that section analysed Jeremiah van Oosten's DirectX 12 learning framework as the alternative to The Forge. Its advantages were a ready Windows back end, built-in logging and a debug menu, and a documented codebase whose author we could contact. Its drawbacks decided against it: it was not structured for multi-platform development, it relied heavily on the C++ standard library, and DirectX 12 does not run on PlayStation 4, so the renderer would have needed a port.</p>
    <p>I also outlined two graphics features. <strong>Sprite rendering</strong>: enemies as billboards, quads rotating about the vertical axis to face the camera, textured from eight directions as in Doom (id Software, 1993), with the facing computed in the shader from the camera direction. <strong>Debug drawing</strong>: line drawing callable from anywhere in the engine through a singleton debug class. Reading for this part was Lengyel's <em>Foundations of Game Engine Development, Vol. 2: Rendering</em> (2019).</p>
    <p>The week-2 review asked for a clearer description of the rendering pipeline. The same review questioned the BSP: on current GPUs it is unlikely to outperform a BVH or other modern structures, and the lecturer suggested generating meshes at runtime as a way to traverse it. The action points were to make the documentation more concrete and to research runtime mesh generation.</p>
  </div>
  <div class="feature-media">
    <img width="697" height="457" loading="lazy" decoding="async" src="{{ "/assets/retro-3d-shooter/renderer-uml.png" | relative_url }}" alt="UML diagram of the renderer: Renderer with registerModel and generateDynamicMesh, Model with a uniform buffer, ModelResource holding mesh, textures and sprite sheet, TextureResource wrapping a Forge texture, and the BSP's RenderData">
    <p class="video-caption">Renderer UML from the TDD's graphics section. It includes a <code>generateDynamicMesh()</code> step for the runtime mesh generation.</p>
  </div>
</div>

---

## Cross-platform build: The Forge and FSL

<div class="feature-grid">
  <div class="feature-text">
    <p>The Forge abstracts most platform differences, including graphics, input and file access. Its shaders are written in FSL, The Forge's shader language, which its Python tooling translates into each platform's native shader language at build time. Integrating it took most of week 3:</p>
    <ol>
      <li>Building The Forge as a static library, then changing the project setup so every target used the headers of the same Forge version.</li>
      <li>Setting up FSL translation in our build. It failed until the Python translation tools were added to the project; after that, our own shaders translated with the rest.</li>
      <li>Fixing the font and ImGui shaders in FSL (week 4), after which the test scene ran on the console for the first time.</li>
    </ol>
    <p>Week 6 brought a series of smaller faults: a shader error that only appeared when FSL was translated for the console, a compiler error in which a struct's size was misinterpreted, and two rebuilds of The Forge's library, one to disable its default control bindings and one to map WASD movement to the gamepad's left stick. In week 7 the console build broke again and was restored by fixing a number of separate texture-loading issues.</p>
  </div>
  <div class="feature-media">
    <img width="1374" height="770" loading="lazy" decoding="async" src="{{ "/assets/retro-3d-shooter/shader-translation.png" | relative_url }}" alt="Build output in which The Forge's FSL tooling generates and compiles a Direct3D 12 shader from each .fsl source, from the BSP and billboard shaders to ImGui">
    <p class="video-caption">FSL translation in the Windows build: each <code>.fsl</code> source (basic, billboard, BSP, colour, debug line, font, ImGui, skybox) generates and compiles its Direct3D 12 shader.</p>
  </div>
</div>

<div class="technical-block">
  <h3>Platform-specific code that remained</h3>
  <p>Because The Forge handles most of the platform layer, little of our code is platform-specific. Input, for example, is defined as Forge action descriptions that can be bound to any key or button on either platform. The design still drew separate PS4 and PC renderers under a common interface; in the implementation the differences that remained were:</p>
  <ul>
    <li>a resource-path prefix required by the console's file system, applied in the resource manager;</li>
    <li>a separate stack-allocator implementation per platform;</li>
    <li>per-platform exclusion lists for the build step that copies assets next to the executable (week 5).</li>
  </ul>
  <p>For the week-4 review we had stated that the project ran on PS4, and the feedback was that this needed hard evidence. The end-of-block evidence shows the same scene running on both platforms from the same code (the gravity and collision clip further down).</p>
</div>

---

## Actors and assets in JSON

<div class="feature-grid reverse">
  <div class="feature-media">
    <img width="595" height="363" loading="lazy" decoding="async" src="{{ "/assets/retro-3d-shooter/tdd-actor-pseudocode.png" | relative_url }}" alt="TDD pseudocode of an enemy actor definition in JSON: version, type, sprite location, eight animation frames and directions, movement speed, health, AI behaviour flags and actor flags">
    <p class="video-caption">Planned (TDD pseudocode): an enemy actor defined entirely in data, including sprite directions and AI behaviour flags.</p>
    <img width="1200" height="597" loading="lazy" decoding="async" src="{{ "/assets/retro-3d-shooter/actor-json.png" | relative_url }}" alt="Implemented actor JSON: name, model path, render profiling, culling and depth-buffer flags, shader name and uniform block name" style="margin-top:1rem">
    <p class="video-caption">Implemented (week 5): an actor points at a model file and stores its render settings, including which shader it uses.</p>
    <img width="444" height="195" loading="lazy" decoding="async" src="{{ "/assets/retro-3d-shooter/model-json.png" | relative_url }}" alt="Implemented model JSON: mesh path, diffuse, normal and specular texture paths, and sprite-sheet settings" style="margin-top:1rem">
    <p class="video-caption">Implemented model file: the mesh, three texture slots and optional sprite-sheet dimensions.</p>
  </div>
  <div class="feature-text">
    <p>Since the end user builds a game by editing data, content lives outside the binary. In week 5 I implemented the data layer in two levels:</p>
    <ul>
      <li>A <strong>model</strong> JSON lists the mesh and the diffuse, normal and specular textures, with optional sprite-sheet settings.</li>
      <li>An <strong>actor</strong> JSON points at a model JSON and stores per-actor render settings (shader, culling, depth buffer, profiling).</li>
    </ul>
    <p>Both load through the resource manager written by the team's engine programmer, which keys resources by handle so that two actors referencing the same mesh or texture do not load it twice. I restructured the assets folder around this layout and removed the temporary loaders the project had used until then.</p>
    <p>In week 6 I split the actor class into model actors and billboard actors, so that enemies could be billboards as the sprite-rendering outline specified, and added an <code>updatePhysics</code> method for derived actor classes to call. Earlier (week 4) I had written the first actor class with its model matrices and the model resource that groups a mesh with its textures.</p>
  </div>
</div>

<div class="media-row">
  <figure>
    <img width="882" height="428" loading="lazy" decoding="async" src="{{ "/assets/retro-3d-shooter/bounding-volume-uml.png" | relative_url }}" alt="TDD UML: an abstract BoundingVolume with ray, AABB, sphere and quad intersection tests, subclassed by AABB, Sphere and Quad, and held by Actor">
    <p class="video-caption">TDD: each actor holds one bounding volume of an abstract type, with AABB, sphere and quad subclasses.</p>
  </figure>
  <figure>
    <img width="568" height="206" loading="lazy" decoding="async" src="{{ "/assets/retro-3d-shooter/implemented-bounding-volumes.png" | relative_url }}" alt="Visual Studio class diagram of the implemented BoundingVolume with AABB, Sphere, Quad and Capsule subclasses">
    <p class="video-caption">Implementation (Visual Studio class diagram): the same hierarchy plus a capsule.</p>
  </figure>
  <figure>
    <img width="430" height="266" loading="lazy" decoding="async" src="{{ "/assets/retro-3d-shooter/implemented-actor-hierarchy.png" | relative_url }}" alt="Visual Studio class diagram: Actor with ModelActor, Player and BillboardActor subclasses, and AI deriving from BillboardActor">
    <p class="video-caption">Implemented actor hierarchy after the week-6 split; the AI derives from the billboard actor.</p>
  </figure>
</div>

At the end of the block we compared the implemented class diagrams with the TDD. The deviations were mostly extensions: more resource types in the resource manager, more collision shapes, and AI billboard actors, which the TDD had not defined clearly.

---

## Collision, physics and camera

<div class="feature-grid">
  <div class="feature-media">
    <video width="960" height="540" poster="{{ '/assets/retro-3d-shooter/collision-physics-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Two monkey-head actors fall onto a green floor plane and come to rest, with a textured billboard quad and the timing overlay visible">
      <source src="{{ "/assets/retro-3d-shooter/collision-physics.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Actor gravity and floor collision. This scene was the one shown running on both Windows and PS4 from the same code.</p>
    <video width="960" height="540" poster="{{ '/assets/retro-3d-shooter/shooting-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The player shoots at a red monkey-head actor in front of a textured billboard; the hit actor drops to the floor while red debug lines mark the shot" style="margin-top:1rem">
      <source src="{{ "/assets/retro-3d-shooter/shooting.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Shooting and killing an enemy: a ray test against each actor's bounding volume. The red lines are the player's last shot.</p>
    <video width="1000" height="562" poster="{{ '/assets/retro-3d-shooter/cursor-lock-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The mouse cursor locking and unlocking from the window while the camera pitch stops at straight up and straight down" style="margin-top:1rem">
      <source src="{{ "/assets/retro-3d-shooter/cursor-lock.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Cursor lock and release, and the pitch clamp at plus and minus 90 degrees (week 6).</p>
  </div>
  <div class="feature-text">
    <p>The physics in this engine is deliberately simple: actors fall under gravity and stop on contact, and shooting is a ray test. My parts, mostly in weeks 5 and 6:</p>
    <ul>
      <li><strong>AABB collision with debug drawing</strong>, so boxes are visible as line wireframes during testing.</li>
      <li><strong>A division-by-zero fix</strong> in the ray-versus-AABB intersection test.</li>
      <li><strong>Actor gravity.</strong> The TDD specifies it as a ray cast downward through the collision system; the clip shows two actors falling onto the floor plane.</li>
      <li><strong>A read access violation when shooting</strong>, traced and fixed in week 5.</li>
      <li><strong>A colour shader with approximated lighting</strong>, written in FSL, used for the untextured test actors.</li>
      <li><strong>A player-driven camera</strong> replacing The Forge's camera (week 6), with pitch clamped to plus or minus 90 degrees, cursor lock and release on Windows, and a crosshair drawn with debug lines.</li>
    </ul>
  </div>
</div>

---

## The BSP world (team work)

The BSP is the team's work, not mine. As in Quake, the map is split into convex regions by a binary space partitioning tree (Fuchs, Kedem and Naylor, 1980), and each node stores a visibility list of the regions that can be seen from it, which decides what is rendered. Following the week-2 feedback, a mesh is generated at runtime around the player from the nodes the player is in. In Quake the BSP was an acceleration structure; on current hardware it is mainly a self-imposed constraint that matches the Quake map format the end user would design for. The clip at the top of the page shows the traversal.

---

## Side project: a raycaster

<div class="feature-grid reverse">
  <div class="feature-media">
    <video width="720" height="540" poster="{{ '/assets/retro-3d-shooter/raycaster-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="A grid-based raycast renderer drawing flat-coloured walls with darker shading on one wall orientation">
      <source src="{{ "/assets/retro-3d-shooter/raycaster.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">The raycaster from the Monday of week 1.</p>
  </div>
  <div class="feature-text">
    <p>On the Monday of week 1, before the kick-off, I wrote a grid-based raycast renderer in the style of Wolfenstein 3D (id Software, 1992) in one day, prompted by the project brief. I extended it on self-study Fridays through the block (weeks 3, 4, 5 and 7). It was the self-study project for the block's personal goal of exploring the graphics-programmer role.</p>
  </div>
</div>

---

## Process and evaluation

<div class="feature-grid">
  <div class="feature-text">
    <p><strong>Version control.</strong> The team contract defined a Perforce convention: submit only the files a change needs. A typical submission of mine added the colour shaders: the project file (so the new shaders were included for everyone), the actor and model JSON files that select the shader, and <code>Engine.cpp</code>, because new actors had to be added to the update loop by hand at that stage.</p>
    <p><strong>Sprint reviews</strong> shaped the scope:</p>
    <ul>
      <li>Week 2: document the rendering pipeline more concretely; reconsider the BSP (see above).</li>
      <li>Week 4: show progress since the previous sprint and unit tests for physics; prove the console build with evidence; deprioritise the stack allocator; expect BSP traversal to take long.</li>
      <li>Week 6: much graphics work still planned; scope down to finish something smaller.</li>
      <li>Week 8: the project was over-scoped and lacked features a shooter of this type needs.</li>
    </ul>
  </div>
  <div class="feature-media">
    <img width="1320" height="248" loading="lazy" decoding="async" src="{{ "/assets/retro-3d-shooter/forge-memory-leaks.png" | relative_url }}" alt="Memory leak report from The Forge's memory tracker: six leaks found, each between 8 and 64 bytes, all allocated through The Forge's EASTL allocator">
    <p class="video-caption">The Forge's memory tracker at the end of the block: six leaks of 8 to 64 bytes, the one major known defect left in the engine.</p>
  </div>
</div>

## Key takeaways

- **Scope the engine to the game it has to ship.** The sprint reviews raised scope from week 4 onward (listed above), and the end-of-block reflection concluded that a smaller game that is fun to play would have been a better result than a feature-rich engine with differences the end user would barely see.
- **Settle project setup and the asset pipeline before feature work.** Access to the console version of The Forge and to the Perforce repository arrived only in week 3, and much of week 5 went into removing the temporary loaders that had spread through the code before the asset folder structure was settled. The action points from those weeks were to give project setup and the asset pipeline more attention at the start of the next project.
- **Fix small faults when they appear.** Week 6 went to a run of small fixes (default control bindings, a console-only shader error, a misinterpreted struct size, cursor lock) that displaced planned features, and the action point was not to leave such issues until late in development.
- **Expect platform-specific faults throughout cross-platform development.** The console build broke again in week 7 because of several separate texture-loading issues; the lesson recorded that week was that hardware differences keep producing new faults even after the platform seems understood.
- **Weigh a framework's documentation when estimating its time saving.** The team expected The Forge to shorten development, but it has little documentation, so most of what we learned came from its example projects and source code; at the end of the block it was unclear whether it had saved time.
