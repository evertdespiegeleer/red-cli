#!/usr/bin/env bash

set -e

# Run the `bun task build` command for all platforms using the `--target` flag
PLATFORMS=(
    # "bun-linux-x64" # Currently not supported due to opentui limitations
    "bun-linux-arm64"
    "bun-windows-x64"
    "bun-darwin-x64"
    "bun-darwin-arm64"
)

for PLATFORM in "${PLATFORMS[@]}"; do
    echo "Building for platform: $PLATFORM"
    bun run build --target "$PLATFORM" --outfile "dist/bin/$PLATFORM"
done