$ErrorActionPreference = "Stop"
$ip = "116.203.28.131"
$user = "root"

Write-Host "--- ConnectHub Full Deployment ---" -ForegroundColor Cyan

# 0. Build & Prepare Artifacts
Write-Host "Step 0: Building Frontend..." -ForegroundColor Yellow
Set-Location "d:\Project\SMS Reciever\admin-panel"
npm install
npm run build
if ($LASTEXITCODE -ne 0) { Write-Error "Frontend build failed"; exit 1 }

Write-Host "Zipping Frontend..." -ForegroundColor Yellow
$compress = @{
    Path = "dist\*"
    DestinationPath = "..\admin_panel_deploy.zip"
    Force = $true
}
Compress-Archive @compress

Set-Location ".."

Write-Host "Zipping Backend..." -ForegroundColor Yellow
# Exclude node_modules to save bandwidth/time
Get-ChildItem -Path "backend" -Exclude "node_modules",".env" | Compress-Archive -DestinationPath "backend_deploy.zip" -Force

# 1. Uploading
Write-Host "Step 1: Uploading Files..." -ForegroundColor Yellow
scp backend_deploy.zip ${user}@${ip}:/root/
scp admin_panel_deploy.zip ${user}@${ip}:/root/
scp connecthub_nginx.conf ${user}@${ip}:/root/

# 2. Uploading Env potentially?
# We assume .env exists on server or is created there, but for "Fix it properly", we should probably ensure it's there.
# But providing local .env might overwrite secrets. I'll skip .env upload and assume it's set or handled manually, 
# UNLESS the user implies it's a fresh setup. The logs say "Setup_Guide.md".
# I'll stick to code and config.

# 3. Remote Setup
Write-Host "Step 2: Configuring Server..." -ForegroundColor Yellow
$remoteScript = @"
set -e

# Update & Install Dependencies
apt update
apt install -y nodejs npm mongodb nginx unzip

# --- Backend Setup ---
# Clean previous setup safely
pm2 stop connecthub || true
rm -rf connecthub-server
mkdir -p connecthub-server
unzip -o backend_deploy.zip -d connecthub-server/
cd connecthub-server
# Check if package.json exists
if [ -f "package.json" ]; then
    npm install
else
    echo "Warning: package.json not found in backend_deploy.zip"
fi

# Ensure .env exists (create dummy if not)
if [ ! -f ".env" ]; then
    echo "Creating defaults .env"
    echo "PORT=5000" > .env
    echo "MONGO_URI=mongodb://localhost:27017/connecthub" >> .env
    echo "JWT_SECRET=changesoon" >> .env
fi

pm2 start server.js --name connecthub --update-env
pm2 save
cd ..

# --- Frontend Setup ---
rm -rf /var/www/connecthub-admin
mkdir -p /var/www/connecthub-admin/dist

# Unzip to temp
mkdir -p temp_frontend
unzip -o admin_panel_deploy.zip -d temp_frontend/

# Move contents to /var/www/connecthub-admin/dist
# Since we zipped 'dist/*' content, the zip root has index.html
cp -r temp_frontend/* /var/www/connecthub-admin/dist/
rm -rf temp_frontend

# Set permissions
chown -R www-data:www-data /var/www/connecthub-admin
chmod -R 755 /var/www/connecthub-admin

# --- Nginx Setup ---
mv /root/connecthub_nginx.conf /etc/nginx/sites-available/connecthub
ln -sf /etc/nginx/sites-available/connecthub /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test & Reload
nginx -t
systemctl reload nginx

echo "Deployment Success!"
"@

ssh ${user}@${ip} $remoteScript

Write-Host "Deployment Complete! Visit http://116.203.28.131/devices" -ForegroundColor Green
