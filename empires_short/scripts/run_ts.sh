#!/bin/bash
# Bundle a TS entry (episodes import JSON + TS) with the repo's esbuild and run it with node. Usage: run_ts.sh <entry.ts> [args...]
set -e
cd "$(dirname "$0")/.."
entry=$1; shift
out=$(mktemp -d)/run.cjs
node_modules/.bin/esbuild "$entry" --bundle --platform=node --format=cjs --log-level=warning --outfile="$out" --define:__dirname="\"$PWD/scripts\""
node "$out" "$@"
