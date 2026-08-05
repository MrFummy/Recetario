import { useState } from 'react';
import { Mail, Send, Loader2 } from 'lucide-react';
import { errorMessage } from '../lib/errors';

interface ShareByEmailProps {
  onShare: (email: string) => Promise<void>;
  /** Los fallos se muestran en el aviso general del modal, no aquí dentro. */
  onError: (message: string) => void;
}

export function ShareByEmail({ onShare, onError }: ShareByEmailProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSend = async () => {
    if (!targetEmail) return;
    setIsSending(true);
    try {
      await onShare(targetEmail);
      setSuccess(true);
      setTimeout(() => { setIsOpen(false); setSuccess(false); setTargetEmail(''); }, 3000);
    } catch (err) {
      onError(errorMessage(err, 'No se pudo enviar el email.'));
      setIsOpen(false);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Enviar por email"
        className="p-1.5 rounded-md text-ink-soft hover:text-accent hover:bg-accent-soft transition-colors"
      >
        <Mail size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-paper-2 p-3 border-2 border-ink shadow-brut-lg w-72 z-10 animate-in fade-in slide-in-from-top-2">
          {success ? (
            <div className="text-accent text-sm font-mono text-center py-2">✓ enviada con éxito</div>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">enviar a:</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  placeholder="amigo@email.com"
                  className="w-full text-sm px-2.5 py-1.5 border border-ink bg-paper focus:outline-none focus:border-accent"
                />
                <button
                  onClick={handleSend}
                  disabled={isSending || !targetEmail}
                  className="bg-accent text-paper p-2 hover:opacity-90 disabled:opacity-50"
                >
                  {isSending ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
