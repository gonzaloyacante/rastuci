$files = Get-ChildItem -Path "src" -Recurse -Include "*.ts","*.tsx" | Where-Object { $_.FullName -notmatch "logger\.ts|logging\.ts" }
$count = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $changed = $false
    
    # Check if file has console statements but no logger import
    if (($content -match 'console\.(error|log|warn)' -and $content -notmatch 'from [''"]@/lib/logger[''"]')) {
        $lines = $content -split "`n"
        # Find the right place to add import (after other imports)
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match '^import .* from ') {
                continue
            } elseif ($lines[$i].Trim() -eq '' -or $lines[$i] -notmatch '^import') {
                $lines = @($lines[0..$i]) + 'import { logger } from "@/lib/logger";' + @($lines[($i+1)..($lines.Count-1)])
                $content = $lines -join "`n"
                $changed = $true
                break
            }
        }
    }
    
    if ($changed) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $count++
    }
}
Write-Host "Modified $count files"
