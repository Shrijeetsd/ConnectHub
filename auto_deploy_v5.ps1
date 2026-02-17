$ErrorActionPreference = "Stop"
$ip = "116.203.28.131"
$user = "root"

Write-Host "--- Automated Deployment v5 (Fixing Line Endings) ---" -ForegroundColor Cyan

# 1. BUILD ADMIN PANEL
Write-Host "`nBuilding Admin Panel..." -ForegroundColor Cyan
Set-Location "d:\Project\SMS Reciever\admin-panel"
npm install --silent
npm run build
Set-Location ".."

# 2. FIX LINE ENDINGS IN NGINX CONFIG
Write-Host "Fixing line endings in config..." -ForegroundColor Cyan
$conf = Get-Content "connecthub_nginx.conf" -Raw
$conf = $conf -replace "`r", ""
[IO.File]::WriteAllText("d:\Project\SMS Reciever\connecthub_nginx_linux.conf", $conf)

# 3. UPLOAD FRONTEND (Using tar for reliability)
Write-Host "Uploading Frontend..." -ForegroundColor Cyan
if (Test-Path "frontend.tar.gz") { Remove-Item "frontend.tar.gz" }
cmd /c "tar -czf frontend.tar.gz -C admin-panel/dist ."
& scp -o BatchMode=yes -o StrictHostKeyChecking=no frontend.tar.gz connecthub_nginx_linux.conf "${user}@${ip}:/root/"

# 4. PACKAGE BACKEND
Write-Host "Packaging Backend..." -ForegroundColor Cyan
if (Test-Path "backend.tar.gz") { Remove-Item "backend.tar.gz" }
cmd /c "tar -czf backend.tar.gz --exclude node_modules --exclude .env -C backend ."
& scp -o BatchMode=yes -o StrictHostKeyChecking=no backend.tar.gz "${user}@${ip}:/root/"

# 5. REMOTE SETUP
Write-Host "Configuring Server..." -ForegroundColor Yellow
$remoteScript = @"
set -e
# Extract Frontend
rm -rf /var/www/connecthub-admin/dist
mkdir -p /var/www/connecthub-admin/dist
tar -xzf /root/frontend.tar.gz -C /var/www/connecthub-admin/dist/

# Extract Backend
pm2 delete connecthub-api || true
rm -rf /var/www/connecthub-backend
mkdir -p /var/www/connecthub-backend
tar -xzf /root/backend.tar.gz -C /var/www/connecthub-backend/

cd /var/www/connecthub-backend
npm install --production --silent

# Create .env
printf "NODE_ENV=production\nPORT=5000\nMONGO_URI=mongodb+srv://shrijitdesai8459_db_user:8YW4iRNIuS4c4fms@cluster0.5rtomco.mongodb.net/sms_receiver_production?appName=Cluster0\nJWT_SECRET=63786191d61b7db98174b43a0892ff17cccad55aa84d8\nREGISTRATION_SECRET=5528bdcaa4b0b8289ed8e4f69333b99fb\nFRONTEND_URL=http://vansh.com\nALLOWED_ORIGINS=http://vansh.com,http://116.203.28.131\n" > .env

# Seed
[ -f "seed.js" ] && node seed.js || echo "seed.js missing"

pm2 start server.js --name connecthub-api
pm2 save

# NGINX
cp /root/connecthub_nginx_linux.conf /etc/nginx/sites-available/connecthub
ln -sf /etc/nginx/sites-available/connecthub /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
chown -R www-data:www-data /var/www/connecthub-admin
nginx -t && systemctl reload nginx
echo "DEPLOYMENT v5 SUCCESS"
"@

# CRITICAL: Fix line endings in the script itself before sending to SSH
$remoteScript = $remoteScript -replace "`r", ""

& ssh -o BatchMode=yes -o StrictHostKeyChecking=no "${user}@${ip}" "$remoteScript"

Write-Host "`nDONE! Visit http://${ip}/devices" -ForegroundColor Green
# Clean up
Remove-Item "connecthub_nginx_linux.conf"
