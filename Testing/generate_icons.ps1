$sourceLogo = "D:\Project\SMS Reciever\admin-panel\public\logo.png"
$resDir = "D:\Project\SMS Reciever\android\app\src\main\res"

$sizes = @{
    "mipmap-mdpi"    = 48
    "mipmap-hdpi"    = 72
    "mipmap-xhdpi"   = 96
    "mipmap-xxhdpi"  = 144
    "mipmap-xxxhdpi" = 192
}

# Ensure Drawing assembly is loaded
Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param($srcPath, $destPath, $size)
    $srcImg = [System.Drawing.Image]::FromFile($srcPath)
    $destImg = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($destImg)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.DrawImage($srcImg, 0, 0, $size, $size)
    $destImg.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $destImg.Dispose()
    $srcImg.Dispose()
}

function Create-Adaptive-Foreground {
    param($srcPath, $destPath, $canvasSize)
    $srcImg = [System.Drawing.Image]::FromFile($srcPath)
    $destImg = New-Object System.Drawing.Bitmap($canvasSize, $canvasSize)
    $graphics = [System.Drawing.Graphics]::FromImage($destImg)
    $graphics.Clear([System.Drawing.Color]::Transparent)
    
    # Scale logo icon to 65% of canvas size to fit in safe zone
    $logoSize = [int]($canvasSize * 0.65)
    $offset = [int](($canvasSize - $logoSize) / 2)
    
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.DrawImage($srcImg, $offset, $offset, $logoSize, $logoSize)
    
    $destImg.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $destImg.Dispose()
    $srcImg.Dispose()
}

# Generate drawable logo
$drawableDir = Join-Path $resDir "drawable"
if (-not (Test-Path $drawableDir)) { New-Item -ItemType Directory -Path $drawableDir }
Write-Host "Generating UI Logo..."
Resize-Image $sourceLogo (Join-Path $drawableDir "app_logo.png") 512

foreach ($dir in $sizes.Keys) {
    $size = $sizes[$dir]
    $targetDir = Join-Path $resDir $dir
    if (-not (Test-Path $targetDir)) { New-Item -ItemType Directory -Path $targetDir }
    
    # Legacy Launcher Icon
    $destPath = Join-Path $targetDir "ic_launcher.png"
    Write-Host "Generating $destPath ($size x $size)..."
    Resize-Image $sourceLogo $destPath $size
    
    # Round Launcher Icon
    $destPathRound = Join-Path $targetDir "ic_launcher_round.png"
    Write-Host "Generating $destPathRound ($size x $size)..."
    Resize-Image $sourceLogo $destPathRound $size
    
    # Adaptive Foreground (usually 108dp equivalent)
    $foregroundSize = [int]($size * 108 / 48)
    $destPathFG = Join-Path $targetDir "ic_launcher_foreground.png"
    Write-Host "Generating $destPathFG ($foregroundSize x $foregroundSize)..."
    Create-Adaptive-Foreground $sourceLogo $destPathFG $foregroundSize
}

Write-Host "Icon generation complete for Native Android Project!"
