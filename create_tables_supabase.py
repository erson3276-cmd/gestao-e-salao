import urllib.request
import json

SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZHFrdnNiaGVicnFpaG9la3p6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4NjkxOSwiZXhwIjoyMDkwNDYyOTE5fQ.lMnYZRJVYSOVPTvEvIjb-hxBIBp4I02oRTK8qvHZ9SM"

sql_statements = [
    """CREATE TABLE IF NOT EXISTS blocked_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)""",
    """CREATE TABLE IF NOT EXISTS working_hours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)""",
    """ALTER TABLE vendas ADD COLUMN IF NOT EXISTS tip_amount NUMERIC DEFAULT 0""",
    """INSERT INTO working_hours (day_of_week, start_time, end_time, is_active) VALUES
(1, '09:00', '18:00', true),
(2, '09:00', '18:00', true),
(3, '09:00', '18:00', true),
(4, '09:00', '18:00', true),
(5, '09:00', '18:00', true),
(6, '09:00', '14:00', true),
(0, '09:00', '12:00', false)
ON CONFLICT DO NOTHING""",
    """ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY""",
    """CREATE POLICY "Allow all" ON blocked_slots FOR ALL USING (true)""",
    """ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY""",
    """CREATE POLICY "Allow all" ON working_hours FOR ALL USING (true)"""
]

base_url = "https://ssdqkvsbhebrqihoekzz.supabase.co/rest/v1/rpc/exec_sql"
headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

for i, sql in enumerate(sql_statements):
    data = json.dumps({"query": sql}).encode('utf-8')
    req = urllib.request.Request(base_url, data=data, headers=headers, method='POST')
    
    try:
        with urllib.request.urlopen(req) as response:
            print(f"✅ Statement {i+1}: Success")
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        print(f"❌ Statement {i+1}: Error {e.code} - {body}")
