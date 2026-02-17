$ErrorActionPreference = "Stop"
$ip = "116.203.28.131"
$user = "root"

Write-Host "--- Reliable Deployment Script ---" -ForegroundColor Cyan

# 1. BUILD
Write-Host "Building Admin Panel..." -ForegroundColor Cyan
Set-Location "d:\Project\SMS Reciever\admin-panel"
npm install --silent
npm run build
Set-Location ".."

# 2. PACKAGE
Write-Host "Packaging Admin Panel..." -ForegroundColor Cyan
if (Test-Path "admin_deploy.zip") { Remove-Item "admin_deploy.zip" }

# Compress the entire 'dist' folder content
# We will compress 'dist' folder itself to avoid path issues
Compress-Archive -Path "admin-panel\dist" -DestinationPath "admin_deploy.zip" -Force

$zipSize = (Get-Item "admin_deploy.zip").Length
Write-Host "Admin Zip Size: $zipSize bytes" -ForegroundColor Yellow

if ($zipSize -lt 1000) { Write-Error "Zip file is too small! Build likely failed." }

# 3. UPLOAD
Write-Host "Uploading to $ip..." -ForegroundColor Cyan
& scp -o BatchMode=yes -o StrictHostKeyChecking=no admin_deploy.zip "${user}@${ip}:/root/"

# 4. DEPLOY ON SERVER
Write-Host "Deploying on Server..." -ForegroundColor Yellow
$remoteScript = @"
export DEBIAN_FRONTEND=noninteractive
apt update -qq
apt install -y unzip nginx -qq

# Remove old files
rm -rf /var/www/connecthub-admin/dist
mkdir -p /var/www/connecthub-admin

# Unzip
echo "Unzipping..."
unzip -o /root/admin_deploy.zip -d /var/www/connecthub-admin/

# Verify
ls -la /var/www/connecthub-admin/dist/

# Fix Permissions
chown -R www-data:www-data /var/www/connecthub-admin
chmod -R 755 /var/www/connecthub-admin

# Nginx Reload
nginx -t && systemctl reload nginx
echo "Frontend Deployed Successfully"
"@

& ssh -o BatchMode=yes -o StrictHostKeyChecking=no "${user}@${ip}" "$remoteScript"

Write-Host "DONE! Check http://${ip}/devices" -ForegroundColor Green
