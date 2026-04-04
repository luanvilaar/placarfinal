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
