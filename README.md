# Portfolio (GitHub Pages)

Basic, modern static portfolio page for a frontend developer.

## Files

- `index.html`
- `tailwind.css` (generated)
- `tailwind.input.css`
- `tailwind.config.js`
- `script.js`
- `projects.json`

## Features

- Full Tailwind CSS layout and styling
- Scroll reveal animation for sections
- Animated hero counters
- Infinite project carousel with card layout (image, text, link)
- Swipe support and dot pagination for the project carousel

## Tailwind CSS

Install dependencies:

```powershell
npm install
```

Build Tailwind output:

```powershell
npm run build:css
```

Watch Tailwind while editing:

```powershell
npm run watch:css
```

## Local preview

If you have Python installed:

```powershell
python -m http.server 8080
```

Then open: `http://localhost:8080`

## Deploy to GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings -> Pages**.
3. Under **Build and deployment**, select:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` (or your default branch), folder `/ (root)`
4. Save. Your site will be live at:
   - `https://<your-username>.github.io/`

## Customize

- Replace `Your Name`, email, and social/profile links in `index.html`.
- Update portfolio projects in `projects.json`.
