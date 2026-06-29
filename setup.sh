#!/usr/bin/env bash
set -Eeuo pipefail
trap 'echo "❌ ERROR at line $LINENO – command: $BASH_COMMAND"; exit 1' ERR

# ---------- Colors ----------
GREEN='\033[0;32m'; CYAN='\033[0;36m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${CYAN}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[ OK ]${NC} $1"; }
fail()  { echo -e "${RED}[FAIL]${NC} $1"; exit 1; }

PROJECT_ROOT="$(pwd)"
info "Cleaning duplicate dynamic exports..."

FILES=(
  "src/app/page.tsx"
  "src/app/agencies/[slug]/page.tsx"
  "src/app/[state]/page.tsx"
  "src/app/[state]/[city]/page.tsx"
  "src/app/[state]/[city]/[locality]/page.tsx"
  "src/app/keywords/[slug]/page.tsx"
  "src/app/search/route.ts"
)

for file in "${FILES[@]}"; do
  [[ ! -f "$file" ]] && continue
  # Remove all existing 'export const dynamic' lines
  sed -i '/^export const dynamic/d' "$file"
  # Insert exactly one at the top
  sed -i '1s/^/export const dynamic = "force-static";\n/' "$file"
  ok "Cleaned $file"
done

# Ensure search route is static empty
cat > src/app/search/route.ts << 'APIEOF'
export const dynamic = 'force-static';
import { NextRequest, NextResponse } from 'next/server';
export async function GET() { return NextResponse.json([]); }
APIEOF

info "Rebuilding..."
if npm run build; then
  ok "Build succeeded! Pushing to GitHub..."
  git add .
  git commit -m "Fix duplicate dynamic exports, static search, ready for Vercel" || echo "Nothing to commit"
  git push origin main
  ok "Pushed! Your site will deploy on best-digital-marketing-agencies.vercel.app"
else
  fail "Build failed. Please check the errors above."
fi