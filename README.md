# RevampSite — Tanbir

Premium single-page site (HTML/CSS/JS). Deploys as static site on GitHub Pages — no build step.

## Local preview
Open `index.html` directly or run:
```
npx serve .
```

## Deploy to GitHub Pages (2 min, no Git needed)

1. Go to https://github.com/new
   - Repository name: `RevampSite` (or any)
   - Visibility: Public
   - **Do not** initialize with README/.gitignore
   - Create repository

2. On the new repo page: `Add file` → `Upload files`
   - Drag **all** files from `E:\CodeProjects\RevampSite`:
     - `index.html`
     - `styles.css`
     - `script.js`
     - `img/` folder (keep structure: `img/work showcase/...`)
     - `README.md` (optional)
   - Click `Commit changes`

3. Enable Pages:
   - `Settings` → `Pages` (left sidebar)
   - `Build and deployment` → `Source`: `Deploy from a branch`
   - `Branch`: `main` / `root` → `Save`
   - Wait ~1 min, refresh — banner shows `https://<username>.github.io/RevampSite/`

## Structure
```
index.html
styles.css
script.js
img/
  Tanbir logo big.png
  tanbir logo.png
  discount.png
  work showcase/*.png
```

Built from Figma styles, responsive, modal showcase, sticky shrinking logo (iOS 27 blur).
