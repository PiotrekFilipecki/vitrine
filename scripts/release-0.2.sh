#!/usr/bin/env bash
# VITRINE 0.2.0 · the steps that need Piotrek's own logins (Q1, 03.11.2026). Run in Terminal.app, not through `!` in
# Claude Code (gh, npm and shopify open a browser or ask for a code). Each step stops on error; re-running is safe:
# pushes are idempotent, the Pages call tolerates "already enabled", npm refuses a second publish of 0.2.0.
# Usage: bash scripts/release-0.2.sh
set -euo pipefail
cd "$(dirname "$0")/.."
REPO=PiotrekFilipecki/vitrine
step() { printf '\n\033[1m== %s\033[0m\n' "$1"; }

step "1/8 GitHub: add the 'workflow' scope (the repo has .github/workflows/pages.yml), then push"
gh auth refresh -h github.com -s workflow
git push origin main q0-blokery r0-kierunek q1-trzy-efekty v0.2.0

step "2/8 GitHub: make the repo public"
gh repo edit "$REPO" --visibility public --accept-visibility-change-consequences

step "3/8 GitHub Pages: source = GitHub Actions, run the workflow"
gh api -X POST "repos/$REPO/pages" -f build_type=workflow >/dev/null 2>&1 ||
  gh api -X PUT "repos/$REPO/pages" -f build_type=workflow >/dev/null
gh workflow run pages.yml --ref main
sleep 5
gh run watch "$(gh run list --workflow pages.yml --limit 1 --json databaseId -q '.[0].databaseId')" --exit-status
echo "Static demo: https://piotrekfilipecki.github.io/vitrine/examples/static/"

step "4/8 GitHub release v0.2.0 with the theme zip"
pnpm install --frozen-lockfile
pnpm build
pnpm pack:theme
gh release create v0.2.0 release/vitrine-shopify-theme-0.2.0.zip --title "VITRINE 0.2.0" \
  --notes "Glass card, pre-order glass, loupe (ADR-0003). See CHANGELOG.md." || echo "(release exists, skipped)"

step "5/8 Vercel: production deploy of the headless Store (project 'vitrine', root examples/next-headless)"
vercel deploy --prod --yes

step "6/8 npm: publish vitrine-shaders 0.2.0 (with the vitrine-shaders/react subpath)"
npm whoami >/dev/null 2>&1 || npm login
(cd packages/element && npm publish --dry-run && npm publish)

step "7/8 Shopify dev store niwwts: push the v0.2 test theme (unpublished theme 193335820605)"
shopify theme push --store niwwts.myshopify.com --path examples/theme-test/live --theme 193335820605 --nodelete
echo "Preview: https://niwwts.myshopify.com?preview_theme_id=193335820605"
echo "Pre-order frost on the store: Settings → Custom data → Products → add custom.release_date (Date), fill one product."

step "8/8 Firefox (does not start inside the Claude Code sandbox)"
pnpm exec playwright test --project=firefox

printf '\n\033[1mDone.\033[0m Gate on the phone: the static demo URL above and https://vitrine-hazel-three.vercel.app/\n'
