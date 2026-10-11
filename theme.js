// Apply the preferred theme before the stylesheet paints; storage is optional.
(() => {
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = null;
  try { preference = localStorage.getItem('theme'); } catch {}
  if (preference !== 'light' && preference !== 'dark') preference = null;
  function apply(theme) {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#1c1c1d' : '#ffffff');
    window.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
  }
  window.homepageTheme = {
    toggle() {
      preference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('theme', preference); } catch {}
      apply(preference);
    }
  };
  system.addEventListener('change', () => { if (!preference) apply(system.matches ? 'dark' : 'light'); });
  apply(preference || (system.matches ? 'dark' : 'light'));
})();
