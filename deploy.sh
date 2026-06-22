#!/usr/bin/env bash
# =============================================================================
# OneLightStays — One-shot deployment script for Ubuntu 22.04
# Usage:  sudo bash deploy.sh
# Re-runs are safe (idempotent).
# =============================================================================
set -Eeuo pipefail

# ---------------------------------------------------------------------------
# Pretty output
# ---------------------------------------------------------------------------
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'; BLUE='\033[0;34m'; BOLD='\033[1m'; NC='\033[0m'
say()  { echo -e "${BLUE}${BOLD}==>${NC} $*"; }
ok()   { echo -e "${GREEN}✔${NC}  $*"; }
warn() { echo -e "${YELLOW}!${NC}  $*"; }
die()  { echo -e "${RED}✘${NC}  $*" >&2; exit 1; }
on_err() { die "Deploy failed on line $LINENO. Check /var/log/onelightstays-deploy.log"; }
trap on_err ERR

[[ $EUID -eq 0 ]] || die "Please run as root:  sudo bash deploy.sh"

exec > >(tee -a /var/log/onelightstays-deploy.log) 2>&1

cat <<BANNER
${BOLD}
  ___           _    _      _   _   ___ _
 / _ \ _ _  ___| |  (_)__ _| |_| |_/ __| |_ __ _ _  _ ___
| (_) | ' \/ -_) |__| / _\` | ' \  _\__ \  _/ _\` | || (_-<
 \___/|_||_\___|____|_\__, |_||_\__|___/\__\__,_|\_, /__/
                      |___/                      |__/
        OneLightStays — Production Deploy (Ubuntu 22.04)
${NC}
BANNER

# ---------------------------------------------------------------------------
# Config (env-overridable; otherwise prompt)
# ---------------------------------------------------------------------------
REPO_URL="${REPO_URL:-https://github.com/iamswarnadeep/oneligtstays.git}"
APP_DIR="${APP_DIR:-/var/www/onelightstays}"
DOMAIN="${DOMAIN:-}"
LE_EMAIL="${LE_EMAIL:-}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@onelightstays.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-}"
MONGO_URL_VAL="${MONGO_URL_VAL:-mongodb://localhost:27017}"
DB_NAME="${DB_NAME:-onelightstays}"
BACKEND_PORT="${BACKEND_PORT:-8001}"
RUN_USER="${RUN_USER:-www-data}"

# SMTP (optional — leave blank to keep DEMO mode)
SMTP_DEMO_MODE="${SMTP_DEMO_MODE:-demo}"
SMTP_HOST="${SMTP_HOST:-}"
SMTP_PORT="${SMTP_PORT:-587}"
SMTP_USER="${SMTP_USER:-}"
SMTP_PASSWORD="${SMTP_PASSWORD:-}"
SMTP_FROM="${SMTP_FROM:-no-reply@onelightstays.com}"
SMTP_FROM_NAME="${SMTP_FROM_NAME:-OneLightStays}"

ask() {
  local prompt="$1" var="$2" default="${3:-}" silent="${4:-}"
  if [[ -z "${!var:-}" ]]; then
    if [[ -n "$silent" ]]; then
      read -r -s -p "$prompt: " val; echo
    else
      read -r -p "$prompt${default:+ [$default]}: " val
    fi
    val="${val:-$default}"
    printf -v "$var" '%s' "$val"
  fi
}

say "Collecting configuration"
ask "Domain (e.g. onelightstays.com — leave blank for IP-only)" DOMAIN ""
ask "Email for Let's Encrypt SSL (skipped if no domain)"      LE_EMAIL ""
ask "Admin login email"                                        ADMIN_EMAIL "$ADMIN_EMAIL"
ask "Admin login password (will be stored in backend/.env)"    ADMIN_PASSWORD "" silent
[[ -n "$ADMIN_PASSWORD" ]] || die "Admin password is required"

JWT_SECRET="$(openssl rand -hex 32)"
PUBLIC_URL=""
if [[ -n "$DOMAIN" ]]; then
  PUBLIC_URL="https://$DOMAIN"
else
  IP="$(curl -s ifconfig.me || echo localhost)"
  PUBLIC_URL="http://$IP"
fi
ok "Frontend will point to backend at: ${BOLD}$PUBLIC_URL${NC}"

# ---------------------------------------------------------------------------
# 1. System update + packages
# ---------------------------------------------------------------------------
say "Updating apt and installing base packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y curl git nginx ufw build-essential ca-certificates gnupg lsb-release \
  python3 python3-venv python3-pip software-properties-common openssl

ok "Base packages installed"

# Node.js 20 (NodeSource)
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | cut -dv -f2 | cut -d. -f1)" -lt 18 ]]; then
  say "Installing Node.js 20 + Yarn + PM2"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
npm install -g yarn pm2 >/dev/null 2>&1 || true
ok "Node $(node -v), Yarn $(yarn -v), PM2 $(pm2 -v)"

# MongoDB 7
if ! command -v mongod >/dev/null 2>&1; then
  say "Installing MongoDB 7.0"
  curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-7.gpg
  UB_CODENAME="$(lsb_release -cs)"
  # MongoDB 7 currently officially supports jammy; falls back gracefully
  case "$UB_CODENAME" in
    jammy|focal|noble) REPO_CODENAME="jammy" ;;
    *) REPO_CODENAME="jammy" ;;
  esac
  echo "deb [arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-7.gpg] https://repo.mongodb.org/apt/ubuntu $REPO_CODENAME/mongodb-org/7.0 multiverse" \
    > /etc/apt/sources.list.d/mongodb-org-7.0.list
  apt-get update -y
  apt-get install -y mongodb-org
fi
systemctl enable --now mongod
ok "MongoDB running ($(mongod --version | head -1))"

# Certbot (for SSL)
if [[ -n "$DOMAIN" ]] && ! command -v certbot >/dev/null 2>&1; then
  apt-get install -y certbot python3-certbot-nginx
fi

# ---------------------------------------------------------------------------
# 2. Code: clone or pull
# ---------------------------------------------------------------------------
say "Fetching source from $REPO_URL"
if [[ -d "$APP_DIR/.git" ]]; then
  git -C "$APP_DIR" fetch --all
  git -C "$APP_DIR" reset --hard origin/$(git -C "$APP_DIR" rev-parse --abbrev-ref HEAD)
else
  mkdir -p "$(dirname "$APP_DIR")"
  git clone "$REPO_URL" "$APP_DIR"
fi
chown -R "$RUN_USER":"$RUN_USER" "$APP_DIR"
ok "Code at $APP_DIR"

# ---------------------------------------------------------------------------
# 3. Backend
# ---------------------------------------------------------------------------
say "Setting up Python backend"
cd "$APP_DIR/backend"

# venv
if [[ ! -d venv ]]; then
  sudo -u "$RUN_USER" python3 -m venv venv
fi
sudo -u "$RUN_USER" ./venv/bin/pip install --upgrade pip wheel >/dev/null
sudo -u "$RUN_USER" ./venv/bin/pip install -r requirements.txt
ok "Python dependencies installed"

# .env
cat > .env <<EOF
MONGO_URL=$MONGO_URL_VAL
DB_NAME=$DB_NAME
CORS_ORIGINS=*
JWT_SECRET=$JWT_SECRET
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD
SMTP_DEMO_MODE=$SMTP_DEMO_MODE
SMTP_HOST=$SMTP_HOST
SMTP_PORT=$SMTP_PORT
SMTP_USER=$SMTP_USER
SMTP_PASSWORD=$SMTP_PASSWORD
SMTP_FROM=$SMTP_FROM
SMTP_FROM_NAME=$SMTP_FROM_NAME
EOF
chmod 600 .env
chown "$RUN_USER":"$RUN_USER" .env
mkdir -p uploads && chown -R "$RUN_USER":"$RUN_USER" uploads
ok "backend/.env written"

# PM2 ecosystem
PM2_HOME="/home/$(getent passwd $RUN_USER | cut -d: -f6 | sed 's|/$||')/.pm2"
[[ "$RUN_USER" == "www-data" ]] && PM2_HOME="/var/www/.pm2"
mkdir -p "$PM2_HOME" && chown -R "$RUN_USER":"$RUN_USER" "$PM2_HOME"

cat > "$APP_DIR/backend/ecosystem.config.js" <<EOF
module.exports = {
  apps: [{
    name: "ols-backend",
    cwd: "$APP_DIR/backend",
    script: "./venv/bin/uvicorn",
    args: "server:app --host 127.0.0.1 --port $BACKEND_PORT --workers 2",
    interpreter: "none",
    env: { PYTHONUNBUFFERED: "1" },
    autorestart: true,
    max_memory_restart: "512M",
  }]
};
EOF
chown "$RUN_USER":"$RUN_USER" "$APP_DIR/backend/ecosystem.config.js"

say "Starting backend with PM2"
sudo -u "$RUN_USER" PM2_HOME="$PM2_HOME" pm2 startOrReload "$APP_DIR/backend/ecosystem.config.js"
sudo -u "$RUN_USER" PM2_HOME="$PM2_HOME" pm2 save

# systemd unit for PM2 (resurrect on boot)
PM2_BIN="$(command -v pm2)"
cat > /etc/systemd/system/pm2-ols.service <<EOF
[Unit]
Description=PM2 (OneLightStays) – $RUN_USER
After=network.target mongod.service

[Service]
Type=forking
User=$RUN_USER
LimitNOFILE=infinity
LimitNPROC=infinity
Environment=PM2_HOME=$PM2_HOME
PIDFile=$PM2_HOME/pm2.pid
ExecStart=$PM2_BIN resurrect
ExecReload=$PM2_BIN reload all
ExecStop=$PM2_BIN kill

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now pm2-ols.service
ok "Backend live on 127.0.0.1:$BACKEND_PORT"

# Smoke-test backend
sleep 3
if curl -fsS "http://127.0.0.1:$BACKEND_PORT/api/" >/dev/null; then
  ok "Backend /api/ responding"
else
  warn "Backend not responding — check: sudo -u $RUN_USER PM2_HOME=$PM2_HOME pm2 logs ols-backend"
fi

# ---------------------------------------------------------------------------
# 4. Frontend
# ---------------------------------------------------------------------------
say "Building React frontend"
cd "$APP_DIR/frontend"
echo "REACT_APP_BACKEND_URL=$PUBLIC_URL" > .env
chown "$RUN_USER":"$RUN_USER" .env

sudo -u "$RUN_USER" yarn install --frozen-lockfile || sudo -u "$RUN_USER" yarn install
# CRA needs more memory on small VPS:
sudo -u "$RUN_USER" env NODE_OPTIONS="--max-old-space-size=1536" CI=false yarn build
[[ -d build ]] || die "Frontend build folder missing"
ok "Frontend built at $APP_DIR/frontend/build"

# ---------------------------------------------------------------------------
# 5. Nginx
# ---------------------------------------------------------------------------
say "Configuring Nginx"
NGINX_SERVER_NAME="${DOMAIN:-_}"
NGINX_CONF=/etc/nginx/sites-available/onelightstays

cat > "$NGINX_CONF" <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name $NGINX_SERVER_NAME;

    client_max_body_size 25M;

    # Frontend static
    root $APP_DIR/frontend/build;
    index index.html;
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;

    # SPA fallback
    location / {
        try_files \$uri /index.html;
    }

    # API → FastAPI
    location /api/ {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 90s;
    }

    # Uploaded files
    location /api/uploads/ {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
    }
}
EOF

ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/onelightstays
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
ok "Nginx serving on port 80"

# ---------------------------------------------------------------------------
# 6. Firewall
# ---------------------------------------------------------------------------
say "Configuring UFW firewall"
ufw allow OpenSSH >/dev/null 2>&1 || true
ufw allow 'Nginx Full' >/dev/null 2>&1 || true
yes | ufw enable >/dev/null 2>&1 || true
ok "Firewall enabled (SSH + HTTP/HTTPS)"

# ---------------------------------------------------------------------------
# 7. HTTPS via Let's Encrypt (only if domain + email provided)
# ---------------------------------------------------------------------------
if [[ -n "$DOMAIN" && -n "$LE_EMAIL" ]]; then
  say "Requesting Let's Encrypt SSL for $DOMAIN"
  certbot --nginx --non-interactive --agree-tos --redirect \
    -m "$LE_EMAIL" -d "$DOMAIN" $( [[ "$DOMAIN" != www.* ]] && echo "-d www.$DOMAIN" ) \
    || warn "Certbot failed — re-run manually:  sudo certbot --nginx -d $DOMAIN"
  ok "SSL provisioned"
else
  warn "Skipping SSL (no domain or email provided). The site is on plain HTTP."
fi

# ---------------------------------------------------------------------------
# 8. Final summary
# ---------------------------------------------------------------------------
echo
echo -e "${GREEN}${BOLD}=========================================================="
echo -e " ✔  OneLightStays deployed successfully!"
echo -e "==========================================================${NC}"
echo
echo -e "  ${BOLD}Site${NC}        : $PUBLIC_URL"
echo -e "  ${BOLD}Admin${NC}       : $PUBLIC_URL/admin"
echo -e "  ${BOLD}Admin login${NC} : $ADMIN_EMAIL"
echo -e "  ${BOLD}Code${NC}        : $APP_DIR"
echo -e "  ${BOLD}Logs${NC}        : /var/log/onelightstays-deploy.log"
echo
echo "Manage:"
echo "  sudo -u $RUN_USER PM2_HOME=$PM2_HOME pm2 status"
echo "  sudo -u $RUN_USER PM2_HOME=$PM2_HOME pm2 logs ols-backend"
echo "  sudo -u $RUN_USER PM2_HOME=$PM2_HOME pm2 reload ols-backend"
echo "  sudo systemctl reload nginx"
echo
echo "To redeploy after a git push:"
echo "  cd $APP_DIR && git pull && \\"
echo "    sudo -u $RUN_USER ./backend/venv/bin/pip install -r backend/requirements.txt && \\"
echo "    cd frontend && sudo -u $RUN_USER yarn install && sudo -u $RUN_USER yarn build && \\"
echo "    sudo -u $RUN_USER PM2_HOME=$PM2_HOME pm2 reload ols-backend"
echo
