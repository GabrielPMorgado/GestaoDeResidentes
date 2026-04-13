import { useState } from 'react';
import { authService } from '../../services/authService';
import { useNotification } from '../../contexts/NotificationContext';

function RedefinirSenha() {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');

  // Pega o token da URL
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  const notification = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    
    if (!token) {
      setErro('Token de recuperação não encontrado na URL.');
      return;
    }
    
    if (novaSenha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    
    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }
    
    setLoading(true);
    try {
      await authService.redefinirSenha(token, novaSenha);
      setSucesso(true);
      if (notification?.success) notification.success('Senha redefinida com sucesso!');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao redefinir senha.');
      if (notification?.error) notification.error(err.response?.data?.erro || 'Erro ao redefinir senha.');
    } finally {
      setLoading(false);
    }
  };

  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
          <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Senha redefinida!</h2>
          <p className="text-slate-300 mb-8">Você já pode fazer login com sua nova senha.</p>
          <a 
            href="/" 
            className="inline-block px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all shadow-lg"
          >
            Voltar ao login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-8 rounded-2xl shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Redefinir senha</h2>
            <p className="text-slate-400 text-sm">Digite sua nova senha abaixo</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Nova senha</label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                placeholder="Digite sua nova senha"
                value={novaSenha}
                onChange={e => setNovaSenha(e.target.value)}
                required
                minLength={6}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Confirmar senha</label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                placeholder="Confirme sua nova senha"
                value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
                required
                minLength={6}
              />
            </div>
            
            {erro && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm">{erro}</p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Redefinindo...
                </span>
              ) : (
                'Redefinir senha'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <a href="/" className="text-amber-400 hover:underline text-sm font-medium">
              Voltar ao login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RedefinirSenha;
