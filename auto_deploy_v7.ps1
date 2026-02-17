$ErrorActionPreference = "Stop"
$ip = "116.203.28.131"
$user = "root"

Write-Host "--- Automated Deployment v7 (Absolute Paths Fix) ---" -ForegroundColor Cyan

# 1. BUILD ADMIN PANEL (base: '/')
Write-Host "`nBuilding Admin Panel..." -ForegroundColor Cyan
Set-Location "d:\Project\SMS Reciever\admin-panel"
npm run build
Set-Location ".."

# 2. VERIFY LOCAL index.html
$localIndex = Get-Content "admin-panel\dist\index.html" -Raw
if ($localIndex -match 'src="/assets/') {
    Write-Host "Verification Success: index.html uses absolute paths." -ForegroundColor Green
} else {
    Write-Warning "index.html might not be using absolute paths. Content:"
    Write-Host ($localIndex | select -First 5)
}

# 3. PACKAGE
Write-Host "Packaging..." -ForegroundColor Cyan
if (Test-Path "v7_frontend.tar.gz") { Remove-Item "v7_frontend.tar.gz" }
cmd /c "tar -czf v7_frontend.tar.gz -C admin-panel/dist ."

# 4. FIX NGINX CONFIG
$conf = @"
server {
    listen 80;
    server_name vansh.com $ip;

    location / {
        root /var/www/html;
        index index.html;
        try_files `$uri `$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_cache_bypass `$http_upgrade;
    }
}
"@
# Ensure LF line endings for Nginx
$conf = $conf -replace "`r", ""
[IO.File]::WriteAllText("d:\Project\SMS Reciever\connecthub_v7.conf", $conf)

# 5. UPLOAD
Write-Host "Uploading..." -ForegroundColor Cyan
& scp -o BatchMode=yes -o StrictHostKeyChecking=no v7_frontend.tar.gz connecthub_v7.conf "${user}@${ip}:/root/"

# 6. REMOTE SETUP
Write-Host "Configuring Server..." -ForegroundColor Yellow
$remoteScript = @"
set -e
# Deploy to /var/www/html as requested by user
rm -rf /var/www/html/*
tar -xzf /root/v7_frontend.tar.gz -C /var/www/html/

# Clean up any potential corrupted files
find /var/www/html -type f -exec sed -i 's/\r//g' {} +

# NGINX
cp /root/connecthub_v7.conf /etc/nginx/sites-available/connecthub
ln -sf /etc/nginx/sites-available/connecthub /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html

nginx -t
systemctl reload nginx
echo "DEPLOYMENT v7 SUCCESS"
"@

$remoteScript = $remoteScript -replace "`r", ""
& ssh -o BatchMode=yes -o StrictHostKeyChecking=no "${user}@${ip}" "$remoteScript"

Write-Host "`nDONE! Visit http://${ip}/devices" -ForegroundColor Green

# 7. FINAL VERIFICATION
Write-Host "Verifying Asset MIME Type..." -ForegroundColor Yellow
& ssh -o BatchMode=yes -o StrictHostKeyChecking=no "${user}@${ip}" "curl -s -I http://localhost/assets/index-qv7W0PEx.js | grep Content-Type"
