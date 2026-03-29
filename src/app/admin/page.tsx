"use client";

import React, { useState, useEffect } from 'react';
import { useRankingStore } from '@/store/useRankingStore';
import { TimeInput } from '@/components/TimeInput';
import { RankingTable } from '@/components/RankingTable';
import { Users, Timer, Settings, ExternalLink, Trash2, PlusCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'teams' | 'scores' | 'config'>('teams');
  const { 
    teams, addTeam, removeTeam, 
    currentRound, setCurrentRound,
    rounds, setResultado, closeRound, 
    updateEliminadosCount, clearRoundResults, 
    resultados, globalReset 
  } = useRankingStore();

  // States para formulário de equipe
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamCategory, setNewTeamCategory] = useState('');

  const currentRoundObj = rounds.find(r => r.numero_round === currentRound);

  // Filtrar equipes aptas para o round atual
  const eligibleTeams = teams.filter(t => {
    if (currentRound === 1) return true;
    return t.status === 'Classificada';
  });

  return (
    <div className="min-h-screen bg-background text-white p-6 md:p-12 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <img src="/logo-fedeeracao.png" alt="Federação Logo" className="h-10 w-auto object-contain opacity-50" />
            <div className="h-8 w-[1px] bg-white/10" />
            <img src="/logo-hibrido.png" alt="Híbrido Games Logo" className="h-16 w-auto object-contain drop-shadow-lg" />
          </div>
          <div>
            <h1 className="text-3xl font-light tracking-tight text-white/90">
              Híbrido Games <span className="text-violet font-mono text-xl ml-2">— OPERAÇÃO</span>
            </h1>
            <p className="text-white/40 font-mono text-xs mt-1 uppercase tracking-widest">Painel de Controle e Ranking</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => {
              if(confirm('ATENÇÃO ALERTA DE PERIGO: Isso apagará TODAS as equipes, os resultados e zerará os Rounds. Tem certeza?')) {
                globalReset();
              }
            }}
            className="flex items-center gap-2 bg-status-error/20 text-status-error hover:bg-status-error hover:text-white border border-status-error/50 px-4 py-2 rounded transition-all text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Reset Global
          </button>
          <Link 
            href="/public" 
            target="_blank"
            className="flex items-center gap-2 bg-surface hover:bg-white/10 border border-border px-4 py-2 rounded transition-all text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir Telão
          </Link>
          <button 
            onClick={() => closeRound(currentRoundObj?.id || '')}
            className="flex items-center gap-2 bg-violet hover:bg-violet/80 px-4 py-2 rounded transition-all text-sm font-medium"
          >
            <CheckCircle className="w-4 h-4" />
            Fechar Round {currentRound}
          </button>
        </div>
      </header>

      <nav className="flex gap-2 mb-8 p-1 bg-surface border border-border rounded-lg w-fit">
        <button 
          onClick={() => setActiveTab('teams')}
          className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all text-sm ${activeTab === 'teams' ? 'bg-violet text-white shadow-lg' : 'text-white/40 hover:text-white/70'}`}
        >
          <Users className="w-4 h-4" />
          Equipes
        </button>
        <button 
          onClick={() => setActiveTab('scores')}
          className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all text-sm ${activeTab === 'scores' ? 'bg-violet text-white shadow-lg' : 'text-white/40 hover:text-white/70'}`}
        >
          <Timer className="w-4 h-4" />
          Lançamentos
        </button>
        <button 
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all text-sm ${activeTab === 'config' ? 'bg-violet text-white shadow-lg' : 'text-white/40 hover:text-white/70'}`}
        >
          <Settings className="w-4 h-4" />
          Configuração
        </button>
      </nav>

      <main className="max-w-6xl">
        {activeTab === 'teams' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Form Cadastro */}
              <div className="bg-surface border border-border p-6 rounded-xl space-y-4 h-fit">
                <h2 className="text-lg font-medium border-b border-border pb-4 mb-4">Nova Equipe</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-mono text-white/30 uppercase tracking-widest block mb-2">Nome da Equipe</label>
                    <input 
                      type="text" 
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      className="w-full bg-background border border-border rounded px-3 py-2 text-white focus:border-violet outline-none" 
                      placeholder="Ex: Alphas"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-white/30 uppercase tracking-widest block mb-2">Categoria</label>
                    <input 
                      type="text" 
                      value={newTeamCategory}
                      onChange={(e) => setNewTeamCategory(e.target.value)}
                      className="w-full bg-background border border-border rounded px-3 py-2 text-white focus:border-violet outline-none" 
                      placeholder="Ex: Masculino"
                    />
                  </div>
                  <button 
                    onClick={() => {
                      if (newTeamName && newTeamCategory) {
                        addTeam(newTeamName, newTeamCategory);
                        setNewTeamName('');
                        setNewTeamCategory('');
                      }
                    }}
                    className="w-full bg-violet py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-violet/80 transition-all font-medium"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Cadastrar
                  </button>
                </div>
              </div>

              {/* Lista de Equipes */}
              <div className="md:col-span-2 space-y-4">
                <h2 className="text-lg font-medium">Equipes Cadastradas ({teams.length})</h2>
                <div className="grid grid-cols-1 gap-2">
                  {teams.map(team => (
                    <div key={team.id} className="bg-surface/50 border border-border p-4 rounded-lg flex justify-between items-center group">
                      <div>
                        <h4 className="text-white font-medium">{team.nome}</h4>
                        <span className="text-white/30 text-xs font-mono uppercase tracking-widest">{team.categoria}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${team.status === 'Ativa' ? 'border-status-success text-status-success' : 'border-status-error text-status-error opacity-50'}`}>
                          {team.status}
                        </span>
                        <button onClick={() => removeTeam(team.id)} className="text-white/20 hover:text-status-error transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {teams.length === 0 && <div className="text-center py-20 text-white/20 font-mono italic">Nenhuma equipe cadastrada.</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scores' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="flex items-center justify-between">
                <h2 className="text-2xl font-light">Lançamento de Tempos — <span className="text-violet font-mono">ROUND {currentRound}</span></h2>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(n => (
                    <button 
                      key={n}
                      disabled={rounds.find(r => r.numero_round === n)?.status === 'Aguardando' && n > 1}
                      onClick={() => setCurrentRound(n)}
                      className={`w-8 h-8 rounded-full border font-mono text-xs flex items-center justify-center transition-all ${currentRound === n ? 'bg-violet border-violet text-white' : 'border-border text-white/40 hover:border-white/20 disabled:opacity-20'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                     <h3 className="text-xs font-mono text-white/30 uppercase tracking-widest">Painel de Lançamento</h3>
                     <button 
                       onClick={() => {
                         if (confirm('Tem certeza que deseja apagar todos os tempos lançados neste round?')) {
                           clearRoundResults(currentRoundObj?.id || '');
                         }
                       }}
                       className="text-[10px] font-mono uppercase tracking-widest text-status-error/80 hover:text-status-error transition-colors flex items-center gap-1"
                     >
                       <Trash2 className="w-3 h-3" />
                       Resetar
                     </button>
                   </div>
                   <div className="bg-surface/30 border border-border rounded-xl divide-y divide-border/50">
                      {eligibleTeams.map(team => {
                        const res = resultados.find(r => r.equipe_id === team.id && r.round_id === currentRoundObj?.id);
                        return (
                          <div key={team.id} className="p-4 flex items-center justify-between group hover:bg-white/[0.02] transition-all">
                             <div>
                                <h4 className="text-white font-medium">{team.nome}</h4>
                                <span className="text-white/30 text-[10px] font-mono uppercase tracking-widest">{team.categoria}</span>
                             </div>
                             <TimeInput 
                                value={res?.tempo_formatado || ''}
                                onChange={(val) => setResultado(team.id, currentRoundObj?.id || '', val)}
                                className="w-32 text-center text-lg"
                             />
                          </div>
                        );
                      })}
                      {eligibleTeams.length === 0 && (
                        <div className="p-12 text-center text-white/20 font-mono italic">
                          Nenhuma equipe apta para este round. 
                          {currentRound > 1 && <br/>} {currentRound > 1 && "Verifique se fechou o round anterior."}
                        </div>
                      )}
                   </div>
                </div>

                <div className="space-y-6">
                   <h3 className="text-xs font-mono text-white/30 uppercase tracking-widest">Ranking Parcial do Round {currentRound}</h3>
                   <RankingTable roundId={currentRoundObj?.id || ''} />
                </div>
             </div>
          </div>
        )}

        {activeTab === 'config' && (
           <div className="max-w-xl space-y-8 animate-in fade-in duration-500">
              <h2 className="text-lg font-medium">Configurações Eliminatórias</h2>
              <div className="space-y-6 bg-surface border border-border p-8 rounded-xl">
                 {rounds.map(round => (
                   <div key={round.id} className="flex items-center justify-between">
                      <span className="font-mono text-sm uppercase tracking-widest text-white/60">Round {round.numero_round}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-white/30">Eliminar:</span>
                        <input 
                          type="number" 
                          value={round.quantidade_eliminados}
                          onChange={(e) => updateEliminadosCount(round.id, parseInt(e.target.value))}
                          className="w-20 bg-background border border-border rounded px-3 py-1 text-white font-mono focus:border-violet outline-none"
                        />
                        <span className="text-xs text-white/30">equipes</span>
                      </div>
                   </div>
                 ))}
                 <div className="pt-6 border-t border-border mt-6">
                    <p className="text-xs text-white/30 font-mono leading-relaxed">
                      * O sistema usará esses valores para calcular automaticamente quem avança ao fechar cada round.
                    </p>
                 </div>
              </div>
           </div>
        )}
      </main>
    </div>
  );
}
