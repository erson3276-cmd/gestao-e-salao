import urllib.request
import json

url1 = "https://ssdqkvsbhebrqihoekzz.supabase.co/rest/v1/appointments?select=*&order=start_time.desc&limit=5"
url2 = "https://ssdqkvsbhebrqihoekzz.supabase.co/rest/v1/whatsapp_messages?select=*&order=created_at.desc&limit=5"

headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZHFrdnNiaGVicnFpaG9la3p6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4NjkxOSwiZXhwIjoyMDkwNDYyOTE5fQ.lMnYZRJVYSOVPTvEvIjb-hxBIBp4I02oRTK8qvHZ9SM",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZHFrdnNiaGVicnFpaG9la3p6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4NjkxOSwiZXhwIjoyMDkwNDYyOTE5fQ.lMnYZRJVYSOVPTvEvIjb-hxBIBp4I02oRTK8qvHZ9SM",
    "Content-Type": "application/json"
}

print("=== RECENT APPOINTMENTS ===")
req1 = urllib.request.Request(url1, headers=headers)
try:
    with urllib.request.urlopen(req1) as response:
        data = json.loads(response.read().decode('utf-8'))
        for a in data:
            print(f"  {a['start_time']} - Status: {a['status']} - Customer: {a.get('customer_id')} - Service: {a.get('service_id')}")
except Exception as e:
    print(f"Error: {e}")

print("\n=== RECENT WHATSAPP MESSAGES ===")
req2 = urllib.request.Request(url2, headers=headers)
try:
    with urllib.request.urlopen(req2) as response:
        data = json.loads(response.read().decode('utf-8'))
        for m in data:
            print(f"  {m['created_at']} - {m['phone']} - Status: {m['status']} - Msg: {m['message'][:60]}")
except Exception as e:
    print(f"Error: {e}")
