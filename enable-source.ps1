$projectId = "prj_TOVyrPqCzW8tmCPUFMTPDSk923Uc"

# Disable sourceless mode to enable GitHub integration
$body = @{
    sourceless = $false
} | ConvertTo-Json

$result = Invoke-RestMethod -Uri "https://api.vercel.com/v6/projects/$projectId" -Method PATCH -Headers @{
    "Authorization"="Bearer vcp_5RP5UqGSNTLD0D8HXfBdiF0cJp9fAAxqnP9Icykd8LPCjAgtGL416T65"
    "Content-Type"="application/json"
} -Body $body

$result | ConvertTo-Json -Depth 5
