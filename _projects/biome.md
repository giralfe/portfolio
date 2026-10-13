---
layout: project
title: Biome
period: "2021 - 2022"
year: 2022
sort_date: "2022-01"
tags: [Graphics, Gameplay, AI, Unreal, Team]
image: /assets/biome/screenshot2-card.jpg
repo: https://tweisal.itch.io/biome
role: Gameplay & tech-art programmer
platform: PC (Unreal Engine 4)
priority: 13
summary: "Five-week Unreal Engine 4 prototype about cleansing a corrupted forest, built in Blueprint and materials. I implemented its environmental transformation twice, first as material swaps driven by a runtime virtual texture, then as an RVT stamp that drives world-position offset in every plant's material, and the corrupted flower enemy together with two artists."
trailer: A3S6eeV-oGY
trailer_caption: "The Biome gameplay trailer."
---

Weeks 4 to 8 of the second block of year two at BUas (winter 2021 to 2022). After the three-week [Nuts N' Found]({{ '/nuts-n-found/' | relative_url }}) prototype, the multidisciplinary team concepted again and built Biome: the player restores a corrupted forest area by area. The project is Blueprint and material work only; it contains no C++.

My parts were the **environmental transformation** the game is built around (implemented twice), the **totems** that trigger it, the **corrupted flower** enemy, the corruption damage and its screen vignette, the healing ability, the camera zoom when picking up objects, moving platforms, the cursor, and the player spawn. One of my two self-study goals for the block was the Unreal material system, and the transformation was where I applied it.

<div class="video-showcase">
  <div class="video-container">
    <video width="960" height="540" poster="{{ '/assets/biome/ring-decal-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="After the player activates a totem, a white ring expands across a hillside; inside it the ground changes and plants grow from shrunken to full size">
      <source src="{{ "/assets/biome/ring-decal.mp4" | relative_url }}" type="video/mp4">
    </video>
  </div>
  <p class="video-caption">Final version (week 7): a totem triggers the transformation, the ring is a decal, and plants inside it grow through world-position offset in their materials.</p>
</div>

---

## Concept selection

<div class="feature-grid">
  <div class="feature-text">
    <p>The second concepting round in week 4 used a different method from the first: small groups combined a character, a verb and a goal into short pitches. My group (Betty, Tamar and I) proposed four pitches, among them a ghost who possesses people and objects to avenge their own death. The team then scored three concepts in a shared decision matrix on feasibility per discipline (programming, design, visual art), fun to play, fun to create, expandability, and risk of not being fun, each from 1 to 3.</p>
    <p>The highest total (16 of 21) went to a wizard who uses telekinesis to bring a burnt planet back to life; the ghost concept scored 15. Biome's restoration theme and object pickup are consistent with the winning concept, although the log does not state explicitly which concept was developed.</p>
  </div>
  <div class="feature-media">
    <img width="1668" height="747" loading="lazy" decoding="async" src="{{ "/assets/biome/concept-decision-matrix.png" | relative_url }}" alt="Team decision matrix scoring three game concepts (a priest bending time, a ghost possessing people, a wizard restoring a burnt planet) on seven criteria, with totals 15, 15 and 16 and the score legend below">
    <p class="video-caption">Team decision matrix for the week-4 concepts, with the scoring legend.</p>
  </div>
</div>

---

## Environmental transformation, version 1: material swaps (weeks 4 to 6)

The first prototype reused a technique from my previous year's dynamic-snow effect: a **runtime virtual texture** (RVT) into which a stamp is drawn at the player's position, and which other materials sample. It was extended one capability at a time:

<div class="media-row">
  <figure>
    <video width="1000" height="526" poster="{{ '/assets/biome/rvt-v1-stamp-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="A grey mannequin runs across a dark landscape, leaving a glowing green trail where the stamp is written into the runtime virtual texture">
      <source src="{{ "/assets/biome/rvt-v1-stamp.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">1. The stamp follows the player and is written into the RVT, leaving a trail.</p>
  </figure>
  <figure>
    <video width="1000" height="526" poster="{{ '/assets/biome/rvt-v1-landscape-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The player shoots and a circular patch of the dark landscape turns green around each impact point">
      <source src="{{ "/assets/biome/rvt-v1-landscape.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">2. Shooting converts a circle of landscape around the impact point.</p>
  </figure>
  <figure>
    <video width="1000" height="562" poster="{{ '/assets/biome/rvt-v1-foliage-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="On a dry landscape scattered with grey boxes, each shot turns a circle of ground to grass and the boxes inside it green">
      <source src="{{ "/assets/biome/rvt-v1-foliage.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">3. The same shot converts the foliage inside the radius (boxes as stand-ins).</p>
  </figure>
  <figure>
    <video width="940" height="540" poster="{{ '/assets/biome/rvt-v1-mesh-swap-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="A mannequin walks through a test room; where the stamp reaches, the plain floor and walls switch to tiled and brick materials">
      <source src="{{ "/assets/biome/rvt-v1-mesh-swap.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">4. Week 5: the RVT value swaps the material on static meshes as well.</p>
  </figure>
</div>

Steps 1 to 3 took two days in week 4. The limitation showed in week 5: the plants were Unreal's foliage *actors*, which are not instanced, so every plant was a separate actor with its own material swap. That does not scale to a forest, and a swap is binary, so a plant changes state abruptly rather than transitioning.

<div class="feature-grid">
  <div class="feature-text">
    <h3>Totems, from a playtest</h3>
    <p>In the first design the player cleared safe ground by shooting and slowly took damage outside it. After testing this, the designers decided they would rather control progression themselves. In week 6 I therefore made the transformation triggerable remotely: a <strong>totem</strong> lists the zones it controls and converts them when the player activates it, and several zones can transform at the same time. Designers use totems to block areas until the player clears a path.</p>
    <p>Other week-6 additions to version 1: the expanding ring at the edge of the transformation, ground texture changes under it, support for the other foliage types, and the player's healing ability, which retracts over time.</p>
  </div>
  <div class="feature-media">
    <img width="1600" height="934" loading="lazy" decoding="async" src="{{ "/assets/biome/screenshot1.jpg" | relative_url }}" alt="Unreal editor with BP_Totem selected next to a clump of foliage; the details panel shows its Zones array with two elements">
    <p class="video-caption">A totem in the editor. Its <em>Zones</em> array lists the areas it transforms.</p>
  </div>
</div>

<div class="media-row">
  <figure>
    <video width="960" height="540" poster="{{ '/assets/biome/cleansing-ring-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Daytime test level: a green ring spreads from a totem across a hillside, and the ground and grass inside it turn bright green">
      <source src="{{ "/assets/biome/cleansing-ring.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Week 6: a totem activation sends the ring across the hill; inside it ground and grass switch to their cleansed materials.</p>
  </figure>
  <figure>
    <video width="948" height="540" poster="{{ '/assets/biome/totem-trigger-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Night-time level: the player activates a totem, a 'Totem Activated' debug message appears, and the area around the player changes">
      <source src="{{ "/assets/biome/totem-trigger.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Week 6: the remote trigger in the night-time level (note the "Totem Activated" debug message).</p>
  </figure>
</div>

---

## Environmental transformation, version 2: RVT-driven vertex offset (week 7)

<div class="feature-grid reverse">
  <div class="feature-media">
    <video width="880" height="356" poster="{{ '/assets/biome/grass-wpo-test-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="In the editor, a field of grass on a hillside shrinks to nothing and grows back to full height">
      <source src="{{ "/assets/biome/grass-wpo-test.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Self-study test: world-position offset lerping grass between shrunken and fully grown.</p>
    <video width="926" height="540" poster="{{ '/assets/biome/rvt-stamp-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The RVT stamp made visible as a pale overlay on the landscape and foliage" style="margin-top:1rem">
      <source src="{{ "/assets/biome/rvt-stamp.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">The stamp made visible: the pale area is the value stored in the RVT, which every plant's material reads.</p>
  </div>
  <div class="feature-text">
    <p>For the final build I rewrote the transformation in two days (Tuesday and Wednesday of week 7), using what the material tutorial series from my self-study had covered about world-position offset (WPO).</p>
    <p><strong>Method.</strong> The stamp is still written into the RVT. Instead of swapping materials, every plant's material samples the RVT at its own position and uses that value to drive the WPO of its vertices relative to the mesh's pivot, interpolating between a shrunken corrupted state and full growth. All plants therefore respond in their own materials at the same time, and no material swaps are needed.</p>
    <p><strong>Result.</strong> By the Wednesday all plant types needed for the build were supported, the ring had become a decal, and grass grows taller as the player approaches. The change also removed the dependency on per-plant actors. The learning log records version 2 as both better-looking and faster than version 1, but it contains no frame-time measurements that quantify the difference.</p>
  </div>
</div>

<div class="video-showcase">
  <video width="960" height="540" poster="{{ '/assets/biome/grass-proximity-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The player walks along a grassy slope; the grass close to the player grows taller than the grass further away">
    <source src="{{ "/assets/biome/grass-proximity.mp4" | relative_url }}" type="video/mp4">
  </video>
  <p class="video-caption">Week 7: grass grows taller near the player.</p>
</div>

{% include youtube.html id="Dt7gqxO6f4c" title="Reversible environmental transition" caption="The environmental transition running in both directions." %}

---

## The corrupted flower

After the sprint-2 review (week 6), the feedback was that the game resembled many existing games and needed something distinctive, and that its physics constraint was too simple. In response I built an enemy: a flower that tracks the player, charges a shot and fires. It was my first enemy behaviour and my first work with animation. It took about a week, from the first behaviour on the Monday of week 7 to the final animation on the Monday of week 8.

<div class="feature-grid">
  <div class="feature-text">
    <h3>Rig planning with the artists</h3>
    <p>Two visual artists worked in parallel with me: Tom finished the model while Betty animated it, and I wrote the behaviour and connected their work to it with animation montages. So that none of us waited on the others, the joints were agreed in advance on Discord:</p>
    <ul>
      <li>I pointed out to Tom that a bud looking straight ahead would fire past the player. He proposed animating the shot straight and adding the bud's rotation toward the player in engine on top of the animation, which needed an extra joint in the bud; we agreed on that.</li>
      <li>For Betty I sketched the joint plan: the base stays stationary, the stem joint rotates toward the player, and the bud pivots to the player's exact position. The stem had to be animated bent so the bud would not clip through the petals.</li>
    </ul>
  </div>
  <div class="feature-media">
    <img width="500" height="266" loading="lazy" decoding="async" src="{{ "/assets/biome/flower-aim-sketch.png" | relative_url }}" alt="Sketch: a flower bud looking straight ahead while its projectile has to travel down toward the player character">
    <p class="video-caption">17 January 2022: why the bud has to face the player.</p>
    <img width="500" height="266" loading="lazy" decoding="async" src="{{ "/assets/biome/flower-joint-sketch.png" | relative_url }}" alt="Sketch of the flower rig: stationary base, a stem joint labelled 'rotates towards player' and a bud joint labelled 'pivots to exact player pos'" style="margin-top:1rem">
    <p class="video-caption">19 January 2022: the joint plan sent to the animator.</p>
  </div>
</div>

<div class="media-row">
  <figure>
    <video width="868" height="540" poster="{{ '/assets/biome/flower-editor-test-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="In the editor, an untextured grey flower mesh bends its stem and turns its bud to follow the player character as it moves around">
      <source src="{{ "/assets/biome/flower-editor-test.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">First in-engine test of the joint plan on the untextured mesh.</p>
  </figure>
  <figure>
    <video width="926" height="540" poster="{{ '/assets/biome/flower-rig-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The textured pink flower on its stem turning to follow the player as the player moves through the grass">
      <source src="{{ "/assets/biome/flower-rig.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Animations added: the textured flower tracking the player.</p>
  </figure>
  <figure>
    <video width="926" height="540" poster="{{ '/assets/biome/flower-detection-range-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Two flowers with wireframe spheres drawn around them; the flowers react when the player walks inside a sphere">
      <source src="{{ "/assets/biome/flower-detection-range.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Detection ranges drawn as wireframe spheres: a flower targets the player only inside its sphere.</p>
  </figure>
</div>

<div class="feature-grid reverse">
  <div class="feature-media">
    <video width="926" height="540" poster="{{ '/assets/biome/flower-charge-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="In the dark corrupted level, the finished flower's bud lights up orange-red while it charges, then fades after firing">
      <source src="{{ "/assets/biome/flower-charge.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Week 8: final model and materials; the bud lights up while the shot charges.</p>
    <video width="926" height="540" poster="{{ '/assets/biome/crystal-shards-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The player breaks a crystal, which fires shards that kill nearby flowers; the flowers play a dying effect" style="margin-top:1rem">
      <source src="{{ "/assets/biome/crystal-shards.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Week 8: breaking a crystal fires shards that kill flowers, which play a dying effect.</p>
  </div>
  <div class="feature-text">
    <h3>Behaviour and iteration</h3>
    <p>The behaviour is entirely in Blueprint. A sphere collision component per flower detects when the player enters or leaves its range; inside the range the flower rotates its joints toward the player, charges and fires, synchronised with the animation through montages. I also added the glow while the shot charges and the dying effect. Flowers can also be killed indirectly: breaking one of the level's crystals fires shards that hit them.</p>
    <p>Work-in-progress videos went to the artists for feedback. One example, the charge glow (24 January 2022): Tom approved the colour but asked for the build-up to start earlier and the light to fade faster after the shot. The build-up length was fixed by the single animation, so I moved its start earlier and shortened the fade, sent a revised video, and it was approved.</p>
  </div>
</div>

{% include youtube.html id="LwZPjsuCVnU" title="Biome flower enemy" caption="The finished flower enemy." %}

---

## Corruption damage and smaller features

<div class="media-row">
  <figure>
    <video width="1000" height="574" poster="{{ '/assets/biome/vignette-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="Test level: a dark vignette closes in around the screen edges as the player leaves the green safe area and opens again on returning">
      <source src="{{ "/assets/biome/vignette.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Week 5: first damage vignette, closing in outside the safe (green) areas.</p>
  </figure>
  <figure>
    <video width="926" height="540" poster="{{ '/assets/biome/vignette-final-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none" aria-label="The player stands in a red corrupted area while thorny branches close in from the screen edges; the screen goes black and the player reappears at a glowing spawn point">
      <source src="{{ "/assets/biome/vignette-final.mp4" | relative_url }}" type="video/mp4">
    </video>
    <p class="video-caption">Week 8: final vignette of thorny branches; when the player dies the screen goes black and the player respawns.</p>
  </figure>
</div>

The player takes damage while standing in corrupted areas (week 5), shown by a screen vignette that was replaced by a themed version in week 8. Smaller pieces: the healing ability on E, whose effect retracts over time; a camera offset and a camera zoom lerp when picking up objects (with Stefan, the other programmer); moving platforms; the placeholder and final cursor; a reworked player spawn; and the builds for the week-6 and week-8 presentations.

---

## Evaluation

- **Final review (week 8).** A lecturer said it was most likely the most polished game he had seen from year 2, and the final pitch feedback was that consistency, lighting, particles, sound effects and UI came together. The same feedback asked for the story to be introduced better and for the character to be more central to the presentation, and noted that the presentation script was over-prepared.
- **Peer review.** Teammates reported that I expose the values designers want to tweak, and that I deliver work quickly.

## Key takeaways

- **Build the systems the player interacts with first, and the visual treatment on top of them.** The week-6 reflection set this order. The RVT stamp and its totem triggers were working for the week-6 presentation, and the week-7 rewrite replaced only how the plants respond to the stamp.
- **Let shared data drive many objects through their materials.** Version 1 swapped materials on non-instanced foliage actors, one plant at a time; in version 2 each plant's material reads the RVT and offsets its own vertices, which the week-7 log records as better-looking and faster than version 1.
- **Agree interfaces with artists before parallel work, and share work in progress.** Agreeing the flower's joint plan in advance let the model, the animation and the behaviour be built at the same time, and short work-in-progress videos allowed the charge-glow timing to change during production rather than after it; a teammate named these videos in the peer review. The same video exchange with an animator is documented again in block Y2D ([SUB NIVIS]({{ '/sub-nivis/' | relative_url }})).
- **Scope a prototype to the time available.** The concept already looked large for a prototype in week 4, and reaching the final standard took overtime on roughly five days of the block, with about 60 hours worked in week 7. The peer review's main point was to decline feature requests more often, and the lecturer's suggestion of going offline after working hours became the action point for the next block.

Play it: [Biome on itch.io](https://tweisal.itch.io/biome).
