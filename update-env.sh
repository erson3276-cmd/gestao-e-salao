#!/bin/bash
TOKEN="vcp_5oLiMGRo3XmtMBUAZoHRaVHjPV6FDIyQA7hTad9F2YDavKz2kT0OWfYU"
VERCEL_ORG_ID="@acount_id"
VERCEL_PROJECT_ID="gestao-e-salao"

# Add ASAAS_API_URL
curl -X POST "https://api.vercel.com/v4/projects/gestao-e-salao/env" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"ASAAS_API_URL","value":"https://api.asaas.com/v3","type":"plain","environment":"production"}'

# Add ASAAS_API_KEY
curl -X POST "https://api.vercel.com/v4/projects/gestao-e-salao/env" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"ASAAS_API_KEY","value":"$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGI6Ojk3NDM3MTEzLTRjNTgtNGI0Yi05ZjcwLWQzNzI3MjEwZTUyMzo6JGFhY2hfNGMyNTlkOTMtZGJkOC00MWZjLWJhZjgtYzBmNDFmZTI0NmNm","type":"secret","environment":"production"}'
