import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_SD_API_URL

const emptyForm = {
  nome: '',
  descricao: '',
  preco: '',
}

function App() {
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)

  async function carregarProdutos() {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`${API_URL}/produtos`)

      if (!response.ok) {
        throw new Error('Falha ao carregar produtos')
      }

      const data = await response.json()
      setProdutos(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarProdutos()
  }, [])

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((produto) =>
      produto.nome.toLowerCase().includes(search.toLowerCase())
    )
  }, [produtos, search])

  function abrirCriacao() {
    setEditingId(null)
    setFormData(emptyForm)
    setShowModal(true)
  }

  function abrirEdicao(produto) {
    setEditingId(produto.id)

    setFormData({
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
    })

    setShowModal(true)
  }

  function fecharModal() {
    setShowModal(false)
    setFormData(emptyForm)
    setEditingId(null)
  }

  function handleChange(e) {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function salvarProduto(e) {
    e.preventDefault()

    try {
      const payload = {
        nome: formData.nome,
        descricao: formData.descricao,
        preco: Number(formData.preco),
      }

      const isEditing = editingId !== null

      const response = await fetch(
        isEditing
          ? `${API_URL}/produto/atualiza/${editingId}`
          : `${API_URL}/produto/novo`,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        throw new Error('Erro ao salvar produto')
      }

      fecharModal()
      carregarProdutos()
    } catch (err) {
      alert(err.message)
    }
  }

  async function deletarProduto(id) {
    const confirmacao = confirm('Deseja realmente excluir este produto?')

    if (!confirmacao) return

    try {
      const response = await fetch(`${API_URL}/produto/remove/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao remover produto')
      }

      carregarProdutos()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="app">
      <header className="hero">
        <div>
          <span className="tag">Microsserviços Distribuídos</span>
          <h1>SD Hardware Store</h1>
          <p>
            Frontend conectado ao microsserviço de catálogo com gerenciamento
            completo de produtos.
          </p>
        </div>

        <button className="primary-btn" onClick={abrirCriacao}>
          + Novo Produto
        </button>
      </header>

      <section className="toolbar">
        <input
          type="text"
          placeholder="Buscar produto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="stats">
          <span>{produtos.length} produtos</span>
        </div>
      </section>

      {loading && <div className="feedback">Carregando produtos...</div>}

      {error && <div className="error-box">{error}</div>}

      {!loading && (
        <div className="grid">
          {produtosFiltrados.map((produto) => (
            <div className="card" key={produto.id}>
              <div className="card-top">
                <span className="product-id">#{produto.id}</span>
              </div>

              <h2>{produto.nome}</h2>

              <p>{produto.descricao}</p>

              <div className="card-footer">
                <div>
                  <span className="price-label">Preço</span>
                  <strong>
                    {produto.preco !== null
                      ? new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(produto.preco)
                      : 'Indisponível'}
                  </strong>
                </div>

                <div className="actions">
                  <button
                    className="edit-btn"
                    onClick={() => abrirEdicao(produto)}
                  >
                    Editar
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => deletarProduto(produto.id)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                {editingId ? 'Atualizar Produto' : 'Cadastrar Produto'}
              </h2>

              <button className="close-btn" onClick={fecharModal}>
                ×
              </button>
            </div>

            <form onSubmit={salvarProduto}>
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Preço</label>
                <input
                  type="number"
                  step="0.01"
                  name="preco"
                  value={formData.preco}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="primary-btn full-btn">
                {editingId ? 'Salvar Alterações' : 'Cadastrar Produto'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App