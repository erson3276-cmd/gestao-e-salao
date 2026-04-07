#!/bin/bash
vercel --prod \
  --env ASAAS_API_KEY='$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjAwM2VjMjQ4LTUwNzktNDU5MC04MjdmLTAxOGU4NWM3YzI3Nzo6JGFhY2hfODUxNWU5M2MtZDAwYi00MDQwLTk2ZDYtNTVhNmIzN2JhNjZi' \
  --env ASAAS_API_URL='https://api.asaas.com/v3' \
  --env ASAAS_WEBHOOK_TOKEN='whsec_3etd35wayzaawsy2PwDNs7u8RCOeCRrSayJip1x3bHY' \
  --env AUTH_SALT='gestao-esalao-saas-2024-secure' \
  --env BAILEYS_API_KEY='salao2024' \
  --env BAILEYS_API_URL='http://167.234.248.199:8082' \
  --token=vcp_6iCOKn1R3HDa9nAJRDOnGYRUnNvTf5uh5mUx3ut4b9EyGPH1az0qwsD1