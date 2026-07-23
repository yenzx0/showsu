<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  ArrowLeft,
  Cloud,
  Download,
  Eye,
  EyeOff,
  ImagePlus,
  LoaderCircle,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
} from '@lucide/vue'
import { useAdminAuth } from '../composables/useAdminAuth'
import { useCatalog } from '../composables/useCatalog'
import { isSupabaseConfigured } from '../services/supabase'

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
const { session, loading: authLoading, initializeAuth, signIn, signOut } = useAdminAuth()

const email = ref('')
const password = ref('')
const categoryName = ref('')
const editingId = ref(null)
const name = ref('')
const category = ref('')
const description = ref('')
const image = ref('')
const imageAlt = ref('')
const imageFile = ref(null)
const featured = ref(false)
const message = ref('')
const error = ref('')
const loginError = ref('')
const catalogLoading = ref(false)
const catalogFailed = ref(false)
const saving = ref(false)
const importInput = ref(null)
let previewUrl = null

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

const releasePreview = () => {
  if (previewUrl) URL.revokeObjectURL(previewUrl)
  previewUrl = null
}

const clearForm = () => {
  releasePreview()
  editingId.value = null
  name.value = ''
  description.value = ''
  image.value = ''
  imageAlt.value = ''
  imageFile.value = null
  featured.value = false
  category.value = categories.value[0]?.id || ''
}

const refreshAdminCatalog = async () => {
  catalogLoading.value = true
  catalogFailed.value = false
  try {
    await loadCatalog({ force: true, admin: true })
  } catch (reason) {
    catalogFailed.value = true
    showFeedback(
      `${reason.message || 'Não foi possível carregar o catálogo.'} Confira a configuração do banco.`,
      true,
    )
  } finally {
    catalogLoading.value = false
  }
}

const handleLogin = async () => {
  loginError.value = ''
  try {
    await signIn(email.value, password.value)
    password.value = ''
    await refreshAdminCatalog()
  } catch (reason) {
    loginError.value =
      reason.status === 400 || reason.message?.toLowerCase().includes('credentials')
        ? 'E-mail ou senha incorretos.'
        : reason.message || 'Não foi possível entrar.'
  }
}

const handleSignOut = async () => {
  await signOut()
  clearForm()
  message.value = ''
  error.value = ''
  catalogFailed.value = false
}

const handleCategory = async () => {
  saving.value = true
  try {
    const id = await addCategory(categoryName.value)
    categoryName.value = ''
    category.value = id
    showFeedback('Categoria adicionada e publicada.')
  } catch (reason) {
    showFeedback(reason.message, true)
  } finally {
    saving.value = false
  }
}

const handleRemoveCategory = async (id) => {
  saving.value = true
  try {
    await removeCategory(id)
    showFeedback('Categoria removida.')
  } catch (reason) {
    showFeedback(reason.message, true)
  } finally {
    saving.value = false
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

  releasePreview()
  imageFile.value = file
  previewUrl = URL.createObjectURL(file)
  image.value = previewUrl
  imageAlt.value = `Foto de ${name.value || 'produto'}`
}

const handleProduct = async () => {
  saving.value = true
  try {
    const currentProduct = products.value.find(
      (product) => product.id === editingId.value,
    )
    await saveProduct(
      {
        id: editingId.value,
        name: name.value,
        category: category.value,
        description: description.value,
        image: image.value || '/images/hero-food.png',
        imagePath: currentProduct?.imagePath || null,
        imageAlt: imageAlt.value,
        featured: featured.value,
        seasonal: currentProduct?.seasonal || false,
        active: editingId.value === null ? true : currentProduct?.active !== false,
        sortOrder: currentProduct?.sortOrder,
      },
      { imageFile: imageFile.value },
    )
    showFeedback(
      editingId.value ? 'Produto atualizado no site.' : 'Produto publicado no site.',
    )
    clearForm()
  } catch (reason) {
    showFeedback(reason.message, true)
  } finally {
    saving.value = false
  }
}

const editProduct = (product) => {
  releasePreview()
  editingId.value = product.id
  name.value = product.name
  category.value = product.category
  description.value = product.description
  image.value = product.image
  imageAlt.value = product.imageAlt
  imageFile.value = null
  featured.value = Boolean(product.featured)
  document.querySelector('.admin-product-form')?.scrollIntoView({ behavior: 'smooth' })
}

const handleToggleProduct = async (id) => {
  saving.value = true
  try {
    await toggleProduct(id)
    showFeedback('Visibilidade atualizada.')
  } catch (reason) {
    showFeedback(reason.message, true)
  } finally {
    saving.value = false
  }
}

const handleRemoveProduct = async (product) => {
  if (!window.confirm(`Excluir “${product.name}” do cardápio online?`)) return

  saving.value = true
  try {
    await removeProduct(product.id)
    if (editingId.value === product.id) clearForm()
    showFeedback('Produto excluído.')
  } catch (reason) {
    showFeedback(reason.message, true)
  } finally {
    saving.value = false
  }
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
    saving.value = true
    try {
      await importCatalog(JSON.parse(reader.result))
      clearForm()
      showFeedback('Backup restaurado e publicado.')
    } catch (reason) {
      showFeedback(reason.message || 'Não foi possível importar o backup.', true)
    } finally {
      saving.value = false
      event.target.value = ''
    }
  }
  reader.readAsText(file)
}

const handleReset = async () => {
  if (
    !window.confirm(
      'Restaurar o catálogo original? Os produtos cadastrados no painel serão apagados.',
    )
  ) {
    return
  }

  saving.value = true
  try {
    await resetCatalog()
    clearForm()
    showFeedback('Catálogo original restaurado e publicado.')
  } catch (reason) {
    showFeedback(reason.message, true)
  } finally {
    saving.value = false
  }
}

watch(
  categories,
  (items) => {
    if (!category.value && items.length) category.value = items[0].id
  },
  { immediate: true },
)

onMounted(async () => {
  if (!isSupabaseConfigured) return

  try {
    const activeSession = await initializeAuth()
    if (activeSession) await refreshAdminCatalog()
  } catch (reason) {
    loginError.value = reason.message || 'Não foi possível validar seu acesso.'
  }
})

onBeforeUnmount(releasePreview)
</script>

<template>
  <div class="admin-overlay" role="main" aria-labelledby="admin-title">
    <header class="admin-header">
      <div class="admin-shell admin-header-inner">
        <button type="button" class="admin-back" @click="emit('close')">
          <ArrowLeft :size="19" aria-hidden="true" />
          Voltar ao site
        </button>
        <div>
          <span>Painel online</span>
          <strong id="admin-title">Catálogo ShowSu</strong>
        </div>
        <UButton
          v-if="session"
          class="admin-signout"
          color="neutral"
          variant="soft"
          :disabled="authLoading"
          @click="handleSignOut"
        >
          <LogOut :size="17" aria-hidden="true" />
          Sair
        </UButton>
      </div>
    </header>

    <main v-if="!isSupabaseConfigured" class="admin-auth-shell">
      <section class="admin-card admin-setup-card">
        <Cloud :size="38" aria-hidden="true" />
        <p class="eyebrow">Configuração necessária</p>
        <h1>Conecte o painel ao Supabase.</h1>
        <p>
          O site continua funcionando com o cardápio original. Para liberar o login e
          as alterações online, configure o projeto Supabase e as variáveis do Netlify.
        </p>
        <UButton class="button button-primary" @click="emit('close')">
          Voltar ao site
        </UButton>
      </section>
    </main>

    <main
      v-else-if="authLoading || (session && catalogLoading)"
      class="admin-auth-shell"
      aria-live="polite"
    >
      <LoaderCircle class="admin-spinner" :size="36" aria-hidden="true" />
      <strong>Carregando painel…</strong>
    </main>

    <main v-else-if="!session" class="admin-auth-shell">
      <section class="admin-card admin-login-card">
        <span class="admin-login-icon">
          <ShieldCheck :size="28" aria-hidden="true" />
        </span>
        <p class="eyebrow">Acesso restrito</p>
        <h1>Entre para editar o cardápio.</h1>
        <p>Use a conta administrativa criada para você ou para sua mãe.</p>

        <p v-if="loginError" class="admin-feedback error" role="alert">
          {{ loginError }}
        </p>

        <form class="admin-login-form" @submit.prevent="handleLogin">
          <label>
            <span>E-mail</span>
            <UInput
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="seu@email.com"
              size="xl"
              required
            />
          </label>
          <label>
            <span>Senha</span>
            <UInput
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="Sua senha"
              size="xl"
              required
            />
          </label>
          <UButton
            class="button button-primary"
            type="submit"
            size="xl"
            :loading="authLoading"
          >
            <LogIn :size="18" aria-hidden="true" />
            Entrar no painel
          </UButton>
        </form>
      </section>
    </main>

    <main v-else-if="catalogFailed || !loaded" class="admin-auth-shell">
      <section class="admin-card admin-setup-card">
        <Cloud :size="38" aria-hidden="true" />
        <p class="eyebrow">Banco ainda não preparado</p>
        <h1>Falta criar as tabelas do catálogo.</h1>
        <p>{{ error }}</p>
        <UButton class="button button-primary" @click="refreshAdminCatalog">
          Tentar novamente
        </UButton>
      </section>
    </main>

    <main v-else class="admin-shell admin-main">
      <section class="admin-intro">
        <div>
          <p class="eyebrow">Sincronizado online</p>
          <h1>Organize o cardápio com facilidade.</h1>
          <p>
            Produtos, categorias e fotos salvos aqui ficam disponíveis para todos os
            visitantes do site.
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
                  <input
                    v-model="categoryName"
                    placeholder="Ex.: Marmitas Fit"
                    :disabled="saving"
                  />
                  <button type="submit" aria-label="Adicionar categoria" :disabled="saving">
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
                  :disabled="saving || categoryUsage[item.id] > 0"
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
            <p>Baixe uma cópia dos produtos e categorias cadastrados online.</p>
            <button type="button" class="admin-secondary-action" @click="downloadBackup">
              <Download :size="17" aria-hidden="true" />
              Exportar backup
            </button>
            <button
              type="button"
              class="admin-secondary-action"
              :disabled="saving"
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
            <button type="button" class="admin-reset" :disabled="saving" @click="handleReset">
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
                <input
                  v-model="name"
                  placeholder="Ex.: Coxinha de frango"
                  :disabled="saving"
                  required
                />
              </label>

              <label>
                <span>Categoria</span>
                <select v-model="category" :disabled="saving" required>
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
                  :disabled="saving"
                  required
                ></textarea>
              </label>

              <label class="image-field form-full">
                <span>Foto do produto</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  :disabled="saving"
                  @change="handleImage"
                />
                <div class="image-drop">
                  <img v-if="image" :src="image" alt="Prévia da foto do produto" />
                  <ImagePlus v-else :size="30" aria-hidden="true" />
                  <span>{{ image ? 'Trocar foto' : 'Escolher uma foto' }}</span>
                  <small>JPG, PNG ou WebP — até 5 MB</small>
                </div>
              </label>

              <label class="featured-check form-full">
                <input v-model="featured" type="checkbox" :disabled="saving" />
                <span>Mostrar selo “Queridinho”</span>
              </label>

              <button
                class="button button-primary form-submit"
                type="submit"
                :disabled="saving"
              >
                <LoaderCircle v-if="saving" class="admin-spinner" :size="18" aria-hidden="true" />
                <Save v-else :size="18" aria-hidden="true" />
                {{ saving ? 'Salvando…' : editingId ? 'Salvar alterações' : 'Publicar produto' }}
              </button>
            </form>
          </section>

          <section class="admin-card">
            <div class="admin-card-heading">
              <div>
                <span class="admin-kicker">Cardápio online</span>
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
                    :disabled="saving"
                    :aria-label="product.active === false ? `Exibir ${product.name}` : `Ocultar ${product.name}`"
                    @click="handleToggleProduct(product.id)"
                  >
                    <EyeOff v-if="product.active !== false" :size="17" aria-hidden="true" />
                    <Eye v-else :size="17" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    :disabled="saving"
                    :aria-label="`Editar ${product.name}`"
                    @click="editProduct(product)"
                  >
                    <Pencil :size="17" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    class="danger"
                    :disabled="saving"
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
</template>
