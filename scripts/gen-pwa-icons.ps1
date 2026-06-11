Add-Type -AssemblyName System.Drawing
$srcPath = Join-Path $PSScriptRoot '..\public\assets\icono-gym.png'
$outDir = Join-Path $PSScriptRoot '..\public\assets'
$src = [System.Drawing.Image]::FromFile((Resolve-Path $srcPath))

function Save-Icon([int]$size, [string]$name) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.Clear([System.Drawing.Color]::FromArgb(255, 37, 99, 235))
  $pad = [int]($size * 0.08)
  $box = $size - 2 * $pad
  $ratio = [Math]::Min($box / $src.Width, $box / $src.Height)
  $w = [int]($src.Width * $ratio)
  $h = [int]($src.Height * $ratio)
  $x = [int](($size - $w) / 2)
  $y = [int](($size - $h) / 2)
  $g.DrawImage($src, $x, $y, $w, $h)
  $bmp.Save((Join-Path $outDir $name), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
}

Save-Icon 192 'icon-192.png'
Save-Icon 512 'icon-512.png'
$src.Dispose()
Write-Output 'PWA icons generated'
