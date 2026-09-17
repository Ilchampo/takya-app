# Takya | iOS & Android application

[![CI](https://github.com/Ilchampo/takya-app/actions/workflows/ci.yml/badge.svg)](https://github.com/Ilchampo/takya-app/actions/workflows/ci.yml)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

React Native application that lets Ecuadorian users request information about
public transport to validate the integrity of the service, adding an extra layer
of protection.

Takya is not an official Government of Ecuador application.

## Getting started

You need [Node.js](https://nodejs.org/) 22.13 or newer. See [CONTRIBUTING.md](CONTRIBUTING.md)
for the full setup guide.

```sh
git clone https://github.com/Ilchampo/takya-app.git
cd takya-app
cp .env.example .env
npm ci
npm start
```

Then open the project in Expo Go or an iOS/Android simulator.

## Visual development

Run `npm run preview:ui` to inspect the actual screen components in a local browser at
`http://127.0.0.1:4173`. The preview uses synthetic fixtures, makes no government requests,
and never reads device history. It covers both themes, 320–430 px widths, saved queries,
loading, partial failures, records, privacy, and splash/error screens. Browser rendering is
a visual aid; verify keyboards, screen readers, and native text scaling on iOS and Android.

The native logo paths and splash images derive from `assets/takya-full-logo.svg`.
Run `node scripts/generate-logo.mjs` with Inkscape installed, then run the two printed
`rsvg-convert` commands to regenerate splash PNGs. The outlined wordmark loads without
a font dependency; the app recolors the dark artwork for each theme.

## Security and data handling

Takya queries public government sources directly from the user's device. Version 1.0.0 does not
send analytics, crash reports, or other telemetry to Takya-controlled services.

If telemetry is introduced later, events must use an explicit field allowlist. License plates,
names, identity documents, incident payloads, endpoint query strings, and cached responses must
never be included in telemetry or logs.

Only the fields required by the current user interface may be retained locally. Cached lookup data
expires automatically and can be deleted at any time from the application.

To report a vulnerability, see [SECURITY.md](SECURITY.md). Do not file a public issue.

## Store builds

`eas.json` injects the official SRI and Fiscalía HTTPS endpoints, plus app defaults including
`EXPO_PUBLIC_APP_INCIDENT_MONTHS`. Native versioning is stored remotely by EAS
(`appVersionSource: "remote"`). Production builds auto-increment `ios.buildNumber` and
`android.versionCode` on Expo's servers, so those values do not need to be committed after each
upload.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) and the
[Code of Conduct](CODE_OF_CONDUCT.md) before opening an issue or pull request.

By contributing, you agree that your work is licensed under GPL-3.0.

## License

Takya is licensed under the [GNU General Public License v3.0](LICENSE).

## Legal

- [Privacy Policy](.github/PRIVACY_POLICY.md)
- [Terms of Service](.github/TERMS_OF_SERVICE.md)
