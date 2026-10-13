---
layout: project
title: Whitted Ray Tracer
period: "2020 - 2021"
year: 2021
sort_date: "2021-01"
tags: [Graphics, C++, Solo]
image: /assets/cpp-raytracer/glass-refraction.png
role: Solo Developer
platform: Windows · C++ · SFML window
priority: 14
summary: "A CPU Whitted-style ray tracer and its own maths library, built solo in first-year block B at BUas. Ray-sphere and ray-plane intersections derived by hand and unit-tested against GeoGebra, recursive reflection and refraction, Möller-Trumbore triangles for OBJ meshes, supersampling and OpenMP. It renders 512×512 at 60 fps with anti-aliasing off; no acceleration structure was implemented."
---

Block B of my first year at BUas (winter 2020 to 2021) was a solo project: a **Whitted-style ray tracer** in C++ without a rendering API, together with a maths library and its unit tests. The renderer runs on the CPU and writes into a framebuffer displayed in an SFML window. The block had eight working weeks with a two-week Christmas break between weeks four and five. Each Monday a lecture by Jacco Bikker introduced the next technique, and I planned the week's features from it. It was my first 3D application.

The brief set a performance floor of 512&times;512 pixels at 15 fps. My own goal was 60 fps at that resolution, which the final build reaches with anti-aliasing disabled.

<div class="video-showcase">
  <img width="512" height="512" loading="lazy" decoding="async" src="{{ "/assets/cpp-raytracer/glass-refraction.png" | relative_url }}" alt="Close-up of a transparent sphere refracting the checker plane and a blue sphere behind it">
  <p class="video-caption">Week five: recursive refraction through a transparent sphere. The blue sphere behind it and the checker floor appear refracted, with the floor inverted in the upper half of the sphere.</p>
</div>

---

## Architecture

**Maths library.** `Vector3` was written on the model of the template's `Vector2` and provides addition, subtraction and scaling through operator overloads, normalisation, length and squared length, and dot and cross products. It has three constructors: a default that sets all components to zero, one taking x, y and z, and an `explicit` single-value constructor that cannot be invoked by implicit conversion. The library is its own Visual Studio project compiled to `Maths.lib` and statically linked into the ray tracer.

**Rays and primitives.** A ray stores an origin and a normalised direction (the constructor assumes the direction is already normalised) and evaluates `point_at_t(t)`; it does not store t. The coordinate system follows OpenGL's convention. All intersectable objects derive from an abstract `BaseObject` with protected colour, material and position, and pure virtual methods for colour, material, intersection and the surface normal. The renderer iterates over base-class pointers and does not inspect the concrete type.

**Materials and scenes.** A material is three numbers: reflectivity, transparency and refractive index. A scene is a list of constructor calls such as `new Sphere(centre, radius, Colour(...), Material(0, 1, 1.5f))`; the transparent spheres in the scene set-up shown in the log use refractive indices of 1.5 and 1.01.

**Dynamic array.** Scene objects and mesh vertices are stored in a templated `DynArray` of my own, which allocates with `malloc` and grows through `resize()` when `addValue` finds it full. It replaced a static array in week six. Abhishek suggested linked lists so that scenes could be swapped; I chose a dynamic array because the STL had been off-limits in the previous block, so I had never implemented one, and I wanted to understand the memory management underneath it.

---

## Intersections

<div class="feature-grid reverse">
  <div class="feature-media">
    <img width="1912" height="1039" loading="lazy" decoding="async" src="{{ "/assets/cpp-raytracer/ray-sphere-derivation.png" | relative_url }}" alt="Hand-derived quadratic for ray-sphere intersection: substitution, discriminant, quadratic formula">
    <img width="4023" height="3050" loading="lazy" decoding="async" src="{{ "/assets/cpp-raytracer/ray-plane-derivation.png" | relative_url }}" alt="Hand derivation of the primary ray through a virtual screen and of the ray-plane intersection in vector form">
  </div>
  <div class="feature-text">
    <p>I derived each intersection by hand (in Paint) before implementing it.</p>
    <p><strong>Ray-sphere, two routines.</strong> Substituting <code>O + tD</code> into the sphere equation gives a quadratic in t with a&nbsp;=&nbsp;D&middot;D, b&nbsp;=&nbsp;2D&middot;(O&nbsp;&minus;&nbsp;C), c&nbsp;=&nbsp;|O&nbsp;&minus;&nbsp;C|&sup2;&nbsp;&minus;&nbsp;r&sup2;. My implementation computes the discriminant first and returns early when it is negative, before any square root. The primary routine is the geometric test from Jacco Bikker's lecture: project the centre offset onto the ray (t&nbsp;=&nbsp;(C&nbsp;&minus;&nbsp;O)&middot;D), reject when the squared perpendicular distance exceeds r&sup2;, and subtract the half-chord length. It is faster but assumes that the ray starts outside the sphere. The quadratic routine returns the larger root when it is positive, which for a ray starting inside the sphere is the exit point, so it is used only for refraction rays. Keeping two routines means rays that start outside a sphere never pay for an inside-or-outside test.</p>
    <p><strong>Ray-plane.</strong> Solving <code>(r&nbsp;&minus;&nbsp;p&#8320;)&middot;n&#770; = 0</code> for t. The same page derives the primary rays: each runs from the camera through a point P&#8320;&nbsp;+&nbsp;u(P&#8321;&nbsp;&minus;&nbsp;P&#8320;)&nbsp;+&nbsp;v(P&#8322;&nbsp;&minus;&nbsp;P&#8320;) on a virtual screen spanned by a corner and two edge vectors.</p>
    <p><strong>Ray-triangle.</strong> Triangles use the M&ouml;ller-Trumbore algorithm (M&ouml;ller and Trumbore, 1997), implemented from the paper with a tolerance &epsilon;&nbsp;=&nbsp;10<sup>&minus;7</sup>. OBJ loading was adapted from code on an OpenGL tutorial website. A torus exported from Blender was the test mesh. Without an acceleration structure, every ray is tested against every triangle.</p>
    <p><strong>Ray-box.</strong> A slab test from a paper reached the rendering stage, but its <code>getNormalAt()</code> method was not debugged before the deadline, so boxes shade incorrectly.</p>
  </div>
</div>

<div class="media-row">
  <figure>
    <img width="512" height="512" loading="lazy" decoding="async" src="{{ "/assets/cpp-raytracer/torus-render.png" | relative_url }}" alt="Ray-traced render of a Blender-exported torus mesh on a black-and-white checker plane">
    <p class="video-caption">Week six: a torus loaded from OBJ and intersected with M&ouml;ller-Trumbore.</p>
  </figure>
  <figure>
    <img width="512" height="512" loading="lazy" decoding="async" src="{{ "/assets/cpp-raytracer/box-normals-bug.png" | relative_url }}" alt="Box render with incorrect shading on a checker plane, caused by an undebugged normal function">
    <p class="video-caption">The unfinished box: the intersection renders, but the normals are wrong.</p>
  </figure>
</div>

---

## Verification: unit tests against GeoGebra

<div class="feature-grid">
  <div class="feature-text">
    <p>A separate unit-test project checks the vector maths and the intersection routines with <code>TEST_CASE</code>, <code>SUBCASE</code> and <code>CHECK</code> macros. Vector tests compare each operator's result component-wise against the same operation written out per component.</p>
    <p>For the intersections, the expected values came from GeoGebra's 3D calculator. A ray from (5,&nbsp;6,&nbsp;&minus;2) towards (0,&nbsp;0,&nbsp;1), with direction (&minus;5,&nbsp;&minus;6,&nbsp;3) normalised, should enter the unit sphere centred at (0,&nbsp;0,&nbsp;1) at (0.6,&nbsp;0.72,&nbsp;0.64) and should meet the plane y&nbsp;=&nbsp;0 at (0,&nbsp;0,&nbsp;1). The tests round each component to two decimal places before comparing.</p>
    <p>The tests passed on my machine, but the assessors could not build the test project, and the assessment noted that this cost marks.</p>
  </div>
  <div class="feature-media">
    <img width="570" height="389" loading="lazy" decoding="async" src="{{ "/assets/cpp-raytracer/unit-tests.png" | relative_url }}" alt="Unit test session: twelve passing tests for the Vector2 and Vector3 classes">
  </div>
</div>

<div class="media-row">
  <figure>
    <img width="1600" height="722" loading="lazy" decoding="async" src="{{ "/assets/cpp-raytracer/geogebra-ray-sphere.png" | relative_url }}" alt="GeoGebra 3D calculator with a ray from (5, 6, -2) through (0, 0, 1) intersecting a unit sphere at (0.6, 0.72, 0.64) and (-0.6, -0.72, 1.36)">
    <p class="video-caption">GeoGebra reference: the ray enters the sphere at (0.6, 0.72, 0.64).</p>
  </figure>
  <figure>
    <img width="758" height="396" loading="lazy" decoding="async" src="{{ "/assets/cpp-raytracer/unit-test-ray-sphere.png" | relative_url }}" alt="C++ unit test code for the ray-sphere intersection, rounding the hit point to two decimals and checking 0.6, 0.72 and 0.64">
    <p class="video-caption">The matching ray-sphere test case.</p>
  </figure>
</div>

---

## Shading and recursion

- **Week two:** diffuse shading from a point light, at 39 fps with one plane and one sphere.
- **Week three:** shadow rays towards the point light. Shadows are hard, since the light is a point; a reviewer suggested soft shadows, which were not implemented.
- **Week four:** recursive mirror reflection. The first reflective sphere had a green tint because the sphere's base colour (green) was being added to the black returned by rays that hit nothing. I planned to cap the recursion depth, since each bounce contributes less as surfaces absorb energy.
- **Week five:** recursive refraction, described below.
- **Not implemented:** the Fresnel term, planned for weeks six and seven. Reflection and transmission therefore use the material's constant reflectivity and transparency rather than angle-dependent weights.

<div class="feature-grid">
  <div class="feature-text">
    <h3>Refraction: self-intersection at the entry point</h3>
    <p>Refraction produced noise as soon as it was added. A ray entering a transparent sphere refracted correctly, but the ray continuing inside found the entry point again at <code>t&nbsp;&asymp;&nbsp;0</code> instead of the far side. To locate the failure I coloured every pixel yellow where the inside ray did not exit (the middle sphere in the figure); the yellow appeared as speckle across most of the sphere, which pointed to floating-point precision rather than geometry.</p>
    <p>The fix offsets the inside ray's origin by a small <code>&epsilon;</code> along its direction so that it starts past the surface it has just crossed, the same remedy as for shadow acne, which refraction had also introduced. The inside ray then uses the quadratic sphere routine described under Intersections.</p>
  </div>
  <div class="feature-media">
    <img width="512" height="512" loading="lazy" decoding="async" src="{{ "/assets/cpp-raytracer/refraction-bug.png" | relative_url }}" alt="Three spheres: red, a yellow-noise debug visualisation on the middle sphere where refraction rays failed to exit, and blue">
    <img width="862" height="554" loading="lazy" decoding="async" src="{{ "/assets/cpp-raytracer/epsilon-fix.png" | relative_url }}" alt="Diagram of a ray entering a sphere, showing the intersection at t and the offset origin at t plus epsilon">
  </div>
</div>

<div class="media-row">
  <figure>
    <img width="500" height="500" loading="lazy" decoding="async" src="{{ "/assets/cpp-raytracer/reflection-green-hue.png" | relative_url }}" alt="Reflective sphere with a dark green tint reflecting the checker floor and a blue sphere, with a frame counter reading 26">
    <p class="video-caption">Week four: the green tint on the first reflective sphere, caused by adding its base colour to missed rays.</p>
  </figure>
  <figure>
    <img width="512" height="512" loading="lazy" decoding="async" src="{{ "/assets/cpp-raytracer/end-block-scene.png" | relative_url }}" alt="End-of-block scene with diffuse, mirror and transparent spheres between a checker floor and a checker ceiling">
    <p class="video-caption">End of block: diffuse, mirror and transparent spheres between two checker planes.</p>
  </figure>
</div>

---

## Performance

- **Week two:** 39 fps for a plane and a sphere with diffuse shading. Profiling indicated that parts of the code would need restructuring to stay above the 15 fps floor as features were added.
- **Week three:** profiling to locate bottlenecks, and fixes for some of them.
- **Week four:** 4x and 8x supersampling. A reviewer measured the release build with 4x supersampling at 6 fps.
- **Week seven:** a tile-based renderer on `std::thread`. It did not develop into a reliable job system, and the final build uses OpenMP instead.
- **Final build:** 60 fps at 512&times;512 with anti-aliasing disabled. The log does not record a final figure with supersampling enabled, or the hardware used.

No acceleration structure was implemented. A grid acceleration structure was planned for week six and deferred in favour of model loading, which I had not worked with before; in week seven I researched bounding volume hierarchies but judged them too large for the remaining time. The assessment listed the missing acceleration structure as a point against the project.

---

## Weekly progression

<div class="feature-grid">
  <div class="feature-media">
    <video width="500" height="500" data-autoplay loop muted playsinline preload="none" poster="{{ '/assets/cpp-raytracer/realtime-demo-poster.jpg' | relative_url }}" aria-label="Week one in real time: an unshaded sphere on a checker plane as the camera moves"><source src="{{ '/assets/cpp-raytracer/realtime-demo.mp4' | relative_url }}" type="video/mp4"></video>
    <p class="video-caption">Week one, real time: ray-plane intersection works; the unshaded sphere is cut off where no plane lies behind it and shows a grey band at the bottom from some angles. Both were fixed in week two.</p>
    <img width="502" height="539" loading="lazy" decoding="async" src="{{ "/assets/cpp-raytracer/step1-realtime.png" | relative_url }}" alt="A single blue sphere on a checkered plane with a frame counter reading 39 in the corner">
    <p class="video-caption">Week two: one sphere and one plane with diffuse shading from a point light; the counter shows 39 fps.</p>
  </div>
  <div class="feature-media">
    <img width="500" height="500" loading="lazy" decoding="async" src="{{ "/assets/cpp-raytracer/step2-shadows.png" | relative_url }}" alt="Three coloured spheres on a checkered plane, each casting a shadow onto the floor">
    <p class="video-caption">Week three: several spheres with shadow rays.</p>
    <img width="512" height="512" loading="lazy" decoding="async" src="{{ "/assets/cpp-raytracer/step3-aa-reflection.png" | relative_url }}" alt="Two spheres and a mirrored sphere between them reflecting the checkerboard, with smoother edges from supersampling">
    <p class="video-caption">Week four: 4x supersampling and a mirror sphere reflecting the floor and its neighbours.</p>
  </div>
</div>

In week seven I rendered the brief's reference scenes with my ray tracer for comparison (the reference images themselves are not reproduced here).

<div class="media-row">
  <figure>
    <img width="512" height="512" loading="lazy" decoding="async" src="{{ "/assets/cpp-raytracer/brief-recreation-plane.png" | relative_url }}" alt="Render of a black-and-white checker plane under a black sky">
    <p class="video-caption">Plane only.</p>
  </figure>
  <figure>
    <img width="512" height="512" loading="lazy" decoding="async" src="{{ "/assets/cpp-raytracer/brief-recreation-sphere.png" | relative_url }}" alt="Render of an unshaded red sphere above a checker plane">
    <p class="video-caption">Unshaded sphere.</p>
  </figure>
  <figure>
    <img width="512" height="512" loading="lazy" decoding="async" src="{{ "/assets/cpp-raytracer/brief-recreation-shadow.png" | relative_url }}" alt="Render of a diffuse red sphere casting a shadow on a checker plane">
    <p class="video-caption">Diffuse shading and shadow.</p>
  </figure>
  <figure>
    <img width="512" height="512" loading="lazy" decoding="async" src="{{ "/assets/cpp-raytracer/brief-recreation-reflection.png" | relative_url }}" alt="Render of a reflective grey sphere reflecting the checker plane, with its shadow">
    <p class="video-caption">Reflection.</p>
  </figure>
</div>

---

## Build set-up and code review

The solution contains the maths library, the ray tracer and the unit-test project. `Maths.lib` is statically linked, and so is SFML in release builds, so the release executable runs without DLLs; debug builds ship SFML's debug DLLs. A precompiled header holds only stable includes (SFML window headers and `Vector3.h`) so that editing project headers does not force a full rebuild. Version control used three Perforce workspaces: laptop, desktop, and a staging workspace on the desktop that only syncs to check that a clean checkout builds, after earlier project-setting changes had not been picked up by Perforce. Changelists are tagged `[+]`, `[~]` and `[-]` for additions, changes and removals.

Peer reviews raised the following points: Martijn found the code hard to read because of inconsistent spacing (week two); Bart suggested camera movement relative to the view direction rather than the world axes (week one), and object initialisers with one attribute per line, which I had not noticed because ReSharper displayed parameter names inline (week five); and in week eight he pointed out that passing a `float` by const reference has no benefit over passing it by value.

---

## Key takeaways

- **Schedule required features first, and reserve the final week for refactoring and documentation.** Model loading took week six, which had been planned for the Fresnel term and a grid acceleration structure; both moved to week seven and were still open when week eight went to documentation, and the assessment listed the missing acceleration structure against the project. The week-six and week-eight action points record the two halves of this principle.
- **Build the tests on a second machine before submitting them.** The test project that passed locally did not build for the assessors (see Verification), so they could not review the tests.
- **Write code for readers without the author's tools or context.** The week-five comment on object initialisers (see Build set-up and code review) concerned code that was readable only with ReSharper's inline parameter names, and my response noted that team members do not all use the same tools. After the two-week break, refactoring in week five was also how I became familiar with my own code again.
- **Prefer an established parallel runtime until a custom job system is proven.** The tile renderer on `std::thread` did not develop into an effective job system, and the end-of-block evaluation describes OpenMP, which the final build uses, as far more reliable.
