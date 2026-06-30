#!/bin/sh
# Scan tracked files for likely leaked secrets (run manually or in CI).
set -eu

patterns='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9|AIzaSy[A-Za-z0-9_-]{20,}|service_role["\x27\s]*:|sk-[A-Za-z0-9]{20,}'

found=0
git ls-files -z | while IFS= read -r -d '' file; do
  case "$file" in
    supabase-config.js|node_modules/*|*.local.bak.md)
      continue
      ;;
  esac
  if grep -Eiq "$patterns" "$file" 2>/dev/null; then
    echo "Possible secret in: $file"
    found=1
  fi
done

if [ "$found" -eq 1 ]; then
  exit 1
fi

echo "No obvious secrets in tracked files."
