import { useState, useEffect, useRef, useMemo } from 'react'
import { listarResidentes, listarProfissionais } from '../../api/axios'
import { useNotification } from '../../contexts/NotificationContext'
import { LoadingSpinner } from '../Common'
import { useCriarAgendamento } from '../../hooks'

function CadastroAgendamento() {
  const { success, error: showError } = useNotification()
  const criarAgendamentoMutation = useCriarAgendamento()
  const dateInputRef = useRef(null)
  const horaInicioRef = useRef(null)
  const horaFimRef = useRef(null)

  const hoje = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const formatDate = (date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const diasRapidos = useMemo(() => {
    const dias = []
    const nomesDia = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    for (let i = 0; i < 14; i++) {
      const d = new Date(hoje)
      d.setDate(hoje.getDate() + i)
      let label = nomesDia[d.getDay()] + ' ' + String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0')
      if (i === 0) label = 'Hoje'
      if (i === 1) label = 'Amanhã'
      dias.push({ date: formatDate(d), label, dayName: nomesDia[d.getDay()], isWeekend: d.getDay() === 0 || d.getDay() === 6 })
    }
    return dias
  }, [hoje])

  const horariosDisponiveis = useMemo(() => {
    const slots = []
    for (let h = 7; h <= 18; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`)
      if (h < 18) slots.push(`${String(h).padStart(2, '0')}:30`)
    }
    return slots
  }, [])

  const calcularHoraFim = (horaInicio, duracao = 60) => {
    const [h, m] = horaInicio.split(':').map(Number)
    const totalMin = h * 60 + m + duracao
    const fh = Math.floor(totalMin / 60)
    const fm = totalMin % 60
    if (fh > 23) return '23:59'
    return `${String(fh).padStart(2, '0')}:${String(fm).padStart(2, '0')}`
  }

  const [duracaoMinutos, setDuracaoMinutos] = useState(60)
  
  const [formData, setFormData] = useState({
    residente_id: '',
    profissional_id: '',
    data_agendamento: formatDate(hoje),
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

  const selecionarData = (dateStr) => {
    setFormData(prev => ({ ...prev, data_agendamento: dateStr }))
    if (dateInputRef.current) dateInputRef.current.value = dateStr
    setErrors(prev => ({ ...prev, data_agendamento: '' }))
    setTouched(prev => ({ ...prev, data_agendamento: true }))
  }

  const selecionarHoraInicio = (hora) => {
    const fim = calcularHoraFim(hora, duracaoMinutos)
    setFormData(prev => ({ ...prev, hora_inicio: hora, hora_fim: fim }))
    if (horaInicioRef.current) horaInicioRef.current.value = hora
    if (horaFimRef.current) horaFimRef.current.value = fim
    setErrors(prev => ({ ...prev, hora_inicio: '', hora_fim: '' }))
    setTouched(prev => ({ ...prev, hora_inicio: true, hora_fim: true }))
  }

  const alterarDuracao = (min) => {
    setDuracaoMinutos(min)
    if (formData.hora_inicio) {
      const fim = calcularHoraFim(formData.hora_inicio, min)
      setFormData(prev => ({ ...prev, hora_fim: fim }))
      if (horaFimRef.current) horaFimRef.current.value = fim
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    setFormData(prev => ({ ...prev, [name]: value }))
    
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
    
    const dataToSubmit = { ...formData }
    
    const fields = ['residente_id', 'profissional_id', 'data_agendamento', 'hora_inicio', 'hora_fim', 'tipo_atendimento', 'titulo']
    const newErrors = {}
    
    fields.forEach(field => {
      const error = validateField(field, dataToSubmit[field])
      if (error) {
        newErrors[field] = error
      }
    })
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      fields.forEach(field => setTouched(prev => ({ ...prev, [field]: true })))
      showError('Por favor, corrija os erros no formulário')
      return
    }
    
    setLoading(true)

    try {
      const response = await criarAgendamentoMutation.mutateAsync(dataToSubmit)
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
      residente_id: '', profissional_id: '', data_agendamento: formatDate(hoje), hora_inicio: '',
      hora_fim: '', tipo_atendimento: '', titulo: '', descricao: '', local: '', observacoes: ''
    })
    if (dateInputRef.current) dateInputRef.current.value = formatDate(hoje)
    if (horaInicioRef.current) horaInicioRef.current.value = ''
    if (horaFimRef.current) horaFimRef.current.value = ''
    setDuracaoMinutos(60)
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

            {/* Data e Horários - Melhorado */}
            <div className="p-6 bg-slate-900/30 rounded-xl border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <i className="bi bi-clock text-amber-400"></i>
                Data e Horário
              </h3>

              {/* Seleção rápida de data */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Selecione a Data <span className="text-amber-400">*</span>
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {diasRapidos.map((dia) => (
                    <button
                      key={dia.date}
                      type="button"
                      onClick={() => selecionarData(dia.date)}
                      className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                        formData.data_agendamento === dia.date
                          ? 'bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-500/30'
                          : dia.isWeekend
                            ? 'bg-slate-800/60 text-slate-500 border-slate-700/50 hover:border-slate-600'
                            : 'bg-slate-800/60 text-slate-300 border-slate-700/50 hover:border-amber-500/50 hover:text-amber-300'
                      }`}
                    >
                      {dia.label}
                    </button>
                  ))}
                </div>
                {/* Input de data oculto para acessibilidade + fallback */}
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-xs text-slate-500">Ou escolha manualmente:</span>
                  <input
                    type="date"
                    id="data_agendamento"
                    name="data_agendamento"
                    ref={dateInputRef}
                    value={formData.data_agendamento}
                    min={formatDate(hoje)}
                    onChange={(e) => selecionarData(e.target.value)}
                    className="px-3 py-1.5 bg-slate-900/60 border border-slate-700/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all [color-scheme:dark]"
                  />
                  {formData.data_agendamento && (
                    <span className="text-sm text-amber-400 font-medium">
                      <i className="bi bi-calendar-check mr-1"></i>
                      {new Date(formData.data_agendamento + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                  )}
                </div>
                {errors.data_agendamento && touched.data_agendamento && (
                  <p className="mt-1.5 text-sm text-red-400">{errors.data_agendamento}</p>
                )}
              </div>

              {/* Duração do atendimento */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Duração do Atendimento
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { min: 15, label: '15 min' },
                    { min: 30, label: '30 min' },
                    { min: 45, label: '45 min' },
                    { min: 60, label: '1 hora' },
                    { min: 90, label: '1h30' },
                    { min: 120, label: '2 horas' },
                  ].map(({ min, label }) => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => alterarDuracao(min)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                        duracaoMinutos === min
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                          : 'bg-slate-800/60 text-slate-400 border-slate-700/50 hover:border-blue-500/30 hover:text-blue-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grade de horários */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Horário de Início <span className="text-amber-400">*</span>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {horariosDisponiveis.map((hora) => (
                    <button
                      key={hora}
                      type="button"
                      onClick={() => selecionarHoraInicio(hora)}
                      className={`px-2 py-2.5 rounded-lg text-sm font-medium transition-all border text-center ${
                        formData.hora_inicio === hora
                          ? 'bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-500/30'
                          : 'bg-slate-800/60 text-slate-300 border-slate-700/50 hover:border-amber-500/50 hover:text-amber-300'
                      }`}
                    >
                      {hora}
                    </button>
                  ))}
                </div>
                {errors.hora_inicio && touched.hora_inicio && (
                  <p className="mt-1.5 text-sm text-red-400">{errors.hora_inicio}</p>
                )}
              </div>

              {/* Horários manuais (início e fim) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-700/50">
                <div>
                  <label htmlFor="hora_inicio" className="block text-sm font-medium text-slate-300 mb-2">
                    Hora Início <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="time"
                    id="hora_inicio"
                    name="hora_inicio"
                    ref={horaInicioRef}
                    value={formData.hora_inicio}
                    onChange={(e) => {
                      const val = e.target.value
                      const fim = calcularHoraFim(val, duracaoMinutos)
                      setFormData(prev => ({ ...prev, hora_inicio: val, hora_fim: fim }))
                      if (horaFimRef.current) horaFimRef.current.value = fim
                      setErrors(prev => ({ ...prev, hora_inicio: '', hora_fim: '' }))
                    }}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 bg-slate-900/60 border ${
                      errors.hora_inicio && touched.hora_inicio
                        ? 'border-red-500/50 focus:ring-red-500/50' 
                        : 'border-slate-700/50 focus:ring-amber-500/50 focus:border-amber-500/50'
                    } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all [color-scheme:dark]`}
                  />
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
                    value={formData.hora_fim}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, hora_fim: e.target.value }))
                    }}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 bg-slate-900/60 border ${
                      errors.hora_fim && touched.hora_fim
                        ? 'border-red-500/50 focus:ring-red-500/50' 
                        : 'border-slate-700/50 focus:ring-amber-500/50 focus:border-amber-500/50'
                    } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all [color-scheme:dark]`}
                  />
                  {errors.hora_fim && touched.hora_fim && (
                    <p className="mt-1.5 text-sm text-red-400">{errors.hora_fim}</p>
                  )}
                </div>
              </div>

              {/* Resumo visual */}
              {formData.data_agendamento && formData.hora_inicio && formData.hora_fim && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
                  <i className="bi bi-check-circle-fill text-amber-400 text-xl"></i>
                  <div className="text-sm">
                    <span className="text-amber-300 font-medium">Agendamento: </span>
                    <span className="text-white">
                      {new Date(formData.data_agendamento + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                      {' · '}
                      {formData.hora_inicio} às {formData.hora_fim}
                      {' · '}
                      {duracaoMinutos >= 60 
                        ? `${Math.floor(duracaoMinutos / 60)}h${duracaoMinutos % 60 > 0 ? duracaoMinutos % 60 + 'min' : ''}`
                        : `${duracaoMinutos} min`
                      }
                    </span>
                  </div>
                </div>
              )}
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
