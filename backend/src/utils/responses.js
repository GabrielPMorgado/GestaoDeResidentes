/**
 * Funções auxiliares para padronizar respostas da API
 */

class ApiResponse {
  static success(res, data = null, message = 'Operação realizada com sucesso', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  static created(res, data = null, message = 'Registro criado com sucesso') {
    return this.success(res, data, message, 201);
  }

  static error(res, message = 'Erro interno do servidor', statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors && { errors }),
      timestamp: new Date().toISOString()
    });
  }

  static badRequest(res, message = 'Requisição inválida', errors = null) {
    return this.error(res, message, 400, errors);
  }

  static unauthorized(res, message = 'Não autorizado') {
    return this.error(res, message, 401);
  }

  static forbidden(res, message = 'Acesso negado') {
    return this.error(res, message, 403);
  }

  static notFound(res, message = 'Registro não encontrado') {
    return this.error(res, message, 404);
  }

  static conflict(res, message = 'Conflito: registro já existe') {
    return this.error(res, message, 409);
  }

  static paginated(res, data, page, limit, total, message = 'Dados recuperados com sucesso') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = ApiResponse;
