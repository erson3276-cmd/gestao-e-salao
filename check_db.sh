#!/bin/bash
echo "Checking database tables..."
sudo docker exec evolution-postgres psql -U postgres -d evolution -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"
echo ""
echo "Checking instances..."
sudo docker exec evolution-postgres psql -U postgres -d evolution -c "SELECT * FROM public.instance LIMIT 5;"
