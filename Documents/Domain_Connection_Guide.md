# Domain Connection Guide - connecthubapp.bond

This guide explains how to connect your new domain `connecthubapp.bond` to your VPS IP `116.203.28.131`.

## 1. Hostinger DNS Setup

1. Log in to your **Hostinger Control Panel**.
2. Go to **Domains** -> **connecthubapp.bond** -> **DNS / Nameservers**.
3. Add the following **A Records**:

| Type | Name (Host) | Points to (Value) | TTL |
|------|-------------|-------------------|-----|
| A    | @           | 116.203.28.131    | Default |
| A    | www         | 116.203.28.131    | Default |

*Note: If there are existing A records for `@` or `www`, edit them instead of creating new ones.*

## 2. Update VPS Configuration

I have already updated the following files in your project:
- `connecthub_nginx.conf`
- `connecthub_v7.conf`
- `auto_deploy_v7.ps1`
- `android/app/build.gradle` (Updated `BASE_URL`)

To apply these changes to your VPS, run the deployment script:
```powershell
.\auto_deploy_v7.ps1
```

## 3. Enable SSL (HTTPS) - Recommended

To secure your domain with HTTPS, run the following commands on your VPS (via SSH):

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL Certificate
sudo certbot --nginx -d connecthubapp.bond -d www.connecthubapp.bond
```

Follow the prompts to enable automatic redirection to HTTPS.

## 4. Verification

Once DNS propagates (usually takes a few minutes to an hour), you can visit:
- https://connecthubapp.bond
- https://connecthubapp.bond/devices
