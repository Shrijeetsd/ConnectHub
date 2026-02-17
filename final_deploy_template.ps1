$ErrorActionPreference = "Stop"

# ⚠️ CONFIGURATION - Update these values before running
$ip = "YOUR_SERVER_IP"           # e.g., "116.203.28.131"
$user = "root"                   # SSH username
$password = 'YOUR_SERVER_PASSWORD'  # SSH password (temporary, will be replaced by key-based auth)

$pubKey = "$env:USERPROFILE\.ssh\id_rsa.pub"

Write-Host "--- Professional Deployment ---" -ForegroundColor Cyan

# 1. SSH SETUP (One-time)
if (-not (Test-Path $pubKey)) {
    Write-Host "Generating SSH keys..." -ForegroundColor Yellow
    cmd /c "ssh-keygen -t rsa -b 4096 -f ""$env:USERPROFILE\.ssh\id_rsa"" -N """""""""
}

# 2. AUTHORIZE (User must paste password)
Write-Host "`n[PASTE THIS]: $password" -ForegroundColor Green
& scp -o StrictHostKeyChecking=no "$pubKey" "root@${ip}:~/temp.pub"
& ssh -o StrictHostKeyChecking=no "root@${ip}" "mkdir -p ~/.ssh; cat ~/temp.pub >> ~/.ssh/authorized_keys"

# 3. BUILD & SYNC
Write-Host "`nBuilding and Uploading..." -ForegroundColor Cyan
Set-Location "d:\Project\SMS Reciever\admin-panel"
npm install --silent; npm run build
Set-Location ".."
Compress-Archive -Path "admin-panel\dist\*" -DestinationPath "admin_panel_deploy.zip" -Force
Compress-Archive -Path "backend\*" -DestinationPath "backend_deploy.zip" -Force

& scp -o BatchMode=yes admin_panel_deploy.zip backend_deploy.zip connecthub_nginx.conf "root@${ip}:/root/"

# 4. REMOTE SETUP
Write-Host "Configuring Server..." -ForegroundColor Yellow
$cmd = "apt update -qq; apt install -y unzip nginx nodejs npm -qq; pm2 stop all || true; unzip -o /root/backend_deploy.zip -d srv; cd srv; npm i --silent; pm2 start server.js; rm -rf /var/www/html/*; unzip -o /root/admin_panel_deploy.zip -d /var/www/html; cp /root/connecthub_nginx.conf /etc/nginx/sites-available/app; ln -sf /etc/nginx/sites-available/app /etc/nginx/sites-enabled/default; nginx -t; systemctl reload nginx"
& ssh -o BatchMode=yes "root@${ip}" "$cmd"

Write-Host "DONE! http://${ip}/devices" -ForegroundColor Green
