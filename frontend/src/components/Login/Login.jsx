import { useState } from 'react';
import { authService } from '../../services/authService';
import { useNotification } from '../../contexts/NotificationContext';

function Login() {
  const notification = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [showRecuperar, setShowRecuperar] = useState(false);
  const [recuperarEmail, setRecuperarEmail] = useState('');
  const [recuperarLoading, setRecuperarLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleRecuperarSenha = async (e) => {
    e.preventDefault();
    setRecuperarLoading(true);
    try {
      const resp = await authService.recuperarSenha(recuperarEmail);
      if (notification?.success) notification.success(resp.mensagem);
      setShowRecuperar(false);
      setRecuperarEmail('');
    } catch (error) {
      if (notification?.error) notification.error(error.response?.data?.erro || 'Erro ao solicitar recuperação de senha');
    } finally {
      setRecuperarLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login(formData.email, formData.senha);
      
      if (notification?.success) {
        notification.success(`Bem-vindo(a), ${response.usuario.tipo === 'admin' ? 'Administrador' : response.usuario.profissional?.nome_completo || 'Profissional'}!`);
      }
      
      // Recarregar a página para atualizar o AuthContext
      window.location.reload();
      
    } catch (error) {
      if (notification?.error) {
        notification.error(error.response?.data?.erro || 'Erro ao realizar login');
      }
      console.error('Erro no login:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">
            Sistema Residencial
          </h1>
          <p className="text-slate-400">Acesse sua conta para continuar</p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all hover:border-slate-600/50"
                  placeholder="seu@email.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all hover:border-slate-600/50"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {/* Link Esqueci minha senha */}
              <div className="text-right mt-2">
                <button
                  type="button"
                  className="text-amber-400 hover:underline text-sm font-medium focus:outline-none"
                  onClick={() => setShowRecuperar(true)}
                >
                  Esqueci minha senha
                </button>
              </div>
            </div>

            {/* Botão Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-8 group"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Entrando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Entrar
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-slate-500 text-sm">
            © 2025 Sistema Residencial. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Modal de recuperação de senha */}
      {showRecuperar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl shadow-2xl w-full max-w-md relative">
            <button 
              className="absolute top-3 right-3 text-slate-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center transition-colors" 
              onClick={() => setShowRecuperar(false)}
              type="button"
            >
              ×
            </button>
            
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-2">Recuperar senha</h2>
              <p className="text-slate-400 text-sm">Digite seu e-mail para receber as instruções de recuperação</p>
            </div>
            
            <form onSubmit={handleRecuperarSenha} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">E-mail</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                  placeholder="seu@email.com"
                  value={recuperarEmail}
                  onChange={e => setRecuperarEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              
              <button
                type="submit"
                disabled={recuperarLoading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {recuperarLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Enviando...
                  </span>
                ) : (
                  'Enviar instruções'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
