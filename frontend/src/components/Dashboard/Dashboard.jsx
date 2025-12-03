import { useState, useEffect } from 'react'
import { useNotification } from '../../contexts/NotificationContext'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2'
import {
  listarResidentes,
  listarProfissionais,
  obterEstatisticasAgendamentos,
  listarAgendamentos
} from '../../api/api'

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function Dashboard() {
  const { error: showError } = useNotification()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalResidentes: 0,
    residentesAtivos: 0,
    totalProfissionais: 0,
    profissionaisAtivos: 0,
    totalAgendamentos: 0,
    agendamentosHoje: 0,
    taxaConclusao: 0,
    taxaCancelamento: 0
  })

  const [chartData, setChartData] = useState({
    agendamentosPorMes: { labels: [], data: [] },
    agendamentosPorStatus: { labels: [], data: [], colors: [] },
    residentesPorGenero: { labels: [], data: [], colors: [] },
    profissionaisPorEspecialidade: { labels: [], data: [] },
    agendamentosPorTipo: { labels: [], data: [], colors: [] },
    tendenciaUltimos7Dias: { labels: [], data: [] }
  })

  useEffect(() => {
    carregarDadosDashboard()
    // Atualizar a cada 5 minutos
    const interval = setInterval(carregarDadosDashboard, 300000)
    return () => clearInterval(interval)
  }, [])

  const carregarDadosDashboard = async () => {
    try {
      setLoading(true)

      const [residentesRes, profissionaisRes, estatisticasRes, agendamentosRes] = await Promise.all([
        listarResidentes({ limit: 1000 }),
        listarProfissionais({ limit: 1000 }),
        obterEstatisticasAgendamentos(),
        listarAgendamentos({ limit: 1000 })
      ])

      // Processar residentes
      const residentes = residentesRes.data?.residentes || []
      const residentesAtivos = residentes.filter(r => r.status === 'ativo')

      // Processar profissionais
      const profissionais = profissionaisRes.data?.profissionais || []
      const profissionaisAtivos = profissionais.filter(p => p.status === 'ativo')

      // Processar agendamentos
      const estatisticas = estatisticasRes.data || {}
      const agendamentos = agendamentosRes.data?.agendamentos || []

      // Agendamentos de hoje
      const hoje = new Date().toISOString().split('T')[0]
      const agendamentosHoje = agendamentos.filter(ag => 
        ag.data_consulta?.startsWith(hoje)
      ).length

      // Calcular taxas
      const total = estatisticas.total || 1
      const taxaConclusao = ((estatisticas.concluidos || 0) / total * 100).toFixed(1)
      const taxaCancelamento = ((estatisticas.cancelados || 0) / total * 100).toFixed(1)

      // Atualizar stats
      setStats({
        totalResidentes: residentes.length,
        residentesAtivos: residentesAtivos.length,
        totalProfissionais: profissionais.length,
        profissionaisAtivos: profissionaisAtivos.length,
        totalAgendamentos: total,
        agendamentosHoje,
        taxaConclusao: parseFloat(taxaConclusao),
        taxaCancelamento: parseFloat(taxaCancelamento)
      })

      // Preparar dados dos gráficos
      prepararDadosGraficos(residentes, profissionais, agendamentos, estatisticas)

    } catch {
      showError('Erro ao carregar dados do dashboard')
    } finally {
      setLoading(false)
    }
  }

  const prepararDadosGraficos = (residentes, profissionais, agendamentos, estatisticas) => {
    // 1. Agendamentos por Status
    const statusData = {
      labels: ['Agendado', 'Confirmado', 'Em Atendimento', 'Concluído', 'Cancelado', 'Falta'],
      data: [
        estatisticas.agendados || 0,
        estatisticas.confirmados || 0,
        estatisticas.em_atendimento || 0,
        estatisticas.concluidos || 0,
        estatisticas.cancelados || 0,
        estatisticas.faltas || 0
      ],
      colors: ['#fbbf24', '#06b6d4', '#3b82f6', '#10b981', '#ef4444', '#6b7280']
    }

    // 2. Residentes por Gênero
    const generoCount = {
      masculino: residentes.filter(r => r.sexo?.toLowerCase() === 'masculino').length,
      feminino: residentes.filter(r => r.sexo?.toLowerCase() === 'feminino').length,
      outro: residentes.filter(r => !['masculino', 'feminino'].includes(r.sexo?.toLowerCase())).length
    }

    const generoData = {
      labels: ['Masculino', 'Feminino', 'Outro'],
      data: [generoCount.masculino, generoCount.feminino, generoCount.outro],
      colors: ['#3b82f6', '#ec4899', '#6b7280']
    }

    // 3. Profissionais por Especialidade
    const especialidadeCount = {}
    profissionais.forEach(prof => {
      const esp = prof.especialidade || 'Não informada'
      especialidadeCount[esp] = (especialidadeCount[esp] || 0) + 1
    })

    const especialidadeData = {
      labels: Object.keys(especialidadeCount).slice(0, 8),
      data: Object.values(especialidadeCount).slice(0, 8)
    }

    // 4. Agendamentos por Tipo
    const tipoCount = {}
    agendamentos.forEach(ag => {
      const tipo = ag.tipo_atendimento || 'Não informado'
      tipoCount[tipo] = (tipoCount[tipo] || 0) + 1
    })

    const tipoData = {
      labels: Object.keys(tipoCount),
      data: Object.values(tipoCount),
      colors: ['#3b82f6', '#10b981', '#fbbf24', '#06b6d4', '#ef4444', '#8b5cf6']
    }

    // 5. Tendência Últimos 7 Dias
    const ultimos7Dias = []
    const agendamentosPorDia = {}
    
    for (let i = 6; i >= 0; i--) {
      const data = new Date()
      data.setDate(data.getDate() - i)
      const dataStr = data.toISOString().split('T')[0]
      ultimos7Dias.push(data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }))
      agendamentosPorDia[dataStr] = 0
    }

    agendamentos.forEach(ag => {
      const dataConsulta = ag.data_consulta?.split('T')[0]
      if (agendamentosPorDia.hasOwnProperty(dataConsulta)) {
        agendamentosPorDia[dataConsulta]++
      }
    })

    const tendenciaData = {
      labels: ultimos7Dias,
      data: Object.values(agendamentosPorDia)
    }

    // 6. Agendamentos por Mês (últimos 6 meses)
    const meses = []
    const agendamentosPorMesCount = []
    
    for (let i = 5; i >= 0; i--) {
      const data = new Date()
      data.setMonth(data.getMonth() - i)
      const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
      meses.push(data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }))
      
      const count = agendamentos.filter(ag => 
        ag.data_consulta?.startsWith(mesAno)
      ).length
      
      agendamentosPorMesCount.push(count)
    }

    const mesData = {
      labels: meses,
      data: agendamentosPorMesCount
    }

    setChartData({
      agendamentosPorMes: mesData,
      agendamentosPorStatus: statusData,
      residentesPorGenero: generoData,
      profissionaisPorEspecialidade: especialidadeData,
      agendamentosPorTipo: tipoData,
      tendenciaUltimos7Dias: tendenciaData
    })
  }

  // Configurações dos gráficos
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { color: '#cbd5e1' }
      },
      title: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#94a3b8' },
        grid: { color: '#334155' }
      },
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' }
      }
    }
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#94a3b8' },
        grid: { color: '#334155' }
      },
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' }
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#cbd5e1' }
      }
    }
  }

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#cbd5e1' }
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-16 w-16 text-purple-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-400 text-lg">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <i className="bi bi-speedometer2 text-3xl text-white"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard Analytics</h1>
              <p className="text-slate-400">Visão geral do sistema em tempo real</p>
            </div>
          </div>
          <button
            onClick={carregarDadosDashboard}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg shadow-lg shadow-purple-500/30 transition-all flex items-center gap-2"
          >
            <i className="bi bi-arrow-clockwise"></i>
            Atualizar
          </button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 hover:border-blue-500/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <i className="bi bi-people-fill text-3xl text-blue-400"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-white">{stats.totalResidentes}</h3>
                <p className="text-slate-400 text-sm">Total de Residentes</p>
                <div className="flex items-center gap-1 mt-1">
                  <i className="bi bi-check-circle-fill text-emerald-400 text-xs"></i>
                  <span className="text-emerald-400 text-xs">{stats.residentesAtivos} ativos</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 hover:border-emerald-500/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <i className="bi bi-person-badge-fill text-3xl text-emerald-400"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-white">{stats.totalProfissionais}</h3>
                <p className="text-slate-400 text-sm">Total de Profissionais</p>
                <div className="flex items-center gap-1 mt-1">
                  <i className="bi bi-check-circle-fill text-emerald-400 text-xs"></i>
                  <span className="text-emerald-400 text-xs">{stats.profissionaisAtivos} ativos</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 hover:border-amber-500/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <i className="bi bi-calendar-check-fill text-3xl text-amber-400"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-white">{stats.totalAgendamentos}</h3>
                <p className="text-slate-400 text-sm">Total de Agendamentos</p>
                <div className="flex items-center gap-1 mt-1">
                  <i className="bi bi-calendar-today text-cyan-400 text-xs"></i>
                  <span className="text-cyan-400 text-xs">{stats.agendamentosHoje} hoje</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 hover:border-purple-500/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <i className="bi bi-graph-up-arrow text-3xl text-purple-400"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-white">{stats.taxaConclusao}%</h3>
                <p className="text-slate-400 text-sm">Taxa de Conclusão</p>
                <div className="flex items-center gap-1 mt-1">
                  <i className="bi bi-x-circle-fill text-red-400 text-xs"></i>
                  <span className="text-red-400 text-xs">{stats.taxaCancelamento}% cancelados</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Tendência Últimos 7 Dias */}
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
            <h5 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <i className="bi bi-graph-up text-blue-400"></i>
              Tendência de Agendamentos (Últimos 7 dias)
            </h5>
            <div style={{ height: '300px' }}>
              <Line
                data={{
                  labels: chartData.tendenciaUltimos7Dias.labels,
                  datasets: [{
                    label: 'Agendamentos',
                    data: chartData.tendenciaUltimos7Dias.data,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                  }]
                }}
                options={lineChartOptions}
              />
            </div>
          </div>

          {/* Agendamentos por Status */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
            <h5 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <i className="bi bi-pie-chart text-purple-400"></i>
              Status dos Agendamentos
            </h5>
            <div style={{ height: '300px' }}>
              <Doughnut
                data={{
                  labels: chartData.agendamentosPorStatus.labels,
                  datasets: [{
                    data: chartData.agendamentosPorStatus.data,
                    backgroundColor: chartData.agendamentosPorStatus.colors,
                    borderWidth: 2,
                    borderColor: '#1e293b'
                  }]
                }}
                options={doughnutOptions}
              />
            </div>
          </div>
        </div>

        {/* Gráficos Secundários */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Agendamentos por Mês */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
            <h5 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <i className="bi bi-bar-chart text-emerald-400"></i>
              Agendamentos por Mês (Últimos 6 meses)
            </h5>
            <div style={{ height: '250px' }}>
              <Bar
                data={{
                  labels: chartData.agendamentosPorMes.labels,
                  datasets: [{
                    label: 'Agendamentos',
                    data: chartData.agendamentosPorMes.data,
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderColor: '#10b981',
                    borderWidth: 1
                  }]
                }}
                options={barChartOptions}
              />
            </div>
          </div>

          {/* Profissionais por Especialidade */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
            <h5 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <i className="bi bi-bar-chart-line text-cyan-400"></i>
              Profissionais por Especialidade
            </h5>
            <div style={{ height: '250px' }}>
              <Bar
                data={{
                  labels: chartData.profissionaisPorEspecialidade.labels,
                  datasets: [{
                    label: 'Profissionais',
                    data: chartData.profissionaisPorEspecialidade.data,
                    backgroundColor: 'rgba(6, 182, 212, 0.7)',
                    borderColor: '#06b6d4',
                    borderWidth: 1
                  }]
                }}
                options={barChartOptions}
              />
            </div>
          </div>
        </div>

        {/* Gráficos de Pizza */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Residentes por Gênero */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
            <h5 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <i className="bi bi-gender-ambiguous text-pink-400"></i>
              Distribuição de Residentes por Gênero
            </h5>
            <div style={{ height: '250px' }}>
              <Pie
                data={{
                  labels: chartData.residentesPorGenero.labels,
                  datasets: [{
                    data: chartData.residentesPorGenero.data,
                    backgroundColor: chartData.residentesPorGenero.colors,
                    borderWidth: 2,
                    borderColor: '#1e293b'
                  }]
                }}
                options={pieOptions}
              />
            </div>
          </div>

          {/* Agendamentos por Tipo */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
            <h5 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <i className="bi bi-diagram-3 text-amber-400"></i>
              Agendamentos por Tipo de Atendimento
            </h5>
            <div style={{ height: '250px' }}>
              <Pie
                data={{
                  labels: chartData.agendamentosPorTipo.labels,
                  datasets: [{
                    data: chartData.agendamentosPorTipo.data,
                    backgroundColor: chartData.agendamentosPorTipo.colors,
                    borderWidth: 2,
                    borderColor: '#1e293b'
                  }]
                }}
                options={pieOptions}
              />
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
          <p className="text-slate-400 text-sm flex items-center gap-2 justify-center">
            <i className="bi bi-clock-history"></i>
            Última atualização: {new Date().toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
