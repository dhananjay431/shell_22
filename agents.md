# Angular Microfrontend Workspace Instructions

This repository contains an Angular 22+ shell and Native Federation remotes.

- `shell`: host application on port 4200
- `mfe1`: remote application on port 4201

Use standalone, zoneless, strict TypeScript, SCSS, Angular Router, and Native
Federation. The shell must load remotes dynamically and must not statically
import remote application code.

The local shell manifest is `projects/shell/public/federation.manifest.json`.
Remote URLs must be replaced per environment and production origins must use
HTTPS and appropriate Content Security Policy settings.

Remote applications should be independently buildable and deployable, expose
only intentional public components, and avoid shell implementation details.
Keep shared Angular dependencies singleton and version-compatible.

Commands:

```bash
npm install
npx ng serve mfe1
npx ng serve shell
npx ng build mfe1
npx ng build shell
npm test
```

Before submitting changes, format, lint, test, build both applications, verify
`http://localhost:4200/mfe1`, and ensure the shell has a user-friendly failure
path when a remote is unavailable.
