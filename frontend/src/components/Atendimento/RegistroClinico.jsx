import { useState, useEffect, useCallback } from 'react'
import { useNotification } from '../../contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/axios'

function RegistroClinico({ agendamento, onVoltar, onFinalizar }) {
  const { success, error: showError } = useNotification()
  const { user } = useAuth()
  const [salvando, setSalvando] = useState(false)
  const [abaSelecionada, setAbaSelecionada] = useState('procedimentos')
  
  const residente = agendamento?.Residente || agendamento?.residente
  
  const [dadosAtendimento, setDadosAtendimento] = useState({
    agendamento_id: agendamento?.id,
    residente_id: residente?.id,
    profissional_id: user?.profissional_id,
    data_atendimento: new Date().toISOString().split('T')[0],
    hora_atendimento: new Date().toTimeString().split(' ')[0].substring(0, 5),
    
    // Procedimentos
    procedimentos: [],
    
    // Diagnóstico
    diagnostico_principal: '',
    diagnosticos_secundarios: '',
    cid_principal: '',
    cids_secundarios: '',
    observacoes_clinicas: '',
    
    // Evolução
    evolucao: '',
    condutas: '',
    plano_cuidado: '',
    
    // Relatório
    relatorio: '',
    
    // Anexos
    anexos: []
  })
  
  const [novoProcedimento, setNovoProcedimento] = useState({
    nome: '',
    descricao: '',
    materiais: '',
    arquivo: null
  })

  const atualizarStatusAgendamento = useCallback(async (status) => {
    try {
      await api.put(`/agendamentos/${agendamento.id}`, { status })
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }, [agendamento])

  useEffect(() => {
    // Atualizar status do agendamento para "em_atendimento"
    if (agendamento && agendamento.status !== 'em_atendimento') {
      atualizarStatusAgendamento('em_atendimento')
    }
  }, [agendamento, atualizarStatusAgendamento])

  const adicionarProcedimento = () => {
    if (!novoProcedimento.nome) {
      showError('Nome do procedimento é obrigatório')
      return
    }

    const uniqueId = `proc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setDadosAtendimento({
      ...dadosAtendimento,
      procedimentos: [...dadosAtendimento.procedimentos, { ...novoProcedimento, id: uniqueId }]
    })

    setNovoProcedimento({ nome: '', descricao: '', materiais: '', arquivo: null })
    success('Procedimento adicionado')
  }

  const removerProcedimento = (id) => {
    setDadosAtendimento({
      ...dadosAtendimento,
      procedimentos: dadosAtendimento.procedimentos.filter(p => p.id !== id)
    })
  }

  const handleSalvarRascunho = async () => {
    setSalvando(true)
    try {
      await api.post('/atendimentos/rascunho', {
        ...dadosAtendimento,
        status: 'rascunho'
      })
      success('Rascunho salvo com sucesso!')
    } catch (error) {
      console.error(error)
      showError('Erro ao salvar rascunho')
    } finally {
      setSalvando(false)
    }
  }

  const handleSalvarAtendimento = async () => {
    if (!dadosAtendimento.diagnostico_principal) {
      showError('Diagnóstico principal é obrigatório')
      setAbaSelecionada('diagnostico')
      return
    }

    setSalvando(true)
    try {
      // Salvar no histórico de consultas
      await api.post('/historico-consultas', {
        residente_id: dadosAtendimento.residente_id,
        profissional_id: dadosAtendimento.profissional_id,
        data_consulta: dadosAtendimento.data_atendimento,
        hora_consulta: dadosAtendimento.hora_atendimento,
        tipo_consulta: agendamento.tipo_atendimento,
        diagnostico: dadosAtendimento.diagnostico_principal,
        cid: dadosAtendimento.cid_principal,
        tratamento: dadosAtendimento.plano_cuidado,
        medicamentos: dadosAtendimento.condutas,
        observacoes: `${dadosAtendimento.evolucao}\n\n${dadosAtendimento.observacoes_clinicas}`,
        status: 'realizada',
        procedimentos: JSON.stringify(dadosAtendimento.procedimentos),
        diagnosticos_secundarios: dadosAtendimento.diagnosticos_secundarios,
        cids_secundarios: dadosAtendimento.cids_secundarios,
        relatorio: dadosAtendimento.relatorio
      })

      // Atualizar status do agendamento
      await atualizarStatusAgendamento('concluido')

      success('Atendimento registrado com sucesso!')
      onFinalizar()
    } catch (error) {
      console.error(error)
      showError('Erro ao salvar atendimento')
    } finally {
      setSalvando(false)
    }
  }

  const handleFinalizarAtendimento = async () => {
    if (!window.confirm('Deseja finalizar este atendimento? Não será possível editar após finalizar.')) {
      return
    }

    await handleSalvarAtendimento()
  }

  const gerarRelatorio = () => {
    let relatorio = `RELATÓRIO DE ATENDIMENTO\n\n`
    relatorio += `Paciente: ${residente?.nome_completo}\n`
    relatorio += `Data: ${new Date(dadosAtendimento.data_atendimento).toLocaleDateString('pt-BR')}\n`
    relatorio += `Hora: ${dadosAtendimento.hora_atendimento}\n`
    relatorio += `Profissional: ${user?.email || 'ID ' + user?.id}\n`
    relatorio += `Tipo: ${agendamento.tipo_atendimento}\n\n`

    if (dadosAtendimento.procedimentos.length > 0) {
      relatorio += `PROCEDIMENTOS REALIZADOS:\n`
      dadosAtendimento.procedimentos.forEach((p, idx) => {
        relatorio += `${idx + 1}. ${p.nome}\n`
        if (p.descricao) relatorio += `   Descrição: ${p.descricao}\n`
        if (p.materiais) relatorio += `   Materiais: ${p.materiais}\n`
      })
      relatorio += `\n`
    }

    if (dadosAtendimento.diagnostico_principal) {
      relatorio += `DIAGNÓSTICO:\n`
      relatorio += `Principal: ${dadosAtendimento.diagnostico_principal}`
      if (dadosAtendimento.cid_principal) relatorio += ` (CID: ${dadosAtendimento.cid_principal})`
      relatorio += `\n`
      if (dadosAtendimento.diagnosticos_secundarios) {
        relatorio += `Secundários: ${dadosAtendimento.diagnosticos_secundarios}\n`
      }
      relatorio += `\n`
    }

    if (dadosAtendimento.evolucao) {
      relatorio += `EVOLUÇÃO:\n${dadosAtendimento.evolucao}\n\n`
    }

    if (dadosAtendimento.plano_cuidado) {
      relatorio += `PLANO DE CUIDADO:\n${dadosAtendimento.plano_cuidado}\n\n`
    }

    if (dadosAtendimento.observacoes_clinicas) {
      relatorio += `OBSERVAÇÕES CLÍNICAS:\n${dadosAtendimento.observacoes_clinicas}\n`
    }

    setDadosAtendimento({ ...dadosAtendimento, relatorio })
    setAbaSelecionada('relatorio')
    success('Relatório gerado!')
  }

  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return '-'
    const hoje = new Date()
    const nascimento = new Date(dataNascimento)
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const mes = hoje.getMonth() - nascimento.getMonth()
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--
    }
    return `${idade} anos`
  }

  const abas = [
    { id: 'procedimentos', label: 'Procedimentos', icon: 'bi-clipboard2-pulse' },
    { id: 'diagnostico', label: 'Diagnóstico', icon: 'bi-clipboard2-check' },
    { id: 'evolucao', label: 'Evolução', icon: 'bi-journal-text' },
    { id: 'relatorio', label: 'Relatório', icon: 'bi-file-text' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - Informações do Paciente */}
        <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-2xl border border-emerald-500/30 p-6 mb-6 shadow-2xl shadow-emerald-500/20">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl border-2 border-white/30 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">{residente?.nome_completo?.charAt(0) || 'P'}</span>
              </div>

              {/* Dados do Paciente */}
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{residente?.nome_completo}</h1>
                <div className="flex flex-wrap items-center gap-4 text-emerald-50">
                  <span className="flex items-center gap-1">
                    <i className="bi bi-card-text"></i>
                    ID: {residente?.id}
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="bi bi-calendar3"></i>
                    {calcularIdade(residente?.data_nascimento)}
                  </span>
                  {residente?.numero_quarto && (
                    <span className="flex items-center gap-1">
                      <i className="bi bi-house-door"></i>
                      Quarto {residente?.numero_quarto}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <i className="bi bi-clock"></i>
                    {agendamento?.tipo_atendimento}
                  </span>
                </div>
              </div>
            </div>

            {/* Botão Voltar */}
            <button
              onClick={onVoltar}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/30 text-white rounded-lg transition-all flex items-center gap-2"
            >
              <i className="bi bi-arrow-left"></i>
              Voltar
            </button>
          </div>

          {/* Alertas de Saúde */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-xl rounded-lg p-3 border border-white/20">
              <p className="text-xs text-emerald-100 mb-1">Alergias</p>
              <p className="text-sm font-semibold text-white">Nenhuma registrada</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-lg p-3 border border-white/20">
              <p className="text-xs text-emerald-100 mb-1">Doenças Crônicas</p>
              <p className="text-sm font-semibold text-white">-</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-lg p-3 border border-white/20">
              <p className="text-xs text-emerald-100 mb-1">Prontuário</p>
              <p className="text-sm font-semibold text-white">#{residente?.id?.toString().padStart(6, '0')}</p>
            </div>
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 mb-6 overflow-hidden">
          <div className="flex overflow-x-auto">
            {abas.map((aba) => (
              <button
                key={aba.id}
                onClick={() => setAbaSelecionada(aba.id)}
                className={`flex-1 min-w-[200px] px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                  abaSelecionada === aba.id
                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white border-b-2 border-emerald-400'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <i className={`bi ${aba.icon}`}></i>
                {aba.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo das Abas */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 mb-6">
          {/* Aba Procedimentos */}
          {abaSelecionada === 'procedimentos' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <i className="bi bi-clipboard2-pulse text-emerald-400"></i>
                Procedimentos Realizados
              </h2>

              {/* Lista de Procedimentos */}
              {dadosAtendimento.procedimentos.length > 0 && (
                <div className="mb-6 space-y-3">
                  {dadosAtendimento.procedimentos.map((proc) => (
                    <div key={proc.id} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">{proc.nome}</h3>
                        <button
                          onClick={() => removerProcedimento(proc.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                      {proc.descricao && (
                        <p className="text-sm text-slate-300 mb-2">{proc.descricao}</p>
                      )}
                      {proc.materiais && (
                        <p className="text-xs text-slate-400">Materiais: {proc.materiais}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Adicionar Novo Procedimento */}
              <div className="bg-slate-700/20 rounded-lg p-6 border border-slate-600/30">
                <h3 className="text-lg font-semibold text-white mb-4">Adicionar Procedimento</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Nome do Procedimento *</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Ex: Curativo, Medicação, Aferição de sinais..."
                      value={novoProcedimento.nome}
                      onChange={(e) => setNovoProcedimento({ ...novoProcedimento, nome: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Descrição Detalhada</label>
                    <textarea
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      rows="3"
                      placeholder="Descreva como foi realizado o procedimento..."
                      value={novoProcedimento.descricao}
                      onChange={(e) => setNovoProcedimento({ ...novoProcedimento, descricao: e.target.value })}
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Materiais Utilizados</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Liste os materiais utilizados..."
                      value={novoProcedimento.materiais}
                      onChange={(e) => setNovoProcedimento({ ...novoProcedimento, materiais: e.target.value })}
                    />
                  </div>

                  <button
                    onClick={adicionarProcedimento}
                    className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
                  >
                    <i className="bi bi-plus-circle"></i>
                    Adicionar Procedimento
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Aba Diagnóstico */}
          {abaSelecionada === 'diagnostico' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <i className="bi bi-clipboard2-check text-emerald-400"></i>
                Diagnóstico
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Diagnóstico Principal *</label>
                  <textarea
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    rows="3"
                    placeholder="Descreva o diagnóstico principal..."
                    value={dadosAtendimento.diagnostico_principal}
                    onChange={(e) => setDadosAtendimento({ ...dadosAtendimento, diagnostico_principal: e.target.value })}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">CID-10 Principal</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ex: I10, E11.9, J18.9..."
                    value={dadosAtendimento.cid_principal}
                    onChange={(e) => setDadosAtendimento({ ...dadosAtendimento, cid_principal: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Diagnósticos Secundários</label>
                  <textarea
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    rows="3"
                    placeholder="Liste outros diagnósticos relevantes..."
                    value={dadosAtendimento.diagnosticos_secundarios}
                    onChange={(e) => setDadosAtendimento({ ...dadosAtendimento, diagnosticos_secundarios: e.target.value })}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">CIDs Secundários</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ex: M79.3, R50.9..."
                    value={dadosAtendimento.cids_secundarios}
                    onChange={(e) => setDadosAtendimento({ ...dadosAtendimento, cids_secundarios: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Observações Clínicas</label>
                  <textarea
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    rows="4"
                    placeholder="Observações adicionais sobre o quadro clínico..."
                    value={dadosAtendimento.observacoes_clinicas}
                    onChange={(e) => setDadosAtendimento({ ...dadosAtendimento, observacoes_clinicas: e.target.value })}
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Aba Evolução */}
          {abaSelecionada === 'evolucao' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <i className="bi bi-journal-text text-emerald-400"></i>
                Evolução e Plano de Cuidado
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Evolução do Atendimento</label>
                  <textarea
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    rows="6"
                    placeholder="Descreva a evolução do paciente durante o atendimento..."
                    value={dadosAtendimento.evolucao}
                    onChange={(e) => setDadosAtendimento({ ...dadosAtendimento, evolucao: e.target.value })}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Condutas Adotadas</label>
                  <textarea
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    rows="4"
                    placeholder="Liste as condutas e medicamentos prescritos..."
                    value={dadosAtendimento.condutas}
                    onChange={(e) => setDadosAtendimento({ ...dadosAtendimento, condutas: e.target.value })}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Plano de Cuidado / Orientações</label>
                  <textarea
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    rows="4"
                    placeholder="Orientações para equipe de cuidados e seguimento..."
                    value={dadosAtendimento.plano_cuidado}
                    onChange={(e) => setDadosAtendimento({ ...dadosAtendimento, plano_cuidado: e.target.value })}
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Aba Relatório */}
          {abaSelecionada === 'relatorio' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <i className="bi bi-file-text text-emerald-400"></i>
                  Relatório do Atendimento
                </h2>
                <button
                  onClick={gerarRelatorio}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <i className="bi bi-arrow-clockwise"></i>
                  Gerar Relatório
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Relatório Completo (editável)</label>
                <textarea
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-mono text-sm"
                  rows="20"
                  placeholder="Clique em 'Gerar Relatório' para criar automaticamente..."
                  value={dadosAtendimento.relatorio}
                  onChange={(e) => setDadosAtendimento({ ...dadosAtendimento, relatorio: e.target.value })}
                ></textarea>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <i className="bi bi-printer"></i>
                  Imprimir
                </button>
                <button
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <i className="bi bi-file-pdf"></i>
                  Gerar PDF
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-3">
              <button
                onClick={onVoltar}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <i className="bi bi-x-circle"></i>
                Cancelar
              </button>
              
              <button
                onClick={handleSalvarRascunho}
                disabled={salvando}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="bi bi-bookmark"></i>
                {salvando ? 'Salvando...' : 'Salvar Rascunho'}
              </button>
            </div>

            <button
              onClick={handleFinalizarAtendimento}
              disabled={salvando}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="bi bi-check-circle-fill"></i>
              {salvando ? 'Finalizando...' : 'Finalizar Atendimento'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegistroClinico
