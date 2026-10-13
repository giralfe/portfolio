---
layout: project
title: "Flatland: 2D Multibody Simulation Engine"
period: "2026 - Present"
year: 2026
sort_date: "2026-09"
tags: [Physics, Research, C++, Python, Solo]
image: /assets/flatland/log-gravity-card.jpg
role: MSc thesis, sole developer of the engine
platform: C++17 core · Python host · Linux
priority: 1
featured: true
summary: "MSc thesis at TU/e, co-supervised by Claude Lacoursière (Umeå University / Algoryx): an Entity Component System for 2D constrained multibody simulation. Bodies of any degree-of-freedom width write into one shared solver view advanced by the Spook stepper, and joints, contacts, elastic elements and circuit nodes are all compliant constraint rows. C++17 core, Python host."
---

MSc thesis at Eindhoven University of Technology (Department of Mathematics and Computer Science, Visualization cluster), supervised by **dr. Andrei Jalba** (TU/e) and **dr. Claude Lacoursière** (Umeå University / Algoryx). Thesis title: *An Entity Component System for Extensible 2D Constrained Multibody Simulation*. The preparation-phase report was completed in September 2026; the graduation phase is in progress and the thesis draft is dated October 2026. The thesis redesigns Flatland, an unreleased 2D simulation library by Lacoursière, Herrmann and Breuling (2024 to 2026) that came out of a journal club on constrained multibody dynamics. I am the sole developer of the redesigned engine.

The engine is a **C++17 core exposed to Python as an extension module** (pybind11, Eigen, doctest, CMake, with optional SuiteSparse CHOLMOD and Intel MKL PARDISO factorisations). Assembly and the solve, about 90% of a step by profiling, run in C++. Scenes, the step pipeline, the interactive viewer and the plots are Python, so a new experiment is a script change rather than a rebuild.

<div class="video-showcase">
  <img width="2925" height="1260" loading="lazy" decoding="async" src="{{ "/assets/flatland/engine-demo.png" | relative_url }}" alt="Eight-panel figure produced by the engine: pendulum path, constraint violation, energy over 20,000 steps, Jacobian sparsity, a six-box stack, 260 settled disks, a per-stage timing breakdown, and headline numbers for a 250-disk step">
  <p class="video-caption">Output of <code>python -m flatland.demo</code> against the compiled engine. A pinned pendulum keeps its distance constraint within 1.6×10⁻⁵ m over 4,000 steps; total energy oscillates within 0.25% of its mean over 20,000 steps without secular drift; six boxes rest on 12 contacts; 260 disks settle with 461 contacts. The timing panels are from the September 2026 run (0.74 ms for a 250-disk step with 500 DOF and 868 constraint rows, 93% of it in the solve). Re-runs on 12 October 2026 reproduce the other panels with the same values and put the solve at 90 to 92% of the step in the demo and benchmark scenes.</p>
</div>

---

## Problem statement

The inherited library supported one kind of body: a planar rigid body with three degrees of freedom `(x, y, θ)`. That assumption was fixed at three layers: the state container, the constraint assembler (a constant stride of three) and the solver, which addressed those containers directly. A kinematic chain in joint angles (n DOF) or a deformable body of k particles (2k DOF, with k possibly changing during a run) therefore needed coordinated changes to all three layers, and an error in any of them would show up as a wrong simulation rather than as a diagnosable failure.

The thesis restructures the engine around an **Entity Component System** (ECS) so that bodies of any width write into one solver-facing view

```
V = ( M, v, q, f ;  G, g, Σ, Υ, l, u ;  λ )
      bodies        constraints         solver
```

Each body declares its own `(offset, width)` slice of the state, each constraint writes rows, and each solver reads `V` and nothing else. A 2-DOF particle, a 3-DOF rigid body, a 1-DOF electrical charge and an n-DOF chain assemble into one Jacobian `G` with no global stride.

<div class="feature-grid">
  <div class="feature-text">
    <h3>Objectives and success conditions</h3>
    <p>The preparation report states four objectives, each with a verifiable condition.</p>
    <p><strong>O1.</strong> One shared view that every body type fills in through a narrow contributor interface, with assembly still linear in the non-zeros of <code>G</code>.</p>
    <p><strong>O2.</strong> A component layout that keeps the structure-of-arrays behaviour: at most 15% median per-step overhead against the original engine on its own test scenes.</p>
    <p><strong>O3.</strong> Lacoursière's 2D elasticity model brought in as compliant constraints between particles, advanced by the unmodified solver, with the effect of its two regularisation parameters on conditioning measured and explained.</p>
    <p><strong>O4.</strong> A per-step cost comparison against at least one external planar engine, and an argument locating Flatland on two axes: solver indifference and a variational foundation.</p>
    <p>The report scoped electrical and hydraulic networks out. The charge coordinate and the circuit model described below go beyond that scope.</p>
  </div>
  <div class="feature-media">
    <img width="1515" height="530" loading="lazy" decoding="async" src="{{ "/assets/flatland/proto-heterogeneous.png" | relative_url }}" alt="Three snapshots of the preparation-phase prototype: a point-particle ring, a 3-DOF rigid box, a joint chain in minimal coordinates and a mass-spring patch advancing together in one registry">
    <p class="video-caption">Preparation-phase prototype: particles (2 DOF), a rigid body (3), a triple pendulum in joint coordinates (n) and a mass-spring patch (2k) in one registry and one processor pipeline. No system tests a body's type; each selects entities by component signature.</p>
  </div>
</div>

---

## Model

The formulation follows the *Ghosts and Machines* framework of Lacoursière (2007). A system has coordinates `q`, velocities `v`, a mass matrix `M`, applied forces `f` and constraints `g(q) = 0` with Jacobian `G = ∂g/∂q`. Each constraint row has a multiplier `λ`, the impulse it applies; the bodies are the machines and the multipliers the ghosts. Every row `i` has a compliance `εᵢ ≥ 0`, so `gᵢ = 0` becomes `gᵢ + εᵢλᵢ = 0`: rigid at `εᵢ = 0` and a spring of stiffness `1/εᵢ` otherwise. A joint, a contact, a spring, an elastic element and an electrical node are therefore the same kind of object, a row, that differs only in `gᵢ`, its gradient, its compliance, a dimensionless damping `γᵢ` and its bounds.

The **Spook** stepper advances one step of size `h` by solving

```
[ M  -Gᵀ ] [ v_k+1 ]   [ M v_k + h f ]
[ G   Σ  ] [   λ   ] = [      Υ      ] ,     q_k+1 = q_k + h v_k+1
```

with `Σᵢᵢ = 4εᵢ / ((1 + 4γᵢ) h²)` and `Υ` feeding back the current violation `gᵢ`. The stabilisation gain follows from the discrete variational derivation rather than from hand-tuned Baumgarte constants. A contact row is bounded, `λₙ ≥ 0`, and a friction row satisfies `|λₜ| ≤ μλₙ`, which makes the step a boxed linear complementarity problem (LCP).

### Bodies as component patterns

The state of all bodies lives in four global arrays, `q`, `v`, `f` and `diag(M)`, one entry per degree of freedom (the structure-of-arrays layout of data-oriented design, Fabian 2018). One component, the slice `(oₑ, wₑ)`, connects an entity to the `wₑ` consecutive entries starting at `oₑ`. A particle owns two entries, a rigid body three, and an electrical charge one, whose velocity is the current and whose inertia is the inductance. Offsets are fixed by a prefix sum over the widths once all bodies are registered, and constraints refer to entities, never to offsets.

A kind of body is a pattern of components rather than a type. A mesh vertex is a slice and a particle mass with no collision shape, so collision detection never visits it and it touches other bodies only through the area contact of its mesh. Systems are queries over components: gravity selects entities with a slice and a mass, and a charge, which has no mass component, is never visited without any code saying so.

### Assembly

A constraint `c` with `n_c` rows coupling the bodies `E_c` returns its violations, one block `G_c,e` of size `n_c × w_e` per body, and per-row compliance, damping and bounds. Rows are laid out by a prefix sum over the `n_c`, and

```
G[ r_c : r_c + n_c ,  o_e : o_e + w_e ] += G_c,e     for every c and every e in E_c
```

The assembler reads offsets, widths and row counts only; it never asks what a body or a constraint is.

---

## Solving the step

<div class="feature-grid">
  <div class="feature-text">
    <h3>Direct solve with an active set</h3>
    <p>With <code>η = −λ</code> the system above is symmetric quasi-definite and is factorised by <strong>LDLᵀ</strong> without pivoting, with the fill-reducing order kept between steps while the pattern holds. Replacing the earlier LU factorisation with LDLᵀ took a steel-cantilever step from 0.90 to 0.18 ms with unchanged results. Bounded rows are handled by an active set: a row that leaves its bounds is clamped and a clamped row that would pull is freed, keeping its place in the matrix so the sparsity pattern survives, until nothing changes. An outer loop updates the friction bounds <code>μλₙ</code> from the new normal multipliers. In dense piles the active set can cycle; that step falls back to the reduced system <code>S λ = Υ − G (v_k + h M⁻¹ f)</code>, <code>S = G M⁻¹ Gᵀ + Σ</code>, solved by projected Gauss-Seidel with each friction row swept directly after its normal rows, as the 2D report asks.</p>
    <p>Projected Jacobi and a matrix-free Gauss-Seidel on the unformed <code>S</code> sit behind the same interface. Solvers can also be written in Python: <code>flatland/solvers.py</code> contains a Schur-complement solver, a saddle-point solver and a projected Gauss-Seidel solver that read only <code>V</code>. Over 1,000 steps the two direct ones reproduce the compiled trajectory to between 9×10⁻¹⁶ and 1.4×10⁻¹⁴ (measured on the hanging-chain and ten-link-pendulum scenes), and the Python Gauss-Seidel solver agrees to below 10⁻⁸ once converged. New constraints can be written in Python in the same way and are assembled like built-in ones.</p>
  </div>
  <div class="feature-text">
    <h3>Splitting rows by stiffness</h3>
    <p>An elastic mesh contributes thousands of soft rows and a contact a handful of bounded ones, so the full matrix is large and sparse. The split solve classifies a row as <em>soft</em> when <code>Σᵢᵢ</code> is not small against its mobility <code>GᵢM⁻¹Gᵢᵀ</code> and as <em>hard</em> otherwise. Unbounded soft rows (elements, springs) are eliminated into the body block, <code>M̄ = M + G_sᵀ Σ_s⁻¹ G_s</code>, which is the mesh stiffness matrix; hard rows (joints) stay dual beside it; and the bounded soft rows (contacts) are condensed onto a small dense Schur complement <code>S = C A⁻¹ Cᵀ + Σ_c</code>, on which the active set and the friction loop run. <code>A</code> is factorised once per step, and again only when a hard bounded row changes state.</p>
    <p>A dual row whose pivot collapses (<code>|D_k| &lt; 10⁻⁶ Σⱼ A_kj² / A_jj</code>) is a rigid row that repeats others and is held only by its <code>Σ</code>; it is moved to the end of the elimination order so the factorisation stays backward stable. The rows that contacts touch are also ordered last, so the block of <code>A⁻¹</code> needed for <code>S</code> follows from the trailing block of the factor with one triangular solve. On a 256×32 slab under a cylinder this took the condensation from 11.3 to 0.06 ms and the step from 35.9 to 26.9 ms; PARDISO, which factorises in parallel and returns the trailing Schur complement itself, brought the step to 18.6 ms on four threads. Reusing the previous step's factor with iterative refinement did not pay: it needed about seven refinements per solve, and on these meshes a solve costs a tenth of a factorisation.</p>
  </div>
</div>

---

## Contact through overlap

The engine has two kinds of contact. **Point contacts** are found every step for bodies with a collision shape: a sweep-and-prune broadphase over bounding boxes, circle tests, and the separating-axis test with clipping for convex polygons, giving one or two points per pair, each with a normal and a friction row. **Area contacts** follow Lacoursière's 2D report (2026), which measures penetration by the overlap area `A` of two shapes instead of a distance. The area is defined for any pair of shapes, is zero while they are apart and grows smoothly as they press together, so no contact point or normal has to be chosen. The energy `U = (K/2) A²` is a compliant row with `g = −A`, `G = −∂A/∂q` and `ε = 1/K`.

<div class="feature-grid reverse">
  <div class="feature-text">
    <h3>Overlap of two polygons with an exact gradient</h3>
    <p>For two convex polygons the overlap is computed by Sutherland-Hodgman clipping (Sutherland and Hodgman, 1974). Each vertex of the result is a corner of one polygon or a crossing of two edges, <code>x = p + t (q − p)</code>, and a crossing moves with all four end points. The clip carries this as a short list of Jacobians against the original corners, and the area and its exact gradient follow from the shoelace formula. Summed over a body, the gradient is the chord between the two crossings turned a quarter, so the overlap supplies a contact normal and a contact length without either being searched for.</p>
    <p>A deformed mesh is not convex, but its triangles are. A contact side is therefore a set of counter-clockwise triangles (a mesh, or a rigid polygon fanned into triangles), and the overlap is the sum of the clipped overlaps of all triangle pairs. Interior edges are traversed in opposite directions by the two triangles they bound, so their terms cancel and only outline vertices and outline crossings are pushed.</p>
  </div>
  <div class="feature-media">
    <img width="1600" height="860" loading="lazy" decoding="async" src="{{ "/assets/flatland/overlap-contact.png" | relative_url }}" alt="Three-panel figure: two overlapping polygons with their Sutherland-Hodgman overlap and per-vertex gradient arrows, a bar chart comparing the analytic area gradient with central differences for six degrees of freedom, and time series of overlap area and contact force for a box dropped on a slab">
    <p class="video-caption">Output of <code>python -m flatland.overlap_figure</code>. Left: two rigid polygons, their overlap (area 0.0761 m²) and the vertex kinds. Centre: the analytic <code>∂A/∂q</code> of the assembled row against central differences of the area, maximum difference 2.4×10⁻¹¹. Right: a box dropped on a slab through this row alone hits at 3.13 m/s, rebounds at 0.09 m/s, and rests 0.3 µm into the slab carrying 19.62 N, its weight.</p>
  </div>
</div>

<div class="feature-grid">
  <div class="feature-text">
    <h3>Elastic foundation and adaptive refinement</h3>
    <p>A single area row would press every outline vertex with the same pressure. Following the 2D report, the stiffness instead comes from an elastic foundation (Johnson, 1985), in which a depth <code>δ</code> is resisted by the pressure <code>Kδ</code>. The overlap is cut into strips across the contact, each its own row; a strip of width <code>w</code> and overlap <code>A</code> has mean depth <code>A/w</code>, energy <code>(K/2w) A²</code> and compliance <code>ε = w/K</code>. The pressure can then vary along the contact, and the stiffness depends on the contact length and <code>K</code> rather than on the mesh: a block of density <code>ρ</code> and height <code>H</code> rests at <code>δ = ρgH/K</code> however finely it is meshed. Two details are specific to the engine: the violation seen by the stabilisation is scaled down for deep overlaps so the push-out speed is capped without changing the direction <code>G</code>, and one Coulomb friction row per contact is bounded by <code>μ</code> times the sum of the strips' normal multipliers.</p>
    <p>The mesh also refines itself by newest-vertex bisection where the broadphase finds it close to the other side, and merges back where it no longer is. Each boundary node then gets one strip, the overlap of its tributary cell (the dual-mortar weighted gap of finite-element contact). The study in the figure presses a rigid cylinder (R = 0.25 m, load 196 N per unit length) into an elastic half-plane (E = 1 MPa, ν = 0.3, plane strain). With a Winkler foundation the result converges to the foundation's answer, a material that is not there. With hard strips only the mesh deforms, and the peak pressure on the finest mesh is 16.0 kN/m against Hertz's 16.6 kN/m, 3% low, with a contact half-width of 8.2 mm against 7.5 mm.</p>
  </div>
  <div class="feature-media">
    <img width="1440" height="544" loading="lazy" decoding="async" src="{{ "/assets/flatland/hertz-study.png" | relative_url }}" alt="Two plots: settled contact pressure profiles at refinement level 14 for two foundation stiffnesses, hard strips and a stiffness that scales with strip width, against the Hertz profile; and profile error against Hertz as a function of node count">
    <p class="video-caption">Output of <code>python -m flatland.hertz_study</code>. Left: settled pressure at the finest refinement level for a Winkler foundation with K = 10⁶ and 10⁸, hard strips, and a stiffness <code>Kᵢ = 10 E*/wᵢ</code> that grows as the strips shrink, against Hertz (dashed). Right: the L2 error of each strip's mean pressure against Hertz's, as the mesh refines.</p>
  </div>
</div>

---

## Elastic triangle element (objective O3)

The element is the hyperelastic triangle of Lacoursière's 2D report, written as two compliant rows on three particles whose sum of squares is the deformation energy: a shear row `g₁ = √(2ψ(r)) r` with compliance `1/A₀`, where `r = ½ log(λ₊/λ₋)` is the logarithmic shear stretch, and a volume row `g₂ = det F − 1` with compliance `1/(c_vol A₀)`. Meshes are built from these rows and particle entities; the assembler, the solver and the systems were not changed to admit them, which is the O1 claim in practice. The unit tests check the Jacobian against finite differences, rigid-motion invariance, the small-strain moduli, and conservation of linear and angular momentum on a free mesh. A damped cantilever settles to within 5 µm of the minimum of its discrete energy, computed independently of the engine with SciPy's BFGS.

Engineering benchmarks with real material values, per metre of thickness (from the 28 September 2026 supervision notes):

| Case | Compared with | Error |
|---|---|---|
| Steel patch test | exact solution of the model | 2×10⁻⁷ |
| Rubber strip, stretch up to 4 | exact solution of the model | 3×10⁻⁹ |
| Rubber strip, stretch up to 4 | Ogden (1972) | 3×10⁻³ |
| Steel cantilever | Timoshenko beam | 68%, 35%, 12% (mesh halved each time) |
| Cook's membrane | literature value | 69%, 51%, 28% (mesh halved each time) |

The element solves its own equations to round-off. The bending and nearly incompressible cases converge under refinement but start far off, which is the usual bending and volumetric locking of linear triangles. The linearised step also drops the term `(g/ε) ∇²g`, which for `g₁` stays of order one even at rest because `r` is a norm. The two-row element is therefore accurate only for `h < a / c_shear`, with `a` the element size: a few milliseconds for rubber, about 30 µs for steel with 10 cm elements. A variant now under test writes the shear row as its two components, which carry the same energy but are smooth through the rest state; with it the steel patch settles to its exact answer at a 4 ms step on elements of 0.5 m and 0.125 m, a step 25 and 100 times their limit `a / c_shear`.

<div class="technical-block">
  <h3>Symbolic verification of the elasticity derivation</h3>
  <p><code>python -m verification.symverify</code> re-derives every coordinate gradient and scalar identity in the elasticity derivation in exact arithmetic (12 gradients and 8 identities) by differentiating the composed scalars directly, so the ground truth shares no algebraic step with the printed closed forms, and exits non-zero on any disagreement. It was run before the element was implemented. It located a scaling inconsistency in the normalised deviatoric factor, a factor of one half dropped in one line of a gradient, and a squared term duplicated between the energy and its sum-of-squares form, which would have made the volumetric penalty quartic instead of quadratic. Three further items raised in June, each the same missing factor of two, were closed by September. All were corrected in the source document and re-verified to exact zero. The check runs in the test suite, so an edit to the document that breaks an identity fails the run; the implemented gradients are checked separately against finite differences.</p>
</div>

---

## Circuits in the same step

A row needs coordinates, not a physical domain. Following the circuit section of the 2D report, a circuit branch is a scalar charge coordinate: its velocity is the current and its inductance its inertia. A node is a row over the branches that meet at it, `g = Σ_out qⱼ − Σ_in qⱼ`, with its capacitance to ground as compliance, so its multiplier divided by `h` is the node potential; the rows are Kirchhoff's current law and `Gᵀ` is his voltage law. A resistor has no inertia; its dissipation is taken implicitly as `Rh` on the diagonal, so a massless branch is as well posed as a heavy one. On an RC circuit with source voltage `U` at `h = τ/1000`, the capacitor voltage deviates from the exact charging curve by at most 2.5×10⁻⁴ `U`, the current by at most 10⁻³ `U/R`, and the energy balance (supplied = stored + dissipated) closes to a relative 2.4×10⁻⁴; all three errors are first order in `h`. A test also runs the same circuit in ngspice and requires the capacitor voltages to agree within 0.5% of the source over two periods of the square wave.

A DC motor couples a charge coordinate to driven wheels. In charge coordinates the motor is a gyrator, a skew coupling of current and speed that no symmetric row produces, so the engine at present applies it as a force stage between steps. That coupling is explicit, and a stiff, lightly damped motor runs away; the thesis draft writes the motor instead as one holonomic row `φ − Kθ = 0` in node-flux coordinates, whose multiplier is both the current and, through `Gᵀ`, the torque.

---

## Verification

One pytest run builds the engine and runs every check: the C++ doctest suite (each `TEST_CASE` becomes a pytest item), the engine through its Python host, the original reference implementation's tests, the symbolic gate, the figure scripts, and a headless pass of the viewer over every scene. It writes an HTML report with each result, its docstring and the figures the physics tests draw (energy, constraint drift, ring-down against its analytic envelope). A guard fails the run if the compiled module or the doctest binary is older than the C++ sources. CI on GitHub builds the engine and runs the same suite. On 12 October 2026 the suite had 294 items (63 of them C++ test cases), and all passed in an out-of-tree build of the current working tree in about three minutes.

---

## Preparation phase: prototype and layout cost

<div class="feature-grid reverse">
  <div class="feature-text">
    <h3>Architecture prototype</h3>
    <p>Before the C++ core existed, a pure-Python ECS prototype on the esper library tested whether an ECS can express a constrained physics step and whether bodies of different width can share one registry. It tested the architecture, not the solver: its collisions are direct impulses with a positional projection, and its deformable body is a mass-spring sheet, deliberately cruder than the triangle element above. The same mass-spring body was built in two layouts, as an aggregate of particle and spring entities (A) and as one entity holding arrays (B). A marker vertex follows the same path under both to 2.9×10⁻¹⁶, so the layout is a data-layout choice and not a physics choice.</p>
  </div>
  <div class="feature-media">
    <img width="1410" height="480" loading="lazy" decoding="async" src="{{ "/assets/flatland/proto-deformable-net.png" | relative_url }}" alt="Preparation-phase prototype: a pinned mass-spring grid modelled as particle entities plus damped-spring entities, shown at rest, mid-fall and settled">
    <img width="1500" height="495" loading="lazy" decoding="async" src="{{ "/assets/flatland/proto-decompositions.png" | relative_url }}" alt="The same mass-spring body built two ways, as an aggregate of entities and as one entity with arrays, with a marker-vertex path plot showing the trajectories coincide to 2.9e-16" style="margin-top:1rem">
    <p class="video-caption">The prototype's mass-spring sheet under layout A, and the same body in layouts A and B with the marker-vertex paths overlaid.</p>
  </div>
</div>

<div class="feature-grid">
  <div class="feature-text">
    <h3>What the layout costs</h3>
    <p>Three ECS layouts of the same mass-spring body were timed up to tens of thousands of vertices, with a fully packed array as the ceiling. All four scale close to linearly (fitted slopes 0.99 to 1.12), so they differ by a constant factor. Under a 10 ms (100 Hz) step the aggregate layout handles about 280 vertices, a hybrid that keeps the entities but gathers their state into arrays for one vectorised kernel about 5,500, and the packed array about 13,700. At 1,600 vertices the two per-element layouts spend 7 to 10 µs per element in a Python dispatch loop, while the hybrid's kernel spends 0.14 µs per element. The penalty therefore attaches to per-element dispatch, not to the component model, which is the argument objective O2 rests on. The magnitude of the gap is specific to an interpreted loop calling a compiled kernel and to the cheapest possible element.</p>
    <p>In the constrained step the cost sits in the solve: about 90% of a step with several hundred contacts on the compiled engine, and 86 to 90% in the preparation-phase measurements on an instrumented prototype of the pipeline (350 and 1,512 contacts), where collision detection took 4.5 to 8.3% and assembly 4.5 to 5.1%. By Amdahl's bound, parallelising everything except the solve can improve such a step by at most 11 to 16%. In the same measurements, entering a parallel region with newly created threads cost about 190 µs regardless of the work inside it, so threading the narrow phase ran at 0.75 times the sequential speed at both scene sizes.</p>
  </div>
  <div class="feature-media">
    <img width="1035" height="645" loading="lazy" decoding="async" src="{{ "/assets/flatland/proto-scaling.png" | relative_url }}" alt="Log-log plot of per-step time against vertex count for the aggregate, monolith and hybrid ECS layouts and a packed-array ceiling, with 60 Hz and 100 Hz budget lines">
    <img width="1050" height="450" loading="lazy" decoding="async" src="{{ "/assets/flatland/proto-breakdown.png" | relative_url }}" alt="Bar chart of time per step for the aggregate, monolith and hybrid layouts at 1,600 vertices: 60 ms, 45 ms and 2.6 ms, with the hybrid split into gather, kernel, integrate and scatter phases" style="margin-top:1rem">
    <p class="video-caption">Per-step cost against vertex count for the four strategies, and the time of one step at 1,600 vertices (6,162 elements): 60 ms for the aggregate, 45 ms for the monolith and 2.6 ms for the hybrid.</p>
  </div>
</div>

<div class="video-showcase">
  <div class="video-container">
    <video width="806" height="540" data-autoplay loop muted playsinline controls preload="none" poster="{{ '/assets/flatland/poster-log-gravity.jpg' | relative_url }}">
      <source src="{{ "/assets/flatland/proto-log-gravity.mp4" | relative_url }}" type="video/mp4">
    </video>
  </div>
  <p class="video-caption">The pure-Python ECS prototype: disks under a 2D logarithmic gravity potential with impulse collisions, drawn by the original engine's viewer. The header shows the simulated time and the contact count; each disk leaves a trail.</p>
</div>

---

## Future work

- **Remaining objectives.** The O2 overhead measurement against the original engine, the O3 conditioning study of the two regularisation parameters and the O4 comparison against an external planar engine are the next steps of the graduation phase.
- **Element accuracy.** Linear triangles lock: the steel cantilever is 12% off Timoshenko on the finest mesh in the table above. The smooth-shear variant, which removes the two-row element's step limit `h < a / c_shear`, is under test. On a lone triangle the two-row Jacobian has rank 2 for three internal degrees of freedom, and a settled node held by a single element chatters at the micrometre level; both are covered by tests and documented in the element's header.
- **Constraints and solvers.** A weld constraint (a welded pair is currently held by two revolute joints at distinct anchors) and a conjugate-residual solver are still to be added.
- **Circuits.** Inductors, the series RLC circuit and current sources are implemented and kept as a separate patch, so that the first circuit change stays small for review. The DC motor is an explicit force stage.

All timings on this page come from one 16-thread machine and are not portable; the ordering of the effects is the claim, not the constants.

## References

- C. Lacoursière, *Ghosts and Machines: Regularized Variational Methods for Interactive Simulations of Multibodies with Dry Frictional Contacts*, PhD thesis, Umeå University, 2007.
- C. Lacoursière, "Rigid bodies and particles in 2D", Algoryx Simulation technical report 109, 2026 (unpublished).
- C. Lacoursière, M. Herrmann and J. Breuling, *Flatland: a flexible 2D physics simulation library*, software, 2024 to 2026 (not publicly released).
- R. Fabian, *Data-Oriented Design*, 2018.
- I. E. Sutherland and G. W. Hodgman, "Reentrant polygon clipping", *Communications of the ACM* 17(1), 1974.
- K. L. Johnson, *Contact Mechanics*, Cambridge University Press, 1985.
- R. W. Ogden, "Large deformation isotropic elasticity", *Proceedings of the Royal Society A* 326, 1972.

The code is not public because it builds on the unreleased Flatland library. It can be shown on request.
