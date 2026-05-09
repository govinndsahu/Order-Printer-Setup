#!/usr/bin/env sh

# Start the app using the bundled Node.js runtime directly.
# This avoids depending on shell activation or system npm/node.

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
RUNTIME_DIR="$SCRIPT_DIR/runtime-environments"

export PRINTER_PYTHON_CMD="$RUNTIME_DIR/python/python"

exec "$RUNTIME_DIR/nodejs/node" --watch "$SCRIPT_DIR/app.js"
