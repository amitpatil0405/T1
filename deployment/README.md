# DeltaFox Trading Dashboard — Beginner-Friendly Linux Deployment Guide

This guide explains step-by-step how to deploy the **DeltaFox Trading Dashboard** on a fresh Linux server (Ubuntu 22.04 LTS / Debian 12).

---

## Step 1: System Package & Python Setup

Run these exact commands on your Linux server:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip python3-venv nginx git
```

---

## Step 2: Clone Codebase & Setup Python Virtual Environment

```bash
sudo mkdir -p /var/www/deltafox
sudo chown -R $USER:$USER /var/www/deltafox
cd /var/www/deltafox

cd /var/www/deltafox/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## Step 3: Configure Environment Variables

Create `/var/www/deltafox/backend/.env`:

```bash
cp .env.example .env
nano .env
```

Set your secrets in `.env`:
```env
DATABASE_URL=sqlite:////var/www/deltafox/backend/deltafox.db
SESSION_SECRET=a_very_long_random_secret_string_32_chars_min
COOKIE_SECURE=true
ACCESS_TOKEN_EXPIRE_MINUTES=4320
HISTORICAL_DATA_PROVIDER=yfinance
DHAN_CLIENT_ID=your_dhan_client_id_here
DHAN_ACCESS_TOKEN=your_dhan_access_token_here
DEFAULT_ADMIN_USER_ID=admin
DEFAULT_ADMIN_PASSWORD=your_secure_password
```

---

## Step 4: Build Frontend Static Bundle

```bash
cd /var/www/deltafox/frontend
npm install
npm run build
```

This generates production static HTML/JS/CSS assets inside `/var/www/deltafox/frontend/dist`.

---

## Step 5: Setup systemd Auto-Restart Service

```bash
sudo cp /var/www/deltafox/deployment/deltafox-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable deltafox-backend
sudo systemctl start deltafox-backend
sudo systemctl status deltafox-backend
```

---

## Step 6: Configure Nginx Reverse Proxy

```bash
sudo cp /var/www/deltafox/deployment/nginx.conf /etc/nginx/sites-available/deltafox
sudo ln -s /etc/nginx/sites-available/deltafox /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 7: Safe Historical Data Reset CLI (Ops)

```bash
cd /var/www/deltafox/backend
source venv/bin/activate
python reset_historical.py
```
