import { products } from '../data/products'

/**
 * Ponto único de integração para um futuro assistente de pedidos.
 * Um provedor de IA poderá ser conectado sem alterar os componentes do site.
 */
export const createCatalogContext = () =>
  products.map(({ id, name, category, description }) => ({
    id,
    name,
    category,
    description,
  }))

export async function askOrderAssistant(question, provider) {
  if (typeof provider !== 'function') {
    return {
      available: false,
      message: 'O assistente de pedidos ainda não foi conectado.',
    }
  }

  return provider({
    question,
    catalog: createCatalogContext(),
  })
}
