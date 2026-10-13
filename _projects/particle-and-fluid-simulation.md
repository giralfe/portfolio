---
layout: project
title: "Particletoys: Particle, Cloth & Fluid Simulation"
period: "2026"
year: 2026
sort_date: "2026-06"
tags: [Physics, Research, C++, Team]
image: /assets/simulation-cg/poster-fire.jpg
role: Constraint solver, integrator study, cloth, rigid bodies, free surface (team of 3)
platform: C++ · OpenGL · Dear ImGui (Windows / Linux / macOS)
priority: 7
featured: false
summary: "Two group projects for TU/e's Simulation in Computer Graphics course in one C++ application: a constrained 2D particle system with a measured comparison of four integrators, then Stam's stable-fluids solver extended with a level-set free surface, continuous rigid bodies with two-way coupling, buoyancy and a temperature field."
---

Two group projects for the TU/e master's course **Simulation in Computer Graphics** (2IMV15), April to June 2026, by a group of three: Thijs van Berkel, Marijn Kouwenberg and me. Project 1 (due 22 May 2026) is a constrained 2D particle system; project 2 (due 19 June 2026) adds a grid-based fluid solver to the same program. Both live in one C++ application, *Particletoys*, built on the course's ParticleToy skeleton with OpenGL, GLUT and a Dear ImGui control panel. Each project was delivered as code, a report and a demo video.

The division of work is recorded in both reports. In project 1 my parts were the **generalised constraint structure and solver**, the **integrator comparison** (Marijn implemented the four integrators; I built the diagnostics tool and ran the study), the **2D cloth** (spring network, cutting, wind), the visualisation layer and the ImGui interface. Thijs wrote the force structure, the spring and electromagnetic forces, angular springs and hair; Marijn wrote the state evaluation, the integrators including the implicit solver, and particle collisions. In project 2 my parts were **obstacle painting**, the **continuous rigid bodies** and their coupling to the fluid, **buoyancy and the temperature field**, and the **free surface**. Thijs prepared Stam's solver and wrote the rotation and collision of the grid-aligned shapes. Vorticity confinement and the particle-fluid coupling were not mine.

<div class="video-showcase">
  <div class="video-container">
    <video width="522" height="540" data-autoplay loop muted playsinline controls preload="none" poster="{{ '/assets/simulation-cg/poster-fire.jpg' | relative_url }}">
      <source src="{{ "/assets/simulation-cg/fire-rigid-circle.mp4" | relative_url }}" type="video/mp4">
    </video>
  </div>
  <p class="video-caption">Project 2, fire colour map: a heat source at the bottom of the domain drives a plume through thermal buoyancy. A continuous rigid disk is dragged through the plume with the mouse spring, and the plume is deflected around it.</p>
</div>

---

## Project 1: constrained particle system

### Constraint solver

Constraints follow the constrained-dynamics formulation of Witkin and Baraff (2001). Each constraint is a scalar equation `C(q) = 0` and reports its value `C`, its time derivative `Ċ`, its Jacobian row `J = ∂C/∂q` and `J̇`. The solver stacks all rows and solves for the multipliers λ in

```
(J W Jᵀ) λ = −J̇ q̇ − J W Q − k_s C − k_d Ċ
```

where `W = M⁻¹` and `Q` are the applied forces. The last two terms are Baumgarte feedback, which pulls the state back onto the constraint surface when integration drifts away from it. The constraint force `Jᵀλ` is added to the force accumulator. The solve runs **once per derivative evaluation**, not once per frame, so midpoint and RK4 re-solve the constraints at every intermediate stage.

`J W Jᵀ` is symmetric positive semi-definite and is solved with **conjugate gradient** (Shewchuk 1994) without forming the matrix. A matrix-vector product is three sparse passes (apply `Jᵀ`, scale by inverse masses, apply `J`), so the cost scales with the number of non-zeros as the cloth adds hundreds of particles. The implicit integrator cannot use a precomputed constraint force, because it solves for the new velocities directly; Marijn's implicit Euler instead eliminates Δv through a Schur complement and solves `J A⁻¹ Jᵀ λ = b` with nested conjugate-gradient solves for the products with `A⁻¹`.

The assignment's two constraints are a circular wire, `C = |x − x_c|² − r²`, and a rod between two particles, which exists in two runtime-switchable forms. The quadratic form `C = |d|² − r²` is polynomial and stays defined when the particles coincide, but its Jacobian rows scale with the rod length, so a scene that mixes short and long rods gives `J W Jᵀ` rows of different magnitude and slows conjugate-gradient convergence. The linear form `C = |d| − r` has unit-length rows but divides by `|d|` (and `|d|³` in `J̇`), so its row is zeroed below a small length threshold. The quadratic form is the default. Pins (fixed-point constraints) use the same interface, which is how the cloth's top row is held.

<div class="feature-grid">
  <div class="feature-media">
    <video width="1196" height="540" poster="{{ '/assets/simulation-cg/wire-constraint-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/simulation-cg/wire-constraint.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Circular-wire scene: a bead held on the wire by the circle constraint and a separate two-particle rod, both pulled with the mouse spring (orange line).</p>
  </div>
  <div class="feature-media">
    <video width="1196" height="540" poster="{{ '/assets/simulation-cg/cloth-flag-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/simulation-cg/cloth-flag.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">A hanging cloth with its top row held by fixed-point constraints (red markers), pulled with the mouse spring and reset several times.</p>
  </div>
</div>

### Cloth

<div class="feature-grid">
  <div class="feature-text">
    <p>The cloth is a mass-spring grid after Provot (1995). Particles sit on a regular grid with spacing s; <strong>structural</strong> springs join horizontal and vertical neighbours (rest length s) and resist stretching, <strong>shear</strong> springs cross both diagonals of each cell (√2·s) and resist in-plane shearing, and <strong>bend</strong> springs join particles two apart (2s) and resist folding. Stiffness and damping are shared by all springs and adjustable while the simulation runs. The sheet is built from the same spring, gravity and constraint objects as every other scene, so it works with all four integrators without special cases.</p>
    <p>Separate scenes enable the spring types one at a time. With structural springs only, the sheet stretches and folds along its lower edge; adding shear springs removes the sideways collapse, but the sheet still sags and narrows; with all three types it keeps its shape. This matches Provot's description. At high stiffness the explicit integrators need small steps, which is measured below.</p>
    <p>Three interactions act on the cloth. <strong>Wind</strong> is a uniform force on every cloth particle; it has a zero Jacobian and so adds nothing to the implicit system. <strong>Wall collision</strong> moves a particle that crossed a wall back onto it and reflects the inward velocity component scaled by a restitution factor. <strong>Cutting</strong> treats a mouse drag as a line segment and changes topology only: every spring the segment crosses is removed (standard segment intersection with a tolerance for near-parallel segments), every face it passes through is deleted so the drawn hole matches the missing springs, and particles left without a face are removed with their springs, except the pinned row. Because a cut only removes elements and never adds particles or re-meshes, it can be repeated without introducing new state for the integrator.</p>
  </div>
  <div class="feature-media">
    <video width="472" height="540" poster="{{ '/assets/simulation-cg/cloth-spring-configurations-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/simulation-cg/cloth-spring-configurations.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">The three spring configurations in sequence (scene names from the scene list): structural only, structural + shear, and structural + shear + bend, the last one pulled with the mouse spring.</p>
  </div>
</div>

### Integrator comparison

<div class="feature-grid">
  <div class="feature-media">
    <img width="640" height="840" loading="lazy" decoding="async" src="{{ "/assets/simulation-cg/diagnostics-tool.png" | relative_url }}" alt="Diagnostics tab of the Particletoys control panel: metric set to total energy, time step 0.005 s, total time 5 s, a log-scale plot in which the Euler curve rises steeply and ends in a cross, and a summary table marking Euler as exploded and midpoint, RK4 and implicit Euler as completing 1000 steps">
    <p class="video-caption">The Diagnostics tab. Here it runs the active scene for 5 s at Δt = 5 ms under each integrator and plots total energy; forward Euler diverges and is marked as exploded, and the table lists final, maximum and mean values and the wall-clock time per integrator.</p>
  </div>
  <div class="feature-text">
    <p>Marijn implemented forward Euler, midpoint, fourth-order Runge-Kutta and implicit Euler. To compare them under identical conditions I built a diagnostics tool, available headless and as a tab in the control panel. It resets a scene, runs it once per integrator with the same time step and the same Baumgarte gains, and samples a chosen metric: total energy, energy drift <code>|E(t) − E₀|</code> with E the kinetic plus gravitational potential energy, the constraint RMS <code>√((1/m) Σ C<sub>i</sub>²)</code>, or the largest |C|. A run counts as stable if it finishes without producing a non-finite value. The results below were exported to CSV and plotted with a script.</p>
    <p>Three experiments were run: a 40 s trajectory of the circular-wire pendulum at Δt = 5 ms, with the engine's global velocity damping switched off; a sweep of 16 step sizes from 0.5 to 50 ms over 3 s of simulated time on a pendulum chain and on the cloth with all three spring types (144 particles, k = 100, m = 0.1); and a timing run of 1,000 steps on that cloth at Δt = 2 ms.</p>
  </div>
</div>

<div class="feature-grid">
  <div class="feature-media">
    <img width="1030" height="787" loading="lazy" decoding="async" src="{{ "/assets/simulation-cg/fig-energy-drift.png" | relative_url }}" alt="Log-scale energy drift over 40 seconds on the circular-wire pendulum for Euler, midpoint, RK4 and implicit Euler">
  </div>
  <div class="feature-text">
    <h3>Energy drift</h3>
    <p>The continuous system conserves energy, so any drift is numerical. Forward Euler gains energy: the drift exceeds 1 J after 1.4 s, 10³ J after 5.7 s, and the state becomes non-finite at 9.45 s. Midpoint drifts slowly, to 0.13 J after 40 s. RK4 stays below 4.1 × 10⁻⁵ J throughout. Implicit Euler is stable but dissipative: it loses energy, reaching a drift of 15.3 J, the largest of the three stable schemes. Stability and energy conservation are therefore separate properties. With global damping on, midpoint and RK4 both lose 16.6 J over the same 40 s and the curves become hard to distinguish, which is why this run disables damping.</p>
  </div>
</div>

<div class="feature-grid reverse">
  <div class="feature-media">
    <img width="1026" height="789" loading="lazy" decoding="async" src="{{ "/assets/simulation-cg/fig-constraint-rms.png" | relative_url }}" alt="Log-scale constraint RMS over 8 seconds on the circular-wire pendulum: RK4 near 1e-7, midpoint near 1e-4, implicit Euler near 1e-2, and Euler rising sharply after about 5 seconds">
  </div>
  <div class="feature-text">
    <h3>Constraint satisfaction</h3>
    <p>On the same scene over 8 s, the median constraint RMS between 1 and 8 s is 2.1 × 10⁻⁷ for RK4, 8.1 × 10⁻⁵ for midpoint and 1.8 × 10⁻² for implicit Euler. Euler stays at the level of implicit Euler until it destabilises: its RMS passes 1 at 5.6 s and reaches 1.3 × 10⁸ at 8 s. All runs share the same Baumgarte gains, so the differences come from the integrators.</p>
  </div>
</div>

<div class="feature-grid">
  <div class="feature-media">
    <img width="1137" height="879" loading="lazy" decoding="async" src="{{ "/assets/simulation-cg/fig-stability.png" | relative_url }}" alt="Bar chart of the maximum stable time step per integrator on the pendulum chain and on the cloth, with a dashed line at the estimated forward-Euler bound of 18 ms">
  </div>
  <div class="feature-text">
    <h3>Largest stable step</h3>
    <p>On the pendulum chain, Euler is stable up to 10 ms and midpoint up to 30 ms; RK4 and implicit Euler are stable at every tested step up to 50 ms. On the cloth the explicit limits fall: midpoint and RK4 are stable at 10 ms and fail at 13 ms, Euler is stable at 16 ms and fails at 20 ms, and implicit Euler is stable at every tested step. The cause of forward Euler tolerating a larger step than the higher-order schemes on the cloth was not isolated; the report attributes it to dissipation, but Euler gains energy on the undamped wire, so that explanation is incomplete.</p>
    <p>As an estimate, a single spring with k = 100 and m = 0.1 gives ω = 31.6 rad/s and the explicit bound Δt ≲ 2/ω ≈ 63 ms (Witkin and Baraff 2001). An interior cloth node is attached to up to twelve springs (four of each type); summing their stiffnesses gives about 1,200, ω ≈ 110 rad/s and 2/ω ≈ 18 ms, which lies between the last stable (16 ms) and first unstable (20 ms) Euler step. The sum ignores the spring directions, so this is an order-of-magnitude check rather than a derivation.</p>
  </div>
</div>

<div class="feature-grid">
  <div class="feature-media">
    <img width="957" height="793" loading="lazy" decoding="async" src="{{ "/assets/simulation-cg/fig-cost.png" | relative_url }}" alt="Per-step wall-clock cost against time step on the cloth for the four integrators, with crosses at diverged runs">
  </div>
  <div class="feature-text">
    <h3>Cost</h3>
    <p>On the 144-particle cloth at Δt = 2 ms (mean of 1,000 steps on one machine), a step costs 0.24 ms with Euler, 0.53 ms with midpoint, 0.81 ms with implicit Euler and 1.05 ms with RK4, close to the 1 : 2 : 4 ratio of derivative evaluations for the explicit schemes. In the sweep the explicit costs are constant while the runs are stable. The implicit cost rises with Δt, from 0.54 ms at 0.5 ms to 1.40 ms at 10 ms and 3.09 ms at 50 ms, because its conjugate-gradient solve needs more iterations as the system becomes stiffer; from about 5 ms it exceeds RK4's 1.0 ms per step.</p>
    <p>Per simulated second at each scheme's largest stable step, the cost is 16 ms for Euler (16 ms steps), 51 ms for midpoint and 102 ms for RK4 (both at 10 ms), and 62 ms for implicit Euler at 50 ms, the largest step tested. The larger step therefore did not make implicit Euler the cheapest scheme on this cloth. Its advantage was that it remained stable at every step tested; the accuracy of the schemes at these steps differs and was not compared. The implicit solver uses unpreconditioned conjugate gradient without warm starting, so part of its cost growth may be implementation rather than method.</p>
  </div>
</div>

In project 2 the group report repeated the comparison on the fluid-cloth drag coupling, which adds a stiff velocity-dependent term: midpoint and RK4 diverged after about twenty steps, explicit Euler stayed bounded but transferred almost no energy from the fluid to the cloth, and implicit Euler, with the drag term on the diagonal of its system matrix, remained stable.

<div class="feature-grid">
  <div class="feature-media">
    <video width="886" height="540" data-autoplay loop muted playsinline controls preload="none" poster="{{ '/assets/simulation-cg/poster-cloth.jpg' | relative_url }}">
      <source src="{{ "/assets/simulation-cg/cloth-drape.mp4" | relative_url }}" type="video/mp4">
    </video>
  </div>
  <div class="feature-media">
    <video width="834" height="540" poster="{{ '/assets/simulation-cg/hair-strands-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/simulation-cg/hair-strands.mp4" | relative_url }}" type="video/mp4">
    </video>
  </div>
</div>
<p class="video-caption">Left: a cloth sheet dropped onto a wedge of two static line segments and pulled across it with the mouse spring. Right: hair strands built from Thijs's angular springs and pinned at the top through the constraint solver; the three groups use the straight, curly and wavy rest-angle presets (180°, 150° and alternating ±150°).</p>

{% include youtube.html id="dJ2sLnkk71s" title="Particle system demo" caption="Project 1 demo video, recorded for the course." %}

---

## Project 2: fluids on the same framework

The fluid solver starts from Jos Stam's implementation in *Real-Time Fluid Dynamics for Games* (2003), which builds on *Stable Fluids* (Stam 1999): semi-Lagrangian advection, diffusion and a Gauss-Seidel pressure projection on a regular grid, here adjustable from 16 to 256 cells per side. A wrapper class holds the density, velocity, temperature and level-set fields, the obstacles and bodies, the mouse and keyboard interaction and the rendering. The project added vorticity confinement (Fedkiw, Stam and Jensen 2001), painted obstacles and grid-aligned shapes, continuous rigid bodies with two-way coupling, a free surface, object and thermal buoyancy, and a drag coupling that lets the project-1 particles and cloth follow the bilinearly sampled flow.

<div class="feature-grid">
  <div class="feature-text">
    <h3>Painted obstacles</h3>
    <p>Solid cells are painted into the grid with the mouse (shift-drag erases) or inserted as a disk or box primitive. The solver clears the velocity inside solid cells, so the pressure projection routes the flow around them. Whenever the obstacle mask changes, it is segmented into separate shapes by a breadth-first flood fill over 4-connected neighbours; two blobs that touch only at a corner stay separate, and each component gets its own bounding box, centre of mass, mass <code>m = ρn</code> and moment of inertia <code>I = ρ Σ r<sub>c</sub>²</code>, so that it can be moved and rotated as a unit.</p>
  </div>
  <div class="feature-media">
    <video width="540" height="540" poster="{{ '/assets/simulation-cg/painted-obstacles-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/simulation-cg/painted-obstacles.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">An obstacle line and a curve painted into a 64 × 64 grid (smoke colour map, build of 4 June 2026). Smoke injected with the mouse afterwards flows along and around the painted cells.</p>
  </div>
</div>

<div class="feature-grid reverse">
  <div class="feature-text">
    <h3>Free surface from a level set</h3>
    <p>Water is tracked as a signed-distance field φ on the fluid grid (φ &lt; 0 in water, φ &gt; 0 in air, surface at φ = 0), after Enright, Marschner and Fedkiw (2002) without their marker particles. A flat surface is initialised exactly as <code>φ = j − j<sub>level</sub></code>. One water step:</p>
    <ol>
      <li>Add gravity to the vertical velocity of every water cell.</li>
      <li>Project the velocity with air cells pinned to p&nbsp;=&nbsp;0, which is the free-surface boundary condition; only water cells are relaxed, and the zero pressure of neighbouring air cells enters through the stencil. This converges more slowly than the closed problem, so the solve uses more Gauss-Seidel iterations than Stam's default and is warm-started from the previous frame's pressure. The hydrostatic profile is seeded when the water level is reset; without it, gravity is not balanced in the first frames and the water visibly sinks.</li>
      <li>Damp water velocities and clamp them to one cell per step.</li>
      <li>Advect φ with the same semi-Lagrangian scheme as the density.</li>
      <li>Reinitialise φ toward |∇φ| = 1 by iterating <code>∂φ/∂τ = sign(φ)(1 − |∇φ|)</code> (Sussman, Smereka and Osher 1994), with a smoothed sign function and Godunov upwind differences so that the zero level set does not move.</li>
      <li>Count the non-solid cells with φ ≤ 0 and shift φ uniformly by <code>γ(w − w<sub>target</sub>)/N</code>, which drives the water volume back toward its target.</li>
    </ol>
    <p>Advection and reinitialisation do not conserve volume, which step 6 corrects. Because only non-solid cells are counted, a submerged body removes its cells from the count, and the correction raises the surface elsewhere by that volume: displacement follows from the same bookkeeping. The water body is drawn as a translucent fill whose opacity ramps over about 1.5 cells around φ = 0, and the surface line is extracted with marching squares, interpolating the zero crossing linearly along each cell edge.</p>
  </div>
  <div class="feature-media">
    <video width="522" height="540" poster="{{ '/assets/simulation-cg/buoyant-box-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/simulation-cg/buoyant-box.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">A disk and a box in the water tank, moved with the mouse. Pushed under, they return to the surface and float; lifting the box out pulls a thin column of water up behind it. In the second half the box is rotated above the floating disk.</p>
  </div>
</div>

<div class="feature-grid">
  <div class="feature-text">
    <h3>Continuous rigid bodies</h3>
    <p>The grid-aligned shapes can only move in whole cells. The continuous bodies have a floating-point centre, orientation and velocity and are integrated with Newton-Euler dynamics. Two primitives are supported, in grid-cell units so they share the gravity, buoyancy and coupling coefficients of the fluid: a disk with <code>m = ρπr²</code>, <code>I = ½mr²</code>, and a box with half-extents (h<sub>x</sub>, h<sub>y</sub>), <code>m = 4ρh<sub>x</sub>h<sub>y</sub></code>, <code>I = ⅓m(h<sub>x</sub>² + h<sub>y</sub>²)</code>. Forces and torques from gravity, buoyancy and drag are integrated semi-implicitly with linear and angular damping factors, and the speed is clamped so that a force spike cannot carry a body through a wall in one update.</p>
    <p><strong>Coupling.</strong> Each step every body is rasterised into the solid mask, so the next pressure solve sends the flow around its current pose. In the other direction, each fluid cell just outside the body applies a drag force <code>F = k·v<sub>rel</sub></code> with <code>v<sub>rel</sub> = u<sub>fluid</sub> − (v + ω × r)</code> at its lever arm r, which gives both a net force and a torque, so a current on one side of a body also turns it. The body in turn moves those cells' velocities toward its own surface velocity.</p>
    <p><strong>Collisions.</strong> A broad phase compares centre distances with the sum of bounding radii. The narrow phase is shape-specific: centre distance for disk-disk, the closest point on the box for disk-box, and the separating-axis test followed by reference/incident-face clipping (Ericson 2005) for box-box, which gives a two-point manifold so a box resting on an edge stays flat. Contacts are resolved by an iterated sequential-impulse solver (Catto 2006) that separates the bodies along the normal and then applies normal impulses; restitution is applied only in the first sweep so that repeated sweeps settle a stack instead of adding energy, and the iterations propagate support up through a pile. Bodies can be dragged with a damped spring <code>F = k<sub>s</sub>m(x<sub>target</sub> − x) − k<sub>d</sub>m·v</code>, which the collision response can balance, so a dragged body rests against a wall instead of passing through it.</p>
  </div>
  <div class="feature-media">
    <video width="522" height="540" poster="{{ '/assets/simulation-cg/rigid-bodies-stack-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/simulation-cg/rigid-bodies-stack.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Continuous disks and boxes added one after another (no water in this scene). The disks settle into a row and the boxes stack on top of them through the sequential-impulse solver; the line in each disk shows its rotation.</p>
  </div>
</div>

<div class="feature-grid reverse">
  <div class="feature-text">
    <h3>Buoyancy and temperature</h3>
    <p><strong>Object buoyancy</strong> applies to both kinds of bodies. The submerged cells (φ ≤ 0) of a body are counted, and the vertical force is <code>F<sub>y</sub> = −g·m + β·n<sub>submerged</sub></code>. A body settles where the two balance, at a submerged fraction <code>g·m/(β·n<sub>total</sub>)</code> that is proportional to its density; a body denser than this balance allows sinks.</p>
    <p>The <strong>temperature field</strong> is stored relative to ambient, advected and diffused with the same machinery as the smoke density, and multiplied by a fade factor each step so that injected heat relaxes back toward ambient. Heat is added with the mouse or by a continuous emitter. Following Fedkiw, Stam and Jensen (2001), each cell receives a vertical force <code>f<sub>y</sub> = βT − αρ</code> in air, so hot cells rise and dense smoke sinks, and <code>f<sub>y</sub> = β<sub>w</sub>T</code> with <code>β<sub>w</sub> ≪ β</code> in water, so heated water drifts upward instead of rising at the rate of hot air.</p>
  </div>
  <div class="feature-media">
    <video width="558" height="540" poster="{{ '/assets/simulation-cg/fire-swirl-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/simulation-cg/fire-swirl.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Heat painted with the mouse under the fire colour map. The temperature field is advected, diffused and faded toward ambient, so the strokes blur and fade within a few seconds.</p>
  </div>
</div>

<div class="feature-grid">
  <div class="feature-media">
    <video width="564" height="540" poster="{{ '/assets/simulation-cg/cloth-in-fire-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/simulation-cg/cloth-in-fire.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">The project-1 cloth, pinned along its top row, inside the fluid domain. Heat injected below it with the mouse drives a plume that pushes the cloth through the particle-fluid drag.</p>
  </div>
  <div class="feature-text">
    <h3>Particle-fluid coupling</h3>
    <p>Every particle of the project-1 system receives a drag force <code>F = k(u<sub>p</sub> − v<sub>p</sub>)</code> toward the fluid velocity <code>u<sub>p</sub></code>, sampled bilinearly at its position. The part that depends on the particle velocity, <code>−k·v<sub>p</sub></code>, is added to the diagonal of the implicit Euler system, which allows stronger coupling than the explicit schemes tolerate (see the comparison above).</p>
  </div>
</div>

{% include youtube.html id="91HsbEEwugM" title="Fluid simulation demo" caption="Project 2 demo video, recorded for the course." %}

---

## Future work

- **Integrator study.** The stability criterion is the absence of non-finite values. Measuring each scheme's accuracy at its largest stable step, and repeating the timings on more than one machine, would complete the comparison. A preconditioned, warm-started implicit solver, and isolating the cause of Euler's larger stable step on the cloth, are the remaining open points.
- **Grid-aligned shapes.** Shapes move in whole cells. Re-segmenting the mask after an unrelated shape is added can merge two touching shapes into one, which was found too late to fix within the course; keeping shape identity across re-segmentation would prevent it.
- **Rigid bodies.** The broad phase is a brute-force O(n²) pass over all pairs, adequate for the few bodies in the scenes. A dedicated broad phase and a GJK-style narrow phase for general convex shapes were planned and would extend the disks and boxes; reducing the resting-contact jitter in stacks is the other open item.
- **Free surface.** The level set without marker particles loses volume, which is corrected by a uniform shift of φ. Marker particles would conserve it instead. A fully converged free-surface pressure solve would make the per-step damping of water cells unnecessary, and fractional cell coverage would make buoyancy vary smoothly instead of in steps of one cell.
- **Interface.** The report notes that the control panel became cluttered as features were added; grouping the controls per scene would address this.
