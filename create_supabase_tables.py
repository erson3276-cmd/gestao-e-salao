import urllib.request
import json

url = "https://ssdqkvsbhebrqihoekzz.supabase.co/rest/v1/rpc/exec_sql"
headers = {
    "apikey": "sbp_e7a3e950b44c71a45738727c7b62382af0e2995b",
    "Authorization": "Bearer sbp_e7a3e950b44c71a45738727c7b62382af0e2995b",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

sql = """
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS whatsapp_status (
  id INTEGER PRIMARY KEY DEFAULT 1,
  connected BOOLEAN DEFAULT false,
  state TEXT DEFAULT 'disconnected',
  has_session BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO whatsapp_status (id, connected, state, has_session) 
VALUES (1, false, 'disconnected', false) 
ON CONFLICT (id) DO NOTHING;
"""

data = json.dumps({"query": sql}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers=headers, method='POST')

try:
    with urllib.request.urlopen(req) as response:
        print("Tables created successfully!")
except urllib.error.HTTPError as e:
    body = e.read().decode('utf-8')
    print(f"Error {e.code}: {body}")
