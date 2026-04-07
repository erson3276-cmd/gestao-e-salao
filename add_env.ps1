$headers = @{
    "Authorization" = "Bearer vcp_6iCOKn1R3HDa9nAJRDOnGYRUnNvTf5uh5mUx3ut4b9EyGPH1az0qwsD1"
    "Content-Type" = "application/json"
}

$projReq = Invoke-RestMethod -Uri "https://api.vercel.com/v6/projects?teamId=" -Headers $headers
$proj = $projReq.projects | Where-Object { $_.name -eq "gestao-e-salao" }
Write-Output "Project ID: $($proj.id)"

$envVars = @(
    @{ "key" = "ASAAS_API_KEY"; "value" = "$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjAwM2VjMjQ4LTUwNzktNDU5MC04MjdmLTAxOGU4NWM3YzI3Nzo6JGFhY2hfODUxNWU5M2MtZDAwYi00MDQwLTk2ZDYtNTVhNmIzN2JhNjZi"; "target" = "production"; "type" = "encrypted" },
    @{ "key" = "ASAAS_API_URL"; "value" = "https://api.asaas.com/v3"; "target" = "production"; "type" = "encrypted" },
    @{ "key" = "ASAAS_WEBHOOK_TOKEN"; "value" = "whsec_3etd35wayzaawsy2PwDNs7u8RCOeCRrSayJip1x3bHY"; "target" = "production"; "type" = "encrypted" },
    @{ "key" = "AUTH_SALT"; "value" = "gestao-esalao-saas-2024-secure"; "target" = "production"; "type" = "encrypted" },
    @{ "key" = "BAILEYS_API_KEY"; "value" = "salao2024"; "target" = "production"; "type" = "encrypted" },
    @{ "key" = "BAILEYS_API_URL"; "value" = "http://167.234.248.199:8082"; "target" = "production"; "type" = "encrypted" },
    @{ "key" = "GITHUB_TOKEN"; "value" = "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"; "target" = "production"; "type" = "encrypted" },
    @{ "key" = "NEXT_PUBLIC_SUPABASE_URL"; "value" = "https://ssdqkvsbhebrqihoekzz.supabase.co"; "target" = "production"; "type" = "encrypted" },
    @{ "key" = "NEXT_PUBLIC_SUPABASE_ANON_KEY"; "value" = "sb_publishable_C6KnxqqIy9nR4Z5sASO_sQ_Kur-BoSR"; "target" = "production"; "type" = "encrypted" }
)

foreach ($env in $envVars) {
    try {
        $body = $env | ConvertTo-Json -Depth 3
        $res = Invoke-RestMethod -Uri "https://api.vercel.com/v6/projects/$($proj.id)/env" -Method POST -Headers $headers -Body $body
        Write-Output "Added $($env.key)"
    } catch {
        Write-Output "Error adding $($env.key): $($_.Exception.Message)"
        try {
            $err = $_.Exception.Response | Get-Response
            Write-Output $err
        } catch {}
    }
}