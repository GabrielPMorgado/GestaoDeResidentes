const sequelize = require('../config/db')
const { QueryTypes } = require('sequelize')

// Salvar rascunho de atendimento
exports.salvarRascunho = async (req, res) => {
  try {
    const {
      agendamento_id,
      residente_id,
      profissional_id,
      data_atendimento,
      hora_atendimento,
      procedimentos,
      diagnostico_principal,
      diagnosticos_secundarios,
      cid_principal,
      cids_secundarios,
      observacoes_clinicas,
      evolucao,
      condutas,
      plano_cuidado,
      relatorio,
      status = 'rascunho'
    } = req.body

    // Verificar se já existe rascunho para este agendamento
    const rascunhoExistente = await sequelize.query(
      'SELECT id FROM rascunhos_atendimento WHERE agendamento_id = ?',
      { replacements: [agendamento_id], type: QueryTypes.SELECT }
    )

    let resultado

    if (rascunhoExistente.length > 0) {
      // Atualizar rascunho existente
      await sequelize.query(
        `UPDATE rascunhos_atendimento 
         SET procedimentos = ?, diagnostico_principal = ?, diagnosticos_secundarios = ?,
             cid_principal = ?, cids_secundarios = ?, observacoes_clinicas = ?,
             evolucao = ?, condutas = ?, plano_cuidado = ?, relatorio = ?,
             updated_at = NOW()
         WHERE agendamento_id = ?`,
        {
          replacements: [
            JSON.stringify(procedimentos),
            diagnostico_principal,
            diagnosticos_secundarios,
            cid_principal,
            cids_secundarios,
            observacoes_clinicas,
            evolucao,
            condutas,
            plano_cuidado,
            relatorio,
            agendamento_id
          ],
          type: QueryTypes.UPDATE
        }
      )

      resultado = { id: rascunhoExistente[0].id }
    } else {
      // Criar novo rascunho
      const [insertId] = await sequelize.query(
        `INSERT INTO rascunhos_atendimento 
         (agendamento_id, residente_id, profissional_id, data_atendimento, hora_atendimento,
          procedimentos, diagnostico_principal, diagnosticos_secundarios, cid_principal,
          cids_secundarios, observacoes_clinicas, evolucao, condutas, plano_cuidado,
          relatorio, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            agendamento_id,
            residente_id,
            profissional_id,
            data_atendimento,
            hora_atendimento,
            JSON.stringify(procedimentos),
            diagnostico_principal,
            diagnosticos_secundarios,
            cid_principal,
            cids_secundarios,
            observacoes_clinicas,
            evolucao,
            condutas,
            plano_cuidado,
            relatorio,
            status
          ],
          type: QueryTypes.INSERT
        }
      )

      resultado = { id: insertId }
    }

    res.json({
      success: true,
      message: 'Rascunho salvo com sucesso',
      data: resultado
    })
  } catch (error) {
    console.error('Erro ao salvar rascunho:', error)
    res.status(500).json({ success: false, message: 'Erro ao salvar rascunho' })
  }
}

// Listar rascunhos do profissional
exports.listarRascunhos = async (req, res) => {
  try {
    const { profissional_id } = req.query

    if (!profissional_id) {
      return res.status(400).json({ success: false, message: 'ID do profissional é obrigatório' })
    }

    const rascunhos = await sequelize.query(
      `SELECT r.*, 
              res.nome_completo as nome_residente,
              a.tipo_atendimento,
              a.data_agendamento,
              a.hora_inicio
       FROM rascunhos_atendimento r
       LEFT JOIN residentes res ON r.residente_id = res.id
       LEFT JOIN agendamentos a ON r.agendamento_id = a.id
       WHERE r.profissional_id = ? AND r.status = 'rascunho'
       ORDER BY r.updated_at DESC`,
      { replacements: [profissional_id], type: QueryTypes.SELECT }
    )

    // Parse JSON do campo procedimentos
    const rascunhosFormatados = rascunhos.map(r => ({
      ...r,
      procedimentos: r.procedimentos ? JSON.parse(r.procedimentos) : []
    }))

    res.json({
      success: true,
      message: 'Rascunhos listados com sucesso',
      data: rascunhosFormatados
    })
  } catch (error) {
    console.error('Erro ao listar rascunhos:', error)
    res.status(500).json({ success: false, message: 'Erro ao listar rascunhos' })
  }
}

// Buscar rascunho específico
exports.buscarRascunho = async (req, res) => {
  try {
    const { id } = req.params

    const rascunhos = await sequelize.query(
      `SELECT r.*, 
              res.nome_completo as nome_residente,
              res.data_nascimento,
              a.tipo_atendimento
       FROM rascunhos_atendimento r
       LEFT JOIN residentes res ON r.residente_id = res.id
       LEFT JOIN agendamentos a ON r.agendamento_id = a.id
       WHERE r.id = ?`,
      { replacements: [id], type: QueryTypes.SELECT }
    )

    if (rascunhos.length === 0) {
      return res.status(404).json({ success: false, message: 'Rascunho não encontrado' })
    }

    const rascunho = {
      ...rascunhos[0],
      procedimentos: rascunhos[0].procedimentos ? JSON.parse(rascunhos[0].procedimentos) : []
    }

    res.json({
      success: true,
      message: 'Rascunho encontrado',
      data: rascunho
    })
  } catch (error) {
    console.error('Erro ao buscar rascunho:', error)
    res.status(500).json({ success: false, message: 'Erro ao buscar rascunho' })
  }
}

// Deletar rascunho
exports.deletarRascunho = async (req, res) => {
  try {
    const { id } = req.params

    await sequelize.query('DELETE FROM rascunhos_atendimento WHERE id = ?', {
      replacements: [id],
      type: QueryTypes.DELETE
    })

    res.json({ success: true, message: 'Rascunho deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar rascunho:', error)
    res.status(500).json({ success: false, message: 'Erro ao deletar rascunho' })
  }
}
