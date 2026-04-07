$projectId = "prj_TOVyrPqCzW8tmCPUFMTPDSk923Uc"

# First, disable sourceless mode
$body1 = @{
    sourceless = $false
} | ConvertTo-Json

$result1 = Invoke-RestMethod -Uri "https://api.vercel.com/v6/projects/$projectId" -Method PATCH -Headers @{
    "Authorization"="Bearer vcp_5RP5UqGSNTLD0D8HXfBdiF0cJp9fAAxqnP9Icykd8LPCjAgtGL416T65"
    "Content-Type"="application/json"
} -Body $body1

Write-Host "Step 1 - Disabled sourceless:"
$result1 | ConvertTo-Json -Depth 3

Start-Sleep -Seconds 2

# Then update git settings
$body2 = @{
    git = @{
        type = "github"
        repo = "gestao-e-salao"
        repoId = 1200800662
        org = "erson3276-cmd"
        productionBranch = "main"
    }
} | ConvertTo-Json -Depth 5

$result2 = Invoke-RestMethod -Uri "https://api.vercel.com/v6/projects/$projectId" -Method PATCH -Headers @{
    "Authorization"="Bearer vcp_5RP5UqGSNTLD0D8HXfBdiF0cJp9fAAxqnP9Icykd8LPCjAgtGL416T65"
    "Content-Type"="application/json"
} -Body $body2

Write-Host "Step 2 - Updated git:"
$result2 | ConvertTo-Json -Depth 5
