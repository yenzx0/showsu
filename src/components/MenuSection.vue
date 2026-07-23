<script setup>
import { computed, ref } from 'vue'
import { Search } from '@lucide/vue'
import { categories, products } from '../data/products'
import ProductCard from './ProductCard.vue'

const activeCategory = ref('todos')
const search = ref('')

const filteredProducts = computed(() => {
  const query = search.value.trim().toLocaleLowerCase('pt-BR')

  return products.filter((product) => {
    const matchesCategory =
      activeCategory.value === 'todos' || product.category === activeCategory.value
    const matchesSearch =
      !query ||
      product.name.toLocaleLowerCase('pt-BR').includes(query) ||
      product.description.toLocaleLowerCase('pt-BR').includes(query)

    return matchesCategory && matchesSearch
  })
})
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
            v-for="category in categories"
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

      <div v-if="filteredProducts.length" class="product-grid">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
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
