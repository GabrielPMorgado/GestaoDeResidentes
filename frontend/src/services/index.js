/**
 * Services - Camada de serviços da aplicação
 * 
 * Centraliza todas as chamadas à API e lógica de negócio.
 * Facilita manutenção, testes e reutilização de código.
 * 
 * Uso:
 * import { residenteService, profissionalService } from '../services';
 * 
 * const residentes = await residenteService.listarAtivos();
 * const profissionais = await profissionalService.listarAtivos();
 */

import residenteService from './residenteService';
import profissionalService from './profissionalService';
import agendamentoService from './agendamentoService';
import relatorioService from './relatorioService';

// Exportações nomeadas
export { 
  residenteService,
  profissionalService,
  agendamentoService,
  relatorioService
};

// Exportação default com todos os services
export default {
  residenteService,
  profissionalService,
  agendamentoService,
  relatorioService
};
