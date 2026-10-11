(() => {
  const toggle = document.querySelector('#theme-toggle');
  function themeLabel() {
    const dark = document.documentElement.dataset.theme === 'dark';
    const label = `Switch to ${dark ? 'light' : 'dark'} mode`;
    toggle.setAttribute('aria-label', label);
    toggle.setAttribute('title', label);
    toggle.setAttribute('aria-pressed', String(dark));
  }
  toggle.addEventListener('click', () => window.homepageTheme.toggle());
  window.addEventListener('themechange', themeLabel);
  themeLabel();

  const dialog = document.querySelector('#search-dialog');
  const input = document.querySelector('#search-input');
  const results = document.querySelector('#search-results');
  const status = document.querySelector('#search-status');
  let previousFocus;
  const clean = value => value.replace(/\s+/g, ' ').trim();
  const normalize = value => clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const entries = [];
  document.querySelectorAll('main section').forEach(section => {
    const heading = section.querySelector('h1, h2');
    if (heading) entries.push({ title: clean(heading.textContent), text: clean(section.id === 'about' ? section.textContent : heading.textContent), href: `#${section.id}`, category: section.id === 'about' ? 'About' : clean(heading.textContent) });
  });
  document.querySelectorAll('.publication').forEach((paper, i) => {
    paper.id = `publication-${i + 1}`;
    entries.push({ title: clean(paper.querySelector('h3').textContent), text: clean(paper.textContent), href: `#${paper.id}`, category: 'Publications' });
  });
  document.querySelectorAll('.awards-list li, .news-list li').forEach((item, i) => {
    item.id = `entry-${i + 1}`;
    entries.push({ title: clean(item.textContent), text: clean(item.textContent), href: `#${item.id}`, category: item.closest('.news-list') ? 'News' : 'Honors/Awards' });
  });
  document.querySelectorAll('.social-links a').forEach(link => {
    entries.push({ title: clean(link.textContent), text: `${link.textContent} ${link.href}`, href: link.getAttribute('href'), category: 'Contact' });
  });
  entries.forEach(entry => { entry.search = normalize(`${entry.title} ${entry.text} ${entry.category}`); });

  function render() {
    const tokens = normalize(input.value).split(' ').filter(Boolean);
    const matches = entries.filter(entry => tokens.every(token => entry.search.includes(token)));
    results.replaceChildren();
    for (const entry of matches) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = entry.href;
      const category = document.createElement('span');
      category.className = 'search-category';
      category.textContent = entry.category;
      const title = document.createElement('span');
      title.textContent = entry.title;
      link.append(category, title);
      link.addEventListener('click', () => dialog.close());
      item.append(link);
      results.append(item);
    }
    status.textContent = matches.length ? `${matches.length} result${matches.length === 1 ? '' : 's'}` : 'No results';
  }
  function open() {
    if (dialog.open) return;
    previousFocus = document.activeElement;
    input.value = '';
    render();
    dialog.showModal();
    document.body.classList.add('search-open');
    input.focus();
  }
  document.querySelector('#search-toggle').addEventListener('click', open);
  document.querySelector('#search-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.classList.remove('search-open');
    previousFocus?.focus();
  });
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  input.addEventListener('input', render);
  dialog.addEventListener('keydown', event => {
    const links = [...results.querySelectorAll('a')];
    const index = links.indexOf(document.activeElement);
    if (event.key === 'ArrowDown' && links.length) {
      event.preventDefault(); links[(index + 1) % links.length].focus();
    } else if (event.key === 'ArrowUp' && links.length) {
      event.preventDefault(); if (index <= 0) input.focus(); else links[index - 1].focus();
    } else if (event.key === 'Enter' && document.activeElement === input && links.length) {
      event.preventDefault(); links[0].click();
    }
  });
  document.addEventListener('keydown', event => {
    const editing = event.target.closest?.('input, textarea, select, [contenteditable="true"]');
    if (((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') || (event.key === '/' && !editing && !event.metaKey && !event.ctrlKey && !event.altKey)) {
      event.preventDefault(); open();
    }
  });
})();
