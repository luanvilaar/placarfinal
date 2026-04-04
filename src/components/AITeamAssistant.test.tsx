'use client'
import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { useRankingStore } from '@/store/useRankingStore'

type HistoryEntry = { input: string; nome: string; categoria: string }

/**
 * Versão de TESTE do AITeamAssistant com mock local
 * Use para debugar sem Edge Function deployada
 *
 * Para ativar, mude em src/app/admin/page.tsx:
 * import { AITeamAssistant } from '@/components/AITeamAssistant.test'
 */

// Categorias possíveis
const categoryMap: { [key: string]: string } = {
  'masculino': 'Masculino',
  'masc': 'Masculino',
  'male': 'Masculino',
  'homem': 'Masculino',
  'dupla masculino': 'Masculino',
  'feminino': 'Feminino',
  'fem': 'Feminino',
  'female': 'Feminino',
  'mulher': 'Feminino',
  'dupla feminino': 'Feminino',
  'misto': 'Misto',
  'mixed': 'Misto',
  'open': 'Misto',
  'dupla': 'Misto',
  'dupla misto': 'Misto',
  'rx': 'Misto',
}

// Extrair UMA equipe do texto
function extractSingleTeam(text: string, defaultCategory: string = 'Masculino'): { nome: string; categoria: string } | null {
  // Normalizar
  const normalized = text.toLowerCase().trim()

  // Se vazio, pula
  if (!normalized || normalized.length < 2) {
    return null
  }

  // Detectar categoria
  let categoria = defaultCategory
  for (const [key, val] of Object.entries(categoryMap)) {
    if (normalized.includes(key)) {
      categoria = val
      break
    }
  }

  // Remover marcadores de categoria do nome
  let nome = text
  for (const key of Object.keys(categoryMap)) {
    nome = nome.replace(new RegExp(`\\b${key}\\b`, 'gi'), '').trim()
  }

  // Limpar palavras-chave
  nome = nome
    .replace(/^(equipe|team|time|cadastrar|adicionar|new|nova|-)[\s:]*/gi, '')
    .trim()

  // Se ficou vazio, pula
  if (!nome || nome.length < 2) {
    return null
  }

  // Capitalizar cada palavra
  nome = nome
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim()

  return { nome, categoria }
}

// Extrair MÚLTIPLAS equipes do texto
function extractTeamInfo(text: string): { nome: string; categoria: string }[] | null {
  // Detectar categoria global (no final do texto)
  let globalCategory = 'Masculino'
  const categoryRegex = /\b(masculino|feminino|misto|dupla|rx)\b/gi
  const categoryMatch = text.match(categoryRegex)
  if (categoryMatch) {
    const lastCategory = categoryMatch[categoryMatch.length - 1].toLowerCase()
    for (const [key, val] of Object.entries(categoryMap)) {
      if (lastCategory.includes(key)) {
        globalCategory = val
        break
      }
    }
  }

  // Separadores de múltiplas equipes
  // Suporte: vírgulas, "e", quebras de linha, ponto-e-vírgula
  let teams: string[] = []

  // Primeiro, tenta separar por vírgula
  if (text.includes(',')) {
    teams = text.split(',').map(t => t.trim())
  }
  // Depois por " e " (mas cuidado para não quebrar nomes com "e" no meio)
  else if (text.match(/\be\b/gi) && text.match(/\be\b/gi)!.length > 1) {
    teams = text.split(/\be\b/gi).map(t => t.trim())
  }
  // Se só tem uma, trata como string única
  else {
    teams = [text]
  }

  // Extrair nome+categoria de cada equipe
  const results = teams
    .map(team => extractSingleTeam(team, globalCategory))
    .filter((team): team is { nome: string; categoria: string } => team !== null)

  return results.length > 0 ? results : null
}

export function AITeamAssistant() {
  const { addTeam } = useRankingStore()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])

  const handleSubmit = async () => {
    console.log('🔍 handleSubmit chamado com input:', input)

    if (!input.trim() || loading) {
      console.log('⏭️ Input vazio ou já carregando, saindo')
      return
    }

    setLoading(true)
    setFeedback(null)

    try {
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 800))

      // Usar mock local (agora retorna array de equipes)
      const results = extractTeamInfo(input)
      console.log('📊 Resultado do mock:', results)

      if (!results || results.length === 0) {
        setFeedback({ type: 'error', msg: '❌ Não consegui identificar nome ou categoria. Tente: "equipe Alphas masculino"' })
      } else {
        // Cadastrar todas as equipes
        const registered: HistoryEntry[] = []

        for (const result of results) {
          console.log('✅ Cadastrando:', result.nome, result.categoria)
          await addTeam(result.nome, result.categoria)
          registered.push({ input: result.nome, nome: result.nome, categoria: result.categoria })
        }

        // Atualizar histórico e feedback
        setHistory(prev => [...registered, ...prev])

        const message = registered.length === 1
          ? `✓ Equipe "${registered[0].nome}" cadastrada em ${registered[0].categoria}`
          : `✓ ${registered.length} equipes cadastradas: ${registered.map(e => e.nome).join(', ')}`

        setFeedback({ type: 'success', msg: message })
        setInput('')
      }
    } catch (err) {
      console.error('❌ Erro:', err)
      setFeedback({ type: 'error', msg: 'Erro ao cadastrar. Tente novamente.' })
    }
    setLoading(false)
  }

  return (
    <div className="bg-surface border border-border p-6 rounded-xl mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-violet-400" />
        <span className="text-xs font-mono text-white/30 uppercase tracking-widest">Assistente IA</span>
        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded font-mono">TESTE</span>
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => {
            console.log('Input digitado:', e.target.value)
            setInput(e.target.value)
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              console.log('Enter pressionado')
              handleSubmit()
            }
          }}
          placeholder='Ex: "equipe Alphas masculino" ou "Beta feminino"'
          className="flex-1 bg-background border border-border rounded px-3 py-2 text-white focus:border-violet-500 outline-none text-sm"
        />
        <button
          onClick={() => {
            console.log('Botão clicado!')
            handleSubmit()
          }}
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
          <p className="text-xs font-mono text-white/30 uppercase tracking-widest mb-2">Registradas via IA (TESTE)</p>
          {history.map((h, i) => (
            <div key={i} className="text-xs font-mono text-white/50 py-1">
              → <span className="text-white/80">{h.nome}</span> · {h.categoria}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-xs font-mono text-white/20 border-t border-border pt-4">
        ℹ️ Modo TESTE (mock local). Quando a Edge Function estiver deployada, remova ".test" do import em admin/page.tsx
      </div>
    </div>
  )
}
