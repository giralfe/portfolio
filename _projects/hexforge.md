---
layout: project
title: HexForge
period: "2024 - Present"
year: 2026
sort_date: "2026-07"
tags: [Physics, Graphics, Engine, C++, CUDA, Solo]
image: /assets/hexforge/xpbd-fluid-splash.jpg
repo: https://github.com/giralfe/HexForge
role: Solo Engine Programmer
platform: C++20 · OpenGL 4 · CUDA · Windows + Linux
priority: 2
featured: true
summary: "Personal C++20 engine with a GPU-resident XPBD particle solver in CUDA: fluids (Macklin and Müller 2013), cloth and ropes (XPBD), and rigid bodies after Müller et al. 2020 share one particle pool and one kernel suite, drawn with screen-space fluid rendering. Solver limits are derived from the particle radius, gravity and frame time in one documented header."
---

HexForge is a personal, cross-platform C++20 engine that I started in November 2024 and develop alone next to the MSc. It started as *Hexahedron*: a CMake project with a GitHub Actions build matrix on Windows and Ubuntu from its first week (macOS was dropped from the matrix in May 2025), an OpenGL 4 renderer, an EnTT entity registry and a Dear ImGui editor. Since 2026 most of the work has gone into physics: a unified **XPBD** particle solver in CUDA, in which water, oil, sand, rubber, cloth, ropes and rigid bodies are particles in one pool, and a **screen-space fluid renderer** for the liquid phase.

<div class="video-showcase">
  <div class="video-container">
    <video width="920" height="540" data-autoplay loop muted playsinline controls preload="none" poster="{{ '/assets/hexforge/xpbd-fluid-splash.jpg' | relative_url }}">
      <source src="{{ "/assets/hexforge/xpbd-fluid-splash.mp4" | relative_url }}" type="video/mp4">
    </video>
  </div>
  <p class="video-caption">Dam-break scene in the CUDA build (12 May 2026, laptop RTX 3080, CUDA 13.0): fluid, a pinned cloth, a rope and three rigid bodies (cube, sphere, Stanford bunny) in one solve. The editor console reports 15,754 particles, 342 distance constraints and 8,865 rigid-body member particles; the solver ran one substep of four iterations with r = 0.08 m and h = 0.32 m. In 60 readings of the frame-breakdown panel taken every 2 s over the two-minute capture, the physics tick took 11 to 17 ms in 33, 25 to 39 ms in 20 and 46 to 54 ms in 7 (about 60, 30 and 20 fps).</p>
</div>

---

## Solver architecture

All particles live in one structure-of-arrays pool on the device between frames (positions, predicted positions, velocities, inverse masses, material ids). Behaviour branches on a per-particle material whose `phase` field is one of static, fluid, solid, cloth or rigid. The material presets (water, oil, sand, rubber, cloth, rigid) set the phase together with rest density, viscosity, friction, restitution and compliance. One substep runs:

1. **Predict** free particles with gravity, and predict the rigid bodies (below), then place their member particles at the predicted body pose.
2. **Spatial hash** of the predicted positions: one cell hash per particle, a CUB radix sort of (hash, index) pairs, and a start/end table per cell. Neighbour queries visit the 27 surrounding cells.
3. **K solver iterations**, each evaluating density, boundary push, domain walls, distance constraints and particle contacts. Every kernel writes its correction into a shared delta buffer with atomic adds (Jacobi style); rigid-body corrections are then aggregated, and the deltas are applied once per iteration.
4. **Velocity update** from the position change, with restitution applied along the contact normals accumulated during the iterations, then the picker spring and a speed clamp.

Once per frame, XSPH viscosity smooths fluid velocities, a foam classifier flags spray particles, and the final positions are copied **device to device into the render VBO** through CUDA-OpenGL interop, so the renderer reads particle positions without a CPU round trip. Each constraint kernel is annotated in the kernel header with the method it implements:

| Kernel | Method | Role |
|---|---|---|
| Density | Position Based Fluids (Macklin and Müller 2013), eq. 9 to 14 | incompressibility, with the `s_corr` artificial-pressure term against particle clustering |
| Distance | PBD distance constraint (Müller et al. 2007) in XPBD form (Macklin, Müller and Chentanez 2016) | cloth and ropes, with compliance α instead of an iteration-dependent stiffness |
| Contact | Position-based simulation survey (Bender, Müller and Macklin 2017), section 4.4 | non-penetration between spheres, Coulomb friction from the relative tangential displacement |
| Rigid bodies | Detailed Rigid Body Simulation with XPBD (Müller et al. 2020) | body state (x, q, v, ω) and inertia tensor per body; member particles follow the body pose |
| Boundary push | PBF 2013, section 5 | inward correction in an h-wide band along each wall, so fluid does not stick to the walls |
| XSPH viscosity | Schechter and Bridson 2012; PBF 2013, section 6.1 | velocity smoothing |
| Chebyshev acceleration | Wang 2015 | semi-iterative acceleration between iterations; off by default, since with substepping it is not needed and its overshoot can add energy |
| Vorticity confinement | PBF 2013, section 6.2 | implemented but not called in the step, because it adds energy by construction |

The step structure follows Macklin et al. 2019 (*Small Steps in Physics Simulation*): several short substeps with few iterations each rather than one long step with many iterations. The foam classifier is adapted from Ihmsen et al. 2012: a fluid particle is marked as spray when the product of a speed score and an isolation score (few same-phase neighbours within h) exceeds 0.3.

---

## Rigid bodies and coupling

<div class="feature-grid">
  <div class="feature-text">
    <p>A rigid body is sampled from a triangle mesh by a voxeliser into a cluster of member particles, and it stores its own centre of mass, orientation quaternion, linear and angular velocity and inverse inertia tensor. Following Müller et al. 2020, each substep first integrates the body with gravity and per-second damping rates and records the previous pose. The member particles take part in the ordinary contact, wall and fluid kernels. After each iteration, one thread per body sums the corrections of its members into a translation and a rotation,</p>
    <p><code>Δx = Σ m<sub>i</sub>Δp<sub>i</sub> / M</code>, &nbsp; <code>Δθ = I<sup>−1</sup><sub>world</sub> Σ r<sub>i</sub> × m<sub>i</sub>Δp<sub>i</sub></code>,</p>
    <p>with Δθ clamped to 0.5 rad per iteration, and the members are placed at the corrected pose again. After the iterations the body velocities follow from the pose change, <code>v = (x − x<sub>prev</sub>)/Δt</code> and <code>ω = 2·vec(q q<sub>prev</sub><sup>−1</sup>)/Δt</code>, and every member particle receives <code>v + ω × r</code>, so the XSPH pass and neighbouring fluid particles see the body's actual surface velocity.</p>
    <p>Coupling to the fluid has two parts. Rigid, solid and static particles count as boundary particles in the fluid density sum, so the density constraint pushes fluid away from them. In mixed fluid-solid contacts the solid side receives 10% of its mass-weighted share of the correction, so a body is not displaced by every droplet that touches it.</p>
  </div>
  <div class="feature-media">
    <video width="920" height="540" poster="{{ '/assets/hexforge/xpbd-cloth-particles-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/hexforge/xpbd-cloth-particles.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Particle view of the same capture after the fluid has spread: the voxelised Stanford bunny (white) is dragged by the spring picker (magenta line) past the rigid sphere (green), over free fluid particles on the floor, with the cloth particles (pink) at the back.</p>
  </div>
</div>

<div class="video-showcase">
  <video width="958" height="540" poster="{{ '/assets/hexforge/xpbd-particle-view-coupling-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
    <source src="{{ "/assets/hexforge/xpbd-particle-view-coupling.mp4" | relative_url }}" type="video/mp4">
  </video>
  <p class="video-caption">Particle view earlier in the same capture: fluid (blue) around the partly submerged bunny (white), the sphere (green) and the cube (orange). The sphere is pulled through the fluid with the spring picker; the cloth (pink) and rope (yellow) hang behind.</p>
</div>

---

## Solver parameters from physical inputs

`AutoTune` takes the particle radius r, gravity g, the frame time, a damping rate in 1/s and a boundary-recovery fraction, and sets the remaining solver parameters from the relations in `StabilityLimits.h`. The header states each relation and its source:

- **Spacing and interaction radius.** Particles spawn at spacing `s = 2r`, so neighbouring spheres touch without overlap. The SPH interaction radius is `h = 4r`, which gives an interior particle about 30 to 40 neighbours, the range PBF uses for a stable Poly6 density estimate.
- **Substep length.** A particle falling freely gains `g·Δt` per substep and moves `g·Δt²`; requiring that displacement to stay below one radius gives `Δt < √(r/g)`, used with a safety factor of 0.5. The substep count is the frame time divided by that bound, rounded up and clamped to [1, 32].
- **Speed cap.** Two particles approaching each other must not swap places in one substep, which gives `v < r/Δt`; the cap is `0.9·r/Δt`.
- **Damping.** A rate λ in 1/s becomes a per-substep factor `e^(−λ·Δt)`, so the decay per second does not depend on the substep count.
- **Boundary push.** The user setting is the fraction of h by which a fluid particle at the wall is pushed inward per frame; it is divided by the total number of iterations per frame (substeps × iterations).
- **Rest density.** PBF evaluates `C = ρ/ρ₀ − 1` with a Poly6 sum that carries no physical mass, so ρ₀ must be the Poly6 sum over the spawn lattice, not 1000 kg/m³. With a mismatched ρ₀ the constraint is inactive at spawn (C is clamped to zero), the fluid falls and interpenetrates, local densities then exceed ρ₀ by a large factor and the resulting multipliers eject particles.

For the recorded scene (r = 0.08 m, g = 9.81 m/s², 60 Hz) the free-fall bound is 45 ms, longer than the 16.7 ms frame, so the derived configuration is one substep; the capture used four iterations and a speed cap of 4.32 m/s. Scene files can override the substep and iteration counts, in which case the speed cap and boundary push are recomputed from the resulting substep length. Not every constant is derived: the Jacobi under-relaxation of 0.5 for distance constraints and fluid-fluid contacts, an extra damping factor of 0.994 on top of the derived one, the 10% solid share in fluid-solid contacts, the foam thresholds and the picker gains are set by hand.

---

## Cloth, ropes and the spring picker

<div class="feature-grid reverse">
  <div class="feature-media">
    <video width="958" height="540" poster="{{ '/assets/hexforge/xpbd-cloth-picker-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/hexforge/xpbd-cloth-picker.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Screen-space rendering in the same capture: the 12 × 8 cloth, pinned along its top row, pulled sideways and released with the spring picker (magenta line and handles) while the fluid, bunny and sphere settle in front of it.</p>
  </div>
  <div class="feature-text">
    <p>Cloth and ropes are particles joined by XPBD distance constraints. The multipliers are reset at the start of each substep and accumulated over its iterations, and the compliance α enters through <code>α̃ = α/Δt²</code>. Because the iterations are Jacobi iterations, a cloth node that belongs to four to eight constraints would receive the sum of all their corrections at once and overshoot; each contribution is therefore scaled by 0.5. Cloth particles skip sphere contacts with each other and with fluid, since the distance graph defines the sheet and a single particle layer is too thin to act as a barrier for fluid.</p>
    <p>The spring picker casts a ray from the cursor, selects the nearest particle within a radius of the ray and pulls it toward the cursor target with a damped spring, <code>k(x<sub>target</sub> − x) − c·v</code> (k = 4000 and c = 60 by default). On a free particle it acts directly; on a rigid-body member it acts at that point of the body, so it changes both the linear velocity and, through the inverse inertia tensor, the angular velocity.</p>
  </div>
</div>

---

## Fluid rendering

Spheres drawn per particle do not show a continuous liquid surface. The fluid pass follows van der Laan et al. 2009 (*Screen Space Fluid Rendering for Games*) and extends it with thickness-based absorption, screen-space reflections and a foam pass:

1. **Depth and thickness.** Sphere impostors write view-space depth and additive thickness into two render targets.
2. **Smoothing.** Separable bilateral filtering of the depth, with an edge-stopping range term so silhouettes are kept, and a Gaussian blur of the thickness.
3. **Composition.** Normals are reconstructed from the smoothed depth; refraction, Beer-Lambert absorption over the thickness, Fresnel with F0 = 0.02 (water at normal incidence), a specular term and either a screen-space reflection (8 ray-march steps) or the sky colour are composed into the HDR scene buffer.
4. **Foam.** Additive sprites for the particles the solver flagged as spray.

The bilateral range parameter is expressed in metres of view-space depth. The committed value of 1.0 m (12 particle radii) merged separate droplets into one surface; the local working copy uses 0.25 m, about three radii, with two separable passes.

---

## CPU fallback and regression tests

The same `PhysicsSystem` interface has a CPU path, which is what the continuous-integration machines build. In the committed version it represents rigid bodies by shape matching (Müller et al. 2005), using a fixed five-step Higham iteration `R ← ½(R + R⁻ᵀ)` for the polar decomposition. That iteration only converges quadratically near singular value 1, and the moment matrix of a particle cluster is a sum over its members: for a 43-particle bunny its singular values were (36.1, 15.9, 9.7). After five steps the extracted "rotation" still had singular values (1.409, 1.036, 1.003), a 41% stretch with ‖RᵀR − I‖<sub>F</sub> = 0.99. Applied as the rigid target every substep, this grew the cluster by about 1.76 times per frame and 45 times within ten frames.

The local working copy, which is not yet pushed, replaces the iteration with the rotation extraction of Müller, Bender, Chentanez and Macklin 2016. It normalises by the trace term and is therefore independent of the scale of the moment matrix, cannot return a reflection, and is warm-started from the previous orientation so that two to three iterations suffice at rest. The working copy also adds position-based fluid density to the CPU path, a JSON scene format with four scenes, and a regression suite. The numerical tests each pin down a defect that had produced plausible motion while a quantity was wrong:

- the extracted rotation is orthogonal and matches an applied rotation on an anisotropic, large-scale cluster, and stays a proper rotation (det R = +1) for a mirrored input;
- a cluster at rest stays at scale 1.0 (±10⁻³) over 200 shape-matching substeps;
- the voxeliser honours the requested spacing (an earlier clamp to one sixth of the mesh extent capped a unit cube at 216 particles), keeps the rest offsets centred (Σ local rest = 0), gives the same particle count wherever the mesh is placed, and meets a particle budget by coarsening the lattice rather than dropping particles;
- the per-substep shape-matching stiffness `α_sub = 1 − (1 − α_frame)^(1/N)` composes back to the per-frame value for N = 1, 2, 3 and 8 (a fixed 0.95 per substep left a per-frame residual of 0.05³ = 1.25 × 10⁻⁴ at three substeps instead of the requested 0.05);
- scene files round-trip through JSON and every shipped scene parses.

The last local run (31 July 2026) passed all 142 checks. In the same CPU-only Linux build, the Dam Break scene file (5,921 particles, 342 distance constraints, three rigid bodies with 1,712 member particles, three substeps of two iterations) logged 22.6 ms and 20.2 ms of physics time at frames 120 and 240.

---

## Renderer and editor

<div class="feature-grid">
  <div class="feature-text">
    <h3>Shading, shadows, batching</h3>
    <p>Physically based shading uses the Cook-Torrance model with the GGX distribution, a Schlick-GGX (Smith) geometry term and Schlick's Fresnel approximation, in the metallic/roughness workflow. Directional shadows use a shadow map filtered with a PCF kernel. Models are loaded through Assimp into a resource manager, and a shader manager caches compiled programs by their source paths. The Dear ImGui editor uses docking and provides a console with command execution, a lighting tool with a live view of the shadow map, scene information, a frame-time graph and a per-frame breakdown (event polling, UI, physics tick, world rendering, buffer swap). The timings on this page are read from this panel or from the same breakdown in the log.</p>
    <p>The stress scene on the right (May 2025) draws 2,501 batched Stanford bunnies with shadows. Over 30 readings of the metrics panel across the clip, the frame time averaged 7.3 ms (range 6.0 to 12 ms), about 136 fps, on the same laptop.</p>
  </div>
  <div class="feature-media">
    <video width="814" height="720" poster="{{ '/assets/hexforge/rendering_stress_test-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/hexforge/rendering_stress_test.mp4" | relative_url }}" type="video/mp4">
    </video>
  </div>
</div>

<div class="feature-grid reverse">
  <div class="feature-media">
    <img width="1600" height="920" loading="lazy" decoding="async" src="{{ "/assets/hexforge/pbr_bunnies.jpg" | relative_url }}" alt="Rows of PBR-textured Stanford bunnies casting shadows under one directional light, inside the HexForge editor with the rendering metrics, console, scene information and lighting tool panels">
  </div>
  <div class="feature-media">
    <img width="431" height="332" loading="lazy" decoding="async" src="{{ "/assets/hexforge/pbr_glossy_wood.png" | relative_url }}" alt="Close-up of a glossy wood PBR material in HexForge with a specular highlight across the boards">
  </div>
</div>

---

## Future work

- **Substeps and speed cap.** The speed cap lets a particle move at most 0.9&nbsp;r per substep. With r = 0.08 m and one substep per 60 Hz frame (the free-fall bound requires only one) the cap is 4.32 m/s, below the speed after a 1 m free fall (4.43 m/s); fast fluid particles are clamped, rigid-body velocities are not. The cap rises in proportion to the substep count (8.64 m/s at two substeps), so the trade-off between substeps and solver cost is the first tuning target.
- **XPBD compliance.** The density multipliers are reset at every iteration. Accumulating them over the substep would make the material compliance act as XPBD compliance rather than as a regulariser on each Jacobi solve.
- **Fixed physics step.** The tick advances by the measured frame time, clamped to 1/30 s, while the derived limits assume a 1/60 s frame. A fixed physics step with an accumulator would keep every substep within the limits it was derived for.
- **Build and release.** The committed CMake configuration compiles only the CPU path; the recordings on this page come from a separate Windows CUDA build. Adding the CUDA kernels to the build, and committing the scene format, the CPU fluid solver and the regression tests from the local working copy, would let the public repository reproduce this page.
- **Benchmark harness.** All timings here come from the editor's frame breakdown or log. A harness that reports solver cost per substep and per kernel would make them repeatable.

---

## Related engines

Before HexForge I wrote *Mirage* (2022), an EnTT, glTF and GLFW renderer. Shorter experiments since then: *Lumina* (2025), a chunked 2D tile engine; *ExNihilo* (2025), an analytic ray-cast voxel renderer on bare WinAPI; and *VoxelGenesis* (2026), a raylib voxel world with a thread-pooled chunk manager and a ray-marched 3D texture.

Source: [github.com/giralfe/HexForge](https://github.com/giralfe/HexForge).
