#!/bin/bash
echo "Creating instance in database..."
sudo docker exec evolution-postgres psql -U postgres -d evolution -c "INSERT INTO \"Instance\" (id, name, integration) VALUES (gen_random_uuid(), 'salao', 'WHATSAPP-BAILEYS') RETURNING id, name, integration;"
echo ""
echo "Checking instances..."
sudo docker exec evolution-postgres psql -U postgres -d evolution -c "SELECT name, integration, connectionStatus FROM \"Instance\";"
