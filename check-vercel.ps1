# First, let's disconnect the current repo and reconnect to gestao-e-salao
$projectId = "prj_TOVyrPqCzW8tmCPUFMTPDSk923Uc"

# Get current project settings
$current = Invoke-RestMethod -Uri "https://api.vercel.com/v6/projects/$projectId" -Headers @{
    "Authorization"="Bearer vcp_5RP5UqGSNTLD0D8HXfBdiF0cJp9fAAxqnP9Icykd8LPCjAgtGL416T65"
}

Write-Host "Current git settings:"
$current.gitProviderOptions
