import { computed, readonly, ref } from 'vue'
import { categories as initialCategories, products as initialProducts } from '../data/products'

const DATABASE_NAME = 'showsu-catalogo'
const STORE_NAME = 'catalogo'
const SNAPSHOT_KEY = 'atual'

const categories = ref([])
const products = ref([])
const loaded = ref(false)
let databasePromise

const clone = (value) => JSON.parse(JSON.stringify(value))

const defaultSnapshot = () => ({
  categories: clone(initialCategories),
  products: clone(initialProducts).map((product) => ({
    ...product,
    active: product.active !== false,
  })),
  updatedAt: new Date().toISOString(),
})

const openDatabase = () => {
  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, 1)

      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE_NAME)) {
          request.result.createObjectStore(STORE_NAME)
        }
      }

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  return databasePromise
}

const readSnapshot = async () => {
  const database = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly')
    const request = transaction.objectStore(STORE_NAME).get(SNAPSHOT_KEY)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

const writeSnapshot = async () => {
  const database = await openDatabase()
  const snapshot = {
    categories: clone(categories.value),
    products: clone(products.value),
    updatedAt: new Date().toISOString(),
  }

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    transaction.objectStore(STORE_NAME).put(snapshot, SNAPSHOT_KEY)
    transaction.oncomplete = () => resolve(snapshot)
    transaction.onerror = () => reject(transaction.error)
  })
}

const applySnapshot = (snapshot) => {
  categories.value = clone(snapshot.categories)
  products.value = clone(snapshot.products).map((product) => ({
    ...product,
    active: product.active !== false,
  }))
}

const slugify = (label) =>
  label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export const useCatalog = () => {
  const loadCatalog = async () => {
    if (loaded.value) return

    try {
      const saved = await readSnapshot()
      applySnapshot(saved?.categories?.length ? saved : defaultSnapshot())
      if (!saved) await writeSnapshot()
    } catch {
      applySnapshot(defaultSnapshot())
    } finally {
      loaded.value = true
    }
  }

  const addCategory = async (label) => {
    const cleanLabel = label.trim()
    if (!cleanLabel) throw new Error('Digite o nome da categoria.')

    const baseId = slugify(cleanLabel) || `categoria-${Date.now()}`
    let id = baseId
    let suffix = 2

    while (categories.value.some((category) => category.id === id)) {
      id = `${baseId}-${suffix}`
      suffix += 1
    }

    categories.value.push({ id, label: cleanLabel })
    await writeSnapshot()
    return id
  }

  const removeCategory = async (id) => {
    if (products.value.some((product) => product.category === id)) {
      throw new Error('Mova ou exclua os produtos desta categoria primeiro.')
    }

    categories.value = categories.value.filter((category) => category.id !== id)
    await writeSnapshot()
  }

  const saveProduct = async (product) => {
    const normalized = {
      ...product,
      name: product.name.trim(),
      description: product.description.trim(),
      imageAlt: product.imageAlt?.trim() || `Foto de ${product.name.trim()}`,
      active: product.active !== false,
    }

    if (!normalized.name || !normalized.category || !normalized.description) {
      throw new Error('Preencha nome, categoria e descrição.')
    }

    if (normalized.id) {
      const index = products.value.findIndex((item) => item.id === normalized.id)
      if (index === -1) throw new Error('Produto não encontrado.')
      products.value[index] = normalized
      products.value = [...products.value]
    } else {
      normalized.id = `produto-${Date.now()}`
      products.value = [normalized, ...products.value]
    }

    await writeSnapshot()
    return normalized
  }

  const toggleProduct = async (id) => {
    const product = products.value.find((item) => item.id === id)
    if (!product) return
    product.active = product.active === false
    products.value = [...products.value]
    await writeSnapshot()
  }

  const removeProduct = async (id) => {
    products.value = products.value.filter((product) => product.id !== id)
    await writeSnapshot()
  }

  const resetCatalog = async () => {
    applySnapshot(defaultSnapshot())
    await writeSnapshot()
  }

  const importCatalog = async (snapshot) => {
    if (!Array.isArray(snapshot?.categories) || !Array.isArray(snapshot?.products)) {
      throw new Error('Este arquivo não é um backup válido da ShowSu.')
    }

    applySnapshot(snapshot)
    await writeSnapshot()
  }

  const exportCatalog = () => ({
    categories: clone(categories.value),
    products: clone(products.value),
    exportedAt: new Date().toISOString(),
  })

  return {
    categories: readonly(categories),
    products: readonly(products),
    activeProducts: computed(() =>
      products.value.filter((product) => product.active !== false),
    ),
    loaded: readonly(loaded),
    loadCatalog,
    addCategory,
    removeCategory,
    saveProduct,
    toggleProduct,
    removeProduct,
    resetCatalog,
    importCatalog,
    exportCatalog,
  }
}
