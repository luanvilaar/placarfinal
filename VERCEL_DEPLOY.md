# Deploy Vercel CLI

## ✅ Pré-requisitos

- ✅ Vercel CLI instalado (`npm install -g vercel`)
- ✅ Conta Vercel criada (https://vercel.com)
- ✅ Projeto já linked no Vercel (você já fez isso!)

---

## 🚀 Método 1 — Deploy via Painel Vercel (Mais Fácil)

### 1. Acesse o Painel Vercel
```
https://vercel.com/dashboard
```

### 2. Selecione o Projeto `placarfinal`

### 3. Vá para Settings → Environment Variables

### 4. Adicione as Variáveis

Copie e cole cada uma:

```
NEXT_PUBLIC_SUPABASE_URL = https://klhksakeokvdkdnbacbb.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsaGtzYWtlb2t2ZGtkbmJhY2JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2Nzg2OTYsImV4cCI6MjA5MDI1NDY5Nn0.MxfR--PyPk4I1gDZICJPeB52fqP20Oe7dGAYEQL5eFI

SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsaGtzYWtlb2t2ZGtkbmJhY2JiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY3ODY5NiwiZXhwIjoyMDkwMjU0Njk2fQ.9n5JgGEiJJKI7jUGodkEAWHBzNH9__SQYVoZXWn-q4A

GEMINI_API_KEY = AIzaSyCRc8MdNi6tiucw9HmZWOrP6Dk_TVpvGLw

NODE_ENV = production
```

**Para cada variável:**
- Cole o nome
- Cole o valor
- Selecione: **Production**, **Preview**, **Development**
- Clique **Save**

### 5. Clique em Deployments → Redeploy

Aguarde até ver ✅ **Ready**

---

## 🚀 Método 2 — Deploy via Vercel CLI

### 1. Fazer Login

```bash
vercel login
```

Isso abre o navegador para autenticar.

### 2. Verificar Autenticação

```bash
vercel whoami
```

Deve mostrar seu email/usuário.

### 3. Adicionar Variáveis de Ambiente

```bash
# Para Production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add GEMINI_API_KEY production
vercel env add NODE_ENV production
```

### 4. Fazer Deploy

```bash
vercel deploy --prod
```

Aguarde até ver: ✅ **Ready**

O URL da sua app aparecerá no terminal.

---

## 🚀 Método 3 — Deploy via Git (Automático)

Cada vez que você faz `git push`:

1. Vercel detecta a mudança automaticamente
2. Faz build
3. Deploy automático

**Pré-requisito:** Variáveis já configuradas no painel Vercel

```bash
git add -A
git commit -m "feat: update for production"
git push origin main
```

Vercel fará o deploy automaticamente. Acompanhe em:
```
https://vercel.com/dashboard
```

---

## ✅ Testar o Deploy

Depois que o deploy estiver pronto (✅ Ready):

### Acesse a App
```
https://seu-projeto.vercel.app
```

### Teste o Assistente IA
1. Vá para `/admin`
2. Aba **Equipes**
3. Digite: `equipe Alphas masculino`
4. Clique **Enviar**

Se aparecer: ✓ Equipe "Alphas" cadastrada em Masculino

**Sucesso!** 🎉

---

## 🆘 Troubleshooting

### ❌ "API route not found"
- Aguarde rebuild (atualizar página em 2 min)
- Verifique se `NODE_ENV=production` está configurado

### ❌ "Erro ao processar"
- Confirme `GEMINI_API_KEY` está na lista de variáveis
- Redeploy: Deployments → Redeploy

### ❌ "Supabase connection error"
- Confirme `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### ❌ Vercel CLI não encontrado
```bash
npm install -g vercel
vercel login
```

---

## 📊 Monitorar Deployment

### Ver Logs do Deploy
```bash
vercel logs
```

### Ver Status da App
```bash
vercel inspect
```

### Abrir Dashboard
```bash
vercel dashboard
```

---

**Escolha o Método 1 (Painel Vercel) se não quiser usar CLI!** 🎯
