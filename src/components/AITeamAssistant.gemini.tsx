'use client'
import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { useRankingStore } from '@/store/useRankingStore'

type HistoryEntry = { input: string; nome: string; categoria: string }

export function AITeamAssistant() {
  const { addTeam } = useRankingStore()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])

  const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY

  const handleSubmit = async () => {
    console.log('🤖 Chamando Gemini com input:', input)

    if (!input.trim() || loading) return
    if (!GEMINI_API_KEY) {
      setFeedback({ type: 'error', msg: '❌ Chave Gemini não configurada' })
      return
    }

    setLoading(true)
    setFeedback(null)

    try {
      // Prompt para o Gemini extrair dados
      const prompt = `Você é um assistente para extrair dados de competição.
Extraia o nome(s) da equipe(s) e a categoria do texto abaixo.
Categoria deve ser exatamente: "Masculino", "Feminino" ou "Misto".

Se houver múltiplas equipes (separadas por vírgula, "e", ou quebra de linha), retorne um JSON para CADA uma:
[
  {"nome": "Nome Equipe 1", "categoria": "Masculino"},
  {"nome": "Nome Equipe 2", "categoria": "Feminino"}
]

Se houver apenas uma equipe, retorne um array com um objeto:
[{"nome": "Nome da Equipe", "categoria": "Masculino"}]

Se não conseguir extrair, retorne:
[{"error": "Não foi possível identificar nome ou categoria"}]

TEXTO DO USUÁRIO:
${input}`

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

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      console.log('📝 Resposta bruta do Gemini:', text)

      // Tentar extrair JSON da resposta
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        setFeedback({ type: 'error', msg: '❌ Não consegui processar a resposta da IA' })
        setLoading(false)
        return
      }

      const parsed = JSON.parse(jsonMatch[0])
      console.log('✅ JSON parseado:', parsed)

      // Verificar se há erro
      if (parsed[0]?.error) {
        setFeedback({ type: 'error', msg: `❌ ${parsed[0].error}` })
        setLoading(false)
        return
      }

      // Filtrar resultados válidos
      const validTeams = parsed.filter(
        (item: any) => item.nome && item.categoria && !item.error
      )

      if (validTeams.length === 0) {
        setFeedback({ type: 'error', msg: '❌ Nenhuma equipe válida identificada' })
        setLoading(false)
        return
      }

      // Cadastrar todas as equipes
      const registered: HistoryEntry[] = []
      for (const team of validTeams) {
        console.log('📝 Cadastrando:', team.nome, team.categoria)
        await addTeam(team.nome, team.categoria)
        registered.push({ input: team.nome, nome: team.nome, categoria: team.categoria })
      }

      // Atualizar histórico
      setHistory(prev => [...registered, ...prev])

      // Mensagem de sucesso
      const message = registered.length === 1
        ? `✓ Equipe "${registered[0].nome}" cadastrada em ${registered[0].categoria}`
        : `✓ ${registered.length} equipes cadastradas: ${registered.map(e => e.nome).join(', ')}`

      setFeedback({ type: 'success', msg: message })
      setInput('')
    } catch (err: any) {
      console.error('❌ Erro:', err)
      setFeedback({
        type: 'error',
        msg: `❌ Erro: ${err.message || 'Tente novamente'}`
      })
    }
    setLoading(false)
  }

  return (
    <div className="bg-surface border border-border p-6 rounded-xl mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-violet-400" />
        <span className="text-xs font-mono text-white/30 uppercase tracking-widest">Assistente IA</span>
        <span className="text-xs bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded font-mono">Gemini</span>
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder='Ex: "Beira rio, Tanker, O segredo masculino" ou "Beta feminino"'
          className="flex-1 bg-background border border-border rounded px-3 py-2 text-white focus:border-violet-500 outline-none text-sm"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/40 px-4 py-2 rounded transition-all font-medium text-sm flex items-center gap-2 whitespace-nowrap"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : 'Enviar'}
        </button>
      </div>

      {feedback && (
        <div className={`mt-3 text-sm px-3 py-2 rounded border ${
          feedback.type === 'success'
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {feedback.msg}
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-4 border-t border-border pt-4">
          <p className="text-xs font-mono text-white/30 uppercase tracking-widest mb-2">Registradas via IA</p>
          {history.map((h, i) => (
            <div key={i} className="text-xs font-mono text-white/50 py-1">
              → <span className="text-white/80">{h.nome}</span> · {h.categoria}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
