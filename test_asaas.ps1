$body = @{
    "customer" = "cus_0000000000"
    "billingType" = "PIX"
    "value" = 49.90
    "dueDate" = "2026-04-10"
    "description" = "Teste PIX"
    "cycle" = "NONE"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "access_token" = "$`aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjAwM2VjMjQ4LTUwNzktNDU5MC04MjdmLTAxOGU4NWM3YzI3Nzo6JGFhY2hfODUxNWU5M2MtZDAwYi00MDQwLTk2ZDYtNTVhNmIzN2JhNjZi"
}

try {
    $res = Invoke-RestMethod -Uri "https://api.asaas.com/v3/payments" -Method POST -Headers $headers -Body $body
    $res | ConvertTo-Json -Depth 5
} catch {
    Write-Output "Error: $($_.Exception.Message)"
    $_.Exception.Response | Select-Object -ExpandProperty StatusCode
}