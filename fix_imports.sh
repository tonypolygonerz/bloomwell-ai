#!/bin/bash
# Fix import paths in all TypeScript files

# Update prisma imports
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  if grep -q "@/lib/prisma" "$file" 2>/dev/null; then
    echo "Updating prisma import in $file"
    sed -i 's|@/lib/prisma|@/shared/lib/prisma|g' "$file" 2>/dev/null || echo "Failed to update $file"
  fi
done

# Update user-intelligence-utils imports
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  if grep -q "@/lib/user-intelligence-utils" "$file" 2>/dev/null; then
    echo "Updating user-intelligence-utils import in $file"
    sed -i 's|@/lib/user-intelligence-utils|@/features/profile/lib/user-intelligence-utils|g' "$file" 2>/dev/null || echo "Failed to update $file"
  fi
done

# Update template-system-utils imports
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  if grep -q "@/lib/template-system-utils" "$file" 2>/dev/null; then
    echo "Updating template-system-utils import in $file"
    sed -i 's|@/lib/template-system-utils|@/shared/lib/template-system-utils|g' "$file" 2>/dev/null || echo "Failed to update $file"
  fi
done

# Update template-pdf-integration imports
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  if grep -q "@/lib/template-pdf-integration" "$file" 2>/dev/null; then
    echo "Updating template-pdf-integration import in $file"
    sed -i 's|@/lib/template-pdf-integration|@/shared/lib/template-pdf-integration|g' "$file" 2>/dev/null || echo "Failed to update $file"
  fi
done

# Update types imports
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  if grep -q "@/types/json-fields" "$file" 2>/dev/null; then
    echo "Updating types import in $file"
    sed -i 's|@/types/json-fields|@/shared/types/json-fields|g' "$file" 2>/dev/null || echo "Failed to update $file"
  fi
done

echo "Import fixes completed"
