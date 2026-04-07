#!/usr/bin/env python3
import json

data = {"instanceName": "salao", "integration": "WHATSAPP-BAILEYS"}

with open("/tmp/data.json", "w") as f:
    json.dump(data, f)

print("File written successfully")
