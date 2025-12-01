import { useState, useEffect } from 'react'
import './Relatorios.css'
import {
  listarResidentes,
  listarProfissionais,
  obterEstatisticasAgendamentos,
  listarAgendamentos
} from '../../api/api'
import relatorioService from '../../services/relatorioService'

function Relatorios() {
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
      const residentesAtivos = residentes.filter(r => r.ativo)
      const residentesInativos = residentes.filter(r => !r.ativo)

      const porGenero = {
        masculino: residentes.filter(r => r.genero?.toLowerCase() === 'masculino').length,
        feminino: residentes.filter(r => r.genero?.toLowerCase() === 'feminino').length,
        outro: residentes.filter(r => !['masculino', 'feminino'].includes(r.genero?.toLowerCase())).length
      }

      const porFaixaEtaria = calcularFaixaEtaria(residentes)

      // Processar dados dos profissionais
      const profissionais = profissionaisRes.data?.profissionais || []
      const profissionaisAtivos = profissionais.filter(p => p.ativo)
      const profissionaisInativos = profissionais.filter(p => !p.ativo)

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
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error)
      alert('Erro ao carregar dados do relatório')
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
      const response = await relatorioService.obterRelatorioDespesas({ status: 'ativos' })
      if (response.success) {
        setDadosDespesas(response.data)
      }
    } catch (error) {
      console.error('Erro ao carregar relatório de despesas:', error)
    } finally {
      setLoadingDespesas(false)
    }
  }

  const carregarFolhaPagamento = async () => {
    try {
      setLoadingFolha(true)
      const response = await relatorioService.obterFolhaPagamento()
      if (response.success) {
        setFolhaPagamento(response.data)
      }
    } catch (error) {
      console.error('Erro ao carregar folha de pagamento:', error)
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
      <div className="relatorios-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-3">Carregando relatório...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relatorios-container">
      <div className="relatorios-header">
        <div>
          <h2>
            <i className="bi bi-file-earmark-text me-2"></i>
            Relatório Geral do Sistema
          </h2>
          <p className="text-muted">Visão completa de todos os dados do sistema</p>
        </div>
        <div className="relatorios-actions">
          <button className="btn btn-secondary" onClick={carregarDadosRelatorio}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Atualizar
          </button>
          <button className="btn btn-success" onClick={exportarCSV}>
            <i className="bi bi-file-earmark-spreadsheet me-2"></i>
            Exportar CSV
          </button>
          <button className="btn btn-primary" onClick={imprimirRelatorio}>
            <i className="bi bi-printer me-2"></i>
            Imprimir
          </button>
        </div>
      </div>

      {/* Abas de Navegação */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${abaSelecionada === 'geral' ? 'active' : ''}`}
            onClick={() => setAbaSelecionada('geral')}
          >
            <i className="bi bi-graph-up me-2"></i>
            Relatório Geral
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${abaSelecionada === 'despesas' ? 'active' : ''}`}
            onClick={() => setAbaSelecionada('despesas')}
          >
            <i className="bi bi-cash-coin me-2"></i>
            Despesas com Profissionais
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${abaSelecionada === 'folha' ? 'active' : ''}`}
            onClick={() => setAbaSelecionada('folha')}
          >
            <i className="bi bi-wallet2 me-2"></i>
            Folha de Pagamento
          </button>
        </li>
      </ul>

      {/* Conteúdo da Aba Relatório Geral */}
      {abaSelecionada === 'geral' && (
      <div className="aba-conteudo">

      {/* Resumo Geral */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="relatorio-card total">
            <div className="card-icon">
              <i className="bi bi-people-fill"></i>
            </div>
            <div className="card-content">
              <h3>{dadosRelatorio.residentes.total}</h3>
              <p>Total de Residentes</p>
              <small>{dadosRelatorio.residentes.ativos} ativos</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="relatorio-card profissionais">
            <div className="card-icon">
              <i className="bi bi-person-badge-fill"></i>
            </div>
            <div className="card-content">
              <h3>{dadosRelatorio.profissionais.total}</h3>
              <p>Total de Profissionais</p>
              <small>{dadosRelatorio.profissionais.ativos} ativos</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="relatorio-card agendamentos">
            <div className="card-icon">
              <i className="bi bi-calendar-check-fill"></i>
            </div>
            <div className="card-content">
              <h3>{dadosRelatorio.agendamentos.total}</h3>
              <p>Total de Agendamentos</p>
              <small>{dadosRelatorio.agendamentos.concluidos} concluídos</small>
            </div>
          </div>
        </div>
      </div>

      {/* Residentes Detalhado */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-people me-2"></i>
            Residentes - Análise Detalhada
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6 className="mb-3">Status dos Residentes</h6>
              <div className="progress-group mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Ativos</span>
                  <span>{dadosRelatorio.residentes.ativos} ({calcularPercentual(dadosRelatorio.residentes.ativos, dadosRelatorio.residentes.total)}%)</span>
                </div>
                <div className="progress">
                  <div 
                    className="progress-bar bg-success" 
                    style={{ width: `${calcularPercentual(dadosRelatorio.residentes.ativos, dadosRelatorio.residentes.total)}%` }}
                  ></div>
                </div>
              </div>
              <div className="progress-group mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Inativos</span>
                  <span>{dadosRelatorio.residentes.inativos} ({calcularPercentual(dadosRelatorio.residentes.inativos, dadosRelatorio.residentes.total)}%)</span>
                </div>
                <div className="progress">
                  <div 
                    className="progress-bar bg-danger" 
                    style={{ width: `${calcularPercentual(dadosRelatorio.residentes.inativos, dadosRelatorio.residentes.total)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <h6 className="mb-3">Distribuição por Gênero</h6>
              <div className="progress-group mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Masculino</span>
                  <span>{dadosRelatorio.residentes.porGenero.masculino}</span>
                </div>
                <div className="progress">
                  <div 
                    className="progress-bar bg-primary" 
                    style={{ width: `${calcularPercentual(dadosRelatorio.residentes.porGenero.masculino, dadosRelatorio.residentes.total)}%` }}
                  ></div>
                </div>
              </div>
              <div className="progress-group mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Feminino</span>
                  <span>{dadosRelatorio.residentes.porGenero.feminino}</span>
                </div>
                <div className="progress">
                  <div 
                    className="progress-bar bg-danger" 
                    style={{ width: `${calcularPercentual(dadosRelatorio.residentes.porGenero.feminino, dadosRelatorio.residentes.total)}%` }}
                  ></div>
                </div>
              </div>
              {dadosRelatorio.residentes.porGenero.outro > 0 && (
                <div className="progress-group mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Outro</span>
                    <span>{dadosRelatorio.residentes.porGenero.outro}</span>
                  </div>
                  <div className="progress">
                    <div 
                      className="progress-bar bg-secondary" 
                      style={{ width: `${calcularPercentual(dadosRelatorio.residentes.porGenero.outro, dadosRelatorio.residentes.total)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <hr />

          <div className="row">
            <div className="col-12">
              <h6 className="mb-3">Distribuição por Faixa Etária</h6>
              <div className="row">
                <div className="col-md-4">
                  <div className="faixa-etaria-card">
                    <i className="bi bi-person-fill"></i>
                    <h4>{dadosRelatorio.residentes.porFaixaEtaria['0-17']}</h4>
                    <p>0-17 anos</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="faixa-etaria-card">
                    <i className="bi bi-person-fill"></i>
                    <h4>{dadosRelatorio.residentes.porFaixaEtaria['18-59']}</h4>
                    <p>18-59 anos</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="faixa-etaria-card">
                    <i className="bi bi-person-fill"></i>
                    <h4>{dadosRelatorio.residentes.porFaixaEtaria['60+']}</h4>
                    <p>60+ anos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profissionais Detalhado */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-person-badge me-2"></i>
            Profissionais - Análise Detalhada
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6 className="mb-3">Status dos Profissionais</h6>
              <div className="progress-group mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Ativos</span>
                  <span>{dadosRelatorio.profissionais.ativos} ({calcularPercentual(dadosRelatorio.profissionais.ativos, dadosRelatorio.profissionais.total)}%)</span>
                </div>
                <div className="progress">
                  <div 
                    className="progress-bar bg-success" 
                    style={{ width: `${calcularPercentual(dadosRelatorio.profissionais.ativos, dadosRelatorio.profissionais.total)}%` }}
                  ></div>
                </div>
              </div>
              <div className="progress-group mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Inativos</span>
                  <span>{dadosRelatorio.profissionais.inativos} ({calcularPercentual(dadosRelatorio.profissionais.inativos, dadosRelatorio.profissionais.total)}%)</span>
                </div>
                <div className="progress">
                  <div 
                    className="progress-bar bg-danger" 
                    style={{ width: `${calcularPercentual(dadosRelatorio.profissionais.inativos, dadosRelatorio.profissionais.total)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <h6 className="mb-3">Distribuição por Especialidade</h6>
              {Object.entries(dadosRelatorio.profissionais.porEspecialidade).map(([especialidade, quantidade]) => (
                <div key={especialidade} className="progress-group mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>{especialidade}</span>
                    <span>{quantidade}</span>
                  </div>
                  <div className="progress">
                    <div 
                      className="progress-bar bg-info" 
                      style={{ width: `${calcularPercentual(quantidade, dadosRelatorio.profissionais.total)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Agendamentos Detalhado */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-calendar-check me-2"></i>
            Agendamentos - Análise Detalhada
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6 className="mb-3">Status dos Agendamentos</h6>
              <div className="progress-group mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Agendados</span>
                  <span>{dadosRelatorio.agendamentos.agendados} ({calcularPercentual(dadosRelatorio.agendamentos.agendados, dadosRelatorio.agendamentos.total)}%)</span>
                </div>
                <div className="progress">
                  <div 
                    className="progress-bar bg-warning" 
                    style={{ width: `${calcularPercentual(dadosRelatorio.agendamentos.agendados, dadosRelatorio.agendamentos.total)}%` }}
                  ></div>
                </div>
              </div>
              <div className="progress-group mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Confirmados</span>
                  <span>{dadosRelatorio.agendamentos.confirmados} ({calcularPercentual(dadosRelatorio.agendamentos.confirmados, dadosRelatorio.agendamentos.total)}%)</span>
                </div>
                <div className="progress">
                  <div 
                    className="progress-bar bg-info" 
                    style={{ width: `${calcularPercentual(dadosRelatorio.agendamentos.confirmados, dadosRelatorio.agendamentos.total)}%` }}
                  ></div>
                </div>
              </div>
              <div className="progress-group mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Em Atendimento</span>
                  <span>{dadosRelatorio.agendamentos.em_atendimento} ({calcularPercentual(dadosRelatorio.agendamentos.em_atendimento, dadosRelatorio.agendamentos.total)}%)</span>
                </div>
                <div className="progress">
                  <div 
                    className="progress-bar bg-primary" 
                    style={{ width: `${calcularPercentual(dadosRelatorio.agendamentos.em_atendimento, dadosRelatorio.agendamentos.total)}%` }}
                  ></div>
                </div>
              </div>
              <div className="progress-group mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Concluídos</span>
                  <span>{dadosRelatorio.agendamentos.concluidos} ({calcularPercentual(dadosRelatorio.agendamentos.concluidos, dadosRelatorio.agendamentos.total)}%)</span>
                </div>
                <div className="progress">
                  <div 
                    className="progress-bar bg-success" 
                    style={{ width: `${calcularPercentual(dadosRelatorio.agendamentos.concluidos, dadosRelatorio.agendamentos.total)}%` }}
                  ></div>
                </div>
              </div>
              <div className="progress-group mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Cancelados</span>
                  <span>{dadosRelatorio.agendamentos.cancelados} ({calcularPercentual(dadosRelatorio.agendamentos.cancelados, dadosRelatorio.agendamentos.total)}%)</span>
                </div>
                <div className="progress">
                  <div 
                    className="progress-bar bg-danger" 
                    style={{ width: `${calcularPercentual(dadosRelatorio.agendamentos.cancelados, dadosRelatorio.agendamentos.total)}%` }}
                  ></div>
                </div>
              </div>
              <div className="progress-group mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Faltas</span>
                  <span>{dadosRelatorio.agendamentos.faltas} ({calcularPercentual(dadosRelatorio.agendamentos.faltas, dadosRelatorio.agendamentos.total)}%)</span>
                </div>
                <div className="progress">
                  <div 
                    className="progress-bar bg-dark" 
                    style={{ width: `${calcularPercentual(dadosRelatorio.agendamentos.faltas, dadosRelatorio.agendamentos.total)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <h6 className="mb-3">Distribuição por Tipo de Atendimento</h6>
              {Object.entries(dadosRelatorio.agendamentos.porTipo).map(([tipo, quantidade]) => (
                <div key={tipo} className="progress-group mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>{tipo}</span>
                    <span>{quantidade}</span>
                  </div>
                  <div className="progress">
                    <div 
                      className="progress-bar bg-secondary" 
                      style={{ width: `${calcularPercentual(quantidade, dadosRelatorio.agendamentos.total)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Indicadores de Performance */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-graph-up me-2"></i>
            Indicadores de Performance
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              <div className="indicador-card">
                <i className="bi bi-check-circle-fill text-success"></i>
                <h4>{calcularPercentual(dadosRelatorio.agendamentos.concluidos, dadosRelatorio.agendamentos.total)}%</h4>
                <p>Taxa de Conclusão</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="indicador-card">
                <i className="bi bi-x-circle-fill text-danger"></i>
                <h4>{calcularPercentual(dadosRelatorio.agendamentos.cancelados, dadosRelatorio.agendamentos.total)}%</h4>
                <p>Taxa de Cancelamento</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="indicador-card">
                <i className="bi bi-exclamation-circle-fill text-warning"></i>
                <h4>{calcularPercentual(dadosRelatorio.agendamentos.faltas, dadosRelatorio.agendamentos.total)}%</h4>
                <p>Taxa de Faltas</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="indicador-card">
                <i className="bi bi-people-fill text-primary"></i>
                <h4>{dadosRelatorio.profissionais.total > 0 ? (dadosRelatorio.residentes.total / dadosRelatorio.profissionais.total).toFixed(1) : 0}</h4>
                <p>Residentes por Profissional</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé do Relatório */}
      <div className="relatorio-footer">
        <p className="text-muted mb-0">
          <i className="bi bi-calendar3 me-2"></i>
          Relatório gerado em: {new Date().toLocaleString('pt-BR')}
        </p>
      </div>
      </div>
      )}

      {/* Conteúdo da Aba Despesas */}
      {abaSelecionada === 'despesas' && (
      <div className="aba-conteudo">
        {loadingDespesas ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p className="mt-3">Carregando relatório de despesas...</p>
          </div>
        ) : (
          <>
            {/* Cards de Resumo de Despesas */}
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <i className="bi bi-people-fill text-primary fs-2"></i>
                    <h3 className="mt-2">{dadosDespesas.resumo.totalProfissionais}</h3>
                    <p className="text-muted mb-0">Total de Profissionais</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <i className="bi bi-cash-stack text-success fs-2"></i>
                    <h3 className="mt-2">{formatarMoeda(dadosDespesas.resumo.folhaPagamentoTotal)}</h3>
                    <p className="text-muted mb-0">Folha de Pagamento Total</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <i className="bi bi-calculator text-info fs-2"></i>
                    <h3 className="mt-2">{formatarMoeda(dadosDespesas.resumo.salarioMedio)}</h3>
                    <p className="text-muted mb-0">Salário Médio</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <i className="bi bi-graph-up-arrow text-warning fs-2"></i>
                    <h3 className="mt-2">{formatarMoeda(dadosDespesas.resumo.salarioMaior)}</h3>
                    <p className="text-muted mb-0">Maior Salário</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Despesas por Departamento */}
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-building me-2"></i>
                  Despesas por Departamento
                </h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Departamento</th>
                        <th className="text-center">Profissionais</th>
                        <th className="text-end">Total de Despesas</th>
                        <th className="text-end">Média Salarial</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dadosDespesas.despesasPorDepartamento.map((dept, index) => (
                        <tr key={index}>
                          <td><strong>{dept.departamento}</strong></td>
                          <td className="text-center">{dept.quantidadeProfissionais}</td>
                          <td className="text-end">{formatarMoeda(dept.totalDespesas)}</td>
                          <td className="text-end">
                            {formatarMoeda(dept.totalDespesas / dept.quantidadeProfissionais)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="table-secondary">
                        <td><strong>TOTAL</strong></td>
                        <td className="text-center"><strong>{dadosDespesas.resumo.totalProfissionais}</strong></td>
                        <td className="text-end"><strong>{formatarMoeda(dadosDespesas.resumo.folhaPagamentoTotal)}</strong></td>
                        <td className="text-end"><strong>{formatarMoeda(dadosDespesas.resumo.salarioMedio)}</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Despesas por Cargo */}
            <div className="card mb-4">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">
                  <i className="bi bi-briefcase me-2"></i>
                  Despesas por Cargo
                </h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Cargo</th>
                        <th className="text-center">Quantidade</th>
                        <th className="text-end">Total de Despesas</th>
                        <th className="text-end">Salário Médio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dadosDespesas.despesasPorCargo.map((cargo, index) => (
                        <tr key={index}>
                          <td><strong>{cargo.cargo}</strong></td>
                          <td className="text-center">{cargo.quantidade}</td>
                          <td className="text-end">{formatarMoeda(cargo.totalDespesas)}</td>
                          <td className="text-end">{formatarMoeda(cargo.salarioMedio)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Lista Detalhada de Profissionais */}
            <div className="card">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">
                  <i className="bi bi-person-badge me-2"></i>
                  Detalhamento de Profissionais e Salários
                </h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>CPF</th>
                        <th>Cargo</th>
                        <th>Departamento</th>
                        <th className="text-end">Salário</th>
                        <th className="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dadosDespesas.profissionais.map((prof) => (
                        <tr key={prof.id}>
                          <td>{prof.nome_completo}</td>
                          <td>{prof.cpf}</td>
                          <td>{prof.cargo}</td>
                          <td>{prof.departamento || 'Não informado'}</td>
                          <td className="text-end"><strong>{formatarMoeda(prof.salario)}</strong></td>
                          <td className="text-center">
                            <span className={`badge ${prof.status === 'ativo' ? 'bg-success' : 'bg-secondary'}`}>
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
      <div className="aba-conteudo">
        {loadingFolha ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p className="mt-3">Carregando folha de pagamento...</p>
          </div>
        ) : (
          <>
            {/* Cabeçalho da Folha */}
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-wallet2 me-2"></i>
                    Folha de Pagamento - {folhaPagamento.mesReferencia}
                  </h5>
                  <div>
                    <button className="btn btn-light btn-sm me-2" onClick={carregarFolhaPagamento}>
                      <i className="bi bi-arrow-clockwise me-1"></i>
                      Atualizar
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-md-3">
                    <div className="p-3 border rounded">
                      <i className="bi bi-people text-primary fs-3"></i>
                      <h4 className="mt-2">{folhaPagamento.quantidadeFuncionarios}</h4>
                      <p className="text-muted mb-0">Funcionários Ativos</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3 border rounded">
                      <i className="bi bi-currency-dollar text-success fs-3"></i>
                      <h4 className="mt-2">{formatarMoeda(folhaPagamento.totais.salarioBruto)}</h4>
                      <p className="text-muted mb-0">Total Bruto</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3 border rounded">
                      <i className="bi bi-dash-circle text-warning fs-3"></i>
                      <h4 className="mt-2">{formatarMoeda(folhaPagamento.totais.totalDescontos)}</h4>
                      <p className="text-muted mb-0">Total Descontos</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3 border rounded bg-light">
                      <i className="bi bi-check-circle text-info fs-3"></i>
                      <h4 className="mt-2">{formatarMoeda(folhaPagamento.totais.salarioLiquido)}</h4>
                      <p className="text-muted mb-0">Total Líquido</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabela de Folha de Pagamento */}
            <div className="card">
              <div className="card-header bg-secondary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-table me-2"></i>
                  Detalhamento da Folha
                </h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Nome</th>
                        <th>CPF</th>
                        <th>Cargo</th>
                        <th>Departamento</th>
                        <th className="text-end">Salário Bruto</th>
                        <th className="text-end">INSS</th>
                        <th className="text-end">IRRF</th>
                        <th className="text-end">Salário Líquido</th>
                      </tr>
                    </thead>
                    <tbody>
                      {folhaPagamento.folha.map((funcionario, index) => (
                        <tr key={index}>
                          <td>{funcionario.nome}</td>
                          <td>{funcionario.cpf}</td>
                          <td>{funcionario.cargo}</td>
                          <td>{funcionario.departamento}</td>
                          <td className="text-end">{formatarMoeda(funcionario.salarioBruto)}</td>
                          <td className="text-end text-danger">{formatarMoeda(funcionario.inss)}</td>
                          <td className="text-end text-danger">{formatarMoeda(funcionario.irrf)}</td>
                          <td className="text-end"><strong>{formatarMoeda(funcionario.salarioLiquido)}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="table-secondary">
                      <tr>
                        <td colSpan="4"><strong>TOTAIS</strong></td>
                        <td className="text-end"><strong>{formatarMoeda(folhaPagamento.totais.salarioBruto)}</strong></td>
                        <td className="text-end" colSpan="2"><strong>{formatarMoeda(folhaPagamento.totais.totalDescontos)}</strong></td>
                        <td className="text-end"><strong>{formatarMoeda(folhaPagamento.totais.salarioLiquido)}</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="alert alert-info mt-3">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Observação:</strong> Os valores de INSS (11%) e IRRF (7,5%) são simulados para fins de demonstração. 
                  Em um sistema real, devem ser calculados conforme as tabelas oficiais vigentes.
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      )}
    </div>
  )
}

export default Relatorios
