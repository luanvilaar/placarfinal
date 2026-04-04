"use client";

import React, { useEffect, useState } from 'react';
import { useRankingStore } from '@/store/useRankingStore';
import { RankingTable } from '@/components/RankingTable';
import { Maximize2, Minimize2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function PublicPage() {
  const { currentRound, rounds, fetchInitialData } = useRankingStore();
  const currentRoundObj = rounds.find(r => r.numero_round === currentRound);
  
  // Efeito de relógio e polling de dados para o telão
  const [time, setTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  useEffect(() => {
    // Relógio
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // Polling (auto-refresh dos dados a cada 5 segundos)
    // Garante que o telão esteja sincronizado mesmo se o WebSocket do Supabase Realtime estiver desativado
    const dataPoller = setInterval(() => {
      fetchInitialData();
    }, 5000);
    
    return () => {
      clearInterval(timer);
      clearInterval(dataPoller);
    };
  }, [fetchInitialData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-white font-sans overflow-hidden flex flex-col">
      {/* Header Telão */}
      <header className="p-8 md:p-12 flex justify-between items-end border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-6">
            <img src="/logo-fedeeracao.png" alt="Federação Logo" className="h-16 md:h-24 w-auto object-contain opacity-50" />
            <div className="h-16 w-[1px] bg-white/10 hidden md:block" />
            <img src="/logo-hibrido.png" alt="Híbrido Games Logo" className="h-24 md:h-32 w-auto object-contain drop-shadow-2xl" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 rounded-full bg-status-error animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/40">Live Competition System</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-light tracking-tighter">
              Híbrido <span className="text-violet font-medium italic">Games</span>
            </h1>
            <p className="text-white/30 font-mono text-sm mt-4 uppercase tracking-[0.5em]">Final Eliminatória — 2026</p>
          </div>
        </div>

        <div className="text-right flex flex-col items-end gap-4">
           <button 
             onClick={toggleFullscreen}
             className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-white/40 hover:text-white/80"
             title="Atalho: F"
           >
             {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
             <span className="text-[10px] font-mono uppercase tracking-widest">{isFullscreen ? 'Sair Fullscreen' : 'Tela Cheia'}</span>
           </button>

           <div className="bg-surface border border-border px-8 py-4 rounded-2xl">
              <span className="block text-xs font-mono text-white/30 uppercase tracking-widest mb-1">Status do Round</span>
              <span className="text-3xl font-mono text-violet">ROUND {currentRound} <span className="text-white/20">/ 4</span></span>
           </div>
           
           <div suppressHydrationWarning className="text-white/20 font-mono text-xl tracking-widest">
              {time.toLocaleTimeString('pt-BR', { hour12: false })}
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 max-w-7xl mx-auto w-full">
        {/* Carrossel de Patrocinadores (Premium UI) */}
        <div className="relative z-10 w-full bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden mb-12">
          {/* Efeito de brilho na borda superior */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-violet/30 to-transparent" />
          
          <div className="container mx-auto px-4 py-4 relative">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-[1px] w-12 md:w-32 bg-gradient-to-r from-transparent to-white/20"></div>
              <p className="text-white/50 text-xs md:text-sm font-mono uppercase tracking-[0.4em]">
                Marcas Parceiras do <span className="text-violet font-semibold ml-1">Híbrido Games</span>
              </p>
              <div className="h-[1px] w-12 md:w-32 bg-gradient-to-l from-transparent to-white/20"></div>
            </div>

            <div className="scroller relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_5%,white_95%,transparent)]">
              <div className="scroller-inner flex items-center gap-24 md:gap-32 py-4 w-max animate-scroll" style={{ '--scroll-duration': '50s' } as React.CSSProperties}>
                {[...Array(2)].map((_, index) => (
                  <React.Fragment key={index}>
                    {['d1.png', 'd2.png', 'd3.png', 'd4.png', 'd5.png', 'd6.png', 'd7.png', 'd11.png'].map((logo, idx) => (
                      <div key={`${index}-${idx}`} className="flex-shrink-0 flex items-center justify-center">
                        <img 
                          src={`/carrosel/${logo}`} 
                          alt={`Sponsor ${idx + 1}`} 
                          className="w-auto object-contain h-36 md:h-48 lg:h-52 opacity-90 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-transform duration-1000" 
                          loading="lazy" 
                        />
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-scroll { animation: scroll var(--scroll-duration, 50s) linear infinite; }
          `}} />
        </div>

         <div className="grid grid-cols-1 gap-12">
            <section className="space-y-8">
               <div className="flex justify-between items-end">
                  <h2 className="text-2xl font-light tracking-widest uppercase text-white/60">Ranking <span className="text-violet">Ao Vivo</span></h2>
                  <div className="flex gap-8 font-mono text-[10px] text-white/30 uppercase tracking-widest">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-status-success" />
                        Classificado
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-status-error" />
                        Zona de Risco
                     </div>
                  </div>
               </div>

               <div className="animate-in slide-in-from-bottom-8 duration-1000">
                  <RankingTable roundId={currentRoundObj?.id || ''} isPublic />
               </div>
            </section>
         </div>
      </main>

      {/* Footer / Ticker */}
      <footer className="bg-surface/50 border-t border-border p-6 flex justify-between items-center relative z-10">
         <div className="flex gap-12">
            <div className="flex flex-col">
               <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Próxima Etapa</span>
               <span className="text-sm font-medium">Round {currentRound < 4 ? currentRound + 1 : 'Final'}</span>
            </div>
            <div className="flex flex-col border-l border-white/10 pl-12">
               <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Critério</span>
               <span className="text-sm font-medium text-status-warning">Menor Tempo</span>
            </div>
         </div>
         
         <div className="font-mono text-[10px] text-white/20 uppercase tracking-[0.2em]">
            Powered by AIOX Framework & Híbrido Games Engineering
         </div>
      </footer>

      {/* Background Decor */}
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet/5 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}
