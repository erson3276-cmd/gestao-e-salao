$body = @{
    git = @{
        type = "github"
        repo = "gestao-e-salao"
        repoId = 1200800662
        org = "erson3276-cmd"
        productionBranch = "main"
        sourceless = $false
    }
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "https://api.vercel.com/v6/projects/prj_TOVyrPqCzW8tmCPUFMTPDSk923Uc" -Method PATCH -Headers @{
    "Authorization"="Bearer vcp_5RP5UqGSNTLD0D8HXfBdiF0cJp9fAAxqnP9Icykd8LPCjAgtGL416T65"
    "Content-Type"="application/json"
} -Body $body
