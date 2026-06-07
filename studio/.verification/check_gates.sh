#!/usr/bin/env bash
# Financial Planning Tool studio — verification gate validator.
# Called by the PostToolUse hook after Write/Edit in studio/ paths.
# Exits 0 on pass, 2 on gate violation (2 = blocking feedback to Claude).
# Usage: check_gates.sh <absolute_file_path>

set -u

FILE_PATH="${1:-}"

# Bail quietly if no path or the file does not exist yet
if [[ -z "$FILE_PATH" || ! -f "$FILE_PATH" ]]; then
  exit 0
fi

# Only gate the four workspace subdirectories under studio/
case "$FILE_PATH" in
  */studio/specs/*.md)     STAGE="spec" ;;
  */studio/audits/*.md)    STAGE="audit" ;;
  */studio/backlog/*.md)   STAGE="backlog" ;;
  */studio/briefings/*.md) STAGE="briefing" ;;
  *) exit 0 ;;
esac

# TEMPLATE files and .verification internals are exempt
case "$FILE_PATH" in
  */TEMPLATE.md|*/.verification/*) exit 0 ;;
esac

emit_violation() {
  # stderr on non-zero exit is surfaced back to Claude by the PostToolUse hook
  >&2 echo ""
  >&2 echo "================================================================"
  >&2 echo "FINPLAN STUDIO GATE VIOLATION — $STAGE stage"
  >&2 echo "================================================================"
  >&2 echo "File: $FILE_PATH"
  >&2 echo ""
  >&2 echo "Problem: $1"
  >&2 echo ""
  >&2 echo "Required fix:"
  >&2 echo "$2"
  >&2 echo ""
  >&2 echo "Spec: studio/VERIFICATION.md (Gate: $3)"
  >&2 echo "================================================================"
  exit 2
}

case "$STAGE" in
  spec)
    # Gate: an improvement spec must declare its sources and assumptions.
    if ! grep -qE "^## Sources & Assumptions" "$FILE_PATH"; then
      emit_violation \
        "Improvement spec is missing a '## Sources & Assumptions' section." \
        "Add '## Sources & Assumptions' listing the primary source for every methodology or value and every modeling/design assumption. A builder cannot execute a spec whose grounding is unstated." \
        "spec"
    fi
    ;;

  audit)
    # Gate: an audit must reach a verdict and must run the errors.md regression scan.
    if ! grep -qE "^## Verdict" "$FILE_PATH"; then
      emit_violation \
        "Audit is missing a '## Verdict' section." \
        "Add '## Verdict' (ship / revise / do not ship yet) with a composite score near the top." \
        "audit"
    fi
    if ! grep -qiE "regression scan" "$FILE_PATH"; then
      emit_violation \
        "Audit did not run the errors.md regression scan." \
        "Add the '## errors.md regression scan' section and state, per relevant row, clean or TRIGGERED. Silence is not acceptance." \
        "audit"
    fi
    ;;

  backlog)
    # Gate: every backlog item must cite a source (URL, or a canonical.md / errors.md reference).
    awk '
      BEGIN { in_tbl=0; hdr=0 }
      /^## New items found/ { in_tbl=1; next }
      in_tbl && /^##/ { in_tbl=0 }
      in_tbl && /^\|/ {
        if (!hdr) { hdr=1; next }            # header row
        if ($0 ~ /^\|[ :-]+\|/) next         # divider row
        if ($0 !~ /http/ && $0 !~ /\[/ && $0 !~ /canonical/ && $0 !~ /errors/) {
          exit 3
        }
      }
    ' "$FILE_PATH"
    rc=$?
    if [[ $rc -eq 3 ]]; then
      emit_violation \
        "Backlog has an item with no source." \
        "Every row in 'New items found' must cite a source: a URL, or a canonical.md / errors.md reference. Add one or remove the row." \
        "backlog"
    fi
    ;;

  briefing)
    # Gate: a briefing must carry a verification note or the canonical-checked sentinel.
    if ! grep -qE "^## Verification Note|\[canonical-checked\]" "$FILE_PATH"; then
      emit_violation \
        "Briefing is missing a verification note." \
        "Add a '## Verification Note' listing any number not traceable to canonical.md, OR the footer tag '[canonical-checked]' if every figure traces to canonical." \
        "briefing"
    fi
    ;;
esac

exit 0
