# Annuity Loan Calculator

This repository contains a static, German-language annuity loan calculator. All calculations run in the browser without runtime dependencies or a build step. The repository includes automated quality checks and a GitHub Pages deployment workflow.

## Status

- Production calculation logic runs entirely in the browser
- No runtime or development dependencies beyond Node.js for tests and syntax checks
- Automated checks use the built-in Node.js test runner
- GitHub Actions workflows support quality checks and GitHub Pages deployment
- The site is served directly from `index.html` and `assets/`; no bundling is required

## Features

- Monthly payment, remaining balance, repayment term, and interest costs
- Annual extra repayments and optional suspension periods
- Follow-up financing after the fixed-rate period
- Yearly and monthly schedules, a balance chart, and a print view
- Responsive layout and accessible control labels
- Validation of critical inputs with clear user-facing messages

## Quick start

Requires Node.js 20 or newer.

```sh
npm ci
npm run check
```

`npm run check` validates the browser JavaScript syntax and runs the test suite. Tests cover standard amortization, zero-interest loans, extra repayments, follow-up financing, and duration formatting.

## Run locally

Serve the ES modules through a local HTTP server. Any static web server will work; for example:

```sh
python -m http.server 8000
```

Then open `http://localhost:8000` in a browser. No build step is required.

## Deployment

The workflow in `.github/workflows/pages.yml` deploys the site to GitHub Pages on pushes to `main`. It can also be started manually through GitHub Actions.

To configure GitHub Pages:

1. In the repository settings, set the Pages source to **GitHub Actions**.
2. Pushes to `main` run the quality checks before deployment.
3. GitHub Pages publishes the site at the repository's Pages URL.

## Calculation model and limitations

Calculations are performed monthly and rounded to cents. Extra repayments are applied once per year after the regular monthly payment; suspension periods use calendar years. When follow-up financing is enabled, the new payment is based on the remaining balance and the follow-up terms.

The result is a simplified estimate, not financial or investment advice. Fees, alternative payment dates, contractual rounding rules, and other individual loan terms may change the result. Confirm binding figures with the lender.

## Project structure

```text
.github/
  workflows/
    quality.yml
    pages.yml
assets/
  css/styles.css
  js/app.js
  js/loan-calculator.js
index.html
tests/
  loan-calculator.test.js
.gitignore
package.json
README.md
```

## Quality checks

The repository is configured for static hosting and automated checks. The workflows and test suite are maintained alongside the application.
