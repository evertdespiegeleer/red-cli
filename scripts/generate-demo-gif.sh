#!/usr/bin/env bash

# Script to generate a demo GIF for the Red TUI Redis client
# Uses asciinema to record terminal session and agg to convert to GIF

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
CAST_FILE="./docs/readme-assets/demo.cast"
GIF_FILE="./docs/readme-assets/demo.gif"
TEMP_CAST_FILE="/tmp/red-demo-$$.cast"

echo -e "${GREEN}Red Demo GIF Generator${NC}"
echo "======================================"
echo ""

# Check for required dependencies
check_dependencies() {
    local missing_deps=()

    if ! command -v asciinema &> /dev/null; then
        missing_deps+=("asciinema")
    fi

    if ! command -v agg &> /dev/null; then
        missing_deps+=("agg")
    fi

    if [ ${#missing_deps[@]} -ne 0 ]; then
        echo -e "${RED}Error: Missing required dependencies:${NC}"
        for dep in "${missing_deps[@]}"; do
            echo "  - $dep"
        done
        echo ""
        echo "Installation instructions:"
        echo "  asciinema: brew install asciinema  (or see https://asciinema.org/docs/installation)"
        echo "  agg:       cargo install agg       (or see https://github.com/asciinema/agg)"
        echo ""
        exit 1
    fi
}

# Build the project
build_project() {
    echo -e "${YELLOW}Building project...${NC}"
    bun build --compile ./src/main.ts --outfile ./dist/bin/red
    echo -e "${GREEN}Build complete!${NC}"
    echo ""
}

# Record the demo
record_demo() {
    echo -e "${YELLOW}Starting asciinema recording...${NC}"
    echo ""
    echo "Instructions:"
    echo "  1. The recording will start when you press ENTER"
    echo "  2. Perform your demo actions in the Red TUI"
    echo "  3. Press CTRL+D or type 'exit' when done"
    echo ""
    echo "Tips for a good demo:"
    echo "  - Navigate through different key groups"
    echo "  - Open a key to show its details"
    echo "  - Use search functionality"
    echo "  - Show keyboard shortcuts (press '?')"
    echo "  - Keep it under 60 seconds for file size"
    echo ""
    read -p "Press ENTER to start recording..."

    # Record with asciinema
    asciinema rec "$TEMP_CAST_FILE" --command "./dist/bin/red" --overwrite

    echo ""
    echo -e "${GREEN}Recording saved!${NC}"
}

# Convert to GIF
convert_to_gif() {
    echo ""
    echo -e "${YELLOW}Converting to GIF...${NC}"

    # Use agg to convert .cast to .gif
    # Options:
    #   --cols: terminal width (columns)
    #   --rows: terminal height (rows)
    #   --font-size: font size for rendering
    #   --speed: playback speed multiplier (1.0 = normal, 2.0 = 2x speed)
    #   --fps-cap: max frames per second
    agg \
        --font-size 14 \
        --speed 1.0 \
        --fps-cap 30 \
        "$TEMP_CAST_FILE" \
        "$GIF_FILE"

    # Copy cast file for potential future use
    cp "$TEMP_CAST_FILE" "$CAST_FILE"

    echo -e "${GREEN}GIF generated successfully!${NC}"
    echo "  Output: $GIF_FILE"
    echo "  Cast file saved: $CAST_FILE"
}

# Cleanup
cleanup() {
    if [ -f "$TEMP_CAST_FILE" ]; then
        rm "$TEMP_CAST_FILE"
    fi
}

# Main execution
main() {
    check_dependencies
    build_project
    record_demo
    convert_to_gif
    cleanup

    echo ""
    echo -e "${GREEN}Done!${NC} Your demo GIF is ready at: $GIF_FILE"

    # Show file size
    size=$(du -h "$GIF_FILE" | cut -f1)
    echo "File size: $size"

    echo ""
    echo "To preview the GIF:"
    echo "  - macOS: open $GIF_FILE"
    echo "  - Linux: xdg-open $GIF_FILE"
}

# Handle interrupts
trap cleanup EXIT INT TERM

main
