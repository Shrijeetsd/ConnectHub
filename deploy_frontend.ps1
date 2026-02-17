$ErrorActionPreference = "Stop"
$ip = "116.203.28.131"
$user = "root"

Write-Host "--- FRONTEND DEPLOYMENT ONLY ---" -ForegroundColor Cyan

# 1. BUILD
Write-Host "Building Admin Panel..." -ForegroundColor Cyan
Set-Location "d:\Project\SMS Reciever\admin-panel"
npm run build
Set-Location ".."

# 2. PACKAGE
Write-Host "Packaging Frontend..." -ForegroundColor Cyan
if (Test-Path "admin_panel_deploy.zip") { Remove-Item "admin_panel_deploy.zip" }
# Ensure contents are at root
Compress-Archive -Path "admin-panel\dist\*" -DestinationPath "admin_panel_deploy.zip" -Force

# Verify
$zipSize = (Get-Item "admin_panel_deploy.zip").Length
Write-Host "Zip Size: $zipSize bytes" -ForegroundColor Yellow

# 3. UPLOAD
Write-Host "Uploading..." -ForegroundColor Cyan
& scp -o BatchMode=yes -o StrictHostKeyChecking=no admin_panel_deploy.zip "${user}@${ip}:/root/"

# 4. REMOTE SETUP
Write-Host "Setting up on server..." -ForegroundColor Yellow
$remoteScript = @"
echo "CHECKING FRONTEND ZIP:"
ls -lh /root/admin_panel_deploy.zip
unzip -l /root/admin_panel_deploy.zip | head -n 5

rm -rf /var/www/connecthub-admin/dist
mkdir -p /var/www/connecthub-admin/dist
unzip -o /root/admin_panel_deploy.zip -d /var/www/connecthub-admin/dist

echo "LISTING DEPLOYED FILES:"
ls -la /var/www/connecthub-admin/dist/
"@

& ssh -o BatchMode=yes -o StrictHostKeyChecking=no "${user}@${ip}" "$remoteScript"

Write-Host "Done!"
