# Takya | iOS & Android application

React native application that let's Ecuadorian users request information about public transport to validate the integrity of the service adding an extra layer of protection.

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
