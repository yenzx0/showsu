<script setup>
import { Check, Plus } from '@lucide/vue'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['toggle'])
</script>

<template>
  <article class="product-card" :class="{ selected }">
    <div class="product-image-wrap">
      <img
        class="product-image"
        :src="product.image"
        :alt="product.imageAlt"
        loading="lazy"
        width="640"
        height="520"
      />
      <span v-if="product.featured" class="product-badge">Queridinho</span>
      <span v-else-if="product.seasonal" class="product-badge">Por temporada</span>
    </div>

    <div class="product-content">
      <h3>{{ product.name }}</h3>
      <p>{{ product.description }}</p>
      <button
        type="button"
        class="product-link"
        :class="{ selected }"
        :aria-pressed="selected"
        :aria-label="selected ? `Remover ${product.name} da lista` : `Adicionar ${product.name} à lista`"
        @click="$emit('toggle', product.id)"
      >
        <Check v-if="selected" :size="18" aria-hidden="true" />
        <Plus v-else :size="18" aria-hidden="true" />
        {{ selected ? 'Na sua lista' : 'Adicionar à lista' }}
      </button>
    </div>
  </article>
</template>
