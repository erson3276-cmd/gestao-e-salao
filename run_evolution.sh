#!/bin/bash
sudo docker stop evolution-api
sudo docker rm evolution-api
sudo docker network create evolution-net 2>/dev/null || true
sudo docker network connect evolution-net evolution-postgres
sudo docker run -d \
  --name evolution-api \
  --network evolution-net \
  -p 8080:8080 \
  -e SERVER_TYPE=http \
  -e SERVER_URL=http://167.234.248.199:8080 \
  -e AUTH_TYPE=none \
  -e DATABASE_ENABLED=true \
  -e DATABASE_PROVIDER=postgresql \
  -e DATABASE_CONNECTION_URI=postgresql://postgres:postgres123@evolution-postgres:5432/evolution \
  -v evolution_data:/evolution/instances \
  --restart unless-stopped \
  atendai/evolution-api:v2.2.0
