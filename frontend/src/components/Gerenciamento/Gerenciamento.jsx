import { useState, useEffect } from 'react'
import './Gerenciamento.css'
import { listarResidentes, deletarResidentePermanente } from '../../api/api'
import { listarProfissionais, deletarProfissionalPermanente } from '../../api/api'

function Gerenciamento() {
  const [residentes, setResidentes] = useState([])
  const [profissionais, setProfissionais] = useState([])
  const [loading, setLoading] = useState(false)
  const [tipoExclusao, setTipoExclusao] = useState('residentes') // 'residentes' ou 'profissionais'
  const [busca, setBusca] = useState('')
  const [selectedIds, setSelectedIds] = useState([])

  const carregarDados = async () => {
    setLoading(true)
    try {
      if (tipoExclusao === 'residentes') {
        const response = await listarResidentes()
        // Garantir que sempre é um array
        const dados = response?.data || response || []
        setResidentes(Array.isArray(dados) ? dados : [])
      } else {
        const response = await listarProfissionais()
        // Garantir que sempre é um array
        const dados = response?.data || response || []
        setProfissionais(Array.isArray(dados) ? dados : [])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      alert('❌ Erro ao carregar dados')
      // Definir como array vazio em caso de erro
      if (tipoExclusao === 'residentes') {
        setResidentes([])
      } else {
        setProfissionais([])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [tipoExclusao]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const dados = tipoExclusao === 'residentes' ? residentes : profissionais
      const ids = dadosFiltrados(dados).map(item => item.id)
      setSelectedIds(ids)
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const dadosFiltrados = (dados) => {
    // Garantir que dados é um array
    if (!Array.isArray(dados)) return []
    if (!busca.trim()) return dados
    
    return dados.filter(item => {
      const searchTerm = busca.toLowerCase()
      if (tipoExclusao === 'residentes') {
        return (
          item.nome_completo?.toLowerCase().includes(searchTerm) ||
          item.cpf?.toLowerCase().includes(searchTerm) ||
          item.rg?.toLowerCase().includes(searchTerm)
        )
      } else {
        return (
          item.nome_completo?.toLowerCase().includes(searchTerm) ||
          item.especialidade?.toLowerCase().includes(searchTerm) ||
          item.registro_profissional?.toLowerCase().includes(searchTerm)
        )
      }
    })
  }

  const handleDeletarSelecionados = async () => {
    if (selectedIds.length === 0) {
      alert('⚠️ Selecione pelo menos um registro para excluir')
      return
    }

    const confirmacao = window.confirm(
      `⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!\n\n` +
      `Você está prestes a DELETAR PERMANENTEMENTE ${selectedIds.length} registro(s) do banco de dados.\n\n` +
      `Os dados excluídos NÃO PODERÃO SER RECUPERADOS.\n\n` +
      `Deseja realmente continuar?`
    )

    if (!confirmacao) return

    const confirmacaoFinal = window.prompt(
      `Para confirmar a exclusão permanente de ${selectedIds.length} registro(s), digite: DELETAR`
    )

    if (confirmacaoFinal !== 'DELETAR') {
      alert('❌ Exclusão cancelada. Texto de confirmação incorreto.')
      return
    }

    setLoading(true)
    let sucessos = 0
    let erros = 0
    const errosDetalhados = []

    try {
      for (const id of selectedIds) {
        try {
          console.log(`Tentando deletar ${tipoExclusao} ID:`, id)
          if (tipoExclusao === 'residentes') {
            await deletarResidentePermanente(id)
          } else {
            await deletarProfissionalPermanente(id)
          }
          console.log(`✅ Deletado com sucesso ID:`, id)
          sucessos++
        } catch (error) {
          console.error(`❌ Erro ao deletar ID ${id}:`, error)
          errosDetalhados.push(`ID ${id}: ${error.message || error}`)
          erros++
        }
      }

      if (sucessos > 0) {
        alert(`✅ ${sucessos} registro(s) deletado(s) com sucesso!${erros > 0 ? `\n⚠️ ${erros} erro(s) ocorreram.` : ''}`)
        setSelectedIds([])
        await carregarDados()
      } else {
        alert(`❌ Nenhum registro foi deletado. Erros:\n${errosDetalhados.join('\n')}`)
      }
    } catch (error) {
      console.error('Erro geral:', error)
      alert(`❌ Erro ao processar exclusões: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const dados = tipoExclusao === 'residentes' ? residentes : profissionais
  // Garantir que dadosExibicao sempre é um array
  const dadosExibicao = Array.isArray(dados) ? dadosFiltrados(dados) : []

  return (
    <div className="gerenciamento-container">
      <div className="container-fluid p-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col">
            <h2 className="mb-2">
              <i className="bi bi-exclamation-triangle-fill text-danger me-3"></i>
              Gerenciamento - Exclusão Permanente
            </h2>
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <i className="bi bi-shield-exclamation fs-4 me-3"></i>
              <div>
                <strong>ATENÇÃO:</strong> Esta área permite a exclusão permanente de registros do banco de dados.
                Esta operação é <strong>IRREVERSÍVEL</strong> e deve ser usada com extremo cuidado!
              </div>
            </div>
          </div>
        </div>

        {/* Seletor de Tipo */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="btn-group w-100" role="group">
                  <button
                    type="button"
                    className={`btn btn-lg ${tipoExclusao === 'residentes' ? 'btn-danger' : 'btn-outline-danger'}`}
                    onClick={() => {
                      setTipoExclusao('residentes')
                      setSelectedIds([])
                      setBusca('')
                    }}
                  >
                    <i className="bi bi-people-fill me-2"></i>
                    Residentes ({Array.isArray(residentes) ? residentes.length : 0})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-lg ${tipoExclusao === 'profissionais' ? 'btn-danger' : 'btn-outline-danger'}`}
                    onClick={() => {
                      setTipoExclusao('profissionais')
                      setSelectedIds([])
                      setBusca('')
                    }}
                  >
                    <i className="bi bi-person-badge-fill me-2"></i>
                    Profissionais ({Array.isArray(profissionais) ? profissionais.length : 0})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Busca e Ações */}
        <div className="row mb-4">
          <div className="col-md-8">
            <div className="input-group input-group-lg">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder={`Buscar ${tipoExclusao === 'residentes' ? 'residente por nome, CPF ou RG' : 'profissional por nome, especialidade ou registro'}...`}
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <button
              className="btn btn-danger btn-lg w-100"
              onClick={handleDeletarSelecionados}
              disabled={loading || selectedIds.length === 0}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Processando...
                </>
              ) : (
                <>
                  <i className="bi bi-trash3-fill me-2"></i>
                  Deletar Selecionados ({selectedIds.length})
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                {loading && (!Array.isArray(dados) || dados.length === 0) ? (
                  <div className="text-center p-5">
                    <div className="spinner-border text-danger" role="status">
                      <span className="visually-hidden">Carregando...</span>
                    </div>
                    <p className="mt-3 text-muted">Carregando dados...</p>
                  </div>
                ) : (!Array.isArray(dadosExibicao) || dadosExibicao.length === 0) ? (
                  <div className="text-center p-5">
                    <i className="bi bi-inbox fs-1 text-muted"></i>
                    <p className="mt-3 text-muted">Nenhum registro encontrado</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-danger">
                        <tr>
                          <th style={{ width: '50px' }}>
                            <input
                              type="checkbox"
                              className="form-check-input"
                              onChange={handleSelectAll}
                              checked={selectedIds.length === dadosExibicao.length && dadosExibicao.length > 0}
                            />
                          </th>
                          <th>ID</th>
                          <th>Nome Completo</th>
                          {tipoExclusao === 'residentes' ? (
                            <>
                              <th>CPF</th>
                              <th>RG</th>
                              <th>Data Nascimento</th>
                            </>
                          ) : (
                            <>
                              <th>Especialidade</th>
                              <th>Registro</th>
                              <th>Telefone</th>
                            </>
                          )}
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dadosExibicao.map((item) => (
                          <tr key={item.id} className={selectedIds.includes(item.id) ? 'table-danger' : ''}>
                            <td>
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={selectedIds.includes(item.id)}
                                onChange={() => handleSelectOne(item.id)}
                              />
                            </td>
                            <td><strong>#{item.id}</strong></td>
                            <td>{item.nome_completo}</td>
                            {tipoExclusao === 'residentes' ? (
                              <>
                                <td>{item.cpf || '-'}</td>
                                <td>{item.rg || '-'}</td>
                                <td>{item.data_nascimento ? new Date(item.data_nascimento).toLocaleDateString('pt-BR') : '-'}</td>
                              </>
                            ) : (
                              <>
                                <td>{item.especialidade || '-'}</td>
                                <td>{item.registro_profissional || '-'}</td>
                                <td>{item.telefone || '-'}</td>
                              </>
                            )}
                            <td>
                              <span className={`badge ${item.ativo ? 'bg-success' : 'bg-secondary'}`}>
                                {item.ativo ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              {Array.isArray(dadosExibicao) && dadosExibicao.length > 0 && (
                <div className="card-footer bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">
                      Exibindo {dadosExibicao.length} de {Array.isArray(dados) ? dados.length : 0} registro(s)
                    </span>
                    <span className="text-danger fw-bold">
                      {selectedIds.length} selecionado(s)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Gerenciamento
