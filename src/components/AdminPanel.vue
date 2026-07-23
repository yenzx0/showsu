<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import {
  ArrowLeft,
  Download,
  Eye,
  EyeOff,
  ImagePlus,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Upload,
} from '@lucide/vue'
import { useCatalog } from '../composables/useCatalog'

const emit = defineEmits(['close'])
const {
  categories,
  products,
  loaded,
  loadCatalog,
  addCategory,
  removeCategory,
  saveProduct,
  toggleProduct,
  removeProduct,
  resetCatalog,
  importCatalog,
  exportCatalog,
} = useCatalog()

const categoryName = ref('')
const editingId = ref(null)
const name = ref('')
const category = ref('')
const description = ref('')
const image = ref('')
const imageAlt = ref('')
const featured = ref(false)
const message = ref('')
const error = ref('')
const importInput = ref(null)

const categoryUsage = computed(() =>
  Object.fromEntries(
    categories.value.map((item) => [
      item.id,
      products.value.filter((product) => product.category === item.id).length,
    ]),
  ),
)

const selectedCategoryLabel = (id) =>
  categories.value.find((item) => item.id === id)?.label || 'Sem categoria'

const showFeedback = (text, isError = false) => {
  message.value = isError ? '' : text
  error.value = isError ? text : ''
}

const clearForm = () => {
  editingId.value = null
  name.value = ''
  description.value = ''
  image.value = ''
  imageAlt.value = ''
  featured.value = false
  category.value = categories.value[0]?.id || ''
}

const handleCategory = async () => {
  try {
    const id = await addCategory(categoryName.value)
    categoryName.value = ''
    category.value = id
    showFeedback('Categoria adicionada.')
  } catch (reason) {
    showFeedback(reason.message, true)
  }
}

const handleRemoveCategory = async (id) => {
  try {
    await removeCategory(id)
    showFeedback('Categoria removida.')
  } catch (reason) {
    showFeedback(reason.message, true)
  }
}

const handleImage = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    showFeedback('Escolha um arquivo de imagem.', true)
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    showFeedback('A foto deve ter no máximo 5 MB.', true)
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    image.value = reader.result
    imageAlt.value = `Foto de ${name.value || 'produto'}`
  }
  reader.readAsDataURL(file)
}

const handleProduct = async () => {
  try {
    await saveProduct({
      id: editingId.value,
      name: name.value,
      category: category.value,
      description: description.value,
      image: image.value || '/images/hero-food.png',
      imageAlt: imageAlt.value,
      featured: featured.value,
      active:
        editingId.value === null
          ? true
          : products.value.find((product) => product.id === editingId.value)?.active !==
            false,
    })
    showFeedback(editingId.value ? 'Produto atualizado.' : 'Produto adicionado.')
    clearForm()
  } catch (reason) {
    showFeedback(reason.message, true)
  }
}

const editProduct = (product) => {
  editingId.value = product.id
  name.value = product.name
  category.value = product.category
  description.value = product.description
  image.value = product.image
  imageAlt.value = product.imageAlt
  featured.value = Boolean(product.featured)
  document.querySelector('.admin-product-form')?.scrollIntoView({ behavior: 'smooth' })
}

const handleRemoveProduct = async (product) => {
  if (!window.confirm(`Excluir “${product.name}”?`)) return
  await removeProduct(product.id)
  if (editingId.value === product.id) clearForm()
  showFeedback('Produto excluído.')
}

const downloadBackup = () => {
  const blob = new Blob([JSON.stringify(exportCatalog(), null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `showsu-catalogo-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
  showFeedback('Backup exportado.')
}

const handleImport = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async () => {
    try {
      await importCatalog(JSON.parse(reader.result))
      clearForm()
      showFeedback('Backup restaurado.')
    } catch (reason) {
      showFeedback(reason.message || 'Não foi possível importar o backup.', true)
    } finally {
      event.target.value = ''
    }
  }
  reader.readAsText(file)
}

const handleReset = async () => {
  if (!window.confirm('Restaurar o catálogo original? Os cadastros locais serão apagados.')) {
    return
  }

  await resetCatalog()
  clearForm()
  showFeedback('Catálogo original restaurado.')
}

watch(
  categories,
  (items) => {
    if (!category.value && items.length) category.value = items[0].id
  },
  { immediate: true },
)

onMounted(async () => {
  await loadCatalog()
  if (!category.value) category.value = categories.value[0]?.id || ''
})
</script>

<template>
  <Teleport to="body">
    <div class="admin-overlay" role="dialog" aria-modal="true" aria-labelledby="admin-title">
      <header class="admin-header">
        <div class="admin-shell admin-header-inner">
          <button type="button" class="admin-back" @click="emit('close')">
            <ArrowLeft :size="19" aria-hidden="true" />
            Voltar ao site
          </button>
          <div>
            <span>Painel local</span>
            <strong id="admin-title">Catálogo ShowSu</strong>
          </div>
        </div>
      </header>

      <main v-if="loaded" class="admin-shell admin-main">
        <section class="admin-intro">
          <div>
            <p class="eyebrow">Somente neste computador</p>
            <h1>Organize o cardápio com facilidade.</h1>
            <p>
              As alterações ficam salvas neste navegador. Exporte um backup sempre que
              fizer mudanças importantes.
            </p>
          </div>
          <div class="admin-stats">
            <span><strong>{{ products.length }}</strong> produtos</span>
            <span><strong>{{ categories.length }}</strong> categorias</span>
          </div>
        </section>

        <p v-if="message" class="admin-feedback success" role="status">{{ message }}</p>
        <p v-if="error" class="admin-feedback error" role="alert">{{ error }}</p>

        <div class="admin-layout">
          <aside class="admin-sidebar">
            <section class="admin-card">
              <div class="admin-card-heading">
                <div>
                  <span class="admin-kicker">Organização</span>
                  <h2>Categorias</h2>
                </div>
              </div>

              <form class="category-form" @submit.prevent="handleCategory">
                <label>
                  <span>Nova categoria</span>
                  <div>
                    <input v-model="categoryName" placeholder="Ex.: Marmitas Fit" />
                    <button type="submit" aria-label="Adicionar categoria">
                      <Plus :size="19" aria-hidden="true" />
                    </button>
                  </div>
                </label>
              </form>

              <div class="category-list">
                <div v-for="item in categories" :key="item.id" class="category-row">
                  <div>
                    <strong>{{ item.label }}</strong>
                    <span>
                      {{ categoryUsage[item.id] }}
                      {{ categoryUsage[item.id] === 1 ? 'produto' : 'produtos' }}
                    </span>
                  </div>
                  <button
                    type="button"
                    :disabled="categoryUsage[item.id] > 0"
                    :aria-label="`Excluir categoria ${item.label}`"
                    @click="handleRemoveCategory(item.id)"
                  >
                    <Trash2 :size="16" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </section>

            <section class="admin-card backup-card">
              <span class="admin-kicker">Segurança</span>
              <h2>Backup do catálogo</h2>
              <p>Salve uma cópia para recuperar seus cadastros e fotos neste computador.</p>
              <button type="button" class="admin-secondary-action" @click="downloadBackup">
                <Download :size="17" aria-hidden="true" />
                Exportar backup
              </button>
              <button
                type="button"
                class="admin-secondary-action"
                @click="importInput?.click()"
              >
                <Upload :size="17" aria-hidden="true" />
                Importar backup
              </button>
              <input
                ref="importInput"
                class="sr-only"
                type="file"
                accept="application/json"
                @change="handleImport"
              />
              <button type="button" class="admin-reset" @click="handleReset">
                <RotateCcw :size="15" aria-hidden="true" />
                Restaurar catálogo original
              </button>
            </section>
          </aside>

          <div class="admin-content">
            <section class="admin-card admin-product-form">
              <div class="admin-card-heading">
                <div>
                  <span class="admin-kicker">{{ editingId ? 'Editando' : 'Novo item' }}</span>
                  <h2>{{ editingId ? 'Atualizar produto' : 'Adicionar produto' }}</h2>
                </div>
                <button v-if="editingId" type="button" class="admin-cancel" @click="clearForm">
                  Cancelar edição
                </button>
              </div>

              <form class="product-form" @submit.prevent="handleProduct">
                <label>
                  <span>Nome do produto</span>
                  <input v-model="name" placeholder="Ex.: Coxinha de frango" required />
                </label>

                <label>
                  <span>Categoria</span>
                  <select v-model="category" required>
                    <option v-for="item in categories" :key="item.id" :value="item.id">
                      {{ item.label }}
                    </option>
                  </select>
                </label>

                <label class="form-full">
                  <span>Descrição</span>
                  <textarea
                    v-model="description"
                    rows="4"
                    placeholder="Conte os sabores, recheios e detalhes..."
                    required
                  ></textarea>
                </label>

                <label class="image-field form-full">
                  <span>Foto do produto</span>
                  <input type="file" accept="image/*" @change="handleImage" />
                  <div class="image-drop">
                    <img v-if="image" :src="image" alt="Prévia da foto do produto" />
                    <ImagePlus v-else :size="30" aria-hidden="true" />
                    <span>{{ image ? 'Trocar foto' : 'Escolher uma foto' }}</span>
                    <small>JPG, PNG ou WebP — até 5 MB</small>
                  </div>
                </label>

                <label class="featured-check form-full">
                  <input v-model="featured" type="checkbox" />
                  <span>Mostrar selo “Queridinho”</span>
                </label>

                <button class="button button-primary form-submit" type="submit">
                  <Save :size="18" aria-hidden="true" />
                  {{ editingId ? 'Salvar alterações' : 'Adicionar ao cardápio' }}
                </button>
              </form>
            </section>

            <section class="admin-card">
              <div class="admin-card-heading">
                <div>
                  <span class="admin-kicker">Cardápio atual</span>
                  <h2>Produtos</h2>
                </div>
              </div>

              <div class="admin-product-list">
                <article v-for="product in products" :key="product.id" class="admin-product-row">
                  <img :src="product.image" :alt="product.imageAlt" />
                  <div class="admin-product-copy">
                    <span>{{ selectedCategoryLabel(product.category) }}</span>
                    <strong>{{ product.name }}</strong>
                    <small :class="{ inactive: product.active === false }">
                      {{ product.active === false ? 'Oculto no site' : 'Visível no site' }}
                    </small>
                  </div>
                  <div class="admin-product-actions">
                    <button
                      type="button"
                      :aria-label="product.active === false ? `Exibir ${product.name}` : `Ocultar ${product.name}`"
                      @click="toggleProduct(product.id)"
                    >
                      <EyeOff v-if="product.active !== false" :size="17" aria-hidden="true" />
                      <Eye v-else :size="17" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      :aria-label="`Editar ${product.name}`"
                      @click="editProduct(product)"
                    >
                      <Pencil :size="17" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      class="danger"
                      :aria-label="`Excluir ${product.name}`"
                      @click="handleRemoveProduct(product)"
                    >
                      <Trash2 :size="17" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  </Teleport>
</template>
