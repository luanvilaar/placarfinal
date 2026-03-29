import React from 'react';
import { useRankingStore, Team, Resultado } from '@/store/useRankingStore';
import { Trophy, ArrowDown, ArrowUp } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface RankingTableProps {
  roundId: string;
  isPublic?: boolean;
}

export const RankingTable: React.FC<RankingTableProps> = ({ roundId, isPublic = false }) => {
  const { teams, resultados, rounds } = useRankingStore();
  
  const currentRoundObj = rounds.find(r => r.id === roundId);

  const roundResults = resultados
    .filter(r => r.round_id === roundId)
    .sort((a, b) => a.tempo_em_segundos - b.tempo_em_segundos);

  const eliminadosCount = currentRoundObj?.quantidade_eliminados || 0;
  
  // Total de equipes ativas preparadas para disputar o round
  let baseEquipesCount = currentRoundObj?.numero_round === 1 
    ? teams.length
    : teams.filter(t => t.status === 'Classificada' || t.status === 'Ativa').length;

  // Proteção: O total de equipes avaliadas na tabela nunca deve ser menor que o total de pontuações reais
  const totalEquipesAptas = Math.max(baseEquipesCount, roundResults.length);

  // --- Lógica de Animação e Suspense (Apenas Telão) ---
  const previousCountRef = React.useRef(roundResults.length);
  const [isShuffling, setIsShuffling] = React.useState(false);
  const [shufflePhase, setShufflePhase] = React.useState<'50%'|'100%'|''>('');
  const [shuffleTick, setShuffleTick] = React.useState(0);

  React.useEffect(() => {
    if (!isPublic) return;
    const currentCount = roundResults.length;
    const prevCount = previousCountRef.current;
    
    if (prevCount !== currentCount) {
      const threshold50 = Math.floor(totalEquipesAptas / 2);
      const threshold100 = totalEquipesAptas;

      const hit50 = prevCount < threshold50 && currentCount >= threshold50 && threshold50 > 0;
      const hit100 = prevCount < threshold100 && currentCount === threshold100 && threshold100 > 0;

      if (hit50 || hit100) {
        setShufflePhase(hit100 ? '100%' : '50%');
        setIsShuffling(true);
        setTimeout(() => {
          setIsShuffling(false);
          setShufflePhase('');
        }, 6000); // 6 segundos de suspense piscando cards
      }
      previousCountRef.current = currentCount;
    }
  }, [roundResults.length, totalEquipesAptas, isPublic]);

  React.useEffect(() => {
    if (isShuffling) {
      const interval = setInterval(() => {
        setShuffleTick(t => t + 1);
      }, 300); // Troca posição e pisca a cada 300ms
      return () => clearInterval(interval);
    }
  }, [isShuffling]);

  // Garante que o embaralhamento seja determinístico dentro de um mesmo ciclo de renderização
  const displayResults = React.useMemo(() => {
    if (!isShuffling) return roundResults;
    const shuffled = [...roundResults];
    // Fisher-Yates determinístico para não gerar layouts caóticos aleatórios fora do intervalo do tick
    let seed = shuffleTick;
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [roundResults, isShuffling, shuffleTick]);

  // Early return deve vir sempre APÓS todos os hooks
  if (!currentRoundObj) return null;

  // Index fixo onde a zona de eliminação começa (do final para cima)
  const indexCorte = Math.max(0, totalEquipesAptas - eliminadosCount);

  return (
    <div className="w-full space-y-4 relative">
      {isShuffling && (
         <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute z-50 left-1/2 -translate-x-1/2 -top-12 bg-background/95 backdrop-blur-xl border border-violet/50 px-8 py-4 rounded-full shadow-[0_0_30px_rgba(139,92,246,0.6)] flex items-center gap-4"
         >
            <div className="w-4 h-4 border-2 border-violet border-t-transparent rounded-full animate-spin"></div>
            <span className="text-violet font-mono text-sm tracking-[0.2em] font-bold uppercase animate-pulse">
               {shufflePhase === '100%' ? 'Auditando Resultados Finais...' : 'Processando Linha de Corte...'}
            </span>
         </motion.div>
      )}

      <AnimatePresence mode="popLayout">
        {(() => {
          const listItems: React.ReactNode[] = [];

          displayResults.forEach((res, index) => {
            const team = teams.find(t => t.id === res.equipe_id);
            if (!team) return;

            // Pega a verdadeira posição deste resultado na tabela original para fins de ranking real
            const realRank = roundResults.findIndex(r => r.id === res.id);
            const isAboveCorte = realRank < indexCorte;
            const isLider = realRank === 0;

            // Insere a linha de corte antes do item que está exatamente no indexCorte
            // Só exibi-la se não estiver no suspense
            if (!isShuffling && index === indexCorte) {
              listItems.push(
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={`cutline-${roundId}`}
                  className="w-full relative"
                >
                  {!isPublic ? (
                    <div className="relative py-4 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-status-error border-dashed opacity-50"></div>
                      </div>
                      <span className="relative px-4 bg-background text-status-error text-[10px] font-mono tracking-widest uppercase">
                        Linha de Corte ({eliminadosCount} Eliminados)
                      </span>
                    </div>
                  ) : (
                    <div className="relative py-8 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-status-error to-transparent opacity-80 animate-pulse"></div>
                      </div>
                      <div className="relative z-10 px-6 py-2 bg-status-error/20 backdrop-blur-md border border-status-error/50 rounded-full text-status-error text-xs md:text-sm font-mono font-bold tracking-[0.2em] uppercase flex items-center gap-3 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse">
                        <span className="w-2.5 h-2.5 rounded-full bg-status-error animate-ping"></span>
                        Passíveis de Eliminação
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            }

            listItems.push(
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -30 }}
                transition={{
                  layout: { type: "spring", stiffness: 350, damping: 30 },
                  opacity: { duration: 0.3 }
                }}
                key={res.id || `${res.equipe_id}-${index}`}
                className="relative w-full block"
                style={{ zIndex: roundResults.length - index }}
              >
                <div className={clsx(
                  "group relative flex flex-row items-center justify-between p-3 sm:p-4 rounded-lg border transition-all duration-300 gap-2 sm:gap-4",
                  (!isShuffling && isLider) ? "bg-violet-glow border-violet shadow-[0_0_20px_rgba(139,92,246,0.1)]" : "bg-surface border-border",
                  (!isShuffling && !isAboveCorte) && "opacity-60 border-status-error/30",
                  isShuffling && "bg-black/50 border-violet/20"
                )}>
                  <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
                    <span className={clsx(
                      "font-mono text-xl sm:text-2xl w-8 sm:w-10 text-center shrink-0",
                      (!isShuffling && isLider) ? "text-violet font-bold" : "text-white/50"
                    )}>
                      {isShuffling ? "??" : (realRank + 1).toString().padStart(2, '0')}
                    </span>
                    
                    <div className="overflow-hidden min-w-0 pr-2">
                       <h3 className="text-white font-medium text-base sm:text-lg flex items-center gap-2 truncate">
                        <span className="truncate block">{team.nome}</span>
                        {!isShuffling && isLider && <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet animate-bounce shrink-0" />}
                      </h3>
                      <span className="text-white/30 text-[9px] sm:text-xs font-mono uppercase tracking-wider block truncate">
                        {team.categoria}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-8 shrink-0">
                    <div className="text-right">
                      {isShuffling ? (
                         <div className="w-16 sm:w-24 h-6 sm:h-8 bg-white/5 animate-pulse rounded"></div>
                      ) : (
                         <span className={clsx(
                          "block font-mono text-xl sm:text-2xl",
                          isLider ? "text-violet" : "text-white"
                         )}>
                          {res.tempo_formatado}
                         </span>
                      )}
                    </div>

                    {!isShuffling && (
                      <div className={clsx(
                        "hidden md:block px-3 py-1 rounded text-[10px] font-mono uppercase tracking-widest",
                        isAboveCorte ? "bg-status-success/10 text-status-success border border-status-success/20" : "bg-status-error/10 text-status-error border border-status-error/20"
                      )}>
                        {isAboveCorte ? 'Classificado' : 'Eliminado'}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          });

          // Caso a linha de corte ainda não tenha sido desenhada (porque poucos times jogaram)
          // Mas já queremos colocar ela no final como um limite visual em aberto
          if (!isShuffling && indexCorte > 0 && roundResults.length <= indexCorte && roundResults.length > 0) {
             // Opcional: renderizar a linha no final
             listItems.push(
               <motion.div layout key={`cutline-end-${roundId}`} className="w-full relative opacity-50 mt-8">
                 {!isPublic && (
                   <div className="relative py-4 flex items-center justify-center">
                     <div className="absolute inset-0 flex items-center">
                       <div className="w-full border-t border-status-warning border-dashed opacity-30"></div>
                     </div>
                     <span className="relative px-4 bg-background text-status-warning text-[10px] font-mono tracking-widest uppercase">
                       Corte a partir da {indexCorte + 1}ª posição
                     </span>
                   </div>
                 )}
               </motion.div>
             );
          }

          return listItems;
        })()}
      </AnimatePresence>

      {roundResults.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="text-center py-20 text-white/20 font-mono italic"
        >
          Aguardando resultados do round...
        </motion.div>
      )}
    </div>
  );
};
