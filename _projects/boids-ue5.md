---
layout: project
title: Boids in UE5
period: "2022 - 2023"
year: 2023
sort_date: "2023-05"
tags: [AI, Unreal, C++, Solo]
image: /assets/boids/flock-torus-card.jpg
role: Solo Developer (self-study)
platform: Unreal Engine 5 · C++
priority: 16
summary: "Reynolds flocking implemented in C++ in Unreal Engine 5 as third-year self-study: separation, alignment, cohesion and attraction, obstacle avoidance by sphere traces along golden-ratio sample directions, and profiling with custom stat counters. Frame time degraded at around 500 boids. The code later became the basis of a swarm-enemy prototype."
---

This was a self-study project in weeks 1 to 3 of block A of my third year at BUas (autumn 2022). The goal was to implement Reynolds' **boids** in Unreal Engine 5 using C++ only, with the swarm enemies in *Stray* (BlueTwelve Studio, 2022) as the behavioural reference: a group behaviour produced by a small set of clearly defined rules. A second aim was to return to Unreal's C++ API after a year spent almost entirely in a custom engine. In block D the code became the starting point of a swarm-enemy prototype, described at the end of this page.

<div class="video-showcase">
  <video width="1000" height="540" data-autoplay loop muted playsinline preload="none" poster="{{ "/assets/boids/poster-flock.jpg" | relative_url }}" aria-label="A flock of 500 boids streaming around a torus and pillars in a UE5 level">
    <source src="{{ "/assets/boids/flock-500.mp4" | relative_url }}" type="video/mp4">
  </video>
  <p class="video-caption">500 boids with sphere-trace avoidance moving around a torus and pillars toward the attraction point. The log records this count as the point where frame time degraded noticeably.</p>
</div>

---

## Plan and sources

The plan defined five rules before implementation: **separation, cohesion, alignment, attraction and avoidance**, with an optional gravity ruleset depending on the implementation. The feedback on the plan in week 1 asked for exactly this (define the rules before writing code) and for an expandable structure in which other developers can add their own rulesets. It also suggested *Programming Game AI by Example* (Buckland, 2005), Unreal's Environment Query System, and publishing the code on GitHub, possibly as a plugin.

Sources: Reynolds' description of the three classic rules and of the neighbourhood (field of view) within which a boid considers flockmates (Reynolds, 1987; <a href="https://www.red3d.com/cwr/boids/" target="_blank" rel="noopener">red3d.com/cwr/boids</a>), the collision-avoidance article in Bevilacqua's <a href="https://gamedevelopment.tutsplus.com/tutorials/understanding-steering-behaviors-collision-avoidance--gamedev-7777" target="_blank" rel="noopener">Understanding Steering Behaviors</a> series (2012), and Sebastian Lague's <a href="https://www.youtube.com/watch?v=bqtqltqcQhw" target="_blank" rel="noopener">Coding Adventure: Boids</a> (2019) for the sphere sampling used in avoidance.

## Rules

<div class="feature-grid">
  <div class="feature-text">
    <p>The first working version (week 2) applied separation, cohesion and alignment inside a bounding box. A boid that reaches a face of the box is teleported to the opposite face. A debug view draws a line from each boid to every current flockmate.</p>
    <p>The second version gave the boids meshes so that their heading is visible, and added the <strong>attraction</strong> rule, which steers the flock toward a gizmo that can be dragged through the scene. I tuned the rule weights by visual inspection of the flock; no quantitative criterion was used.</p>
  </div>
  <div class="feature-media">
    <video width="678" height="540" poster="{{ '/assets/boids/flock-attraction-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline preload="none" aria-label="Boids in a bounding box being pulled toward a movable attraction point">
      <source src="{{ "/assets/boids/flock-attraction.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">The attraction rule pulling the flock toward a draggable point inside its bounding volume.</p>
  </div>
</div>

## Obstacle avoidance

<div class="feature-grid reverse">
  <div class="feature-media">
    <video width="1000" height="540" poster="{{ '/assets/boids/obstacle-avoidance-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline preload="none" aria-label="Boids steering around a torus in the third-person template level, in the early line-trace version of avoidance">
      <source src="{{ "/assets/boids/obstacle-avoidance.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">First avoidance version, using line traces, around a torus in the template level. Boids in this version could pass through geometry.</p>
  </div>
  <div class="feature-text">
    <p>Each boid tests a set of directions distributed evenly over a sphere, generated with the golden-ratio (Fibonacci) spiral as in Lague (2019), and traces along them to find a heading that is not blocked. The first version used line traces, and the boids tended to clip through geometry. The second version uses sphere traces, which removed the clipping (see the 500-boid clip above).</p>
    <p>Two further debug views supported this work: one draws the sampled directions around a single boid as points on a sphere, and one draws the live traces from a single boid as it moves.</p>
  </div>
</div>

<div class="media-row">
  <figure>
    <video width="1100" height="1078" poster="{{ '/assets/boids/debug-flockmates-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Boids in a wireframe volume with short red heading lines and blue lines drawn to each current flockmate">
    <source src="{{ "/assets/boids/debug-flockmates.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Flockmate view: short red lines for heading, blue lines to every current flockmate.</p>
  </figure>
  <figure>
    <img width="1400" height="991" loading="lazy" decoding="async" src="{{ "/assets/boids/sample-sphere.png" | relative_url }}" alt="Red debug points evenly distributed on a sphere around one boid, the golden-ratio sample directions used for avoidance traces">
    <p class="video-caption">Sample-direction view: the golden-ratio directions around a single boid.</p>
  </figure>
  <figure>
    <video width="1100" height="594" poster="{{ '/assets/boids/avoidance-traces-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Avoidance traces fanning out in every sample direction from a single boid near a torus, red toward the obstacle and green elsewhere">
    <source src="{{ "/assets/boids/avoidance-traces.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Trace view: the same directions as live traces from one boid passing a torus and pillars. Traces toward the obstacle are drawn red, the others green.</p>
  </figure>
</div>

## Performance

At around 500 boids, each sphere-tracing every frame, the frame time degraded noticeably. I set a target of at least 1,000 boids within a 1.66 ms frame time. In week 3 I added Unreal stat macros to the implementation: a `BOIDS` stat group with a cycle counter for each rule (alignment, attraction, avoidance, cohesion, separation) and for finding flockmates, steering and the transform update, so the cost of each step shows up in the Session Frontend profiler.

<div class="video-showcase">
  <img width="1436" height="592" loading="lazy" decoding="async" src="{{ "/assets/boids/profiler-boids-stats.png" | relative_url }}" alt="Unreal Session Frontend profiler: graph of game-thread, BOIDS Steering and BOIDS Transform times, with the custom BOIDS stat group expanded in the stat tree">
  <p class="video-caption">Profiler capture with the custom <code>BOIDS</code> stat group (play-in-editor, third-person template map). Game thread: 23.3 ms average, 66.8 ms peak. Steering: 10.3 ms average, 35.1 ms peak. Transform: 7.9 ms average, 27.1 ms peak. The averages include the last part of the capture (after about 34 s), where frame time drops below 16.6 ms; the boid count for this capture was not recorded.</p>
</div>

At that point every boid was updated every frame; the planned next step was to update boids less often than every frame. This was not implemented: I was ill in week 4, and my self-study time in week 5 went to other goals. The target of 1,000 boids was therefore not reached. Reducing per-agent work each frame was later applied to the bunny crowd in <a href="{{ '/small-dragon-big-appetite/' | relative_url }}">Small Dragon</a>, where distance culling stops out-of-range agents from ticking.

## Use in S.P.L.I.C.E.D.

In the same block I tried the avoidance code on a flying enemy for <a href="{{ '/spliced/' | relative_url }}">S.P.L.I.C.E.D.</a>, because Unreal's navmesh does not support flying agents. The resulting behaviour was too difficult to control for a designed enemy. I spent about 2 of the task's 4 hours researching 3D collision avoidance in UE5 and ported a UE4 3D-avoidance plugin to UE5; the flying enemy itself was not implemented in that block.

## Swarm-enemy prototype (block D, 2023)

<div class="feature-grid">
  <div class="feature-text">
    <p>At the end of the year the boids became the basis of a swarm-enemy prototype, a self-study goal for the game studio I was planning to start. The goal was a small prototype with placeholder assets that demonstrates a possible combat loop.</p>
    <p>The first step restricted the flock to the grid generated by a spider-navigation plugin that was in use on another project. I analysed how the plugin builds its grid and wrote rules that keep the boids on it. The result was not fully accurate, and making it accurate was estimated to take too long for the prototype.</p>
    <p>The second step moved the swarm to Unreal's default navmesh, where the enemies chase the player and bite. The team's animator was unavailable because of a laptop problem, so I created a basic hit animation in Unreal to test combat. The prototype did not yet have the intended game feel, but it allowed enemy navigation and combat to be tested separately.</p>
  </div>
  <div class="feature-media">
    <video width="738" height="540" poster="{{ '/assets/boids/spider-nav-attempt-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Boids drawn as small spheres with red and blue debug lines moving over the floor, walls and a cylinder, with the green surface grid of a spider-navigation plugin switched on">
      <source src="{{ "/assets/boids/spider-nav-attempt.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">First step: boids (small spheres with red and blue debug lines) restricted to the surface grid of a spider-navigation plugin (green lines).</p>
    <video width="878" height="540" poster="{{ '/assets/boids/swarm-prototype-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline preload="none" aria-label="Swarm enemy prototype: green, toothed ball creatures chasing the player across an orange grid floor and flashing red when hit" style="margin-top:1rem">
      <source src="{{ "/assets/boids/swarm-prototype.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Second step: the navmesh version, with enemies chasing and biting the player.</p>
  </div>
</div>
