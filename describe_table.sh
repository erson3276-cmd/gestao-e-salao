#!/bin/bash
echo "Describing Instance table..."
sudo docker exec evolution-postgres psql -U postgres -d evolution -c "\d \"Instance\""
