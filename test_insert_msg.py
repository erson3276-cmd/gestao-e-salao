import urllib.request
import json

url = "https://ssdqkvsbhebrqihoekzz.supabase.co/rest/v1/whatsapp_messages"
headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZHFrdnNiaGVicnFpaG9la3p6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4NjkxOSwiZXhwIjoyMDkwNDYyOTE5fQ.lMnYZRJVYSOVPTvEvIjb-hxBIBp4I02oRTK8qvHZ9SM",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZHFrdnNiaGVicnFpaG9la3p6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4NjkxOSwiZXhwIjoyMDkwNDYyOTE5fQ.lMnYZRJVYSOVPTvEvIjb-hxBIBp4I02oRTK8qvHZ9SM",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

data = json.dumps({
    "phone": "5521982755539",
    "message": "Teste de mensagem do Moça ChiQ! WhatsApp funcionando!",
    "status": "pending"
}).encode('utf-8')

req = urllib.request.Request(url, data=data, headers=headers, method='POST')

try:
    with urllib.request.urlopen(req) as response:
        print("Message inserted:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    body = e.read().decode('utf-8')
    print(f"Error {e.code}: {body}")
