import Link from 'next/link';
import { ExternalLink, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-white flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center gap-6 mb-4">
            <img src="/logo-fedeeracao.png" alt="Federação Logo" className="h-16 w-auto object-contain opacity-40" />
            <div className="h-12 w-[1px] bg-white/10" />
            <img src="/logo-hibrido.png" alt="Híbrido Games Logo" className="w-40 h-auto object-contain drop-shadow-2xl" />
          </div>
          <h1 className="text-5xl font-light tracking-tighter">
            Híbrido <span className="text-violet font-medium italic">Games</span>
          </h1>
          <p className="text-white/40 font-mono text-xs uppercase tracking-[0.5em]">Live Competition System</p>
        </div>

        <div className="grid grid-cols-1 gap-4 pt-12">
          <Link 
            href="/public" 
            className="group flex items-center justify-between bg-surface border border-border p-6 rounded-2xl hover:border-violet transition-all"
          >
            <div className="text-left">
              <span className="block text-sm font-medium text-white/80 group-hover:text-violet transition-colors">Visualizar Telão</span>
              <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Página Pública para TVs</span>
            </div>
            <ExternalLink className="w-5 h-5 text-white/20 group-hover:text-violet" />
          </Link>

          <Link 
            href="/admin" 
            className="group flex items-center justify-between bg-surface border border-border p-6 rounded-2xl hover:border-violet transition-all"
          >
            <div className="text-left">
              <span className="block text-sm font-medium text-white/80 group-hover:text-violet transition-colors">Painel de Operação</span>
              <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Gestão de Equipes e Tempos</span>
            </div>
            <ShieldCheck className="w-5 h-5 text-white/20 group-hover:text-violet" />
          </Link>
        </div>

        <div className="pt-12 font-mono text-[10px] text-white/10 uppercase tracking-widest">
          © 2026 Híbrido Games Engineering
        </div>
      </div>

      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet/5 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
