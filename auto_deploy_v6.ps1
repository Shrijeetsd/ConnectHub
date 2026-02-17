$ErrorActionPreference = "Stop"
$ip = "116.203.28.131"
$user = "root"

Write-Host "--- Automated Deployment v6 (Relative Paths Fix) ---" -ForegroundColor Cyan

# 1. BUILD ADMIN PANEL (Vite now uses base: './')
Write-Host "`nBuilding Admin Panel..." -ForegroundColor Cyan
Set-Location "d:\Project\SMS Reciever\admin-panel"
npm run build
Set-Location ".."

# 2. PACKAGE FRONTEND & BACKEND
Write-Host "Packaging..." -ForegroundColor Cyan
if (Test-Path "v6_frontend.tar.gz") { Remove-Item "v6_frontend.tar.gz" }
if (Test-Path "v6_backend.tar.gz") { Remove-Item "v6_backend.tar.gz" }

# Using tar to preserve structure
cmd /c "tar -czf v6_frontend.tar.gz -C admin-panel/dist ."
cmd /c "tar -czf v6_backend.tar.gz --exclude node_modules --exclude .env -C backend ."

# 3. FIX LINE ENDINGS IN NGINX CONFIG
$conf = Get-Content "connecthub_nginx.conf" -Raw
$conf = $conf -replace "`r", ""
[IO.File]::WriteAllText("d:\Project\SMS Reciever\connecthub_v6.conf", $conf)

# 4. UPLOAD
Write-Host "Uploading..." -ForegroundColor Cyan
& scp -o BatchMode=yes -o StrictHostKeyChecking=no v6_frontend.tar.gz v6_backend.tar.gz connecthub_v6.conf "${user}@${ip}:/root/"

# 5. REMOTE SETUP
Write-Host "Configuring Server..." -ForegroundColor Yellow
$remoteScript = @"
set -e

# FRONTEND
rm -rf /var/www/connecthub-admin/dist
mkdir -p /var/www/connecthub-admin/dist
tar -xzf /root/v6_frontend.tar.gz -C /var/www/connecthub-admin/dist/

# BACKEND
pm2 delete connecthub-api || true
rm -rf /var/www/connecthub-backend
mkdir -p /var/www/connecthub-backend
tar -xzf /root/v6_backend.tar.gz -C /var/www/connecthub-backend/

cd /var/www/connecthub-backend
npm install --production --silent

# Create .env
printf "NODE_ENV=production\nPORT=5000\nMONGO_URI=mongodb+srv://shrijitdesai8459_db_user:8YW4iRNIuS4c4fms@cluster0.5rtomco.mongodb.net/sms_receiver_production?appName=Cluster0\nJWT_SECRET=63786191d61b7db98174b43a0892ff17cccad55aa84d8\nREGISTRATION_SECRET=5528bdcaa4b0b8289ed8e4f69333b99fb\nFRONTEND_URL=http://vansh.com\nALLOWED_ORIGINS=http://vansh.com,http://116.203.28.131\n" > .env

# Seed
[ -f "seed.js" ] && node seed.js || echo "seed.js missing"

pm2 start server.js --name connecthub-api

# NGINX
cp /root/connecthub_v6.conf /etc/nginx/sites-available/connecthub
ln -sf /etc/nginx/sites-available/connecthub /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
chown -R www-data:www-data /var/www/connecthub-admin
chmod -R 755 /var/www/connecthub-admin/dist

nginx -t
systemctl reload nginx
echo "DEPLOYMENT v6 SUCCESS"
"@

# Fix line endings in remote script
$remoteScript = $remoteScript -replace "`r", ""
& ssh -o BatchMode=yes -o StrictHostKeyChecking=no "${user}@${ip}" "$remoteScript"

Write-Host "`nDONE! Visit http://${ip}/devices" -ForegroundColor Green
Write-Host "Verifying Assets..." -ForegroundColor Yellow
& curl -I "http://${ip}/assets/index-qv7W0PEx.js"
& curl -I "http://${ip}/assets/index-6WjIOx93.css"
