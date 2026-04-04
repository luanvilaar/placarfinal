# Setup do Assistente IA para Cadastro de Equipes

Este documento descreve como ativar o assistente IA para cadastro de equipes usando Supabase Edge Functions.

## O que foi criado

✅ **Componente React:** `src/components/AITeamAssistant.tsx`  
✅ **Edge Function:** `supabase/functions/ai-team-assistant/index.ts`  
✅ **Integração:** Adicionado ao painel admin `/admin`

## Próximos passos — Deploy da Edge Function

### 1. Instalar o Supabase CLI

Escolha uma das opções:

**macOS (Homebrew):**
```bash
brew install supabase/tap/supabase
```

**Linux / Windows (WSL):**
```bash
curl -fsSL https://cli.supabase.io/install.sh | bash
```

**Docker:**
```bash
docker run -it -v ~/.config/supabase:/root/.config/supabase supabase/cli
```

### 2. Login e Link ao Projeto

```bash
supabase login
```
Isso abre o navegador para autenticar.

```bash
supabase link --project-ref klhksakeokvdkdnbacbb
```
Isso conecta o projeto local ao seu Supabase.

### 3. Configurar o Secret da Chave Gemini

```bash
supabase secrets set GEMINI_API_KEY=AIzaSyCRc8MdNi6tiucw9HmZWOrP6Dk_TVpvGLw
```

Verifique se foi criado:
```bash
supabase secrets list
```

### 4. Deploy da Edge Function

```bash
supabase functions deploy ai-team-assistant
```

Saída esperada:
```
✓ Edge function deployed successfully
  Endpoint: https://klhksakeokvdkdnbacbb.functions.supabase.co/ai-team-assistant
```

### 5. Testar Localmente (Opcional)

Se quiser testar antes de fazer deploy, inicie o servidor local do Supabase:

```bash
supabase start
```

Depois deploy em modo local:
```bash
supabase functions deploy ai-team-assistant --no-verify
```

## Verificar se está funcionando

1. Inicie o servidor Next.js:
```bash
npm run dev
```

2. Acesse `/admin` e vá para a aba "Equipes"

3. No painel "Assistente IA", digite algo como:
   - "Equipe Alphas masculino"
   - "Beta feminino"
   - "Time Gama misto"

4. Pressione Enter ou clique em "Enviar"

5. A IA deve extrair o nome e categoria e registrar a equipe automaticamente

## Troubleshooting

### "Erro ao processar. Tente novamente."

**Possível causa:** A Edge Function não está deployada ou a chave Gemini não está configurada.

**Solução:**
```bash
supabase functions list
```
Verifique se `ai-team-assistant` aparece na lista.

### "Serviço de IA não configurado."

**Possível causa:** A variável `GEMINI_API_KEY` não foi configurada como secret.

**Solução:**
```bash
supabase secrets set GEMINI_API_KEY=AIzaSyCRc8MdNi6tiucw9HmZWOrP6Dk_TVpvGLw
supabase functions deploy ai-team-assistant
```

### A IA não extrai os dados corretamente

**Possível causa:** O prompt de extração pode precisar ser ajustado.

**Solução:** Edite `supabase/functions/ai-team-assistant/index.ts` e redeploy:
```bash
supabase functions deploy ai-team-assistant
```

## Arquitetura

```
Browser (Hostinger Static)
    ↓
    POST /supabase/functions/ai-team-assistant
    ↓
Supabase Edge Function (Deno Serverless)
    ↓
    Gemini API (chave protegida)
    ↓
{ nome, categoria }
    ↓
addTeam() → Supabase teams table
```

## Notas

- A chave `GEMINI_API_KEY` fica protegida no servidor Supabase
- O `output: "export"` em `next.config.mjs` continua ativo (deploy estático na Hostinger funciona)
- O cliente Next.js chama `supabase.functions.invoke()` que já vem no `@supabase/supabase-js`
- A Edge Function roda em Deno (não Node.js)

## Documentação Oficial

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Google Gemini API](https://ai.google.dev/)
