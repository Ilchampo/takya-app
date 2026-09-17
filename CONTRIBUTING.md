# Contributing to Takya

Thanks for your interest in contributing. Takya is a React Native / Expo app
that helps people in Ecuador look up public transport vehicle information from
official government sources.

By participating, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## License of contributions

Takya is licensed under the [GNU General Public License v3.0](LICENSE).

By submitting a pull request or other contribution, you agree that your work is
licensed under GPL-3.0, and that you have the right to offer it under that
license.

## How to contribute

- **Bug reports** and **feature ideas**: open an issue with the templates.
- **Code and docs**: fork the repository, make a focused branch, and open a pull
  request against `main`.
- **Security issues**: follow [SECURITY.md](SECURITY.md). Do not file a public
  issue.

Please keep pull requests small and easy to review. One change per PR is better
than a mixed refactor.

## Development setup

### Requirements

- Node.js 22.13 or newer (see `.nvmrc`)
- npm 10 or newer (comes with current Node.js)
- Git
- [Expo Go](https://expo.dev/go) or an iOS/Android simulator for running the app
- [Maestro](https://maestro.dev) only if you run end-to-end tests locally

### Install

```sh
git clone https://github.com/YOUR_USERNAME/takya-app.git
cd takya-app
cp .env.example .env
npm ci
```

`.env` is gitignored. Do not commit secrets or local overrides.

The committed `.env.example` and `.env.test` values are public government
endpoints and app defaults. Debug lookups are enabled in `.env.example`.

### Run the app

```sh
npm start
```

Then press `i` for iOS, `a` for Android, or scan the QR code with Expo Go.

```sh
npm run ios
npm run android
```

## Project scripts

| Command                | What it does                                     |
| ---------------------- | ------------------------------------------------ |
| `npm start`            | Start the Expo development server                |
| `npm test`             | Run unit tests                                   |
| `npm run test:e2e`     | Run Maestro end-to-end tests (not run in CI)     |
| `npm run typecheck`    | TypeScript `--noEmit`                            |
| `npm run lint`         | ESLint                                           |
| `npm run lint:fix`     | ESLint with `--fix`                              |
| `npm run format`       | Prettier write                                   |
| `npm run format:check` | Prettier check (CI)                              |
| `npm run verify`       | Typecheck, format, and lint                      |
| `npm run ci`           | Same checks GitHub Actions runs on pull requests |

A Husky pre-commit hook runs lint-staged and unit tests. If a hook fails, fix
the reported files before committing.

## Tests

Unit tests live in `__tests__/unit` and run in CI. They use Jest and
`jest-expo`. Debug fixtures `ABC-1111` through `ABC-5555` cover lookup states
without calling government services when `EXPO_PUBLIC_APP_DEBUG=true`.

End-to-end tests live in `__tests__/e2e` and target the native app
(`com.astrobit.takya`) with Maestro. They are optional for most contributions.
Build or start the app with `EXPO_PUBLIC_APP_DEBUG=true` (EAS profile
`e2e-test`) before running them.

When you change behavior, add or update unit tests. Do not put real license
plates, names, identity documents, or incident records in tests, fixtures,
screenshots, or logs.

## Style and structure

- TypeScript is strict (`strict` and `noUncheckedIndexedAccess`).
- Prettier and ESLint are the source of truth. VS Code recommendations are in
  `.vscode/extension.json`.
- Keep components, hooks, and services in their existing folders under `src/`.
- Follow the privacy rules in the README: no analytics, no logging of plates,
  names, identity documents, incident payloads, query strings, or cached
  responses.

Suggested branch names, matching this repository:

- `feature/` for new behavior
- `fix/` for bug fixes
- `impr/` or `imprv/` for improvements
- `docs/` for documentation-only changes

## Pull requests

1. Fork the repo and create a branch from `main`.
2. Make your change with tests when behavior changes.
3. Run `npm run ci` locally.
4. Open a pull request using the template.
5. Wait for the `quality` GitHub Actions check to pass.

Maintainers can merge passing pull requests without a second review.

Please do not include:

- Secrets, `.env` files, or EAS credentials
- Generated `android/` or `ios/` native projects
- Unrelated refactors or dependency bumps

Production store builds (`eas.json` production profile) are maintained by the
project maintainers. Contributors should not need Expo production credentials.

## Questions

Use GitHub issues for bugs and features. For a suspected vulnerability, use
[private reporting](https://github.com/Ilchampo/takya-app/security/advisories/new)
or email pablo@goastrobit.com.
