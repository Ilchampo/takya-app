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

Set `EXPO_PUBLIC_SRI_URL`, `EXPO_PUBLIC_FISCALIA_LOOKUP_URL`, and `EXPO_PUBLIC_FISCALIA_ENTRY_URL`
as EAS environment variables or secrets before running `eas build`. Native versioning uses
`ios.buildNumber` and `android.versionCode` in `app.json`; production builds auto-increment those
values locally.
