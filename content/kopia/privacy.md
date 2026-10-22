---
title: "Kopia Backup — Privacy Policy"
subtitle: "Privacy policy for the rustcircle Kopia backup app on Google Drive"
url: "/kopia/privacy/"
---

_Last updated: 22 October 2026_

This policy covers **rustcircle Kopia Backup** ("the app"), a Google Cloud
OAuth client used by [Kopia](https://kopia.io/) and [rclone](https://rclone.org/)
to store encrypted backups on Google Drive. The app is operated by
**Pedro Jorge** ([pmrj@rustcircle.com](mailto:pmrj@rustcircle.com)).

## Who uses the app

The app is for my own personal use: it backs up my own computers to my own
Google Drive. It is not offered to the public and has no other users.

## What Google user data the app accesses

When authorised, the app requests access to Google Drive (only the files and
folders it creates, or the scopes shown on the Google consent screen) so that
it can:

- upload, list, read, update and delete backup files in the backup folder;
- read basic account information needed by Google sign-in to complete the
  OAuth flow.

The app does not access Gmail, Contacts, Calendar or any other Google service.

## How the data is used

Google user data is used **only** to store, verify and restore my own backups.
Backup contents are encrypted on my computer by Kopia before they are uploaded,
so the files stored on Google Drive are not readable without my repository
password.

## Storage and sharing

- OAuth tokens are stored locally on my own machines in the rclone/Kopia
  configuration files and are never sent anywhere except to Google.
- No data is sent to rustcircle.com, to any server I run, or to any third
  party.
- No data is sold, used for advertising, used to train AI or machine-learning
  models, or transferred to anyone.

The app's use of information received from Google APIs adheres to the
[Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy),
including the Limited Use requirements.

## Retention and deletion

Backups stay on Google Drive until they are deleted by Kopia's retention
policy or by me. Access can be revoked at any time at
[myaccount.google.com/permissions](https://myaccount.google.com/permissions);
deleting the local configuration removes the stored tokens.

## Changes

Changes to this policy are published on this page with a new date.

## Contact

Questions: [pmrj@rustcircle.com](mailto:pmrj@rustcircle.com).
