#!/bin/bash
set -e

# ============================================
# VAATHI — One-Command Deploy to Vercel
# ============================================
# Makes any student go from fork → live in ~3 mins
# Prerequisites: Git, Node.js, npm
# ============================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║   🛡️  VAATHI — One-Command Deploy        ║${NC}"
echo -e "${BOLD}${CYAN}║   India's Cybersecurity Learning OS       ║${NC}"
echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════╝${NC}"
echo ""

# ── Pre-flight checks ──────────────────────────────
check_command() {
  if ! command -v "$1" &> /dev/null; then
    echo -e "${RED}✗ $1 is not installed.${NC}"
    echo -e "${YELLOW}  Install it: $2${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓${NC} $1 found"
}

echo -e "${BOLD}[1/6] Checking prerequisites...${NC}"
check_command "node" "https://nodejs.org"
check_command "npm" "https://nodejs.org"
check_command "git" "https://git-scm.com"

# Install turso + vercel CLIs if missing
install_if_missing() {
  if ! command -v "$1" &> /dev/null; then
    echo -e "${YELLOW}  Installing $1...${NC}"
    npm install -g "$2" --silent 2>/dev/null
    if command -v "$1" &> /dev/null; then
      echo -e "${GREEN}✓${NC} $1 installed"
    else
      echo -e "${RED}✗ Failed to install $1${NC}"
      exit 1
    fi
  else
    echo -e "${GREEN}✓${NC} $1 found"
  fi
}

echo ""
install_if_missing "turso" "@libsql/client"
install_if_missing "vercel" "vercel"

echo ""
echo -e "${BOLD}[2/6] Installing project dependencies...${NC}"
npm install --silent 2>/dev/null
echo -e "${GREEN}✓${NC} Dependencies installed"

# ── Turso Database Setup ───────────────────────────
echo ""
echo -e "${BOLD}[3/6] Setting up Turso database (free)...${NC}"
echo -e "${YELLOW}  If you don't have a Turso account, you'll be prompted to sign in.${NC}"
echo ""

# Check if turso is logged in
TURSO_USER=$(turso auth whoami 2>/dev/null || echo "")
if [ -z "$TURSO_USER" ]; then
  echo -e "${YELLOW}  → Opening Turso login in your browser...${NC}"
  turso auth login-browser 2>/dev/null || turso auth login 2>/dev/null
  TURSO_USER=$(turso auth whoami 2>/dev/null || echo "")
  if [ -z "$TURSO_USER" ]; then
    echo -e "${RED}✗ Could not authenticate with Turso.${NC}"
    echo -e "${YELLOW}  Run 'turso auth login' manually and try again.${NC}"
    exit 1
  fi
fi
echo -e "${GREEN}✓${NC} Logged into Turso as: $TURSO_USER"

# Create database (use a unique name to avoid collisions)
DB_NAME="vaathi-$(whoami)-$(date +%s | tail -c 4)"
DB_NAME=$(echo "$DB_NAME" | tr '[:upper:]' '[:lower:]' | tr -cd 'a-z0-9-')

echo -e "${YELLOW}  Creating database: ${DB_NAME}...${NC}"
turso db create "$DB_NAME" --region ap-south-1 2>/dev/null || \
turso db create "$DB_NAME" 2>/dev/null

# Get database URL
DB_URL=$(turso db show "$DB_NAME" --url 2>/dev/null)
if [ -z "$DB_URL" ]; then
  echo -e "${RED}✗ Failed to create or retrieve database.${NC}"
  exit 1
fi
echo -e "${GREEN}✓${NC} Database created: $DB_URL"

# Create auth token
TOKEN_NAME="vaathi-vercel-$(date +%s)"
echo -e "${YELLOW}  Creating API token...${NC}"
DB_TOKEN=$(turso auth api-tokens create "$TOKEN_NAME" 2>/dev/null | head -1)
if [ -z "$DB_TOKEN" ]; then
  echo -e "${RED}✗ Failed to create auth token.${NC}"
  exit 1
fi
echo -e "${GREEN}✓${NC} Auth token created"

# Push schema to Turso
echo -e "${YELLOW}  Pushing database schema...${NC}"
TURSO_AUTH_TOKEN="$DB_TOKEN" DATABASE_URL="$DB_URL" npx prisma db push --skip-generate 2>/dev/null
echo -e "${GREEN}✓${NC} Database schema pushed"

# ── Vercel Deployment ──────────────────────────────
echo ""
echo -e "${BOLD}[4/6] Deploying to Vercel (free)...${NC}"
echo -e "${YELLOW}  If you don't have a Vercel account, you'll be prompted to sign in.${NC}"
echo ""

# Create .env.local for Vercel (not committed to git)
cat > .env.local <<ENVEOF
DATABASE_URL=$DB_URL
TURSO_AUTH_TOKEN=$DB_TOKEN
ENVEOF

# Deploy with environment variables
echo -e "${YELLOW}  Deploying... (this may take 1-2 minutes)${NC}"

vercel link --yes 2>/dev/null || true
vercel env add DATABASE_URL production <<< "$DB_URL" 2>/dev/null || true
vercel env add TURSO_AUTH_TOKEN production <<< "$DB_TOKEN" 2>/dev/null || true

DEPLOY_URL=$(vercel --prod --yes 2>&1 | tee /dev/tty | grep -oP 'https://[a-zA-Z0-9.-]+\.vercel\.app' | head -1)

if [ -z "$DEPLOY_URL" ]; then
  echo -e "${YELLOW}  Trying to get deploy URL...${NC}"
  DEPLOY_URL=$(vercel ls 2>/dev/null | head -1 | awk '{print $2}')
fi

# Clean up local .env.local (don't leave credentials on disk)
rm -f .env.local

echo ""

# ── Done! ──────────────────────────────────────────
echo -e "${BOLD}[5/6] Saving deployment info...${NC}"
echo ""

# Save deploy info to a local file (gitignored)
cat > .vaathi-deploy <<DEPLOYEOF
# VAATHI Deployment Info
# =======================
# IMPORTANT: This file contains secrets. NEVER commit this.
# It is automatically .gitignored.

DEPLOY_URL=$DEPLOY_URL
DB_NAME=$DB_NAME
DB_URL=$DB_URL
DB_TOKEN=$DB_TOKEN
TOKEN_NAME=$TOKEN_NAME

# To tear down later:
#   vercel remove --yes
#   turso db destroy $DB_NAME
#   turso auth api-tokens delete "$TOKEN_NAME"
DEPLOYEOF

# Ensure it's gitignored
if ! grep -q ".vaathi-deploy" .gitignore 2>/dev/null; then
  echo ".vaathi-deploy" >> .gitignore
fi

echo ""
echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║   ✅ VAATHI IS LIVE!                    ║${NC}"
echo -e "${BOLD}${GREEN}╠══════════════════════════════════════════╣${NC}"
echo -e "${BOLD}${GREEN}║                                          ║${NC}"
if [ -n "$DEPLOY_URL" ]; then
  echo -e "${BOLD}${GREEN}║   🌐  ${DEPLOY_URL}${NC}"
fi
echo -e "${BOLD}${GREEN}║                                          ║${NC}"
echo -e "${BOLD}${GREEN}║   Database: ${DB_NAME}${NC}"
echo -e "${BOLD}${GREEN}║                                          ║${NC}"
echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BOLD}[6/6] Next steps:${NC}"
echo ""
echo -e "  ${CYAN}1.${NC} Open your URL above in your browser"
echo -e "  ${CYAN}2.${NC} Sign up with your name, language, and LLM key"
echo -e "  ${CYAN}3.${NC} Get a FREE Groq API key: ${YELLOW}https://console.groq.com${NC}"
echo -e "  ${CYAN}4.${NC} Or use OpenRouter FREE models: ${YELLOW}https://openrouter.ai${NC}"
echo -e "  ${CYAN}5.${NC} Take the skill assessment → Get your roadmap → Start learning!"
echo ""
echo -e "${YELLOW}💡 Everything costs \$0/month. Turso free tier + Vercel free tier + your free LLM key.${NC}"
echo ""
echo -e "${BOLD}To tear down later:${NC}"
echo -e "  vercel remove --yes"
echo -e "  turso db destroy ${DB_NAME}"
echo ""
