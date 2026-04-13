import { useState } from 'react';
import { authService } from '../../services/authService';
import { useNotification } from '../../contexts/NotificationContext';
import { useApp } from '../../contexts/AppContext';

export default function TrocarSenha() {
  const { actions } = useApp();
  const notification = useNotification();
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    atual: false,
    nova: false,
    confirmar: false
  });
  const [formData, setFormData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });

  // Calcular força da senha
  const calcularForcaSenha = (senha) => {
    if (!senha) return { forca: 0, texto: '', cor: '' };
    
    let forca = 0;
    const requisitos = {
      tamanho: senha.length >= 8,
      maiuscula: /[A-Z]/.test(senha),
      minuscula: /[a-z]/.test(senha),
      numero: /[0-9]/.test(senha),
      especial: /[!@#$%^&*(),.?":{}|<>]/.test(senha)
    };

    // Calcular pontuação
    if (requisitos.tamanho) forca += 20;
    if (requisitos.maiuscula) forca += 20;
    if (requisitos.minuscula) forca += 20;
    if (requisitos.numero) forca += 20;
    if (requisitos.especial) forca += 20;

    // Bônus por comprimento
    if (senha.length >= 12) forca += 10;
    if (senha.length >= 16) forca += 10;

    let texto = '';
    let cor = '';
    
    if (forca < 40) {
      texto = 'Muito Fraca';
      cor = 'bg-red-500';
    } else if (forca < 60) {
      texto = 'Fraca';
      cor = 'bg-orange-500';
    } else if (forca < 80) {
      texto = 'Média';
      cor = 'bg-yellow-500';
    } else if (forca < 100) {
      texto = 'Forte';
      cor = 'bg-green-500';
    } else {
      texto = 'Muito Forte';
      cor = 'bg-emerald-500';
    }

    return { forca, texto, cor, requisitos };
  };

  const forcaSenha = calcularForcaSenha(formData.novaSenha);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleShowPassword = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validarFormulario = () => {
    if (!formData.senhaAtual) {
      notification.error('Digite sua senha atual');
      return false;
    }

    if (!formData.novaSenha) {
      notification.error('Digite a nova senha');
      return false;
    }

    if (formData.novaSenha !== formData.confirmarSenha) {
      notification.error('As senhas não coincidem');
      return false;
    }

    if (formData.novaSenha.length < 8) {
      notification.error('A nova senha deve ter no mínimo 8 caracteres');
      return false;
    }

    if (!forcaSenha.requisitos.maiuscula) {
      notification.error('A senha deve conter pelo menos uma letra maiúscula');
      return false;
    }

    if (!forcaSenha.requisitos.minuscula) {
      notification.error('A senha deve conter pelo menos uma letra minúscula');
      return false;
    }

    if (!forcaSenha.requisitos.numero) {
      notification.error('A senha deve conter pelo menos um número');
      return false;
    }

    if (!forcaSenha.requisitos.especial) {
      notification.error('A senha deve conter pelo menos um caractere especial');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;

    setLoading(true);
    try {
      await authService.trocarSenha(
        formData.senhaAtual,
        formData.novaSenha,
        formData.confirmarSenha
      );
      
      notification.success('Senha alterada com sucesso! Faça login novamente.');
      setFormData({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
      
      // Fazer logout e redirecionar para login
      setTimeout(() => {
        authService.logout();
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      console.error('Erro ao trocar senha:', error);
      notification.error(
        error.response?.data?.erro || 'Erro ao trocar senha'
      );
    } finally {
      setLoading(false);
    }
  };

  const requisitos = [
    { key: 'tamanho', label: 'Mínimo 8 caracteres' },
    { key: 'maiuscula', label: 'Uma letra maiúscula (A-Z)' },
    { key: 'minuscula', label: 'Uma letra minúscula (a-z)' },
    { key: 'numero', label: 'Um número (0-9)' },
    { key: 'especial', label: 'Um caractere especial (!@#$%...)' },
  ];

  const renderPasswordField = (id, name, label, icon, placeholder, showKey) => (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-300 mb-2">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <i className={`bi ${icon} text-slate-500 group-focus-within:text-amber-400 transition-colors`}></i>
        </div>
        <input
          type={showPasswords[showKey] ? 'text' : 'password'}
          id={id}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          required
          className="w-full pl-10 pr-12 py-3 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 transition-all outline-none"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => toggleShowPassword(showKey)}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-amber-400 transition-colors"
        >
          <i className={`bi ${showPasswords[showKey] ? 'bi-eye-slash' : 'bi-eye'}`}></i>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 mb-4 shadow-lg shadow-amber-500/10">
            <i className="bi bi-shield-lock text-3xl text-amber-400"></i>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Trocar Senha</h1>
          <p className="text-slate-400">Mantenha sua conta segura atualizando sua senha</p>
        </div>

        {/* Card do Formulário */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            {renderPasswordField('senhaAtual', 'senhaAtual', 'Senha Atual', 'bi-lock', 'Digite sua senha atual', 'atual')}
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-700/50"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-slate-800/50 text-slate-500 text-xs font-semibold uppercase tracking-wider">Nova Senha</span>
              </div>
            </div>

            {renderPasswordField('novaSenha', 'novaSenha', 'Nova Senha', 'bi-key', 'Mínimo 8 caracteres', 'nova')}

            {/* Indicador de Força */}
            {formData.novaSenha && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-400">Força da senha</span>
                    <span className={`text-xs font-bold ${forcaSenha.cor.replace('bg-', 'text-')}`}>{forcaSenha.texto}</span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full rounded-full ${forcaSenha.cor} transition-all duration-500 ease-out`} style={{ width: `${Math.min(forcaSenha.forca, 100)}%` }}></div>
                  </div>
                </div>

                {/* Requisitos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {requisitos.map(({ key, label }) => (
                    <div key={key} className={`flex items-center gap-1.5 text-xs transition-colors ${forcaSenha.requisitos[key] ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <i className={`bi ${forcaSenha.requisitos[key] ? 'bi-check-circle-fill' : 'bi-circle'} text-sm`}></i>
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {renderPasswordField('confirmarSenha', 'confirmarSenha', 'Confirmar Nova Senha', 'bi-shield-check', 'Repita a nova senha', 'confirmar')}

            {/* Feedback de confirmação */}
            {formData.confirmarSenha && formData.novaSenha && (
              <div className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg ${
                formData.novaSenha === formData.confirmarSenha
                  ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                  : 'text-red-400 bg-red-500/10 border border-red-500/20'
              }`}>
                <i className={`bi ${formData.novaSenha === formData.confirmarSenha ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
                {formData.novaSenha === formData.confirmarSenha ? 'As senhas coincidem' : 'As senhas não coincidem'}
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => actions.setCurrentPage('dashboard')}
                className="flex-1 py-3 px-4 rounded-xl text-slate-300 font-semibold border border-slate-700/60 hover:bg-slate-700/30 hover:border-slate-600 transition-all duration-200 active:scale-[0.98]"
              >
                <i className="bi bi-arrow-left mr-2"></i>
                Voltar
              </button>
              <button
                type="submit"
                disabled={loading || !forcaSenha.requisitos?.tamanho || !forcaSenha.requisitos?.maiuscula || !forcaSenha.requisitos?.minuscula || !forcaSenha.requisitos?.numero || !forcaSenha.requisitos?.especial || formData.novaSenha !== formData.confirmarSenha}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 rounded-xl font-bold hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <i className="bi bi-arrow-repeat animate-spin mr-2"></i>
                    Alterando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <i className="bi bi-check2-all mr-2"></i>
                    Alterar Senha
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Dica de segurança */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500">
            <i className="bi bi-info-circle mr-1"></i>
            Após a troca, você será redirecionado para fazer login novamente
          </p>
        </div>
      </div>
    </div>
  );
}
