---
layout: project
title: MochaNES
period: "2025 - Present"
year: 2026
sort_date: "2026-08"
tags: [Systems, Emulation, Java, Solo]
image: /assets/nes-emulator/thumbnail-card.jpg
repo: https://github.com/giralfe/MochaNES
role: Solo Developer
platform: Java 17 · Maven · desktop + browser (TeaVM)
priority: 4
featured: false
summary: "A Nintendo Entertainment System emulator in Java with a bus-driven clock, six mappers, a CRT simulation and a browser build compiled with TeaVM. Accuracy is measured with blargg's test ROMs: 35 of the 51 tests in the seven tracked suites pass, including every instruction and instruction-timing test."
---

MochaNES is a personal project: an emulator for the Nintendo Entertainment System written in Java 17 and built with Maven. The first commits (February 2025) brought the 6502 CPU to the point where its execution trace matches the nestest reference log line for line. The PPU, APU and debugging tools followed in December 2025, and most of the current system was written between June and August 2026: the cycle-driven core, six mappers, the automated accuracy suite, the desktop front-end, a CRT simulation, a browser build and an experimental reinforcement-learning module. The design goal is that the 6502 CPU, the 2C02 PPU and the APU advance in the same order as on hardware, and that correctness is measured with test ROMs that report a machine-readable result rather than judged by eye.

<div class="video-showcase">
  <div class="video-container">
    <video width="1070" height="720" poster="{{ '/assets/nes-emulator/nes_rendering-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/nes-emulator/nes_rendering.mp4" | relative_url }}" type="video/mp4">
    </video>
  </div>
  <p class="video-caption">The Legend of Zelda (MMC1 cartridge) on an earlier build, launched from the IDE: title screen, name registration, the overworld and the first cave. The window title still reads "Java NES Emulator"; it was renamed in version 0.2.0.</p>
</div>

A [browser version](https://giralfe.github.io/MochaNES/) runs the same emulation core, compiled to JavaScript with TeaVM. The core has no dependency on Swing, `javax.sound` or the file system; it writes to a `FrameSink` and an `AudioSink`, which is what makes the second target possible. Its output is bit-identical to the desktop build: running nestest for 6.3 million instructions gives the same pixel hash, RAM hash and program counter on both. Throughput in JavaScript is about 2.6 times realtime. In the browser the CRT simulation is a WebGL fragment shader. ROMs are loaded locally and are not uploaded.

---

## Clock model

A common simplification is to execute a whole CPU instruction and then advance the other chips by the elapsed cycles. Under that scheme a read of the PPU status register (`$2002`) in the middle of an instruction observes the PPU state at the wrong time. MochaNES drives the clock from memory instead: every 6502 cycle is a bus access, and each `read()` and `write()` advances the PPU by three dots and the APU by one cycle before the access is performed. A `$2002` read therefore observes the PPU state of that cycle. `NES.stepInstruction()` is the single definition of a system step, shared by the desktop runner, the browser runner and the test harness: execute one instruction (its bus accesses drive the clock), add the cycles the CPU spent on internal operations without a bus access, then service any interrupt latched during the instruction.

Two constraints follow from this design. The debugger, disassembler and execution hooks read through a separate `peek()` that consumes no cycles, so inspection cannot change timing. The APU's DMC sample fetch also uses `peek()`, because it runs inside the APU's own tick and a `read()` there would re-enter the clock; the DMA's cycle cost is charged separately.

<div class="feature-grid">
  <div class="feature-text">
    <h3>CPU</h3>
    <p>All official and unofficial opcodes, with exact per-instruction cycle counts including page-crossing and branch-taken penalties. The 6502 samples its interrupt lines at the end of the second-to-last cycle of an instruction, so an interrupt asserted on the final cycle is taken one instruction later. <code>CLI</code>, <code>SEI</code> and <code>PLP</code> change the I flag after that poll, so one pending IRQ is still serviced; the missing case for <code>SEI</code> was found by <code>cpu_interrupts_v2/1-cli_latency</code>. An NMI arriving during the first cycles of <code>BRK</code> takes over its vector, OAM DMA halts the CPU for 513 or 514 cycles, and each DMC sample fetch halts it for about four.</p>
  </div>
  <div class="feature-text">
    <h3>PPU</h3>
    <p>Loopy's <code>v</code>/<code>t</code>/<code>x</code>/<code>w</code> scroll registers, the eight-dot background fetch sequence, and sprite evaluation once per scanline into an eight-entry secondary OAM with the hardware sprite limit and overflow flag. The earlier renderer scanned all 64 sprites per pixel; it had no sprite limit, never set the overflow flag, and was about four times slower. Further modelled behaviour: left-column clipping, per-bit open-bus decay on <code>$2002</code>, the <code>$2007</code> read buffer in the palette range, the skipped dot on odd frames, and the VBlank race in which a read of the flag as it is set suppresses the flag, the NMI or both.</p>
  </div>
</div>

---

## Audio and mappers

**APU.** Two pulse channels, triangle, noise and DMC, mixed with the hardware's non-linear formula. Channel outputs are accumulated every CPU cycle and averaged down to 44.1 kHz, then passed through the filter chain of the console: high-pass filters at 90 Hz and 440 Hz and a low-pass filter at 14 kHz. Without the low-pass stage, harmonics above the Nyquist frequency alias back into the audible range. Frame pacing originally came from `line.write()` blocking once the audio buffer was full, which stopped working on machines without an audio device. The runner now keeps its own deadline at the console's frame rate of 60.0988 Hz, and the audio buffer only corrects the rate over the long run.

**Mappers.** NROM, MMC1, UxROM, CNROM, MMC3 and AxROM (iNES mappers 0, 1, 2, 3, 4 and 7). The MMC3 scanline counter is clocked by rising edges on PPU address line A12. During rendering these occur once per scanline, so the PPU clocks the counter at a fixed dot; when rendering is off, CPU accesses through `$2006` and `$2007` that raise A12 clock it instead. The fixed-dot approximation is also a known limitation: when a game sets `$2000` so that A12 rises during background fetches rather than sprite fetches, the real spacing between scanlines changes, which a fixed dot cannot represent (see Limitations).

<div class="video-showcase">
  <div class="video-container">
    <video width="966" height="720" poster="{{ '/assets/nes-emulator/kirby-crt-poster.jpg' | relative_url }}" data-autoplay loop muted playsinline controls preload="none">
      <source src="{{ "/assets/nes-emulator/kirby-crt.mp4" | relative_url }}" type="video/mp4">
    </video>
  </div>
  <p class="video-caption">Kirby's Adventure (MMC3 cartridge) with the CRT simulation enabled, recorded in fullscreen on 18 August 2026: the Level 1 hub, then the first stage. The status panel stays fixed while the playfield scrolls above it.</p>
</div>

---

## CRT simulation

<div class="feature-grid reverse">
  <div class="feature-text">
    <p>The optional CRT pass models the parts of a cathode-ray tube that produce its appearance, in this order: phosphor persistence with separate decay rates for red, green and blue; NTSC bandwidth limits, applied to chroma in YIQ space so colour bleeds horizontally while luma edges stay sharp; an electron-beam spot modelled as a Gaussian whose width grows with drive level, so bright lines widen and the dark gaps between scanlines narrow; halation from light scattered in the glass; and an aperture-grille, shadow or slot mask. All compositing happens in linear light, with sRGB conversion only at the boundaries.</p>
    <p>The desktop filter runs on the CPU. A detail budget limits how many pixels it renders before scaling up: at 1440p fullscreen without the budget a frame cost 28 ms, and the balanced default holds about 98 fps at any window size. Removing the tilt control and reducing the bloom cost lowered the filter from 10.6 ms to 8.1 ms per frame. Colour emphasis and greyscale from the <code>$2001</code> mask bits are applied as well, so a game that tints the screen (for damage or lightning) is drawn tinted.</p>
  </div>
  <div class="feature-media">
    <img width="1280" height="960" loading="lazy" decoding="async" src="{{ "/assets/nes-emulator/crt-trinitron.jpg" | relative_url }}" alt="Super Mario Bros. rendered through the Trinitron CRT preset: visible scanlines, soft beam, slight bloom">
    <p class="video-caption">The Trinitron preset, rendered headlessly from the emulator core.</p>
  </div>
</div>

<div class="video-showcase">
  <img width="1600" height="300" loading="lazy" decoding="async" src="{{ "/assets/nes-emulator/crt-presets.jpg" | relative_url }}" alt="Four crops of the same Super Mario Bros. frame through the CRT presets: Sony Trinitron, Consumer TV, Arcade Monitor and Green Phosphor">
  <p class="video-caption">One Super Mario Bros. frame through the four presets, rendered headlessly at 1280 × 960 and cropped to the same region. From left: Sony Trinitron (aperture grille), Consumer TV (slot mask, full composite chroma bleed, wider horizontal spot), Arcade Monitor (shadow mask) and Green Phosphor (monochrome, no mask).</p>
</div>

<div class="video-showcase">
  <img width="1280" height="240" loading="lazy" decoding="async" src="{{ "/assets/nes-emulator/crt-compare.jpg" | relative_url }}" alt="Side by side crop of the same Super Mario Bros. frame: raw pixels on the left, the CRT simulation on the right">
  <p class="video-caption">The same frame as raw pixels (left) and through the CRT model (right).</p>
</div>

---

## Accuracy measurement

The blargg test ROMs each exercise a narrow piece of hardware behaviour and write their verdict into cartridge RAM: `$6001-$6003` hold the signature `DE B0 61` once the output is valid, `$6000` holds the status (`0x80` while running, otherwise the result code, where 0 is a pass) and `$6004` onwards holds a text message. `TestRomRunner` runs a ROM headlessly and reads this protocol, and the passing ROMs run as parameterised JUnit cases under `mvn test`. Cases that do not pass are listed in a `KNOWN_FAILING` constant with the reason, rather than omitted. The ROM set cannot be redistributed, so these cases are skipped on CI; golden-frame tests built on ROMs assembled in code cover the PPU and APU there instead, and they were checked by mutation (removing the eight-sprite limit makes them fail).

The harness itself contained one timing error. It polled the result bytes through `Memory.read()`, which is a bus access and therefore advanced the clock during every frame of every run. Reading through `peek()` instead made five `ppu_vbl_nmi` tests pass, and sub-tests 2 to 8 of the MMC3 scanline-timing test, without any change to the emulator.

All 51 ROMs of the seven suites below were run headlessly against the current main branch:

| Suite | Passing | Covers |
|---|---|---|
| `instr_test-v5` | **16 / 16** | every official and unofficial opcode |
| `instr_misc` | **4 / 4** | address wrapping, dummy reads |
| `instr_timing` | **2 / 2** | exact per-instruction cycle counts |
| `mmc3_test_2` | **4 / 6** | MMC3 banking and scanline IRQ |
| `apu_test` | **3 / 8** | length counters, frame IRQ flag |
| `cpu_interrupts_v2` | **1 / 5** | interrupt-disable latency |
| `ppu_vbl_nmi` | **5 / 10** | VBlank flag set and clear time, NMI control, odd-frame skip |
| **Total** | **35 / 51** | |

Also passing: `ppu_read_buffer`, `oam_read`, `oam_stress`, `ppu_open_bus`, both `cpu_exec_space` tests and both `cpu_dummy_writes` tests. The 2005-era sprite tests predate the `$6000` protocol and report through a zero-page byte instead; all eleven sprite-0-hit tests pass, including the timing tests, as do two of the five sprite-overflow tests. The accuracy report lists all eight games of its test library as booting and playable, across NROM, MMC1, UxROM and MMC3. The repository reports headless throughput of 8 to 9 times realtime on the JVM.

Several defects were found only through these ROMs, because normal play did not exercise them:

| Defect | Found by | Effect |
|---|---|---|
| `BRK` charged 14 cycles instead of 7 | `instr_timing` | not visible in normal play |
| Stack pops did not wrap within page 1 | `instr_test-v5/11-stack` | a pop at `SP=$FF` read `$0200` |
| `SEI` lacked interrupt latency | `cpu_interrupts_v2/1-cli_latency` | one IRQ lost |
| `$2007` palette read buffered the wrong byte | `ppu_read_buffer` | test hung; the fix also repaired `oam_stress` |
| ANE and LXA not implemented | `instr_test-v5/03-immediate` | fell into the JAM path and hung |

When a failure was ambiguous, behaviour was compared against FCEUX and Mesen by logging every `$2002` read with its CPU cycle count in each emulator and diffing the traces; the first divergence locates the fault. This is how a 2391-cycle offset in the power-on phase between CPU and PPU was found and corrected.

---

## Future work

The remaining failures in the test table fall into five groups, each with a known cause.

- **Dot-level PPU stepping.** The PPU advances in whole groups of three dots per CPU cycle, and interrupts are acted on at instruction boundaries. The five failing `ppu_vbl_nmi` tests measure where the VBlank flag changes within a single CPU cycle, and the four failing `cpu_interrupts_v2` tests need interrupt lines polled per cycle, so an edge that arrives mid-instruction is serviced one or two cycles late. Stepping the PPU dot by dot, with the CPU able to observe between dots, addresses both groups; it is a restructure of the core rather than a local change. Measurements already ruled out the other hypotheses: bus/cycle drift (1,206,937 accesses against 1,206,937 cycles), the VBlank window (set at scanline 241 dot 1, cleared at 261 dot 1, 6,820 dots) and every split of the three dots around the access.
- **MMC3 IRQ timing.** `4-scanline_timing` fails from sub-test 9, where A12 rises during background fetches (see above); modelling those rises would cover the remaining sub-tests. `6-MMC3_alt` fails by design: it and `5-MMC3` test two mutually exclusive revisions of the chip, and the emulator implements the revision `5-MMC3` checks.
- **APU timing.** `4-jitter`, `5-len_timing` and `6-irq_flag_timing` need frame-sequencer events placed with sub-cycle precision, and `7-dmc_basics` and `8-dmc_rates` a finer DMC timing model.
- **Sprite overflow.** Evaluation finds the same sprites as hardware. Reproducing the hardware's overflow bug, in which the PPU reads the wrong byte of later sprites as their Y coordinate, would pass the three remaining sprite-overflow tests.
- **Test coverage on CI.** The synthetic golden-frame ROMs use NROM only. Golden frames for other mappers would give bank switching, the MMC3 IRQ and the CRT filter automated coverage without the local ROM set.

---

## Further components

- **Save states and cloning.** Every component implements a fast copy used for save states and for the reinforcement-learning rollouts. The repository's benchmark copies a whole machine (with an NROM image) in about 1 µs.
- **Reinforcement-learning module** (`nes-ai`, on a separate `ai` branch so the emulator has no machine-learning dependencies). An agent trained with proximal policy optimisation (Schulman et al., 2017) in Deep Java Library with a PyTorch backend, playing The Legend of Zelda through a headless wrapper. The current version starts episodes from save states (an exact reset costs about 0.5 ms), builds its observation from RAM (a 16 × 11 grid of the room's metatiles, entities sorted by distance, and unit vectors to the nearest enemy, projectile, cave and unexplored screen), and explores with a novelty bonus over coarse positions plus an archive of states per screen reached, from which 70 per cent of episodes restart, weighted toward rarely visited screens (the approach of Go-Explore; Ecoffet et al., 2021). It is experimental, and no training results are reported yet.
- **Debugger** with disassembly, memory and CHR-ROM views, all reading through `peek()`.
- **Front-end**: fullscreen, 1x to 6x scaling, pixel-perfect, 4:3 or stretched aspect, rebindable keys and gamepad buttons, Linux gamepad support, and settings persisted to disk. The browser build adds touch controls.

<div class="video-showcase">
  <img width="1280" height="960" loading="lazy" decoding="async" src="{{ "/assets/nes-emulator/zelda-crt.jpg" | relative_url }}" alt="The Legend of Zelda story screen rendered through the CRT simulation">
</div>

Source, architecture reference, accuracy report and changelog: [github.com/giralfe/MochaNES](https://github.com/giralfe/MochaNES). Hardware references: the NESdev Wiki, blargg's test ROMs (nes-test-roms collection), and Mesen 2 and FCEUX as reference emulators.
