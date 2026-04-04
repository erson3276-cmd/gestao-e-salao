# Setup Baileys API - Oracle Cloud

## 1. Criar Instância na Oracle Cloud

1. Acesse https://cloud.oracle.com
2. Compute → Instances → Create Instance
3. Escolha **Ubuntu 22.04** (Always Free: ARM Ampere ou AMD VM.Standard.E2.1.Micro)
4. Adicione sua chave SSH
5. Crie a instância

## 2. Acessar via SSH

```bash
ssh -i sua-chave-ssh.pem ubuntu@SEU_IP_ORACLE
```

## 3. Instalar Node.js e Dependências

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar dependências do Baileys
sudo apt install -y git build-essential libvips-dev ffmpeg

# Verificar
node -v
npm -v
```

## 4. Instalar Evolution API (Recomendado)

```bash
# Clonar Evolution API
git clone https://github.com/EvolutionAPI/evolution-api.git
cd evolution-api

# Instalar dependências
npm install

# Gerar arquivo de ambiente
cp .env.example .env
```

## 5. Configurar .env

```bash
nano .env
```

Conteúdo mínimo:

```env
# Server
SERVER_URL=http://SEU_IP_ORACLE:8080
PORT=8080

# API Key (USE UMA SENHA FORTE)
API_KEY=salao2024

# Database (SQLite para simplicidade)
DATABASE_PROVIDER=postgresql
DATABASE_CONNECTION_URI=postgresql://postgres:postgres@localhost:5432/evolution

# JWT
JWT_SECRET=seu-jwt-secret-aqui-123456
JWT_EXPIRIN_IN=30d

# Webhook Global (opcional)
WEBHOOK_GLOBAL_URL=https://gestaoesalao.vercel.app/api/whatsapp
WEBHOOK_GLOBAL_ENABLED=true
WEBHOOK_GLOBAL_EVENTS=messages.upsert,qrcode.updated,connection.update
```

## 6. Instalar PostgreSQL (Opcional, mas recomendado)

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Criar banco
sudo -u postgres psql -c "CREATE DATABASE evolution;"
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
```

## 7. Iniciar Evolution API

```bash
# Modo desenvolvimento (teste)
npm run dev

# Ou modo produção
npm run build
npm start
```

## 8. Configurar Firewall

```bash
# No servidor
sudo ufw allow 8080/tcp
sudo ufw allow 22/tcp
sudo ufw enable

# Na Oracle Cloud Console:
# Networking → Virtual Cloud Networks → Security Lists
# Adicionar Ingress Rule:
#   Source: 0.0.0.0/0
#   Destination Port Range: 8080
#   Protocol: TCP
```

## 9. Testar

```bash
curl http://SEU_IP_ORACLE:8080/
```

Deve retornar algo como `{"message":"OK"}`

## 10. Atualizar .env.local do SaaS

No seu projeto `moca-chip-app`, atualize:

```env
BAILEYS_API_URL=http://SEU_IP_ORACLE:8080
BAILEYS_API_KEY=salao2024
```

E faça deploy:
```bash
npx vercel env rm BAILEYS_API_URL production
npx vercel env rm BAILEYS_API_KEY production
```

## 11. Manter Rodando (PM2)

```bash
sudo npm install -g pm2

pm2 start npm --name "evolution-api" -- start
pm2 save
pm2 startup
```

---

## Alternativa Rápida: Usar Evolution API Docker

Se preferir Docker (mais simples):

```bash
# Instalar Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu

# Rodar Evolution API
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e API_KEY=salao2024 \
  -e SERVER_URL=http://SEU_IP_ORACLE:8080 \
  atendai/evolution-api:latest
```
