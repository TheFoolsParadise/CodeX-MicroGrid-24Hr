import React from 'react';
import { Info, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning';
  title: string;
  message: string;
}

interface Props {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastFeed: React.FC<Props> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 right-4 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start space-x-2.5 p-3 rounded-lg border shadow-lg backdrop-blur-md text-xs font-mono transition-all animate-slideIn ${
            t.type === 'warning'
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
              : t.type === 'success'
              ? 'bg-market-green/15 border-market-green/40 text-emerald-200'
              : 'bg-grid-900/90 border-grid-border text-slate-200'
          }`}
        >
          {t.type === 'warning' ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          ) : t.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-market-green shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 text-market-cyan shrink-0 mt-0.5" />
          )}

          <div className="flex-1">
            <div className="font-bold text-white">{t.title}</div>
            <div className="text-[11px] opacity-90">{t.message}</div>
          </div>

          <button
            onClick={() => onDismiss(t.id)}
            className="text-slate-400 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
