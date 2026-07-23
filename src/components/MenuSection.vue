<script setup>
import { computed, ref } from 'vue'
import { MessageCircle, Search, ShoppingBag, X } from '@lucide/vue'
import { useCatalog } from '../composables/useCatalog'
import { whatsappUrl } from '../data/site'
import ProductCard from './ProductCard.vue'

const activeCategory = ref('todos')
const search = ref('')
const selectedProductIds = ref([])
const { categories, activeProducts, loadCatalog } = useCatalog()

loadCatalog()

const filterCategories = computed(() => [
  { id: 'todos', label: 'Todos' },
  ...categories.value,
])

const filteredProducts = computed(() => {
  const query = search.value.trim().toLocaleLowerCase('pt-BR')

  return activeProducts.value.filter((product) => {
    const matchesCategory =
      activeCategory.value === 'todos' || product.category === activeCategory.value
    const matchesSearch =
      !query ||
      product.name.toLocaleLowerCase('pt-BR').includes(query) ||
      product.description.toLocaleLowerCase('pt-BR').includes(query)

    return matchesCategory && matchesSearch
  })
})

const selectedProducts = computed(() =>
  activeProducts.value.filter((product) => selectedProductIds.value.includes(product.id)),
)

const orderUrl = computed(() => {
  const productList = selectedProducts.value
    .map((product) => `• ${product.name}`)
    .join('\n')
  const message = `Olá! Gostaria de consultar estes itens da ShowSu:\n\n${productList}\n\nPode me passar disponibilidade e valores?`
  return whatsappUrl(message)
})

const toggleProduct = (id) => {
  selectedProductIds.value = selectedProductIds.value.includes(id)
    ? selectedProductIds.value.filter((productId) => productId !== id)
    : [...selectedProductIds.value, id]
}
</script>

<template>
  <section id="cardapio" class="section menu-section">
    <div class="container">
      <div class="section-heading menu-heading">
        <div>
          <p class="eyebrow">Feito sob encomenda</p>
          <h2>Um cardápio para cada momento</h2>
        </div>
        <p>
          Escolha uma categoria ou pesquise pelo que está procurando. Para valores e
          disponibilidade, fale diretamente com a gente.
        </p>
      </div>

      <div class="menu-tools">
        <div class="category-filters" aria-label="Filtrar por categoria">
          <button
            v-for="category in filterCategories"
            :key="category.id"
            type="button"
            :class="{ active: activeCategory === category.id }"
            :aria-pressed="activeCategory === category.id"
            @click="activeCategory = category.id"
          >
            {{ category.label }}
          </button>
        </div>

        <label class="search-field">
          <Search :size="18" aria-hidden="true" />
          <span class="sr-only">Pesquisar no cardápio</span>
          <input v-model="search" type="search" placeholder="Buscar uma delícia..." />
        </label>
      </div>

      <div v-if="selectedProducts.length" class="selection-bar" role="status">
        <div class="selection-summary">
          <span class="selection-icon">
            <ShoppingBag :size="20" aria-hidden="true" />
          </span>
          <div>
            <strong>
              {{ selectedProducts.length }}
              {{ selectedProducts.length === 1 ? 'item selecionado' : 'itens selecionados' }}
            </strong>
            <span>{{ selectedProducts.map((product) => product.name).join(', ') }}</span>
          </div>
        </div>
        <div class="selection-actions">
          <button
            class="clear-selection"
            type="button"
            aria-label="Limpar lista"
            @click="selectedProductIds = []"
          >
            <X :size="18" aria-hidden="true" />
          </button>
          <a
            class="button button-primary"
            :href="orderUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle :size="18" aria-hidden="true" />
            Enviar lista
          </a>
        </div>
      </div>

      <div v-if="filteredProducts.length" class="product-grid">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
          :selected="selectedProductIds.includes(product.id)"
          @toggle="toggleProduct"
        />
      </div>

      <div v-else class="empty-state" role="status">
        <span>Não encontramos esse item.</span>
        <button type="button" @click="search = ''; activeCategory = 'todos'">
          Limpar filtros
        </button>
      </div>
    </div>
  </section>
</template>
