import { useState, useMemo, memo } from 'react'
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
import { HelpButton } from '../Common'

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
      ag.data_agendamento?.startsWith(hoje)
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
      outro: residentes.filter(r => {
        const sexo = r.sexo?.toLowerCase()
        return sexo && !['masculino', 'feminino'].includes(sexo)
      }).length
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
      const dataConsulta = (ag.data_agendamento || '').split('T')[0]
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
        (ag.data_agendamento || '').startsWith(mesAno)
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

  // Configurações dos gráficos - Design Limpo
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { 
          stepSize: 1, 
          color: '#64748b',
          font: { size: 11 }
        },
        grid: { 
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false
        },
        border: { display: false }
      },
      x: {
        ticks: { 
          color: '#64748b',
          font: { size: 11 }
        },
        grid: { 
          display: false
        },
        border: { display: false }
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
        ticks: { 
          stepSize: 1, 
          color: '#64748b',
          font: { size: 11 }
        },
        grid: { 
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false
        },
        border: { display: false }
      },
      x: {
        ticks: { 
          color: '#64748b',
          font: { size: 11 }
        },
        grid: { 
          display: false
        },
        border: { display: false }
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { 
          color: '#cbd5e1',
          font: { size: 11 },
          padding: 12,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      }
    }
  }

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { 
          color: '#cbd5e1',
          font: { size: 11 },
          padding: 12,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Simples */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Bem-vindo ao Sistema
            </h1>
            <p className="text-slate-400 text-sm">
              Visão geral do gerenciamento residencial
            </p>
          </div>
          <HelpButton section="dashboard" />
        </div>

        {/* Cards de Estatísticas - Design Limpo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-clean">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <i className="bi bi-people text-blue-400 text-lg"></i>
              </div>
              <span className="badge-clean badge-info text-xs">{stats.residentesAtivos}</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.totalResidentes}</h3>
            <p className="text-slate-400 text-xs">Residentes</p>
          </div>

          <div className="card-clean">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <i className="bi bi-person-badge text-purple-400 text-lg"></i>
              </div>
              <span className="badge-clean badge-info text-xs">{stats.profissionaisAtivos}</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.totalProfissionais}</h3>
            <p className="text-slate-400 text-xs">Profissionais</p>
          </div>

          <div className="card-clean">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <i className="bi bi-calendar-check text-amber-400 text-lg"></i>
              </div>
              <span className="badge-clean badge-warning text-xs">{stats.agendamentosHoje}</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.totalAgendamentos}</h3>
            <p className="text-slate-400 text-xs">Agendamentos</p>
          </div>

          <div className="card-clean">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <i className="bi bi-graph-up text-emerald-400 text-lg"></i>
              </div>
              <span className="badge-clean badge-success text-xs">{stats.taxaConclusao}%</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.taxaConclusao}%</h3>
            <p className="text-slate-400 text-xs">Taxa Conclusão</p>
          </div>
        </div>

        {/* Gráficos - Layout Limpo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tendência Últimos 7 Dias */}
          <div className="lg:col-span-2 card-clean">
            <h3 className="heading-3 mb-6">Tendência de Agendamentos</h3>
            <div style={{ height: '280px' }}>
              <Line
                data={{
                  labels: chartData.tendenciaUltimos7Dias.labels,
                  datasets: [{
                    label: 'Agendamentos',
                    data: chartData.tendenciaUltimos7Dias.data,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.05)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: '#f59e0b'
                  }]
                }}
                options={lineChartOptions}
              />
            </div>
          </div>

          {/* Agendamentos por Status */}
          <div className="card-clean">
            <h3 className="heading-3 mb-6">Status dos Agendamentos</h3>
            <div style={{ height: '280px' }}>
              <Doughnut
                data={{
                  labels: chartData.agendamentosPorStatus.labels,
                  datasets: [{
                    data: chartData.agendamentosPorStatus.data,
                    backgroundColor: chartData.agendamentosPorStatus.colors,
                    borderWidth: 0
                  }]
                }}
                options={doughnutOptions}
              />
            </div>
          </div>
        </div>

        {/* Gráficos Secundários */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agendamentos por Mês */}
          <div className="card-clean">
            <h3 className="heading-3 mb-6">Últimos 6 Meses</h3>
            <div style={{ height: '240px' }}>
              <Bar
                data={{
                  labels: chartData.agendamentosPorMes.labels,
                  datasets: [{
                    label: 'Agendamentos',
                    data: chartData.agendamentosPorMes.data,
                    backgroundColor: 'rgba(245, 158, 11, 0.6)',
                    borderRadius: 6,
                    borderWidth: 0
                  }]
                }}
                options={barChartOptions}
              />
            </div>
          </div>

          {/* Profissionais por Especialidade */}
          <div className="card-clean">
            <h3 className="heading-3 mb-6">Especialidades</h3>
            <div style={{ height: '240px' }}>
              <Bar
                data={{
                  labels: chartData.profissionaisPorEspecialidade.labels,
                  datasets: [{
                    label: 'Profissionais',
                    data: chartData.profissionaisPorEspecialidade.data,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderRadius: 6,
                    borderWidth: 0
                  }]
                }}
                options={barChartOptions}
              />
            </div>
          </div>
        </div>

        {/* Gráficos de Pizza */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Residentes por Gênero */}
          <div className="card-clean">
            <h3 className="heading-3 mb-6">Residentes por Gênero</h3>
            <div style={{ height: '220px' }}>
              <Pie
                data={{
                  labels: chartData.residentesPorGenero.labels,
                  datasets: [{
                    data: chartData.residentesPorGenero.data,
                    backgroundColor: chartData.residentesPorGenero.colors,
                    borderWidth: 0
                  }]
                }}
                options={pieOptions}
              />
            </div>
          </div>

          {/* Agendamentos por Tipo */}
          <div className="card-clean">
            <h3 className="heading-3 mb-6">Tipos de Atendimento</h3>
            <div style={{ height: '220px' }}>
              <Pie
                data={{
                  labels: chartData.agendamentosPorTipo.labels,
                  datasets: [{
                    data: chartData.agendamentosPorTipo.data,
                    backgroundColor: chartData.agendamentosPorTipo.colors,
                    borderWidth: 0
                  }]
                }}
                options={pieOptions}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(Dashboard)
