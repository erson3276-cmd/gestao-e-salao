#!/bin/bash
echo "Checking Instance table schema..."
sudo docker exec evolution-postgres psql -U postgres -d evolution -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'Instance';"
echo ""
echo "Checking instances..."
sudo docker exec evolution-postgres psql -U postgres -d evolution -c "SELECT * FROM \"Instance\";"
