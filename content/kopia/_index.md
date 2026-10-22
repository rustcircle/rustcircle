---
title: "Kopia Backup"
subtitle: "Encrypted backups of my computers to Google Drive with Kopia and rclone"
layout: "page"
---

**rustcircle Kopia Backup** is the name of my Google Cloud OAuth app. It lets
two open-source tools, [Kopia](https://kopia.io/) and
[rclone](https://rclone.org/), store encrypted backups of my own computers on
my own Google Drive. It is a personal setup, not a public service.

## How it works

1. **Kopia** takes snapshots of my folders. It splits files into chunks,
   removes duplicates, compresses them and **encrypts everything on my
   computer** with a password only I know.
2. **rclone** connects Kopia to Google Drive. Kopia's rclone backend runs
   rclone, which uploads and downloads the encrypted chunks through the Google
   Drive API.
3. **This app** is the OAuth client that rclone uses to sign in to Google
   Drive. With my own client ID I don't hit the shared rate limits of rclone's
   default client, and the Google consent screen shows a clear name.

```text
my files ──► Kopia (dedupe, compress, encrypt) ──► rclone ──► Google Drive
```

## What the app can and cannot do

- It can create, read, update and delete the backup files in the backup folder
  on my Drive.
- It cannot read the contents of the backups without the Kopia repository
  password, which never leaves my computer.
- It does not touch Gmail, Contacts, Calendar or any other Google service.
- No data passes through rustcircle.com or any other server of mine.

## Setup in short

```sh
# 1. Create an rclone remote with my own OAuth client ID and secret
rclone config            # type: drive, client_id/client_secret from Google Cloud

# 2. Create a Kopia repository on that remote
kopia repository create rclone --remote-path=gdrive:kopia

# 3. Back up and set retention
kopia snapshot create ~/
kopia policy set --global --keep-daily 14 --keep-monthly 12
```

Restores use `kopia snapshot restore` or `kopia mount` to browse a snapshot as
a folder.

## Policies

- [Privacy Policy](/kopia/privacy/)
- [Terms of Service](/kopia/terms/)

Contact: [pmrj@rustcircle.com](mailto:pmrj@rustcircle.com)
