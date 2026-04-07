#!/bin/bash
# Evolution API Setup Script para Oracle Cloud
# Execute este script como root no servidor

set -e

echo "=== Evolution API Setup ==="

# 1. Atualizar sistema
echo "[1/8] Atualizando sistema..."
apt update && apt upgrade -y

# 2. Instalar Node.js 20
echo "[2/8] Instalando Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v

# 3. Instalar dependências
echo "[3/8] Instalando dependências..."
apt install -y git build-essential libvips-dev ffmpeg

# 4. Clonar Evolution API
echo "[4/8] Clonando Evolution API..."
cd /root
rm -rf evolution-api
git clone https://github.com/EvolutionAPI/evolution-api.git
cd evolution-api

# 5. Criar arquivo .env
echo "[5/8] Configurando ambiente..."
cat > .env << 'EOF'
# ==============================================
# EVOLUTION API - CONFIGURAÇÃO BÁSICA
# ==============================================

# SERVER
SERVER_URL=http://YOUR_IP:8080
PORT=8080

# AUTH - IMPORTANTE: Desabilita autenticação para testes
AUTHENTICATION_API_KEY_ENABLED=false
API_KEY=

# Database SQLite (mais simples)
DATABASE_PROVIDER=sqlite
DATABASE_CONNECTION_URI=/root/evolution-api/data/evolution.db

# Webhook (opcional, para receber mensagens)
WEBHOOK_GLOBAL_URL=
WEBHOOK_GLOBAL_ENABLED=false

# Configurações extras
LOG_LEVEL=error
DEL_INSTANCE=false
EOF

# Substituir YOUR_IP pelo IP real
sed -i "s/YOUR_IP/$(curl -s ifconfig.me)/g" .env

# 6. Criar diretório de dados
echo "[6/8] Criando diretórios..."
mkdir -p /root/evolution-api/data

# 7. Instalar dependências e build
echo "[7/8] Instalando dependências..."
npm install

# 8. Iniciar
echo "[8/8] Iniciando Evolution API..."
echo ""
echo "=== Setup Completo! ==="
echo ""
echo "Para iniciar a API, execute:"
echo "  cd /root/evolution-api && npm run dev"
echo ""
echo "Ou para rodar em background com PM2:"
echo "  npm install -g pm2"
echo "  pm2 start npm --name 'evolution' -- start"
echo "  pm2 save"
echo ""
echo "A API estará disponível em: http://SEU_IP:8080"
echo "Documentação: http://SEU_IP:8080/manager"
