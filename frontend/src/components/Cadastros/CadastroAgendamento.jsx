import { useState, useEffect, useRef } from 'react'
import { criarAgendamento, listarResidentes, listarProfissionais } from '../../api/axios'
import { useNotification } from '../../contexts/NotificationContext'
import { LoadingSpinner } from '../Common'
import { useCriarAgendamento } from '../../hooks'

function CadastroAgendamento() {
  const { success, error: showError } = useNotification()
  const criarAgendamentoMutation = useCriarAgendamento()
  const dateInputRef = useRef(null)
  const horaInicioRef = useRef(null)
  const horaFimRef = useRef(null)
  
  const [formData, setFormData] = useState({
    residente_id: '',
    profissional_id: '',
    data_agendamento: '',
    hora_inicio: '',
    hora_fim: '',
    tipo_atendimento: '',
    titulo: '',
    descricao: '',
    local: '',
    observacoes: ''
  })

  const [residentes, setResidentes] = useState([])
  const [profissionais, setProfissionais] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoadingData(true)
      const [residentesRes, profissionaisRes] = await Promise.all([
        listarResidentes({ status: 'ativo', limit: 1000 }),
        listarProfissionais({ status: 'ativo', limit: 1000 })
      ])
      
      setResidentes(residentesRes.data?.residentes || [])
      setProfissionais(profissionaisRes.data?.profissionais || [])
    } catch {
      showError('Erro ao carregar dados')
    } finally {
      setLoadingData(false)
    }
  }

  const validateField = (name, value) => {
    switch (name) {
      case 'residente_id':
        return !value ? 'Selecione um residente' : ''
      case 'profissional_id':
        return !value ? 'Selecione um profissional' : ''
      case 'data_agendamento':
        if (!value) return 'Informe a data'
        // Validar apenas se for uma data completa e válida (YYYY-MM-DD tem 10 caracteres)
        if (value.length === 10) {
          try {
            // Separar ano, mês e dia do formato YYYY-MM-DD
            const [ano, mes, dia] = value.split('-').map(Number)
            // Verificar se os valores são válidos
            if (!ano || !mes || !dia || ano < 1900 || mes < 1 || mes > 12 || dia < 1 || dia > 31) {
              return 'Data inválida'
            }
            const dataAgendamento = new Date(ano, mes - 1, dia) // mês é 0-indexed
            const hoje = new Date()
            hoje.setHours(0, 0, 0, 0)
            if (isNaN(dataAgendamento.getTime())) return 'Data inválida'
            return dataAgendamento < hoje ? 'Data não pode ser no passado' : ''
          } catch (error) {
            return 'Data inválida'
          }
        }
        // Se ainda está digitando (menos de 10 caracteres), não validar
        return ''
      case 'hora_inicio':
        return !value ? 'Informe a hora de início' : ''
      case 'hora_fim':
        if (!value) return 'Informe a hora de término'
        if (formData.hora_inicio && value <= formData.hora_inicio) {
          return 'Deve ser posterior ao início'
        }
        return ''
      case 'tipo_atendimento':
        return !value ? 'Selecione o tipo' : ''
      case 'titulo':
        return value.trim().length < 3 ? 'Mínimo 3 caracteres' : ''
      default:
        return ''
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Atualizar formData normalmente para todos os campos
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpar erro ao começar a digitar
    if (touched[name] && errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    const error = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Capturar valores dos refs para campos de data/hora
    const dataToSubmit = {
      ...formData,
      data_agendamento: dateInputRef.current?.value || formData.data_agendamento,
      hora_inicio: horaInicioRef.current?.value || formData.hora_inicio,
      hora_fim: horaFimRef.current?.value || formData.hora_fim
    }
    
    console.log('📋 Dados para enviar:', dataToSubmit)
    
    const fields = ['residente_id', 'profissional_id', 'data_agendamento', 'hora_inicio', 'hora_fim', 'tipo_atendimento', 'titulo']
    const newErrors = {}
    
    fields.forEach(field => {
      const error = validateField(field, dataToSubmit[field])
      if (error) {
        console.log(`❌ Erro no campo ${field}:`, error)
        newErrors[field] = error
      }
    })
    
    if (Object.keys(newErrors).length > 0) {
      console.log('❌ Erros encontrados:', newErrors)
      setErrors(newErrors)
      fields.forEach(field => setTouched(prev => ({ ...prev, [field]: true })))
      showError('Por favor, corrija os erros no formulário')
      return
    }
    
    setLoading(true)

    try {
      console.log('🚀 Enviando agendamento...')
      const response = await criarAgendamentoMutation.mutateAsync(dataToSubmit)
      console.log('✅ Resposta:', response)
      success('Agendamento criado com sucesso! A lista será atualizada automaticamente.')
      handleReset()
    } catch (err) {
      console.error('❌ Erro ao criar:', err)
      showError(err.response?.data?.message || 'Erro ao criar agendamento')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      residente_id: '', profissional_id: '', data_agendamento: '', hora_inicio: '',
      hora_fim: '', tipo_atendimento: '', titulo: '', descricao: '', local: '', observacoes: ''
    })
    if (dateInputRef.current) dateInputRef.current.value = ''
    if (horaInicioRef.current) horaInicioRef.current.value = ''
    if (horaFimRef.current) horaFimRef.current.value = ''
    setErrors({})
    setTouched({})
  }

  const InputField = ({ label, name, type = 'text', required = false, icon, inputRef, ...props }) => {
    // Para inputs de data/hora usar como não-controlados (via ref)
    const isDateOrTime = type === 'date' || type === 'time'
    
    return (
      <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-2">
          {label} {required && <span className="text-amber-400">*</span>}
        </label>
        <input
          type={type}
          id={name}
          name={name}
          ref={inputRef}
          {...(isDateOrTime 
            ? { 
                defaultValue: formData[name],
                onChange: (e) => {
                  // Atualizar blur para validação
                  if (inputRef) {
                    handleBlur(e)
                  }
                }
              }
            : { 
                value: formData[name] ?? '',
                onChange: handleChange
              }
          )}
          onBlur={handleBlur}
          className={`w-full px-4 py-3 bg-slate-900/60 border ${
            errors[name] && touched[name] 
              ? 'border-red-500/50 focus:ring-red-500/50' 
              : 'border-slate-700/50 focus:ring-amber-500/50 focus:border-amber-500/50'
          } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all
          ${type === 'date' ? '[color-scheme:dark]' : ''}`}
          {...props}
        />
        {errors[name] && touched[name] && (
          <p className="mt-1.5 text-sm text-red-400">
            {errors[name]}
          </p>
        )}
      </div>
    )
  }

  const SelectField = ({ label, name, options, required = false, icon, placeholder = 'Selecione...' }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-2">
        {label} {required && <span className="text-amber-400">*</span>}
      </label>
      <div className="relative">
        <select
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full px-4 pr-10 py-3 bg-slate-900/60 border ${
            errors[name] && touched[name]
              ? 'border-red-500/50 focus:ring-red-500/50'
              : 'border-slate-700/50 focus:ring-amber-500/50 focus:border-amber-500/50'
          } rounded-xl text-white focus:outline-none focus:ring-2 transition-all appearance-none`}
        >
          <option value="">{placeholder}</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <i className="bi bi-chevron-down text-slate-400 text-sm"></i>
        </div>
      </div>
      {errors[name] && touched[name] && (
        <p className="mt-1.5 text-sm text-red-400">
          {errors[name]}
        </p>
      )}
    </div>
  )

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando dados..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <i className="bi bi-calendar-plus text-2xl text-amber-400"></i>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Novo Agendamento</h1>
              <p className="text-sm text-slate-400">Agende consultas e atendimentos para residentes</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleção de Pessoas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Residente"
                name="residente_id"
                required
                placeholder="Selecione o residente"
                options={residentes.map(r => ({
                  value: r.id,
                  label: r.nome_completo
                }))}
              />

              <SelectField
                label="Profissional"
                name="profissional_id"
                required
                placeholder="Selecione o profissional"
                options={profissionais.map(p => ({
                  value: p.id,
                  label: `${p.nome_completo} - ${p.profissao}`
                }))}
              />
            </div>

            {/* Data e Horários */}
            <div className="p-6 bg-slate-900/30 rounded-xl border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <i className="bi bi-clock text-amber-400"></i>
                Data e Horário
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="data_agendamento" className="block text-sm font-medium text-slate-300 mb-2">
                    Data <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="data_agendamento"
                      name="data_agendamento"
                      ref={dateInputRef}
                      defaultValue={new Date().toISOString().split('T')[0]}
                      min={new Date().toISOString().split('T')[0]}
                      max="2025-12-31"
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 bg-slate-900/60 border ${
                        errors.data_agendamento && touched.data_agendamento
                          ? 'border-red-500/50 focus:ring-red-500/50' 
                          : 'border-slate-700/50 focus:ring-amber-500/50 focus:border-amber-500/50'
                      } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all [color-scheme:dark]`}
                    />
                  </div>
                  {errors.data_agendamento && touched.data_agendamento && (
                    <p className="mt-1.5 text-sm text-red-400">
                      {errors.data_agendamento}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="hora_inicio" className="block text-sm font-medium text-slate-300 mb-2">
                    Hora Início <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="time"
                    id="hora_inicio"
                    name="hora_inicio"
                    ref={horaInicioRef}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 bg-slate-900/60 border ${
                      errors.hora_inicio && touched.hora_inicio
                        ? 'border-red-500/50 focus:ring-red-500/50' 
                        : 'border-slate-700/50 focus:ring-amber-500/50 focus:border-amber-500/50'
                    } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all`}
                  />
                  {errors.hora_inicio && touched.hora_inicio && (
                    <p className="mt-1.5 text-sm text-red-400">
                      {errors.hora_inicio}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="hora_fim" className="block text-sm font-medium text-slate-300 mb-2">
                    Hora Término <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="time"
                    id="hora_fim"
                    name="hora_fim"
                    ref={horaFimRef}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 bg-slate-900/60 border ${
                      errors.hora_fim && touched.hora_fim
                        ? 'border-red-500/50 focus:ring-red-500/50' 
                        : 'border-slate-700/50 focus:ring-amber-500/50 focus:border-amber-500/50'
                    } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all`}
                  />
                  {errors.hora_fim && touched.hora_fim && (
                    <p className="mt-1.5 text-sm text-red-400">
                      {errors.hora_fim}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Detalhes do Atendimento */}
            <div className="p-6 bg-slate-900/30 rounded-xl border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <i className="bi bi-file-earmark-text text-blue-400"></i>
                Detalhes do Atendimento
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SelectField
                    label="Tipo de Atendimento"
                    name="tipo_atendimento"
                    required
                    options={[
                      { value: 'Consulta Médica', label: 'Consulta Médica' },
                      { value: 'Enfermagem', label: 'Enfermagem' },
                      { value: 'Fisioterapia', label: 'Fisioterapia' },
                      { value: 'Psicologia', label: 'Psicologia' },
                      { value: 'Nutrição', label: 'Nutrição' },
                      { value: 'Exame', label: 'Exame' },
                      { value: 'Procedimento', label: 'Procedimento' },
                      { value: 'Outro', label: 'Outro' }
                    ]}
                  />

                  <InputField
                    label="Local"
                    name="local"
                    placeholder="Sala, consultório, etc"
                  />
                </div>

                <InputField
                  label="Título"
                  name="titulo"
                  required
                  placeholder="Título do agendamento"
                />

                <div>
                  <label htmlFor="descricao" className="block text-sm font-medium text-slate-300 mb-2">
                    Descrição
                  </label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all resize-none"
                    placeholder="Descreva o motivo do agendamento..."
                  ></textarea>
                </div>

                <div>
                  <label htmlFor="observacoes" className="block text-sm font-medium text-slate-300 mb-2">
                    Observações
                  </label>
                  <textarea
                    id="observacoes"
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all resize-none"
                    placeholder="Informações adicionais..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-6 border-t border-slate-700/50">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <i className="bi bi-arrow-clockwise"></i>
                <span>Limpar</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Agendando...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle"></i>
                    <span>Criar Agendamento</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CadastroAgendamento
