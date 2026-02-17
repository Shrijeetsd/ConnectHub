$ErrorActionPreference = "Stop"
$ip = "116.203.28.131"
$user = "root"

Write-Host "--- Automated Deployment v3 (TAR.GZ) ---" -ForegroundColor Cyan

# 1. BUILD & PACKAGE
Write-Host "`nBuilding Admin Panel..." -ForegroundColor Cyan
Set-Location "d:\Project\SMS Reciever\admin-panel"
npm install --silent; npm run build
Set-Location ".."

Write-Host "Packaging (using TAR)..." -ForegroundColor Cyan
if (Test-Path "admin_deploy.tar.gz") { Remove-Item "admin_deploy.tar.gz" }
if (Test-Path "backend_deploy.tar.gz") { Remove-Item "backend_deploy.tar.gz" }

# Create tar.gz using cmd (native tar)
cmd /c "tar -czf admin_deploy.tar.gz -C admin-panel/dist ."
cmd /c "tar -czf backend_deploy.tar.gz --exclude node_modules --exclude .env -C backend ."

# Verify
$adminSize = (Get-Item "admin_deploy.tar.gz").Length
$backendSize = (Get-Item "backend_deploy.tar.gz").Length
Write-Host "Admin Tar Size: $adminSize bytes" -ForegroundColor Yellow
Write-Host "Backend Tar Size: $backendSize bytes" -ForegroundColor Yellow

if ($adminSize -lt 1000) { Write-Error "Admin Tar seems empty!" }
if ($backendSize -lt 1000) { Write-Error "Backend Tar seems empty!" }

Write-Host "Uploading to $ip..." -ForegroundColor Cyan
& scp -o BatchMode=yes -o StrictHostKeyChecking=no admin_deploy.tar.gz backend_deploy.tar.gz connecthub_nginx.conf "${user}@${ip}:/root/"

# 2. REMOTE SETUP
Write-Host "Configuring Server..." -ForegroundColor Yellow
$remoteScript = @"
export DEBIAN_FRONTEND=noninteractive
apt update -qq
apt install -y nginx nodejs npm tar -qq
npm install -g pm2

# BACKEND
pm2 delete connecthub-api || true
rm -rf /var/www/connecthub-backend
mkdir -p /var/www/connecthub-backend

# Extract Backend directly to target
tar -xzf /root/backend_deploy.tar.gz -C /var/www/connecthub-backend/

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
if [ -f "seed.js" ]; then
    node seed.js
else
    echo "Warning: seed.js not found!"
fi

pm2 start server.js --name connecthub-api
pm2 save

# FRONTEND
rm -rf /var/www/connecthub-admin
mkdir -p /var/www/connecthub-admin/dist

# Extract Admin Panel
tar -xzf /root/admin_deploy.tar.gz -C /var/www/connecthub-admin/dist/

# Set Permissions
chown -R www-data:www-data /var/www/connecthub-admin

# NGINX
cp /root/connecthub_nginx.conf /etc/nginx/sites-available/connecthub
ln -sf /etc/nginx/sites-available/connecthub /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "DEPLOYMENT v3 SUCCESSFUL"
"@

& ssh -o BatchMode=yes -o StrictHostKeyChecking=no "${user}@${ip}" "$remoteScript"

Write-Host "DONE! Visit http://${ip}/devices or http://vansh.com/devices" -ForegroundColor Green
