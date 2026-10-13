---
layout: project
title: Empires
period: "2021"
year: 2021
sort_date: "2021-04"
tags: [Engine, Graphics, C++, Team]
image: /assets/empires/system-overview-poster.jpg
role: Programmer (with one partner from week five)
platform: Windows + Raspberry Pi 4 · OpenGL ES 3.0 · C++
priority: 15
summary: "A first-year 3D space-strategy prototype built from one C++ source tree for Windows and a Raspberry Pi 4. I wrote the OpenGL ES 3.0 rendering path, the platform layer behind a pure-virtual graphics class, the galaxy generation, a Bullet rigid-body demo and a post-processing pass."
---

Empires was the block C project of the first year at BUas (2020-2021, eight weeks). The brief fixed most of the design, a space-strategy game in which planets spread **spheres of influence**, and set a technical constraint: C++ with OpenGL ES 3.0, running on a Windows PC and a **Raspberry Pi 4** from the same source. I worked alone on a prototype for weeks one to four and with one partner on a merged codebase for weeks five to eight. My planned split was 80 % programming and 20 % design interpretation. It was my first 3D game and the first codebase I shared with another programmer; OpenGL ES, ImGui, GLFW, GLEW and Bullet were all new to me in this block.

<div class="video-showcase">
  <video width="802" height="590" data-autoplay loop muted playsinline preload="none" poster="{{ '/assets/empires/system-overview-poster.jpg' | relative_url }}" aria-label="Star system of colour-tinted planets, all using the same hand-drawn test texture, with a debug panel showing per-planet stats"><source src="{{ '/assets/empires/system-overview.mp4' | relative_url }}" type="video/mp4"></video>
  <p class="video-caption">A generated star system. Clicking a planet shows its random name, technology level, resource level, control and sphere of influence in the debug panel.</p>
</div>

---

## Solo prototype (weeks one to four)

The first week produced a rendering pipeline on top of the course template: OpenGL ES 2.0 with GLSL ES 1.00 shaders, OBJ loading through `tinyobjloader`, and a camera driven by the template's input class. The first error was that I did not rebind a texture before each object's draw call, so every object was drawn with the same texture. A week-one code review from a classmate pointed out that uniform and attribute locations, and the `glVertexAttribPointer` setup, only need to be queried once rather than every frame, and that a hard-coded attribute index of 0 could cause problems once there were more shaders.

Week two added classes for planets, stars and star systems, with sphere models I made in Blender, and a plan of roughly 2.5-day sprints towards the week-four demo. Week three generated a galaxy and the star systems within it and started the ImGui debug interface; scene switching was only partly done because I had not decided how the game should be structured. In week four I added instanced drawing for the demo and brainstormed the merged project with my partner.

<div class="media-row">
  <figure>
    <img width="600" height="602" loading="lazy" decoding="async" src="{{ "/assets/empires/w1-texture-binding-bug.jpg" | relative_url }}" alt="A model rendered in black and white with a texture that belongs to a different object">
    <p class="video-caption">Week 1: a model drawn with another object's texture, because the texture was not rebound before each draw call.</p>
  </figure>
  <figure>
    <img width="800" height="710" loading="lazy" decoding="async" src="{{ "/assets/empires/w3-star-system.jpg" | relative_url }}" alt="An orange textured star with a row of smaller blue and green planets beside it">
    <p class="video-caption">Week 3: a generated star system, with the star and its planets laid out in a row.</p>
  </figure>
  <figure>
    <video width="728" height="720" poster="{{ '/assets/empires/galaxy-generation-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/empires/galaxy-generation.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Week 3: generated galaxies drawn as point clouds, seen from several camera positions. Both spherical and flattened shapes are visible.</p>
  </figure>
</div>

---

## One source tree, two targets

<div class="feature-grid">
  <div class="feature-text">
    <p>In week five I set up the shared project and merged code from both prototypes into it. The platform layer is a pure-virtual <code>Graphics</code> class with a Windows implementation (GLEW&nbsp;+&nbsp;GLFW) and a Pi implementation (GLES&nbsp;3, X11 for the window and XRandR for the display mode), instantiated behind a <code>RASPBERRY</code> preprocessor switch. Header includes and the resolution follow the same switch: 1920&times;1080 on Windows and 1280&times;720 on the Pi. Input followed in week six: GLFW on Windows and X11 for the mouse on the Pi.</p>

    <p>Assets and shaders live in a Visual Studio shared project referenced by both the Pi and Windows projects, so both builds copy them into the same folder layout. The solution builds Debug and Release for ARM, ARM64, x86 and x64, with <code>-O3</code> on the ARM release configuration. On Perforce I kept a separate <code>_STAGING</code> workspace to check that the project built from a clean checkout, because Perforce had previously not registered changes I made to <code>.vcxproj</code> properties in Visual Studio.</p>

    <p>In week eight a classmate pointed out that, since the platform is selected at compile time, static polymorphism or the pimpl pattern would serve without a runtime virtual interface. There was no time left to change it. The base class also still contains <code>#ifdef</code>-guarded members (a GLFW window getter on Windows, an X11 display and window on the Pi), so the interface itself is not platform-neutral. The assessment feedback on the Pi build was: "some issues with the Pi build not visualising but we can see it works".</p>
  </div>
  <div class="feature-media">
    <img width="741" height="165" loading="lazy" decoding="async" src="{{ "/assets/empires/graphics-switch.png" | relative_url }}" alt="Preprocessor switch instantiating either GraphicsPi or GraphicsWindows depending on the RASPBERRY define">
    <img width="778" height="536" loading="lazy" decoding="async" src="{{ "/assets/empires/build-configs.png" | relative_url }}" alt="Visual Studio configuration manager showing the Pi and Windows projects across ARM and Win32 platforms">
  </div>
</div>

<div class="media-row">
  <figure>
    <video width="1238" height="720" poster="{{ '/assets/empires/galaxy-flythrough-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/empires/galaxy-flythrough.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Windows build at 1920&times;1080. The performance panel reads a frame time of 4 ms.</p>
  </figure>
  <figure>
    <video width="1274" height="720" poster="{{ '/assets/empires/pi-build-720p-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/empires/pi-build-720p.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">The galaxy view on the Raspberry Pi 4 in a 1280&times;720 window, captured over VNC on the Pi desktop. The panel reads frame times between 80 and 151 ms, mostly 80 to 100 ms (about 7 to 12.5 fps).</p>
  </figure>
</div>

The two clips are not a controlled benchmark: the Pi clip was recorded through a VNC session, and neither build was profiled. They do show a frame-time gap of a factor of 20 or more between the two targets for the galaxy view.

---

## Gameplay framework

<div class="feature-grid reverse">
  <div class="feature-media">
    <img width="1508" height="1057" loading="lazy" decoding="async" src="{{ "/assets/empires/miro-gameplay-plan.jpg" | relative_url }}" alt="Miro board of sticky notes breaking the brief into player, empire, systems, planets and vessel types such as supply, fighter and carrier">
    <p class="video-caption">The Miro board my partner and I used to break the brief into classes: player, empire, star systems, planets, and vessel types (supply, fighter, carrier).</p>
  </div>
  <div class="feature-text">
    <p>After the merge, my partner and I decomposed the brief on a Miro board into the classes the game would need and planned the sprints on Trello. A reviewer in week five suggested generalising the definitions so that a planet and a vessel share one type, which would make later feature changes cheaper; we did not adopt it.</p>
    <p>By the end of week eight the sprint board showed the Windows build, the post-processing buffer, the model and instanced-model classes and the sphere-of-influence system as done. The vessel-building UI, the HUD, home-planet interactions, planetary credit generation and the four vessel types (abbreviated DV, FV, CV and SV on the board) were not done. The prototype therefore has a generated world and an influence simulation, but no player-driven gameplay loop.</p>
  </div>
</div>

### World generation and influence

The generator lays out the galaxy and its star systems from a random seed, gives every planet a random name, and assigns each planet a random technology level and a resource level. The technology level scales how fast a planet's sphere of influence spreads. The influence simulation came from my partner's prototype and was ported into the merged build in week five; in week seven I added its visualisation. When an empire takes a planet, the planet's colour is linearly interpolated toward the empire's colour.

Clicking a planet inverts the combined projection-view matrix to unproject the cursor at two depths, which gives the start and end of a world-space picking ray; the selected planet's stats appear in the ImGui panel. A button in the panel moves the camera to the empire's home planet, and Escape opens a pause menu.

<div class="media-row">
  <figure>
    <video width="1360" height="1144" poster="{{ '/assets/empires/empire-spread-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/empires/empire-spread.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Week 5, first merged Windows build: placeholder cone meshes coloured by empire, and a console printing mouse coordinates whenever they change.</p>
  </figure>
  <figure>
    <video width="930" height="720" poster="{{ '/assets/empires/influence-spread-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/empires/influence-spread.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Week 7 build, played at 2&times; speed: one empire's sphere of influence (green) expanding while the debug panel shows control on a selected planet rising from 82 % to 100 %.</p>
  </figure>
</div>

---

## Rendering

<div class="feature-grid">
  <div class="feature-text">
    <p>Rendering goes through an <code>InstancedModel</code> class: one mesh, VAO and texture shared by every object of that type. Its draw function binds the texture and VAO once, then loops over the instances, setting each one's model matrix and colour uniform and issuing one <code>glDrawArrays</code> call per instance. The same function also calls <code>glGenerateMipmap</code> and queries the uniform locations on every draw; the uniform lookups are the per-frame work the week-one review had flagged.</p>
    <p>The shaders are a GLSL ES 3.00 pair. The fragment shader computes a Lambert diffuse term from a single point light hard-coded at (0, &minus;50, 100), multiplies it by the instance colour and samples the texture. There is no ambient term, so surfaces facing away from the light are black. The colour uniform is also what the takeover interpolation animates. The light was intended as a placeholder and was not replaced.</p>
    <p>Every planet in the build uses one asset that I made: a sphere modelled in Blender, a diffuse map drawn by hand, exported to OBJ and loaded through <code>tinyobjloader</code>. Text on the texture makes UV errors visible. Model matrices are rebuilt lazily behind a dirty flag in the order scale, rotate, translate.</p>
    <p>In week six I generated Perlin-noise textures in a separate test project as part of my procedural-generation goal. They were not integrated: in the last weeks I switched my specialisation to post-processing, which I could finish in the remaining time.</p>
  </div>
  <div class="feature-media">
    <img width="512" height="512" loading="lazy" decoding="async" src="{{ "/assets/empires/perlin-test-texture.jpg" | relative_url }}" alt="Colour-mapped Perlin noise texture in blue, yellow, green and white">
    <p class="video-caption">Week 6: a colour-mapped Perlin-noise texture from the test project. It was not used in the build.</p>
  </div>
</div>

<div class="media-row">
  <figure>
    <img width="900" height="900" loading="lazy" decoding="async" src="{{ "/assets/empires/texture-handdrawn.png" | relative_url }}" alt="A hand-drawn diffuse texture, mostly white with the words This is a Planet written on it">
    <p class="video-caption">The hand-drawn diffuse map.</p>
  </figure>
  <figure>
    <img width="754" height="707" loading="lazy" decoding="async" src="{{ "/assets/empires/sphere-blender.png" | relative_url }}" alt="The untextured faceted sphere modelled in Blender, viewed in a 3D viewer">
    <p class="video-caption">The sphere, modelled in Blender and exported as OBJ.</p>
  </figure>
  <figure>
    <img width="558" height="446" loading="lazy" decoding="async" src="{{ "/assets/empires/planet-ingame.png" | relative_url }}" alt="The same sphere rendered in-game in red, with the hand-written texture legible across its surface">
    <p class="video-caption">In the engine, lit by the single fixed point light. The legible text confirms the UV mapping.</p>
  </figure>
</div>

---

## Bullet demo and post-processing

<div class="feature-grid reverse">
  <div class="feature-media">
    <video width="1920" height="1080" data-autoplay loop muted playsinline preload="none" poster="{{ '/assets/empires/title-screen-poster.jpg' | relative_url }}" aria-label="Title screen with Start and Quit buttons and a small Bullet Physics demo of two spheres colliding"><source src="{{ '/assets/empires/title-screen.mp4' | relative_url }}" type="video/mp4"></video>
    <p class="video-caption">Title screen with the Bullet demo: a dynamic sphere repeatedly dropped onto a static one.</p>
  </div>
  <div class="feature-text">
    <p>The brief required Bullet Physics, and I did not find a place for rigid-body physics in the strategy game itself, so the title screen runs a small demo. Two unit-radius <code>btSphereShape</code>s go into the dynamics world: a static one at the origin with zero mass, and a dynamic one with mass 1 and its local inertia computed from the shape. The dynamic sphere starts 20 units up and 0.25 units off-centre; dropped exactly on the centre it would come to rest on top of the other sphere.</p>
    <p>Each frame the world steps by 1/60&nbsp;s with up to 10 substeps, and every body's position is copied from its motion state into the matching model, with a manual cast from Bullet's vector type to glm. When the dynamic sphere falls below y&nbsp;=&nbsp;&minus;40 its forces and velocities are cleared and it is reset to the start position, so the demo loops. Bullet performs the broad phase (collecting pairs that could collide) and the narrow phase (exact test and response). Pressing Start generates the galaxy and stops the demo.</p>
    <p>The specialisation I delivered is a <strong>post-processing pass</strong>. The scene renders into a framebuffer with a colour texture; a fullscreen quad then draws that texture through a vignette shader, and the GUI is drawn on top. In the game loop this is <code>renderToTexture()</code> and <code>renderToScreen()</code> around the existing <code>draw()</code> call, which left the existing draw calls unchanged. Bullet and post-processing were both implemented in week eight.</p>
  </div>
</div>

{% include youtube.html id="2sRYQouS4F0" title="Empires demo" caption="Full prototype demo." %}

---

## Process

- **Planning.** My process goal was to plan with Trello and measure the result against a burndown chart. Cards carried the weekly high-level goals and their risks, and daily tasks went into the work log with a reason recorded whenever a task overran.
- **Version control.** Perforce submits used a prefix convention (`[+]` added, `[~]` changed, `[-]` removed), with separate workspaces for laptop, desktop and the clean-checkout staging test.
- **Collaboration.** We tried pair programming over a call in week six; I was less productive that way and planned to work separately from then on.

## Key takeaways

- **Plan the core gameplay loop before secondary systems.** The week-two action point was to plan before implementing so that features not central to gameplay are not added first, and in week three the scenes were improvised because the game's structure was still undecided. At the end of week eight the generated world and the influence simulation worked, but the vessels, credits and HUD that would form the player's loop did not.
- **Extend a working prototype instead of starting a new codebase.** The week-six retrospective attributed the limited user interaction to having "mostly started from scratch" on the merged project, and the end-of-block evaluation judged that using one of the two prototypes as the starting point would have been the better choice.
- **Keep one-time GPU setup out of the per-frame path.** The week-one review noted that uniform and attribute locations need to be queried only once, yet the final draw path still queried uniforms and generated mipmaps on every draw, with one draw call per instance. The assessment found that the instancing mistake made the project "crawl after a while", and the plan for block D was to ask the team's other programmers to review such code.
- **Document continuously during the block.** Leaving most of the evidence documentation to week eight made that week nearly 48 hours of work; continuous documentation became one of the two goals for the next block, [Cold Candy]({{ '/cold-candy/' | relative_url }}).
- **Tell teammates directly what I am working on.** My partner's week-eight review said I "sometimes does things without notifying partner", referring to the post-processing buffer, which I had only set as my active Trello card; the action point was to communicate my current task to the team directly.
