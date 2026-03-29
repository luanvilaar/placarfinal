import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export type TeamStatus = 'Ativa' | 'Classificada' | 'Eliminada' | 'Campeã';
export type RoundStatus = 'Aguardando' | 'Em andamento' | 'Fechado';

export interface Team {
  id: string;
  nome: string;
  categoria: string;
  status: TeamStatus;
  criado_em: string;
}

export interface Round {
  id: string;
  numero_round: number;
  quantidade_eliminados: number;
  status: RoundStatus;
}

export interface Resultado {
  id?: string;
  equipe_id: string;
  round_id: string;
  tempo_formatado: string;
  tempo_em_segundos: number;
}

interface RankingState {
  teams: Team[];
  rounds: Round[];
  resultados: Resultado[];
  currentRound: number;
  loading: boolean;
  
  // Actions
  fetchInitialData: () => Promise<void>;
  addTeam: (nome: string, categoria: string) => Promise<void>;
  removeTeam: (id: string) => Promise<void>;
  setResultado: (equipe_id: string, round_id: string, tempo: string) => Promise<void>;
  clearRoundResults: (round_id: string) => Promise<void>;
  closeRound: (round_id: string) => Promise<void>;
  updateEliminadosCount: (round_id: string, count: number) => Promise<void>;
  setCurrentRound: (numero: number) => void;
  globalReset: () => Promise<void>;
  
  // Realtime subscription setup
  subscribeToChanges: () => () => void;
}

const timeToSeconds = (time: string): number => {
  const [min, sec] = time.split(':').map(Number);
  return min * 60 + sec;
};

export const useRankingStore = create<RankingState>((set, get) => ({
  teams: [],
  rounds: [],
  resultados: [],
  currentRound: 1,
  loading: false,

  fetchInitialData: async () => {
    set({ loading: true });
    const { data: teams } = await supabase.from('teams').select('*').order('criado_em', { ascending: true });
    const { data: rounds } = await supabase.from('rounds').select('*').order('numero_round', { ascending: true });
    const { data: resultados } = await supabase.from('resultados').select('*');
    
    const activeRound = rounds?.find(r => r.status === 'Em andamento')?.numero_round || 1;
    
    set({ 
      teams: teams || [], 
      rounds: rounds || [], 
      resultados: resultados || [],
      currentRound: activeRound,
      loading: false 
    });
  },

  addTeam: async (nome, categoria) => {
    const { error } = await supabase.from('teams').insert([{ nome, categoria, status: 'Ativa' }]);
    if (!error) await get().fetchInitialData();
  },

  removeTeam: async (id) => {
    const { error } = await supabase.from('teams').delete().eq('id', id);
    if (!error) await get().fetchInitialData();
  },

  setResultado: async (equipe_id, round_id, tempo) => {
    const seconds = timeToSeconds(tempo);
    const { data: existing } = await supabase
      .from('resultados')
      .select('id')
      .eq('equipe_id', equipe_id)
      .eq('round_id', round_id)
      .single();

    if (existing) {
      await supabase
        .from('resultados')
        .update({ tempo_formatado: tempo, tempo_em_segundos: seconds })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('resultados')
        .insert([{ equipe_id, round_id, tempo_formatado: tempo, tempo_em_segundos: seconds }]);
    }
    // Refresh for immediate UI react
    await get().fetchInitialData();
  },

  clearRoundResults: async (round_id) => {
    await supabase.from('resultados').delete().eq('round_id', round_id);
    await get().fetchInitialData();
  },

  updateEliminadosCount: async (round_id, count) => {
    await supabase.from('rounds').update({ quantidade_eliminados: count }).eq('id', round_id);
    await get().fetchInitialData();
  },

  setCurrentRound: (numero) => set({ currentRound: numero }),

  closeRound: async (round_id) => {
    const { teams, resultados, rounds } = get();
    const currentRoundObj = rounds.find((r) => r.id === round_id);
    if (!currentRoundObj) return;

    const resultadosRound = resultados
      .filter((r) => r.round_id === round_id)
      .sort((a, b) => a.tempo_em_segundos - b.tempo_em_segundos);

    const eliminadosCount = currentRoundObj.quantidade_eliminados;
    const totalNoRound = resultadosRound.length;
    const indexCorte = totalNoRound - eliminadosCount;

    // Atualizar status das equipes no Supabase
    for (let i = 0; i < resultadosRound.length; i++) {
        const res = resultadosRound[i];
        const isEliminado = i >= indexCorte && indexCorte >= 0;
        await supabase
            .from('teams')
            .update({ status: isEliminado ? 'Eliminada' : 'Classificada' })
            .eq('id', res.equipe_id);
    }

    // Avançar Round
    await supabase.from('rounds').update({ status: 'Fechado' }).eq('id', round_id);
    const nextRound = rounds.find(r => r.numero_round === currentRoundObj.numero_round + 1);
    if (nextRound) {
        await supabase.from('rounds').update({ status: 'Em andamento' }).eq('id', nextRound.id);
    }
    
    await get().fetchInitialData();
  },

  globalReset: async () => {
    const { teams, resultados, rounds } = get();
    // Delete all results and teams one by one if neq is blocked by RLS
    for (const r of resultados) { await supabase.from('resultados').delete().eq('id', r.id); }
    for (const t of teams) { await supabase.from('teams').delete().eq('id', t.id); }
    for (const rd of rounds) { 
        await supabase.from('rounds').update({ status: rd.numero_round === 1 ? 'Em andamento' : 'Aguardando', quantidade_eliminados: 2 }).eq('id', rd.id); 
    }
    await get().fetchInitialData();
    set({ currentRound: 1 });
  },

  subscribeToChanges: () => {
    const teamsSub = supabase.channel('teams-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () => get().fetchInitialData())
      .subscribe();

    const roundsSub = supabase.channel('rounds-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rounds' }, () => get().fetchInitialData())
      .subscribe();

    const resultsSub = supabase.channel('results-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resultados' }, () => get().fetchInitialData())
      .subscribe();

    return () => {
      supabase.removeChannel(teamsSub);
      supabase.removeChannel(roundsSub);
      supabase.removeChannel(resultsSub);
    };
  }
}));
