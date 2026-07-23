import { computed, readonly, ref } from 'vue'
import { categories as initialCategories, products as initialProducts } from '../data/products'
import { isSupabaseConfigured, supabase } from '../services/supabase'

const categories = ref([])
const products = ref([])
const loaded = ref(false)
const loading = ref(false)
const catalogError = ref('')
let loadPromise

const clone = (value) => JSON.parse(JSON.stringify(value))

const defaultCategories = () =>
  clone(initialCategories).map((category, index) => ({
    ...category,
    sortOrder: index,
  }))

const defaultProducts = () =>
  clone(initialProducts).map((product, index) => ({
    ...product,
    id: String(product.id),
    active: product.active !== false,
    sortOrder: index,
    imagePath: null,
  }))

const applyDefaultCatalog = () => {
  categories.value = defaultCategories()
  products.value = defaultProducts()
}

const mapCategory = (row) => ({
  id: row.id,
  label: row.label,
  sortOrder: row.sort_order ?? 0,
})

const mapProduct = (row) => ({
  id: row.id,
  name: row.name,
  category: row.category_id,
  description: row.description,
  image: row.image_url,
  imagePath: row.image_path,
  imageAlt: row.image_alt,
  featured: Boolean(row.featured),
  seasonal: Boolean(row.seasonal),
  active: row.active !== false,
  sortOrder: row.sort_order ?? 0,
})

const productPayload = (product) => ({
  id: String(product.id),
  name: product.name.trim(),
  category_id: product.category,
  description: product.description.trim(),
  image_url: product.image,
  image_path: product.imagePath || null,
  image_alt: product.imageAlt?.trim() || `Foto de ${product.name.trim()}`,
  featured: Boolean(product.featured),
  seasonal: Boolean(product.seasonal),
  active: product.active !== false,
  sort_order: product.sortOrder ?? 0,
})

const slugify = (label) =>
  label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const extensionFor = (file) => {
  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (extension) return extension
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  return 'jpg'
}

const friendlyError = (reason) => {
  if (reason?.code === '23503') {
    return new Error('Mova ou exclua os produtos desta categoria primeiro.')
  }

  if (reason?.status === 401 || reason?.status === 403 || reason?.code === '42501') {
    return new Error('Você não tem permissão para realizar esta alteração.')
  }

  return reason instanceof Error
    ? reason
    : new Error(reason?.message || 'Não foi possível atualizar o cardápio.')
}

const removeStoredImage = async (path) => {
  if (!path) return
  await supabase.storage.from('catalog-images').remove([path])
}

const uploadProductImage = async (productId, file) => {
  const path = `products/${productId}/${Date.now()}.${extensionFor(file)}`
  const { error } = await supabase.storage.from('catalog-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  })
  if (error) throw error

  const { data } = supabase.storage.from('catalog-images').getPublicUrl(path)
  return { path, publicUrl: data.publicUrl }
}

export const useCatalog = () => {
  const loadCatalog = async ({ force = false, admin = false } = {}) => {
    if (loaded.value && !force) return
    if (loadPromise) return loadPromise

    loadPromise = (async () => {
      loading.value = true
      catalogError.value = ''

      if (!isSupabaseConfigured) {
        applyDefaultCatalog()
        loaded.value = true
        loading.value = false
        return
      }

      try {
        const [
          { data: categoryRows, error: categoryError },
          { data: productRows, error: productError },
        ] = await Promise.all([
          supabase
            .from('categories')
            .select('id,label,sort_order')
            .order('sort_order')
            .order('label'),
          supabase
            .from('products')
            .select(
              'id,name,category_id,description,image_url,image_path,image_alt,featured,seasonal,active,sort_order,created_at',
            )
            .order('sort_order')
            .order('created_at'),
        ])

        if (categoryError) throw categoryError
        if (productError) throw productError

        categories.value = categoryRows.map(mapCategory)
        products.value = productRows.map(mapProduct)
        loaded.value = true
      } catch (reason) {
        catalogError.value = friendlyError(reason).message
        if (!admin) {
          applyDefaultCatalog()
          loaded.value = true
        } else {
          throw reason
        }
      } finally {
        loading.value = false
      }
    })()

    try {
      await loadPromise
    } finally {
      loadPromise = null
    }
  }

  const addCategory = async (label) => {
    const cleanLabel = label.trim()
    if (!cleanLabel) throw new Error('Digite o nome da categoria.')
    if (!isSupabaseConfigured) throw new Error('Conecte o Supabase para editar o cardápio.')

    const baseId = slugify(cleanLabel) || `categoria-${Date.now()}`
    let id = baseId
    let suffix = 2

    while (categories.value.some((category) => category.id === id)) {
      id = `${baseId}-${suffix}`
      suffix += 1
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          id,
          label: cleanLabel,
          sort_order: categories.value.length,
        })
        .select()
        .single()
      if (error) throw error

      categories.value = [...categories.value, mapCategory(data)]
      return id
    } catch (reason) {
      throw friendlyError(reason)
    }
  }

  const removeCategory = async (id) => {
    if (products.value.some((product) => product.category === id)) {
      throw new Error('Mova ou exclua os produtos desta categoria primeiro.')
    }

    try {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
      categories.value = categories.value.filter((category) => category.id !== id)
    } catch (reason) {
      throw friendlyError(reason)
    }
  }

  const saveProduct = async (product, { imageFile } = {}) => {
    const normalized = {
      ...product,
      id: product.id ? String(product.id) : crypto.randomUUID(),
      name: product.name.trim(),
      description: product.description.trim(),
      image: product.image || '/images/hero-food.png',
      imagePath: product.imagePath || null,
      imageAlt: product.imageAlt?.trim() || `Foto de ${product.name.trim()}`,
      active: product.active !== false,
      sortOrder: product.sortOrder ?? products.value.length,
    }

    if (!normalized.name || !normalized.category || !normalized.description) {
      throw new Error('Preencha nome, categoria e descrição.')
    }

    const previous = products.value.find((item) => item.id === normalized.id)
    let uploadedPath = null

    try {
      if (imageFile) {
        const uploaded = await uploadProductImage(normalized.id, imageFile)
        normalized.image = uploaded.publicUrl
        normalized.imagePath = uploaded.path
        uploadedPath = uploaded.path
      }

      const query = previous
        ? supabase
            .from('products')
            .update(productPayload(normalized))
            .eq('id', normalized.id)
        : supabase.from('products').insert(productPayload(normalized))

      const { data, error } = await query.select().single()
      if (error) throw error

      const saved = mapProduct(data)
      products.value = previous
        ? products.value.map((item) => (item.id === saved.id ? saved : item))
        : [...products.value, saved]

      if (imageFile && previous?.imagePath && previous.imagePath !== saved.imagePath) {
        await removeStoredImage(previous.imagePath).catch(() => {})
      }

      return saved
    } catch (reason) {
      if (uploadedPath) await removeStoredImage(uploadedPath).catch(() => {})
      throw friendlyError(reason)
    }
  }

  const toggleProduct = async (id) => {
    const product = products.value.find((item) => item.id === id)
    if (!product) return

    try {
      const active = product.active === false
      const { error } = await supabase.from('products').update({ active }).eq('id', id)
      if (error) throw error

      product.active = active
      products.value = [...products.value]
    } catch (reason) {
      throw friendlyError(reason)
    }
  }

  const removeProduct = async (id) => {
    const product = products.value.find((item) => item.id === id)

    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error

      products.value = products.value.filter((item) => item.id !== id)
      if (product?.imagePath) await removeStoredImage(product.imagePath).catch(() => {})
    } catch (reason) {
      throw friendlyError(reason)
    }
  }

  const replaceCatalog = async (snapshot) => {
    const oldImagePaths = products.value.map((product) => product.imagePath).filter(Boolean)

    const { error: productDeleteError } = await supabase
      .from('products')
      .delete()
      .not('id', 'is', null)
    if (productDeleteError) throw friendlyError(productDeleteError)

    const { error: categoryDeleteError } = await supabase
      .from('categories')
      .delete()
      .not('id', 'is', null)
    if (categoryDeleteError) throw friendlyError(categoryDeleteError)

    const nextCategories = snapshot.categories.map((category, index) => ({
      id: category.id,
      label: category.label,
      sort_order: category.sortOrder ?? index,
    }))
    const nextProducts = snapshot.products.map((product, index) =>
      productPayload({
        ...product,
        id: String(product.id || crypto.randomUUID()),
        image: product.image || '/images/hero-food.png',
        sortOrder: product.sortOrder ?? index,
      }),
    )

    if (nextCategories.length) {
      const { error } = await supabase.from('categories').insert(nextCategories)
      if (error) throw friendlyError(error)
    }
    if (nextProducts.length) {
      const { error } = await supabase.from('products').insert(nextProducts)
      if (error) throw friendlyError(error)
    }

    await Promise.all(oldImagePaths.map((path) => removeStoredImage(path).catch(() => {})))
    await loadCatalog({ force: true, admin: true })
  }

  const resetCatalog = async () =>
    replaceCatalog({
      categories: defaultCategories(),
      products: defaultProducts(),
    })

  const importCatalog = async (snapshot) => {
    if (!Array.isArray(snapshot?.categories) || !Array.isArray(snapshot?.products)) {
      throw new Error('Este arquivo não é um backup válido da ShowSu.')
    }

    await replaceCatalog(snapshot)
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
    loading: readonly(loading),
    catalogError: readonly(catalogError),
    online: isSupabaseConfigured,
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
