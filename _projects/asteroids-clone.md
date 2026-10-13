---
layout: project
title: Asteroids Clone
period: "2020"
year: 2020
sort_date: "2020-09"
tags: [Gameplay, C++, Solo]
image: /assets/asteroids-clone/polished-gameplay-poster.jpg
role: Solo Developer
platform: Windows · C++ · framebuffer template
priority: 21
summary: "A solo clone of Atari's Asteroids, written in C++ in the first three weeks of my first year at BUas on a framebuffer template, with every shape drawn by the template's line routine. It covers ship kinematics, random convex asteroids that split into pieces of their own outline, a vector font stored as line segments, and a base-actor class hierarchy."
---

The Asteroids Clone occupied the first three weeks of block A in my first year at Breda University of Applied Sciences (BUas), in September 2020. It was a solo assignment; the remaining five weeks of the block went into the [Super Mario Bros Clone]({{ '/super-mario-clone/' | relative_url }}). The course template provided a framebuffer and a line-drawing routine, and the STL was not permitted in this block, so the ship, the asteroids and all text are drawn with that one routine. It was my first game written in C++: my earlier C++ consisted of mathematics exercises with little visual output, and most of my programming experience was in Java.

<div class="video-showcase">
  <video width="800" height="600" data-autoplay loop muted playsinline preload="none" poster="{{ '/assets/asteroids-clone/polished-gameplay-poster.jpg' | relative_url }}" aria-label="Week-three build: vector ship, asteroids splitting into fragments, starfield, alphabet test string and lives display"><source src="{{ '/assets/asteroids-clone/polished-gameplay.mp4' | relative_url }}" type="video/mp4"></video>
  <p class="video-caption">End of week three, the last Asteroids week: the ship, random convex asteroids splitting into pieces of their own outline, a background starfield, the alphabet drawn in the vector font, and the remaining lives drawn as ship outlines in the top-left corner.</p>
</div>

---

## Planning

<div class="feature-grid">
  <div class="feature-text">
    <p>Week one started with a paper plan of the required features: an isosceles ship that rotates, thrusts and shoots; randomly spawned asteroids that are destroyed in two stages, each producing smaller asteroids; a background starfield; and screen wrap expressed as four conditionals that reset x or y when it crosses 0 or the screen width or height. I drew the wrap as a toroidal mapping of the screen.</p>
    <p>Each day was planned in the morning from this macro feature list and recorded in a worklog with planned hours, actual hours and a note wherever the two differed. The planning task itself took 4 hours against 2 planned, with the note that Asteroids "has more nuanced features than I expected". The same week's log records 14 hours of reading a C++ textbook (Dawson) alongside implementation.</p>
  </div>
  <div class="feature-media">
    <img width="814" height="1212" loading="lazy" decoding="async" src="{{ "/assets/asteroids-clone/planning-sketch.jpeg" | relative_url }}" alt="Hand-drawn planning page showing ship rotation, thrust and shooting, asteroid splitting in two stages, the starfield and toroidal screen wrap">
  </div>
</div>

<div class="video-showcase wide">
  <img width="1600" height="406" loading="lazy" decoding="async" src="{{ "/assets/asteroids-clone/worklog-week1.png" | relative_url }}" alt="Worklog spreadsheet for week one with date, task, category, planned and actual hours, and notes on deviations">
  <p class="video-caption">Worklog for 7 to 11 September 2020: tasks, planned and actual hours, and notes on deviations (for example the wrap fixes on 10 September and the change to asteroid generation on 11 September).</p>
</div>

---

## Ship kinematics

<div class="feature-grid reverse">
  <div class="feature-media">
    <img width="1912" height="1039" loading="lazy" decoding="async" src="{{ "/assets/asteroids-clone/rotation-diagram.png" | relative_url }}" alt="Ship rotation diagram: anchor point, tip point and the angle in radians, with the y-axis pointing down">
    <video width="800" height="600" poster="{{ '/assets/asteroids-clone/w1-ship-movement-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Week-one build: the ship rotating and thrusting between two asteroids drawn as spokes">
      <source src="{{ "/assets/asteroids-clone/w1-ship-movement.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Week one: the ship rotates and thrusts. The asteroids are still drawn only as lines from a centre point to each of their generated vertices.</p>
  </div>
  <div class="feature-text">
    <p>The ship is represented by two points and an angle. The anchor (ix, iy) moves with the ship's velocity, and the tip is recomputed from it on every update as fx&nbsp;=&nbsp;ix&nbsp;+&nbsp;L&middot;cos&nbsp;&theta;, fy&nbsp;=&nbsp;iy&nbsp;+&nbsp;L&middot;sin&nbsp;&theta;, with the ship length L constant. The A and D keys change &theta; by &pi;/30 per update, so a full turn takes 60 updates. Screen y increases downward, so a positive change in &theta; rotates the ship clockwise on screen.</p>
    <p>Movement is a per-update Euler step (<code>ix += xvel</code>) without a frame-time factor, so the ship's speed in pixels per second depends on the update rate. The Mario clone later used the same per-update velocity increments, which produced the refresh-rate dependence described on that page.</p>
    <p>The worklog records two further week-one details: a thrust flame drawn while the ship accelerates, and a wrap fix for the ship, whose wrapping had first been based on the back point of the model rather than on the whole ship.</p>
  </div>
</div>

---

## Asteroid generation, collision and splitting

<div class="feature-grid">
  <div class="feature-text">
    <p>Asteroids are random convex polygons. The worklog dates the idea to 9 September; the first implementation was broken by faulty header inclusions, which peers helped me find, and on 11 September I changed the generation method because the first one caused further issues. Wrapping for asteroids had been applied to each vertex separately, and a fix for this is logged on 10 September. Joey's review at the end of the week still found asteroid outlines breaking at the screen edge, which I recorded as a newly introduced bug.</p>
    <p>Week two added collision between the ship and asteroids and between bullets and asteroids. During testing the ship is drawn blue while it overlaps an asteroid, and the debug console logs each detected collision. The log does not record which overlap test was used.</p>
    <p>Splitting slipped from week two to week three. When an asteroid is shot it breaks into smaller polygons cut from its own outline, rather than into the smaller whole asteroids of the original game. The week-three log records game states as completed; the title screen shown under Vector font is one of them. By week three a respawned ship was invincible for two seconds. A bug that killed the ship at random took about three hours to locate that week.</p>
  </div>
  <div class="feature-media">
    <video width="344" height="436" poster="{{ '/assets/asteroids-clone/w2-overlap-test-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Collision test: the ship turns blue when one of its vertices enters an asteroid drawn as a fan of lines">
      <source src="{{ "/assets/asteroids-clone/w2-overlap-test.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Week two collision test: the ship is drawn blue while it overlaps the asteroid. The asteroid is drawn with lines from its centre to every vertex.</p>
  </div>
</div>

<div class="video-showcase">
  <div class="video-container">
    <video width="1250" height="466" poster="{{ '/assets/asteroids-clone/w2-collision-log-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Week-two build next to the debug console printing Collision and destroyed messages">
      <source src="{{ "/assets/asteroids-clone/w2-collision-log.mp4" | relative_url }}" type="video/mp4">
    </video>
  </div>
  <p class="video-caption">Week two, in game: the ship flies into an asteroid and shoots others, while the debug console prints "Collision!" and "destroyed" messages. Asteroids do not split yet.</p>
</div>

---

## Code structure

At the end of week one I noted that my code was not making proper use of object-oriented design and planned a base actor class. In week two I restructured the code around a `baseActor` base class, from which the `Asteroid` class derives. Further restructuring based on a lecturer's feedback was planned for week three and only partly completed.

Bart's code review in week two found a header that forward-declared the bullet class and then included `bullet.h` anyway, and inconsistent conventions for declarations. Both came from IntelliSense: I wrote method definitions first and let the IDE generate the declarations, and the autocomplete had added the include.

---

## Vector font

<div class="feature-grid reverse">
  <div class="feature-media">
    <img width="439" height="289" loading="lazy" decoding="async" src="{{ "/assets/asteroids-clone/font-arrays.png" | relative_url }}" alt="Font glyphs encoded in C++ as arrays of line segments, four numbers per segment">
    <img width="1048" height="1039" loading="lazy" decoding="async" src="{{ "/assets/asteroids-clone/font-plot.png" | relative_url }}" alt="The A glyph's endpoints plotted on a graph, upside down because screen y grows downward">
    <img width="799" height="598" loading="lazy" decoding="async" src="{{ "/assets/asteroids-clone/title-screen.png" | relative_url }}" alt="Title screen with ASTEROIDS and PRESS SPACE TO START drawn in the line-segment font over asteroids and a starfield">
  </div>
  <div class="feature-text">
    <p>To keep the wireframe style for text, I drew each glyph on grid paper and stored it as an array of line segments. Each row of four numbers holds the two endpoints for one call to the template's line-drawing routine. Plotting the stored points shows the glyphs upside down, because screen y increases downward. The title screen draws the same glyphs at a larger scale.</p>
    <p>Each character is a fixed array, which suits static strings. In week three I noted that the way text was implemented blocked a procedural leaderboard.</p>
  </div>
</div>

---

## Working practice

The practices recorded in the learning log for this block were:

- Planning each day in the morning from the macro feature list, and noting in the worklog why a task took longer than planned.
- Using the Friday peer review to set the next week's priorities.
- Submitting to Perforce whenever a feature worked, with a change description detailed enough to resume from when a build was not yet stable.
- Checking that a fresh checkout built, on my own machine and on classmates' machines.
- Running code analysis in debug and release configurations, both of which compiled without warnings.

---

## Peer review

Most weeks ended with a peer review in which students played each other's builds and read each other's code.

**Week one (Joey):** no player drag, no maximum speed, and asteroid outlines breaking when they wrap around the screen edge. I accepted the speed cap, declined drag (considering it as an option at most), and recorded the wrap issue as a newly introduced bug.

**Week two (Bart):** the forward-declaration and declaration-convention issues described under Code structure. In the review I gave Joey that week I noted that bullets fired just after reversing out of a thrust travelled slowly; in his build each bullet inherited the ship's velocity.

**Week three (Martijn):** shooting was inconsistent, sometimes one bullet and sometimes four in quick succession (I traced this to bullet lifetime; the log does not record a fix); respawning while holding fire could place the ship inside an asteroid (respawns already granted two seconds of invincibility); a score was missing; and the ship was hard to control, so the speed or turn rate should be lowered. He also commented positively on the splitting.

The control comment contrasted with my own assessment: I replied that I "did not have such a problem with player movement speed" but would test a lower speed. In the same session I told Martijn that his ship's top speed seemed high, and he replied that he had considered it too slow.

---

## Key takeaways

- **Make program state visible while debugging.** Week-one debugging made limited use of the debug window. Following what classmates had done, I added collision output: by week two the ship is drawn blue while it overlaps an asteroid and the console logs each detected collision.
- **Establish the class structure before features accumulate.** The week-one code had no common base class, and much of it was restructured around `baseActor` in week two. The week-two action point reads: "Doing things the fastest way will often end up in having to do more work."
- **Have another programmer read the code.** Both issues in Bart's week-two review (see Code structure) had been introduced by IDE autocompletion without my noticing, and the recorded action point was that a second reader catches this kind of mistake. The end-of-block reflection lists peer review and help with debugging among the block's most important lessons.
- **Judge control feel with players other than the developer.** In both week-three exchanges under Peer review, the developer and the other player rated the same ship's movement differently. When a reviewer described the Mario clone's controls as fast in week seven, I noted that in Asteroids I had preferred fast movement in which small errors are punished, while accepting that most players would not.

{% include youtube.html id="u0wxGXvl3yc" title="Asteroids C++ clone" caption="Gameplay from the finished clone." %}
