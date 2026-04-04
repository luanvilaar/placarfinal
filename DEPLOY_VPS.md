# Deploy na VPS Hostinger

## ✅ Pré-requisitos

- VPS Hostinger com Linux (Ubuntu 20.04+)
- SSH acesso ao servidor
- Node.js 18+ instalado
- npm ou yarn

---

## 🚀 Passo 1 — Preparar o Servidor

SSH no seu servidor:
```bash
ssh user@seu-ip-vps
```

Atualizar o sistema:
```bash
sudo apt update && sudo apt upgrade -y
```

### Instalar Node.js (se não tiver)

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
```

### Instalar PM2 (para manter a app rodando)

```bash
sudo npm install -g pm2
```

---

## 🚀 Passo 2 — Clonar o Repositório

```bash
cd /home/seu-usuario
git clone https://github.com/luanvilaar/placarfinal.git
cd placarfinal
```

---

## 🚀 Passo 3 — Instalar Dependências

```bash
npm install
```

---

## 🚀 Passo 4 — Configurar Variáveis de Ambiente

Criar arquivo `.env.production`:

```bash
nano .env.production
```

Colar:
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://klhksakeokvdkdnbacbb.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsaGtzYWtlb2t2ZGtkbmJhY2JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2Nzg2OTYsImV4cCI6MjA5MDI1NDY5Nn0.MxfR--PyPk4I1gDZICJPeB52fqP20Oe7dGAYEQL5eFI"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsaGtzYWtlb2t2ZGtkbmJhY2JiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY3ODY5NiwiZXhwIjoyMDkwMjU0Njk2fQ.9n5JgGEiJJKI7jUGodkEAWHBzNH9__SQYVoZXWn-q4A"

# Gemini
GEMINI_API_KEY="AIzaSyCRc8MdNi6tiucw9HmZWOrP6Dk_TVpvGLw"

# Next.js
NODE_ENV="production"
```

Salvar: `Ctrl+X` → `Y` → `Enter`

---

## 🚀 Passo 5 — Build da Aplicação

```bash
npm run build
```

Aguarde até ver: ✅ `ready - started server on 0.0.0.0:3000, url: http://localhost:3000`

---

## 🚀 Passo 6 — Rodar com PM2

```bash
pm2 start npm --name "placarfinal" -- start
```

Confirmar que está rodando:
```bash
pm2 status
```

Fazer PM2 auto-iniciar na reboot:
```bash
pm2 startup
pm2 save
```

---

## 🚀 Passo 7 — Configurar Nginx como Reverse Proxy

Instalar Nginx:
```bash
sudo apt install -y nginx
```

Criar configuração:
```bash
sudo nano /etc/nginx/sites-available/placarfinal
```

Colar:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;  # Substitua pelo seu domínio

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Habilitar:
```bash
sudo ln -s /etc/nginx/sites-available/placarfinal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🚀 Passo 8 — SSL (HTTPS) com Let's Encrypt

Instalar Certbot:
```bash
sudo apt install -y certbot python3-certbot-nginx
```

Gerar certificado:
```bash
sudo certbot --nginx -d seu-dominio.com
```

Teste automático de renovação:
```bash
sudo systemctl enable certbot.timer
```

---

## 🚀 Passo 9 — Testar

Acesse: `https://seu-dominio.com`

Ou pelo IP: `http://seu-ip-vps`

---

## 📊 Monitorar a Aplicação

Ver logs:
```bash
pm2 logs placarfinal
```

Status:
```bash
pm2 status
```

Reiniciar:
```bash
pm2 restart placarfinal
```

---

## 🔄 Atualizar Código

Quando quiser fazer deploy de novas mudanças:

```bash
cd /home/seu-usuario/placarfinal
git pull
npm install
npm run build
pm2 restart placarfinal
```

---

## 🆘 Troubleshooting

### App não inicia
```bash
pm2 logs placarfinal
```
Veja o erro nos logs

### Porta 3000 já está em uso
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

### Certificado SSL
```bash
sudo certbot renew --dry-run
```

---

## 📝 Resumo de Portas

- **3000** — Node.js (interno)
- **80** — HTTP (Nginx)
- **443** — HTTPS (Nginx)

---

**Sucesso! Sua app Placar Final está online na VPS! 🚀**
