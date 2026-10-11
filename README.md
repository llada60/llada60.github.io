# Ling Liu · Academic homepage

Personal website: https://llada60.github.io

A responsive, buildless academic homepage. Edit `index.html` for content,
`stylesheet.css` for styling, and `navigation.js` for the navigation interaction.
The layout follows [al-folio](https://alshedivat.github.io/al-folio/): a compact
reading column, biography with a right-aligned profile, compact publications,
and a simple awards list. Small screens use a single-column layout.
Keep the original biography, publication summaries, awards, and footer wording
unchanged when updating the layout.

`theme.js` applies the saved light/dark preference before rendering, defaulting
to the system theme. `site.js` handles the theme button and local search dialog.
Open search with the header icon, Cmd/Ctrl+K, or `/`; use arrows and Enter to
navigate results and Escape to close. Search indexes the actual page content.
Edit `.news-list` in `index.html` to add dated news.

`profile-effects.mjs` mounts the Galaxy background and an Orb ring around the circular portrait.
Galaxy uses pointer repulsion plus parallax. The Orb is masked to the outer ring, with hover distortion and rotation;
the previous portrait effects have been removed.
Offscreen/hidden pages pause animation, and reduced-motion preferences render
static frames. Original text and images remain available without WebGL.
The local OGL bundle (v1.0.11) and license files are in `static/effects/`;
no runtime CDN or build step is required.

React Bits source and license:
[Galaxy](https://github.com/DavidHDev/react-bits/blob/main/src/content/Backgrounds/Galaxy/Galaxy.jsx),
[Orb](https://github.com/DavidHDev/react-bits/blob/main/src/content/Backgrounds/Orb/Orb.jsx),
[license](static/effects/react-bits-LICENSE.md).
OGL is provided under [the Unlicense](static/effects/ogl-LICENSE.txt).

`click-spark.js` adds lightweight, purple click bursts inspired by
[React Bits' Click Spark](https://reactbits.dev/animations/click-spark).
The effect supports mouse and touch clicks, respects reduced-motion preferences,
and only renders animation frames while sparks are active.

To preview locally:

```sh
python3 -m http.server 8080
```

Then open http://localhost:8080. No installation or build step is required.
The repository root can be served directly by GitHub Pages.

The top navigation uses an original vanilla JavaScript / SVG filter interpretation
of [React Bits' Gooey Nav](https://reactbits.dev/components/gooey-nav), with a moving
pill, merging particles, scroll-based active states, and reduced-motion support.

The original academic homepage template was borrowed from
[Jon Barron](https://jonbarron.info/).
