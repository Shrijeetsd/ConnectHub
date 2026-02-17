$ErrorActionPreference = "Stop"
$ip = "116.203.28.131"
$user = "root"

Write-Host "--- Automated Deployment v4 (Clean & Robust) ---" -ForegroundColor Cyan

# 1. BUILD ADMIN PANEL
Write-Host "`nBuilding Admin Panel..." -ForegroundColor Cyan
Set-Location "d:\Project\SMS Reciever\admin-panel"
npm install --silent
npm run build
Set-Location ".."

# 2. UPLOAD FRONTEND (Using scp -r for direct folder copy to avoid zip corruption)
Write-Host "Uploading Frontend..." -ForegroundColor Cyan
# Clean server directory first
& ssh -o BatchMode=yes -o StrictHostKeyChecking=no "${user}@${ip}" "rm -rf /var/www/connecthub-admin/dist && mkdir -p /var/www/connecthub-admin/dist"
# Copy files
& scp -r -o BatchMode=yes -o StrictHostKeyChecking=no admin-panel/dist/* "${user}@${ip}:/var/www/connecthub-admin/dist/"

# 3. PACKAGE & UPLOAD BACKEND
Write-Host "Packaging Backend..." -ForegroundColor Cyan
if (Test-Path "backend_deploy.tar.gz") { Remove-Item "backend_deploy.tar.gz" }
# Use native tar via cmd to ensure POSIX compatibility
cmd /c "tar -czf backend_deploy.tar.gz --exclude node_modules --exclude .env -C backend ."
& scp -o BatchMode=yes -o StrictHostKeyChecking=no backend_deploy.tar.gz connecthub_nginx.conf "${user}@${ip}:/root/"

# 4. REMOTE SETUP
Write-Host "Configuring Server..." -ForegroundColor Yellow
# We use a simpler script to avoid syntax errors in SSH
$remoteScript = '
set -e
export DEBIAN_FRONTEND=noninteractive
apt update -qq
apt install -y nginx nodejs npm tar unzip -qq
npm install -g pm2

# BACKEND
pm2 delete connecthub-api || true
rm -rf /var/www/connecthub-backend
mkdir -p /var/www/connecthub-backend
tar -xzf /root/backend_deploy.tar.gz -C /var/www/connecthub-backend/

cd /var/www/connecthub-backend
npm install --production --silent

# Create .env if missing
if [ ! -f .env ]; then
    printf "NODE_ENV=production\nPORT=5000\nMONGO_URI=mongodb+srv://shrijitdesai8459_db_user:8YW4iRNIuS4c4fms@cluster0.5rtomco.mongodb.net/sms_receiver_production?appName=Cluster0\nJWT_SECRET=63786191d61b7db98174b43a0892ff17cccad55aa84d8\nREGISTRATION_SECRET=5528bdcaa4b0b8289ed8e4f69333b99fb\nFRONTEND_URL=http://vansh.com\nALLOWED_ORIGINS=http://vansh.com,http://116.203.28.131\n" > .env
fi

# Seed
[ -f "seed.js" ] && node seed.js || echo "seed.js missing"

pm2 start server.js --name connecthub-api
pm2 save

# NGINX
cp /root/connecthub_nginx.conf /etc/nginx/sites-available/connecthub
ln -sf /etc/nginx/sites-available/connecthub /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
chown -R www-data:www-data /var/www/connecthub-admin
nginx -t && systemctl reload nginx
echo "DEPLOYMENT v4 SUCCESSFUL"
'

$remoteScript = $remoteScript -replace "`r", ""
& ssh -o BatchMode=yes -o StrictHostKeyChecking=no "${user}@${ip}" "$remoteScript"

Write-Host "`nDONE! Visit http://${ip}/devices" -ForegroundColor Green
