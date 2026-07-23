<script setup>
import { Check, Plus } from '@lucide/vue'
import { motion, useReducedMotion } from 'motion-v'

const prefersReducedMotion = useReducedMotion()

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
  <motion.article
    class="product-card"
    :class="{ selected }"
    :initial="prefersReducedMotion ? false : { opacity: 0, y: 18 }"
    :whileInView="{ opacity: 1, y: 0 }"
    :whileHover="prefersReducedMotion ? undefined : { y: -4 }"
    :viewport="{ once: true, amount: 0.15 }"
    :transition="{ duration: 0.38, ease: 'easeOut' }"
  >
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
  </motion.article>
</template>
