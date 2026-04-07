#!/usr/bin/env python3
import requests
import json

url = "http://localhost:8080"
headers = {"apikey": "salao123"}

# Test connection
print("=== Test Connection ===")
r = requests.get(url + "/")
print(r.json())

# Create instance
print("\n=== Create Instance ===")
data = {"instanceName": "salao", "integration": "WHATSAPP-BAILEYS"}
r = requests.post(url + "/instance/create", headers=headers, json=data)
print(r.json())

# Check status
print("\n=== Instance Status ===")
r = requests.get(url + "/instance/connectionState/salao", headers=headers)
print(r.json())

# Connect (get QR)
print("\n=== Connect (Get QR) ===")
r = requests.post(url + "/instance/connect/salao", headers=headers)
print(r.json())
