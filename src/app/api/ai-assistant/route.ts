import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        [{ error: 'Chave Gemini não configurada.' }],
        { status: 500 }
      )
    }

    const prompt = `Você é um assistente para extrair dados de competição.
Extraia o nome(s) da equipe(s) e a categoria do texto abaixo.
Categoria deve ser exatamente: "Masculino", "Feminino" ou "Misto".

Se houver múltiplas equipes (separadas por vírgula, "e", ou quebra de linha), retorne um JSON para CADA uma:
[
  {"nome": "Nome Equipe 1", "categoria": "Masculino"},
  {"nome": "Nome Equipe 2", "categoria": "Feminino"}
]

Se houver apenas uma equipe:
[{"nome": "Nome da Equipe", "categoria": "Masculino"}]

Se não conseguir extrair:
[{"error": "Não foi possível identificar nome ou categoria"}]

TEXTO DO USUÁRIO:
${message}`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Gemini API error:', error)
      return NextResponse.json(
        [{ error: 'Erro ao chamar Gemini' }],
        { status: response.status }
      )
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    const result = JSON.parse(jsonMatch ? jsonMatch[0] : '[]')

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('API route error:', error)
    return NextResponse.json(
      [{ error: 'Erro ao processar solicitação' }],
      { status: 422 }
    )
  }
}
