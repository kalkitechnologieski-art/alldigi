#!/usr/bin/env bash
set -euo pipefail

echo "Adding missing Link import to Footer..."
sed -i '1s/^/import Link from "next\/link";\n/' src/components/Footer.tsx

echo "Rebuilding..."
npm run build

echo "Build successful! Pushing to GitHub..."
git add .
git commit -m "Fix missing Link import in Footer" || echo "Nothing to commit"
git push origin main