#!/usr/bin/env bash
# UserPromptSubmit priming hook for the finplan studio self-improvement loop.
# When the prompt references studio work, inject the .learn/errors.md "Open Patterns"
# so no agent starts without seeing the past defects.

set -u

JSON="$(cat)"

PROMPT="$(
  /usr/bin/python3 -c '
import sys, json
try:
    d = json.loads(sys.stdin.read())
except Exception:
    sys.exit(0)
print(d.get("prompt", ""))
' <<< "$JSON"
)"

if [[ -z "$PROMPT" ]]; then
  exit 0
fi

LOWER="$(echo "$PROMPT" | tr "[:upper:]" "[:lower:]")"

# Generous matcher — false positives only add helpful context.
FINPLAN_KEYWORDS="\
finplan|financial planning tool|the studio|studio/|\
financialplan\.ts|projectedportfolio|requiredportfolio|withdrawal rate|monte carlo|probability cone|\
finplan-scout|finplan-analyst|finplan-cfp|finplan-quant|finplan-engineer|finplan-designer|finplan-a11y|finplan-content|finplan-qa|finplan-auditor|finplan-director|\
\.learn/errors|\.learn/canonical|\.learn/glossary|\.learn/lessons|studio/specs|studio/audits|studio/backlog"

if echo "$LOWER" | grep -qE "$FINPLAN_KEYWORDS"; then
  LEARN_DIR="/Users/prestonmagouirk/Desktop/Financial_Planning_Tool/studio/.learn"
  if [[ -f "$LEARN_DIR/errors.md" ]]; then
    echo ""
    echo "================================================================"
    echo "FINPLAN STUDIO PRIMING — read these BEFORE starting any work"
    echo "================================================================"
    echo "Source: $LEARN_DIR/"
    echo ""
    echo "Open Patterns (from .learn/errors.md):"
    echo ""
    awk '/^## Open Patterns/{flag=1; next} /^---/ && flag{exit} flag' "$LEARN_DIR/errors.md"
    echo ""
    echo "Single source of truth: $LEARN_DIR/canonical.md (formulas, reference values, design tokens)"
    echo "Load-bearing language:  $LEARN_DIR/glossary.md"
    echo "Durable lessons:        $LEARN_DIR/lessons.md"
    echo ""
    echo "Each finplan-* skill's Pre-Run protocol REQUIRES reading these at session start."
    echo "================================================================"
  fi
fi

exit 0
