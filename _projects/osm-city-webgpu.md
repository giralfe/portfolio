---
layout: project
title: "Procedural City from OpenStreetMap"
period: "2026"
year: 2026
sort_date: "2026-03"
tags: [Graphics, Rust, Team]
image: /assets/osm-city/skyline-day-card.jpg
role: Renderer, chunk streaming, nature & lighting (team of 3)
platform: Rust → WebAssembly · WebGPU / WGSL · TypeScript
priority: 6
summary: "A browser city generator for TU/e's Visual Computing Project (team of 3). OpenStreetMap data is streamed in chunks and extruded into buildings, streets and vegetation by WGSL compute shaders, drawn with indirect draws and shaded by a clustered Forward+ pipeline, benchmarked with up to 10,000 animated point lights."
trailer: EgBS7W_UMaM
trailer_caption: "A demo of the generated world, running in the browser."
---

The Visual Computing Project (2IMV10) at TU/e asks students to generate a navigable 3D world from real OpenStreetMap (OSM) data, with the emphasis on geometry generation, lighting and animation. Leander ten Hoedt, Razvan Efros and I built a browser application for it between February and April 2026. Per-frame work is moved out of JavaScript into Rust compiled to WebAssembly, and geometry generation is moved from the CPU to WebGPU compute shaders.

Contributions, from the repository history: I wrote the first prototype in TypeScript and replaced it six days later with the Rust version. After that I wrote the engine architecture, the OSM ingestion, the chunk streaming, the geometry compute and render shaders, the vegetation and wind system, the lighting, reflections and post-processing, the culling and level-of-detail work, the final UI rework and the light benchmark. Leander wrote the mouse picking, entity selection, road graph, route planner, route overlay and route flight, and the camera smoothing and zoom. Razvan wrote shadow mapping and static OSM props on separate branches, which were not merged into the main branch (see Limitations).

<div class="video-showcase">
  <img width="1600" height="819" loading="lazy" decoding="async" src="{{ "/assets/osm-city/skyline-day.jpg" | relative_url }}" alt="A generated skyline of extruded OpenStreetMap buildings with procedural window patterns reflected in water, with the live performance panel reading 68 fps">
  <p class="video-caption">Generated district: OSM building footprints extruded on the GPU with procedural façades, next to a reflective water surface. The performance panel is part of the application.</p>
</div>

---

## Architecture

The application has three layers. A TypeScript shell owns the DOM, the `requestAnimationFrame` loop and input. The Rust engine, exposed through `wasm_bindgen`, fetches OSM data from the Overpass API, parses it with `serde_json` inside WebAssembly, projects and triangulates footprints (ear clipping with the `earcutr` crate) and manages every WebGPU resource. The GPU generates the 3D geometry in compute shaders, bins the lights, rasterises and post-processes. The Overpass query requests all needed feature classes for a bounding box from two mirrors in parallel; the first successful response is used and the other request is cancelled.

Only 2D data crosses the WebAssembly boundary. A building wall is uploaded as a 32-byte record (two endpoints, height, base height and a seed). A compute shader expands each record into triangles, computes the exact vertex count first, reserves that many slots in a shared vertex buffer with an `atomicAdd` on a counter, and writes its vertices there. The same counter serves as the vertex count of an indirect draw call, so the CPU never reads back or builds city meshes and JavaScript never handles per-vertex data.

<div class="feature-grid">
  <div class="feature-text">
    <h3>Chunk streaming</h3>
    <p>The world is a <code>HashMap</code> of square chunks, 250 Web Mercator units on a side, which is about 156 m on the ground at the default location (Eindhoven, 51.45° N). Chunks load in an 11 × 11 block around the camera and are unloaded only once they are eight chunks away, so crossing a chunk border does not cause repeated loading and unloading. Removing a chunk is a single map removal; Rust's ownership releases its GPU buffers without a garbage collector and without explicit <code>destroy()</code> calls, which can fail while commands that use the buffer are still queued.</p>
    <p>Parsing several megabytes of OSM data synchronously would block the browser's event loop, so the parsing and building loops are <code>async</code> and yield to the browser every 25,000 records. Chunk construction is split into start, step and finish calls under an 8 ms budget per frame, at most eight new compute dispatches are issued per frame, and each new chunk fades in over 0.7 s.</p>
    <p>Projected coordinates are too large for <code>f32</code>, so the Web Mercator projection is computed in <code>f64</code> around a local origin set once per location, and vertices are stored in world space relative to that origin. Every pass therefore assumes an identity model matrix; this invariant determined which branches could be merged.</p>
  </div>
  <div class="feature-media">
    <img width="1600" height="723" loading="lazy" decoding="async" src="{{ "/assets/osm-city/aerial-sunset.jpg" | relative_url }}" alt="Aerial view at sunset over a generated district with roads, a lake and clusters of buildings under an analytic sky">
    <p class="video-caption">Aerial view at dusk over loaded chunks, under the analytic sky.</p>
  </div>
</div>

---

## Geometry generation on the GPU

**Buildings.** Each wall record is processed by one compute invocation. Walls more than 2,500 units from the camera emit nothing; beyond 800 units a wall is a single quad (6 vertices); closer walls receive a parapet ledge (18 vertices) and one pilaster per 5 units of wall length, capped at 30 (30 vertices each), so one 32-byte record produces up to 6 + 18 + 31 × 30 = 954 vertices. The level of detail is chosen once when the chunk is built, and the render shaders fade detail with distance. Façades, window layouts and the emissive windows at night are generated in the fragment shader rather than stored as textures.

**Streets.** Centre lines are expanded into quads, with a small vertical offset per surface class (railway +0.045, asphalt +0.04, paved +0.03, dirt +0.02, footpath +0.01) to prevent z-fighting between coplanar surfaces. Junctions receive circular joint caps, ways tagged as bridges or with a raised `layer` become bridge decks with pillars every 40 units, and road nodes tagged as crossings receive zebra stripes drawn procedurally from the UV coordinates.

**Ground, water and vegetation.** Roofs, water and ground are triangulated on the CPU and receive normals and colour in their compute passes. Trees are placed in areas tagged as wood, forest, scrub, orchard, park, garden or nature reserve, at three levels of detail (6, 66 and 372 vertices). Grass is scattered inside walkable triangles at 5, 2.5 or 0.6 blades per m² depending on distance.

<div class="feature-grid reverse">
  <div class="feature-text">
    <h3>Wind</h3>
    <p>A global wind field, built from 3D value noise scrolled along the wind direction, is read by the foliage, grass and ground shaders, so vegetation across a district moves coherently. Grass blades and shrubs bend quadratically with height above the root, tree trunks bend sinusoidally, and a mouse click injects an expanding circular gust. The tree density, wind strength and wind direction are exposed as sliders.</p>
    <p>Visibility is tested per chunk: each chunk's axis-aligned bounding box is tested against the six frustum planes. The first versions culled chunks at the screen edges while their geometry was still visible, and the bounding boxes had to be revised several times before culling was conservative.</p>
  </div>
  <div class="feature-media">
    <img width="1600" height="833" loading="lazy" decoding="async" src="{{ "/assets/osm-city/forest-lake.jpg" | relative_url }}" alt="The reworked interface at night with the Ecosystem menu open, showing sliders for arboreal density, gust magnitude and gust heading, and the performance panel reading 111 fps">
    <p class="video-caption">The reworked interface with the Ecosystem menu open (tree density, gust magnitude, gust heading) and the performance panel reading 111 fps at 7.63 ms per frame.</p>
  </div>
</div>

---

## Lighting and shading

Forward shading evaluates every light at every pixel; deferred shading scales to many lights but complicates transparency and multiple materials. The renderer uses clustered forward shading (Olsson, Billeter and Assarsson, 2012). The view frustum is divided into a 16 × 9 × 24 grid of clusters (3,456 in total), with exponentially spaced depth slices between the near plane at 0.5 and the far plane at 5,000 units, so that clusters remain roughly cube-shaped with distance. A first compute pass computes each cluster's view-space bounding box; a second tests every light, as a sphere, against each box and records up to 128 light indices per cluster; the fragment shader finds its cluster from screen position and depth and evaluates only the lights in that list. The per-pixel cost therefore depends on the number of lights in the pixel's cluster rather than on the total.

Shading uses a Cook-Torrance microfacet BRDF (GGX distribution, Smith geometry term, Schlick Fresnel) with hemispherical ambient light and exponential fog. The sky is an analytic gradient driven by sun elevation, with a sun disc, halo and hashed stars at night. Buildings and water sample a 256 × 256 HDR reflection cubemap rendered at the camera, with box-projected parallax correction; its faces are re-rendered progressively, one face per frame by default. The HDR image passes through bloom (a bright pass and a separable 9-tap Gaussian), ACES tone mapping and FXAA.

<div class="feature-grid">
  <div class="feature-media">
    <img width="1600" height="699" loading="lazy" decoding="async" src="{{ "/assets/osm-city/skyline-night.jpg" | relative_url }}" alt="A generated building at night with emissive procedural windows, reflected in a water surface under a starry sky">
    <p class="video-caption">Night: emissive procedural windows on a generated building, reflected in a water surface, with hashed stars in the sky.</p>
  </div>
  <div class="feature-text">
    <h3>Light benchmark</h3>
    <p>A "disco" mode places point lights in every loaded chunk (up to 64 per chunk, 20-unit radius) on Lissajous paths recomputed every frame. A benchmark button sweeps the light limit through 0, 1,000, 3,000, 5,000, 8,000 and 10,000, waits 1.5 s at each step and records the frame rate shown by the performance panel, which is a moving average. On a laptop RTX 3080 (8 GB) the frame rate fell from 161 fps without lights to 67 fps at 5,000 and 36 fps at 10,000.</p>
  </div>
</div>

<div class="video-showcase">
  <svg viewBox="0 0 640 300" width="640" height="300" role="img" aria-labelledby="osm-bench-title" style="width:100%;height:auto;max-width:760px;display:block;margin:0 auto;font-size:12px">
    <title id="osm-bench-title">Frame rate against point-light limit: 161 fps at 0, 143 at 1,000, 94 at 3,000, 67 at 5,000, 44 at 8,000 and 36 at 10,000</title>
    <g stroke="var(--border-color)" stroke-width="1">
      <line x1="48" y1="16" x2="620" y2="16"/><line x1="48" y1="56" x2="620" y2="56"/><line x1="48" y1="96" x2="620" y2="96"/><line x1="48" y1="136" x2="620" y2="136"/><line x1="48" y1="176" x2="620" y2="176"/><line x1="48" y1="216" x2="620" y2="216"/>
    </g>
    <line x1="48" y1="256" x2="620" y2="256" stroke="var(--text-tertiary)" stroke-width="1"/>
    <g fill="var(--text-tertiary)" text-anchor="end">
      <text x="40" y="260">0</text><text x="40" y="220">30</text><text x="40" y="180">60</text><text x="40" y="140">90</text><text x="40" y="100">120</text><text x="40" y="60">150</text><text x="40" y="20">180</text>
    </g>
    <g fill="var(--text-tertiary)" text-anchor="middle">
      <text x="48" y="274">0</text><text x="162.4" y="274">2,000</text><text x="276.8" y="274">4,000</text><text x="391.2" y="274">6,000</text><text x="505.6" y="274">8,000</text><text x="620" y="274">10,000</text>
      <text x="334" y="296" fill="var(--text-secondary)">Point-light limit</text>
      <text x="0" y="0" transform="translate(12 136) rotate(-90)" fill="var(--text-secondary)">Frames per second</text>
    </g>
    <polyline points="48,41.3 105.2,65.3 219.6,130.7 334,166.7 505.6,197.3 620,208" fill="none" stroke="var(--primary-color)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    <g fill="var(--primary-color)" stroke="var(--bg-primary)" stroke-width="2">
      <circle cx="48" cy="41.3" r="4"><title>0 lights: 161 fps</title></circle>
      <circle cx="105.2" cy="65.3" r="4"><title>1,000 lights: 143 fps</title></circle>
      <circle cx="219.6" cy="130.7" r="4"><title>3,000 lights: 94 fps</title></circle>
      <circle cx="334" cy="166.7" r="4"><title>5,000 lights: 67 fps</title></circle>
      <circle cx="505.6" cy="197.3" r="4"><title>8,000 lights: 44 fps</title></circle>
      <circle cx="620" cy="208" r="4"><title>10,000 lights: 36 fps</title></circle>
    </g>
    <g fill="var(--text-secondary)">
      <text x="58" y="37">161 fps</text><text x="342" y="160">67 fps</text><text x="620" y="196" text-anchor="end">36 fps</text>
    </g>
  </svg>
  <p class="video-caption">Benchmark sweep on a laptop RTX 3080 (8 GB): 161, 143, 94, 67, 44 and 36 fps at light limits of 0, 1,000, 3,000, 5,000, 8,000 and 10,000. One run, one moving-average reading per step.</p>
</div>

---

## Future work

- **Benchmark.** Each step is a single reading of a moving average after 1.5 s, from one run. Repeated runs with variance, and a recorded count of loaded chunks, would confirm the upper steps: the number of active lights is the smaller of the limit and 64 per loaded chunk, so the default load area of 121 chunks allows at most 7,744 lights unless chunks retained from earlier camera movement were still loaded, and the 8,000 and 10,000 steps may have used fewer lights than the limit. The disco lights cast no shadows.
- **Shadows and props.** Shadow mapping and static props (benches, bollards, lamps and similar point features) exist on separate branches. Merging the shadow pass needs two changes. It re-applies a per-chunk translation to geometry that is already stored in world space, so casters are translated twice; and it writes that translation into one shared uniform slot inside a CPU loop, and because WebGPU executes queued buffer writes before the submitted commands, every draw would read the last chunk's matrix. Using the world-space vertices directly, or a storage buffer indexed by instance or dynamic uniform offsets, resolves both. The shadow map is a single directional map of 2048 × 2048 texels covering 1,000 units, about 0.5 units per texel.
- **Terrain.** An elevation query exists, but terrain is flattened to height zero to keep roads from intersecting buildings. Placing roads and buildings on the queried elevation is the step that would enable it.
- **Precision.** The projection origin is fixed per location. Re-basing it as the camera moves would keep vertex precision constant away from the chosen location.
- **Level of detail.** Building detail is chosen once per chunk build from the camera position at that time; only the render shaders fade detail afterwards. Re-selecting it as the camera moves would let the geometry follow the fade.
