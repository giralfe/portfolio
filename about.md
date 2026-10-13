---
layout: default
title: About
permalink: /about/
description: "Ralph Warrand, software engineer working across games and simulation. Four years making games at BUas, two Steam releases, and an MSc at TU/e with a thesis on constrained multibody simulation."
---

<div class="page-content about-wrapper">
  <div class="wrapper">

    <div class="about-split-layout">

      <!-- Left sidebar -->
      <aside class="about-sidebar">
        <div class="sidebar-header">
           <h1 class="sidebar-name">Ralph Warrand</h1>
           <p class="sidebar-title">{{ site.tagline | escape }}</p>
        </div>

        <div class="sidebar-section">
          <h3>Now</h3>
          <p>MSc Computer Science &amp; Engineering, TU/e. Thesis in progress.</p>
          <p>Eindhoven, the Netherlands</p>
        </div>

        <div class="sidebar-section">
          <h3>Languages</h3>
          <p>English &amp; Dutch (native), Afrikaans (mother tongue, conversational), French (elementary)</p>
        </div>

        <div class="sidebar-section">
          <h3>Contact</h3>
          <p><a href="mailto:{{ site.email }}">{{ site.email }}</a></p>
          <div class="sidebar-socials">
            <a href="{{ site.github }}" target="_blank" rel="noopener">GitHub</a>
            <a href="{{ site.linkedin }}" target="_blank" rel="noopener">LinkedIn</a>
          </div>
        </div>

        <a href="{{ '/resume/' | relative_url }}" class="btn-resume">View resume</a>
      </aside>

      <!-- Main content -->
      <article class="about-main">

        <section class="bio-intro">
          <h2>What I work on</h2>
          <p class="bio-lead">
            I write software for games and for research: gameplay and AI systems, engines and renderers, physics solvers, and the tools around them. The work I like
            best has a physical model, a numerical method and a frame budget that all have to hold at once, and a
            reference to check the result against.
          </p>
          <p>
            Four years of making games at BUas taught me frame budgets, teams, shipping, and what makes a mechanic
            feel right to a player. Two years of simulation work at TU/e taught me to derive the model first, choose
            the numerical method on purpose, and not trust a result until something outside my code agrees with it.
            Each half keeps improving the other: profiling and playtesting habits go into the research code, and
            derivations and reference checks go into the game code.
          </p>

          <h3>Now, at TU/e</h3>
          <p>
            I moved to TU/e in 2024, first for a pre-master and then the MSc in Computer Science &amp; Engineering,
            because the part I wanted more of was the mathematics and the systems. The work I would show first:
          </p>
          <ul class="bio-list">
            <li><a href="{{ '/flatland-thesis/' | relative_url }}">Flatland</a>: a variational 2D multibody
              engine, my MSc thesis</li>
            <li><a href="{{ '/hexforge/' | relative_url }}">HexForge</a>: a GPU particle-physics engine</li>
            <li><a href="{{ '/particle-and-fluid-simulation/' | relative_url }}">Particletoys</a>: a constrained
              particle system and fluid solver, with a measured integrator study</li>
            <li><a href="{{ '/scrye/' | relative_url }}">scrye</a>: Monte Carlo and multislice
              electron-microscopy simulation</li>
            <li><a href="{{ '/java-nes-emulator/' | relative_url }}">MochaNES</a>: a NES emulator verified
              against hardware test ROMs</li>
          </ul>

          <h3>Before that, four years at BUas</h3>
          <p>
            I started writing C++ in 2020 in the game-technology programme: sixteen project blocks of small teams,
            hard deadlines and engines built from scratch.
          </p>
          <ul class="bio-list">
            <li><strong>Year one</strong>: a <a href="{{ '/cpp-raytracer/' | relative_url }}">ray tracer</a>, and a
              <a href="{{ '/empires/' | relative_url }}">strategy game running on a Raspberry Pi and Windows</a> from one
              source tree</li>
            <li><strong>Year two</strong>: a <a href="{{ '/retro-3d-shooter-engine/' | relative_url }}">shooter
              engine on PlayStation 4</a>, and a <a href="{{ '/sub-nivis/' | relative_url }}">retro FPS</a> I ended up
              product-owning</li>
            <li><strong>Year three</strong>: <a href="{{ '/spliced/' | relative_url }}"><em>S.P.L.I.C.E.D.</em></a>,
              a UE5 Metroidvania released on Steam; AI and gameplay programmer, and programming lead</li>
            <li><strong>Year four</strong>: <a href="{{ '/procedural-dungeon-generation/' | relative_url }}">graph-driven
              dungeon generation</a> as lead programmer at a student studio, and a
              <a href="{{ '/small-dragon-big-appetite/' | relative_url }}">solo graduation quarter</a> profiling an AI
              crowd and running a playtester community</li>
          </ul>

        </section>

        <section class="education-section">
          <h3>At TU/e</h3>

          <div class="education-block">
            <div class="edu-date">Thesis</div>
            <div class="edu-details">
              <h4>An Entity Component System for Extensible 2D Constrained Multibody Simulation</h4>
              <span class="edu-school">Supervised by dr. Andrei Jalba (TU/e) and dr. Claude Lacoursi&egrave;re (Ume&aring; University / Algoryx)</span>
              <p>
                <a href="{{ '/flatland-thesis/' | relative_url }}">Flatland</a> is a 2D physics engine in the <em>Ghosts and
                Machines</em> tradition: Lagrangian mechanics in discrete time, constraints kept as exact algebraic
                relations, one Spook stepper and one boxed-LCP solve for joints and contacts.
              </p>
              <p>
                The thesis contribution is elastic bodies expressed as compliant constraints. I restructured the research
                library around an entity component system so bodies of any degree-of-freedom width assemble into one
                solver view, rebuilt the core in C++17 driven from Python, and gated the theory with a symbolic verifier.
              </p>
              <p class="edu-status">
                Preparation-phase report delivered September 2026. The first hyperelastic element is in; graduation phase under way.
              </p>
            </div>
          </div>

          <div class="education-block">
            <div class="edu-date">Coursework</div>
            <div class="edu-details">
              <h4>The courses that shaped the work</h4>
              <ul class="course-list">
                <li><strong>Simulation in Computer Graphics</strong>: the
                  <a href="{{ '/particle-and-fluid-simulation/' | relative_url }}">particle and fluid projects</a>, with constraint solving through Lagrange multipliers, four integrators measured for energy drift and
                  stability, a level-set free surface</li>
                <li><strong>Stochastic Simulation</strong>: discrete-event and Monte Carlo simulation in Python,
                  with confidence intervals, applied to theme-park rides and a real waste-recycling site</li>
                <li><strong>Visual Computing Project</strong>: the
                  <a href="{{ '/osm-city-webgpu/' | relative_url }}">Rust and WebGPU city generator</a></li>
                <li><strong>Geometric Algorithms</strong>: range trees, plane sweep and brute-force baselines in
                  C++, with fuzzers and benchmarks</li>
                <li><strong>DSL Design</strong>: <a href="{{ '/engram-language/' | relative_url }}">Engram</a>,
                  a pair project in Xtext that compiles NPC behaviour to Java</li>
                <li><strong>System Validation</strong>: a pinball-machine controller modelled in mCRL2 and model-checked
                  against thirteen mu-calculus properties</li>
                <li><strong>Machine Learning Engineering</strong>: ResNet-18 against a Vision Transformer on
                  dermatology images with Grad-CAM and attention rollout, and LoRA fine-tuning of a small language
                  model</li>
                <li><strong>Empirical Methods in Software Engineering</strong>: a GitHub dependency-network
                  crawler for a mining-software-repositories study</li>
              </ul>
              <p class="course-also">
                Plus computer graphics (a GLSL path tracer, environment mapping, B&eacute;zier splines) and systems engineering in SysML.
              </p>
            </div>
          </div>
        </section>

        <section class="education-section">
          <h3>Education</h3>

          <div class="education-block">
            <div class="edu-date">2024 &ndash; Present</div>
            <div class="edu-details">
              <h4>MSc Computer Science &amp; Engineering</h4>
              <span class="edu-school">Eindhoven University of Technology &middot; pre-master 2024&ndash;25 &middot; graduating March 2027 (expected)</span>
            </div>
          </div>

          <div class="education-block">
            <div class="edu-date">2020 &ndash; 2024</div>
            <div class="edu-details">
              <h4>BSc Creative Media &amp; Game Technologies</h4>
              <span class="edu-school">Breda University of Applied Sciences &middot; programming track (IGAD)</span>
              <p>C++ and engine architecture, real-time rendering, game AI and tools, across sixteen project blocks in
              multidisciplinary teams. Programming lead and product owner roles, and two Steam releases.</p>
            </div>
          </div>

          <div class="education-block">
            <div class="edu-date">2018 &ndash; 2020</div>
            <div class="edu-details">
              <h4>International Baccalaureate Diploma</h4>
              <span class="edu-school">International School Eindhoven &middot; Higher Level Mathematics, Physics, English Literature</span>
            </div>
          </div>
        </section>

        <section class="education-section">
          <h3>How a thing actually gets made</h3>
          <p>Four years of learning logs turn out to be an unusually complete record of method, because the logs demanded evidence rather than claims. This is the loop, with the actual artefacts.</p>

          <div class="education-block">
            <div class="edu-date">1. Break it down</div>
            <div class="edu-details">
              <h4>The brief becomes systems before it becomes code</h4>
              <p>For <a href="{{ '/empires/' | relative_url }}">Empires</a> my partner and I put the whole brief on a Miro board and pulled it apart into things that could be classes: planets, vessels, supply, tech level, the AI, the decisions each one owns. The point is not the diagram, it is arriving at week two already knowing what does not exist yet.</p>
              <img width="1508" height="1057" loading="lazy" decoding="async" src="{{ '/assets/images/process-miro.png' | relative_url }}" alt="A Miro board breaking a game brief into connected boxes for AI, ship, player, planet, tech level, supply and their relationships">
              <p class="video-caption">Breaking the brief into things that could become classes.</p>
            </div>
          </div>

          <div class="education-block">
            <div class="edu-date">2. Decide on paper</div>
            <div class="edu-details">
              <h4>Write the options down and score them</h4>
              <p>When <a href="{{ '/nuts-n-found/' | relative_url }}">Nuts N' Found</a> needed procedural levels I wrote a research document on the approaches, then scored them against five criteria on a defined scale so the trade was explicit. The cheapest option won on points and we chose the expensive one anyway, for a reason we could name. That is the whole value of the matrix: it turns a drift into a decision.</p>
              <p>The same habit shows up as a notebook page for the <a href="{{ '/procedural-dungeon-generation/' | relative_url }}">dungeon generator</a>, where I split a room graph into composites by hand and wrote out the generation steps, and as hand-derived intersection maths for the <a href="{{ '/cpp-raytracer/' | relative_url }}">ray tracer</a>, unit-tested against hit points I computed separately in GeoGebra.</p>
              <img width="1609" height="707" loading="lazy" decoding="async" src="{{ '/assets/nuts-n-found/decision-matrix.png' | relative_url }}" alt="A decision matrix scoring three procedural generation approaches across five criteria, with the scoring rubric written out below">
              <p class="video-caption">Three approaches, five criteria, a stated rubric.</p>
            </div>
          </div>

          <div class="education-block">
            <div class="edu-date">3. Track it honestly</div>
            <div class="edu-details">
              <h4>Record what slipped, and why</h4>
              <p>My first-year worklogs have a planned column and an actual column for every task, and where they disagree there is a note explaining it. Reading them back, the reasons are specific: refraction took two hours longer than planned because it introduced shadow acne that needed an epsilon and a fix to the intersection code.</p>
              <p>Keeping that column honest is how estimates stop being wishes. By second year it had turned into a rule I still use: take my gut estimate and add twenty percent.</p>
              <img width="1202" height="500" loading="lazy" decoding="async" src="{{ '/assets/images/process-worklog.png' | relative_url }}" alt="A worklog spreadsheet with planned and actual hours per task and a notes column explaining why tasks overran">
              <p class="video-caption">Planned hours, actual hours, and a sentence on every gap.</p>
            </div>
          </div>

          <div class="education-block">
            <div class="edu-date">4. Prove it</div>
            <div class="edu-details">
              <h4>Find something outside the code to check against</h4>
              <p>A binary format either parses correctly or produces convincing nonsense, so the WAD parser in <a href="{{ '/sub-nivis/' | relative_url }}">SUB NIVIS</a> got tests asserting on the header's magic bytes, the palette entries and the first mip texture's dimensions. Before those existed I drew every decoded pixel on screen as its own quad, which was slow but showed at a glance whether the parsing worked.</p>
              <p>The same move recurs everywhere: hardware test ROMs for the <a href="{{ '/java-nes-emulator/' | relative_url }}">emulator</a>, a symbolic re-derivation of the thesis algebra, and independent Python solvers that reproduce the compiled engine to machine precision.</p>
              <img width="1054" height="924" loading="lazy" decoding="async" src="{{ '/assets/sub-nivis/wad-unit-tests.png' | relative_url }}" alt="Unit tests for a WAD parser asserting on header magic bytes, palette colours and the first mip texture's name and size">
              <p class="video-caption">Tests against the format specification, not against my own output.</p>
            </div>
          </div>

          <div class="education-block">
            <div class="edu-date">5. Measure before optimising</div>
            <div class="edu-details">
              <h4>A number ends an argument</h4>
              <p>Profiling is the step I am least willing to skip, because every optimisation I am proud of started somewhere I did not expect. Optick put 2.8&nbsp;ms of a 7.4&nbsp;ms frame into the enemies' line-of-sight raycasts. A profile of <a href="{{ '/spliced/' | relative_url }}">S.P.L.I.C.E.D.</a> turned up about 2,000 draw calls from spike traps. Unreal Insights showed that distant, culled enemies in <a href="{{ '/small-dragon-big-appetite/' | relative_url }}">Small Dragon</a> were still ticking their animation, AI controllers and behaviour trees; switching them off, plus LODs, took the full level from 77&nbsp;ms to 12.5&nbsp;ms. A foliage test put 7.6&nbsp;ms into a few hundred blades of simulated grass and ended grass for that project.</p>
              <p>Opinions about performance are cheap and mine have been wrong often enough to distrust them.</p>
              <img width="1600" height="867" loading="lazy" decoding="async" src="{{ '/assets/sub-nivis/optick-capture.png' | relative_url }}" alt="An Optick profiler capture of a 512-enemy stress test, with the ray-cast function taking 2.8 ms of a 7.4 ms frame">
              <p class="video-caption">The capture that moved 512 enemies from 7.4&nbsp;ms to 5.3&nbsp;ms.</p>
            </div>
          </div>

          <div class="education-block">
            <div class="edu-date">6. Hand it over</div>
            <div class="edu-details">
              <h4>Whoever tunes it next should not need me</h4>
              <p>The last step is making the thing operable by someone else. Attack metrics moved into Data Assets so a designer could rebalance the player's combo, and later the boss, without opening a Blueprint and without locking me out of the file. Shader parameters were exposed so artists could set the look themselves. The sticky block got a setup guide called <em>The Art of Sticking</em>, which four designers used instead of asking me.</p>
              <p>I learned this one by failing it first: I made the sticky block's colliders editable so designers could tune them, and never explained clearly that they could.</p>
            </div>
          </div>
        </section>

        <section class="philosophy-section">
          <h3>Habits that stuck</h3>
          <div class="philosophy-grid">
            <div class="philosophy-item">
              <h4>Make the failure visible</h4>
              <p>The ray tracer's refraction bug fell to a yellow-pixel debug view. The dungeon generator's separation pass got a stepped debug view so I could watch the rooms push apart. The thesis viewer plots energy, constraint violation and step time live.</p>
            </div>
            <div class="philosophy-item">
              <h4>Cross-platform on day one</h4>
              <p>Empires ran on a Raspberry Pi and Windows. Two team engines ran on PlayStation 4 and PC, and the lesson I wrote down after the second was to go multi-platform from the first day. HexForge has had a Windows and Ubuntu CI matrix since its first week.</p>
            </div>
            <div class="philosophy-item">
              <h4>Ship the small thing, then say no</h4>
              <p>A 48-hour jam build was concrete enough to become a graduation project, and the dungeon generator only came together once we dropped the no-overlap rule and I built the simple version end to end. The lesson that took longest was the other half: from first year on, teammates and my own retrospectives kept telling me to say no earlier.</p>
            </div>
          </div>
        </section>

        <section class="education-section">
          <h3>Beyond the projects</h3>
          <div class="education-block">
            <div class="edu-date">2023 &ndash; 2024</div>
            <div class="edu-details">
              <h4>Verdant Games</h4>
              <span class="edu-school">Student studio, BUas incubator</span>
              <p>Lead programmer on the five-person core team through the first half of my graduation year: held a programmers' meeting every sprint, set up the code-review pipeline, wrote the naming conventions, drafted the studio's NDA, and owned procedural dungeon generation. I stepped back from the core team to apply for the TU/e pre-master and stayed on as a programmer until the end of the third quarter. The groundwork came the spring before: the Encourage workshop on founding a game company, which ended with demoing SUB NIVIS to the public at <em>Night of the Nerds</em>.</p>
            </div>
          </div>
          <div class="education-block">
            <div class="edu-date">2020 &ndash; 2022</div>
            <div class="edu-details">
              <h4>STEM tutor, Bijlesnetwerk</h4>
              <span class="edu-school">Part-time, Breda</span>
              <p>Mathematics and English for secondary-school students. The first place I learned to explain a technical idea at three different levels.</p>
            </div>
          </div>
          <div class="education-block">
            <div class="edu-date">Ongoing</div>
            <div class="edu-details">
              <h4>Retro machines</h4>
              <p>Between blocks I've written a tile renderer in Game Boy assembly, set up an SNES project in 65816 assembly and given a talk on it at the retro programming guild, and worked through the Rust book and rustlings. It is the same curiosity that turned into <a href="{{ '/java-nes-emulator/' | relative_url }}">MochaNES</a>.</p>
            </div>
          </div>
        </section>

      </article>

    </div>

  </div>
</div>
