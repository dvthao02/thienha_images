# Copilot Instructions for Anniversary_KD

## Big Picture Architecture
- This is a static web project consisting of `index.html`, `style.css`, `script.js`, and an `images/` directory.
- All logic is handled client-side in JavaScript (`script.js`).
- Images are stored in the `images/` folder and referenced from HTML/CSS/JS.
- No backend or build system is present; the project runs directly in the browser.

## Developer Workflows
- Use Live Server (port 5501) for local development and hot-reloading. See `.vscode/settings.json`.
- No build or test scripts; changes are reflected immediately in the browser.
- Debug using browser DevTools (Chrome, Edge, etc.).

## Project-Specific Conventions
- All assets (images) are stored in the `images/` directory. Use relative paths when referencing them.
- Keep all logic in `script.js`; avoid splitting into multiple JS files unless scaling up.
- CSS is managed in a single `style.css` file. Inline styles are discouraged.
- HTML structure is defined in `index.html` and should be the entry point for the project.

## Integration Points & External Dependencies
- No external JS/CSS libraries are used by default. If adding, document in this file and update `index.html` references.
- No API calls or server communication unless added in future.

## Examples & Patterns
- To add a new image: place it in `images/`, then reference it in HTML (`<img src="images/filename.jpg">`) or CSS (`background-image: url('images/filename.jpg')`).
- To add interactivity: write JS in `script.js` and bind to DOM elements via event listeners.
- To update styles: edit `style.css` and use class selectors for maintainability.

## Key Files
- `index.html`: Main HTML file, entry point.
- `style.css`: All styles for the project.
- `script.js`: All client-side logic.
- `images/`: Asset directory for images.
- `.vscode/settings.json`: Live Server port configuration.

---
If any conventions or workflows are unclear or missing, please provide feedback to improve these instructions.
