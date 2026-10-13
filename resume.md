---
layout: default
title: Resume
permalink: /resume/
description: "Resume of Ralph Warrand, software engineer working across games and simulation. BSc game technology at BUas, MSc Computer Science & Engineering at TU/e."
---

<div class="page-content resume-wrapper">
  <div class="wrapper">

    <div class="resume-container">
      <div class="resume-header">
        <h1>Resume</h1>
        <p>Software engineer working across games and simulation. Four years making games at BUas, two of them released on Steam, then an MSc in Computer Science &amp; Engineering at TU/e with a thesis on constrained multibody simulation. The essentials are below. The PDF has more detail.</p>

        <a href="{{ '/assets/resume.pdf' | relative_url }}" class="btn-download-resume" target="_blank" download="Ralph_Warrand_Resume.pdf">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Download PDF
        </a>
      </div>

      <div class="resume-summary">
        <div class="resume-col">
          <h3>Education</h3>
          <p><strong>MSc Computer Science &amp; Engineering</strong>, Eindhoven University of Technology, 2024 &ndash; March 2027 (expected; pre-master 2024&ndash;25). Thesis: <em>An Entity Component System for Extensible 2D Constrained Multibody Simulation</em>, with dr. Andrei Jalba (TU/e) and dr. Claude Lacoursi&egrave;re (Ume&aring; University / Algoryx).</p>
          <p><strong>BSc Creative Media &amp; Game Technologies</strong>, Breda University of Applied Sciences, 2020 &ndash; 2024. Programming track. Programming lead and product-owner roles, two Steam releases.</p>
          <p><strong>International Baccalaureate</strong>, International School Eindhoven, 2018 &ndash; 2020. HL Mathematics, Physics, English Literature.</p>

          <h3>Experience</h3>
          <p><strong>Fishbait Studios</strong>, BUas student team, 2022 &ndash; 2023. AI and gameplay programmer and programming lead on <a href="{{ '/spliced/' | relative_url }}">S.P.L.I.C.E.D.</a> (Steam): the boss, enemy AI, aiming and combat, and running code review for the team.</p>
          <p><strong>Verdant Games</strong>, student studio (BUas incubator), 2023 &ndash; 2024. Lead programmer on the core team for the first half of the year, then programmer; <a href="{{ '/procedural-dungeon-generation/' | relative_url }}">procedural dungeon generation</a>.</p>
          <p><strong>Small Dragon Big Appetite</strong>, graduation project, 2024. Sole programmer for the final quarter: AI crowd optimisation (77 to 12.5&nbsp;ms), abilities, a recruited playtester group. Released on Steam.</p>
          <p><strong>Bijlesnetwerk</strong>, 2020 &ndash; 2022. Part-time STEM tutor.</p>
        </div>
        <div class="resume-col">
          <h3>Selected work</h3>
          <ul>
            <li><a href="{{ '/flatland-thesis/' | relative_url }}">Flatland</a>: MSc thesis, a 2D multibody physics engine where joints, contacts and elastic bodies are constraints handled by one solver (C++17 core driven from Python)</li>
            <li><a href="{{ '/spliced/' | relative_url }}">S.P.L.I.C.E.D.</a>: UE5 Metroidvania on Steam; the multi-phase boss, enemy AI and 360-degree aiming</li>
            <li><a href="{{ '/hexforge/' | relative_url }}">HexForge</a>: C++20 engine with a CUDA XPBD solver for fluids, cloth, sand and rigid bodies</li>
            <li><a href="{{ '/sub-nivis/' | relative_url }}">SUB NIVIS</a>: retro FPS on a team-built engine for PC and PlayStation 4; Quake BSP/WAD loading, enemy AI, product owner</li>
            <li><a href="{{ '/particle-and-fluid-simulation/' | relative_url }}">Particletoys</a>: constrained particles and cloth with an integrator study, Stam fluids with a level-set free surface</li>
            <li><a href="{{ '/scrye/' | relative_url }}">scrye</a>: Monte Carlo and multislice electron-microscopy simulation</li>
            <li><a href="{{ '/java-nes-emulator/' | relative_url }}">MochaNES</a>: NES emulator verified against hardware test ROMs</li>
            <li><a href="{{ '/osm-city-webgpu/' | relative_url }}">OSM city</a>: Rust / WebGPU city generator with clustered lighting</li>
          </ul>

          <h3>Skills</h3>
          <p><strong>Languages:</strong> C++20, Python (NumPy, SciPy), CUDA, Java, Rust, GLSL / HLSL / WGSL.</p>
          <p><strong>Physics &amp; numerics:</strong> constrained multibody dynamics (Spook, LCP), XPBD / PBF, Stable Fluids, explicit and implicit integration, Monte Carlo and discrete-event simulation, Eigen, NumPy / SciPy / SymPy, pybind11.</p>
          <p><strong>Games &amp; graphics:</strong> Unreal Engine 5 (C++ and Blueprints), game AI (behaviour trees, steering), OpenGL, WebGPU / wgpu, DirectX 12 via The Forge, PlayStation 4, EnTT, Dear ImGui.</p>
          <p><strong>Engineering:</strong> CMake, GitHub Actions, Git, Perforce, Jira, doctest / pytest / googletest, Unreal Insights, Optick.</p>
          <p><strong>Languages spoken:</strong> English and Dutch (native), Afrikaans (mother tongue, conversational), French (elementary).</p>
        </div>
      </div>

      <div class="resume-viewer">
        <object data="{{ '/assets/resume.pdf' | relative_url }}" type="application/pdf" width="100%" height="900px">
          <div class="pdf-fallback">
            <p>Your browser doesn't display embedded PDFs.</p>
            <a href="{{ '/assets/resume.pdf' | relative_url }}" class="btn-secondary">Open the PDF instead</a>
          </div>
        </object>
      </div>

    </div>

  </div>
</div>
