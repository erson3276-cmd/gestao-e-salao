import urllib.request
import json

url = "https://ssdqkvsbhebrqihoekzz.supabase.co/rest/v1/whatsapp_messages?select=*&status=eq.pending"
headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZHFrdnNiaGVicnFpaG9la3p6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4NjkxOSwiZXhwIjoyMDkwNDYyOTE5fQ.lMnYZRJVYSOVPTvEvIjb-hxBIBp4I02oRTK8qvHZ9SM",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZHFrdnNiaGVicnFpaG9la3p6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4NjkxOSwiZXhwIjoyMDkwNDYyOTE5fQ.lMnYZRJVYSOVPTvEvIjb-hxBIBp4I02oRTK8qvHZ9SM",
    "Content-Type": "application/json"
}

req = urllib.request.Request(url, headers=headers)

try:
    with urllib.request.urlopen(req) as response:
        data = response.read().decode('utf-8')
        print("Pending messages:", data)
except urllib.error.HTTPError as e:
    body = e.read().decode('utf-8')
    print(f"Error {e.code}: {body}")
