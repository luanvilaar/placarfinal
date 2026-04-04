# Deploy Rápido — Edge Function ⚡

## Método 1: Dashboard (5 min, Recomendado) ✅

### Passo 1 — Abra o Dashboard Supabase
```
https://app.supabase.com
```

Clique no seu projeto.

### Passo 2 — Vá para Edge Functions
Na sidebar esquerda: **Edge Functions**

Clique em **"Create a new function"**

### Passo 3 — Configure a função

**Nome:** `ai-team-assistant`

**Selecione TypeScript** (pode ficar em Python, mas TypeScript é recomendado)

### Passo 4 — Cole o código da função

No editor, **apague tudo** e cole:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message } = await req.json()
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Serviço de IA não configurado.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const prompt = `Você é um extrator de dados para um sistema de competição.
Extraia o nome da equipe e a categoria do texto abaixo.
Categoria deve ser exatamente: "Masculino", "Feminino" ou "Misto".
Retorne APENAS JSON puro: {"nome": "...", "categoria": "..."}
Se não conseguir extrair, retorne: {"error": "Não foi possível identificar o nome ou categoria da equipe."}

Texto: ${message}`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    )

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim()
    const result = JSON.parse(cleaned)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Erro ao processar solicitação.' }),
      { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

### Passo 5 — Clique em Deploy

Aguarde aparecer ✅ "Function deployed successfully"

### Passo 6 — Configure o Secret

Dentro da página da função, procure por **"Secrets"** ou **"Environment Variables"**

Clique em **"Add new secret"**

- **Name:** `GEMINI_API_KEY`
- **Value:** `AIzaSyCRc8MdNi6tiucw9HmZWOrP6Dk_TVpvGLw`

Clique em **"Save"**

### Passo 7 — Redeploy

Volta para a aba da função, clique em **"Deploy"** novamente para ativar o secret.

---

## Pronto! ✅

Agora a Edge Function está deployada e configurada.

**Próximo:**
1. Atualize a página em http://localhost:3000/admin
2. Vá para aba "Equipes"
3. Retire o ".test" do import (mude de volta para versão real):
   - Em `src/app/admin/page.tsx`, linha 5:
   - `import { AITeamAssistant } from '@/components/AITeamAssistant'` (remova `.test`)
4. Atualize a página do navegador
5. Teste: "equipe Alphas masculino" → Enter

---

## Método 2: Supabase CLI (Alternativo)

Se quiser usar CLI via Docker:

```bash
docker run -it -v ~/.config/supabase:/root/.config/supabase supabase/cli supabase login
docker run -it -v ~/.config/supabase:/root/.config/supabase -v $(pwd):/app supabase/cli supabase link --project-ref klhksakeokvdkdnbacbb
docker run -it -v ~/.config/supabase:/root/.config/supabase supabase/cli supabase secrets set GEMINI_API_KEY=AIzaSyCRc8MdNi6tiucw9HmZWOrP6Dk_TVpvGLw
docker run -it -v ~/.config/supabase:/root/.config/supabase -v $(pwd):/app supabase/cli supabase functions deploy ai-team-assistant
```

---

## Troubleshooting

**"Erro 422" ou "error ao processar"**
- Confirme que o secret foi criado
- Redeploy a função após adicionar secret

**"Serviço de IA não configurado"**
- O secret não foi aplicado
- Vá em Secrets e confirme `GEMINI_API_KEY` está lá
- Redeploy

**Função não aparece na lista**
- Aguarde alguns segundos
- Atualize a página (F5)
