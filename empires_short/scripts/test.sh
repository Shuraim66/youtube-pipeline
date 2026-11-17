#!/bin/bash
# Typecheck, then bundle tests/*.test.ts with the repo's esbuild and run them with node:test.
set -e
cd "$(dirname "$0")/.."
node_modules/.bin/tsc --noEmit
out=$(mktemp -d)
for f in tests/*.test.ts; do
  node_modules/.bin/esbuild "$f" --bundle --platform=node --format=cjs --log-level=warning --outfile="$out/$(basename "$f" .ts).cjs" --define:__dirname="\"$PWD/tests\""
done
node --test "$out"/*.cjs
