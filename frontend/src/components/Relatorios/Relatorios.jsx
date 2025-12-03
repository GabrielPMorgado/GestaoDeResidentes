import { useState, useEffect } from 'react'
import { useNotification } from '../../contexts/NotificationContext'
import {
  listarResidentes,
  listarProfissionais,
  obterEstatisticasAgendamentos,
  listarAgendamentos
} from '../../api/api'

function Relatorios() {
  const { success: showSuccess, error: showError } = useNotification()
  const [loading, setLoading] = useState(true)
  const [dadosRelatorio, setDadosRelatorio] = useState({
    residentes: {
      total: 0,
      ativos: 0,
      inativos: 0,
      porGenero: { masculino: 0, feminino: 0, outro: 0 },
      porFaixaEtaria: { '0-17': 0, '18-59': 0, '60+': 0 }
    },
    profissionais: {
      total: 0,
      ativos: 0,
      inativos: 0,
      porEspecialidade: {}
    },
    agendamentos: {
      total: 0,
      agendados: 0,
      confirmados: 0,
      em_atendimento: 0,
      concluidos: 0,
      cancelados: 0,
      faltas: 0,
      porTipo: {}
    }
  })

  const [dadosDespesas, setDadosDespesas] = useState({
    resumo: {
      totalProfissionais: 0,
      folhaPagamentoTotal: 0,
      salarioMedio: 0,
      salarioMaior: 0,
      salarioMenor: 0
    },
    despesasPorDepartamento: [],
    despesasPorCargo: [],
    profissionais: []
  })

  const [folhaPagamento, setFolhaPagamento] = useState({
    mesReferencia: '',
    quantidadeFuncionarios: 0,
    totais: {
      salarioBruto: 0,
      totalDescontos: 0,
      salarioLiquido: 0
    },
    folha: []
  })

  const [loadingDespesas, setLoadingDespesas] = useState(false)
  const [loadingFolha, setLoadingFolha] = useState(false)
  const [abaSelecionada, setAbaSelecionada] = useState('geral')

  useEffect(() => {
    carregarDadosRelatorio()
    carregarRelatorioDespesas()
    carregarFolhaPagamento()
  }, [])

  const carregarDadosRelatorio = async () => {
    try {
      setLoading(true)

      // Buscar todos os dados necessários
      const [residentesRes, profissionaisRes, estatisticasRes, agendamentosRes] = await Promise.all([
        listarResidentes({ limit: 1000 }),
        listarProfissionais({ limit: 1000 }),
        obterEstatisticasAgendamentos(),
        listarAgendamentos({ limit: 1000 })
      ])

      // Processar dados dos residentes
      const residentes = residentesRes.data?.residentes || []
      const residentesAtivos = residentes.filter(r => r.status === 'ativo')
      const residentesInativos = residentes.filter(r => r.status !== 'ativo')

      const porGenero = {
        masculino: residentes.filter(r => r.genero?.toLowerCase() === 'masculino').length,
        feminino: residentes.filter(r => r.genero?.toLowerCase() === 'feminino').length,
        outro: residentes.filter(r => !['masculino', 'feminino'].includes(r.genero?.toLowerCase())).length
      }

      const porFaixaEtaria = calcularFaixaEtaria(residentes)

      // Processar dados dos profissionais
      const profissionais = profissionaisRes.data?.profissionais || []
      const profissionaisAtivos = profissionais.filter(p => p.status === 'ativo')
      const profissionaisInativos = profissionais.filter(p => p.status !== 'ativo')

      const porEspecialidade = {}
      profissionais.forEach(prof => {
        const esp = prof.especialidade || 'Não informada'
        porEspecialidade[esp] = (porEspecialidade[esp] || 0) + 1
      })

      // Processar dados dos agendamentos
      const estatisticas = estatisticasRes.data || {}
      const agendamentos = agendamentosRes.data?.agendamentos || []

      const porTipo = {}
      agendamentos.forEach(agend => {
        const tipo = agend.tipo_atendimento || 'Não informado'
        porTipo[tipo] = (porTipo[tipo] || 0) + 1
      })

      setDadosRelatorio({
        residentes: {
          total: residentes.length,
          ativos: residentesAtivos.length,
          inativos: residentesInativos.length,
          porGenero,
          porFaixaEtaria
        },
        profissionais: {
          total: profissionais.length,
          ativos: profissionaisAtivos.length,
          inativos: profissionaisInativos.length,
          porEspecialidade
        },
        agendamentos: {
          total: estatisticas.total || 0,
          agendados: estatisticas.agendados || 0,
          confirmados: estatisticas.confirmados || 0,
          em_atendimento: estatisticas.em_atendimento || 0,
          concluidos: estatisticas.concluidos || 0,
          cancelados: estatisticas.cancelados || 0,
          faltas: estatisticas.faltas || 0,
          porTipo
        }
      })
    } catch {
      showError('Erro ao carregar dados do relatório')
    } finally {
      setLoading(false)
    }
  }

  const calcularFaixaEtaria = (residentes) => {
    const faixas = { '0-17': 0, '18-59': 0, '60+': 0 }
    
    residentes.forEach(residente => {
      if (residente.data_nascimento) {
        const idade = calcularIdade(residente.data_nascimento)
        if (idade < 18) faixas['0-17']++
        else if (idade < 60) faixas['18-59']++
        else faixas['60+']++
      }
    })

    return faixas
  }

  const calcularIdade = (dataNascimento) => {
    const hoje = new Date()
    const nascimento = new Date(dataNascimento)
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const mes = hoje.getMonth() - nascimento.getMonth()
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--
    }
    return idade
  }

  const carregarRelatorioDespesas = async () => {
    try {
      setLoadingDespesas(true)
      const profissionaisRes = await listarProfissionais({ limit: 1000 })
      const profissionais = profissionaisRes.data?.profissionais || []
      const profissionaisAtivos = profissionais.filter(p => p.status === 'ativo')

      const salarios = profissionaisAtivos.map(p => parseFloat(p.salario) || 0)
      const totalFolha = salarios.reduce((acc, s) => acc + s, 0)

      const despesasPorDepartamento = {}
      const despesasPorCargo = {}

      profissionaisAtivos.forEach(prof => {
        const depto = prof.departamento || 'Não informado'
        const cargo = prof.cargo || 'Não informado'
        const salario = parseFloat(prof.salario) || 0
        
        if (!despesasPorDepartamento[depto]) {
          despesasPorDepartamento[depto] = { count: 0, total: 0 }
        }
        despesasPorDepartamento[depto].count++
        despesasPorDepartamento[depto].total += salario

        if (!despesasPorCargo[cargo]) {
          despesasPorCargo[cargo] = { count: 0, total: 0 }
        }
        despesasPorCargo[cargo].count++
        despesasPorCargo[cargo].total += salario
      })

      setDadosDespesas({
        resumo: {
          totalProfissionais: profissionaisAtivos.length,
          folhaPagamentoTotal: totalFolha,
          salarioMedio: profissionaisAtivos.length > 0 ? totalFolha / profissionaisAtivos.length : 0,
          salarioMaior: salarios.length > 0 ? Math.max(...salarios) : 0,
          salarioMenor: salarios.length > 0 ? Math.min(...salarios) : 0
        },
        despesasPorDepartamento: Object.entries(despesasPorDepartamento).map(([departamento, data]) => ({
          departamento,
          quantidadeProfissionais: data.count,
          totalDespesas: data.total
        })),
        despesasPorCargo: Object.entries(despesasPorCargo).map(([cargo, data]) => ({
          cargo,
          quantidade: data.count,
          totalDespesas: data.total,
          salarioMedio: data.total / data.count
        })),
        profissionais: profissionaisAtivos
      })
    } catch (error) {

    } finally {
      setLoadingDespesas(false)
    }
  }

  const carregarFolhaPagamento = async () => {
    try {
      setLoadingFolha(true)
      const profissionaisRes = await listarProfissionais({ limit: 1000 })
      const profissionais = profissionaisRes.data?.profissionais || []
      const profissionaisAtivos = profissionais.filter(p => p.status === 'ativo')

      const folhaData = profissionaisAtivos.map(prof => {
        const salarioBruto = parseFloat(prof.salario) || 0
        const descontos = salarioBruto * 0.11 // Simulação de desconto INSS
        const salarioLiquido = salarioBruto - descontos

        return {
          id: prof.id,
          nome: prof.nome_completo || prof.nome || 'Não informado',
          cargo: prof.cargo || 'Não informado',
          salarioBruto,
          descontos,
          salarioLiquido
        }
      })

      const totais = folhaData.reduce((acc, item) => ({
        salarioBruto: acc.salarioBruto + item.salarioBruto,
        totalDescontos: acc.totalDescontos + item.descontos,
        salarioLiquido: acc.salarioLiquido + item.salarioLiquido
      }), { salarioBruto: 0, totalDescontos: 0, salarioLiquido: 0 })

      const hoje = new Date()
      const mesReferencia = `${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`

      setFolhaPagamento({
        mesReferencia,
        quantidadeFuncionarios: profissionaisAtivos.length,
        totais,
        folha: folhaData
      })
    } catch (error) {

    } finally {
      setLoadingFolha(false)
    }
  }

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0)
  }

  const calcularPercentual = (valor, total) => {
    if (total === 0) return 0
    return ((valor / total) * 100).toFixed(1)
  }

  const imprimirRelatorio = () => {
    window.print()
  }

  const exportarCSV = () => {
    let csv = 'RELATÓRIO GERAL DO SISTEMA\n\n'
    
    csv += 'RESIDENTES\n'
    csv += `Total,${dadosRelatorio.residentes.total}\n`
    csv += `Ativos,${dadosRelatorio.residentes.ativos}\n`
    csv += `Inativos,${dadosRelatorio.residentes.inativos}\n\n`
    
    csv += 'POR GÊNERO\n'
    csv += `Masculino,${dadosRelatorio.residentes.porGenero.masculino}\n`
    csv += `Feminino,${dadosRelatorio.residentes.porGenero.feminino}\n`
    csv += `Outro,${dadosRelatorio.residentes.porGenero.outro}\n\n`
    
    csv += 'PROFISSIONAIS\n'
    csv += `Total,${dadosRelatorio.profissionais.total}\n`
    csv += `Ativos,${dadosRelatorio.profissionais.ativos}\n`
    csv += `Inativos,${dadosRelatorio.profissionais.inativos}\n\n`
    
    csv += 'AGENDAMENTOS\n'
    csv += `Total,${dadosRelatorio.agendamentos.total}\n`
    csv += `Agendados,${dadosRelatorio.agendamentos.agendados}\n`
    csv += `Confirmados,${dadosRelatorio.agendamentos.confirmados}\n`
    csv += `Concluídos,${dadosRelatorio.agendamentos.concluidos}\n`
    csv += `Cancelados,${dadosRelatorio.agendamentos.cancelados}\n`
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `relatorio_sistema_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-16 w-16 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-400 text-lg">Carregando relatório...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <i className="bi bi-file-earmark-text text-3xl text-white"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Relatórios e Estatísticas</h1>
              <p className="text-slate-400">Visão completa de todos os dados do sistema</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={carregarDadosRelatorio}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all flex items-center gap-2"
            >
              <i className="bi bi-arrow-clockwise"></i>
              Atualizar
            </button>
            <button 
              onClick={exportarCSV}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all flex items-center gap-2"
            >
              <i className="bi bi-file-earmark-spreadsheet"></i>
              Exportar CSV
            </button>
            <button 
              onClick={imprimirRelatorio}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2"
            >
              <i className="bi bi-printer"></i>
              Imprimir
            </button>
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="flex flex-wrap gap-2 mb-8 bg-slate-800/50 backdrop-blur-xl rounded-xl p-2 border border-slate-700/50">
          <button 
            onClick={() => setAbaSelecionada('geral')}
            className={`flex-1 min-w-[200px] px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              abaSelecionada === 'geral'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <i className="bi bi-graph-up"></i>
            Relatório Geral
          </button>
          <button 
            onClick={() => setAbaSelecionada('despesas')}
            className={`flex-1 min-w-[200px] px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              abaSelecionada === 'despesas'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <i className="bi bi-cash-coin"></i>
            Despesas com Profissionais
          </button>
          <button 
            onClick={() => setAbaSelecionada('folha')}
            className={`flex-1 min-w-[200px] px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              abaSelecionada === 'folha'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <i className="bi bi-wallet2"></i>
            Folha de Pagamento
          </button>
        </div>

        {/* Conteúdo da Aba Relatório Geral */}
        {abaSelecionada === 'geral' && (
          <div className="space-y-6">
            {/* Resumo Geral - 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 hover:border-blue-500/50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <i className="bi bi-people-fill text-3xl text-blue-400"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-white">{dadosRelatorio.residentes.total}</h3>
                    <p className="text-slate-400 text-sm">Total de Residentes</p>
                    <span className="text-emerald-400 text-xs">{dadosRelatorio.residentes.ativos} ativos</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 hover:border-emerald-500/50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <i className="bi bi-person-badge-fill text-3xl text-emerald-400"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-white">{dadosRelatorio.profissionais.total}</h3>
                    <p className="text-slate-400 text-sm">Total de Profissionais</p>
                    <span className="text-emerald-400 text-xs">{dadosRelatorio.profissionais.ativos} ativos</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 hover:border-amber-500/50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <i className="bi bi-calendar-check-fill text-3xl text-amber-400"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-white">{dadosRelatorio.agendamentos.total}</h3>
                    <p className="text-slate-400 text-sm">Total de Agendamentos</p>
                    <span className="text-emerald-400 text-xs">{dadosRelatorio.agendamentos.concluidos} concluídos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Residentes Detalhado */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 border-b border-slate-700/50 px-6 py-4">
                <h5 className="text-lg font-semibold text-white flex items-center gap-2">
                  <i className="bi bi-people"></i>
                  Residentes - Análise Detalhada
                </h5>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h6 className="text-white font-semibold mb-4">Status dos Residentes</h6>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2 text-sm">
                          <span className="text-slate-300">Ativos</span>
                          <span className="text-slate-300">{dadosRelatorio.residentes.ativos} ({calcularPercentual(dadosRelatorio.residentes.ativos, dadosRelatorio.residentes.total)}%)</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                          <div 
                            className="bg-emerald-500 h-2.5 rounded-full transition-all" 
                            style={{ width: `${calcularPercentual(dadosRelatorio.residentes.ativos, dadosRelatorio.residentes.total)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2 text-sm">
                          <span className="text-slate-300">Inativos</span>
                          <span className="text-slate-300">{dadosRelatorio.residentes.inativos} ({calcularPercentual(dadosRelatorio.residentes.inativos, dadosRelatorio.residentes.total)}%)</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                          <div 
                            className="bg-red-500 h-2.5 rounded-full transition-all" 
                            style={{ width: `${calcularPercentual(dadosRelatorio.residentes.inativos, dadosRelatorio.residentes.total)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h6 className="text-white font-semibold mb-4">Distribuição por Gênero</h6>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2 text-sm">
                          <span className="text-slate-300">Masculino</span>
                          <span className="text-slate-300">{dadosRelatorio.residentes.porGenero.masculino}</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                          <div 
                            className="bg-blue-500 h-2.5 rounded-full transition-all" 
                            style={{ width: `${calcularPercentual(dadosRelatorio.residentes.porGenero.masculino, dadosRelatorio.residentes.total)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2 text-sm">
                          <span className="text-slate-300">Feminino</span>
                          <span className="text-slate-300">{dadosRelatorio.residentes.porGenero.feminino}</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                          <div 
                            className="bg-pink-500 h-2.5 rounded-full transition-all" 
                            style={{ width: `${calcularPercentual(dadosRelatorio.residentes.porGenero.feminino, dadosRelatorio.residentes.total)}%` }}
                          ></div>
                        </div>
                      </div>
                      {dadosRelatorio.residentes.porGenero.outro > 0 && (
                        <div>
                          <div className="flex justify-between mb-2 text-sm">
                            <span className="text-slate-300">Outro</span>
                            <span className="text-slate-300">{dadosRelatorio.residentes.porGenero.outro}</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2.5">
                            <div 
                              className="bg-slate-500 h-2.5 rounded-full transition-all" 
                              style={{ width: `${calcularPercentual(dadosRelatorio.residentes.porGenero.outro, dadosRelatorio.residentes.total)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-700/50 my-6"></div>

                <div>
                  <h6 className="text-white font-semibold mb-4">Distribuição por Faixa Etária</h6>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-700/30 rounded-xl p-6 text-center border border-slate-600/50 hover:border-blue-500/50 transition-all">
                      <i className="bi bi-person-fill text-4xl text-blue-400 mb-3"></i>
                      <h4 className="text-3xl font-bold text-white mb-1">{dadosRelatorio.residentes.porFaixaEtaria['0-17']}</h4>
                      <p className="text-slate-400">0-17 anos</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-xl p-6 text-center border border-slate-600/50 hover:border-emerald-500/50 transition-all">
                      <i className="bi bi-person-fill text-4xl text-emerald-400 mb-3"></i>
                      <h4 className="text-3xl font-bold text-white mb-1">{dadosRelatorio.residentes.porFaixaEtaria['18-59']}</h4>
                      <p className="text-slate-400">18-59 anos</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-xl p-6 text-center border border-slate-600/50 hover:border-amber-500/50 transition-all">
                      <i className="bi bi-person-fill text-4xl text-amber-400 mb-3"></i>
                      <h4 className="text-3xl font-bold text-white mb-1">{dadosRelatorio.residentes.porFaixaEtaria['60+']}</h4>
                      <p className="text-slate-400">60+ anos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profissionais Detalhado */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600/20 to-emerald-700/20 border-b border-slate-700/50 px-6 py-4">
                <h5 className="text-lg font-semibold text-white flex items-center gap-2">
                  <i className="bi bi-person-badge"></i>
                  Profissionais - Análise Detalhada
                </h5>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h6 className="text-white font-semibold mb-4">Status dos Profissionais</h6>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2 text-sm">
                          <span className="text-slate-300">Ativos</span>
                          <span className="text-slate-300">{dadosRelatorio.profissionais.ativos} ({calcularPercentual(dadosRelatorio.profissionais.ativos, dadosRelatorio.profissionais.total)}%)</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                          <div 
                            className="bg-emerald-500 h-2.5 rounded-full transition-all" 
                            style={{ width: `${calcularPercentual(dadosRelatorio.profissionais.ativos, dadosRelatorio.profissionais.total)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2 text-sm">
                          <span className="text-slate-300">Inativos</span>
                          <span className="text-slate-300">{dadosRelatorio.profissionais.inativos} ({calcularPercentual(dadosRelatorio.profissionais.inativos, dadosRelatorio.profissionais.total)}%)</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                          <div 
                            className="bg-red-500 h-2.5 rounded-full transition-all" 
                            style={{ width: `${calcularPercentual(dadosRelatorio.profissionais.inativos, dadosRelatorio.profissionais.total)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h6 className="text-white font-semibold mb-4">Distribuição por Especialidade</h6>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                      {Object.entries(dadosRelatorio.profissionais.porEspecialidade).map(([especialidade, quantidade]) => (
                        <div key={especialidade}>
                          <div className="flex justify-between mb-2 text-sm">
                            <span className="text-slate-300">{especialidade}</span>
                            <span className="text-slate-300">{quantidade}</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2.5">
                            <div 
                              className="bg-cyan-500 h-2.5 rounded-full transition-all" 
                              style={{ width: `${calcularPercentual(quantidade, dadosRelatorio.profissionais.total)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Agendamentos Detalhado */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-b border-slate-700/50 px-6 py-4">
                <h5 className="text-lg font-semibold text-white flex items-center gap-2">
                  <i className="bi bi-calendar-check"></i>
                  Agendamentos - Análise Detalhada
                </h5>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h6 className="text-white font-semibold mb-4">Status dos Agendamentos</h6>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2 text-sm">
                          <span className="text-slate-300">Agendados</span>
                          <span className="text-slate-300">{dadosRelatorio.agendamentos.agendados} ({calcularPercentual(dadosRelatorio.agendamentos.agendados, dadosRelatorio.agendamentos.total)}%)</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                          <div 
                            className="bg-amber-500 h-2.5 rounded-full transition-all" 
                            style={{ width: `${calcularPercentual(dadosRelatorio.agendamentos.agendados, dadosRelatorio.agendamentos.total)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2 text-sm">
                          <span className="text-slate-300">Confirmados</span>
                          <span className="text-slate-300">{dadosRelatorio.agendamentos.confirmados} ({calcularPercentual(dadosRelatorio.agendamentos.confirmados, dadosRelatorio.agendamentos.total)}%)</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                          <div 
                            className="bg-cyan-500 h-2.5 rounded-full transition-all" 
                            style={{ width: `${calcularPercentual(dadosRelatorio.agendamentos.confirmados, dadosRelatorio.agendamentos.total)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2 text-sm">
                          <span className="text-slate-300">Em Atendimento</span>
                          <span className="text-slate-300">{dadosRelatorio.agendamentos.em_atendimento} ({calcularPercentual(dadosRelatorio.agendamentos.em_atendimento, dadosRelatorio.agendamentos.total)}%)</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                          <div 
                            className="bg-blue-500 h-2.5 rounded-full transition-all" 
                            style={{ width: `${calcularPercentual(dadosRelatorio.agendamentos.em_atendimento, dadosRelatorio.agendamentos.total)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2 text-sm">
                          <span className="text-slate-300">Concluídos</span>
                          <span className="text-slate-300">{dadosRelatorio.agendamentos.concluidos} ({calcularPercentual(dadosRelatorio.agendamentos.concluidos, dadosRelatorio.agendamentos.total)}%)</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                          <div 
                            className="bg-emerald-500 h-2.5 rounded-full transition-all" 
                            style={{ width: `${calcularPercentual(dadosRelatorio.agendamentos.concluidos, dadosRelatorio.agendamentos.total)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2 text-sm">
                          <span className="text-slate-300">Cancelados</span>
                          <span className="text-slate-300">{dadosRelatorio.agendamentos.cancelados} ({calcularPercentual(dadosRelatorio.agendamentos.cancelados, dadosRelatorio.agendamentos.total)}%)</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                          <div 
                            className="bg-red-500 h-2.5 rounded-full transition-all" 
                            style={{ width: `${calcularPercentual(dadosRelatorio.agendamentos.cancelados, dadosRelatorio.agendamentos.total)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2 text-sm">
                          <span className="text-slate-300">Faltas</span>
                          <span className="text-slate-300">{dadosRelatorio.agendamentos.faltas} ({calcularPercentual(dadosRelatorio.agendamentos.faltas, dadosRelatorio.agendamentos.total)}%)</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                          <div 
                            className="bg-slate-500 h-2.5 rounded-full transition-all" 
                            style={{ width: `${calcularPercentual(dadosRelatorio.agendamentos.faltas, dadosRelatorio.agendamentos.total)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h6 className="text-white font-semibold mb-4">Distribuição por Tipo de Atendimento</h6>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                      {Object.entries(dadosRelatorio.agendamentos.porTipo).map(([tipo, quantidade]) => (
                        <div key={tipo}>
                          <div className="flex justify-between mb-2 text-sm">
                            <span className="text-slate-300">{tipo}</span>
                            <span className="text-slate-300">{quantidade}</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2.5">
                            <div 
                              className="bg-purple-500 h-2.5 rounded-full transition-all" 
                              style={{ width: `${calcularPercentual(quantidade, dadosRelatorio.agendamentos.total)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Indicadores de Performance */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600/20 to-indigo-700/20 border-b border-slate-700/50 px-6 py-4">
                <h5 className="text-lg font-semibold text-white flex items-center gap-2">
                  <i className="bi bi-graph-up"></i>
                  Indicadores de Performance
                </h5>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-slate-700/30 rounded-xl p-6 text-center border border-slate-600/50">
                    <i className="bi bi-check-circle-fill text-5xl text-emerald-400 mb-3"></i>
                    <h4 className="text-4xl font-bold text-white mb-2">{calcularPercentual(dadosRelatorio.agendamentos.concluidos, dadosRelatorio.agendamentos.total)}%</h4>
                    <p className="text-slate-400">Taxa de Conclusão</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-xl p-6 text-center border border-slate-600/50">
                    <i className="bi bi-x-circle-fill text-5xl text-red-400 mb-3"></i>
                    <h4 className="text-4xl font-bold text-white mb-2">{calcularPercentual(dadosRelatorio.agendamentos.cancelados, dadosRelatorio.agendamentos.total)}%</h4>
                    <p className="text-slate-400">Taxa de Cancelamento</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-xl p-6 text-center border border-slate-600/50">
                    <i className="bi bi-exclamation-circle-fill text-5xl text-amber-400 mb-3"></i>
                    <h4 className="text-4xl font-bold text-white mb-2">{calcularPercentual(dadosRelatorio.agendamentos.faltas, dadosRelatorio.agendamentos.total)}%</h4>
                    <p className="text-slate-400">Taxa de Faltas</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-xl p-6 text-center border border-slate-600/50">
                    <i className="bi bi-people-fill text-5xl text-blue-400 mb-3"></i>
                    <h4 className="text-4xl font-bold text-white mb-2">{dadosRelatorio.profissionais.total > 0 ? (dadosRelatorio.residentes.total / dadosRelatorio.profissionais.total).toFixed(1) : 0}</h4>
                    <p className="text-slate-400">Residentes por Profissional</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rodapé do Relatório */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 mt-6">
              <p className="text-slate-400 text-sm flex items-center gap-2 justify-center">
                <i className="bi bi-calendar3"></i>
                Relatório gerado em: {new Date().toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        )}

        {/* Conteúdo da Aba Despesas */}
        {abaSelecionada === 'despesas' && (
          <div className="space-y-6">
            {loadingDespesas ? (
              <div className="flex flex-col items-center py-20">
                <svg className="animate-spin h-12 w-12 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-slate-400">Carregando relatório de despesas...</p>
              </div>
            ) : (
              <>
                {/* Cards de Resumo de Despesas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 text-center">
                    <i className="bi bi-people-fill text-5xl text-blue-400 mb-3"></i>
                    <h3 className="text-3xl font-bold text-white mb-1">{dadosDespesas.resumo.totalProfissionais}</h3>
                    <p className="text-slate-400 text-sm">Total de Profissionais</p>
                  </div>
                  <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 text-center">
                    <i className="bi bi-cash-stack text-5xl text-emerald-400 mb-3"></i>
                    <h3 className="text-2xl font-bold text-white mb-1">{formatarMoeda(dadosDespesas.resumo.folhaPagamentoTotal)}</h3>
                    <p className="text-slate-400 text-sm">Folha de Pagamento Total</p>
                  </div>
                  <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 text-center">
                    <i className="bi bi-calculator text-5xl text-cyan-400 mb-3"></i>
                    <h3 className="text-2xl font-bold text-white mb-1">{formatarMoeda(dadosDespesas.resumo.salarioMedio)}</h3>
                    <p className="text-slate-400 text-sm">Salário Médio</p>
                  </div>
                  <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 text-center">
                    <i className="bi bi-graph-up-arrow text-5xl text-amber-400 mb-3"></i>
                    <h3 className="text-2xl font-bold text-white mb-1">{formatarMoeda(dadosDespesas.resumo.salarioMaior)}</h3>
                    <p className="text-slate-400 text-sm">Maior Salário</p>
                  </div>
                </div>

                {/* Despesas por Departamento */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-gradient-to-r from-blue-600/20 to-transparent p-4 rounded-xl">
                    <i className="bi bi-building text-2xl text-blue-400"></i>
                    <h4 className="text-xl font-bold text-white">Despesas por Departamento</h4>
                  </div>
                  <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-700/50 border-b border-slate-600">
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Departamento</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-slate-200">Profissionais</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-200">Total de Despesas</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-200">Média Salarial</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dadosDespesas.despesasPorDepartamento.map((dept, index) => (
                            <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors">
                              <td className="px-6 py-4 text-slate-300 font-semibold">{dept.departamento}</td>
                              <td className="px-6 py-4 text-center text-slate-300">{dept.quantidadeProfissionais}</td>
                              <td className="px-6 py-4 text-right text-slate-300">{formatarMoeda(dept.totalDespesas)}</td>
                              <td className="px-6 py-4 text-right text-slate-300">
                                {formatarMoeda(dept.totalDespesas / dept.quantidadeProfissionais)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-800 border-t-2 border-slate-600">
                            <td className="px-6 py-4 text-white font-bold">TOTAL</td>
                            <td className="px-6 py-4 text-center text-white font-bold">{dadosDespesas.resumo.totalProfissionais}</td>
                            <td className="px-6 py-4 text-right text-white font-bold">{formatarMoeda(dadosDespesas.resumo.folhaPagamentoTotal)}</td>
                            <td className="px-6 py-4 text-right text-white font-bold">{formatarMoeda(dadosDespesas.resumo.salarioMedio)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Despesas por Cargo */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-600/20 to-transparent p-4 rounded-xl">
                    <i className="bi bi-briefcase text-2xl text-emerald-400"></i>
                    <h4 className="text-xl font-bold text-white">Despesas por Cargo</h4>
                  </div>
                  <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-700/50 border-b border-slate-600">
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Cargo</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-slate-200">Quantidade</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-200">Total de Despesas</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-200">Salário Médio</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dadosDespesas.despesasPorCargo.map((cargo, index) => (
                            <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors">
                              <td className="px-6 py-4 text-slate-300 font-semibold">{cargo.cargo}</td>
                              <td className="px-6 py-4 text-center text-slate-300">{cargo.quantidade}</td>
                              <td className="px-6 py-4 text-right text-slate-300">{formatarMoeda(cargo.totalDespesas)}</td>
                              <td className="px-6 py-4 text-right text-slate-300">{formatarMoeda(cargo.salarioMedio)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Lista Detalhada de Profissionais */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-gradient-to-r from-cyan-600/20 to-transparent p-4 rounded-xl">
                    <i className="bi bi-person-badge text-2xl text-cyan-400"></i>
                    <h4 className="text-xl font-bold text-white">Detalhamento de Profissionais e Salários</h4>
                  </div>
                  <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-700/50 border-b border-slate-600">
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Nome</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">CPF</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Cargo</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Departamento</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-200">Salário</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-slate-200">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dadosDespesas.profissionais.map((prof) => (
                            <tr key={prof.id} className="border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors">
                              <td className="px-6 py-4 text-slate-300">{prof.nome_completo}</td>
                              <td className="px-6 py-4 text-slate-300">{prof.cpf}</td>
                              <td className="px-6 py-4 text-slate-300">{prof.cargo}</td>
                              <td className="px-6 py-4 text-slate-300">{prof.departamento || 'Não informado'}</td>
                              <td className="px-6 py-4 text-right text-white font-bold">{formatarMoeda(prof.salario)}</td>
                              <td className="px-6 py-4 text-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  prof.status === 'ativo' ? 'bg-emerald-500/20 text-emerald-400' : 
                                  prof.status === 'ferias' ? 'bg-amber-500/20 text-amber-400' :
                                  prof.status === 'licenca' ? 'bg-blue-500/20 text-blue-400' :
                                  'bg-slate-500/20 text-slate-400'
                                }`}>
                                  {prof.status === 'ativo' ? 'Ativo' : prof.status === 'ferias' ? 'Férias' : prof.status === 'licenca' ? 'Licença' : 'Inativo'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
          </>
        )}
      </div>
      )}

        {/* Conteúdo da Aba Folha de Pagamento */}
        {abaSelecionada === 'folha' && (
          <div className="space-y-6">
            {loadingFolha ? (
              <div className="flex flex-col items-center py-20">
                <svg className="animate-spin h-12 w-12 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-slate-400">Carregando folha de pagamento...</p>
              </div>
            ) : (
              <>
                {/* Cabeçalho da Folha */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-purple-600/20 to-transparent p-6">
                    <div className="flex items-center gap-3">
                      <i className="bi bi-wallet2 text-3xl text-purple-400"></i>
                      <h4 className="text-xl font-bold text-white">Folha de Pagamento - {folhaPagamento.mesReferencia}</h4>
                    </div>
                    <button 
                      onClick={carregarFolhaPagamento}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <i className="bi bi-arrow-clockwise"></i>
                      Atualizar
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                    <div className="flex flex-col items-center p-6 border border-slate-700 rounded-xl">
                      <i className="bi bi-people text-5xl text-blue-400 mb-3"></i>
                      <h4 className="text-3xl font-bold text-white mb-1">{folhaPagamento.quantidadeFuncionarios}</h4>
                      <p className="text-slate-400 text-sm">Funcionários Ativos</p>
                    </div>
                    <div className="flex flex-col items-center p-6 border border-slate-700 rounded-xl">
                      <i className="bi bi-currency-dollar text-5xl text-emerald-400 mb-3"></i>
                      <h4 className="text-2xl font-bold text-white mb-1">{formatarMoeda(folhaPagamento.totais.salarioBruto)}</h4>
                      <p className="text-slate-400 text-sm">Total Bruto</p>
                    </div>
                    <div className="flex flex-col items-center p-6 border border-slate-700 rounded-xl">
                      <i className="bi bi-dash-circle text-5xl text-amber-400 mb-3"></i>
                      <h4 className="text-2xl font-bold text-white mb-1">{formatarMoeda(folhaPagamento.totais.totalDescontos)}</h4>
                      <p className="text-slate-400 text-sm">Total Descontos</p>
                    </div>
                    <div className="flex flex-col items-center p-6 border border-slate-700 rounded-xl bg-slate-700/30">
                      <i className="bi bi-check-circle text-5xl text-cyan-400 mb-3"></i>
                      <h4 className="text-2xl font-bold text-white mb-1">{formatarMoeda(folhaPagamento.totais.salarioLiquido)}</h4>
                      <p className="text-slate-400 text-sm">Total Líquido</p>
                    </div>
                  </div>
                </div>

                {/* Tabela de Folha de Pagamento */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-gradient-to-r from-slate-600/20 to-transparent p-4 rounded-xl">
                    <i className="bi bi-table text-2xl text-slate-400"></i>
                    <h4 className="text-xl font-bold text-white">Detalhamento da Folha</h4>
                  </div>
                  <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-900/80 border-b border-slate-600">
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Nome</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">CPF</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Cargo</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Departamento</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-200">Salário Bruto</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-200">INSS</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-200">IRRF</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-200">Salário Líquido</th>
                          </tr>
                        </thead>
                        <tbody>
                          {folhaPagamento.folha.map((funcionario, index) => (
                            <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors">
                              <td className="px-6 py-4 text-slate-300">{funcionario.nome}</td>
                              <td className="px-6 py-4 text-slate-300">{funcionario.cpf}</td>
                              <td className="px-6 py-4 text-slate-300">{funcionario.cargo}</td>
                              <td className="px-6 py-4 text-slate-300">{funcionario.departamento}</td>
                              <td className="px-6 py-4 text-right text-slate-300">{formatarMoeda(funcionario.salarioBruto)}</td>
                              <td className="px-6 py-4 text-right text-red-400">{formatarMoeda(funcionario.inss)}</td>
                              <td className="px-6 py-4 text-right text-red-400">{formatarMoeda(funcionario.irrf)}</td>
                              <td className="px-6 py-4 text-right text-white font-bold">{formatarMoeda(funcionario.salarioLiquido)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-800 border-t-2 border-slate-600">
                            <td colSpan="4" className="px-6 py-4 text-white font-bold">TOTAIS</td>
                            <td className="px-6 py-4 text-right text-white font-bold">{formatarMoeda(folhaPagamento.totais.salarioBruto)}</td>
                            <td colSpan="2" className="px-6 py-4 text-right text-white font-bold">{formatarMoeda(folhaPagamento.totais.totalDescontos)}</td>
                            <td className="px-6 py-4 text-right text-white font-bold">{formatarMoeda(folhaPagamento.totais.salarioLiquido)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    <div className="bg-cyan-500/10 border-l-4 border-cyan-500 p-4 m-6 rounded">
                      <div className="flex items-start gap-3">
                        <i className="bi bi-info-circle text-cyan-400 text-xl mt-1"></i>
                        <div>
                          <p className="text-white font-semibold mb-1">Observação:</p>
                          <p className="text-slate-300 text-sm">Os valores de INSS (11%) e IRRF (7,5%) são simulados para fins de demonstração. 
                          Em um sistema real, devem ser calculados conforme as tabelas oficiais vigentes.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Relatorios
