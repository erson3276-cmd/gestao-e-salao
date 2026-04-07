#!/bin/bash
echo "Checking instance status..."
curl -s "http://localhost:8080/instance/connectionState/salao"
echo ""
echo "Trying different endpoints..."
curl -s "http://localhost:8080/instance/salao"
echo ""
curl -s -X POST "http://localhost:8080/instance/salao/connect"
