---
layout: project
title: "scrye: Electron Microscopy Simulation"
period: "2026"
year: 2026
sort_date: "2026-04"
tags: [Physics, Research, Python, Solo]
image: /assets/scrye/silicon_crystal-card.jpg
role: Solo Developer
platform: Python · NumPy · SciPy · Matplotlib
priority: 5
summary: "A Python package that simulates electron-microscope signals with two engines: a vectorised Monte Carlo electron-transport model (backscatter, secondary electrons, characteristic X-rays, energy loss, knock-on displacement) and a Cowley-Moodie multislice model for HRTEM, STEM and diffraction. The models are closed-form approximations, documented with their sources and known limits."
---

A solo side project from spring 2026, written to understand electron-microscopy instrumentation from the underlying physics. *scrye* ("stochastic visualisation of atoms") simulates an electron beam passing through an atomic sample with two complementary models and renders the images and spectra a microscope would record. The package is about 3,100 lines of Python (NumPy and Matplotlib, with SciPy and scikit-image as optional dependencies). Every module uses one unit convention, nanometres and keV, and each model names its source in the code. Eight example scripts each produce one figure: a single atom, a gold cluster, EDS mapping of a mixed cluster, benzene, a silicon crystal, an Au/Si heterostructure, STEM-HAADF, and EELS with knock-on damage and marching-cubes iso-surfaces of the scattering-rate field.

<div class="video-showcase">
  <img width="1400" height="1317" loading="lazy" decoding="async" src="{{ "/assets/scrye/silicon_crystal.jpg" | relative_url }}" alt="Four-panel multislice figure: a 1,152-atom diamond-cubic silicon block, its projected atomic potential, the simulated HRTEM image after 32 slices, and the electron diffraction pattern">
  <p class="video-caption">Silicon (6×6×4 unit cells, 1,152 atoms) viewed down ⟨001⟩ at 200 kV with Cs = 1 mm and −65 nm defocus: the sample, its projected potential, the lens image after 32 slices (nominal thickness 0.068 nm, λ = 2.51 pm), and the diffraction pattern. The strongest spots at (±3.7, ±3.7) nm⁻¹ are the {220} reflections, whose plane spacing is 0.192 nm. The fringes along the edges of the image and the streaks through the spots come from the finite block in a periodic cell (see Limitations).</p>
</div>

---

## Monte Carlo electron transport

<div class="feature-grid">
  <div class="feature-text">
    <h3>Elastic scattering</h3>
    <p>All electrons are advanced in lock-step in NumPy arrays, processed in chunks of 2,048 so the electron-by-atom intermediate arrays stay bounded. Each atom is a point scatterer with a Gaussian electron density. At every step of length <code>ds</code> (0.01 nm by default), each live electron evaluates the per-atom scattering rate <code>λᵢ = ρᵢ(r) σᵢ(E)</code> at its position and interacts with probability <code>1 − exp(−Σᵢ λᵢ ds)</code>. The scattering atom is chosen by its share of the total rate, and the polar angle is drawn from the screened-Rutherford cross section with screening parameter <code>β = 3.4×10⁻³ Z^(2/3) / E</code> and a relativistic correction factor. With <code>u = 1 − cos θ</code> the cumulative distribution inverts in closed form, <code>u = 2βR / (1 + β − R)</code> for uniform <code>R</code>, so each draw is exact and needs no rejection step. Electrons leaving through the top are counted as backscattered, through the bottom as transmitted, and electrons below 0.5 keV as absorbed. The formulas follow Joy and Luo (1989) and Reimer's <em>Scanning Electron Microscopy</em>, the same formulas used in Monte Carlo codes such as CASINO.</p>
    <h3>Inelastic channels and displacement damage</h3>
    <p>Each elastic event removes a fixed 0.05 keV and, with probability 0.6, also triggers an inelastic event. That event is a characteristic Kα X-ray with probability 0.25·ω(Z), where ω is the K-shell fluorescence yield from Burhop's empirical fit and the line energy follows Moseley's law, <code>E = 0.0102 (Z − 1)²</code> keV. Otherwise it is a secondary electron with an exponential energy distribution of mean 20 eV, which is detected only if its straight path reaches the top surface within a 1 nm escape range. X-ray and secondary-electron images are binned by the impact point of the primary electron, as a scanned beam would record them. For every elastic event the energy transferred to the atom follows from relativistic two-body kinematics, <code>E_R = E_max (1 − cos θ)/2</code> with <code>E_max = 2.194 (E/A)(1 + E/1022)</code> eV for <code>E</code> in keV and <code>A</code> in atomic mass units, and the atom is marked as displaced when <code>E_R</code> exceeds a threshold (25 eV by default).</p>
  </div>
  <div class="feature-media">
    <img width="1400" height="1078" loading="lazy" decoding="async" src="{{ "/assets/scrye/cluster.jpg" | relative_url }}" alt="Monte Carlo figure of three gold atoms on a carbon support: trajectories, the backscatter image, bright-field transmission, and mean scatters per electron">
    <p class="video-caption">Three Au atoms on a 7×7 carbon support at 30 keV, 30,000 electrons: trajectories with emitted secondaries, the backscatter image (one electron of 30,000 was backscattered), bright-field transmission, and the mean number of scattering events per electron.</p>
    <img width="1400" height="916" loading="lazy" decoding="async" src="{{ "/assets/scrye/eds_cluster.jpg" | relative_url }}" alt="Monte Carlo figure: Au, Cu and Fe atoms on a carbon support at 30 keV with electron, X-ray and secondary-electron trajectories, a secondary-electron image, an EDS spectrum, and per-element EDS maps" style="margin-top:1rem">
    <p class="video-caption">Two atoms each of Au, Cu and Fe on a 7×7 carbon support at 30 keV, 40,000 electrons: trajectories, the secondary-electron image (103 of 428 secondaries detected), the EDS spectrum (75 X-rays) and per-element X-ray maps. The Au line near 62 keV is not physical for a 30 keV beam; see Limitations.</p>
  </div>
</div>

---

## Multislice wave optics

<div class="feature-grid reverse">
  <div class="feature-text">
    <h3>Method</h3>
    <p>The multislice engine implements the Cowley-Moodie algorithm (Cowley and Moodie, 1957; Kirkland, 2010). The sample is cut into slices along the beam, the projected potential <code>Vₙ</code> of each slice is computed on a grid, and a complex wavefunction is advanced by alternating transmission, <code>ψ ← ψ · exp(iσVₙ)</code>, with Fresnel propagation in Fourier space, <code>exp(−iπλΔz|k|²)</code>. The propagator is band-limited to two thirds of the Nyquist frequency so that the wraparound of the periodic FFT does not alias into high-order reflections. The HRTEM image is the exit wave filtered by the objective-lens transfer function with aberration phase <code>χ(k) = πλΔf|k|² + ½πλ³C_s|k|⁴</code> and an optional aperture; <code>|FFT(ψ)|²</code> is the diffraction pattern. The relativistic wavelength and interaction parameter are computed from the beam energy, and the code lists reference values next to the formulas (200 kV: λ = 2.51 pm, σ ≈ 0.0073 rad/(V·nm)).</p>
    <h3>Potentials, thermal scattering and STEM</h3>
    <p>Three projected-potential models are selectable: one Gaussian per atom, a sharper core-plus-halo pair of Gaussians, and a model built on Kirkland's tabulated 3-Gaussian plus 3-Lorentzian parameters for H, C, O, Si, Cu and Au (other elements fall back to core-plus-halo). <strong>Frozen-phonon averaging</strong> displaces every atom by a Gaussian of Debye-Waller width (0.005 to 0.006 nm in the examples), reruns the multislice for 6 to 8 configurations and averages the intensities, which adds the thermal diffuse scattering that a single zero-temperature run lacks. The <strong>STEM</strong> module synthesises a convergent probe (default semi-angle 25 mrad) at each scan position, runs one full multislice per position and integrates annular detectors in the diffraction plane: BF below 10 mrad, ABF from 10 to 25 mrad and HAADF from 60 to 200 mrad. This is the explicit form that PRISM (Ophus, 2017) accelerates with a precomputed compact S-matrix; it was chosen as a short reference implementation and is practical for scans of about 32×32 positions on small samples.</p>
  </div>
  <div class="feature-media">
    <img width="1400" height="914" loading="lazy" decoding="async" src="{{ "/assets/scrye/benzene_molecule.jpg" | relative_url }}" alt="Six-panel benzene figure: the 12-atom sample, the multislice image at 80 kV, the electron diffraction pattern, the volumetric scattering-rate field, the projected atomic potential showing the carbon ring, and an empty backscatter image">
    <p class="video-caption">Benzene at 80 kV through both engines: the 12-atom sample, the multislice image (2 slices, λ = 4.2 pm) and diffraction pattern in a 1 nm cell, the volumetric scattering-rate field, and the projected potential with the six carbon atoms and fainter hydrogen atoms. The backscatter image is empty: none of the 20,000 Monte Carlo electrons was backscattered from the 12-atom sample.</p>
  </div>
</div>

---

## Future work

The models are deliberately the simple closed-form ones. The extensions below follow from effects that are visible in the figures above.

- **X-ray lines.** Moseley's law and Burhop's fit are accurate to roughly 20% across the periodic table (the code's own estimate), which is adequate for showing where an EDS map lights up and why; quantitative analysis would use tabulated data instead. Only K lines are modelled, and the simulator does not compare the beam energy with the K-shell binding energy. Adding that check and the L and M lines would correct the EDS figure: the Au K shell (about 81 keV) cannot be ionised by a 30 keV beam, so the Au peak near 62 keV is an artefact, and a real detector would record the Au L and M lines instead. The Fe and Cu K lines in the same spectrum are physically possible at 30 keV.
- **Energy loss.** The loss is a fixed 0.05 keV per elastic event (plus an optional drag proportional to the local density), and the inelastic channel fires with a fixed probability. A stopping-power model and an ionisation cross section would replace both, and the EELS spectrum, currently the histogram of these losses for escaped electrons, would then show core-loss edges and plasmon peaks. The knock-on example lowers the displacement threshold to 0.5 eV so that displacements occur at all; for gold the threshold is about 33 eV against a maximum recoil of about 2.7 eV at 200 kV.
- **Calibrated potentials.** None of the three projected potentials is absolutely calibrated: the Gaussian and core-plus-halo models are scaled by a strength parameter tuned for visible contrast, and the Kirkland-based model is multiplied by an empirical factor chosen to match the Gaussian model. An absolutely scaled Kirkland parameterisation would make image contrast quantitative.
- **Simulation cell.** The multislice cell is sized from the sample's bounding box, so the periodic FFT sees a discontinuity at the cell edge, visible in the silicon figure as fringes along the block edges and streaks through the diffraction spots. Sizing the cell to a whole number of unit cells would remove them.
- **Automated tests.** The checks are the reference values printed beside the formulas (wavelength, interaction parameter, line energies, recoil energies) and inspection of the example figures. Turning those reference values into a test suite is the next step for verification.
