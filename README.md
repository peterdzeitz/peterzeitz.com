# Peter Zeitz Portfolio

Personal portfolio site for Peter Zeitz, hosted at [peterzeitz.com](https://peterzeitz.com).

---

## Prerequisites

You need two things installed on your computer:

1. **Git** — to download the code and push changes ([install guide](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git))
2. **Node.js** — to run the local helper server ([download here](https://nodejs.org/) — pick the LTS version)

To check if you already have them, open **Terminal** (on Mac, search "Terminal" in Spotlight) and run:

```
git --version
node --version
```

If both print a version number, you're good.

---

## Getting Started

### 1. Clone the repo (first time only)

```
git clone https://github.com/peterzeitz/peterzeitz.com.git
cd peterzeitz.com
```

### 2. Start the local servers

You need **two Terminal windows** (or tabs). In both, make sure you're inside the project folder (`cd peterzeitz.com`).

**Terminal 1 — Start the website:**

```
cd PZ_Web_Portfolio
python3 -m http.server 8000
```

**Terminal 2 — Start the save-order server** (needed for drag-and-drop reordering):

```
node PZ_Web_Portfolio/save-order.js
```

### 3. View the site

Open your browser to **http://localhost:8000**

---

## Project Structure

```
PZ_Web_Portfolio/
├── index.html              ← Homepage
├── css/styles.css          ← All styles
├── js/main.js              ← All JavaScript
├── data/projects.json      ← Project data (order, titles, images)
├── save-order.js           ← Local server for drag-and-drop reordering
├── favicon.png
├── CNAME                   ← Custom domain config (don't edit)
└── projects/
    ├── avalanche/
    │   ├── index.html      ← Project page (same template for all projects)
    │   ├── thumbnail.png   ← Thumbnail shown on homepage grid
    │   └── image1.png      ← Gallery images
    ├── vimeo/
    │   ├── index.html
    │   └── ...
    └── ...
```

The key file is **`data/projects.json`** — it controls which projects appear, their order, titles, descriptions, and which images show up in each gallery.

---

## How to Add a New Project

### 1. Create the project folder

Inside `PZ_Web_Portfolio/projects/`, create a new folder. Use a simple lowercase name with dashes (no spaces):

```
PZ_Web_Portfolio/projects/my-new-project/
```

### 2. Add your images

Drop all your images (thumbnail + gallery images) into that folder. Any format works (PNG, JPG, GIF, WebP).

### 3. Create the project page

Copy `index.html` from any existing project folder (e.g., `projects/avalanche/index.html`) into your new folder. Open it and change **one thing** — the `data-project` attribute on line 22:

```html
<main data-project="my-new-project">
```

This must match your folder name exactly.

### 4. Add the project to projects.json

Open `PZ_Web_Portfolio/data/projects.json` and add a new entry to the `"projects"` array. Here's the format:

```json
{
  "id": "my-new-project",
  "title": "My New Project",
  "date": "2026",
  "category": "Branding",
  "description": "A short description of the project.",
  "thumbnail": "cover-image.png",
  "images": [
    "image1.png",
    "image2.jpg",
    "image3.gif"
  ]
}
```

- **`id`** — Must match the folder name exactly
- **`title`** — Display name shown on the site
- **`date`** — Year or date range (e.g., "2024" or "2018-2019")
- **`category`** — e.g., "Branding", "Digital", "Editorial", "Event Design"
- **`description`** — Short blurb shown on the project page
- **`thumbnail`** — Filename of the image used on the homepage grid
- **`images`** — List of filenames for the project gallery (in display order)

The project's position in the array controls its order on the homepage (first = top-left).

### 5. Refresh localhost:8000

Your new project should appear on the homepage.

---

## How to Add or Remove Images from an Existing Project

### Adding images

1. Drop the new image file into the project's folder (e.g., `projects/avalanche/`)
2. Open `data/projects.json`, find the project, and add the filename to the `"images"` array

### Removing images

1. Open `data/projects.json`, find the project, and remove the filename from the `"images"` array
2. Optionally delete the image file from the project folder

### Reordering images (drag-and-drop)

When viewing the site on **localhost**, an **"Edit Order"** button appears on both the homepage and project pages. Click it to enter edit mode where you can:

- **Drag and drop** to reorder images or project cards
- **Click the X** to remove an image or project
- **Save Order** to write the new order back to `projects.json`
- **Cancel** to discard changes

This only works locally (it won't appear on the live site).

---

## How to Remove a Project

1. Delete the project's entry from `data/projects.json`
2. Optionally delete the project's folder from `projects/`

---

## Pushing Changes to the Live Site

When you're happy with your changes locally, push them to GitHub and the site will automatically deploy.

```bash
# 1. See what's changed
git status

# 2. Stage your changes (replace the paths with your actual changed files/folders)
git add PZ_Web_Portfolio/data/projects.json
git add PZ_Web_Portfolio/projects/my-new-project/

# 3. Commit with a short message describing what you did
git commit -m "Add my new project"

# 4. Push to GitHub — this triggers an automatic deploy
git push
```

The site usually updates within a minute or two. You can check the deploy status at:
https://github.com/peterzeitz/peterzeitz.com/actions

### Pulling latest changes

If someone else made changes (or you're working from a different computer), pull first:

```
git pull
```

---

## Editing Styles

All styles live in `PZ_Web_Portfolio/css/styles.css`. Edit this file and refresh localhost:8000 to see changes.

## Editing Page Content

- **Homepage text/layout**: `PZ_Web_Portfolio/index.html`
- **Project page template**: Each project has its own `index.html` but they all share the same structure — the content is loaded dynamically from `projects.json`

---

## Deployment

The site is deployed automatically via GitHub Actions. Every push to the `master` branch triggers a deploy to GitHub Pages. The workflow config is in `.github/workflows/deploy.yml` — you shouldn't need to touch it.
