# GitHub Pages deployment

Finance Atlas is a static React website. GitHub Actions builds it and publishes only `dist/client`. No server, database, credentials, or paid hosting is required for this version.

## Repository setup

1. Create a public GitHub repository named `FinanceMap`, initialized with a README, and use `main` as its default branch.
2. Add this project's contents to the repository root, including `.github/workflows/deploy-pages.yml`, `package-lock.json`, the `content`, `src`, `scripts`, `tests`, `worker`, `.openai`, and `public` directories. Do not upload the ZIP as a single file. Generated output and dependencies are excluded by `.gitignore`.
3. In **Settings → Pages → Build and deployment**, choose **GitHub Actions** as the source.
4. Push to `main` or run **Actions → Deploy Finance Atlas to GitHub Pages → Run workflow**. The deployment job supplies the actual site URL.

For `mba25raj-art/FinanceMap`, the expected URL is `https://mba25raj-art.github.io/FinanceMap/` after deployment succeeds. It is not live merely because the files have been prepared.

## How it works

The workflow determines the repository URL prefix automatically and passes it to Vite through `GITHUB_PAGES_BASE`. Bundled assets and document downloads respect that prefix. Hash navigation lets topic links load directly without a server rewrite. Each push to `main` rebuilds and runs the content and packaging checks before publishing.

The existing optional Sites worker packaging remains available. GitHub Pages does not execute that worker. Learning progress remains session-only, as in the current prototype.

## Local build

```sh
npm ci
npm run build
npm run test:content
npm run test:sites
```

For a project-path build, set `GITHUB_PAGES_BASE=/FinanceMap/` when running the build. Local development defaults to `/`.
