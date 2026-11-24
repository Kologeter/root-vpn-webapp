[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$ClientPath
)

# No raw client/curl output, profile contents or exception text reaches run logs.
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $false
$ProgressPreference = 'SilentlyContinue'
$client = $null
$privateRoot = $null
$report = [ordered]@{
    schema = 1
    client = 'Rawline qwdtt bridge'
    version = 'rawline-1.2'
    commit = '634f7dd0600903220060e0b067c094fbd2bfa983'
    core_origin = $(if ($env:QWDTT_WINDOWS_CORE_ORIGIN -eq 'official-release') { 'official-release' } else { 'pinned-source-build' })
    native_windows = [bool]$IsWindows
    os = [System.Environment]::OSVersion.VersionString
    architecture = [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture.ToString()
    tunnel = 'userspace WireGuard over VK TURN/TCP, authenticated SOCKS5'
    gui_tun_tested = $false
    nodes = @()
    passed = $false
}

function Write-PrivateText {
    param([string]$Path, [string]$Value)
    [System.IO.File]::WriteAllText($Path, $Value, [System.Text.UTF8Encoding]::new($false))
}

function Stop-PrivateClient {
    param($Process)
    if ($null -eq $Process) { return }
    try {
        $Process.Refresh()
        if (-not $Process.HasExited) {
            # Also stops a private captcha browser if one was started by the client.
            & "$env:SystemRoot\System32\taskkill.exe" /PID $Process.Id /T /F *> $null
        }
        $null = $Process.WaitForExit(5000)
    } catch { }
    try { $Process.Dispose() } catch { }
}

function Invoke-TunnelRequest {
    param(
        [string]$CurlConfig,
        [string]$Url,
        [string]$Output,
        [string]$ErrorFile,
        [int]$TimeoutSeconds
    )
    # -q first disables any runner/user .curlrc; config disables NO_PROXY bypass.
    $status = & curl.exe -q --config $CurlConfig --socks5-hostname 127.0.0.1:19080 `
        --ipv4 --connect-timeout 10 --max-time $TimeoutSeconds `
        --output $Output --write-out '%{http_code}' $Url 2> $ErrorFile
    $code = $LASTEXITCODE
    return [pscustomobject]@{
        success = ($code -eq 0)
        status = ([string]::Join('', @($status))).Trim()
    }
}

try {
    if (-not $IsWindows -or -not (Test-Path -LiteralPath $ClientPath -PathType Leaf)) {
        throw 'runtime_unavailable'
    }
    $payload = [System.Environment]::GetEnvironmentVariable('QWDTT_WINDOWS_PROFILES_20261124')
    # Do not pass the complete secret bundle to the client/browser/curl children.
    [System.Environment]::SetEnvironmentVariable('QWDTT_WINDOWS_PROFILES_20261124', $null)
    if ([string]::IsNullOrWhiteSpace($payload)) { throw 'profiles_missing' }
    try { $profiles = @($payload | ConvertFrom-Json -AsHashtable) } catch { throw 'profiles_invalid' }
    $payload = $null
    if ($profiles.Count -lt 1 -or $profiles.Count -gt 3) { throw 'profiles_invalid' }

    $privateRoot = Join-Path $env:RUNNER_TEMP ('root-qwdtt-private-' + [guid]::NewGuid().ToString('N'))
    $null = New-Item -ItemType Directory -Path $privateRoot
    $sid = [System.Security.Principal.WindowsIdentity]::GetCurrent().User
    $acl = [System.Security.AccessControl.DirectorySecurity]::new()
    $acl.SetAccessRuleProtection($true, $false)
    $rule = [System.Security.AccessControl.FileSystemAccessRule]::new(
        $sid,
        [System.Security.AccessControl.FileSystemRights]::FullControl,
        ([System.Security.AccessControl.InheritanceFlags]::ContainerInherit -bor
            [System.Security.AccessControl.InheritanceFlags]::ObjectInherit),
        [System.Security.AccessControl.PropagationFlags]::None,
        [System.Security.AccessControl.AccessControlType]::Allow
    )
    $acl.AddAccessRule($rule)
    Set-Acl -LiteralPath $privateRoot -AclObject $acl
    $seenNodes = @{}

    foreach ($profile in $profiles) {
        # Node names are the only untrusted input included in the public report.
        if ($profile -isnot [System.Collections.IDictionary] -or
            -not $profile.Contains('node') -or
            @('greece', 'amsterdam', 'finland') -notcontains $profile.node -or
            $seenNodes.ContainsKey([string]$profile.node)) { throw 'profiles_invalid' }
        $node = [string]$profile.node
        $seenNodes[$node] = $true
        $nodeResult = [ordered]@{
            node = $node
            passed = $false
            attempts = 0
            exit_match = $false
            google_http204 = $false
            download_http200 = $false
            download_bytes = 0
            error = $null
        }
        $phase = 'profile_validation'
        $client = $null
        try {
            if (-not $profile.Contains('config') -or
                -not $profile.Contains('expected_exit') -or
                $profile.config -isnot [System.Collections.IDictionary]) { throw 'invalid' }
            $inputConfig = $profile.config
            foreach ($field in @('peer', 'password', 'hashes', 'device_id')) {
                if (-not $inputConfig.Contains($field)) { throw 'invalid' }
            }
            $expectedIp = $null
            if (-not [System.Net.IPAddress]::TryParse([string]$profile.expected_exit, [ref]$expectedIp) -or
                $expectedIp.AddressFamily -ne [System.Net.Sockets.AddressFamily]::InterNetwork -or
                [string]::IsNullOrWhiteSpace([string]$inputConfig.peer) -or
                [string]::IsNullOrWhiteSpace([string]$inputConfig.password) -or
                [string]::IsNullOrWhiteSpace([string]$inputConfig.device_id)) { throw 'invalid' }
            $hashes = @($inputConfig.hashes)
            if ($hashes.Count -lt 1 -or $hashes.Count -gt 6) { throw 'invalid' }
            foreach ($hash in $hashes) {
                if ($hash -isnot [string] -or [string]::IsNullOrWhiteSpace($hash)) { throw 'invalid' }
            }

            $nodeDir = Join-Path $privateRoot $node
            $null = New-Item -ItemType Directory -Path $nodeDir
            $socksUser = 'probe-' + [guid]::NewGuid().ToString('N')
            $socksPass = [guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N')
            # Fixed reviewed WG/TCP configuration. Fresh per-node device_id comes from root.
            $config = [ordered]@{
                peer = [string]$inputConfig.peer
                password = [string]$inputConfig.password
                hashes = $hashes
                mode = 'wg'
                workers = 9
                device_id = [string]$inputConfig.device_id
                turn_transport = 'tcp'
                no_dtls = $false
                obfs = 'audio'
                vk_anon_path = 'vkcalls'
                captcha_mode = 'auto'
                go_dns = 'yandex'
                listen = '127.0.0.1:19000'
                socks = '127.0.0.1:19080'
                socks_user = $socksUser
                socks_pass = $socksPass
            }
            $configPath = Join-Path $nodeDir 'bridge.json'
            Write-PrivateText $configPath ($config | ConvertTo-Json -Depth 6 -Compress)
            $curlConfig = Join-Path $nodeDir 'curl.conf'
            # Credentials are generated locally from hex GUIDs: no config escaping needed.
            Write-PrivateText $curlConfig (@(
                'silent', 'show-error', 'fail', 'noproxy = ""',
                ('proxy-user = "' + $socksUser + ':' + $socksPass + '"')
            ) -join "`n")
            $stdout = Join-Path $nodeDir 'client.stdout.private'
            $stderr = Join-Path $nodeDir 'client.stderr.private'
            $phase = 'client_start'
            $client = Start-Process -FilePath $ClientPath -WorkingDirectory $nodeDir `
                -ArgumentList @('-config', ('"' + $configPath + '"')) `
                -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru

            $phase = 'connect'
            $deadline = [DateTime]::UtcNow.AddSeconds(90)
            # Connection refusal is immediate before WG starts its SOCKS listener.
            # Wait for that listener instead of spending all five HTTP attempts.
            $portReady = $false
            while ([DateTime]::UtcNow -lt $deadline) {
                $client.Refresh()
                if ($client.HasExited) { throw 'client_exited' }
                $socket = [System.Net.Sockets.TcpClient]::new()
                try {
                    $connecting = $socket.ConnectAsync('127.0.0.1', 19080)
                    $portReady = $connecting.Wait(500) -and $socket.Connected
                } catch { } finally { $socket.Dispose() }
                if ($portReady) { break }
                Start-Sleep -Seconds 2
            }
            if (-not $portReady) { throw 'connection_timeout' }
            for ($attempt = 1; $attempt -le 5; $attempt++) {
                $remaining = [int][Math]::Floor(($deadline - [DateTime]::UtcNow).TotalSeconds)
                if ($remaining -le 0) { break }
                $client.Refresh()
                if ($client.HasExited) { throw 'client_exited' }
                $nodeResult.attempts = $attempt
                $ipFile = Join-Path $nodeDir 'ip.private'
                $request = Invoke-TunnelRequest $curlConfig 'https://api.ipify.org' $ipFile `
                    (Join-Path $nodeDir 'curl-ip.stderr.private') ([Math]::Min(15, $remaining))
                if ($request.success -and $request.status -eq '200' -and
                    (Test-Path -LiteralPath $ipFile)) {
                    $actualIp = [System.IO.File]::ReadAllText($ipFile).Trim()
                    if ($actualIp -ne $expectedIp.ToString()) {
                        $phase = 'exit_mismatch'
                        throw 'mismatch'
                    }
                    $nodeResult.exit_match = $true
                    break
                }
                if ($attempt -lt 5 -and [DateTime]::UtcNow -lt $deadline) { Start-Sleep -Seconds 2 }
            }
            if (-not $nodeResult.exit_match) { throw 'connection_timeout' }

            $phase = 'google204'
            $request = Invoke-TunnelRequest $curlConfig 'https://www.google.com/generate_204' `
                (Join-Path $nodeDir 'google.private') (Join-Path $nodeDir 'curl-google.stderr.private') 30
            $nodeResult.google_http204 = $request.success -and $request.status -eq '204'
            if (-not $nodeResult.google_http204) { throw 'http204_failed' }

            $phase = 'download'
            $download = Join-Path $nodeDir 'download.private'
            $request = Invoke-TunnelRequest $curlConfig 'https://speed.cloudflare.com/__down?bytes=1048576' `
                $download (Join-Path $nodeDir 'curl-download.stderr.private') 75
            $nodeResult.download_http200 = $request.success -and $request.status -eq '200'
            if (Test-Path -LiteralPath $download) {
                $nodeResult.download_bytes = (Get-Item -LiteralPath $download).Length
            }
            if (-not $nodeResult.download_http200 -or $nodeResult.download_bytes -ne 1048576) {
                throw 'download_failed'
            }
            $nodeResult.passed = $true
        } catch {
            # Deliberately omit exception messages, response bodies and raw logs.
            $nodeResult.error = $phase + '_failed'
        } finally {
            Stop-PrivateClient $client
            $client = $null
            $report.nodes += [pscustomobject]$nodeResult
        }
    }
    $report.passed = @($report.nodes | Where-Object { -not $_.passed }).Count -eq 0
} catch {
    $report.error = 'probe_setup_failed'
    $report.passed = $false
} finally {
    [System.Environment]::SetEnvironmentVariable('QWDTT_WINDOWS_PROFILES_20261124', $null)
    Stop-PrivateClient $client
    $payload = $null
    $profiles = $null
    $config = $null
    $inputConfig = $null
    if ($null -ne $privateRoot) {
        try { Remove-Item -LiteralPath $privateRoot -Recurse -Force -ErrorAction Stop } catch {
            $report.cleanup_failed = $true
            $report.passed = $false
        }
    }
}

Write-Output ('ROOT_QWDTT_WINDOWS_REPORT=' + ($report | ConvertTo-Json -Depth 6 -Compress))
if (-not $report.passed) { exit 1 }
exit 0
