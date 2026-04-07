$headers = @{
    "apikey" = "sb_publishable_C6KnxqqIy9nR4Z5sASO_sQ_Kur-BoSR"
    "Authorization" = "Bearer sbp_af83d57a1f0e37e51fd995a2fb63ec5f340cab73"
}

try {
    $res = Invoke-RestMethod -Uri "https://ssdqkvsbhebrqihoekzz.rest.supabase.co/rest/v1/salons?select=id,name,status,owner_email&limit=5" -Headers $headers
    $res | ConvertTo-Json -Depth 3
} catch {
    Write-Output "Error: $($_.Exception.Message)"
}