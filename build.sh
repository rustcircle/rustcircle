#!/usr/bin/env bash
# Cloudflare Pages build script: installs a pinned Hugo version and builds the site.
# Set the Pages build command to:  bash build.sh
set -euo pipefail

HUGO_VERSION="${HUGO_VERSION:-0.167.0}"   # dashboard variable overrides this default

echo "Installing Hugo extended v${HUGO_VERSION}"
curl -fsSL "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz" \
  | tar -xz hugo

./hugo version

# Preview branches get their own *.pages.dev URL as baseURL;
# production uses the baseURL from hugo.toml.
if [[ "${CF_PAGES_BRANCH:-}" != "main" && -n "${CF_PAGES_URL:-}" ]]; then
  ./hugo --gc --minify --baseURL "${CF_PAGES_URL}/"
else
  ./hugo --gc --minify
fi
