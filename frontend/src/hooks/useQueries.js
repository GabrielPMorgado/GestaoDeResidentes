import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  residenteService, 
  profissionalService, 
  agendamentoService,
  financeiroService 
} from '../services'

// ============================================
// HOOKS DE RESIDENTES
// ============================================

export const useResidentes = () => {
  return useQuery({
    queryKey: ['residentes'],
    queryFn: residenteService.listar,
    select: (data) => {
      if (Array.isArray(data)) return data
      if (data?.data?.residentes) return data.data.residentes
      if (data?.data) return Array.isArray(data.data) ? data.data : []
      return []
    }
  })
}

export const useResidentesAtivos = () => {
  return useQuery({
    queryKey: ['residentes', 'ativos'],
    queryFn: residenteService.listarAtivos,
    select: (data) => {
      if (Array.isArray(data)) return data
      if (data?.data?.residentes) return data.data.residentes
      if (data?.data) return Array.isArray(data.data) ? data.data : []
      return []
    }
  })
}

export const useResidentesInativos = () => {
  return useQuery({
    queryKey: ['residentes', 'inativos'],
    queryFn: residenteService.listarInativos,
    select: (data) => {
      if (Array.isArray(data)) return data
      if (data?.data?.residentes) return data.data.residentes
      if (data?.data) return Array.isArray(data.data) ? data.data : []
      return []
    }
  })
}

export const useResidente = (id) => {
  return useQuery({
    queryKey: ['residente', id],
    queryFn: () => residenteService.buscarPorId(id),
    enabled: !!id,
    select: (data) => data?.data || data
  })
}

export const useCriarResidente = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: residenteService.criar,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['residentes'] })
      await queryClient.refetchQueries({ queryKey: ['residentes'] })
    }
  })
}

export const useAtualizarResidente = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, dados }) => residenteService.atualizar(id, dados),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['residentes'] })
      await queryClient.invalidateQueries({ queryKey: ['residente', variables.id] })
      await queryClient.refetchQueries({ queryKey: ['residentes'] })
    }
  })
}

export const useInativarResidente = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: residenteService.inativar,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['residentes'] })
      await queryClient.refetchQueries({ queryKey: ['residentes'] })
    }
  })
}

export const useReativarResidente = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: residenteService.reativar,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['residentes'] })
      await queryClient.refetchQueries({ queryKey: ['residentes'] })
    }
  })
}

// ============================================
// HOOKS DE PROFISSIONAIS
// ============================================

export const useProfissionais = () => {
  return useQuery({
    queryKey: ['profissionais'],
    queryFn: profissionalService.listar,
    select: (data) => {
      if (Array.isArray(data)) return data
      if (data?.data?.profissionais) return data.data.profissionais
      if (data?.data) return Array.isArray(data.data) ? data.data : []
      return []
    }
  })
}

export const useProfissionaisAtivos = () => {
  return useQuery({
    queryKey: ['profissionais', 'ativos'],
    queryFn: profissionalService.listarAtivos,
    select: (data) => {
      if (Array.isArray(data)) return data
      if (data?.data?.profissionais) return data.data.profissionais
      if (data?.data) return Array.isArray(data.data) ? data.data : []
      return []
    }
  })
}

export const useProfissionaisInativos = () => {
  return useQuery({
    queryKey: ['profissionais', 'inativos'],
    queryFn: profissionalService.listarInativos,
    select: (data) => {
      if (Array.isArray(data)) return data
      if (data?.data?.profissionais) return data.data.profissionais
      if (data?.data) return Array.isArray(data.data) ? data.data : []
      return []
    }
  })
}

export const useProfissional = (id) => {
  return useQuery({
    queryKey: ['profissional', id],
    queryFn: () => profissionalService.buscarPorId(id),
    enabled: !!id,
    select: (data) => data?.data || data
  })
}

export const useCriarProfissional = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: profissionalService.criar,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profissionais'] })
      await queryClient.refetchQueries({ queryKey: ['profissionais'] })
    }
  })
}

export const useAtualizarProfissional = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, dados }) => profissionalService.atualizar(id, dados),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['profissionais'] })
      await queryClient.invalidateQueries({ queryKey: ['profissional', variables.id] })
      await queryClient.refetchQueries({ queryKey: ['profissionais'] })
    }
  })
}

export const useInativarProfissional = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: profissionalService.inativar,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profissionais'] })
      await queryClient.refetchQueries({ queryKey: ['profissionais'] })
    }
  })
}

export const useReativarProfissional = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: profissionalService.reativar,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profissionais'] })
      await queryClient.refetchQueries({ queryKey: ['profissionais'] })
    }
  })
}

// ============================================
// HOOKS DE AGENDAMENTOS
// ============================================

export const useAgendamentos = () => {
  return useQuery({
    queryKey: ['agendamentos'],
    queryFn: agendamentoService.listar,
    select: (data) => {
      const agendamentos = data?.data?.agendamentos || data?.data || data || []
      return Array.isArray(agendamentos) ? agendamentos : []
    }
  })
}

export const useAgendamento = (id) => {
  return useQuery({
    queryKey: ['agendamento', id],
    queryFn: () => agendamentoService.buscarPorId(id),
    enabled: !!id,
    select: (data) => data?.data || data
  })
}

export const useCriarAgendamento = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: agendamentoService.criar,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['agendamentos'] })
      await queryClient.refetchQueries({ queryKey: ['agendamentos'] })
    }
  })
}

export const useAtualizarAgendamento = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, dados }) => agendamentoService.atualizar(id, dados),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['agendamentos'] })
      await queryClient.invalidateQueries({ queryKey: ['agendamento', variables.id] })
      await queryClient.refetchQueries({ queryKey: ['agendamentos'] })
    }
  })
}

export const useCancelarAgendamento = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, dados }) => agendamentoService.cancelar(id, dados),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['agendamentos'] })
      await queryClient.refetchQueries({ queryKey: ['agendamentos'] })
    }
  })
}

// ============================================
// HOOKS DE FINANCEIRO
// ============================================

export const useDespesas = (filtros = {}) => {
  return useQuery({
    queryKey: ['despesas', filtros],
    queryFn: () => financeiroService.listarDespesas(filtros),
    select: (data) => data?.data || data || []
  })
}

export const useMensalidades = (filtros = {}) => {
  return useQuery({
    queryKey: ['mensalidades', filtros],
    queryFn: () => financeiroService.listarMensalidades(filtros),
    select: (data) => data?.data || data || []
  })
}

export const useSalarios = (filtros = {}) => {
  return useQuery({
    queryKey: ['salarios', filtros],
    queryFn: () => financeiroService.listarSalarios(filtros),
    select: (data) => data?.data || data || []
  })
}

export const useRegistrarDespesa = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: financeiroService.registrarDespesa,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas'] })
    }
  })
}

export const useRegistrarMensalidade = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: financeiroService.registrarMensalidade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mensalidades'] })
    }
  })
}

export const useRegistrarSalario = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: financeiroService.registrarSalario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salarios'] })
    }
  })
}

// ============================================
// HOOK DE ESTATÍSTICAS (Dashboard)
// ============================================

export const useEstatisticas = () => {
  return useQuery({
    queryKey: ['estatisticas'],
    queryFn: async () => {
      const [residentes, profissionais, agendamentos] = await Promise.all([
        residenteService.listarAtivos(),
        profissionalService.listarAtivos(),
        agendamentoService.listar()
      ])

      // Extrair arrays corretamente
      const listaResidentes = Array.isArray(residentes) ? residentes :
                             Array.isArray(residentes?.data?.residentes) ? residentes.data.residentes :
                             Array.isArray(residentes?.data) ? residentes.data : []
                             
      const listaProfissionais = Array.isArray(profissionais) ? profissionais :
                                Array.isArray(profissionais?.data?.profissionais) ? profissionais.data.profissionais :
                                Array.isArray(profissionais?.data) ? profissionais.data : []
      
      const listaAgendamentos = Array.isArray(agendamentos) ? agendamentos : 
                                Array.isArray(agendamentos?.data?.agendamentos) ? agendamentos.data.agendamentos :
                                Array.isArray(agendamentos?.data) ? agendamentos.data : []

      const hoje = new Date().toISOString().split('T')[0]
      
      return {
        totalResidentes: listaResidentes.length,
        totalProfissionais: listaProfissionais.length,
        totalAgendamentos: listaAgendamentos.length,
        agendamentosHoje: listaAgendamentos.filter(ag => ag.data === hoje).length
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutos para estatísticas
  })
}
