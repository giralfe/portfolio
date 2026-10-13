---
layout: default
title: Projects
permalink: /projects/
---

<div class="page-content">
  <div class="wrapper">
    <div class="projects-page-header">
      <h1>Projects</h1>
      <p>Games from four years of team work at BUas, two of them on Steam, the engines and tools behind them, and the physics engines, solvers and research code I have written since. Newest first. Filter by tag if you are after something specific.</p>
    </div>

    {%- assign all_tags = '' -%}
    {%- for project in site.projects -%}
      {%- for tag in project.tags -%}
        {%- assign all_tags = all_tags | append: tag | append: '|' -%}
      {%- endfor -%}
    {%- endfor -%}
    {%- assign tag_array = all_tags | split: '|' | uniq | sort -%}

    <div class="projects-filters" id="projects-filters">
      <button class="filter-pill active" data-filter="all">All</button>
      {%- for tag in tag_array -%}
        {%- if tag != '' -%}
          <button class="filter-pill" data-filter="{{ tag | slugify }}">{{ tag }}</button>
        {%- endif -%}
      {%- endfor -%}
    </div>

    <div class="projects-grid-full" id="projects-grid">
      {%- assign sorted_projects = site.projects | sort: 'sort_date' | reverse -%}
      {%- for project in sorted_projects -%}
        {%- assign slugs = '' -%}
        {%- comment -%} Slugify each tag on its own: slugifying the joined string turns the commas into hyphens. {%- endcomment -%}
        {%- for tag in project.tags -%}{%- assign slug = tag | slugify -%}{%- assign slugs = slugs | append: slug | append: ',' -%}{%- endfor -%}
        <article class="project-card" data-tags="{{ slugs }}">
          {% if project.image %}
          <a class="project-card-image" href="{{ project.url | relative_url }}">
            <img decoding="async" src="{{ project.image | relative_url }}" alt="" loading="lazy">
          </a>
          {% endif %}
          <div class="project-card-content">
            <h3><a href="{{ project.url | relative_url }}">{{ project.title }}</a></h3>
            <p class="project-period">{{ project.period }}{% if project.role %} &middot; {{ project.role }}{% endif %}</p>
            <div class="project-tags">
              {%- for tag in project.tags -%}
                <span class="tag">{{ tag }}</span>
              {%- endfor -%}
            </div>
            <p class="project-excerpt">{{ project.summary | default: project.content | strip_html | truncatewords: 40 }}</p>
            <a href="{{ project.url | relative_url }}" class="read-more">View project</a>
          </div>
        </article>
      {%- endfor -%}
    </div>

    <div class="github-cta">
      <p>Source for the personal projects is on <a href="{{ site.github }}" target="_blank" rel="noopener">GitHub</a>. The thesis engine builds on an unreleased research library and the BUas team projects live in the university's Perforce, so those are walkthrough-on-request. <a href="{{ '/contact/' | relative_url }}">Just ask</a>.</p>
    </div>

  </div>
</div>

<script>
  (function () {
    const pills = document.querySelectorAll('#projects-filters .filter-pill');
    const cards = document.querySelectorAll('#projects-grid .project-card');

    function apply(filter) {
      pills.forEach(p => p.classList.toggle('active', p.dataset.filter === filter));
      cards.forEach(card => {
        const tags = (card.dataset.tags || '').split(',');
        card.style.display = (filter === 'all' || tags.includes(filter)) ? '' : 'none';
      });
    }

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        const f = pill.dataset.filter;
        apply(f);
        history.replaceState(null, '', f === 'all' ? location.pathname : '#' + f);
      });
    });

    const initial = location.hash.replace('#', '');
    if (initial && [...pills].some(p => p.dataset.filter === initial)) apply(initial);
  })();
</script>
