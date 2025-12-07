import { useState, useMemo } from 'react'
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
  useResidentes,
  useProfissionais,
  useAgendamentos
} from '../../hooks'

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
  
  // React Query - Cache automático
  const { data: residentes = [], isLoading: loadingResidentes } = useResidentes()
  const { data: profissionais = [], isLoading: loadingProfissionais } = useProfissionais()
  const { data: agendamentos = [], isLoading: loadingAgendamentos } = useAgendamentos()
  
  const loading = loadingResidentes || loadingProfissionais || loadingAgendamentos

  // Calcular estatísticas com memoização
  const stats = useMemo(() => {
    const residentesAtivos = residentes.filter(r => r.status === 'ativo')
    const profissionaisAtivos = profissionais.filter(p => p.status === 'ativo')
    
    const hoje = new Date().toISOString().split('T')[0]
    const agendamentosHoje = agendamentos.filter(ag => 
      ag.data_agendamento?.startsWith(hoje) || ag.data_consulta?.startsWith(hoje)
    ).length
    
    const concluidos = agendamentos.filter(ag => ag.status === 'concluido').length
    const cancelados = agendamentos.filter(ag => ag.status === 'cancelado').length
    const total = agendamentos.length || 1
    
    return {
      totalResidentes: residentes.length,
      residentesAtivos: residentesAtivos.length,
      totalProfissionais: profissionais.length,
      profissionaisAtivos: profissionaisAtivos.length,
      totalAgendamentos: agendamentos.length,
      agendamentosHoje,
      taxaConclusao: ((concluidos / total) * 100).toFixed(1),
      taxaCancelamento: ((cancelados / total) * 100).toFixed(1)
    }
  }, [residentes, profissionais, agendamentos])

  // Calcular dados dos gráficos com memoização
  const chartData = useMemo(() => {
    // 1. Agendamentos por Status
    const statusData = {
      labels: ['Agendado', 'Confirmado', 'Em Atendimento', 'Concluído', 'Cancelado', 'Falta'],
      data: [
        agendamentos.filter(ag => ag.status === 'agendado').length,
        agendamentos.filter(ag => ag.status === 'confirmado').length,
        agendamentos.filter(ag => ag.status === 'em_atendimento').length,
        agendamentos.filter(ag => ag.status === 'concluido').length,
        agendamentos.filter(ag => ag.status === 'cancelado').length,
        agendamentos.filter(ag => ag.status === 'falta').length
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

    // 3. Profissionais por Especialidade/Profissão
    const especialidadeCount = {}
    profissionais.forEach(prof => {
      const esp = prof.profissao || prof.especialidade || 'Não informada'
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
      const dataConsulta = (ag.data_agendamento || ag.data_consulta || '').split('T')[0]
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
        (ag.data_agendamento || ag.data_consulta || '').startsWith(mesAno)
      ).length
      
      agendamentosPorMesCount.push(count)
    }

    const mesData = {
      labels: meses,
      data: agendamentosPorMesCount
    }

    return {
      agendamentosPorMes: mesData,
      agendamentosPorStatus: statusData,
      residentesPorGenero: generoData,
      profissionaisPorEspecialidade: especialidadeData,
      agendamentosPorTipo: tipoData,
      tendenciaUltimos7Dias: tendenciaData
    }
  }, [residentes, profissionais, agendamentos])

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="relative mb-8 sm:mb-12">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl blur-3xl"></div>
          
          <div className="relative bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-6 sm:p-8 md:p-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/30 animate-pulse">
                    <i className="bi bi-house-heart-fill text-3xl sm:text-4xl text-white"></i>
                  </div>
                  <div className="h-12 sm:h-16 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Bem-vindo!
                    </h1>
                    <p className="text-slate-400 text-sm sm:text-base mt-1">Sistema de Gerenciamento Residencial</p>
                  </div>
                </div>
                
                <p className="text-slate-300 text-base sm:text-lg mb-6 max-w-2xl mx-auto lg:mx-0">
                  Gerencie com eficiência todos os aspectos do seu centro de cuidados. 
                  Controle residentes, profissionais, agendamentos e finanças em um único lugar.
                </p>

                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                  <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <span className="text-blue-400 text-sm font-medium">✓ Gerenciamento Completo</span>
                  </div>
                  <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                    <span className="text-purple-400 text-sm font-medium">✓ Relatórios Detalhados</span>
                  </div>
                  <div className="px-4 py-2 bg-pink-500/10 border border-pink-500/20 rounded-xl">
                    <span className="text-pink-400 text-sm font-medium">✓ Seguro & Confiável</span>
                  </div>
                </div>
              </div>

              {/* Ilustração/Stats */}
              <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3">
                    <i className="bi bi-people-fill text-2xl text-blue-400"></i>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1">{stats.residentesAtivos}</h3>
                  <p className="text-blue-300 text-sm">Residentes Ativos</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-3">
                    <i className="bi bi-person-badge-fill text-2xl text-purple-400"></i>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1">{stats.profissionaisAtivos}</h3>
                  <p className="text-purple-300 text-sm">Profissionais</p>
                </div>

                <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 backdrop-blur-sm rounded-2xl p-6 border border-pink-500/30">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-3">
                    <i className="bi bi-calendar-check-fill text-2xl text-pink-400"></i>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1">{stats.agendamentosHoje}</h3>
                  <p className="text-pink-300 text-sm">Agendamentos Hoje</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-sm rounded-2xl p-6 border border-emerald-500/30">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-3">
                    <i className="bi bi-graph-up-arrow text-2xl text-emerald-400"></i>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1">{stats.taxaConclusao}%</h3>
                  <p className="text-emerald-300 text-sm">Taxa Conclusão</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recursos Principais */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <i className="bi bi-grid-3x3-gap-fill text-white"></i>
            </div>
            Recursos do Sistema
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Card Gerenciamento de Residentes */}
            <div className="group bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                  <i className="bi bi-people-fill text-2xl text-white"></i>
                </div>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-medium">
                  {stats.totalResidentes} Total
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Residentes</h3>
              <p className="text-slate-400 text-sm mb-4">
                Cadastro completo, histórico médico, documentação e acompanhamento individualizado.
              </p>
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <i className="bi bi-check-circle-fill"></i>
                <span>{stats.residentesAtivos} ativos no momento</span>
              </div>
            </div>

            {/* Card Profissionais */}
            <div className="group bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                  <i className="bi bi-person-badge-fill text-2xl text-white"></i>
                </div>
                <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-xs font-medium">
                  {stats.totalProfissionais} Total
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Profissionais</h3>
              <p className="text-slate-400 text-sm mb-4">
                Equipe médica, enfermeiros, terapeutas e cuidadores com controle de escalas e especializações.
              </p>
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <i className="bi bi-check-circle-fill"></i>
                <span>{stats.profissionaisAtivos} em atividade</span>
              </div>
            </div>

            {/* Card Agendamentos */}
            <div className="group bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300 cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform">
                  <i className="bi bi-calendar-check-fill text-2xl text-white"></i>
                </div>
                <span className="px-3 py-1 bg-pink-500/10 text-pink-400 rounded-full text-xs font-medium">
                  {stats.totalAgendamentos} Total
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Agendamentos</h3>
              <p className="text-slate-400 text-sm mb-4">
                Consultas, terapias, exames e atividades programadas com lembretes automáticos.
              </p>
              <div className="flex items-center gap-2 text-cyan-400 text-sm">
                <i className="bi bi-calendar-today"></i>
                <span>{stats.agendamentosHoje} agendados para hoje</span>
              </div>
            </div>

            {/* Card Financeiro */}
            <div className="group bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                  <i className="bi bi-cash-coin text-2xl text-white"></i>
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium">
                  Ativo
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Gestão Financeira</h3>
              <p className="text-slate-400 text-sm mb-4">
                Controle de mensalidades, despesas operacionais, salários e relatórios financeiros completos.
              </p>
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <i className="bi bi-graph-up-arrow"></i>
                <span>Acompanhamento em tempo real</span>
              </div>
            </div>

            {/* Card Relatórios */}
            <div className="group bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300 cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                  <i className="bi bi-file-earmark-bar-graph-fill text-2xl text-white"></i>
                </div>
                <span className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-medium">
                  Disponível
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Relatórios</h3>
              <p className="text-slate-400 text-sm mb-4">
                Relatórios detalhados de ocupação, atendimentos, financeiro e indicadores de qualidade.
              </p>
              <div className="flex items-center gap-2 text-amber-400 text-sm">
                <i className="bi bi-file-earmark-text"></i>
                <span>Exportação em PDF e Excel</span>
              </div>
            </div>

            {/* Card Analytics */}
            <div className="group bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                  <i className="bi bi-speedometer2 text-2xl text-white"></i>
                </div>
                <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-xs font-medium">
                  {stats.taxaConclusao}%
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Analytics</h3>
              <p className="text-slate-400 text-sm mb-4">
                Dashboards interativos com métricas, KPIs e análises preditivas para tomada de decisão.
              </p>
              <div className="flex items-center gap-2 text-cyan-400 text-sm">
                <i className="bi bi-graph-up"></i>
                <span>Taxa de conclusão de {stats.taxaConclusao}%</span>
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
