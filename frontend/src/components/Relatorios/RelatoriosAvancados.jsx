import { useState } from 'react'
import api from '../../api/axios'
import { useNotification } from '../../contexts/NotificationContext'
import { HelpButton } from '../Common'
import { exportarCSV, imprimirRelatorio } from '../../services/relatorioService'

function RelatoriosAvancados() {
  const { success, error: showError } = useNotification()
  const [tipoRelatorio, setTipoRelatorio] = useState('geral')
  const [loading, setLoading] = useState(false)
  const [dados, setDados] = useState(null)
  const [filtros, setFiltros] = useState({
    data_inicio: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    data_fim: new Date().toISOString().split('T')[0],
    status: '',
    sexo: '',
    profissao: '',
    tipo_atendimento: ''
  })

  const tiposRelatorio = [
    { id: 'geral', nome: 'Relatório Geral', icon: 'bi-clipboard-data', color: 'primary' },
    { id: 'residentes', nome: 'Residentes', icon: 'bi-people', color: 'info' },
    { id: 'profissionais', nome: 'Profissionais', icon: 'bi-person-badge', color: 'success' },
    { id: 'agendamentos', nome: 'Agendamentos', icon: 'bi-calendar-check', color: 'warning' },
    { id: 'financeiro', nome: 'Financeiro', icon: 'bi-cash-coin', color: 'danger' }
  ]

  const gerarRelatorio = async () => {
    setLoading(true)
    try {
      let response
      const params = new URLSearchParams()
      
      Object.keys(filtros).forEach(key => {
        if (filtros[key]) {
          params.append(key, filtros[key])
        }
      })

      switch (tipoRelatorio) {
        case 'geral':
          response = await api.get(`/relatorios/geral?${params}`)
          break
        case 'residentes':
          response = await api.get(`/relatorios/residentes?${params}`)
          break
        case 'profissionais':
          response = await api.get(`/relatorios/profissionais?${params}`)
          break
        case 'agendamentos':
          response = await api.get(`/relatorios/agendamentos?${params}`)
          break
        case 'financeiro':
          response = await api.get(`/relatorios/financeiro?${params}`)
          break
        default:
          break
      }

      setDados(response.data)
      success('Relatório gerado com sucesso!')
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
      showError('Erro ao gerar relatório. Verifique os filtros e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const exportarRelatorioCSV = () => {
    if (!dados) {
      showError('Gere um relatório antes de exportar')
      return
    }

    // Verificar se tem dados válidos (dados.data para listagens ou dados.dados para geral)
    const temDados = dados.data || dados.dados || dados.financeiro
    if (!temDados) {
      showError('Relatório sem dados para exportar')
      return
    }

    try {
      exportarCSV(dados, tipoRelatorio)
      success('Relatório exportado com sucesso!')
    } catch (error) {
      console.error('Erro ao exportar:', error)
      showError('Erro ao exportar relatório')
    }
  }

  const imprimirRelatorio = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl mr-4 shadow-lg">
                <i className="bi bi-file-earmark-bar-graph text-white text-3xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Relatórios Avançados
                </h1>
                <p className="text-slate-400">
                  Gere relatórios detalhados com filtros personalizados
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Seleção de Tipo de Relatório */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">
            <i className="bi bi-filter-circle mr-2"></i>
            Selecione o Tipo de Relatório
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {tiposRelatorio.map(tipo => (
              <button
                key={tipo.id}
                onClick={() => setTipoRelatorio(tipo.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  tipoRelatorio === tipo.id
                    ? `border-${tipo.color} bg-${tipo.color}/20`
                    : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                }`}
              >
                <i className={`${tipo.icon} text-3xl mb-2 ${
                  tipoRelatorio === tipo.id ? `text-${tipo.color}` : 'text-slate-400'
                }`}></i>
                <div className="text-white font-semibold text-sm">{tipo.nome}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">
            <i className="bi bi-funnel mr-2"></i>
            Filtros
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Data Início */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Data Início
              </label>
              <input
                type="date"
                value={filtros.data_inicio}
                onChange={(e) => setFiltros({ ...filtros, data_inicio: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white"
              />
            </div>

            {/* Data Fim */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Data Fim
              </label>
              <input
                type="date"
                value={filtros.data_fim}
                onChange={(e) => setFiltros({ ...filtros, data_fim: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white"
              />
            </div>

            {/* Filtros Específicos por Tipo */}
            {tipoRelatorio === 'residentes' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Status
                  </label>
                  <select
                    value={filtros.status}
                    onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white"
                  >
                    <option value="">Todos</option>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Sexo
                  </label>
                  <select
                    value={filtros.sexo}
                    onChange={(e) => setFiltros({ ...filtros, sexo: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white"
                  >
                    <option value="">Todos</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                  </select>
                </div>
              </>
            )}

            {tipoRelatorio === 'profissionais' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Status
                </label>
                <select
                  value={filtros.status}
                  onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white"
                >
                  <option value="">Todos</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={gerarRelatorio}
              disabled={loading}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Gerando...
                </>
              ) : (
                <>
                  <i className="bi bi-play-circle mr-2"></i>
                  Gerar Relatório
                </>
              )}
            </button>
            
            {dados && (
              <>
                <button
                  onClick={exportarRelatorioCSV}
                  className="flex items-center px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all"
                >
                  <i className="bi bi-file-earmark-spreadsheet mr-2"></i>
                  Exportar CSV
                </button>
                
                <button
                  onClick={imprimirRelatorio}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
                >
                  <i className="bi bi-printer mr-2"></i>
                  Imprimir
                </button>
              </>
            )}
          </div>
        </div>

        {/* Resultados do Relatório */}
        {dados && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-6 print:bg-white print:text-black">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white print:text-black">
                <i className="bi bi-graph-up mr-2"></i>
                Resultados
              </h2>
              <div className="text-slate-400 text-sm print:text-gray-600">
                Gerado em: {new Date().toLocaleString('pt-BR')}
              </div>
            </div>

            {/* Relatório Geral */}
            {tipoRelatorio === 'geral' && dados.dados && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold">{dados.dados.residentes.total}</div>
                        <div className="text-blue-100 text-sm mt-1">{dados.dados.residentes.label}</div>
                      </div>
                      <i className="bi bi-people text-4xl opacity-50"></i>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold">{dados.dados.profissionais.total}</div>
                        <div className="text-green-100 text-sm mt-1">{dados.dados.profissionais.label}</div>
                      </div>
                      <i className="bi bi-person-badge text-4xl opacity-50"></i>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold">{dados.dados.agendamentos.total}</div>
                        <div className="text-purple-100 text-sm mt-1">{dados.dados.agendamentos.label}</div>
                      </div>
                      <i className="bi bi-calendar-check text-4xl opacity-50"></i>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold">{dados.dados.consultas.total}</div>
                        <div className="text-orange-100 text-sm mt-1">{dados.dados.consultas.label}</div>
                      </div>
                      <i className="bi bi-clipboard2-pulse text-4xl opacity-50"></i>
                    </div>
                  </div>
                </div>

                {/* Resumo Financeiro */}
                {dados.financeiro && (
                  <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                    <h3 className="text-xl font-bold text-white mb-4">
                      <i className="bi bi-cash-stack mr-2"></i>
                      Resumo Financeiro
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-green-400 text-2xl font-bold">
                          R$ {dados.financeiro.receitas.toFixed(2)}
                        </div>
                        <div className="text-slate-400 text-sm">Receitas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-red-400 text-2xl font-bold">
                          R$ {dados.financeiro.gastos.toFixed(2)}
                        </div>
                        <div className="text-slate-400 text-sm">Gastos</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${dados.financeiro.saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          R$ {dados.financeiro.saldo.toFixed(2)}
                        </div>
                        <div className="text-slate-400 text-sm">Saldo</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tabela de Dados */}
            {dados.data && Array.isArray(dados.data) && dados.data.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-700/50">
                    <tr>
                      {Object.keys(dados.data[0]).slice(0, 6).map((key, index) => (
                        <th key={index} className="px-4 py-3 text-left text-white font-semibold capitalize">
                          {key.replace(/_/g, ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {dados.data.slice(0, 50).map((item, index) => (
                      <tr key={index} className="hover:bg-slate-700/30">
                        {Object.values(item).slice(0, 6).map((value, i) => (
                          <td key={i} className="px-4 py-3 text-slate-300">
                            {typeof value === 'object' ? JSON.stringify(value) : value || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {dados.data.length > 50 && (
                  <div className="text-center py-4 text-slate-400">
                    Mostrando 50 de {dados.data.length} registros. Exporte para ver todos.
                  </div>
                )}
              </div>
            )}

            {/* Estatísticas */}
            {dados.estatisticas && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(dados.estatisticas).map(([key, value]) => (
                  <div key={key} className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 text-center">
                    <div className="text-2xl font-bold text-white">{value}</div>
                    <div className="text-slate-400 text-sm capitalize">{key.replace(/_/g, ' ')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botão de Ajuda */}
      <HelpButton
        title="Como Gerar Relatórios"
        content="Esta tela permite gerar relatórios detalhados com diversos filtros. Os relatórios podem ser exportados em CSV ou impressos."
        steps={[
          {
            title: "Escolher Tipo de Relatório",
            description: "Selecione entre Geral, Residentes, Profissionais, Agendamentos ou Financeiro."
          },
          {
            title: "Aplicar Filtros",
            description: "Configure o período e filtros específicos para refinar os resultados."
          },
          {
            title: "Gerar Relatório",
            description: "Clique em 'Gerar Relatório' para visualizar os dados."
          },
          {
            title: "Exportar ou Imprimir",
            description: "Use os botões para exportar em CSV ou imprimir o relatório."
          }
        ]}
        tips={[
          "O relatório geral mostra um resumo de todo o sistema",
          "Exportação CSV é ideal para análise no Excel",
          "Use filtros de data para relatórios mensais ou anuais",
          "Relatórios financeiros são restritos a administradores",
          "Gráficos são exibidos automaticamente quando disponíveis"
        ]}
      />
    </div>
  )
}

export default RelatoriosAvancados
