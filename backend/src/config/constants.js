/**
 * Constantes da aplicação
 */

module.exports = {
  // Status
  STATUS: {
    ATIVO: 'ativo',
    INATIVO: 'inativo',
    SUSPENSO: 'suspenso'
  },

  // Status de Agendamento
  STATUS_AGENDAMENTO: {
    AGENDADO: 'agendado',
    CONFIRMADO: 'confirmado',
    EM_ATENDIMENTO: 'em_atendimento',
    CONCLUIDO: 'concluido',
    CANCELADO: 'cancelado',
    FALTA: 'falta'
  },

  // Tipos de Atendimento
  TIPOS_ATENDIMENTO: {
    CONSULTA_MEDICA: 'consulta_medica',
    FISIOTERAPIA: 'fisioterapia',
    PSICOLOGIA: 'psicologia',
    NUTRICAO: 'nutricao',
    ENFERMAGEM: 'enfermagem',
    TERAPIA_OCUPACIONAL: 'terapia_ocupacional',
    ASSISTENCIA_SOCIAL: 'assistencia_social',
    OUTRO: 'outro'
  },

  // Status de Pagamento
  STATUS_PAGAMENTO: {
    PENDENTE: 'pendente',
    PAGO: 'pago',
    ATRASADO: 'atrasado',
    CANCELADO: 'cancelado'
  },

  // Categorias de Despesa
  CATEGORIAS_DESPESA: {
    ALIMENTACAO: 'Alimentacao',
    MANUTENCAO: 'Manutencao',
    LIMPEZA: 'Limpeza',
    SAUDE: 'Saude',
    OPERACIONAL: 'Operacional',
    OUTROS: 'Outros'
  },

  // Métodos de Pagamento
  METODOS_PAGAMENTO: {
    DINHEIRO: 'Dinheiro',
    CARTAO_CREDITO: 'Cartão de Crédito',
    CARTAO_DEBITO: 'Cartão de Débito',
    PIX: 'Pix',
    TRANSFERENCIA: 'Transferência Bancária',
    BOLETO: 'Boleto'
  },

  // Paginação
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  },

  // Mensagens
  MESSAGES: {
    SUCCESS: {
      CREATED: 'Registro criado com sucesso',
      UPDATED: 'Registro atualizado com sucesso',
      DELETED: 'Registro excluído com sucesso'
    },
    ERROR: {
      NOT_FOUND: 'Registro não encontrado',
      DUPLICATE: 'Registro já existe',
      VALIDATION: 'Erro de validação',
      SERVER: 'Erro interno do servidor'
    }
  }
};
