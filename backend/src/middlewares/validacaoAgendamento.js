// Validação para criar agendamento
exports.validarCriarAgendamento = (req, res, next) => {
  const { 
    residente_id,
    profissional_id,
    data_agendamento,
    hora_inicio,
    hora_fim,
    tipo_atendimento,
    titulo
  } = req.body;
  
  // Campos obrigatórios
  if (!residente_id || !profissional_id || !data_agendamento || !hora_inicio || !hora_fim || !tipo_atendimento || !titulo) {
    return res.status(400).json({
      success: false,
      message: 'Campos obrigatórios não preenchidos',
      campos_obrigatorios: [
        'residente_id',
        'profissional_id',
        'data_agendamento',
        'hora_inicio',
        'hora_fim',
        'tipo_atendimento',
        'titulo'
      ]
    });
  }
  
  // Validar data não pode ser no passado
  const dataAgendamento = new Date(data_agendamento);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  if (dataAgendamento < hoje) {
    return res.status(400).json({
      success: false,
      message: 'Data de agendamento não pode ser no passado'
    });
  }
  
  // Validar hora_fim maior que hora_inicio
  if (hora_fim <= hora_inicio) {
    return res.status(400).json({
      success: false,
      message: 'Hora de término deve ser maior que hora de início'
    });
  }
  
  next();
};

// Validação para atualizar agendamento
exports.validarAtualizarAgendamento = (req, res, next) => {
  const { data_agendamento, hora_inicio, hora_fim, status } = req.body;
  
  // Validar data se fornecida
  if (data_agendamento) {
    const dataAgendamento = new Date(data_agendamento);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (dataAgendamento < hoje) {
      return res.status(400).json({
        success: false,
        message: 'Data de agendamento não pode ser no passado'
      });
    }
  }
  
  // Validar horas se fornecidas
  if (hora_inicio && hora_fim && hora_fim <= hora_inicio) {
    return res.status(400).json({
      success: false,
      message: 'Hora de término deve ser maior que hora de início'
    });
  }
  
  // Validar status se fornecido
  if (status && !['agendado', 'confirmado', 'em_atendimento', 'concluido', 'cancelado', 'falta'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status inválido'
    });
  }
  
  next();
};
