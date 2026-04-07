#!/bin/bash
echo "Creating instance salao..."
curl -s -X POST \
  "http://localhost:8080/instance/create" \
  -H "Content-Type: application/json" \
  -H "apiKey: salao2024" \
  --data-binary '{"instanceName":"salao","integration":"WHATSAPP-BAILEYS","qrcode":true}'
echo ""
