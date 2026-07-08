param(
  [int]$Port = 8783
)

$ErrorActionPreference = "Stop"
$Root = [System.IO.Path]::GetFullPath((Split-Path -Parent $MyInvocation.MyCommand.Path))
$Address = [System.Net.IPAddress]::Parse("127.0.0.1")
$Listener = [System.Net.Sockets.TcpListener]::new($Address, $Port)

function Get-Mime {
  param([string]$Path)
  switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
    ".html" { "text/html; charset=utf-8" }
    ".css" { "text/css; charset=utf-8" }
    ".js" { "text/javascript; charset=utf-8" }
    ".json" { "application/json; charset=utf-8" }
    ".png" { "image/png" }
    ".jpg" { "image/jpeg" }
    ".jpeg" { "image/jpeg" }
    ".svg" { "image/svg+xml" }
    default { "application/octet-stream" }
  }
}

function Send-Response {
  param(
    [System.Net.Sockets.NetworkStream]$Stream,
    [int]$Status,
    [string]$StatusText,
    [string]$ContentType,
    [byte[]]$Body
  )

  $Header = "HTTP/1.1 $Status $StatusText`r`nContent-Type: $ContentType`r`nContent-Length: $($Body.Length)`r`nConnection: close`r`nCache-Control: no-store`r`n`r`n"
  $HeaderBytes = [System.Text.Encoding]::ASCII.GetBytes($Header)
  $Stream.Write($HeaderBytes, 0, $HeaderBytes.Length)
  $Stream.Write($Body, 0, $Body.Length)
}

function Send-Text {
  param(
    [System.Net.Sockets.NetworkStream]$Stream,
    [int]$Status,
    [string]$StatusText,
    [string]$Text
  )

  $Bytes = [System.Text.Encoding]::UTF8.GetBytes($Text)
  Send-Response $Stream $Status $StatusText "text/plain; charset=utf-8" $Bytes
}

$Listener.Start()
Write-Host "MN AnimaT3D em http://127.0.0.1:$Port/"

try {
  while ($true) {
    $Client = $Listener.AcceptTcpClient()
    try {
      $Client.ReceiveTimeout = 3000
      $Client.SendTimeout = 3000
      $Stream = $Client.GetStream()
      $Reader = [System.IO.StreamReader]::new($Stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
      $RequestLine = $Reader.ReadLine()

      while ($true) {
        $Line = $Reader.ReadLine()
        if ($null -eq $Line -or $Line -eq "") {
          break
        }
      }

      if ([string]::IsNullOrWhiteSpace($RequestLine)) {
        Send-Text $Stream 400 "Bad Request" "Requisição vazia"
        continue
      }

      $Parts = $RequestLine.Split(" ")
      if ($Parts.Length -lt 2 -or $Parts[0] -ne "GET") {
        Send-Text $Stream 405 "Method Not Allowed" "Método não suportado"
        continue
      }

      $UrlPath = $Parts[1].Split("?")[0].TrimStart("/")
      $UrlPath = [System.Uri]::UnescapeDataString($UrlPath).Replace("/", [System.IO.Path]::DirectorySeparatorChar)
      if ([string]::IsNullOrWhiteSpace($UrlPath)) {
        $UrlPath = "index.html"
      }

      $FullPath = [System.IO.Path]::GetFullPath((Join-Path $Root $UrlPath))
      if (-not $FullPath.StartsWith($Root, [System.StringComparison]::OrdinalIgnoreCase)) {
        Send-Text $Stream 403 "Forbidden" "Acesso negado"
        continue
      }

      if (-not [System.IO.File]::Exists($FullPath)) {
        Send-Text $Stream 404 "Not Found" "Arquivo não encontrado"
        continue
      }

      $Body = [System.IO.File]::ReadAllBytes($FullPath)
      Send-Response $Stream 200 "OK" (Get-Mime $FullPath) $Body
    }
    catch {
      if ($Stream) {
        Send-Text $Stream 500 "Internal Server Error" "Erro interno"
      }
    }
    finally {
      if ($Reader) {
        $Reader.Dispose()
      }
      if ($Client) {
        $Client.Close()
      }
    }
  }
}
finally {
  $Listener.Stop()
}
