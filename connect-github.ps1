$projectId = "prj_TOVyrPqCzW8tmCPUFMTPDSk923Uc"

# Try to update using different approach - use the projects/connect-github endpoint
$body = @{
    repo = "gestao-e-salao"
    org = "erson3276-cmd"
    productionBranch = "main"
} | ConvertTo-Json

$result = Invoke-RestMethod -Uri "https://api.vercel.com/v6/projects/$projectId/connect-github" -Method POST -Headers @{
    "Authorization"="Bearer vcp_5RP5UqGSNTLD0D8HXfBdiF0cJp9fAAxqnP9Icykd8LPCjAgtGL416T65"
    "Content-Type"="application/json"
} -Body $body

$result | ConvertTo-Json -Depth 5
