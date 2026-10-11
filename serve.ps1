param(
    [int]$Port = 8080
)

$localIP = "192.168.0.224"
$activeIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback|vEthernet' -and $_.IPAddress -notlike '169.254*' } | Select-Object -First 1).IPAddress
if ($activeIP) { $localIP = $activeIP }

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
try {
    $listener.Start()
} catch {
    # If 8080 is in use, try 8085
    $Port = 8085
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
    $listener.Start()
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " CHRONO BULLET - SERVIDOR WEB LOCAL ACTIVO" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Abre este enlace en el navegador de tu celular (misma red Wi-Fi):" -ForegroundColor Yellow
Write-Host " -> http://${localIP}:${Port}" -ForegroundColor White
Write-Host ""
Write-Host " En esta computadora:" -ForegroundColor Gray
Write-Host " -> http://localhost:${Port}" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Presiona Ctrl+C para detener el servidor." -ForegroundColor DarkGray

$root = $PSScriptRoot

while ($true) {
    try {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::UTF8)
        
        $requestLine = $reader.ReadLine()
        if (-not $requestLine) {
            $client.Close()
            continue
        }

        # Leer cabeceras (capturando Range para video)
        $rangeHeader = $null
        while ($true) {
            $h = $reader.ReadLine()
            if ([string]::IsNullOrEmpty($h)) { break }
            if ($h -match '^(?i)range:\s*bytes=(\d*)-(\d*)') { $rangeHeader = @($Matches[1], $Matches[2]) }
        }

        $parts = $requestLine.Split(' ')
        $rawPath = if ($parts.Length -ge 2) { $parts[1] } else { "/" }
        $cleanPath = [System.Uri]::UnescapeDataString($rawPath.Split('?')[0]).TrimStart('/')
        if ([string]::IsNullOrEmpty($cleanPath)) { $cleanPath = "index.html" }
        if ($cleanPath.Contains('..')) { $client.Close(); continue }

        $filePath = [System.IO.Path]::Combine($root, $cleanPath)

        if ([System.IO.File]::Exists($filePath)) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".svg"  { "image/svg+xml" }
                ".mp4"  { "video/mp4" }
                ".webm" { "video/webm" }
                ".mov"  { "video/quicktime" }
                default { "application/octet-stream" }
            }

            $fs = [System.IO.File]::Open($filePath, 'Open', 'Read', 'ReadWrite')
            try {
                $total = $fs.Length
                $start = 0
                $end = $total - 1
                $status = "200 OK"
                $extra = ""
                if ($rangeHeader) {
                    if ($rangeHeader[0] -ne '') { $start = [long]$rangeHeader[0] }
                    if ($rangeHeader[1] -ne '') { $end = [long]$rangeHeader[1] }
                    if ($rangeHeader[0] -eq '' -and $rangeHeader[1] -ne '') { $start = [Math]::Max(0, $total - [long]$rangeHeader[1]); $end = $total - 1 }
                    if ($end -ge $total) { $end = $total - 1 }
                    $status = "206 Partial Content"
                    $extra = "Content-Range: bytes $start-$end/$total`r`n"
                }
                $len = $end - $start + 1

                $header = "HTTP/1.1 $status`r`n" +
                          "Content-Type: $contentType`r`n" +
                          "Content-Length: $len`r`n" +
                          "Accept-Ranges: bytes`r`n" +
                          $extra +
                          "Cache-Control: no-cache`r`n" +
                          "Access-Control-Allow-Origin: *`r`n" +
                          "Connection: close`r`n`r`n"
                $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                $stream.Write($headerBytes, 0, $headerBytes.Length)

                $fs.Seek($start, 'Begin') | Out-Null
                $buffer = New-Object byte[] 262144
                $remaining = $len
                while ($remaining -gt 0) {
                    $toRead = [int][Math]::Min($buffer.Length, $remaining)
                    $n = $fs.Read($buffer, 0, $toRead)
                    if ($n -le 0) { break }
                    $stream.Write($buffer, 0, $n)
                    $remaining -= $n
                }
            } finally {
                $fs.Close()
            }
        } else {
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $header = "HTTP/1.1 404 Not Found`r`n" +
                      "Content-Type: text/plain`r`n" +
                      "Content-Length: $($msg.Length)`r`n" +
                      "Connection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($msg, 0, $msg.Length)
        }

        $stream.Flush()
        $client.Close()
    } catch {
        # Continue on minor socket exceptions
    }
}
