#!/bin/bash

# Documentation Organization Check Script
# Ensures all .md files follow the established organization rules

echo "🔍 Checking documentation organization..."
echo

# Count .md files in root (should only be README.md)
ROOT_MD_FILES=$(find . -maxdepth 1 -name "*.md" | wc -l)
README_COUNT=$(find . -maxdepth 1 -name "README.md" | wc -l)
OTHER_ROOT_MD=$((ROOT_MD_FILES - README_COUNT))

echo "📁 Root directory .md files: $ROOT_MD_FILES"
echo "📖 README.md files in root: $README_COUNT"
echo "⚠️  Other .md files in root: $OTHER_ROOT_MD"

if [ $OTHER_ROOT_MD -gt 0 ]; then
    echo
    echo "❌ FOUND .md FILES IN ROOT (should be moved to /docs/):"
    find . -maxdepth 1 -name "*.md" -not -name "README.md" | sed 's|^\./|- |'
    echo
    echo "📋 Move these files to appropriate /docs/ subdirectories:"
    echo "   - Feature docs → /docs/features/[feature]/"
    echo "   - Design docs → /docs/design/"
    echo "   - Setup docs → /docs/setup/"
    echo "   - See docs/ops/DOCUMENTATION-MAINTENANCE.md for details"
    EXIT_CODE=1
else
    echo "✅ Root directory is clean (only README.md present)"
    EXIT_CODE=0
fi

echo
echo "📚 Docs directory structure:"
find docs -name "*.md" | sort | sed 's|^|  |'

echo
echo "📊 Summary:"
echo "  - Total docs files: $(find docs -name "*.md" | wc -l)"
echo "  - Organized categories: $(find docs -mindepth 1 -maxdepth 1 -type d | wc -l)"

if [ $EXIT_CODE -eq 0 ]; then
    echo
    echo "🎉 Documentation organization is correct!"
else
    echo
    echo "🔧 Run this to fix: ./scripts/check-docs-organization.sh"
    echo "📖 Read: docs/ops/DOCUMENTATION-MAINTENANCE.md"
fi

exit $EXIT_CODE

