# Setup Assistente IA — Via Dashboard Supabase (Sem CLI)

Se você não conseguir instalar o CLI do Supabase, pode fazer o deploy direto pelo dashboard web. Muito mais simples!

## Opção A: Via Dashboard Web (Recomendado)

### 1. Abra o Dashboard Supabase

Acesse: https://app.supabase.com/projects

E selecione seu projeto **klhksakeokvdkdnbacbb**.

### 2. Vá para Edge Functions

Na sidebar esquerda, clique em:
```
Edge Functions → Create a new function
```

### 3. Crie a Function

Nome: `ai-team-assistant`

Cole o código abaixo:

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

Clique em **Deploy**.

### 4. Configure o Secret da Chave Gemini

Na mesma página da função, procure por "Secrets" ou "Environment Variables".

Adicione:
- **Key:** `GEMINI_API_KEY`
- **Value:** `AIzaSyCRc8MdNi6tiucw9HmZWOrP6Dk_TVpvGLw`

Clique em **Save**.

### 5. Redeploy

Clique em **Deploy** novamente para que a função pegue o secret.

---

## Opção B: Via CLI (Se conseguir instalar)

Siga o arquivo `SETUP_AI_ASSISTANT.md` para instalar via Homebrew ou Docker.

---

## Verificar se está funcionando

1. No dashboard Supabase, clique na função `ai-team-assistant`

2. Procure pelo **"Endpoint"** — deve mostrar algo como:
   ```
   https://klhksakeokvdkdnbacbb.functions.supabase.co/ai-team-assistant
   ```

3. Copie esse URL

4. Abra seu navegador em `/admin` (http://localhost:3000/admin)

5. Vá para a aba **Equipes** 

6. No painel **Assistente IA**, digite:
   ```
   equipe Alphas masculino
   ```

7. Pressione Enter

8. Se funcionar, você verá a mensagem de sucesso e a equipe será listada!

---

## Troubleshooting

### "Erro ao processar"

1. Confirme que o secret `GEMINI_API_KEY` foi criado:
   - Dashboard → Edge Functions → ai-team-assistant → Secrets
   
2. Confirme que a função foi deployada após adicionar o secret

3. Tente novamente

### "Serviço de IA não configurado"

A chave Gemini não foi carregada. Repita o passo 4 e faça redeploy.

### Erro de CORS

Se receber erro de CORS, confirme que os `corsHeaders` estão corretos na função.

---

## Próximos passos

Depois que a Edge Function estiver deployada:

1. ✅ Teste com alguns exemplos de entrada
2. ✅ Use o painel admin normalmente
3. ✅ O histórico de equipes registradas via IA aparece no painel

Pronto! 🎉
