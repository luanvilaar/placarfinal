"use client";

import React, { useState, useEffect } from 'react';
import { useRankingStore } from '@/store/useRankingStore';
import { TimeInput } from '@/components/TimeInput';
import { RankingTable } from '@/components/RankingTable';
import { AITeamAssistant } from '@/components/AITeamAssistant';
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
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 md:mb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">
          <div className="flex items-center gap-4 shrink-0">
            <img src="/logo-fedeeracao.png" alt="Federação Logo" className="h-8 md:h-10 w-auto object-contain opacity-50" />
            <div className="h-6 md:h-8 w-[1px] bg-white/10" />
            <img src="/logo-hibrido.png" alt="Híbrido Games Logo" className="h-12 md:h-16 w-auto object-contain drop-shadow-lg" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-light tracking-tight text-white/90">
              Híbrido Games <span className="text-violet font-mono text-lg md:text-xl ml-0 block sm:inline sm:ml-2 mt-1 sm:mt-0">— OPERAÇÃO</span>
            </h1>
            <p className="text-white/40 font-mono text-[10px] md:text-xs mt-1 uppercase tracking-widest">Painel de Controle e Ranking</p>
          </div>
        </div>
        
        <div className="flex flex-wrap md:flex-nowrap gap-3 md:gap-4 w-full lg:w-auto">
          <button 
            onClick={() => {
              if(confirm('ATENÇÃO ALERTA DE PERIGO: Isso apagará TODAS as equipes, os resultados e zerará os Rounds. Tem certeza?')) {
                globalReset();
              }
            }}
            className="flex-1 lg:flex-none justify-center items-center gap-2 flex bg-status-error/20 text-status-error hover:bg-status-error hover:text-white border border-status-error/50 px-4 py-3 md:py-2 rounded transition-all text-xs md:text-sm font-medium whitespace-nowrap"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            Reset Global
          </button>
          <Link 
            href="/public" 
            target="_blank"
            className="flex-1 lg:flex-none justify-center items-center gap-2 flex bg-surface hover:bg-white/10 border border-border px-4 py-3 md:py-2 rounded transition-all text-xs md:text-sm whitespace-nowrap"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            Abrir Telão
          </Link>
          <button 
            onClick={() => closeRound(currentRoundObj?.id || '')}
            className="flex-1 w-full lg:w-auto lg:flex-none justify-center items-center gap-2 flex bg-violet hover:bg-violet/80 px-4 py-3 md:py-2 rounded transition-all text-xs md:text-sm font-medium whitespace-nowrap"
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            Fechar Round {currentRound}
          </button>
        </div>
      </header>

      <nav className="flex flex-row overflow-x-auto snap-x scrollbar-hide gap-2 mb-8 p-1 bg-surface border border-border rounded-lg w-full md:w-fit">
        <button 
          onClick={() => setActiveTab('teams')}
          className={`flex-shrink-0 flex items-center justify-center gap-2 px-6 py-3 md:py-2 rounded-md transition-all text-sm font-medium ${activeTab === 'teams' ? 'bg-violet text-white shadow-lg' : 'text-white/40 hover:text-white/70'}`}
        >
          <Users className="w-4 h-4 shrink-0" />
          Equipes
        </button>
        <button 
          onClick={() => setActiveTab('scores')}
          className={`flex-shrink-0 flex items-center justify-center gap-2 px-6 py-3 md:py-2 rounded-md transition-all text-sm font-medium ${activeTab === 'scores' ? 'bg-violet text-white shadow-lg' : 'text-white/40 hover:text-white/70'}`}
        >
          <Timer className="w-4 h-4 shrink-0" />
          Lançamentos
        </button>
        <button 
          onClick={() => setActiveTab('config')}
          className={`flex-shrink-0 flex items-center justify-center gap-2 px-6 py-3 md:py-2 rounded-md transition-all text-sm font-medium ${activeTab === 'config' ? 'bg-violet text-white shadow-lg' : 'text-white/40 hover:text-white/70'}`}
        >
          <Settings className="w-4 h-4 shrink-0" />
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
                    <div key={team.id} className="bg-surface/50 border border-border p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group">
                      <div className="max-w-full overflow-hidden">
                        <h4 className="text-white font-medium truncate">{team.nome}</h4>
                        <span className="text-white/30 text-xs font-mono uppercase tracking-widest block truncate">{team.categoria}</span>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${team.status === 'Ativa' ? 'border-status-success text-status-success' : 'border-status-error text-status-error opacity-50'}`}>
                          {team.status}
                        </span>
                        <button onClick={() => removeTeam(team.id)} className="text-white/20 hover:text-status-error transition-colors p-2 sm:p-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {teams.length === 0 && <div className="text-center py-20 text-white/20 font-mono italic">Nenhuma equipe cadastrada.</div>}
                </div>
              </div>
            </div>
            <AITeamAssistant />
          </div>
        )}

        {activeTab === 'scores' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <h2 className="text-xl md:text-2xl font-light">Lançamento de Tempos — <br className="md:hidden" /><span className="text-violet font-mono text-lg md:text-2xl">ROUND {currentRound}</span></h2>
                <div className="flex flex-wrap gap-2 w-full md:w-auto mt-2 md:mt-0">
                  {[1, 2, 3, 4].map(n => (
                    <button 
                      key={n}
                      disabled={rounds.find(r => r.numero_round === n)?.status === 'Aguardando' && n > 1}
                      onClick={() => setCurrentRound(n)}
                      className={`w-10 h-10 md:w-8 md:h-8 rounded-full border font-mono flex-shrink-0 text-xs md:text-sm flex items-center justify-center transition-all ${currentRound === n ? 'bg-violet border-violet text-white' : 'border-border text-white/40 hover:border-white/20 disabled:opacity-20'}`}
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
                          <div key={team.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:bg-white/[0.02] transition-all">
                             <div className="w-full sm:w-auto overflow-hidden">
                                <h4 className="text-white font-medium truncate">{team.nome}</h4>
                                <span className="text-white/30 text-[10px] font-mono uppercase tracking-widest block truncate">{team.categoria}</span>
                             </div>
                             <TimeInput 
                                value={res?.tempo_formatado || ''}
                                onChange={(val) => setResultado(team.id, currentRoundObj?.id || '', val)}
                                className="w-full sm:w-32 text-center text-lg mt-1 sm:mt-0 font-medium tracking-widest"
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
                   <div key={round.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <span className="font-mono text-sm uppercase tracking-widest text-white/60 font-medium">Round {round.numero_round}</span>
                      <div className="flex items-center gap-3 w-full sm:w-auto p-3 sm:p-0 bg-white/[0.02] sm:bg-transparent rounded-lg border sm:border-0 border-white/5">
                        <span className="text-xs text-white/40">Eliminar:</span>
                        <input 
                          type="number" 
                          value={round.quantidade_eliminados}
                          onChange={(e) => updateEliminadosCount(round.id, parseInt(e.target.value))}
                          className="w-16 bg-background border border-border rounded px-2 py-1.5 text-white font-mono text-center focus:border-violet outline-none"
                        />
                        <span className="text-xs text-white/40">eq.</span>
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
