#!/bin/bash
echo "Creating instance..."
curl -s -X POST "http://localhost:8080/instance/create" \
  -H "Content-Type: application/json" \
  --data-binary '{"instanceName":"salao","integration":"WHATSAPP-BAILEYS","qrcode":true}'
echo ""
