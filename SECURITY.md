# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 1.0.x   | Yes       |

Takya is a client-side Expo app. Security issues in dependencies, local storage,
network handling, or privacy controls are in scope even when they do not require
a remote Takya server.

## Reporting a vulnerability

**Do not file a public GitHub issue for security reports.**

Please report vulnerabilities through
[GitHub private vulnerability reporting](https://github.com/Ilchampo/takya-app/security/advisories/new).
You can also email **pablo@goastrobit.com**.

Include as much of the following as you can:

- A description of the issue and its impact
- Steps to reproduce, or a proof of concept
- Affected version, commit, or release
- Whether the issue involves personal data, license plates, identity documents,
  or government query payloads

## What to expect

- We will acknowledge reports as soon as we can, typically within 7 days.
- We will keep you informed while we investigate and prepare a fix.
- We will credit you in the advisory if you want to be named.

Please give us a reasonable window to patch and publish an advisory before
discussing the issue in public.

## Data handling notes

Takya queries public government sources from the user's device. Do not include
real license plates, names, identity documents, incident payloads, endpoint
query strings, or cached responses in public issues, pull requests, logs, or
tests. Use the debug fixtures (`ABC-1111` through `ABC-5555`) when a plate is
needed.
