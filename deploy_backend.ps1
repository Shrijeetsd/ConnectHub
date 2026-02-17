$ip = "116.203.28.131"
$user = "root"

Write-Host "--- Packaging Backend ---" -ForegroundColor Cyan
Set-Location "d:\Project\SMS Reciever"
if (Test-Path "backend_prod.tar.gz") { Remove-Item "backend_prod.tar.gz" }

# Create tarball excluding node_modules
cmd /c "tar --exclude=node_modules -czf backend_prod.tar.gz -C backend ."

Write-Host "Uploading Backend..." -ForegroundColor Cyan
& scp -o BatchMode=yes -o StrictHostKeyChecking=no backend_prod.tar.gz "${user}@${ip}:/root/"

Write-Host "Deploying Backend on VPS..." -ForegroundColor Yellow
$remoteScript = @"
set -e
mkdir -p /root/connecthub-backend
rm -rf /root/connecthub-backend/*
tar -xzf /root/backend_prod.tar.gz -C /root/connecthub-backend/

cd /root/connecthub-backend
npm install --production

# Start/Restart with PM2
pm2 delete connecthub-backend || true
pm2 start server.js --name "connecthub-backend"

echo "BACKEND DEPLOYMENT SUCCESS"
"@

$remoteScript = $remoteScript -replace "`r", ""
& ssh -o BatchMode=yes -o StrictHostKeyChecking=no "${user}@${ip}" "$remoteScript"

Write-Host "Backend Deployed and Started on PM2" -ForegroundColor Green
