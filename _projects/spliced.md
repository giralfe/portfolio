---
layout: project
title: S.P.L.I.C.E.D.
period: "2022 - 2023"
year: 2023
sort_date: "2023-06"
tags: [AI, Gameplay, Unreal, C++, Team]
image: /assets/spliced/screenshot3-card.jpg
repo: https://store.steampowered.com/app/2163220/SPLICED/
role: AI & Gameplay Programmer, Programming Lead
platform: PC (Unreal Engine 5) · released on Steam
priority: 3
featured: true
summary: "AI and gameplay programmer, and programming lead, on a UE5 Metroidvania built by a multidisciplinary BUas student team over the 2022-23 academic year and released free on Steam. I implemented the two-phase boss (six attacks, 78 logged hours across three blocks), the player's melee combo and 360-degree aiming, the Clam enemy and an editor collision tool, and ran code review."
trailer: 1Er9l8OHqgI
trailer_caption: "The S.P.L.I.C.E.D. trailer."
---

A 3D side-scrolling Metroidvania set in a biopunk Chinatown, developed in Unreal Engine 5 over all four blocks of my third year at BUas (2022-23) by *Fishbait Studios*, a multidisciplinary student team, and **released free on Steam on 20 June 2023**. I was the team's **AI programmer** and, from week 3 of block A, its **programming lead**; the role later extended to gameplay programming. My contributions were the boss encounter, the Angler and Clam enemies, the player's melee combo (block B) and 360-degree aiming (block C), a collision editor plugin, and a Perforce review process for the whole team.

The boss fight is one of three features on the Steam store page, and in the block-D peer reviews teammates reported that playtesters considered it the highlight of the game.

<div class="video-showcase">
  <div class="video-container">
    <video width="930" height="540" poster="{{ '/assets/spliced/boss-intro-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/spliced/boss-intro.mp4" | relative_url }}" type="video/mp4">
    </video>
  </div>
  <p class="video-caption">Start of the boss fight (block D).</p>
</div>

---

## The boss

Jiaolong has two phases and six attacks: head slam, wall slam and rolling in phase one; laser, slash and cage bite in phase two. Falling rocks, a transformation and a death sequence complete the fight. I implemented the AI, attack logic and hit registration and integrated the animations and VFX, in a strike team with animators, the boss's character artist and a designer. The design came from the design team; in block C I also proposed attack mechanics and concept ideas, some of which were used. The logs record 18 hours of boss work in block A, none in block B, 20 in block C and 40 in block D.

### Block A: prototype

The prototype, built in weeks 5 and 6, served to measure how long a boss takes to produce and to let the animators see their work in game. It had three attacks: a swipe, a jab and a potion-ball attack. Time was lost to errors in the first boss rig, which had to be re-imported several times with its animations, and to incorrectly split animation sequences, which I corrected by hand.

<div class="feature-grid">
  <div class="feature-text">
    <h3>Attack selection</h3>
    <p>The boss runs on a UE5 <strong>behaviour tree</strong>. Services update the player's distance, location and side every 0.2 s, and another service chooses the next attack according to the side the player is on. Each attack is a branch gated by a blackboard condition. Above them sit a distance check and a custom decorator, <code>BTD_Jiao_LockedInAnim</code>, which reads the attack flags from the animation blueprint and, inverted, prevents a new choice while an attack is still playing. Writing custom decorators was my self-study goal for the block.</p>
  </div>
  <div class="feature-media">
    <img width="1082" height="849" loading="lazy" decoding="async" src="{{ "/assets/spliced/boss-a-behaviour-tree.png" | relative_url }}" alt="Behaviour tree of the block-A boss with the custom decorator, attack-choice services and one branch per attack">
    <img width="1444" height="389" loading="lazy" decoding="async" src="{{ "/assets/spliced/boss-a-decorator.png" | relative_url }}" alt="Blueprint of the decorator that checks the animation blueprint's attack flags">
  </div>
</div>

Hit registration went through three versions. The first spawned a sphere hitbox at a fixed offset from the attacker and did not line up with the animations. The second, from Epic's UE4 third-person tutorial, attaches hitboxes to skeletal sockets; it is accurate, but a boss would need a separately managed hitbox per attack. The third uses **Animation Notify States**: while a notify is active in the attack montage, a Blueprint function generates the hitbox from a socket, so timing is authored on the animation and each attack defines its own hitbox. The team's designer adopted the method for the player's primary attack.

<div class="media-row">
  <figure>
    <video width="970" height="540" poster="{{ '/assets/spliced/boss-a-hitbox-offset-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/spliced/boss-a-hitbox-offset.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Version 1, tested on the Angler: hitboxes at a fixed offset.</p>
  </figure>
  <figure>
    <video width="604" height="540" poster="{{ '/assets/spliced/boss-a-notify-montage-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/spliced/boss-a-notify-montage.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Version 3: a notify state on the montage generates the claw hitbox (red).</p>
  </figure>
  <figure>
    <video width="996" height="540" poster="{{ '/assets/spliced/boss-a-notify-level-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/spliced/boss-a-notify-level.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">The same hitboxes on the prototype boss in a greybox level.</p>
  </figure>
</div>

<div class="video-showcase">
  <video width="960" height="540" poster="{{ '/assets/spliced/boss-a-prototype-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
    <source src="{{ "/assets/spliced/boss-a-prototype.mp4" | relative_url }}" type="video/mp4">
  </video>
  <p class="video-caption">The block-A prototype fight, recorded on 17 October 2022, with the untextured boss model.</p>
</div>

### Block C: production version

Block C rebuilt the boss on its new model. The first head slam showed that the boss had to track the player to land a hit, so I added a system that moves it in a controlled way during attacks. For balancing, the tuning moved into **Data Assets**, a method I had introduced for the melee combo in block B: there the designer had to search the attack Blueprint for each value and locked me out of the file meanwhile, whereas a separate asset lets both of us work on the same attack. The boss has one asset for general metrics (health, time between attacks, return-to-centre speed, attack list) and one per attack, with shared fields (damage, active hitboxes, a debug toggle) and attack-specific ones such as the head slam's chase speed. The toggle enables my own hitbox drawing, as Unreal's default debug lines are hard to read in motion.

<div class="media-row">
  <figure>
    <video width="884" height="540" poster="{{ '/assets/spliced/boss-c-headslam-v1-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/spliced/boss-c-headslam-v1.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">First head slam, before the boss tracked the player.</p>
  </figure>
  <figure>
    <video width="884" height="540" poster="{{ '/assets/spliced/boss-c-tracking-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/spliced/boss-c-tracking.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">The movement system tracking the player.</p>
  </figure>
</div>

<div class="media-row">
  <figure>
    <img width="1369" height="1082" loading="lazy" decoding="async" src="{{ "/assets/spliced/boss-c-data-assets.png" | relative_url }}" alt="Data Asset editors for the general boss metrics and the head-slam attack">
    <p class="video-caption">General boss metrics (top) and head-slam metrics (bottom).</p>
  </figure>
  <figure>
    <video width="1004" height="540" poster="{{ '/assets/spliced/headslam-debug-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The boss head-slam attack in the editor with its socket-driven hitbox drawn every frame">
      <source src="{{ "/assets/spliced/headslam-debug.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">The head slam with hitbox drawing on, used to check attack timings.</p>
  </figure>
</div>

For the playday at the end of the block I added the intro, the wall slam with placeholder particles, screen shake, falling rocks, a white flash and placeholder blood on hit, and the death animation, so that playtesters could assess a complete first phase.

### Block D: playtest feedback and four new attacks

Feedback on the end-of-block-C version read: "Falling rocks felt a little weird. Falling pattern a little random. A bit more feedback on what the boss is about to do." Three changes addressed it. The rockfall now uses **patterns** that the designer defines in the Data Asset: each row is an array of slots, a checked slot drops a rock, and the spacing adapts to the number of slots, so a pattern can hold any number of rocks and leave deliberate safe spots. **Red decals** mark where rocks will land, and the boss **glows green** before an attack, through a material parameter that the boss's character artist added after suggesting the idea.

<div class="media-row">
  <figure>
    <video width="960" height="540" poster="{{ '/assets/spliced/boss-c-playday-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/spliced/boss-c-playday.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Build of 3 April 2023: rocks fall without markers, and hits turn the boss white.</p>
  </figure>
  <figure>
    <video width="930" height="540" poster="{{ '/assets/spliced/boss-d-rockfall-decals-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/spliced/boss-d-rockfall-decals.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Block D: red landing decals and the green glow before attacks.</p>
  </figure>
  <figure>
    <img width="1012" height="736" loading="lazy" decoding="async" src="{{ "/assets/spliced/boss-d-rock-pattern.png" | relative_url }}" alt="Rockfall pattern in a Data Asset: rows of five checkboxes, one per rock slot">
    <p class="video-caption">Pattern definition: one row per wave, one checkbox per slot.</p>
  </figure>
</div>

<div class="feature-grid">
  <div class="feature-text">
    <h3>Laser</h3>
    <p>The reference was Experiment No. Z-57 in <em>Metroid Dread</em>. My first idea was a spline along the arena floor for the beam's end point (sketch). The first working version drove the end point with a <strong>Timeline</strong>. A Timeline holds a single curve, so I generalised it to read the path from any number of <strong>float curves</strong> listed per arena side in the attack's Data Asset, which the designer can replace without opening the boss Blueprint. An aim <strong>blend space</strong>, driven by my own aim calculation, turns the head to follow the beam.</p>
    <p>Together with the laser's animator and the boss's character artist I discussed the beam with the outsourced tech-art team, and requested the beam's end position as a user parameter set from Blueprint. The trail is part of the VFX, so its data had to be passed back to Blueprint. The goo it leaves damages the player and blocks part of the arena for a time.</p>
  </div>
  <div class="feature-media">
    <img width="1200" height="590" loading="lazy" decoding="async" src="{{ "/assets/spliced/laser-sketch.png" | relative_url }}" alt="Hand-drawn sketch of the boss firing a laser whose end point follows a spline along the arena floor">
    <video width="738" height="720" poster="{{ '/assets/spliced/boss-d-laser-timeline-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/spliced/boss-d-laser-timeline.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">First working version: a Timeline curve (bottom) drives the beam's end point (top).</p>
  </div>
</div>

<div class="media-row">
  <figure>
    <video width="462" height="720" poster="{{ '/assets/spliced/boss-d-laser-blendspace-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/spliced/boss-d-laser-blendspace.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">The laser's aim blend space.</p>
  </figure>
  <figure>
    <video width="920" height="540" poster="{{ '/assets/spliced/laser-curves-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Two float curves in Unreal's curve editor that drive the laser's end position, then the boss firing the laser in game">
      <source src="{{ "/assets/spliced/laser-curves.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Final version: two path curves, then the laser in game.</p>
  </figure>
  <figure>
    <img width="594" height="671" loading="lazy" decoding="async" src="{{ "/assets/spliced/boss-d-laser-data-asset.png" | relative_url }}" alt="Laser Data Asset with left and right path curves, shot count and damage values">
    <p class="video-caption">The laser's Data Asset.</p>
  </figure>
</div>

### Rolling, slash, cage and transformation

- **Rolling** (phase one) is predictable by design, and many players used it as their main opportunity to deal damage in phase one. I iterated on it with the strike team: after a teammate noted that the boss rolled too fast for the distance covered, I slowed the animation, and a revised start was judged less mechanical.
- **Slash** (phase two), the counterpart of the head slam: a short attack avoidable with a roll, with VFX made by the outsource team on my request.
- **Cage bite** (phase two): my calculation drives a blend space that aims the bite at the player. At the designer's request it steals health.
- **Transformation and death**: when phase-one health reaches zero, any attack in progress is cancelled and the boss moves to a set position so that it cannot transform inside a wall. Death reuses this system and then starts the credits, which a teammate built.

<div class="media-row">
  <figure>
    <video width="960" height="540" poster="{{ '/assets/spliced/boss-d-rolling-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/spliced/boss-d-rolling.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Rolling.</p>
  </figure>
  <figure>
    <video width="960" height="540" poster="{{ '/assets/spliced/boss-d-slash-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/spliced/boss-d-slash.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Slash.</p>
  </figure>
  <figure>
    <video width="960" height="540" poster="{{ '/assets/spliced/boss-d-cage-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/spliced/boss-d-cage.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Cage bite.</p>
  </figure>
  <figure>
    <video width="960" height="540" poster="{{ '/assets/spliced/boss-d-transformation-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/spliced/boss-d-transformation.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Transformation.</p>
  </figure>
</div>

### Fixes from playtesting

Playtesters reported that the boss snapped in place after a wall slam and that its metal parts did not flash when hit; the lead artist asked for a weaker hit flash. The snapping came from animation blending, which I fixed, and the flash now includes the metal parts at a lower intensity.

<div class="media-row">
  <figure>
    <video width="992" height="540" poster="{{ '/assets/spliced/boss-d-snap-before-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/spliced/boss-d-snap-before.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Wall slam with the snapping issue.</p>
  </figure>
  <figure>
    <video width="898" height="540" poster="{{ '/assets/spliced/boss-d-snap-after-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/spliced/boss-d-snap-after.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">After the blending fix.</p>
  </figure>
  <figure>
    <video width="706" height="540" poster="{{ '/assets/spliced/boss-d-flash-before-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/spliced/boss-d-flash-before.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Hit flash before: full white, metal unchanged.</p>
  </figure>
  <figure>
    <video width="848" height="540" poster="{{ '/assets/spliced/boss-d-flash-after-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/spliced/boss-d-flash-after.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">After: weaker, metal included.</p>
  </figure>
</div>

<div class="technical-block">
  <h3>Tools built for the boss</h3>
  <ul>
    <li>Notify-state hitboxes (block A): hit timing and shape authored on the animation.</li>
    <li>Data Assets with per-attack hitbox debug drawing (block C).</li>
    <li>Laser paths as float curves, and rockfall patterns with adaptive spacing (block D).</li>
  </ul>
</div>

---

## Enemies and combat

<div class="feature-grid reverse">
  <div class="feature-text">
    <h3>Angler</h3>
    <p>A block-A prototype from the enemy designer's brief to replicate a Goomba. I built it in Blueprint so that level design would not wait on me, then moved it to a <strong>behaviour tree</strong> when line of sight had made the graph hard to follow. It spots the player, closes to range, attacks, and returns to patrol when it loses sight. Testing showed that it kept walking when the player jumped over it, so it now tracks the player and turns to chase while it has line of sight. It walks on the navmesh, which keeps it from following the player off ledges. It was not developed after block A.</p>
    <h3>Clam</h3>
    <p>A stationary turret, built in three hours in block A from the enemy designer's rules and connected to the final animations in block C: invulnerable while closed, a reaction when the player approaches, a hurt state, and <strong>automatic orientation</strong>, which selects the left, right or camera-facing animation set from the actor's rotation so that level designers do not set it by hand.</p>
  </div>
  <div class="feature-media">
    <video width="968" height="540" poster="{{ '/assets/spliced/angler-chase-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/spliced/angler-chase.mp4" | relative_url }}" type="video/mp4">
    </video>
    <video width="996" height="540" poster="{{ '/assets/spliced/clam-test-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" style="margin-top:1rem">
      <source src="{{ "/assets/spliced/clam-test.mp4" | relative_url }}" type="video/mp4">
    </video>
  </div>
</div>

<div class="feature-grid">
  <div class="feature-media">
    <video width="810" height="540" poster="{{ '/assets/spliced/ranged-attack-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/spliced/ranged-attack.mp4" | relative_url }}" type="video/mp4">
    </video>
  </div>
  <div class="feature-text">
    <h3>From melee to 360-degree aiming</h3>
    <p>In block B I developed the player's melee combo over nine iterations: a timed input window for chaining, scripted movement during swings, <strong>hitstop</strong> based on Masahiro Sakurai's video on the subject, animation cancelling, per-attack hitbox toggles, camera shake on hit (with a teammate) and metrics in Data Assets. It did not feel fun by the end of the block, and in block C the team switched to ranged combat modelled on <em>Metroid Dread</em>: a toggleable stationary 360-degree aim and shooting while running.</p>
    <p>An outsourced tech animator suggested blend spaces for the aim. I wrote the conversion from aim direction to blend value and a static C++ Blueprint function, <code>GetAnimationDuration</code>, which returns the length of any animation (Blueprint has no equivalent), so swapping an animation needs no manual update. Four poses already give a usable result, and the animator can add more at any angle. I then added reloading and ammunition at the product owner's request, shooting while running, bullet collision, and placeholder VFX and sounds until the outsourced assets arrived.</p>
  </div>
</div>

<div class="media-row">
  <figure>
    <video width="574" height="444" poster="{{ '/assets/spliced/aim-blendspace-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="An aim blend space in the Unreal editor, with the preview point sweeping between four aim poses">
      <source src="{{ "/assets/spliced/aim-blendspace.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">The aim blend space: four poses blended by aim direction.</p>
  </figure>
  <figure>
    <video width="828" height="540" poster="{{ '/assets/spliced/aim-360-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Prototype of stationary 360-degree aiming with a debug aim line in a greybox level">
      <source src="{{ "/assets/spliced/aim-360.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Stationary 360-degree aim in the greybox.</p>
  </figure>
</div>

<div class="feature-grid">
  <div class="feature-text">
    <h3>Blood effect</h3>
    <p>The first hit effect for the melee combo was a Niagara FLIP fluid simulation, chosen because I had not used Unreal's fluid simulation before. Used heavily, it caused large frame-rate drops, so I replaced it with a conventional particle system that is far cheaper to render. I also added blood and an ink burst to a teammate's slug enemy.</p>
  </div>
  <div class="feature-media">
    <video width="1000" height="648" poster="{{ '/assets/spliced/blood-fluidsim-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Blood droplets from a Niagara FLIP fluid simulation inside its simulation grid">
      <source src="{{ "/assets/spliced/blood-fluidsim.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Version 1: FLIP fluid simulation.</p>
    <video width="880" height="814" poster="{{ '/assets/spliced/blood-particles-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The replacement blood splatter built from a conventional particle system" style="margin-top:1rem">
      <source src="{{ "/assets/spliced/blood-particles.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Version 2: particle system.</p>
  </div>
</div>

<div class="feature-grid reverse">
  <div class="feature-media">
    <video width="684" height="540" poster="{{ '/assets/spliced/collision-tool-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The collision tool menu in the Unreal editor toggling collision and visibility on selected meshes">
      <source src="{{ "/assets/spliced/collision-tool.mp4" | relative_url }}" type="video/mp4">
    </video>
    <video width="746" height="540" poster="{{ '/assets/spliced/collision-tool-spline-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="A whitebox actor using a spline mesh component, one of the mesh types the collision tool supports" style="margin-top:1rem">
      <source src="{{ "/assets/spliced/collision-tool-spline.mp4" | relative_url }}" type="video/mp4">
    </video>
  </div>
  <div class="feature-text">
    <h3>Collision tool</h3>
    <p>A Slate editor plugin in C++, with a Blueprint subclass that level designers can extend. Set dressing kept breaking through wrong collision channels or wrongly hidden meshes. The tool's editor menu toggles collision, and visibility in the editor and in game independently, for a whole selection of whitebox or art meshes. It supports all of Unreal's static mesh types, including spline meshes for curved floors and ceilings, and a global toggle draws collision debug lines for comparing set dressing with the actual collision. I wrote it in week 9 of block B and extended it in block C (10 hours).</p>
    <p>I also built level ingredients used in the game: vaulting platforms, a crusher modelled on Mario's Thwomp, and health pickups.</p>
  </div>
</div>

---

## Leading the programmers

In block B the lead role took about 41 hours (16 in lead meetings, 12.5 on code review, 12.5 on Perforce and merge troubleshooting) plus about 15 hours of team meetings, against 63.5 hours of development, debugging and profiling.

- **Code review.** At first every programmer submission came through me in Swarm; later programmers also reviewed each other. I did 30+ reviews in block C and 100+ in block D at about 20 minutes each, raising issues as threads on the request.
- **Review for the whole team.** In block C, unreviewed commits repeatedly broke builds. On a lecturer's advice I reverted changes submitted without review, which caused friction. At the start of block D I presented a refresher on the rules; a week later an unreviewed submit duplicated the level into itself. A peer review then advised me not to take such lapses personally, and I switched to asking neutrally why a change had no review.
- **Migration to UE 5.1** in two hours, including the graphics programmer's material-expression code, a community fix for the Houdini plugin and the new config structure.
- **Profiling** after the migration for teammates on lower-spec machines: about 2,000 draw calls came from spike traps across the map, which I reported to their author. A document I wrote in block B on optimisation methods for level design and environment art was used in later blocks to fix performance problems.
- **Review findings**: another programmer's enemy physics was frame-rate dependent; I helped him locate the cause.
- **Delegation**: when a block-D peer review noted that preparation for the next year was taking my time, I delegated a Clam stun-lock bug to stay on the boss.

Peer feedback focused on the boss and on communication: the product owner called me the most professional person he had worked with, and an animator wrote that I was "kind and patient if something is not working out". The recurring improvement point was that my criticism came across as too direct.

## Key takeaways

- **Start pre-production from one small concept.** In block A the team voted between several stand-alone concepts and then combined ideas from all of them, which left each member with a different vision of the game. The block-D post-mortem concludes that a smaller base concept by one to five people would have given all disciplines a clearer, shared direction.
- **Design enemies from their behaviour first.** With few designers on the team, enemy designs were driven by visual ideas that did not always translate into gameplay. The post-mortem recommends starting from archetypes or cube prototypes with working behaviour and adding the visuals afterwards.
- **Separate each discipline's part of a feature to minimise dependencies.** The block-B reflection draws this from the melee combo, where moving the attack values into Data Assets, each with a written description, ended the file lock between designer and programmer and sped up their close collaboration. The boss applied the same separation in block C (tuning in Data Assets) and block D (laser paths as curve assets the designer can replace without opening the boss Blueprint).
- **Introduce team-wide pipelines in pre-production.** Review for the whole team was enforced only in block C, mid-production, and met resistance (see Leading the programmers). The post-mortems of blocks C and D conclude that a review pipeline in place early keeps the team on board, and that the team-wide build reviews of block D, in which issues were broken down and assigned to people, should have been held regularly.
- **Estimate complex features with a wider margin.** Some of the block-D boss attacks were more complex than estimated and took longer to implement. A wider margin also leaves time to plan the work and to structure the code for extension.

Play it: [S.P.L.I.C.E.D. on Steam](https://store.steampowered.com/app/2163220/SPLICED/) (free).
