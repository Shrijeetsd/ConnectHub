$ErrorActionPreference = "Stop"
$ip = "116.203.28.131"
$user = "root"

Write-Host "--- Automated Deployment ---" -ForegroundColor Cyan

# 1. BUILD & SYNC
Write-Host "`nBuilding Admin Panel..." -ForegroundColor Cyan
Set-Location "d:\Project\SMS Reciever\admin-panel"
npm install --silent; npm run build
Set-Location ".."

Write-Host "Packaging..." -ForegroundColor Cyan
if (Test-Path "admin_panel_deploy.zip") { Remove-Item "admin_panel_deploy.zip" }
if (Test-Path "backend_deploy.zip") { Remove-Item "backend_deploy.zip" }

Compress-Archive -Path "admin-panel\dist\*" -DestinationPath "admin_panel_deploy.zip" -Force
Compress-Archive -Path "backend\*" -DestinationPath "backend_deploy.zip" -Force

Write-Host "Uploading to $ip..." -ForegroundColor Cyan
& scp -o BatchMode=yes -o StrictHostKeyChecking=no admin_panel_deploy.zip backend_deploy.zip connecthub_nginx.conf "${user}@${ip}:/root/"

# 2. REMOTE SETUP
Write-Host "Configuring Server..." -ForegroundColor Yellow
$remoteScript = @"
export DEBIAN_FRONTEND=noninteractive
apt update -qq
apt install -y unzip nginx nodejs npm -qq
npm install -g pm2

# BACKEND
pm2 delete connecthub-api || true
rm -rf /var/www/connecthub-backend
mkdir -p /var/www/connecthub-backend
unzip -o /root/backend_deploy.zip -d /var/www/connecthub-backend
cd /var/www/connecthub-backend
npm install --production --silent
# Create .env if missing (Production defaults)
if [ ! -f .env ]; then
    echo "NODE_ENV=production" > .env
    echo "PORT=5000" >> .env
    echo "MONGO_URI=mongodb+srv://shrijitdesai8459_db_user:8YW4iRNIuS4c4fms@cluster0.5rtomco.mongodb.net/sms_receiver_production?appName=Cluster0" >> .env
    echo "JWT_SECRET=63786191d61b7db98174b43a0892ff17cccad55aa84d8" >> .env
    echo "REGISTRATION_SECRET=5528bdcaa4b0b8289ed8e4f69333b99fb" >> .env
    echo "FRONTEND_URL=http://vansh.com" >> .env
    echo "ALLOWED_ORIGINS=http://vansh.com,http://116.203.28.131" >> .env
fi
# Seed Admin User
node seed.js

pm2 start server.js --name connecthub-api
pm2 save

# FRONTEND
rm -rf /var/www/connecthub-admin
mkdir -p /var/www/connecthub-admin/dist
unzip -o /root/admin_panel_deploy.zip -d /var/www/connecthub-admin/dist

# NGINX
cp /root/connecthub_nginx.conf /etc/nginx/sites-available/connecthub
ln -sf /etc/nginx/sites-available/connecthub /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "DEPLOYMENT SUCCESSFUL"
"@

& ssh -o BatchMode=yes -o StrictHostKeyChecking=no "${user}@${ip}" "$remoteScript"

Write-Host "DONE! Visit http://${ip}/devices or http://vansh.com/devices" -ForegroundColor Green
