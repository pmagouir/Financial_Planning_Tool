#!/usr/bin/env bash
# PostToolUse hook entry point for finplan studio verification.
# Claude Code passes the tool invocation as JSON on stdin.
# We extract file_path and hand off to check_gates.sh.

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

JSON="$(cat)"

FILE_PATH="$(
  /usr/bin/python3 -c '
import sys, json
try:
    d = json.loads(sys.stdin.read())
except Exception:
    sys.exit(0)
ti = d.get("tool_input") or d
print(ti.get("file_path", ""))
' <<< "$JSON"
)"

exec bash "$SCRIPT_DIR/check_gates.sh" "$FILE_PATH"
