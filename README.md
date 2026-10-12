# APP UI Prototype Starter

Static shell for high-density app prototypes: HTML partials, Tailwind from the CDN, and vanilla JavaScript. There is no backend. Clone this repo, or create a new repository from the GitHub template, for each project.

Agent behavior for follow-on work lives in [`.cursorrules`](.cursorrules).

## Start a new project

From GitHub, open this repository and choose **Use this template**, or:

```bash
gh repo create my-app --template dhirimetaa/ui-agent-builder --private --clone
cd my-app
npm start
```

`npm start` serves the folder at [http://localhost:4173](http://localhost:4173). Partials are loaded with `fetch`, so opening `index.html` as a file will not work.

## Layout

```text
index.html                  Shell mounts
assets/css/custom.css       Scrollbars, transitions
assets/js/app.js            Loader, theme, menus, view behavior
assets/js/mock-data.js      Tables, metrics, notifications
components/                 Sidebar, topbar, modal
views/                      Dashboard, inventory, finance, people
```

Add a screen under `views/<feature>/<name>.html`, then register it with a `data-view` button in `components/sidebar.html`.
