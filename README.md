# Takya | iOS & Android application

React native application that let's Ecuadorian users request information about public transport to validate the integrity of the service adding an extra layer of protection.

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

## Store builds

`eas.json` injects the official SRI and Fiscalía HTTPS endpoints, plus app defaults including
`EXPO_PUBLIC_APP_INCIDENT_MONTHS`. Native versioning is stored remotely by EAS
(`appVersionSource: "remote"`). Production builds auto-increment `ios.buildNumber` and
`android.versionCode` on Expo's servers, so those values do not need to be committed after each
upload.
