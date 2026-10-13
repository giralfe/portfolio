# Ralph Warrand: portfolio

Source of my portfolio site, **<https://giralfe.github.io/portfolio/>**.

Software engineer working across games and simulation: gameplay and AI on two UE5 games released on Steam,
engines that ran on PlayStation 4 and PC, and physics and research code at TU/e (an MSc thesis on
constrained multibody simulation, a CUDA XPBD engine, an electron-microscopy simulator and a NES emulator).
Each project has its own page with method, measured results and media.

Built with Jekyll; GitHub Pages builds and publishes it from `main` on every push.

## Layout

- `_projects/`: one Markdown file per project. Front matter drives everything: `sort_date` (YYYY-MM,
  newest first) orders the grid and the previous/next links, `priority` orders the featured cards on the
  home page (`featured: true`), `summary` feeds the cards, the hero and the meta description, and `image`
  is the card thumbnail and the social preview.
- `_layouts/`: `default` (shell, meta tags, structured data), `home` (dashboard), `project` (hero, meta bar, prose).
- `assets/<project>/`: media per project; `assets/main.css`; `assets/js/boids.js` (the boids in the home profile banner).
- `_resume/resume.tex`: LaTeX source of `assets/resume.pdf`, plus role-specific variants.
- `sitemap.xml`: generated from the pages and projects; submit it in Google Search Console.
- Gitignored: `extracted_data/` (raw learning-log extracts the pages were written from) and
  `_unused-assets/` (media not used on any page).

## Build locally

```sh
# once: Ruby (pacman -S ruby) and bundler in your user gem dir
gem install --user-install bundler
fish_add_path ~/.local/share/gem/ruby/3.4.0/bin   # or add it to PATH in your shell
bundle config set --local path vendor/bundle
bundle install

# every time
bundle exec jekyll serve --baseurl /portfolio --livereload
# → http://127.0.0.1:4000/portfolio/
```

Rebuild the resume with `cd _resume && pdflatex resume.tex && cp resume.pdf ../assets/resume.pdf`.

## Search Console

Paste the verification token from Google Search Console (URL-prefix property
`https://giralfe.github.io/portfolio/`, HTML tag method) into `google_site_verification` in `_config.yml`.
