# Metal Magic — FTC Team #23362

Official website for **Metal Magic**, a veteran FIRST Tech Challenge robotics team from Ashburn, Virginia.

The site is a fully static site — plain HTML, CSS, and vanilla JavaScript with no build step or framework — deployed automatically to GitHub Pages.

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Landing page with animated intro overlay and team highlights |
| About | `about.html` | Team story and meet-the-team section |
| Robot & Design | `robot-design.html` | Robot builds, mechanisms, and design process |
| Awards & Competitions | `awards.html` | Competition history and awards |
| Outreach | `outreach.html` | Community outreach events (including Code Crush hackathons) |
| Apply | `apply.html` | Application info for prospective members |

## Project structure

```
├── index.html          # Home page
├── about.html
├── robot-design.html
├── awards.html
├── outreach.html
├── apply.html
├── styles.css          # Shared site-wide styles
├── script.js           # Shared site-wide scripts (nav, animations)
├── favicon.svg
└── assets/             # Images, organized by section
    ├── brand/          # Team logo and brand files
    ├── team/           # Meet-the-team headshots
    ├── robot/          # Robot and mechanism photos
    ├── awards/         # Award and competition photos
    ├── outreach/       # Outreach event photos
    ├── hackathons/     # Code Crush event galleries
    └── footer/
```

Pages that reference an image that hasn't been added yet render a styled placeholder — drop the photo into the matching `assets/` folder using the filename already referenced in the HTML (see `assets/README.md`).

## Running locally

No build step required. Open `index.html` directly in a browser, or serve the folder for correct relative paths:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deployment

Pushes to `master` are deployed automatically to GitHub Pages via GitHub Actions (`.github/workflows/static.yml`).

## Tech notes

- Fonts: [Inter](https://fonts.google.com/specimen/Inter) and [Orbitron](https://fonts.google.com/specimen/Orbitron) via Google Fonts
- Team colors: purple accent palette (`#7B2FBE` → `#a855f7`) on a dark background
- No dependencies, frameworks, or package manager — edit the HTML/CSS/JS and push
