---
layout: project
title: "Nuts N' Found"
period: "2021"
year: 2021
sort_date: "2021-12"
tags: [Tools, Unreal, C++, Team]
image: /assets/nuts-n-found/itch-presskit-card.jpg
repo: https://ralphwarrand.itch.io/nuts-n-found
role: Gameplay programmer
platform: PC (Unreal Engine 4)
priority: 18
summary: "Three-week concept prototype in Unreal Engine 4: a platformer about a lost squirrel in a haunted treehouse. I built a level-streaming system in C++ that loads sublevels at runtime and moves and rotates each one so its entrance meets the previous exit, and compared procedural-generation approaches in a decision matrix."
trailer: y-Fx9j3BEWA
trailer_caption: "Gameplay from the itch.io build."
---

The second block of year two (BUas, 2021) opened with three weeks to concept and prototype a small game in a multidisciplinary team, before moving on to a second concept, [Biome]({{ '/biome/' | relative_url }}), for the rest of the block. Our first concept became a third-person platformer in which a lost squirrel finds its way through a haunted treehouse with a light companion. The programming constraint for the concept was procedural level generation.

My work: setting up Perforce for the team (week 1), the level-streaming and sublevel-placement system (weeks 1 to 3), the research and decision matrix for the procedural-generation approach, help with controller support (week 2), merging my work with the other programmer's (week 3), and the itch.io page and builds together with the designers (week 3). My self-study goal for the block was to write Unreal features in C++ rather than Blueprint, and this system is where I applied it.

<img width="1012" height="761" loading="lazy" decoding="async" src="{{ "/assets/nuts-n-found/itch-presskit.png" | relative_url }}" alt="Nuts N' Found press-kit page on itch.io: a squirrel in a haunted treehouse, with the team credits below">

---

## Streaming and placing sublevels

The intended level progression was generated: a sequence of sublevels, each with designer-placed entry and exit markers, streamed in at runtime and transformed so that the next sublevel's entrance coincides with the exit the player just used.

<div class="feature-grid">
  <div class="feature-media">
    <video width="600" height="338" poster="{{ '/assets/nuts-n-found/streaming-doorways-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="A grey mannequin runs through doorways in white walls; each doorway leads into a new area with a different ground material: dirt, grass and stone">
      <source src="{{ "/assets/nuts-n-found/streaming-doorways.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Week 1: basic level-streaming test. Each doorway leads into the next sublevel, recognisable by its ground material.</p>
  </div>
  <div class="feature-text">
    <h3>Iterations</h3>
    <ol>
      <li><strong>Week 1, basic streaming.</strong> After researching Unreal's level streaming, I implemented basic streaming of sublevels in sequence (clip).</li>
      <li><strong>Week 2, markers and transformation.</strong> Monday: a level-transition actor that designers place in a sublevel to mark its entrance or exit. Tuesday: most of the transformation logic moved from Blueprint to C++. Wednesday: rotations. Thursday: refactoring. Friday: the C++ conversion finished.</li>
      <li><strong>Week 3, complete.</strong> Monday: merging with the other programmer's work. Tuesday: the full transformation working, later than planned.</li>
    </ol>
  </div>
</div>

<div class="feature-grid reverse">
  <div class="feature-media">
    <video width="600" height="344" poster="{{ '/assets/nuts-n-found/sublevel-transform-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="In the Unreal editor, flat white test sublevels stream in one after another and join end to end, while on-screen debug messages report each level load and its transition actors">
      <source src="{{ "/assets/nuts-n-found/sublevel-transform.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Week 2: test sublevels streamed in and joined end to end, each rotated so its entrance meets the previous exit. The yellow messages are the debug output of the function below.</p>
  </div>
  <div class="feature-text">
    <h3>Implementation</h3>
    <p>The C++ lives in a Blueprint function library, so it can be called from Blueprint. Placing a sublevel needs its entry and exit positions, and those only exist once the sublevel is loaded. <code>GetLevelEntryAndExit</code> therefore:</p>
    <ol>
      <li>loads the streaming level and flushes level streaming, so the load completes before the function continues (this blocks the game thread, which suits a loading step rather than play);</li>
      <li>collects every level-transition actor in the world;</li>
      <li>reads each marker's world-space position from its spline point, as the entry or the exit depending on the marker's type;</li>
      <li>marks the level as no longer loaded and flushes again.</li>
    </ol>
    <p>The entry and exit points then determine the translation and rotation applied to the sublevel instance when it is streamed in for play. The test set in the clip consists of six sublevels: left and right corners, rooms of two sizes, and start pieces.</p>
  </div>
</div>

<img width="923" height="594" loading="lazy" decoding="async" src="{{ "/assets/nuts-n-found/level-streaming-code.png" | relative_url }}" alt="C++ function ULevelStreamingLib::GetLevelEntryAndExit: it loads the streaming level, flushes streaming, finds all ALevelTransition actors, reads the entrance and exit spline points by type, then unloads the level">
<p class="video-caption">The C++ that replaced the Blueprint version: load the sublevel, find the transition actors, read the entry and exit points, unload.</p>

**Outcome.** As a proof of concept the system showed that sublevels can be streamed in and placed from a start and an end point. It was not used in the game: the designers moved the concept toward a narrative with hand-authored level progression, and procedural generation was left out of the build in week 3.

---

## Choosing a generation method

<div class="feature-grid">
  <div class="feature-text">
    <p>For the programming constraint I wrote a research document on procedural level generation and scored three candidate approaches in a decision matrix, with every value taken from the research. The five criteria were technical feasibility, effect on gameplay, effect on art, designer control over the procedural ruleset, and effect on level design, each on a three-point scale defined in the sheet.</p>
    <table>
      <thead><tr><th>Approach</th><th>Total (max 15)</th></tr></thead>
      <tbody>
        <tr><td>Endless runner</td><td>14</td></tr>
        <tr><td>3D terrain generation</td><td>10</td></tr>
        <tr><td>Wave Function Collapse (Gumin, 2016)</td><td>8</td></tr>
      </tbody>
    </table>
    <p>The team chose Wave Function Collapse despite the lowest total. The designers wanted levels that felt hand-made, and the other two approaches would mainly have reordered parts of levels. The matrix measured feasibility, not fit with the intended experience, and writing it out made that trade-off explicit.</p>
    <p>During concepting I also proposed using generation to place the platforms the player jumps between (mock-up below the matrix).</p>
  </div>
  <div class="feature-media">
    <img width="1609" height="707" loading="lazy" decoding="async" src="{{ "/assets/nuts-n-found/decision-matrix.png" | relative_url }}" alt="Decision matrix scoring Wave Function Collapse 8, 3D terrain generation 10 and endless runner 14 across five criteria, with the scoring rubric written out below">
    <p class="video-caption">The matrix, with the rubric for each score written out below it.</p>
    <img width="888" height="707" loading="lazy" decoding="async" src="{{ "/assets/nuts-n-found/procgen-mockup.png" | relative_url }}" alt="Hand-drawn concepting mock-up headed 'PR constraint': a character dropping onto procedurally placed tree platforms" style="margin-top:1rem">
    <p class="video-caption">Concepting mock-up for the programming constraint: procedurally placed tree platforms.</p>
  </div>
</div>

---

## Key takeaways

- **Prototype a feature in Blueprint first and port it to C++ once it works.** The sublevel transformation was converted to C++ while still incomplete and was finished later than planned, on the Tuesday of week 3. The week-2 action point set the order for later features: Blueprint until the feature works, then C++ if time remains.
- **Build the programming constraint into the core of the concept.** Procedural generation was left out of the build in week 3 because it no longer fitted the game the concept had become. The action point for the next concept was to make the constraint a central part of it from the start.
- **Generate many concepts before committing to one.** The team reworked its first chosen concept on the Thursday of week 1 after feedback. The action point was to produce a larger set of concepts and narrow it down, instead of adopting the first workable idea.
- **Draw on every discipline during concepting.** The procedural-platform mock-up above is a programming contribution to the concept, and the block reflection credits input from all disciplines with producing a more unified concept.

Play it: [Nuts N' Found on itch.io](https://ralphwarrand.itch.io/nuts-n-found).
