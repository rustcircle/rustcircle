# rustcircle.com — Hugo blog.
# Posts live in content/posts/NNNNN-title/ (or NNNNN_title/): one index.md + assets/.
# Zero-padded numbers (00001 … 99999) sort the same alphabetically and numerically.

HUGO    ?= $(if $(wildcard node_modules/.bin/hugo),node_modules/.bin/hugo,hugo)
NODE    ?= node
PUBLIC  := public
PORT    ?= 1313

.DEFAULT_GOAL := build
.PHONY: help install build dev drafts preview check typecheck new clean distclean \
        assets icons fonts size

help: ## list targets
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  make %-10s %s\n", $$1, $$2}'

node_modules: package.json package-lock.json
	NODE_USE_ENV_PROXY=1 npm ci --no-audit --no-fund
	@touch $@

install: node_modules ## install pinned tools (Hugo extended, TypeScript, fonts)

build: node_modules check ## production site in public/ (minified, fingerprinted)
	$(HUGO) build --gc --minify --cleanDestinationDir --environment production
	@$(MAKE) --no-print-directory size

dev: node_modules ## live-reload server with drafts on http://localhost:$(PORT)
	$(HUGO) server --buildDrafts --buildFuture --disableFastRender --port $(PORT) --bind 127.0.0.1

drafts: node_modules ## build including drafts into public/ (for local review)
	$(HUGO) build --gc --buildDrafts --buildFuture --cleanDestinationDir

preview: build ## serve the production build from public/
	$(HUGO) server --environment production --renderToMemory=false --disableLiveReload --port $(PORT) --bind 127.0.0.1

check: node_modules typecheck ## validate post folders, file names and front matter
	$(NODE) scripts/check.ts

typecheck: node_modules ## TypeScript type check (no emit; Hugo/esbuild bundles)
	node_modules/.bin/tsc --noEmit -p tsconfig.json

new: node_modules ## new post: make new TITLE="Título" [SUBTITLE="…"] [SEP=_]
	@TITLE="$(TITLE)" SUBTITLE="$(SUBTITLE)" SEP="$(SEP)" HUGO="$(HUGO)" $(NODE) scripts/new-post.ts

assets: icons fonts ## regenerate icons, avatar and subset fonts

icons: ## favicons + avatar from imgs/icons.png and imgs/profile.png
	scripts/icons.sh

fonts: node_modules ## subset the OFL fonts into assets/fonts (needs uv)
	scripts/fonts.sh

size: ## size report of the built site (raw and gzip)
	@test -d $(PUBLIC) || { echo "no $(PUBLIC)/ — run make build"; exit 1; }
	@printf "%-44s %8s %8s\n" file bytes gzip
	@cd $(PUBLIC) && find . -type f \( -name '*.css' -o -name '*.js' -o -path './index.html' -o -name '*.woff2' -o -name '*.webp' -o -name '*.png' -o -name '*.ico' \) | sort | while read -r f; do \
	  printf "%-44s %8d %8d\n" "$$f" "$$(wc -c < "$$f")" "$$(gzip -9c "$$f" | wc -c)"; done
	@printf "total public/: %s\n" "$$(du -sh $(PUBLIC) | cut -f1)"

clean: ## remove build output
	rm -rf $(PUBLIC) resources/_gen .hugo_build.lock

distclean: clean ## also remove node_modules
	rm -rf node_modules
