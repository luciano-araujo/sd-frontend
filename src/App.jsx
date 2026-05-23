import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(import.meta.env.VITE_SD_API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Falha ao conectar com o servidor de Catálogo')
        }
        return response.json()
      })
      .then((data) => {
        setProdutos(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="loading">Carregando catálogo de hardware...</div>
  if (error) return <div className="error">Erro de Conexão: {error}</div>

  return (
    <div className="container">
      <header>
        <h1>💻 SD Hardware Store</h1>
        <p>Catálogo de Produtos — sd-catalogo + sd-preco</p>
      </header>

      <div className="grid">
        {produtos.map((produto) => (
          <div key={produto.id} className="card">
            <div className="card-header">
              <h2>{produto.nome}</h2>
              <span className="badge">ID: {produto.id}</span>
            </div>
            <p className="descricao">{produto.descricao}</p>
            <div className="preco-container">
              {produto.preco !== null ? (
                <span className="preco">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.preco)}
                </span>
              ) : (
                <span className="preco-indisponivel">Preço indisponível</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App